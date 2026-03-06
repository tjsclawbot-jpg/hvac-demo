import { NextApiRequest, NextApiResponse } from 'next'
import twilio from 'twilio'

const authToken = process.env.TWILIO_AUTH_TOKEN

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // const twilioSignature = req.headers['x-twilio-signature'] as string
  // const url = `${process.env.NEXT_PUBLIC_API_URL}/api/voice/collect-phone`
  
  // if (!twilio.validateRequest(authToken || '', twilioSignature, url, req.body)) {
  //   return res.status(403).send('Unauthorized')
  // }

  if (req.method !== 'POST') {
    return res.status(405).send('Method not allowed')
  }

  try {
    const digits = req.body.Digits
    const callSid = req.body.CallSid

    // Format phone number
    const phoneNumber = `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`
    console.log(`📱 Customer phone: ${phoneNumber}`)

    // Create TwiML response - ask for address
    const twiml = new twilio.twiml.VoiceResponse()

    twiml.say({
      voice: 'alice',
    }, `Perfect! Now I need the address where you need service. Please say your street address, city, and state.`)

    const gather = twiml.gather({
      input: ['speech'] as any,
      action: '/api/voice/collect-address',
      method: 'POST',
      timeout: 5,
      speechTimeout: 'auto',
    })

    gather.say('Please say your address.')

    twiml.redirect('/api/voice/collect-phone')

    res.setHeader('Content-Type', 'application/xml')
    res.status(200).send(twiml.toString())
  } catch (error) {
    console.error('Error in collect-phone:', error)
    
    const twiml = new twilio.twiml.VoiceResponse()
    twiml.say('Sorry, I did not get that. Let me try again.')
    twiml.hangup()
    
    res.setHeader('Content-Type', 'application/xml')
    res.status(200).send(twiml.toString())
  }
}
