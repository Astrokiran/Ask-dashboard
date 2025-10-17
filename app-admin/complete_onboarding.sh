#!/bin/bash

# Script to complete onboarding for guides with custom price_per_minute
# Usage: bash complete_onboarding.sh
# The script will prompt for price_per_minute for each guide

set -e

ADMIN_BASE="https://askapp.astrokiran.com/api/v1/admin"
BASE_URL="https://askapp.astrokiran.com/api/v1"
AREA_CODE="+91"

# Admin credentials
ADMIN_PHONE="8142202086"
USER_TYPE="admin"
PURPOSE="login"
OTP_CODE="123456"

echo "=== Admin Login ==="

# 1. Generate OTP for admin
echo "Generating OTP for admin..."
GEN_RESPONSE=$(curl -s -X POST "${BASE_URL}/auth/otp/generate" \
  -H "Content-Type: application/json" \
  -d "{\"area_code\":\"${AREA_CODE}\",\"phone_number\":\"${ADMIN_PHONE}\",\"user_type\":\"${USER_TYPE}\",\"purpose\":\"${PURPOSE}\"}")

OTP_REQUEST_ID=$(echo "$GEN_RESPONSE" | jq -r '.otp_request_id')

if [ -z "$OTP_REQUEST_ID" ] || [ "$OTP_REQUEST_ID" == "null" ]; then
  echo "Failed to get OTP request_id"
  exit 1
fi

# 2. Validate OTP for admin
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

VALIDATE_RESPONSE=$(curl -s -X POST "${BASE_URL}/auth/otp/validate" \
  -H "Content-Type: application/json" \
  -d "$VALIDATE_PAYLOAD")

ADMIN_ACCESS_TOKEN=$(echo "$VALIDATE_RESPONSE" | jq -r '.access_token')

if [ -z "$ADMIN_ACCESS_TOKEN" ] || [ "$ADMIN_ACCESS_TOKEN" == "null" ]; then
  echo "Failed to get admin access token"
  exit 1
fi

echo -e "✓ Admin authenticated successfully\n"

# 3. Fetch guides ready for onboarding (AGREEMENT_SIGNED status)
echo "=== Fetching Guides Ready for Onboarding ==="
PAGE=1
PAGE_SIZE=100
PENDING_VERIFICATIONS_RESPONSE=$(curl -s -H "Authorization: Bearer $ADMIN_ACCESS_TOKEN" \
  "${ADMIN_BASE}/guides/pending-verifications?page=${PAGE}&page_size=${PAGE_SIZE}")

# Extract guides with AGREEMENT_SIGNED status
GUIDE_DATA=$(echo "$PENDING_VERIFICATIONS_RESPONSE" | jq -r '.data.AGREEMENT_SIGNED[]? | "\(.id)|\(.full_name)|\(.phone_number)"')

if [ -z "$GUIDE_DATA" ]; then
  echo "No guides found with AGREEMENT_SIGNED status (ready for onboarding)"
  exit 0
fi

echo -e "\n=== Guides Ready for Onboarding ==="
echo "$GUIDE_DATA" | while IFS='|' read -r gid gname gphone; do
  echo "  ID: $gid | Name: $gname | Phone: $gphone"
done
echo "=========================================="

# 4. Process each guide
REVENUE_SHARE=50
PRICE_PER_MINUTE="1"

while IFS='|' read -r GUIDE_ID GUIDE_NAME GUIDE_PHONE; do
  echo -e "\n=========================================="
  echo "Guide: $GUIDE_NAME"
  echo "ID: $GUIDE_ID | Phone: $GUIDE_PHONE"
  echo "=========================================="

  # Fetch current status
  echo "Fetching current status..."
  GUIDE_STATUS=$(curl -s -H "Authorization: Bearer $ADMIN_ACCESS_TOKEN" \
    "${ADMIN_BASE}/guides/${GUIDE_ID}/status")
  echo "Current Status: $GUIDE_STATUS"

  echo -e "\nCompleting onboarding with:"
  echo "  Price per minute: $PRICE_PER_MINUTE"
  echo "  Revenue share: $REVENUE_SHARE%"

  # Complete onboarding
  COMPLETE_ONBOARDING_PAYLOAD="{\"price_per_minute\": \"$PRICE_PER_MINUTE\", \"revenue_share\": $REVENUE_SHARE}"

  echo -e "\nSending request..."
  COMPLETE_ONBOARDING_RESP=$(curl -s -X POST "${ADMIN_BASE}/guides/${GUIDE_ID}/complete-onboarding" \
    -H "Authorization: Bearer $ADMIN_ACCESS_TOKEN" \
    -H "Content-Type: application/json" \
    -d "$COMPLETE_ONBOARDING_PAYLOAD")

  echo "Complete Onboarding Response: $COMPLETE_ONBOARDING_RESP"

  # Check updated status
  echo -e "\nChecking updated status..."
  UPDATED_STATUS=$(curl -s -H "Authorization: Bearer $ADMIN_ACCESS_TOKEN" \
    "${ADMIN_BASE}/guides/${GUIDE_ID}/status")
  echo "Updated Status: $UPDATED_STATUS"

  echo -e "\n✓ Onboarding completed for $GUIDE_NAME (ID: $GUIDE_ID)"

done <<< "$GUIDE_DATA"

echo -e "\n=========================================="
echo "All guides onboarded successfully!"
echo "=========================================="
