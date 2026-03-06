import { NextApiRequest, NextApiResponse } from 'next'
import twilio from 'twilio'

const authToken = process.env.TWILIO_AUTH_TOKEN

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Verify Twilio signature
  // const twilioSignature = req.headers['x-twilio-signature'] as string
  // const url = `${process.env.NEXT_PUBLIC_API_URL}/api/voice/collect-name`
  
  // if (!twilio.validateRequest(authToken || '', twilioSignature, url, req.body)) {
  //   return res.status(403).send('Unauthorized')
  // }

  if (req.method !== 'POST') {
    return res.status(405).send('Method not allowed')
  }

  try {
    const customerName = req.body.SpeechResult
    const callSid = req.body.CallSid

    console.log(`👤 Customer name: ${customerName}`)

    // Create TwiML response - ask for phone
    const twiml = new twilio.twiml.VoiceResponse()

    twiml.say({
      voice: 'alice',
    }, `Great, ${customerName}! Now I need your phone number. Please say your 10-digit phone number.`)

    const gather = twiml.gather({
      input: ['speech'] as any,
      action: '/api/voice/collect-phone',
      method: 'POST',
      timeout: 5,
      speechTimeout: 'auto',
    })

    gather.say('Please say your phone number.')

    res.setHeader('Content-Type', 'application/xml')
    res.status(200).send(twiml.toString())
  } catch (error) {
    console.error('Error in collect-name:', error)
    
    const twiml = new twilio.twiml.VoiceResponse()
    twiml.say('Sorry, something went wrong. Please try again.')
    twiml.hangup()
    
    res.setHeader('Content-Type', 'application/xml')
    res.status(200).send(twiml.toString())
  }
}
