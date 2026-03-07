import { NextApiRequest, NextApiResponse } from 'next'
import twilio from 'twilio'
import { updateCallState } from '../../../lib/supabase'

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
    const speechResult = req.body.SpeechResult || ''
    const callSid = req.body.CallSid

    console.log(`📱 Phone speech input: "${speechResult}"`)

    // Extract digits from spoken phone number
    const digits = extractPhoneDigits(speechResult)
    
    if (!digits || digits.length < 10) {
      console.log(`❌ Invalid phone (got ${digits?.length || 0} digits): "${speechResult}"`)
      
      const twiml = new twilio.twiml.VoiceResponse()
      twiml.say({
        voice: 'alice' as any,
      }, 'Sorry, I did not get a valid phone number. Please try again.')
      twiml.pause({ length: 1 })
      twiml.say({
        voice: 'alice' as any,
      }, 'Please say your phone number, like 5 5 5 1 2 3 4.')
      
      const gather = twiml.gather({
        input: ['speech'] as any,
        action: '/api/voice/collect-phone',
        method: 'POST',
        timeout: 5,
        speechTimeout: 'auto',
      })
      
      res.setHeader('Content-Type', 'application/xml')
      res.status(200).send(twiml.toString())
      return
    }

    // Format phone number
    const phoneNumber = `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`
    console.log(`✅ Customer phone: ${phoneNumber}`)

    // Save phone to call state
    const updateResult = await updateCallState(callSid, {
      customer_phone: phoneNumber,
      status: 'phone_collected',
    })
    
    if (!updateResult.success) {
      console.warn(`⚠️ Failed to save customer phone: ${updateResult.error}`)
    } else {
      console.log(`✅ Customer phone saved to call state`)
    }

    // Create TwiML response - ask for address
    const twiml = new twilio.twiml.VoiceResponse()

    twiml.say({
      voice: 'alice' as any,
    }, `Great! I got your number. Now I'll just need the address where you need service to connect you with the right service member. Could you please say your street address, city, and state.`)
    twiml.pause({ length: 1 })

    const gather = twiml.gather({
      input: ['speech'] as any,
      action: '/api/voice/collect-address',
      method: 'POST',
      timeout: 5,
      speechTimeout: 'auto',
    })

    gather.say('Please say your address.')

    res.setHeader('Content-Type', 'application/xml')
    res.status(200).send(twiml.toString())
  } catch (error) {
    console.error('Error in collect-phone:', error)
    
    const twiml = new twilio.twiml.VoiceResponse()
    twiml.say({
      voice: 'alice' as any,
    }, 'Sorry, an error occurred.')
    twiml.hangup()
    
    res.setHeader('Content-Type', 'application/xml')
    res.status(200).send(twiml.toString())
  }
}

function extractPhoneDigits(speech: string): string {
  // Remove all non-digit characters
  const digits = speech.replace(/\D/g, '')
  // Return up to 10 digits (ignore country code if provided)
  return digits.slice(-10)
}
