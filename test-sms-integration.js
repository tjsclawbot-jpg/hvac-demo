#!/usr/bin/env node

/**
 * SMS Integration Test Script
 * 
 * Tests the complete Twilio SMS integration for the HVAC booking system.
 * Tests:
 * 1. Customer confirmation SMS after voice booking
 * 2. Contractor assignment SMS
 * 3. Status update SMS (in-progress, completed)
 * 4. SMS logging in Supabase
 * 
 * Usage: node test-sms-integration.js
 */

const https = require('https');
const { createClient } = require('@supabase/supabase-js');

// Configuration
const SUPABASE_URL = 'https://qeoxavbzuxqhbwwlpiss.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_8hwfQTZ1BwkDqO8nu4kxsg_wozt3oaO';
const API_URL = 'http://localhost:3000';

// Test data
const TEST_PHONE = '+15005550006'; // Twilio test number
const CONTRACTOR_PHONE = '+14155552671'; // Test contractor number

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Utility function to make HTTP requests
function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_URL);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data: data || null });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

// Use http instead of https for localhost
function makeLocalRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const http = require('http');
    const url = new URL(path, API_URL);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port || 3000,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data: data || null });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function testCustomerConfirmationSMS() {
  console.log('\n📱 Test 1: Customer Confirmation SMS');
  console.log('=====================================\n');

  try {
    const response = await makeLocalRequest('POST', '/api/sms/send-sms', {
      recipientPhone: TEST_PHONE,
      messageBody: 'Hi John, your AC Repair appointment is confirmed for 2:00 PM. We\'ll see you at 123 Main St, Springfield, IL. Reply STOP to opt out.',
      messageType: 'customer_confirmation',
      bookingId: 'test-booking-001',
    });

    if (response.status === 200 && response.data.success) {
      console.log('✅ SMS sent successfully');
      console.log('   Message SID:', response.data.messageSid);
      return true;
    } else {
      console.log('❌ Failed to send SMS');
      console.log('   Response:', response.data);
      return false;
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

async function testContractorAssignmentSMS() {
  console.log('\n🔧 Test 2: Contractor Assignment SMS');
  console.log('=====================================\n');

  try {
    const response = await makeLocalRequest('POST', '/api/sms/send-sms', {
      recipientPhone: CONTRACTOR_PHONE,
      messageBody: 'New job assigned: AC Repair for John Smith at 123 Main St, Springfield, IL on 2026-03-15 2:00 PM. Customer: (555) 123-4567. Tap to view details: http://localhost:3000/admin/bookings',
      messageType: 'contractor_assignment',
      bookingId: 'test-booking-001',
    });

    if (response.status === 200 && response.data.success) {
      console.log('✅ SMS sent successfully');
      console.log('   Message SID:', response.data.messageSid);
      return true;
    } else {
      console.log('❌ Failed to send SMS');
      console.log('   Response:', response.data);
      return false;
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

async function testStatusUpdateSMS() {
  console.log('\n⚡ Test 3: Status Update SMS (In Progress)');
  console.log('===========================================\n');

  try {
    const response = await makeLocalRequest('POST', '/api/sms/send-sms', {
      recipientPhone: TEST_PHONE,
      messageBody: 'We\'re on our way to 123 Main St, Springfield, IL. We\'ll be there shortly.',
      messageType: 'customer_status_update',
      bookingId: 'test-booking-001',
    });

    if (response.status === 200 && response.data.success) {
      console.log('✅ SMS sent successfully');
      console.log('   Message SID:', response.data.messageSid);
      return true;
    } else {
      console.log('❌ Failed to send SMS');
      console.log('   Response:', response.data);
      return false;
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

async function testCompletionSMS() {
  console.log('\n✅ Test 4: Completion SMS');
  console.log('===========================\n');

  try {
    const response = await makeLocalRequest('POST', '/api/sms/send-sms', {
      recipientPhone: TEST_PHONE,
      messageBody: 'Job completed! John will receive invoice shortly.',
      messageType: 'customer_status_update',
      bookingId: 'test-booking-001',
    });

    if (response.status === 200 && response.data.success) {
      console.log('✅ SMS sent successfully');
      console.log('   Message SID:', response.data.messageSid);
      return true;
    } else {
      console.log('❌ Failed to send SMS');
      console.log('   Response:', response.data);
      return false;
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

async function verifySMSLogging() {
  console.log('\n📋 Test 5: Verify SMS Logging in Supabase');
  console.log('==========================================\n');

  try {
    const { data, error } = await supabase
      .from('sms_logs')
      .select('*')
      .eq('booking_id', 'test-booking-001')
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) {
      console.log('⚠️  Could not verify SMS logs (table may not exist):');
      console.log('   Error:', error.message);
      return false;
    }

    if (data && data.length > 0) {
      console.log('✅ SMS logs found in Supabase');
      console.log(`   Total logs for this booking: ${data.length}`);
      data.forEach((log, index) => {
        console.log(`\n   Log ${index + 1}:`);
        console.log(`   - Recipient: ${log.recipient_phone}`);
        console.log(`   - Type: ${log.message_type}`);
        console.log(`   - Status: ${log.status}`);
        console.log(`   - Sent: ${new Date(log.sent_at).toLocaleString()}`);
      });
      return true;
    } else {
      console.log('⚠️  No SMS logs found (logs may not have been created yet)');
      return false;
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

async function testRateLimiting() {
  console.log('\n⏱️  Test 6: Rate Limiting Check');
  console.log('================================\n');

  try {
    // Send first SMS
    const response1 = await makeLocalRequest('POST', '/api/sms/send-sms', {
      recipientPhone: TEST_PHONE,
      messageBody: 'Test message 1',
      messageType: 'status_update',
      bookingId: 'rate-limit-test-001',
    });

    if (response1.status !== 200 || !response1.data.success) {
      console.log('❌ Failed to send first SMS');
      return false;
    }

    console.log('✅ First SMS sent successfully');

    // Send second SMS immediately (should be rate limited)
    const response2 = await makeLocalRequest('POST', '/api/sms/send-sms', {
      recipientPhone: TEST_PHONE,
      messageBody: 'Test message 2',
      messageType: 'status_update',
      bookingId: 'rate-limit-test-001',
    });

    if (response2.status === 429) {
      console.log('✅ Rate limiting working correctly (429 status received)');
      return true;
    } else if (!response2.data.success) {
      console.log('✅ Second SMS was blocked (rate limit enforced)');
      console.log('   Error:', response2.data.error);
      return true;
    } else {
      console.log('⚠️  Rate limiting may not be working (second SMS was sent)');
      return false;
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

async function main() {
  console.log('\n🚀 HVAC SMS Integration Test Suite');
  console.log('===================================\n');
  console.log('Testing complete Twilio SMS integration for HVAC booking system\n');

  const results = {
    customerConfirmation: false,
    contractorAssignment: false,
    statusUpdate: false,
    completion: false,
    logging: false,
    rateLimiting: false,
  };

  try {
    results.customerConfirmation = await testCustomerConfirmationSMS();
    results.contractorAssignment = await testContractorAssignmentSMS();
    results.statusUpdate = await testStatusUpdateSMS();
    results.completion = await testCompletionSMS();
    results.logging = await verifySMSLogging();
    results.rateLimiting = await testRateLimiting();
  } catch (error) {
    console.error('\n❌ Test suite error:', error.message);
  }

  // Summary
  console.log('\n\n📊 Test Summary');
  console.log('================\n');
  console.log(`Customer Confirmation SMS: ${results.customerConfirmation ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Contractor Assignment SMS: ${results.contractorAssignment ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Status Update SMS: ${results.statusUpdate ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Completion SMS: ${results.completion ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`SMS Logging: ${results.logging ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Rate Limiting: ${results.rateLimiting ? '✅ PASS' : '❌ FAIL'}`);

  const passed = Object.values(results).filter(Boolean).length;
  const total = Object.keys(results).length;
  console.log(`\nTotal: ${passed}/${total} tests passed\n`);

  process.exit(passed === total ? 0 : 1);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
