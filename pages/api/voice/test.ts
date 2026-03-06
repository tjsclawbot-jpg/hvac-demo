import { NextApiRequest, NextApiResponse } from 'next'
import twilio from 'twilio'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const twiml = new twilio.twiml.VoiceResponse()
    twiml.say('Test message. This is a test.')
    
    res.setHeader('Content-Type', 'application/xml')
    res.send(twiml.toString())
  } catch (e) {
    res.status(500).json({ error: String(e) })
  }
}
