import { NextApiRequest, NextApiResponse } from 'next'
import { initializeCallState } from '../../../lib/supabase'

const twilio = require('twilio')

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const timestamp = new Date().toISOString()
  console.log(`\n🔥 [${timestamp}] ===== INCOMING CALL =====`)
  console.log(`Method: ${req.method}`)
  console.log(`URL: ${req.url}`)
  console.log(`Headers:`, {
    'content-type': req.headers['content-type'],
    'user-agent': req.headers['user-agent'],
  })
  console.log(`Body:`, req.body)
  
  const callSid = req.body?.CallSid || 'unknown'
  console.log(`📞 Call SID: ${callSid}`)

  // Handle GET requests (Twilio validation or testing)
  if (req.method === 'GET') {
    console.log(`[${timestamp}] GET request detected - returning test TwiML`)
    try {
      const VoiceResponse = twilio.twiml.VoiceResponse
      const response = new VoiceResponse()
      response.say('Hello, this is a test')
      res.status(200)
      res.setHeader('Content-Type', 'application/xml')
      res.send(response.toString())
      return
    } catch (e) {
      console.error(`[${timestamp}] GET error:`, e)
      res.status(500).send(`Error: ${e}`)
      return
    }
  }
  
  try {
    // Initialize call state in database
    console.log(`[${timestamp}] Initializing call state for ${callSid}`)
    const stateResult = await initializeCallState(callSid)
    if (!stateResult.success) {
      console.warn(`⚠️ Failed to initialize call state: ${stateResult.error}`)
    } else {
      console.log(`✅ Call state initialized`)
    }

    console.log(`[${timestamp}] Creating VoiceResponse object`)
    const VoiceResponse = twilio.twiml.VoiceResponse
    const response = new VoiceResponse()
    
    console.log(`[${timestamp}] Adding say verb`)
    response.say({
      voice: 'alice' as any,
    }, 'Hi, thanks for calling ProFlow DMV. Are you calling about heating, AC, or an emergency service?')
    response.pause({ length: 1 })
    
    console.log(`[${timestamp}] Adding gather verb`)
    response.gather({
      input: ['speech'],
      action: 'https://hvac-demo-drab.vercel.app/api/voice/handle-speech',
      method: 'POST',
      timeout: 5,
      speechTimeout: 2,
    } as any)
    
    const xml = response.toString()
    console.log(`[${timestamp}] Generated TwiML (length: ${xml.length})`)
    console.log(`[${timestamp}] TwiML:\n${xml}`)
    
    res.status(200)
    res.setHeader('Content-Type', 'application/xml')
    res.send(xml)
    console.log(`[${timestamp}] ✅ Response sent successfully`)
  } catch (e) {
    console.error(`[${timestamp}] ❌ EXCEPTION:`, e)
    console.error(`Stack:`, e instanceof Error ? e.stack : 'No stack trace')
    res.status(500)
    res.setHeader('Content-Type', 'text/plain')
    res.send(`Error: ${e instanceof Error ? e.message : String(e)}`)
  }
}
