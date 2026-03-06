import { NextApiRequest, NextApiResponse } from 'next'

const twilio = require('twilio')

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log(`[${new Date().toISOString()}] Speech input received`)
  
  try {
    const speechResult = req.body.SpeechResult
    console.log(`Speech detected: "${speechResult}"`)

    const VoiceResponse = twilio.twiml.VoiceResponse
    const response = new VoiceResponse()

    // Detect service type
    const serviceType = detectServiceType(speechResult)

    if (serviceType) {
      // Confirm service and ask for name
      response.say({
        voice: 'alice',
        rate: '1.2',
        pitch: '1.3',
      }, `Great! I found our ${serviceType} here. Now if you could please give me your name`)
      
      response.gather({
        input: ['speech'],
        action: 'https://hvac-demo-drab.vercel.app/api/voice/collect-name',
        method: 'POST',
        timeout: 5,
        speechTimeout: 2,
      })
    } else {
      // Service not recognized, ask again
      response.say('Sorry, I did not understand.')
      response.pause({ length: 1 })
      response.say('Please say what service you need.')
      
      response.gather({
        input: ['speech'],
        action: 'https://hvac-demo-drab.vercel.app/api/voice/handle-speech',
        method: 'POST',
        timeout: 5,
        speechTimeout: 2,
      })
    }

    res.status(200)
    res.setHeader('Content-Type', 'application/xml')
    res.send(response.toString())
  } catch (e) {
    console.error(`[${new Date().toISOString()}] ERROR in handle-speech:`, e)
    
    const VoiceResponse = twilio.twiml.VoiceResponse
    const response = new VoiceResponse()
    response.say('Sorry, an error occurred.')
    response.hangup()
    
    res.status(200)
    res.setHeader('Content-Type', 'application/xml')
    res.send(response.toString())
  }
}

function detectServiceType(speech: string): string | null {
  const lower = speech.toLowerCase()
  
  if (lower.includes('ac') || lower.includes('air')) return 'AC repair'
  if (lower.includes('heat') || lower.includes('furnace')) return 'Heating'
  if (lower.includes('plumb') || lower.includes('water')) return 'Plumbing'
  if (lower.includes('emergency') || lower.includes('urgent')) return 'Emergency'
  if (lower.includes('maintain') || lower.includes('service')) return 'Maintenance'
  
  return null
}
