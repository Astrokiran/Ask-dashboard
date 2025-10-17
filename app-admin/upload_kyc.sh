#!/bin/bash

# This script uploads KYC documents for an existing guide using phone number.
# It generates OTP, validates it, and submits KYC documents.
# Usage: bash upload_kyc.sh [PHONE_NUMBER] [GUIDE_NAME]
# Example: bash upload_kyc.sh 6387051738 "Pinky Yadav"

set -euo pipefail # Exit on error, unset variables, and pipe failures

# --- Configuration ---
BASE_URL="https://devazstg.astrokiran.com/auth/api/v1"
GUIDE_BASE="${BASE_URL}/guide"
AREA_CODE="+91"
STATIC_OTP="123456" # Fixed OTP for testing
LOG_FILE="kyc_upload.log"
MAX_RETRIES=3   # Number of retries for API calls
RETRY_DELAY=5   # Delay between retries

# Local image files for KYC (ensure these files exist in a 'tmp' sub-directory)
TEMP_AADHAAR_FRONT="tmp/afront.jpg"
TEMP_AADHAAR_BACK="tmp/aback.jpg"
TEMP_PAN_FRONT="tmp/pfront.jpg"
TEMP_PAN_BACK="tmp/pback.jpg"

# --- Parse Command Line Arguments ---
if [ $# -lt 2 ]; then
  echo "Usage: bash upload_kyc.sh [PHONE_NUMBER] [GUIDE_NAME]"
  echo "Example: bash upload_kyc.sh 6387051738 \"Pinky Yadav\""
  exit 1
fi

GUIDE_PHONE="${1}"  # Guide's phone number from argument
GUIDE_NAME="${2}"   # Guide's name from argument

# --- Function to Log Messages ---
log_message() {
  local message="$1"
  echo "$message" | tee -a "$LOG_FILE"
}

# --- Function to Perform Curl with Retries ---
curl_with_retry() {
  local url="$1"
  local output="$2"
  shift 2
  local attempt=1
  local response
  local http_code

  while [[ $attempt -le $MAX_RETRIES ]]; do
    log_message "Executing curl (attempt $attempt/$MAX_RETRIES): curl -s -L --write-out '%{http_code}' $url $@"
    # Capture response and extract the HTTP code (last 3 characters)
    response=$(curl -s -L --write-out '%{http_code}' "$url" "$@")
    http_code="${response: -3}"
    response_body="${response:0:${#response}-3}"

    if [[ "$http_code" -ge 200 && "$http_code" -lt 300 ]]; then
      echo "$response_body" >"$output"
      log_message "Success: HTTP Code: $http_code"
      return 0
    fi

    log_message "ERROR: Curl attempt $attempt/$MAX_RETRIES failed for $url. HTTP Code: $http_code, Body: $response_body"
    sleep $RETRY_DELAY
    ((attempt++))
  done

  log_message "ERROR: All $MAX_RETRIES attempts failed for $url"
  return 1
}

# --- Cleanup on Exit or Interrupt ---
cleanup() {
  log_message "\n--- Script finished at $(date). ---"
  rm -f /tmp/curl_response_*.json
  log_message "Cleaned up temporary files."
  exit 0
}
trap cleanup SIGINT SIGTERM

# --- Check Dependencies ---
for cmd in curl jq uuidgen; do
  command -v "$cmd" >/dev/null 2>&1 || { log_message "ERROR: ${cmd} is required but not installed."; exit 1; }
done

# --- Check if KYC documents exist ---
for doc in "$TEMP_AADHAAR_FRONT" "$TEMP_AADHAAR_BACK" "$TEMP_PAN_FRONT" "$TEMP_PAN_BACK"; do
  if [[ ! -f "$doc" ]]; then
    log_message "ERROR: Required document not found: $doc"
    exit 1
  fi
done

# --- Initialize Log File ---
> "$LOG_FILE" # Clear log file
log_message "Starting KYC upload script for guide: ${GUIDE_PHONE} at $(date)"

TRACE_ID=$(uuidgen)

# 1. Generate OTP
log_message "Generating OTP for ${GUIDE_PHONE}..."
TEMP_RESPONSE="/tmp/curl_response_otp_generate.json"
GEN_PAYLOAD=$(jq -n --arg area_code "$AREA_CODE" --arg phone "$GUIDE_PHONE" \
  '{"area_code":$area_code,"phone_number":$phone,"user_type":"guide","purpose":"login"}')
if ! curl_with_retry "${BASE_URL}/auth/otp/generate" "$TEMP_RESPONSE" -H "Content-Type: application/json" -d "$GEN_PAYLOAD"; then
  log_message "ERROR: Failed to generate OTP."
  exit 1
fi
OTP_REQUEST_ID=$(jq -r '.otp_request_id // empty' "$TEMP_RESPONSE")
if [[ -z "$OTP_REQUEST_ID" ]]; then
  log_message "ERROR: Failed to get OTP request_id. Response: $(cat "$TEMP_RESPONSE")"
  exit 1
fi
log_message "OTP Request ID: $OTP_REQUEST_ID"

# 2. Validate OTP
log_message "Validating OTP..."
TEMP_RESPONSE="/tmp/curl_response_otp_validate.json"
VALIDATE_PAYLOAD=$(jq -n --arg area_code "$AREA_CODE" --arg phone "$GUIDE_PHONE" --arg otp "$STATIC_OTP" --arg req_id "$OTP_REQUEST_ID" \
  '{"area_code":$area_code,"phone_number":$phone,"user_type":"guide","otp_code":$otp,"request_id":$req_id,"device_info":{"device_type":"mobile","app_version":"0.1.0"}}')
if ! curl_with_retry "${BASE_URL}/auth/otp/validate" "$TEMP_RESPONSE" -H "Content-Type: application/json" -d "$VALIDATE_PAYLOAD"; then
  log_message "ERROR: Failed to validate OTP."
  exit 1
fi
ACCESS_TOKEN=$(jq -r '.access_token // empty' "$TEMP_RESPONSE")
AUTH_USER_ID=$(jq -r '.auth_user_id // empty' "$TEMP_RESPONSE")
if [[ -z "$ACCESS_TOKEN" || -z "$AUTH_USER_ID" ]]; then
  log_message "ERROR: Failed to get access_token or auth_user_id. Response: $(cat "$TEMP_RESPONSE")"
  exit 1
fi
log_message "Successfully obtained access token."

# 3. Submit KYC
log_message "Submitting KYC documents..."
TEMP_RESPONSE="/tmp/curl_response_kyc_submit.json"

# Generate bank account suffix from phone number
BANK_ACC_SUFFIX=$(echo "$GUIDE_PHONE" | tail -c 5)

# Create bank account JSON
BANK_JSON=$(jq -n --arg name "$GUIDE_NAME" --arg acc_num "12345${BANK_ACC_SUFFIX}" \
  '{"holder_name":$name,"account_number":$acc_num,"ifsc":"TEST0001234","bank_name":"Test Bank","branch":"Main Branch"}')

log_message "Bank Account Details: $BANK_JSON"

if ! curl_with_retry "${GUIDE_BASE}/kyc/submit" "$TEMP_RESPONSE" -H "Authorization: Bearer $ACCESS_TOKEN" -H "X-Auth-Id: $AUTH_USER_ID" -H "X-Trace-Id: $TRACE_ID" \
  -F "aadhaar_front=@${TEMP_AADHAAR_FRONT}" -F "aadhaar_back=@${TEMP_AADHAAR_BACK}" \
  -F "pan_front=@${TEMP_PAN_FRONT}" -F "pan_back=@${TEMP_PAN_BACK}" \
  -F "bank_account=$BANK_JSON"; then
  log_message "ERROR: Failed to submit KYC. Response: $(cat "$TEMP_RESPONSE")"
  exit 1
fi

log_message "Successfully submitted KYC for ${GUIDE_NAME} (${GUIDE_PHONE})!"
log_message "\n=== KYC UPLOAD COMPLETED SUCCESSFULLY ==="

cleanup
