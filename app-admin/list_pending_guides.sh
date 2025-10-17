#!/bin/bash

# Script to list all pending verification guides
# Usage: bash list_pending_guides.sh [OTP_CODE]

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

VALIDATE_RESPONSE=$(curl -s -X POST "${BASE_URL}/auth/otp/validate" \
  -H "Content-Type: application/json" \
  -d "$VALIDATE_PAYLOAD")

echo "OTP Validate Response: $VALIDATE_RESPONSE"
ADMIN_ACCESS_TOKEN=$(echo "$VALIDATE_RESPONSE" | jq -r '.access_token')

if [ -z "$ADMIN_ACCESS_TOKEN" ] || [ "$ADMIN_ACCESS_TOKEN" == "null" ]; then
  echo "Failed to get admin access token"
  exit 1
fi

echo -e "\n✓ Admin authenticated successfully\n"

# 3. Fetch pending verifications
PAGE=1
PAGE_SIZE=100
echo "=== Fetching Pending Verifications ==="
PENDING_VERIFICATIONS_RESPONSE=$(curl -s -H "Authorization: Bearer $ADMIN_ACCESS_TOKEN" \
  "${ADMIN_BASE}/guides/pending-verifications?page=${PAGE}&page_size=${PAGE_SIZE}")

echo -e "\nFull API Response:"
echo "$PENDING_VERIFICATIONS_RESPONSE" | jq .

# 4. Extract and display guides by status
echo -e "\n=========================================="
echo "PENDING VERIFICATION GUIDES"
echo "=========================================="

# KYC_UPLOADED
echo -e "\n--- KYC_UPLOADED (Ready for Verification) ---"
KYC_UPLOADED=$(echo "$PENDING_VERIFICATIONS_RESPONSE" | jq -r '.data.KYC_UPLOADED[]? | "\(.id)|\(.full_name)|\(.phone_number)|\(.email)"')
if [ -n "$KYC_UPLOADED" ]; then
  echo "$KYC_UPLOADED" | while IFS='|' read -r id name phone email; do
    echo "  ID: $id"
    echo "  Name: $name"
    echo "  Phone: $phone"
    echo "  Email: $email"
    echo "  ---"
  done
else
  echo "  No guides in KYC_UPLOADED status"
fi

# KYC_VERIFIED
echo -e "\n--- KYC_VERIFIED (Awaiting Agreement) ---"
KYC_VERIFIED=$(echo "$PENDING_VERIFICATIONS_RESPONSE" | jq -r '.data.KYC_VERIFIED[]? | "\(.id)|\(.full_name)|\(.phone_number)|\(.email)"')
if [ -n "$KYC_VERIFIED" ]; then
  echo "$KYC_VERIFIED" | while IFS='|' read -r id name phone email; do
    echo "  ID: $id"
    echo "  Name: $name"
    echo "  Phone: $phone"
    echo "  Email: $email"
    echo "  ---"
  done
else
  echo "  No guides in KYC_VERIFIED status"
fi

# AGREEMENT_SENT
echo -e "\n--- AGREEMENT_SENT (Awaiting Signature) ---"
AGREEMENT_SENT=$(echo "$PENDING_VERIFICATIONS_RESPONSE" | jq -r '.data.AGREEMENT_SENT[]? | "\(.id)|\(.full_name)|\(.phone_number)|\(.email)"')
if [ -n "$AGREEMENT_SENT" ]; then
  echo "$AGREEMENT_SENT" | while IFS='|' read -r id name phone email; do
    echo "  ID: $id"
    echo "  Name: $name"
    echo "  Phone: $phone"
    echo "  Email: $email"
    echo "  ---"
  done
else
  echo "  No guides in AGREEMENT_SENT status"
fi

# AGREEMENT_SIGNED
echo -e "\n--- AGREEMENT_SIGNED (Ready for Onboarding) ---"
AGREEMENT_SIGNED=$(echo "$PENDING_VERIFICATIONS_RESPONSE" | jq -r '.data.AGREEMENT_SIGNED[]? | "\(.id)|\(.full_name)|\(.phone_number)|\(.email)"')
if [ -n "$AGREEMENT_SIGNED" ]; then
  echo "$AGREEMENT_SIGNED" | while IFS='|' read -r id name phone email; do
    echo "  ID: $id"
    echo "  Name: $name"
    echo "  Phone: $phone"
    echo "  Email: $email"
    echo "  ---"
  done
else
  echo "  No guides in AGREEMENT_SIGNED status"
fi

echo -e "\n=========================================="

# Count summary
KYC_UPLOADED_COUNT=$(echo "$PENDING_VERIFICATIONS_RESPONSE" | jq -r '.data.KYC_UPLOADED | length')
KYC_VERIFIED_COUNT=$(echo "$PENDING_VERIFICATIONS_RESPONSE" | jq -r '.data.KYC_VERIFIED | length')
AGREEMENT_SENT_COUNT=$(echo "$PENDING_VERIFICATIONS_RESPONSE" | jq -r '.data.AGREEMENT_SENT | length')
AGREEMENT_SIGNED_COUNT=$(echo "$PENDING_VERIFICATIONS_RESPONSE" | jq -r '.data.AGREEMENT_SIGNED | length')

echo -e "\nSUMMARY:"
echo "  KYC_UPLOADED: $KYC_UPLOADED_COUNT"
echo "  KYC_VERIFIED: $KYC_VERIFIED_COUNT"
echo "  AGREEMENT_SENT: $AGREEMENT_SENT_COUNT"
echo "  AGREEMENT_SIGNED: $AGREEMENT_SIGNED_COUNT"
echo "=========================================="
