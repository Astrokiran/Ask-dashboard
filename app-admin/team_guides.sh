#!/bin/bash

# This script registers and onboards a predefined list of 5 guides.
# It uses local images in the 'tmp/' folder for KYC submission.

set -euo pipefail # Exit on error, unset variables, and pipe failures

# --- Configuration ---
BASE_URL="https://appdev.astrokiran.com/auth/api/v1"
GUIDE_BASE="${BASE_URL}/guide"
AREA_CODE="+91"
STATIC_OTP="123456" # Fixed OTP for testing
LOG_FILE="guide_onboarding.log"
MAX_RETRIES=3   # Number of retries for API calls
RETRY_DELAY=5   # Delay between retries
FAILURES=0
SUCCESSFUL_GUIDES=()

# Local image files for KYC (ensure these files exist in a 'tmp' sub-directory)
TEMP_AADHAAR_FRONT="tmp/afront.jpg"
TEMP_AADHAAR_BACK="tmp/aback.jpg"
TEMP_PAN_FRONT="tmp/pfront.jpg"
TEMP_PAN_BACK="tmp/pback.jpg"

# --- Predefined Guide Data ---
declare -a guide_names=("astroamanjain")
declare -a guide_phones=("6366597069")
TOTAL_GUIDES=${#guide_names[@]}

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
  log_message "Processed ${TOTAL_GUIDES} guides. Success: ${#SUCCESSFUL_GUIDES[@]}, Failures: $FAILURES"
  if [[ ${#SUCCESSFUL_GUIDES[@]} -gt 0 ]]; then
    log_message "Successful guides: ${SUCCESSFUL_GUIDES[*]}"
  fi
  rm -f /tmp/curl_response_*.json
  log_message "Cleaned up temporary files."
  exit 0
}
trap cleanup SIGINT SIGTERM

# --- Check Dependencies ---
for cmd in curl jq uuidgen; do
  command -v "$cmd" >/dev/null 2>&1 || { log_message "ERROR: ${cmd} is required but not installed."; exit 1; }
done

# --- Initialize Log File ---
> "$LOG_FILE" # Clear log file
log_message "Starting guide registration script for ${TOTAL_GUIDES} specific guides at $(date)"

# --- Main Loop to Register Guides ---
for i in "${!guide_names[@]}"; do
  # --- Set Current Guide's Details ---
  GUIDE_NAME="${guide_names[$i]}"
  GUIDE_PHONE="${guide_phones[$i]}"
  # Generate a unique email and bank account suffix
  CLEAN_NAME_LOWERCASE=$(echo "$GUIDE_NAME" | tr -d ' ' | tr '[:upper:]' '[:lower:]')
  GUIDE_EMAIL="${CLEAN_NAME_LOWERCASE}_${GUIDE_PHONE}@example.com" 
  BANK_ACC_SUFFIX=$(echo "$GUIDE_PHONE" | tail -c 5)
  TRACE_ID=$(uuidgen)

  log_message "\n=================================================="
  log_message "Processing Guide $((i+1))/${TOTAL_GUIDES}: ${GUIDE_NAME} | Phone: ${GUIDE_PHONE}"
  log_message "=================================================="

  # 1. Generate OTP
  log_message "Generating OTP..."
  TEMP_RESPONSE="/tmp/curl_response_otp_generate.json"
  GEN_PAYLOAD=$(jq -n --arg area_code "$AREA_CODE" --arg phone "$GUIDE_PHONE" \
    '{"area_code":$area_code,"phone_number":$phone,"user_type":"guide","purpose":"login"}')
  if ! curl_with_retry "${BASE_URL}/auth/otp/generate" "$TEMP_RESPONSE" -H "Content-Type: application/json" -d "$GEN_PAYLOAD"; then
    log_message "ERROR: Failed to generate OTP for ${GUIDE_NAME}."
    ((FAILURES++))
    continue
  fi
  OTP_REQUEST_ID=$(jq -r '.otp_request_id // empty' "$TEMP_RESPONSE")
  if [[ -z "$OTP_REQUEST_ID" ]]; then
    log_message "ERROR: Failed to get OTP request_id for ${GUIDE_NAME}. Response: $(cat "$TEMP_RESPONSE")"
    ((FAILURES++))
    continue
  fi
  log_message "OTP Request ID: $OTP_REQUEST_ID"

  # 2. Validate OTP
  log_message "Validating OTP..."
  TEMP_RESPONSE="/tmp/curl_response_otp_validate.json"
  VALIDATE_PAYLOAD=$(jq -n --arg area_code "$AREA_CODE" --arg phone "$GUIDE_PHONE" --arg otp "$STATIC_OTP" --arg req_id "$OTP_REQUEST_ID" \
    '{"area_code":$area_code,"phone_number":$phone,"user_type":"guide","otp_code":$otp,"request_id":$req_id,"device_info":{"device_type":"mobile","app_version":"0.1.0"}}')
  if ! curl_with_retry "${BASE_URL}/auth/otp/validate" "$TEMP_RESPONSE" -H "Content-Type: application/json" -d "$VALIDATE_PAYLOAD"; then
    log_message "ERROR: Failed to validate OTP for ${GUIDE_NAME}."
    ((FAILURES++))
    continue
  fi
  ACCESS_TOKEN=$(jq -r '.access_token // empty' "$TEMP_RESPONSE")
  AUTH_USER_ID=$(jq -r '.auth_user_id // empty' "$TEMP_RESPONSE")
  if [[ -z "$ACCESS_TOKEN" || -z "$AUTH_USER_ID" ]]; then
    log_message "ERROR: Failed to get access_token or auth_user_id for ${GUIDE_NAME}. Response: $(cat "$TEMP_RESPONSE")"
    ((FAILURES++))
    continue
  fi
  log_message "Successfully obtained access token."

  # 3. Register the Guide (using default skills/languages for simplicity)
  log_message "Registering guide..."
  TEMP_RESPONSE="/tmp/curl_response_register.json"
  REGISTER_PAYLOAD=$(jq -n --arg name "$GUIDE_NAME" --arg phone "$GUIDE_PHONE" --arg email "$GUIDE_EMAIL" \
    '{"full_name":$name,"phone":$phone,"email":$email,"address":{"line1":"123 Test St","city":"Bengaluru","state":"Karnataka","pincode":"560001","country":"India"},"languages":[1,2],"skills":[1,3],"years_of_experience":5}')
  if ! curl_with_retry "${GUIDE_BASE}/register" "$TEMP_RESPONSE" -H "Content-Type: application/json" -H "Authorization: Bearer $ACCESS_TOKEN" -H "X-Auth-Id: $AUTH_USER_ID" -H "X-Trace-Id: $TRACE_ID" -d "$REGISTER_PAYLOAD"; then
    log_message "ERROR: Failed to register ${GUIDE_NAME}. Response: $(cat "$TEMP_RESPONSE")"
    ((FAILURES++))
    continue
  fi
  log_message "Successfully registered ${GUIDE_NAME}."

  # 4. Submit KYC
  log_message "Submitting KYC..."
  TEMP_RESPONSE="/tmp/curl_response_kyc_submit.json"
  BANK_JSON=$(jq -n --arg name "$GUIDE_NAME" --arg acc_num "12345${BANK_ACC_SUFFIX}" \
    '{"holder_name":$name,"account_number":$acc_num,"ifsc":"TEST0001234","bank_name":"Test Bank","branch":"Main Branch"}')
  if ! curl_with_retry "${GUIDE_BASE}/kyc/submit" "$TEMP_RESPONSE" -H "Authorization: Bearer $ACCESS_TOKEN" -H "X-Auth-Id: $AUTH_USER_ID" -H "X-Trace-Id: $TRACE_ID" \
    -F "aadhaar_front=@${TEMP_AADHAAR_FRONT}" -F "aadhaar_back=@${TEMP_AADHAAR_BACK}" \
    -F "pan_front=@${TEMP_PAN_FRONT}" -F "pan_back=@${TEMP_PAN_BACK}" \
    -F "bank_account=$BANK_JSON"; then
    log_message "ERROR: Failed to submit KYC for ${GUIDE_NAME}. Response: $(cat "$TEMP_RESPONSE")"
    ((FAILURES++))
    continue
  fi
  log_message "Successfully submitted KYC for ${GUIDE_NAME}."

  SUCCESSFUL_GUIDES+=("${GUIDE_NAME}")
done

cleanup