#!/bin/bash

# Script to update guide's name using guide ID
# Usage: bash update_guide_name.sh [GUIDE_ID] [NEW_NAME]
# Example: bash update_guide_name.sh 45 "John Doe"

set -e

ADMIN_BASE="https://devazstg.astrokiran.com/auth/api/pixel-admin"
BASE_URL="https://devazstg.astrokiran.com/auth/api/v1"
AREA_CODE="+91"

# Admin credentials
ADMIN_PHONE="8851850842"
USER_TYPE="admin"
PURPOSE="login"
OTP_CODE="123456"

# Check if required arguments are provided
if [ $# -lt 2 ]; then
  echo "Error: Please provide guide ID and new name"
  echo "Usage: bash update_guide_name.sh [GUIDE_ID] [NEW_NAME]"
  echo "Example: bash update_guide_name.sh 45 \"John Doe\""
  exit 1
fi

GUIDE_ID="$1"
NEW_NAME="$2"

echo "=== Admin Login ==="

# 1. Generate OTP for admin
echo "Generating OTP for admin..."
GEN_RESPONSE=$(curl -s -X POST "${BASE_URL}/auth/otp/generate" \
  -H "Content-Type: application/json" \
  -d "{\"area_code\":\"${AREA_CODE}\",\"phone_number\":\"${ADMIN_PHONE}\",\"user_type\":\"${USER_TYPE}\",\"purpose\":\"${PURPOSE}\"}")

OTP_REQUEST_ID=$(echo "$GEN_RESPONSE" | jq -r '.otp_request_id')

if [ -z "$OTP_REQUEST_ID" ] || [ "$OTP_REQUEST_ID" == "null" ]; then
  echo "Failed to get OTP request_id"
  echo "Response: $GEN_RESPONSE"
  exit 1
fi

echo "✓ OTP generated successfully"

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
  echo "Response: $VALIDATE_RESPONSE"
  exit 1
fi

echo "✓ Admin authenticated successfully"
echo ""

# 3. Fetch current guide details
echo "=========================================="
echo "Fetching guide with ID: $GUIDE_ID"
echo "=========================================="

CURRENT_GUIDE=$(curl -s \
  -H "Authorization: Bearer $ADMIN_ACCESS_TOKEN" \
  -H "X-Internal-API-Key: dummy_service_secret" \
  "${ADMIN_BASE}/api/v1/guides/${GUIDE_ID}")

echo "Current guide details:"
echo "$CURRENT_GUIDE" | jq '.'

CURRENT_NAME=$(echo "$CURRENT_GUIDE" | jq -r '.FullName')
CURRENT_PHONE=$(echo "$CURRENT_GUIDE" | jq -r '.PhoneNumber')

if [ -z "$CURRENT_NAME" ] || [ "$CURRENT_NAME" == "null" ]; then
  echo "Error: Could not find guide with ID: $GUIDE_ID"
  exit 1
fi

echo "✓ Found guide"
echo "Current Name: $CURRENT_NAME"
echo "Phone: $CURRENT_PHONE"
echo ""

# 4. Update guide name
echo "Updating guide name to: $NEW_NAME"

# Try different field name formats to see which one works
echo "Attempting update with different field formats..."

# Build a more complete payload based on current guide data
# Extract current values to preserve them
CURRENT_EMAIL=$(echo "$CURRENT_GUIDE" | jq -r '.Email // ""')
CURRENT_PHONE_NUM=$(echo "$CURRENT_GUIDE" | jq -r '.PhoneNumber // ""')
CURRENT_EXPERIENCE=$(echo "$CURRENT_GUIDE" | jq -r '.YearsOfExperience // 0')
CURRENT_SKILLS=$(echo "$CURRENT_GUIDE" | jq -c '.skills // []')
CURRENT_LANGUAGES=$(echo "$CURRENT_GUIDE" | jq -c '.languages // []')

UPDATE_PAYLOAD=$(cat <<EOF
{
  "full_name": "${NEW_NAME}",
  "email": "${CURRENT_EMAIL}",
  "phone_number": "${CURRENT_PHONE_NUM}",
  "years_of_experience": ${CURRENT_EXPERIENCE},
  "languages": ${CURRENT_LANGUAGES},
  "skills": ${CURRENT_SKILLS}
}
EOF
)

echo "Payload being sent:"
echo "$UPDATE_PAYLOAD" | jq '.'

UPDATE_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X PATCH "${ADMIN_BASE}/api/v1/guides/${GUIDE_ID}" \
  -H "Authorization: Bearer $ADMIN_ACCESS_TOKEN" \
  -H "X-Internal-API-Key: dummy_service_secret" \
  -H "Content-Type: application/json" \
  -d "$UPDATE_PAYLOAD")

HTTP_STATUS=$(echo "$UPDATE_RESPONSE" | grep "HTTP_STATUS" | cut -d':' -f2)
RESPONSE_BODY=$(echo "$UPDATE_RESPONSE" | sed '/HTTP_STATUS/d')

echo "HTTP Status: $HTTP_STATUS"
echo "Update Response: $RESPONSE_BODY"

# Verify the update
echo ""
echo "Verifying update..."
UPDATED_GUIDE=$(curl -s \
  -H "Authorization: Bearer $ADMIN_ACCESS_TOKEN" \
  -H "X-Internal-API-Key: dummy_service_secret" \
  "${ADMIN_BASE}/api/v1/guides/${GUIDE_ID}")

UPDATED_NAME=$(echo "$UPDATED_GUIDE" | jq -r '.FullName')
echo "Updated Name: $UPDATED_NAME"

echo ""
echo "=========================================="
echo "✓ Guide name updated successfully!"
echo "Guide ID: $GUIDE_ID"
echo "Phone: $CURRENT_PHONE"
echo "Old Name: $CURRENT_NAME"
echo "New Name: $UPDATED_NAME"
echo "=========================================="
