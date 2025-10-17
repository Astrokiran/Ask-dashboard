#!/usr/bin/env python3
"""
Streamlit app for Guide Registration
"""
import streamlit as st
import requests
import json
import uuid
from typing import Optional, List, Dict

# Configuration
BASE_URL = "https://devazstg.astrokiran.com/auth/api/v1"
GUIDE_BASE = f"{BASE_URL}/guide"
AREA_CODE = "+91"
STATIC_OTP = "123456"

def fetch_languages(access_token: str, auth_user_id: str) -> List[Dict]:
    """Fetch available languages from API"""
    try:
        trace_id = str(uuid.uuid4())
        headers = {
            "Authorization": f"Bearer {access_token}",
            "X-Auth-Id": str(auth_user_id),
            "X-Trace-Id": trace_id
        }
        url = f"{GUIDE_BASE}/languages"
        st.info(f"Fetching languages from: {url}")
        response = requests.get(url, headers=headers)
        st.info(f"Languages API Response Status: {response.status_code}")
        response.raise_for_status()
        data = response.json()
        st.success(f"Fetched {len(data.get('languages', []))} languages")
        return data.get("languages", [])
    except Exception as e:
        st.error(f"Failed to fetch languages: {str(e)}")
        if hasattr(e, 'response') and e.response is not None:
            st.error(f"Response: {e.response.text}")
        # Fallback to default languages
        return [
            {"id": 1, "name": "Hindi"},
            {"id": 2, "name": "English"},
            {"id": 3, "name": "Bengali"},
            {"id": 4, "name": "Tamil"},
            {"id": 5, "name": "Telugu"},
            {"id": 6, "name": "Marathi"},
        ]

def fetch_skills(access_token: str, auth_user_id: str) -> List[Dict]:
    """Fetch available skills from API"""
    try:
        trace_id = str(uuid.uuid4())
        headers = {
            "Authorization": f"Bearer {access_token}",
            "X-Auth-Id": str(auth_user_id),
            "X-Trace-Id": trace_id
        }
        url = f"{GUIDE_BASE}/skills"
        st.info(f"Fetching skills from: {url}")
        response = requests.get(url, headers=headers)
        st.info(f"Skills API Response Status: {response.status_code}")
        response.raise_for_status()
        data = response.json()
        st.success(f"Fetched {len(data.get('skills', []))} skills")
        return data.get("skills", [])
    except Exception as e:
        st.error(f"Failed to fetch skills: {str(e)}")
        if hasattr(e, 'response') and e.response is not None:
            st.error(f"Response: {e.response.text}")
        # Fallback to default skills
        return [
            {"id": 1, "name": "Vedic Astrology"},
            {"id": 2, "name": "Tarot Reading"},
            {"id": 3, "name": "Numerology"},
            {"id": 4, "name": "Palmistry"},
            {"id": 5, "name": "Vastu"},
            {"id": 6, "name": "Face Reading"},
        ]

def generate_otp(phone_number: str) -> Optional[str]:
    """Generate OTP for phone number"""
    try:
        payload = {
            "area_code": AREA_CODE,
            "phone_number": phone_number,
            "user_type": "guide",
            "purpose": "login"
        }
        response = requests.post(
            f"{BASE_URL}/auth/otp/generate",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        response.raise_for_status()
        data = response.json()
        return data.get("otp_request_id")
    except Exception as e:
        st.error(f"Failed to generate OTP: {str(e)}")
        return None

def validate_otp(phone_number: str, otp_request_id: str) -> Optional[dict]:
    """Validate OTP and get access token"""
    try:
        payload = {
            "area_code": AREA_CODE,
            "phone_number": phone_number,
            "user_type": "guide",
            "otp_code": STATIC_OTP,
            "request_id": otp_request_id,
            "device_info": {
                "device_type": "mobile",
                "app_version": "0.1.0"
            }
        }
        response = requests.post(
            f"{BASE_URL}/auth/otp/validate",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        response.raise_for_status()
        data = response.json()
        return {
            "access_token": data.get("access_token"),
            "auth_user_id": data.get("auth_user_id")
        }
    except Exception as e:
        st.error(f"Failed to validate OTP: {str(e)}")
        return None

def register_guide(guide_data: dict, access_token: str, auth_user_id: str) -> bool:
    """Register guide with API"""
    try:
        trace_id = str(uuid.uuid4())
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {access_token}",
            "X-Auth-Id": str(auth_user_id),
            "X-Trace-Id": trace_id
        }
        response = requests.post(
            f"{GUIDE_BASE}/register",
            json=guide_data,
            headers=headers
        )
        response.raise_for_status()
        st.success("Guide registered successfully!")
        return True
    except Exception as e:
        st.error(f"Failed to register guide: {str(e)}")
        if hasattr(e, 'response') and e.response is not None:
            st.error(f"Response: {e.response.text}")
        return False

def upload_profile_picture(image_file, access_token: str, auth_user_id: str) -> bool:
    """Upload profile picture"""
    try:
        trace_id = str(uuid.uuid4())
        headers = {
            "Authorization": f"Bearer {access_token}",
            "X-Auth-Id": str(auth_user_id),
            "X-Trace-Id": trace_id
        }
        files = {"image": image_file}
        response = requests.post(
            f"{GUIDE_BASE}/profile-picture",
            files=files,
            headers=headers
        )
        response.raise_for_status()
        st.success("Profile picture uploaded successfully!")
        return True
    except Exception as e:
        st.error(f"Failed to upload profile picture: {str(e)}")
        return False

def submit_kyc(kyc_data: dict, access_token: str, auth_user_id: str) -> bool:
    """Submit KYC documents"""
    try:
        trace_id = str(uuid.uuid4())
        headers = {
            "Authorization": f"Bearer {access_token}",
            "X-Auth-Id": str(auth_user_id),
            "X-Trace-Id": trace_id
        }

        files = {
            "aadhaar_front": kyc_data["aadhaar_front"],
            "aadhaar_back": kyc_data["aadhaar_back"],
            "pan_front": kyc_data["pan_front"],
            "pan_back": kyc_data["pan_back"],
        }

        data = {
            "bank_account": json.dumps(kyc_data["bank_account"])
        }

        response = requests.post(
            f"{GUIDE_BASE}/kyc/submit",
            files=files,
            data=data,
            headers=headers
        )
        response.raise_for_status()
        st.success("KYC submitted successfully!")
        return True
    except Exception as e:
        st.error(f"Failed to submit KYC: {str(e)}")
        return False

def main():
    st.set_page_config(page_title="Guide Registration", page_icon="🔮", layout="wide")

    st.title("🔮 Guide Registration Portal")
    st.markdown("---")

    # Initialize session state
    if 'step' not in st.session_state:
        st.session_state.step = 1
    if 'auth_data' not in st.session_state:
        st.session_state.auth_data = None
    if 'languages_list' not in st.session_state:
        st.session_state.languages_list = []
    if 'skills_list' not in st.session_state:
        st.session_state.skills_list = []

    # Step 1: Phone Number & OTP
    if st.session_state.step == 1:
        st.header("Step 1: Phone Verification")

        col1, col2 = st.columns(2)
        with col1:
            phone_number = st.text_input("Phone Number", placeholder="Enter 10-digit number", max_chars=10)

        if st.button("Generate OTP", type="primary"):
            if len(phone_number) == 10 and phone_number.isdigit():
                otp_request_id = generate_otp(phone_number)
                if otp_request_id:
                    st.success(f"OTP sent! Using OTP: {STATIC_OTP}")
                    # Auto validate OTP
                    auth_data = validate_otp(phone_number, otp_request_id)
                    if auth_data:
                        st.session_state.auth_data = auth_data
                        st.session_state.phone_number = phone_number
                        # Fetch languages and skills after authentication
                        st.session_state.languages_list = fetch_languages(
                            auth_data["access_token"],
                            auth_data["auth_user_id"]
                        )
                        st.session_state.skills_list = fetch_skills(
                            auth_data["access_token"],
                            auth_data["auth_user_id"]
                        )
                        st.session_state.step = 2
                        st.rerun()
            else:
                st.error("Please enter a valid 10-digit phone number")

    # Step 2: Basic Information
    elif st.session_state.step == 2:
        st.header("Step 2: Basic Information")

        col1, col2 = st.columns(2)

        with col1:
            full_name = st.text_input("Full Name*", placeholder="Enter guide's full name")
            email = st.text_input("Email*", placeholder="guide@example.com")
            bio = st.text_area("Bio*", placeholder="Write a brief bio about the guide", height=150)
            years_of_experience = st.number_input("Years of Experience*", min_value=0, max_value=50, value=5)

        with col2:
            # Languages multiselect
            language_names = [lang.get("name", f"Language {lang.get('id')}") for lang in st.session_state.languages_list]
            selected_language_names = st.multiselect(
                "Languages*",
                options=language_names,
                default=[language_names[0]] if language_names else []
            )
            selected_language_ids = [
                lang["id"] for lang in st.session_state.languages_list
                if lang.get("name") in selected_language_names
            ]

            # Skills multiselect
            skill_names = [skill.get("name", f"Skill {skill.get('id')}") for skill in st.session_state.skills_list]
            selected_skill_names = st.multiselect(
                "Skills*",
                options=skill_names,
                default=[skill_names[0]] if skill_names else []
            )
            selected_skill_ids = [
                skill["id"] for skill in st.session_state.skills_list
                if skill.get("name") in selected_skill_names
            ]

        st.subheader("Address Details")
        col1, col2, col3 = st.columns(3)

        with col1:
            address_line1 = st.text_input("Address Line 1*", placeholder="Street address")
            city = st.text_input("City*", placeholder="City")

        with col2:
            state = st.text_input("State*", placeholder="State")
            pincode = st.text_input("Pincode*", placeholder="6-digit pincode", max_chars=6)

        with col3:
            country = st.text_input("Country*", value="India")

        col1, col2 = st.columns(2)
        with col1:
            if st.button("← Back"):
                st.session_state.step = 1
                st.rerun()

        with col2:
            if st.button("Next: Profile Picture →", type="primary"):
                # Validate required fields
                if all([full_name, email, bio, address_line1, city, state, pincode, selected_language_ids, selected_skill_ids]):
                    st.session_state.guide_info = {
                        "full_name": full_name,
                        "phone": st.session_state.phone_number,
                        "email": email,
                        "bio": bio,
                        "address": {
                            "line1": address_line1,
                            "city": city,
                            "state": state,
                            "pincode": pincode,
                            "country": country
                        },
                        "languages": selected_language_ids,
                        "skills": selected_skill_ids,
                        "years_of_experience": years_of_experience
                    }

                    # Register guide
                    if register_guide(
                        st.session_state.guide_info,
                        st.session_state.auth_data["access_token"],
                        st.session_state.auth_data["auth_user_id"]
                    ):
                        st.session_state.step = 3
                        st.rerun()
                else:
                    st.error("Please fill all required fields marked with *")

    # Step 3: Profile Picture
    elif st.session_state.step == 3:
        st.header("Step 3: Profile Picture")

        profile_picture = st.file_uploader(
            "Upload Profile Picture",
            type=["jpg", "jpeg", "png"],
            help="Upload a clear profile picture of the guide"
        )

        if profile_picture:
            st.image(profile_picture, caption="Profile Picture Preview", width=300)

        col1, col2, col3 = st.columns(3)
        with col1:
            if st.button("← Back"):
                st.session_state.step = 2
                st.rerun()

        with col2:
            if profile_picture and st.button("Upload Picture", type="secondary"):
                upload_profile_picture(
                    profile_picture,
                    st.session_state.auth_data["access_token"],
                    st.session_state.auth_data["auth_user_id"]
                )

        with col3:
            if st.button("Next: KYC Documents →", type="primary"):
                st.session_state.step = 4
                st.rerun()

    # Step 4: KYC Documents
    elif st.session_state.step == 4:
        st.header("Step 4: KYC Documents")

        st.subheader("Aadhaar Card")
        col1, col2 = st.columns(2)
        with col1:
            aadhaar_front = st.file_uploader("Aadhaar Front*", type=["jpg", "jpeg", "png"], key="aadhaar_front")
            if aadhaar_front:
                st.image(aadhaar_front, caption="Aadhaar Front", width=200)
        with col2:
            aadhaar_back = st.file_uploader("Aadhaar Back*", type=["jpg", "jpeg", "png"], key="aadhaar_back")
            if aadhaar_back:
                st.image(aadhaar_back, caption="Aadhaar Back", width=200)

        st.subheader("PAN Card")
        col1, col2 = st.columns(2)
        with col1:
            pan_front = st.file_uploader("PAN Front*", type=["jpg", "jpeg", "png"], key="pan_front")
            if pan_front:
                st.image(pan_front, caption="PAN Front", width=200)
        with col2:
            pan_back = st.file_uploader("PAN Back*", type=["jpg", "jpeg", "png"], key="pan_back")
            if pan_back:
                st.image(pan_back, caption="PAN Back", width=200)

        st.subheader("Bank Account Details")
        col1, col2 = st.columns(2)
        with col1:
            holder_name = st.text_input("Account Holder Name*", value=st.session_state.guide_info.get("full_name", ""))
            account_number = st.text_input("Account Number*", placeholder="Enter account number")

        with col2:
            ifsc = st.text_input("IFSC Code*", placeholder="ABCD0123456", max_chars=11)
            bank_name = st.text_input("Bank Name*", placeholder="Bank name")

        branch = st.text_input("Branch Name*", placeholder="Branch name")

        col1, col2 = st.columns(2)
        with col1:
            if st.button("← Back"):
                st.session_state.step = 3
                st.rerun()

        with col2:
            if st.button("Submit KYC", type="primary"):
                if all([aadhaar_front, aadhaar_back, pan_front, pan_back, holder_name, account_number, ifsc, bank_name, branch]):
                    kyc_data = {
                        "aadhaar_front": aadhaar_front,
                        "aadhaar_back": aadhaar_back,
                        "pan_front": pan_front,
                        "pan_back": pan_back,
                        "bank_account": {
                            "holder_name": holder_name,
                            "account_number": account_number,
                            "ifsc": ifsc,
                            "bank_name": bank_name,
                            "branch": branch
                        }
                    }

                    if submit_kyc(
                        kyc_data,
                        st.session_state.auth_data["access_token"],
                        st.session_state.auth_data["auth_user_id"]
                    ):
                        st.session_state.step = 5
                        st.rerun()
                else:
                    st.error("Please fill all required fields and upload all documents")

    # Step 5: Success
    elif st.session_state.step == 5:
        st.success("✅ Guide Registration Completed Successfully!")
        st.balloons()

        st.info(f"""
        **Guide Details:**
        - Name: {st.session_state.guide_info['full_name']}
        - Phone: {st.session_state.phone_number}
        - Email: {st.session_state.guide_info['email']}
        """)

        if st.button("Register Another Guide", type="primary"):
            # Reset session state
            for key in list(st.session_state.keys()):
                del st.session_state[key]
            st.rerun()

if __name__ == "__main__":
    main()
