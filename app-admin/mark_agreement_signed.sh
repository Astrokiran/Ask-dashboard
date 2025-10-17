#!/bin/bash

# Script to mark agreement as signed for guides
# Usage: bash mark_agreement_signed.sh [GUIDE_ID1] [GUIDE_ID2] ...
# Example: bash mark_agreement_signed.sh 45 46 47

set -e

ADMIN_BASE="https://askapp.astrokiran.com/api/v1/admin"
BASE_URL="https://askapp.astrokiran.com/api/v1"
AREA_CODE="+91"

# Admin credentials
ADMIN_PHONE="8851850842"
USER_TYPE="admin"
PURPOSE="login"
OTP_CODE="123456"

# Check if guide IDs are provided
if [ $# -eq 0 ]; then
  echo "Error: Please provide at least one guide ID"
  echo "Usage: bash mark_agreement_signed.sh [GUIDE_ID1] [GUIDE_ID2] ..."
  exit 1
fi

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

# 3. Mark agreement as signed for each guide
for GUIDE_ID in "$@"; do
  echo "=========================================="
  echo "Processing Guide ID: $GUIDE_ID"
  echo "=========================================="

  # Fetch guide status
  echo "Fetching guide status..."
  GUIDE_STATUS=$(curl -s -H "Authorization: Bearer $ADMIN_ACCESS_TOKEN" \
    "${ADMIN_BASE}/guides/${GUIDE_ID}/status")
  echo "Current Status: $GUIDE_STATUS"

  # Mark Agreement as Signed
  echo -e "\nMarking Agreement as Signed..."
  MARK_SIGNED_RESP=$(curl -s -X POST "${ADMIN_BASE}/guides/${GUIDE_ID}/mark-agreement-signed" \
    -H "Authorization: Bearer $ADMIN_ACCESS_TOKEN")
  echo "Mark Agreement Signed Response: $MARK_SIGNED_RESP"

  # Check updated status
  echo -e "\nChecking updated status..."
  UPDATED_STATUS=$(curl -s -H "Authorization: Bearer $ADMIN_ACCESS_TOKEN" \
    "${ADMIN_BASE}/guides/${GUIDE_ID}/status")
  echo "Updated Status: $UPDATED_STATUS"

  echo -e "\n✓ Agreement marked as signed for Guide ID: $GUIDE_ID\n"
done

echo "=========================================="
echo "All agreements marked as signed!"
echo "=========================================="
