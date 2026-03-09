import { NextApiRequest, NextApiResponse } from 'next'
import twilio from 'twilio'
import { supabase } from '../../../lib/supabase'

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

    // Optional: Clean up call_state entry (mark as completed)
    // We keep the entry for audit/logging purposes but could optionally delete it
    const { error: deleteError } = await supabase
      .from('call_state')
      .delete()
      .eq('call_sid', callSid)
      .eq('status', 'completed')

    if (deleteError) {
      console.warn(`⚠️ Failed to clean up call state: ${deleteError.message}`)
    } else {
      console.log(`✅ Call state cleaned up for ${callSid}`)
    }

    const twiml = new twilio.twiml.VoiceResponse()
    twiml.say({
      
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
