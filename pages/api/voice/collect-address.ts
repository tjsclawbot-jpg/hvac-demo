import { NextApiRequest, NextApiResponse } from 'next'
import twilio from 'twilio'
import { updateCallState } from '../../../lib/supabase'

const authToken = process.env.TWILIO_AUTH_TOKEN

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // const twilioSignature = req.headers['x-twilio-signature'] as string
  // const url = `${process.env.NEXT_PUBLIC_API_URL}/api/voice/collect-address`
  
  // if (!twilio.validateRequest(authToken || '', twilioSignature, url, req.body)) {
  //   return res.status(403).send('Unauthorized')
  // }

  if (req.method !== 'POST') {
    return res.status(405).send('Method not allowed')
  }

  try {
    const address = req.body.SpeechResult
    const callSid = req.body.CallSid

    console.log(`🏠 Customer address: ${address}`)

    // Validate and save address to call state
    if (!address || address.trim().length === 0) {
      console.warn('⚠️ Empty address provided')
    } else {
      const updateResult = await updateCallState(callSid, {
        service_address: address.trim(),
        status: 'address_collected',
      })
      
      if (!updateResult.success) {
        console.warn(`⚠️ Failed to save address: ${updateResult.error}`)
      } else {
        console.log(`✅ Address saved to call state`)
      }
    }

    // Create TwiML response - ask for appointment timing
    const twiml = new twilio.twiml.VoiceResponse()

    twiml.say({
      voice: 'alice' as any,
    }, `Excellent! Would you like a same-day appointment if available, or would you prefer a specific date? Please say same-day, tomorrow, or a specific date.`)

    const gather = twiml.gather({
      input: ['speech'] as any,
      action: '/api/voice/confirm-booking',
      method: 'POST',
      timeout: 5,
      speechTimeout: 'auto',
    })

    gather.say('Please tell me your preferred appointment time.')

    res.setHeader('Content-Type', 'application/xml')
    res.status(200).send(twiml.toString())
  } catch (error) {
    console.error('Error in collect-address:', error)
    
    const twiml = new twilio.twiml.VoiceResponse()
    twiml.say({
      voice: 'alice' as any,
    }, 'Sorry, I did not understand. Please try again.')
    twiml.hangup()
    
    res.setHeader('Content-Type', 'application/xml')
    res.status(200).send(twiml.toString())
  }
}
