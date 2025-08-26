#!/bin/bash

# Usage: bash scripts/admin_process_kyc_guides.sh [ADMIN_PHONE] [OTP_CODE]
# Example: bash scripts/admin_process_kyc_guides.sh 9000000000 123456

set -e

ADMIN_BASE="https://appdev.astrokiran.com/auth/api/v1/admin"
AREA_CODE="+91"

# Set the admin phone number and user details
ADMIN_PHONE="7676753620"
USER_TYPE="admin"
PURPOSE="login"
# The OTP code is now the first argument, defaulting to 123456
OTP_CODE="${1:-123456}"

# 1. Generate OTP for admin
echo "Generating OTP for admin..."
GEN_RESPONSE=$(curl -s -X POST "https://appdev.astrokiran.com/auth/api/v1/auth/otp/generate" \
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

VALIDATE_RESPONSE=$(curl -s -X POST "https://appdev.astrokiran.com/auth/api/v1/auth/otp/validate" \
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

# 4. Extract guide IDs from KYC_UPLOADED
GUIDE_IDS=$(echo "$PENDING_VERIFICATIONS_RESPONSE" | jq -r '.data.KYC_UPLOADED[].id')

if [ -z "$GUIDE_IDS" ]; then
  echo "No kyc_uploaded guides found to verify."
  exit 0
fi

# 5. Process each guide
for GUIDE_ID in $GUIDE_IDS; do
  echo -e "\n--- Processing Guide $GUIDE_ID ---"

  # Fetch KYC documents
  echo "Fetching KYC Documents for Guide $GUIDE_ID..."
  KYC_DOCS=$(curl -s -H "Authorization: Bearer $ADMIN_ACCESS_TOKEN" "${ADMIN_BASE}/guides/${GUIDE_ID}/kyc-documents")
  echo "KYC Docs: $KYC_DOCS"

  # Verify KYC documents (aadhaar, pan)
  for DOC_TYPE in aadhaar pan; do
    echo "Verifying KYC Document: $DOC_TYPE..."
    VERIFY_RESP=$(curl -s -X PATCH "${ADMIN_BASE}/guides/${GUIDE_ID}/kyc/verify" \
      -H "Authorization: Bearer $ADMIN_ACCESS_TOKEN" \
      -H "Content-Type: application/json" \
      -d "{\"document_type\": \"${DOC_TYPE}\", \"is_verified\": true}")
    echo "Verify $DOC_TYPE Response: $VERIFY_RESP"
    GUIDE_STATUS=$(curl -s -H "Authorization: Bearer $ADMIN_ACCESS_TOKEN" "${ADMIN_BASE}/guides/${GUIDE_ID}/status")
    echo "Guide Status after $DOC_TYPE verification: $GUIDE_STATUS"
  done

  # Send Agreement
  echo "Sending Agreement for Guide $GUIDE_ID..."
  SEND_AGREEMENT_RESP=$(curl -s -X POST "${ADMIN_BASE}/guides/${GUIDE_ID}/send-agreement" \
    -H "Authorization: Bearer $ADMIN_ACCESS_TOKEN")
  echo "Send Agreement Response: $SEND_AGREEMENT_RESP"
  GUIDE_STATUS=$(curl -s -H "Authorization: Bearer $ADMIN_ACCESS_TOKEN" "${ADMIN_BASE}/guides/${GUIDE_ID}/status")
  echo "Guide Status after agreement send: $GUIDE_STATUS"

  # Mark Agreement as Signed
  echo "Marking Agreement as Signed for Guide $GUIDE_ID..."
  MARK_SIGNED_RESP=$(curl -s -X POST "${ADMIN_BASE}/guides/${GUIDE_ID}/mark-agreement-signed" \
    -H "Authorization: Bearer $ADMIN_ACCESS_TOKEN")
  echo "Mark Agreement Signed Response: $MARK_SIGNED_RESP"
  GUIDE_STATUS=$(curl -s -H "Authorization: Bearer $ADMIN_ACCESS_TOKEN" "${ADMIN_BASE}/guides/${GUIDE_ID}/status")
  echo "Guide Status after agreement signed: $GUIDE_STATUS"

  # Complete onboarding
  BASE_RATE_PER_MINUTES="150"
  REVENUE_SHARE=75
  echo "Completing Onboarding for Guide $GUIDE_ID..."
  COMPLETE_ONBOARDING_PAYLOAD="{\"price_per_minute\": \"$BASE_RATE_PER_MINUTES\", \"revenue_share\": $REVENUE_SHARE}"

# --- Send the Request ---
echo "Sending Payload: $COMPLETE_ONBOARDING_PAYLOAD"
COMPLETE_ONBOARDING_RESP=$(curl -s -X POST "${ADMIN_BASE}/guides/${GUIDE_ID}/complete-onboarding" \
  -H "Authorization: Bearer $ADMIN_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "$COMPLETE_ONBOARDING_PAYLOAD")

echo "Complete Onboarding Response: $COMPLETE_ONBOARDING_RESP"
  GUIDE_STATUS=$(curl -s -H "Authorization: Bearer $ADMIN_ACCESS_TOKEN" "${ADMIN_BASE}/guides/${GUIDE_ID}/status")
  echo "Guide Status after onboarding complete: $GUIDE_STATUS"
done

# 6. List all active guides to verify
echo -e "\n--- Listing All Active Guides ---"
LIST_GUIDES_RESP=$(curl -s -H "Authorization: Bearer $ADMIN_ACCESS_TOKEN" "${ADMIN_BASE}/guides?status=ACTIVE&page=1&page_size=100")
echo "List Guides (ACTIVE) Response: $LIST_GUIDES_RESP"
