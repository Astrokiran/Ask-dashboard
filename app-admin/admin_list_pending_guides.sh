#!/bin/bash

# Usage: bash scripts/admin_list_pending_guides.sh [ADMIN_PHONE] [OTP_CODE]
# Example: bash scripts/admin_list_pending_guides.sh 9000000000 123456

set -e

ADMIN_BASE="https://askapp.astrokiran.com/api/v1/admin"
AREA_CODE="+91"

# Set the admin phone number and user details
ADMIN_PHONE="8851850842"
USER_TYPE="admin"
PURPOSE="login"
# The OTP code is now the first argument, defaulting to 123456
OTP_CODE="${1:-123456}"

# 1. Generate OTP for admin
echo "Generating OTP for admin..."
GEN_RESPONSE=$(curl -s -X POST "https://askapp.astrokiran.com/api/v1otp/generate" \
  -H "Content-Type: application/json" \
  -d "{\"area_code\":\"${AREA_CODE}\",\"phone_number\":\"${ADMIN_PHONE}\",\"user_type\":\"${USER_TYPE}\",\"purpose\":\"${PURPOSE}\"}")

echo "OTP Generate Response: $GEN_RESPONSE"
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

VALIDATE_RESPONSE=$(curl -s -X POST "https://askapp.astrokiran.com/api/v1otp/validate" \
  -H "Content-Type: application/json" \
  -d "$VALIDATE_PAYLOAD")

echo "OTP Validate Response: $VALIDATE_RESPONSE"
ADMIN_ACCESS_TOKEN=$(echo "$VALIDATE_RESPONSE" | jq -r '.access_token')

if [ -z "$ADMIN_ACCESS_TOKEN" ] || [ "$ADMIN_ACCESS_TOKEN" == "null" ]; then
  echo "Failed to get admin access token"
  exit 1
fi

# 3. Fetch pending verifications
PAGE=1
PAGE_SIZE=100
echo -e "\n--- Listing Pending Verifications (KYC_UPLOADED) ---"
PENDING_VERIFICATIONS_RESPONSE=$(curl -s -H "Authorization: Bearer $ADMIN_ACCESS_TOKEN" \
  "${ADMIN_BASE}/guides/pending-verifications?page=${PAGE}&page_size=${PAGE_SIZE}")
echo "Pending Verifications API Response: $PENDING_VERIFICATIONS_RESPONSE"

# 4. Extract and display guide IDs
GUIDE_IDS=$(echo "$PENDING_VERIFICATIONS_RESPONSE" | jq -r '.data.KYC_UPLOADED[].id')

if [ -z "$GUIDE_IDS" ]; then
  echo "No kyc_uploaded guides found to verify."
  exit 0
fi

echo -e "\n=== Pending Verification Guide IDs ==="
echo "$GUIDE_IDS"
echo -e "\nTotal guides pending verification: $(echo "$GUIDE_IDS" | wc -l)"