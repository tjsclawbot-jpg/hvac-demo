import { NextApiRequest, NextApiResponse } from 'next'
import twilio from 'twilio'
import { updateCallState } from '../../../lib/supabase'

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

    // Validate and save customer name to call state
    if (!customerName || customerName.trim().length === 0) {
      console.warn('⚠️ Empty customer name provided')
    } else {
      const updateResult = await updateCallState(callSid, {
        customer_name: customerName.trim(),
        status: 'name_collected',
      })
      
      if (!updateResult.success) {
        console.warn(`⚠️ Failed to save customer name: ${updateResult.error}`)
      } else {
        console.log(`✅ Customer name saved to call state`)
      }
    }

    // Create TwiML response - ask for phone
    const twiml = new twilio.twiml.VoiceResponse()

    twiml.say({
      engine: 'polly' as any, voiceId: 'Joey' as any, lang: 'en-US'
    }, `Great, ${customerName}! Now I just need to collect your phone number. Please type or say your 10-digit phone number.`)

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
    twiml.say({
      engine: 'polly' as any, voiceId: 'Joey' as any, lang: 'en-US'
    }, 'Sorry, something went wrong. Please try again.')
    twiml.hangup()
    
    res.setHeader('Content-Type', 'application/xml')
    res.status(200).send(twiml.toString())
  }
}
