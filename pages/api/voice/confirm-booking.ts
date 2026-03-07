import { NextApiRequest, NextApiResponse } from 'next'
import twilio from 'twilio'
import { getCallState, storeVoiceBooking, updateCallState } from '../../../lib/supabase'

const authToken = process.env.TWILIO_AUTH_TOKEN

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // const twilioSignature = req.headers['x-twilio-signature'] as string
  // const url = `${process.env.NEXT_PUBLIC_API_URL}/api/voice/confirm-booking`
  
  // if (!twilio.validateRequest(authToken || '', twilioSignature, url, req.body)) {
  //   return res.status(403).send('Unauthorized')
  // }

  if (req.method !== 'POST') {
    return res.status(405).send('Method not allowed')
  }

  try {
    const preferredTime = req.body.SpeechResult
    const callSid = req.body.CallSid

    console.log(`⏰ Preferred time: ${preferredTime}`)

    // Retrieve all data from call state
    const stateResult = await getCallState(callSid)
    
    if (!stateResult.success || !stateResult.data) {
      console.error(`❌ Failed to retrieve call state for ${callSid}`)
      // Continue with graceful fallback
    }

    const callState = stateResult.data || {}

    // Validate and compile booking data
    const customerName = callState.customer_name || 'Unknown'
    const customerPhone = callState.customer_phone || 'Unknown'
    const serviceAddress = callState.service_address || 'Unknown'
    const serviceType = callState.service_type || 'Unknown'

    console.log('📋 Voice Booking Data:', {
      customerName,
      customerPhone,
      serviceAddress,
      serviceType,
      preferredTime,
      callSid,
    })

    // Update call state with preferred time
    const timeUpdateResult = await updateCallState(callSid, {
      preferred_time: preferredTime,
      status: 'time_collected',
    })
    
    if (!timeUpdateResult.success) {
      console.warn(`⚠️ Failed to save preferred time: ${timeUpdateResult.error}`)
    }

    // Store complete booking in voice_bookings table
    const bookingResult = await storeVoiceBooking({
      call_sid: callSid,
      service_type: serviceType,
      customer_name: customerName,
      customer_phone: customerPhone,
      service_address: serviceAddress,
      preferred_time: preferredTime,
    })

    if (!bookingResult.success) {
      console.warn('⚠️ Failed to store booking in Supabase, but continuing with confirmation:', bookingResult.error)
    } else {
      console.log('✅ Booking stored in voice_bookings table')

      // Send customer confirmation SMS
      try {
        const smsMessage = `Hi ${customerName}, your ${serviceType} appointment is confirmed for ${preferredTime}. We'll see you at ${serviceAddress}. Reply STOP to opt out.`
        
        const smsResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/sms/send-sms`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              recipientPhone: customerPhone,
              messageBody: smsMessage,
              messageType: 'customer_confirmation',
              bookingId: bookingResult.data?.[0]?.id,
            }),
          }
        )

        const smsResult = await smsResponse.json()
        if (smsResult.success) {
          console.log('✅ Customer confirmation SMS sent')
        } else {
          console.warn('⚠️ Failed to send customer SMS:', smsResult.error)
        }
      } catch (smsError) {
        console.warn('⚠️ Error sending customer SMS:', smsError)
        // Don't break the flow if SMS fails
      }
    }

    // Mark call state as completed
    const completeResult = await updateCallState(callSid, {
      status: 'completed',
    })
    
    if (!completeResult.success) {
      console.warn(`⚠️ Failed to mark call state as completed: ${completeResult.error}`)
    }

    // Create TwiML response - confirmation
    const twiml = new twilio.twiml.VoiceResponse()

    twiml.say({
      voice: 'alice' as any,
    }, `Perfect! I've booked your ${serviceType} appointment for ${preferredTime}. You'll receive a confirmation text at ${customerPhone}. Let me know if there is anything else I can help you with today, otherwise you'll get an appointment notification shortly`)

    const gather = twiml.gather({
      input: ['speech'] as any,
      action: '/api/voice/end-call',
      method: 'POST',
      timeout: 3,
    })

    gather.say('Press any key or say yes to confirm, or no if you need to change something.')

    twiml.hangup()

    res.setHeader('Content-Type', 'application/xml')
    res.status(200).send(twiml.toString())
  } catch (error) {
    console.error('Error in confirm-booking:', error)
    
    const twiml = new twilio.twiml.VoiceResponse()
    twiml.say({
      voice: 'alice' as any,
    }, 'Sorry, I had trouble completing your booking. Our team will call you back shortly.')
    twiml.hangup()
    
    res.setHeader('Content-Type', 'application/xml')
    res.status(200).send(twiml.toString())
  }
}
