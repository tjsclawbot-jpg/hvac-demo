#!/bin/bash

# Test script for confirm-booking endpoint
# Usage: ./test-confirm-booking.sh

echo "🧪 Testing confirm-booking endpoint..."

# Simulate a POST request from Twilio
curl -X POST http://localhost:3000/api/voice/confirm-booking \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "CallSid=CA1234567890abcdef1234567890abcdef" \
  -d "SpeechResult=Tuesday at 10 AM" \
  -v

echo ""
echo "✅ Test complete!"
