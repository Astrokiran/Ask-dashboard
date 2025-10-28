#!/bin/bash

# Usage: bash admin_complete_onboarding.sh [GUIDE_ID] [PRICE_PER_MINUTE] [REVENUE_SHARE]
# Example: bash admin_complete_onboarding.sh 123 150.00 75
# Note: Script will prompt for OTP after generating it

set -e

ADMIN_BASE="https://askapp.astrokiran.com/api/v1/admin"
AREA_CODE="+91"

# Set the admin phone number and user details
ADMIN_PHONE="8142202086"
USER_TYPE="admin"
PURPOSE="login"

# Parse arguments
GUIDE_ID="${1}"
PRICE_PER_MINUTE="${2:-10.00}"
REVENUE_SHARE="${3:-50}"
OTP_CODE=""  # Will be prompted later

# Validate required arguments
if [ -z "$GUIDE_ID" ]; then
  echo "Error: Guide ID is required"
  echo "Usage: bash admin_complete_onboarding.sh [GUIDE_ID] [PRICE_PER_MINUTE] [REVENUE_SHARE]"
  echo "Example: bash admin_complete_onboarding.sh 123 150.00 75"
  echo "Note: Script will prompt for OTP after generating it"
  exit 1
fi

echo "Completing onboarding for Guide ID: $GUIDE_ID"
echo "Price per minute: $PRICE_PER_MINUTE"
echo "Revenue share: $REVENUE_SHARE%"
# 1. Generate OTP for admin
echo "Generating OTP for admin..."
GEN_RESPONSE=$(curl -s -X POST "https://askapp.astrokiran.com/api/v1/auth/otp/generate" \
  -H "Content-Type: application/json" \
  -d "{\"area_code\":\"${AREA_CODE}\",\"phone_number\":\"${ADMIN_PHONE}\",\"user_type\":\"${USER_TYPE}\",\"purpose\":\"${PURPOSE}\"}")

echo "OTP Generate Response: $GEN_RESPONSE"
OTP_REQUEST_ID=$(echo "$GEN_RESPONSE" | jq -r '.otp_request_id')

if [ -z "$OTP_REQUEST_ID" ] || [ "$OTP_REQUEST_ID" == "null" ]; then
  echo "Failed to get OTP request_id"
  exit 1
fi

echo "✅ OTP generated successfully!"
echo "📱 OTP sent to: $AREA_CODE$ADMIN_PHONE"
echo "📋 Request ID: $OTP_REQUEST_ID"

# 2. Prompt for OTP input
echo ""
echo "Please check your phone for the OTP and enter it below:"
echo -n "Enter OTP (6 digits): "
read OTP_CODE

# Validate OTP input
if [ -z "$OTP_CODE" ]; then
  echo "❌ Error: OTP code is required"
  exit 1
fi

# Check if OTP is exactly 6 digits
if [ ${#OTP_CODE} -ne 6 ] || ! [[ "$OTP_CODE" =~ ^[0-9]+$ ]]; then
  echo "❌ Error: OTP must be exactly 6 digits"
  exit 1
fi

echo "✅ OTP entered: $OTP_CODE"
echo "Validating OTP for admin..."
VALIDATE_PAYLOAD=$(cat <<EOF
{
  "area_code": "${AREA_CODE}",
  "phone_number": "${ADMIN_PHONE}",
  "user_type": "${USER_TYPE}",
  "otp_code": "${OTP_CODE}",
  "request_id": "${OTP_REQUEST_ID}",
  "device_info": {
    "device_type": "web",
    "device_name": "Admin Console",
    "platform": "linux",
    "platform_version": "1.0",
    "app_version": "1.0.0"
  }
}
EOF
)

VALIDATE_RESPONSE=$(curl -s -X POST "https://askapp.astrokiran.com/api/v1/auth/otp/validate" \
  -H "Content-Type: application/json" \
  -d "$VALIDATE_PAYLOAD")

echo "OTP Validate Response: $VALIDATE_RESPONSE"
ADMIN_ACCESS_TOKEN=$(echo "$VALIDATE_RESPONSE" | jq -r '.access_token')

if [ -z "$ADMIN_ACCESS_TOKEN" ] || [ "$ADMIN_ACCESS_TOKEN" == "null" ]; then
  echo "Failed to get admin access token"
  exit 1
fi

# 3. Get current guide status before onboarding
echo -e "\n--- Getting current status for Guide $GUIDE_ID ---"
CURRENT_STATUS=$(curl -s -H "Authorization: Bearer $ADMIN_ACCESS_TOKEN" "${ADMIN_BASE}/guides/${GUIDE_ID}/status")
echo "Current Guide Status: $CURRENT_STATUS"

# 4. Complete onboarding
echo -e "\n--- Completing Onboarding for Guide $GUIDE_ID ---"
COMPLETE_ONBOARDING_PAYLOAD="{\"price_per_minute\": \"$PRICE_PER_MINUTE\", \"revenue_share\": $REVENUE_SHARE}"

echo "Sending Payload: $COMPLETE_ONBOARDING_PAYLOAD"
COMPLETE_ONBOARDING_RESP=$(curl -s -X POST "${ADMIN_BASE}/guides/${GUIDE_ID}/complete-onboarding" \
  -H "Authorization: Bearer $ADMIN_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "$COMPLETE_ONBOARDING_PAYLOAD")

echo "Complete Onboarding Response: $COMPLETE_ONBOARDING_RESP"

# 5. Get updated guide status after onboarding
echo -e "\n--- Getting updated status for Guide $GUIDE_ID ---"
UPDATED_STATUS=$(curl -s -H "Authorization: Bearer $ADMIN_ACCESS_TOKEN" "${ADMIN_BASE}/guides/${GUIDE_ID}/status")
echo "Updated Guide Status: $UPDATED_STATUS"

echo -e "\n=== Onboarding completed for Guide $GUIDE_ID ==="