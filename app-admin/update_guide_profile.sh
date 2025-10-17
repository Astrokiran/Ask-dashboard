#!/bin/bash

# Script to update guide's profile (name and bio only) by authenticating as the guide
# Usage: bash update_guide_profile.sh [GUIDE_PHONE] [OPTIONS]
# Example: bash update_guide_profile.sh 9044257411 --name "Anuradha Pathak" --bio "Expert in Vedic astrology"
#
# Note: The /guide/profile endpoint only supports updating 'name' and 'bio' fields.
# Languages, skills, email, and other fields cannot be updated through this endpoint.

set -e

BASE_URL="https://devazstg.astrokiran.com/auth/api/v1"
GUIDE_BASE="${BASE_URL}/guide"
AREA_CODE="+91"
STATIC_OTP="123456"

# Parse arguments
if [ $# -lt 2 ]; then
  echo "Error: Please provide guide phone number and at least one update option"
  echo "Usage: bash update_guide_profile.sh [GUIDE_PHONE] [OPTIONS]"
  echo ""
  echo "Options:"
  echo "  --name \"Full Name\"       Update guide's name"
  echo "  --bio \"Biography\"        Update guide's bio"
  echo ""
  echo "Note: Only 'name' and 'bio' can be updated via this endpoint."
  echo ""
  echo "Example:"
  echo "  bash update_guide_profile.sh 9044257411 --name \"Anuradha Pathak\""
  exit 1
fi

GUIDE_PHONE="$1"
shift

# Initialize update fields
UPDATE_NAME=""
UPDATE_BIO=""

# Parse options
while [[ $# -gt 0 ]]; do
  case $1 in
    --name)
      UPDATE_NAME="$2"
      shift 2
      ;;
    --bio)
      UPDATE_BIO="$2"
      shift 2
      ;;
    *)
      echo "Unknown option: $1"
      echo "Only --name and --bio are supported."
      exit 1
      ;;
  esac
done

echo "=== Authenticating as Guide ==="
echo "Phone: $GUIDE_PHONE"

# 1. Generate OTP for the guide
echo "Generating OTP for guide..."
GEN_RESPONSE=$(curl -s -X POST "${BASE_URL}/auth/otp/generate" \
  -H "Content-Type: application/json" \
  -d "{\"area_code\":\"${AREA_CODE}\",\"phone_number\":\"${GUIDE_PHONE}\",\"user_type\":\"guide\",\"purpose\":\"login\"}")

OTP_REQUEST_ID=$(echo "$GEN_RESPONSE" | jq -r '.otp_request_id')

if [ -z "$OTP_REQUEST_ID" ] || [ "$OTP_REQUEST_ID" == "null" ]; then
  echo "Failed to get OTP request_id"
  echo "Response: $GEN_RESPONSE"
  exit 1
fi

echo "✓ OTP generated successfully"

# 2. Validate OTP for guide
echo "Validating OTP for guide..."
VALIDATE_PAYLOAD=$(cat <<EOF
{
  "area_code": "${AREA_CODE}",
  "phone_number": "${GUIDE_PHONE}",
  "user_type": "guide",
  "otp_code": "${STATIC_OTP}",
  "request_id": "${OTP_REQUEST_ID}",
  "device_info": {
    "device_type": "mobile",
    "app_version": "0.1.0"
  }
}
EOF
)

VALIDATE_RESPONSE=$(curl -s -X POST "${BASE_URL}/auth/otp/validate" \
  -H "Content-Type: application/json" \
  -d "$VALIDATE_PAYLOAD")

GUIDE_ACCESS_TOKEN=$(echo "$VALIDATE_RESPONSE" | jq -r '.access_token')
AUTH_USER_ID=$(echo "$VALIDATE_RESPONSE" | jq -r '.auth_user_id')

if [ -z "$GUIDE_ACCESS_TOKEN" ] || [ "$GUIDE_ACCESS_TOKEN" == "null" ]; then
  echo "Failed to get guide access token"
  echo "Response: $VALIDATE_RESPONSE"
  exit 1
fi

echo "✓ Guide authenticated successfully"
echo ""

# 3. Get current profile
echo "=========================================="
echo "Fetching current guide profile..."
echo "=========================================="

CURRENT_PROFILE=$(curl -s \
  -H "Authorization: Bearer $GUIDE_ACCESS_TOKEN" \
  -H "X-Auth-Id: $AUTH_USER_ID" \
  "${GUIDE_BASE}/profile")

echo "Current profile:"
echo "$CURRENT_PROFILE" | jq '.'

# Extract current values from the nested response structure
CURRENT_NAME=$(echo "$CURRENT_PROFILE" | jq -r '.data.guide_profile.FullName // ""')
CURRENT_EMAIL=$(echo "$CURRENT_PROFILE" | jq -r '.data.guide_profile.Email // ""')
CURRENT_PHONE_NUM=$(echo "$CURRENT_PROFILE" | jq -r '.data.guide_profile.PhoneNumber // ""')
CURRENT_DOB=$(echo "$CURRENT_PROFILE" | jq -r '.data.guide_profile.DateOfBirth // null')
CURRENT_GENDER=$(echo "$CURRENT_PROFILE" | jq -r '.data.guide_profile.Gender // ""')
CURRENT_EXPERIENCE=$(echo "$CURRENT_PROFILE" | jq -r '.data.years_of_experience // 0')
CURRENT_BIO=$(echo "$CURRENT_PROFILE" | jq -r '.data.bio // ""')

# Get current languages and skills from the data level
CURRENT_LANGUAGES=$(echo "$CURRENT_PROFILE" | jq -r '.data.languages // [] | join(",")')
CURRENT_SKILLS=$(echo "$CURRENT_PROFILE" | jq -r '.data.skills // [] | join(",")')

echo ""
echo "Current values:"
echo "  Name: $CURRENT_NAME"
echo "  Email: $CURRENT_EMAIL"
echo "  Phone: $CURRENT_PHONE_NUM"
echo "  Languages: $CURRENT_LANGUAGES"
echo "  Skills: $CURRENT_SKILLS"
echo "  Experience: $CURRENT_EXPERIENCE years"
echo ""

# 4. Build update payload with specified updates or current values
FINAL_NAME="${UPDATE_NAME:-$CURRENT_NAME}"
FINAL_BIO="${UPDATE_BIO:-$CURRENT_BIO}"

echo "=========================================="
echo "Updating guide profile..."
echo "=========================================="

UPDATE_PAYLOAD=$(cat <<EOF
{
  "name": "${FINAL_NAME}",
  "bio": "${FINAL_BIO}"
}
EOF
)

echo "Update payload:"
echo "$UPDATE_PAYLOAD" | jq '.'

UPDATE_RESPONSE=$(curl -s -X PATCH "${GUIDE_BASE}/profile" \
  -H "Authorization: Bearer $GUIDE_ACCESS_TOKEN" \
  -H "X-Auth-Id: $AUTH_USER_ID" \
  -H "Content-Type: application/json" \
  -d "$UPDATE_PAYLOAD")

echo ""
echo "Update response:"
echo "$UPDATE_RESPONSE" | jq '.'

# 5. Verify the update
echo ""
echo "=========================================="
echo "Verifying update..."
echo "=========================================="

UPDATED_PROFILE=$(curl -s \
  -H "Authorization: Bearer $GUIDE_ACCESS_TOKEN" \
  -H "X-Auth-Id: $AUTH_USER_ID" \
  "${GUIDE_BASE}/profile")

UPDATED_NAME=$(echo "$UPDATED_PROFILE" | jq -r '.data.guide_profile.FullName')
UPDATED_BIO=$(echo "$UPDATED_PROFILE" | jq -r '.data.bio')

echo ""
echo "=========================================="
echo "✓ Guide profile updated successfully!"
echo "=========================================="
echo "Phone: $GUIDE_PHONE"
echo ""
if [ -n "$UPDATE_NAME" ]; then
  echo "Name:"
  echo "  Old: $CURRENT_NAME"
  echo "  New: $UPDATED_NAME"
fi
if [ -n "$UPDATE_BIO" ]; then
  echo "Bio:"
  echo "  Old: $CURRENT_BIO"
  echo "  New: $UPDATED_BIO"
fi
echo "=========================================="
