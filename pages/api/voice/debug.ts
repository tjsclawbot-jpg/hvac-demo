import { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('=== INCOMING REQUEST ===')
  console.log(`Time: ${new Date().toISOString()}`)
  console.log(`Method: ${req.method}`)
  console.log(`URL: ${req.url}`)
  console.log(`Headers:`, JSON.stringify(req.headers, null, 2))
  console.log(`Body:`, JSON.stringify(req.body, null, 2))
  console.log('=== END REQUEST ===')
  
  res.status(200).json({
    success: true,
    timestamp: new Date().toISOString(),
    message: 'Debug endpoint received request'
  })
}
