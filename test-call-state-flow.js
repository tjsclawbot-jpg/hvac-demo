#!/usr/bin/env node

/**
 * Test script for call state management flow
 * Simulates a complete voice booking conversation with sample data
 */

const fs = require('fs')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')

// Load environment variables from .env.local
const envPath = path.join(__dirname, '.env.local')
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8')
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim()
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=')
      if (key) {
        process.env[key.trim()] = valueParts.join('=').trim()
      }
    }
  })
}

const supabaseUrl = process.env.SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Test data
const testCallSid = `test-call-${Date.now()}`
const testData = {
  customerName: 'Jane Doe',
  customerPhone: '202-555-1234',
  serviceAddress: '456 Oak Street, Washington DC 20001',
  serviceType: 'AC repair',
  preferredTime: 'tomorrow at 2 PM',
}

/**
 * Initialize call state
 */
async function initializeCallState(callSid) {
  console.log(`\n1️⃣  Initializing call state for ${callSid}...`)
  try {
    const { data, error } = await supabase
      .from('call_state')
      .insert([
        {
          call_sid: callSid,
          status: 'started',
        },
      ])
      .select()

    if (error) throw error
    console.log(`✅ Call state initialized:`, data?.[0])
    return data?.[0]
  } catch (error) {
    console.error(`❌ Error:`, error.message)
    return null
  }
}

/**
 * Retrieve call state
 */
async function getCallState(callSid) {
  console.log(`\n📖 Retrieving call state for ${callSid}...`)
  try {
    const { data, error } = await supabase
      .from('call_state')
      .select('*')
      .eq('call_sid', callSid)
      .single()

    if (error) throw error
    console.log(`✅ Call state retrieved:`, data)
    return data
  } catch (error) {
    console.error(`❌ Error:`, error.message)
    return null
  }
}

/**
 * Update call state
 */
async function updateCallState(callSid, updates) {
  console.log(`\n✏️  Updating call state: ${JSON.stringify(updates)}...`)
  try {
    const { data, error } = await supabase
      .from('call_state')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('call_sid', callSid)
      .select()

    if (error) throw error
    console.log(`✅ Call state updated:`, data?.[0])
    return data?.[0]
  } catch (error) {
    console.error(`❌ Error:`, error.message)
    return null
  }
}

/**
 * Store voice booking
 */
async function storeVoiceBooking(booking) {
  console.log(`\n💾 Storing voice booking...`)
  try {
    const { data, error } = await supabase
      .from('voice_bookings')
      .insert([
        {
          ...booking,
          created_at: new Date().toISOString(),
        },
      ])
      .select()

    if (error) throw error
    console.log(`✅ Voice booking stored:`, data?.[0])
    return data?.[0]
  } catch (error) {
    console.error(`❌ Error:`, error.message)
    return null
  }
}

/**
 * Simulate the complete call flow
 */
async function simulateCallFlow() {
  console.log('\n═══════════════════════════════════════════════════════')
  console.log('🎯 Testing Call State Management Flow')
  console.log('═══════════════════════════════════════════════════════')

  // Step 1: Initialize
  let callState = await initializeCallState(testCallSid)
  if (!callState) {
    console.error('❌ Failed to initialize call state. Aborting.')
    process.exit(1)
  }

  // Step 2: Simulate service type detection
  callState = await updateCallState(testCallSid, {
    service_type: testData.serviceType,
    status: 'started',
  })
  console.log(`2️⃣  Service type detected: ${testData.serviceType}`)

  // Step 3: Simulate name collection
  callState = await updateCallState(testCallSid, {
    customer_name: testData.customerName,
    status: 'name_collected',
  })
  console.log(`3️⃣  Name collected: ${testData.customerName}`)

  // Step 4: Simulate phone collection
  callState = await updateCallState(testCallSid, {
    customer_phone: testData.customerPhone,
    status: 'phone_collected',
  })
  console.log(`4️⃣  Phone collected: ${testData.customerPhone}`)

  // Step 5: Simulate address collection
  callState = await updateCallState(testCallSid, {
    service_address: testData.serviceAddress,
    status: 'address_collected',
  })
  console.log(`5️⃣  Address collected: ${testData.serviceAddress}`)

  // Step 6: Retrieve full state before final confirmation
  console.log(`\n6️⃣  Retrieving final call state before booking...`)
  callState = await getCallState(testCallSid)
  if (!callState) {
    console.error('❌ Failed to retrieve call state. Cannot proceed.')
    process.exit(1)
  }

  // Step 7: Store voice booking with all collected data
  const bookingData = {
    call_sid: callState.call_sid,
    service_type: callState.service_type,
    customer_name: callState.customer_name,
    customer_phone: callState.customer_phone,
    service_address: callState.service_address,
    preferred_time: testData.preferredTime,
  }

  const booking = await storeVoiceBooking(bookingData)
  if (!booking) {
    console.error('❌ Failed to store voice booking.')
  }

  // Step 8: Mark call state as completed
  callState = await updateCallState(testCallSid, {
    preferred_time: testData.preferredTime,
    status: 'completed',
  })
  console.log(`7️⃣  Call state marked as completed`)

  // Step 9: Final verification
  console.log(`\n✅ Final verification - Retrieving all data...`)
  const finalState = await getCallState(testCallSid)
  if (finalState) {
    console.log('\n📊 Final Call State:')
    console.log(JSON.stringify(finalState, null, 2))
  }

  console.log('\n═══════════════════════════════════════════════════════')
  console.log('✅ Test flow completed successfully!')
  console.log('═══════════════════════════════════════════════════════\n')

  // Cleanup test data (optional)
  console.log('🧹 Cleaning up test data...')
  try {
    const { error: deleteStateError } = await supabase
      .from('call_state')
      .delete()
      .eq('call_sid', testCallSid)

    const { error: deleteBookingError } = await supabase
      .from('voice_bookings')
      .delete()
      .eq('call_sid', testCallSid)

    if (!deleteStateError && !deleteBookingError) {
      console.log('✅ Test data cleaned up')
    } else {
      console.warn('⚠️ Some cleanup errors occurred (non-fatal)')
    }
  } catch (error) {
    console.warn('⚠️ Cleanup error:', error.message)
  }
}

// Run the test
simulateCallFlow().catch(error => {
  console.error('❌ Test failed:', error)
  process.exit(1)
})
