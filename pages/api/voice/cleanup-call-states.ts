import { NextApiRequest, NextApiResponse } from 'next'
import { cleanupOldCallStates } from '../../../lib/supabase'

/**
 * Cleanup endpoint for removing old call_state entries
 * Should be called periodically (e.g., via cron job) to maintain database hygiene
 * 
 * Usage: Call this endpoint with a cron job service like Vercel Cron or AWS Lambda
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Verify authorization token (optional security measure)
  const authToken = req.headers['x-cleanup-token'] || req.query.token
  const expectedToken = process.env.CLEANUP_TOKEN

  if (expectedToken && authToken !== expectedToken) {
    console.warn('⚠️ Unauthorized cleanup attempt')
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    console.log('🧹 Starting call state cleanup...')
    const result = await cleanupOldCallStates()

    if (!result.success) {
      console.error(`❌ Cleanup failed: ${result.error}`)
      return res.status(500).json({
        success: false,
        error: result.error,
        deleted: 0,
      })
    }

    console.log(`✅ Cleanup completed. Deleted ${result.deleted} old call state entries`)
    return res.status(200).json({
      success: true,
      message: `Cleaned up ${result.deleted} old call state entries`,
      deleted: result.deleted,
    })
  } catch (error) {
    console.error('Error during cleanup:', error)
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      deleted: 0,
    })
  }
}
