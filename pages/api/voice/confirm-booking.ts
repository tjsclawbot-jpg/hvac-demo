import { NextApiRequest, NextApiResponse } from 'next'
import twilio from 'twilio'
import { storeVoiceBooking, VoiceBooking as SupabaseVoiceBooking } from '../../../lib/supabase'

const authToken = process.env.TWILIO_AUTH_TOKEN

interface VoiceBooking {
  customerName: string
  customerPhone: string
  serviceAddress: string
  serviceType: string
  preferredTime: string
  callSid: string
  timestamp: string
}

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

    // TODO: Extract data from conversation state (for now using mocked data)
    // In production, we'd store conversation state in Redis or database
    
    const voiceBooking: VoiceBooking = {
      customerName: 'John Smith', // TODO: Extract from conversation
      customerPhone: '555-1234567', // TODO: Extract from conversation
      serviceAddress: '123 Main St, Washington DC', // TODO: Extract from conversation
      serviceType: 'AC repair', // TODO: Extract from conversation
      preferredTime: preferredTime,
      callSid: callSid,
      timestamp: new Date().toISOString(),
    }

    console.log('📋 Voice Booking Created:', voiceBooking)

    // Store booking in Supabase (graceful failure - continues even if DB fails)
    const dbResult = await storeVoiceBooking({
      call_sid: voiceBooking.callSid,
      service_type: voiceBooking.serviceType,
      customer_name: voiceBooking.customerName,
      customer_phone: voiceBooking.customerPhone,
      service_address: voiceBooking.serviceAddress,
      preferred_time: voiceBooking.preferredTime,
    })

    if (!dbResult.success) {
      console.warn('⚠️ Failed to store booking in Supabase, but continuing with confirmation:', dbResult.error)
    }

    // Create TwiML response - confirmation
    const twiml = new twilio.twiml.VoiceResponse()

    twiml.say({
      voice: 'alice',
      rate: '1.2',
      pitch: '1.3',
    }, `Perfect! I've booked your ${voiceBooking.serviceType} appointment for ${voiceBooking.preferredTime}. You'll receive a confirmation text at ${voiceBooking.customerPhone}. Let me know if there is anything else I can help you with today, otherwise you'll get an appointment notification shortly`)

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
      voice: 'alice',
      rate: '1.2',
      pitch: '1.3',
    }, 'Sorry, I had trouble completing your booking. Our team will call you back shortly.')
    twiml.hangup()
    
    res.setHeader('Content-Type', 'application/xml')
    res.status(200).send(twiml.toString())
  }
}
