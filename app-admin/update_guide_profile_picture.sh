#!/bin/bash

# Script to update guide profile picture with phone number login and default OTP
# Usage: bash update_guide_profile_picture.sh [PHONE_NUMBER] [IMAGE_PATH]
# Example: bash update_guide_profile_picture.sh 6000700101 tmp/image.png

set -euo pipefail

# --- Configuration ---
BASE_URL="https://devazstg.astrokiran.com/auth/api/v1"
GUIDE_BASE="${BASE_URL}/guide"
AREA_CODE="+91"
DEFAULT_OTP="123456"
LOG_FILE="profile_picture_update.log"
MAX_RETRIES=3
RETRY_DELAY=5

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
    log_message "Executing curl (attempt $attempt/$MAX_RETRIES)"
    response=$(curl -s -L --write-out '%{http_code}' "$url" "$@" 2>&1)
    http_code="${response: -3}"
    response_body="${response:0:${#response}-3}"

    if [[ "$http_code" -ge 200 && "$http_code" -lt 300 ]]; then
      echo "$response_body" >"$output"
      log_message "Success: HTTP Code: $http_code"
      return 0
    fi

    log_message "ERROR: Attempt $attempt/$MAX_RETRIES failed. HTTP Code: $http_code, Body: $response_body"
    sleep $RETRY_DELAY
    ((attempt++))
  done

  log_message "ERROR: All $MAX_RETRIES attempts failed for $url"
  return 1
}

# --- Check Dependencies ---
for cmd in curl jq uuidgen; do
  command -v "$cmd" >/dev/null 2>&1 || {
    log_message "ERROR: ${cmd} is required but not installed."
    exit 1
  }
done

# --- Parse Arguments ---
if [ $# -lt 2 ]; then
  echo "Usage: bash update_guide_profile_picture.sh [PHONE_NUMBER] [IMAGE_PATH]"
  echo "Example: bash update_guide_profile_picture.sh 6000700101 tmp/image.png"
  exit 1
fi

GUIDE_PHONE="${1}"
IMAGE_PATH="${2}"

# --- Validate Image File ---
if [[ ! -f "$IMAGE_PATH" ]]; then
  echo "ERROR: Image file not found: $IMAGE_PATH"
  exit 1
fi

if [[ ! -r "$IMAGE_PATH" ]]; then
  echo "ERROR: Image file is not readable: $IMAGE_PATH"
  exit 1
fi

# --- Initialize Log File ---
> "$LOG_FILE"
log_message "==================================================="
log_message "Guide Profile Picture Update Script"
log_message "Started at: $(date)"
log_message "==================================================="
log_message "Phone: ${GUIDE_PHONE}"
log_message "Image Path: ${IMAGE_PATH}"
log_message "Default OTP: ${DEFAULT_OTP}"
log_message "==================================================="

TRACE_ID=$(uuidgen)

# Step 1: Generate OTP
log_message "\n[1/4] Generating OTP for ${GUIDE_PHONE}..."
TEMP_RESPONSE="/tmp/profile_pic_otp_generate.json"
GEN_PAYLOAD=$(jq -n \
  --arg area_code "$AREA_CODE" \
  --arg phone "$GUIDE_PHONE" \
  '{
    "area_code": $area_code,
    "phone_number": $phone,
    "user_type": "guide",
    "purpose": "login"
  }')

if ! curl_with_retry "${BASE_URL}/auth/otp/generate" "$TEMP_RESPONSE" \
  -H "Content-Type: application/json" \
  -d "$GEN_PAYLOAD"; then
  log_message "ERROR: Failed to generate OTP"
  exit 1
fi

OTP_REQUEST_ID=$(jq -r '.otp_request_id // empty' "$TEMP_RESPONSE")
if [[ -z "$OTP_REQUEST_ID" ]]; then
  log_message "ERROR: Failed to get OTP request_id. Response: $(cat "$TEMP_RESPONSE")"
  exit 1
fi
log_message "✓ OTP Request ID: $OTP_REQUEST_ID"

# Step 2: Validate OTP
log_message "\n[2/4] Validating OTP..."
TEMP_RESPONSE="/tmp/profile_pic_otp_validate.json"
VALIDATE_PAYLOAD=$(jq -n \
  --arg area_code "$AREA_CODE" \
  --arg phone "$GUIDE_PHONE" \
  --arg otp "$DEFAULT_OTP" \
  --arg req_id "$OTP_REQUEST_ID" \
  '{
    "area_code": $area_code,
    "phone_number": $phone,
    "user_type": "guide",
    "otp_code": $otp,
    "request_id": $req_id,
    "device_info": {
      "device_type": "mobile",
      "app_version": "0.1.0"
    }
  }')

if ! curl_with_retry "${BASE_URL}/auth/otp/validate" "$TEMP_RESPONSE" \
  -H "Content-Type: application/json" \
  -d "$VALIDATE_PAYLOAD"; then
  log_message "ERROR: Failed to validate OTP"
  exit 1
fi

ACCESS_TOKEN=$(jq -r '.access_token // empty' "$TEMP_RESPONSE")
AUTH_USER_ID=$(jq -r '.auth_user_id // empty' "$TEMP_RESPONSE")

if [[ -z "$ACCESS_TOKEN" || -z "$AUTH_USER_ID" ]]; then
  log_message "ERROR: Failed to get access_token or auth_user_id. Response: $(cat "$TEMP_RESPONSE")"
  exit 1
fi

log_message "✓ Successfully authenticated"
log_message "  Access Token: ${ACCESS_TOKEN:0:20}..."
log_message "  Auth User ID: $AUTH_USER_ID"

# Step 3: Fetch Current Profile (optional, for logging)
log_message "\n[3/4] Fetching current guide profile..."
TEMP_RESPONSE="/tmp/profile_pic_current_profile.json"
if curl_with_retry "${GUIDE_BASE}/profile" "$TEMP_RESPONSE" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "X-Auth-Id: $AUTH_USER_ID" \
  -H "X-Trace-Id: $TRACE_ID"; then
  CURRENT_PROFILE_PICTURE=$(jq -r '.data.profile_picture_url // "None"' "$TEMP_RESPONSE")
  log_message "✓ Current Profile Picture URL: $CURRENT_PROFILE_PICTURE"
else
  log_message "WARNING: Could not fetch current profile"
fi

# Step 4: Upload Profile Picture
log_message "\n[4/4] Uploading profile picture..."
log_message "Image file: $IMAGE_PATH"
log_message "File size: $(du -h "$IMAGE_PATH" | cut -f1)"

TEMP_RESPONSE="/tmp/profile_pic_upload_response.json"
if ! curl_with_retry "${GUIDE_BASE}/profile-picture" "$TEMP_RESPONSE" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "X-Auth-Id: $AUTH_USER_ID" \
  -H "X-Trace-Id: $TRACE_ID" \
  -F "image=@${IMAGE_PATH}"; then
  log_message "ERROR: Failed to upload profile picture"
  exit 1
fi

log_message "✓ Profile picture uploaded successfully!"
log_message "Response: $(cat "$TEMP_RESPONSE" | jq .)"

# Verify the update by fetching profile again
log_message "\nVerifying profile picture update..."
TEMP_RESPONSE="/tmp/profile_pic_updated_profile.json"
if curl_with_retry "${GUIDE_BASE}/profile" "$TEMP_RESPONSE" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "X-Auth-Id: $AUTH_USER_ID" \
  -H "X-Trace-Id: $TRACE_ID"; then
  UPDATED_PROFILE_PICTURE=$(jq -r '.data.profile_picture_url // "None"' "$TEMP_RESPONSE")
  log_message "✓ Updated Profile Picture URL: $UPDATED_PROFILE_PICTURE"
else
  log_message "WARNING: Could not verify updated profile"
fi

log_message "\n==================================================="
log_message "Profile Picture Update Completed Successfully"
log_message "==================================================="
log_message "Guide Phone: ${AREA_CODE}${GUIDE_PHONE}"
log_message "Image Uploaded: ${IMAGE_PATH}"
log_message "==================================================="

# Cleanup
rm -f /tmp/profile_pic_*.json
log_message "\nCleaned up temporary files."
log_message "Log saved to: $LOG_FILE"
