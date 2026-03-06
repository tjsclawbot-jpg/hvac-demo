import { NextApiRequest, NextApiResponse } from 'next'
import twilio from 'twilio'

const authToken = process.env.TWILIO_AUTH_TOKEN

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // const twilioSignature = req.headers['x-twilio-signature'] as string
  // const url = `${process.env.NEXT_PUBLIC_API_URL}/api/voice/end-call`
  
  // if (!twilio.validateRequest(authToken || '', twilioSignature, url, req.body)) {
  //   return res.status(403).send('Unauthorized')
  // }

  if (req.method !== 'POST') {
    return res.status(405).send('Method not allowed')
  }

  try {
    const callSid = req.body.CallSid
    console.log(`📞 Call ended: ${callSid}`)

    const twiml = new twilio.twiml.VoiceResponse()
    twiml.say({
      voice: 'alice',
      rate: '1.2',
      pitch: '1.3',
    }, 'Thank you for calling. Goodbye!')
    twiml.hangup()

    res.setHeader('Content-Type', 'application/xml')
    res.status(200).send(twiml.toString())
  } catch (error) {
    console.error('Error in end-call:', error)
    
    const twiml = new twilio.twiml.VoiceResponse()
    twiml.hangup()
    
    res.setHeader('Content-Type', 'application/xml')
    res.status(200).send(twiml.toString())
  }
}
