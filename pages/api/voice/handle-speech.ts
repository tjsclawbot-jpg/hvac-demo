import { NextApiRequest, NextApiResponse } from 'next'
import { updateCallState } from '../../../lib/supabase'

const twilio = require('twilio')

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const timestamp = new Date().toISOString()
  console.log(`[${timestamp}] Speech input received`)
  
  const callSid = req.body.CallSid
  const speechResult = req.body.SpeechResult
  
  try {
    console.log(`Speech detected: "${speechResult}"`)

    const VoiceResponse = twilio.twiml.VoiceResponse
    const response = new VoiceResponse()

    // Detect service type
    const serviceType = detectServiceType(speechResult)

    if (serviceType) {
      // Update call state with service type
      console.log(`🔧 Service type detected: ${serviceType}`)
      const updateResult = await updateCallState(callSid, {
        service_type: serviceType,
        status: 'started',
      })
      
      if (!updateResult.success) {
        console.warn(`⚠️ Failed to update call state: ${updateResult.error}`)
      }

      // Confirm service and ask for name
      response.say({
        voice: 'alice' as any,
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
      response.say({
        voice: 'alice' as any,
      }, 'Sorry, I did not get that, could you say your service type again?')
      response.pause({ length: 1 })
      response.say({
        voice: 'alice' as any,
      }, 'I apologize, please say again what service you need. You can say heating, AC, plumbing, or emergency.')
      
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
    console.error(`[${timestamp}] ERROR in handle-speech:`, e)
    
    const VoiceResponse = twilio.twiml.VoiceResponse
    const response = new VoiceResponse()
    response.say({
      voice: 'alice' as any,
    }, 'Sorry, an error occurred.')
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
