#!/bin/bash

# This script loops 20 times to sign up and onboard 20 guides, each with unique credentials.
# Uses local images in tmp/ folder for KYC submission.
# WARNING: STATIC_OTP is set to '123456' for testing. This may be invalid in the appdev environment.
# Replace with real OTP logic or confirm with API provider if static OTP is allowed.

set -euo pipefail  # Exit on error, unset variables, and pipe failures

# --- Configuration ---
DEFAULT_BASE_URL="https://appdev.astrokiran.com/auth/api/v1"
read -p "Enter API base URL (press Enter for default: ${DEFAULT_BASE_URL}): " INPUT_BASE_URL
BASE_URL=${INPUT_BASE_URL:-$DEFAULT_BASE_URL}
GUIDE_BASE="${BASE_URL}/guide"
AREA_CODE="+91"
STATIC_OTP="123456"  # Fixed OTP for testing; replace with real OTP logic in production
read -p "Using static OTP '${STATIC_OTP}'. Enter a different OTP or press Enter to continue: " INPUT_OTP
STATIC_OTP=${INPUT_OTP:-$STATIC_OTP}
# Validate OTP format (6-digit numeric)
if [[ ! "$STATIC_OTP" =~ ^[0-9]{6}$ ]]; then
  echo "ERROR: OTP must be a 6-digit numeric code (e.g., 123456). Got: $STATIC_OTP"
  exit 1
fi
# Local image files for KYC (relative to script directory)
TEMP_AADHAAR_FRONT="tmp/afront.jpg"
TEMP_AADHAAR_BACK="tmp/aback.jpg"
TEMP_PAN_FRONT="tmp/pfront.jpg"
TEMP_PAN_BACK="tmp/pback.jpg"
LOG_FILE="guide_onboarding.log"
MAX_RETRIES=3  # Number of retries for API calls
RETRY_DELAY=5  # Delay to avoid rate-limiting
FAILURES=0
SUCCESSFUL_GUIDES=()
SKIP_CONNECTIVITY_CHECK="no"
read -p "Skip API connectivity check for debugging? (yes/no, default: no): " INPUT_SKIP
SKIP_CONNECTIVITY_CHECK=${INPUT_SKIP:-no}

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
  local curl_exit_code
  local http_code
  local response_body

  # Validate URL
  if [[ ! "$url" =~ ^https?:// ]]; then
    log_message "ERROR: Invalid URL: $url. Must start with http:// or https://"
    return 1
  fi

  # Create empty output file to avoid cat errors
  : > "$output"

  while [[ $attempt -le $MAX_RETRIES ]]; do
    log_message "Executing curl (attempt $attempt/$MAX_RETRIES): curl -s -L --write-out '%{http_code}' $url $@"
    # Capture both stdout and stderr, follow redirects with -L
    response=$(curl -s -L --write-out '%{http_code}' "$url" "$@" 2>&1)
    curl_exit_code=$?
    # Extract HTTP status code (last three digits)
    http_code=$(echo "$response" | grep -o '[0-9]\{3\}$' || echo "000")
    # Extract response body (remove status code)
    response_body=$(echo "$response" | sed -e 's/[0-9]\{3\}$//')
    log_message "Raw response: $response_body"
    if [[ $curl_exit_code -eq 0 && -n "$http_code" && $http_code -ge 200 && $http_code -lt 300 ]]; then
      echo "$response_body" > "$output"
      log_message "Success: HTTP Code: $http_code"
      return 0
    fi
    if [[ "$http_code" == "429" ]]; then
      log_message "WARNING: HTTP 429 (Too Many Requests) detected. Consider increasing retry delay or contacting API provider."
    elif [[ "$http_code" == "400" ]]; then
      log_message "WARNING: HTTP 400 (Bad Request) detected. Check payload or endpoint: $response_body"
    elif [[ "$http_code" == "302" ]]; then
      log_message "WARNING: HTTP 302 (Redirect) detected. Ensure URL is correct and accessible: $url"
    elif [[ $curl_exit_code -eq 6 ]]; then
      log_message "ERROR: Curl failed due to DNS resolution failure (Could not resolve host) for $url"
    elif [[ $curl_exit_code -eq 26 ]]; then
      log_message "ERROR: Curl failed due to file read error (Exit Code 26). Check if form files exist and are readable."
    fi
    log_message "ERROR: Curl attempt $attempt/$MAX_RETRIES failed for $url. HTTP Code: $http_code, Error: $response_body, Curl Exit Code: $curl_exit_code"
    sleep $RETRY_DELAY
    ((attempt++))
  done
  log_message "ERROR: All $MAX_RETRIES attempts failed for $url"
  return 1
}

# --- Cleanup on Exit or Interrupt ---
cleanup() {
  log_message "\n--- Script interrupted or finished at $(date). ---"
  log_message "Process
  
  ed guides. Success: ${#SUCCESSFUL_GUIDES[@]}, Failures: $FAILURES"
  if [[ ${#SUCCESSFUL_GUIDES[@]} -gt 0 ]]; then
    log_message "Successful guides: ${SUCCESSFUL_GUIDES[*]}"
  fi
  if [[ $FAILURES -gt 0 ]]; then
    log_message "WARNING: $FAILURES guides failed to onboard. Check $LOG_FILE for details."
  fi
  rm -f /tmp/curl_response_*.json
  log_message "Cleaned up temporary files."
  exit 0
}
trap cleanup SIGINT SIGTERM

# --- Check Dependencies ---
command -v curl >/dev/null 2>&1 || { log_message "ERROR: curl is required but not installed."; exit 1; }
command -v jq >/dev/null 2>&1 || { log_message "ERROR: jq is required but not installed."; exit 1; }
command -v uuidgen >/dev/null 2>&1 || { log_message "ERROR: uuidgen is required but not installed."; exit 1; }

# --- Check API Connectivity ---
if [[ "$SKIP_CONNECTIVITY_CHECK" != "yes" ]]; then
  log_message "Checking API connectivity to $BASE_URL..."
  attempt=1
  while [[ $attempt -le $MAX_RETRIES ]]; do
    log_message "Connectivity check attempt $attempt/$MAX_RETRIES: curl -s -I $BASE_URL/auth/otp/generate"
    response=$(curl -s -I "$BASE_URL/auth/otp/generate" 2>&1)
    curl_exit_code=$?
    if [[ $curl_exit_code -eq 0 ]]; then
      log_message "API connectivity verified."
      break
    fi
    log_message "ERROR: Connectivity check attempt $attempt/$MAX_RETRIES failed. Error: $response, Curl Exit Code: $curl_exit_code"
    sleep $RETRY_DELAY
    ((attempt++))
    if [[ $attempt -gt $MAX_RETRIES ]]; then
      log_message "ERROR: Cannot connect to $BASE_URL after $MAX_RETRIES attempts. Check network, server status, or endpoint."
      log_message "Attempting fallback connectivity check to https://appdev.astrokiran.com..."
      response=$(curl -s -I "https://appdev.astrokiran.com" 2>&1)
      curl_exit_code=$?
      if [[ $curl_exit_code -eq 0 ]]; then
        log_message "Base domain is reachable, but $BASE_URL/auth/otp/generate is not. Verify endpoint."
      else
        log_message "ERROR: Base domain https://appdev.astrokiran.com is also unreachable. Error: $response, Curl Exit Code: $curl_exit_code"
      fi
      exit 1
    fi
  done
else
  log_message "Skipping API connectivity check as requested."
fi

# --- Initialize Log File ---
> "$LOG_FILE"  # Clear log file
log_message "Starting guide onboarding script at $(date)"

# --- Loop to Sign Up, Register, and KYC 20 Guides ---
for i in $(seq -f "%03g" 1 50)
do
  log_message "Starting iteration $i/20"
  # --- Calculate Current Guide's Details ---
  GUIDE_ID_SUFFIX=$((100 + 10#$i))  # Force decimal interpretation
  GUIDE_PHONE="6000400${GUIDE_ID_SUFFIX}"
  GUIDE_NAME="guide${GUIDE_ID_SUFFIX}"
  GUIDE_EMAIL="guide${GUIDE_ID_SUFFIX}19@gmail.com"
  TRACE_ID=$(uuidgen)  # Generate unique trace ID for logging

  log_message "\n=================================================="
  log_message "Processing Guide ${i}/20: ${GUIDE_NAME} | Phone: ${GUIDE_PHONE} | Email: ${GUIDE_EMAIL} | Trace-ID: ${TRACE_ID}"
  log_message "=================================================="

  # 1. Generate OTP for the New Guide
  log_message "Generating OTP..."
  TEMP_RESPONSE="/tmp/curl_response_otp_generate.json"
  GEN_PAYLOAD=$(jq -n --arg area_code "$AREA_CODE" --arg phone "$GUIDE_PHONE" \
    '{"area_code":$area_code,"phone_number":$phone,"user_type":"guide","purpose":"login"}')
  log_message "OTP Generate Payload: $GEN_PAYLOAD"
  if ! curl_with_retry "${BASE_URL}/auth/otp/generate" "$TEMP_RESPONSE" \
    -H "Content-Type: application/json" -d "$GEN_PAYLOAD"; then
    log_message "ERROR: Failed to generate OTP for ${GUIDE_NAME} after $MAX_RETRIES attempts."
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

  # 2. Validate OTP to Get Access Token
  log_message "Validating OTP to get access token..."
  TEMP_RESPONSE="/tmp/curl_response_otp_validate.json"
  VALIDATE_PAYLOAD=$(jq -n --arg area_code "$AREA_CODE" --arg phone "$GUIDE_PHONE" \
    --arg otp "$STATIC_OTP" --arg req_id "$OTP_REQUEST_ID" \
    '{"area_code":$area_code,"phone_number":$phone,"user_type":"guide","otp_code":$otp,"request_id":$req_id,"device_info":{"device_type":"mobile","app_version":"0.1.0"}}')
  log_message "OTP Validate Payload: $VALIDATE_PAYLOAD"
  if ! curl_with_retry "${BASE_URL}/auth/otp/validate" "$TEMP_RESPONSE" \
    -H "Content-Type: application/json" -d "$VALIDATE_PAYLOAD"; then
    log_message "ERROR: Failed to validate OTP for ${GUIDE_NAME} after $MAX_RETRIES attempts."
    ((FAILURES++))
    continue
  fi

  ACCESS_TOKEN=$(jq -r '.access_token // empty' "$TEMP_RESPONSE")
  AUTH_USER_ID=$(jq -r '.auth_user_id // empty' "$TEMP_RESPONSE")
  if [[ -z "$ACCESS_TOKEN" || -z "$AUTH_USER_ID" ]]; then
    log_message "ERROR: Failed to extract access_token or auth_user_id for ${GUIDE_NAME}. Access Token: '$ACCESS_TOKEN', Auth User ID: '$AUTH_USER_ID'. Response: $(cat "$TEMP_RESPONSE")"
    ((FAILURES++))
    continue
  fi
  log_message "Successfully obtained access token: $ACCESS_TOKEN"
  log_message "Successfully obtained auth_user_id: $AUTH_USER_ID"

  # 3. Fetch Languages & Skills
  log_message "Fetching languages and skills..."
  TEMP_RESPONSE="/tmp/curl_response_languages.json"
  if ! curl_with_retry "${GUIDE_BASE}/languages" "$TEMP_RESPONSE" \
    -H "Authorization: Bearer $ACCESS_TOKEN" -H "X-Auth-Id: $AUTH_USER_ID" -H "X-Trace-Id: $TRACE_ID"; then
    log_message "ERROR: Failed to fetch languages for ${GUIDE_NAME} after $MAX_RETRIES attempts."
    ((FAILURES++))
    continue
  fi
  log_message "Languages API Response: $(cat "$TEMP_RESPONSE")"

  TEMP_RESPONSE="/tmp/curl_response_skills.json"
  if ! curl_with_retry "${GUIDE_BASE}/skills" "$TEMP_RESPONSE" \
    -H "Authorization: Bearer $ACCESS_TOKEN" -H "X-Auth-Id: $AUTH_USER_ID" -H "X-Trace-Id: $TRACE_ID"; then
    log_message "ERROR: Failed to fetch skills for ${GUIDE_NAME} after $MAX_RETRIES attempts."
    ((FAILURES++))
    continue
  fi
  log_message "Skills API Response: $(cat "$TEMP_RESPONSE")"

  LANG1=$(jq -r '.data[0].id // empty' "/tmp/curl_response_languages.json")
  LANG2=$(jq -r '.data[1].id // empty' "/tmp/curl_response_languages.json")
  SKILL1=$(jq -r '.data[0].id // empty' "/tmp/curl_response_skills.json")
  SKILL2=$(jq -r '.data[2].id // empty' "/tmp/curl_response_skills.json")  # Changed to index 2 to select skill ID 3

  # Fallback to defaults if LANG2/SKILL2 are empty
  if [[ -z "$LANG2" ]]; then
    log_message "WARNING: Second language not available for ${GUIDE_NAME}. Using default: 2"
    LANG2="2"
  fi
  if [[ -z "$SKILL2" ]]; then
    log_message "WARNING: Second skill not available for ${GUIDE_NAME}. Using default: 3"
    SKILL2="3"
  fi
  if [[ -z "$LANG1" || -z "$SKILL1" ]]; then
    log_message "ERROR: Failed to extract languages or skills for ${GUIDE_NAME}. Languages: $(cat "/tmp/curl_response_languages.json"), Skills: $(cat "/tmp/curl_response_skills.json")"
    ((FAILURES++))
    continue
  fi
  log_message "Languages: $LANG1, $LANG2 | Skills: $SKILL1, $SKILL2"

  # 4. Register the Guide
  log_message "Registering guide..."
  TEMP_RESPONSE="/tmp/curl_response_register.json"
  REGISTER_PAYLOAD=$(jq -n --arg name "$GUIDE_NAME" --arg phone "$GUIDE_PHONE" --arg email "$GUIDE_EMAIL" \
    --argjson lang1 "$LANG1" --argjson lang2 "$LANG2" --argjson skill1 "$SKILL1" --argjson skill2 "$SKILL2" \
    '{"full_name":$name,"phone":$phone,"email":$email,"address":{"line1":"123 Main St","city":"Mumbai","state":"Maharashtra","pincode":"400001","country":"India"},"languages":[$lang1,$lang2],"skills":[$skill1,$skill2],"years_of_experience":10}')
  log_message "Register Payload: $REGISTER_PAYLOAD"
  if ! curl_with_retry "${GUIDE_BASE}/register" "$TEMP_RESPONSE" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -H "X-Auth-Id: $AUTH_USER_ID" \
    -H "X-Trace-Id: $TRACE_ID" \
    -d "$REGISTER_PAYLOAD"; then
    log_message "ERROR: Failed to register ${GUIDE_NAME} after $MAX_RETRIES attempts. Response: $(cat "$TEMP_RESPONSE")"
    ((FAILURES++))
    continue
  fi

  REGISTER_STATUS=$(jq -r '.success // false' "$TEMP_RESPONSE")
  if [[ "$REGISTER_STATUS" != "true" ]]; then
    log_message "ERROR: Registration failed for ${GUIDE_NAME}. Response: $(cat "$TEMP_RESPONSE")"
    ((FAILURES++))
    continue
  fi
  log_message "Successfully registered ${GUIDE_NAME}."
  SUCCESSFUL_GUIDES+=("${GUIDE_NAME}")  # Add to successful guides after registration
  log_message "Current successful guides: ${SUCCESSFUL_GUIDES[*]}"

  # 5. Verify KYC Image Files
  log_message "Verifying KYC image files..."
  for file in "$TEMP_AADHAAR_FRONT" "$TEMP_AADHAAR_BACK" "$TEMP_PAN_FRONT" "$TEMP_PAN_BACK"; do
    if [[ ! -f "$file" || ! -r "$file" ]]; then
      log_message "ERROR: KYC image file $file does not exist or is not readable for ${GUIDE_NAME}."
      ((FAILURES++))
      continue 2  # Skip to next guide
    fi
    log_message "Verified KYC image file: $file"
  done

  # 6. Submit KYC
  log_message "Submitting KYC..."
  TEMP_RESPONSE="/tmp/curl_response_kyc_submit.json"
  BANK_JSON=$(jq -n --arg name "$GUIDE_NAME" --arg acc_num "1234500${GUIDE_ID_SUFFIX}" \
    '{"holder_name":$name,"account_number":$acc_num,"ifsc":"TEST0001234","bank_name":"Test Bank","branch":"Main Branch"}')
  log_message "KYC Bank Payload: $BANK_JSON"
  if ! curl_with_retry "${GUIDE_BASE}/kyc/submit" "$TEMP_RESPONSE" \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -H "X-Auth-Id: $AUTH_USER_ID" \
    -H "X-Trace-Id: $TRACE_ID" \
    -F "aadhaar_front=@${TEMP_AADHAAR_FRONT}" \
    -F "aadhaar_back=@${TEMP_AADHAAR_BACK}" \
    -F "pan_front=@${TEMP_PAN_FRONT}" \
    -F "pan_back=@${TEMP_PAN_BACK}" \
    -F "bank_account=$BANK_JSON"; then
    log_message "ERROR: Failed to submit KYC for ${GUIDE_NAME} after $MAX_RETRIES attempts. Response: $(cat "$TEMP_RESPONSE" 2>/dev/null || echo 'No response file')"
    ((FAILURES++))
    continue
  fi

  KYC_STATUS=$(jq -r '.success // false' "$TEMP_RESPONSE")
  if [[ "$KYC_STATUS" != "true" ]]; then
    log_message "ERROR: KYC submission failed for ${GUIDE_NAME}. Response: $(cat "$TEMP_RESPONSE" 2>/dev/null || echo 'No response file')"
    ((FAILURES++))
    continue
  fi
  log_message "Successfully submitted KYC for ${GUIDE_NAME}."

  log_message "Completed iteration $i/20 for ${GUIDE_NAME}"
done

cleanup
