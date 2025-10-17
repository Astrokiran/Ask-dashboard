#!/bin/bash

# Usage: bash scripts/admin_onboard_specific_guides.sh [OTP_CODE] [GUIDE_ID_1] [GUIDE_ID_2] ...
# Example: bash scripts/admin_onboard_specific_guides.sh 123456 guid_abc123 guid_def456
#
# This script takes a list of guide IDs as arguments and calls the
# 'complete-onboarding' endpoint for each one to mark them as active.

set -e

# --- Argument Handling ---
if [ "$#" -lt 2 ]; then
    echo "❌ Error: Invalid number of arguments."
    echo "Usage: $0 [OTP_CODE] [GUIDE_ID_1] [GUIDE_ID_2] ..."
    echo "Example: $0 123456 guid_abc123 guid_def456"
    exit 1
fi

OTP_CODE="$1"
# Get all command-line arguments from the second one onwards
GUIDE_IDS=("${@:2}")

# --- Configuration ---
ADMIN_BASE="https://devazstg.astrokiran.com/auth/api/v1/admin"
AUTH_BASE="https://devazstg.astrokiran.com/auth/api/v1/auth"
AREA_CODE="+91"
ADMIN_PHONE="8851850842"  # Admin phone number

# --- Admin Authentication ---
echo "🔐 Logging in as admin: ${ADMIN_PHONE}"

# 1. Generate OTP for admin
echo "Requesting OTP..."
GEN_RESPONSE=$(curl -s -X POST "${AUTH_BASE}/otp/generate" \
  -H "Content-Type: application/json" \
  -d "{\"area_code\":\"${AREA_CODE}\",\"phone_number\":\"${ADMIN_PHONE}\",\"user_type\":\"admin\",\"purpose\":\"login\"}")

OTP_REQUEST_ID=$(echo "$GEN_RESPONSE" | jq -r '.otp_request_id')

if [ -z "$OTP_REQUEST_ID" ] || [ "$OTP_REQUEST_ID" == "null" ]; then
  echo "❌ Error: Failed to get OTP request_id. Response: $GEN_RESPONSE"
  exit 1
fi

# 2. Validate OTP to get access token
echo "Validating OTP: ${OTP_CODE}"
VALIDATE_PAYLOAD=$(cat <<EOF
{
  "area_code": "${AREA_CODE}",
  "phone_number": "${ADMIN_PHONE}",
  "user_type": "admin",
  "otp_code": "${OTP_CODE}",
  "request_id": "${OTP_REQUEST_ID}",
  "device_info": {
    "device_type": "web",
    "device_name": "Admin Script",
    "platform": "bash",
    "platform_version": "5.0",
    "app_version": "1.0.0"
  }
}
EOF
)

VALIDATE_RESPONSE=$(curl -s -X POST "${AUTH_BASE}/otp/validate" \
  -H "Content-Type: application/json" \
  -d "$VALIDATE_PAYLOAD")

ADMIN_ACCESS_TOKEN=$(echo "$VALIDATE_RESPONSE" | jq -r '.access_token')

if [ -z "$ADMIN_ACCESS_TOKEN" ] || [ "$ADMIN_ACCESS_TOKEN" == "null" ]; then
  echo "❌ Error: Failed to get admin access token. Response: $VALIDATE_RESPONSE"
  exit 1
fi
echo "✅ Successfully authenticated as admin."

# --- Process Provided Guides ---

echo -e "\nWill process the following ${#GUIDE_IDS[@]} guide(s):"
for id in "${GUIDE_IDS[@]}"; do
    echo "  - $id"
done

# Define the payload for completing onboarding (used for all guides)
BASE_RATE_PER_MINUTE="2"
REVENUE_SHARE=50
COMPLETE_ONBOARDING_PAYLOAD=$(cat <<EOF
{
  "price_per_minute": "${BASE_RATE_PER_MINUTE}",
  "revenue_share": ${REVENUE_SHARE}
}
EOF
)

# Loop through the provided guide IDs and call the endpoint
for GUIDE_ID in "${GUIDE_IDS[@]}"; do
  echo -e "\n🚀 Processing Guide ID: $GUIDE_ID"
  
  COMPLETE_ONBOARDING_RESP=$(curl -s -w "\nHTTP_STATUS:%{http_code}\n" -X POST "${ADMIN_BASE}/guides/${GUIDE_ID}/complete-onboarding" \
    -H "Authorization: Bearer $ADMIN_ACCESS_TOKEN" \
    -H "Content-Type: application/json" \
    -d "$COMPLETE_ONBOARDING_PAYLOAD")

  # Extract the body and status code
  HTTP_STATUS=$(echo "$COMPLETE_ONBOARDING_RESP" | grep "HTTP_STATUS" | cut -d':' -f2)
  RESPONSE_BODY=$(echo "$COMPLETE_ONBOARDING_RESP" | sed '$d') # Remove the last line (status line)

  # Check for a successful HTTP status code (2xx)
  if [[ "$HTTP_STATUS" -ge 200 && "$HTTP_STATUS" -lt 300 ]]; then
    echo "✅ Successfully completed onboarding for Guide ID: $GUIDE_ID (Status: $HTTP_STATUS)"
  else
    echo "❌ ERROR: Failed to complete onboarding for Guide ID: $GUIDE_ID (Status: $HTTP_STATUS)"
    echo "   Response: $RESPONSE_BODY"
  fi
done

echo -e "\n\n🎉 --- Script finished. ---"




