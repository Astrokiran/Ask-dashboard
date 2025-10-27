#!/bin/bash

# Usage: bash scripts/admin_upload_guide_profile.sh [GUIDE_PHONE] [OTP_CODE] [PROFILE_PICTURE_PATH]
# Example: bash scripts/admin_upload_guide_profile.sh 8178211511 123456 /tmp/image.png

set -e

GUIDE_BASE="https://askapp.astrokiran.com/api/v1"
AREA_CODE="+91"

# Set the guide phone number and user details
GUIDE_PHONE="8178211511"
USER_TYPE="guide"
PURPOSE="login"

# Parse arguments
OTP_CODE="${1:-123456}"
GUIDE_PHONE_ARG="${2:-$GUIDE_PHONE}"
PROFILE_PICTURE_PATH="${3:-tmp/image.png}"

# Validate required arguments
if [ ! -f "$PROFILE_PICTURE_PATH" ]; then
  echo "Error: Profile picture not found at $PROFILE_PICTURE_PATH"
  exit 1
fi

echo "Logging in as Guide: $GUIDE_PHONE_ARG"
echo "Profile picture path: $PROFILE_PICTURE_PATH"

# 1. Generate OTP for guide
echo "Generating OTP for guide..."
GEN_RESPONSE=$(curl -s -X POST "https://askapp.astrokiran.com/api/v1otp/generate" \
  -H "Content-Type: application/json" \
  -d "{\"area_code\":\"${AREA_CODE}\",\"phone_number\":\"${GUIDE_PHONE_ARG}\",\"user_type\":\"${USER_TYPE}\",\"purpose\":\"${PURPOSE}\"}")

echo "OTP Generate Response: $GEN_RESPONSE"
OTP_REQUEST_ID=$(echo "$GEN_RESPONSE" | jq -r '.otp_request_id')

if [ -z "$OTP_REQUEST_ID" ] || [ "$OTP_REQUEST_ID" == "null" ]; then
  echo "Failed to get OTP request_id"
  exit 1
fi

# 2. Validate OTP for guide
echo "Validating OTP for guide..."
VALIDATE_PAYLOAD=$(cat <<EOF
{
  "area_code": "${AREA_CODE}",
  "phone_number": "${GUIDE_PHONE_ARG}",
  "user_type": "${USER_TYPE}",
  "otp_code": "${OTP_CODE}",
  "request_id": "${OTP_REQUEST_ID}",
  "device_info": {
    "device_type": "web",
    "device_name": "Guide Device",
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
GUIDE_ACCESS_TOKEN=$(echo "$VALIDATE_RESPONSE" | jq -r '.access_token')

if [ -z "$GUIDE_ACCESS_TOKEN" ] || [ "$GUIDE_ACCESS_TOKEN" == "null" ]; then
  echo "Failed to get guide access token"
  exit 1
fi

# 3. Upload profile picture as guide
echo -e "\n--- Uploading Profile Picture as Guide ---"

# Use the guide profile API endpoint with guide token
echo "Uploading to guide profile API..."
GUIDE_UPLOAD_RESP=$(curl -s --location "${GUIDE_BASE}/guide/profile-picture" \
  --header "Authorization: Bearer ${GUIDE_ACCESS_TOKEN}" \
  --form "image=@\"${PROFILE_PICTURE_PATH}\"")

echo "Profile upload response: $GUIDE_UPLOAD_RESP"

# Check if upload was successful
SUCCESS=$(echo "$GUIDE_UPLOAD_RESP" | jq -r '.success // false')
if [ "$SUCCESS" == "true" ]; then
  echo "✅ Profile picture uploaded successfully!"
else
  echo "❌ Profile picture upload failed"
fi

echo -e "\n=== Profile picture upload completed ==="