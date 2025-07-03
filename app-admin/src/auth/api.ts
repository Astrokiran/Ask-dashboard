interface RequestOtpResponse {
    message: string;
}

interface VerifyOtpResponse {
    token: string;
}

export const api = {
    requestOtp: async (email: string): Promise<RequestOtpResponse> => {
        console.log(`[Fake API] Requesting OTP for: ${email}`);
        await new Promise(res => setTimeout(res, 1000));

        if (!email || !email.includes('@')) {
            console.error('[Fake API] Invalid email format.');
            return Promise.reject({ message: 'Please enter a valid email address.' });
        }
        
        console.log(`[Fake API] The OTP for ${email} is: 123456 (for demo purposes)`);
        return Promise.resolve({ message: `An OTP has been sent to ${email}` });
    },

    verifyOtp: async (email: string, otp: string): Promise<VerifyOtpResponse> => {
        console.log(`[Fake API] Verifying OTP for: ${email} with OTP: ${otp}`);
        await new Promise(res => setTimeout(res, 1000));

        if (otp === '123456') {
            console.log('[Fake API] OTP verified successfully.');
            const fakeJwtToken = `fake-jwt-token-for-${email}-${Date.now()}`;
            return Promise.resolve({ token: fakeJwtToken });
        } else {
            console.error('[Fake API] Invalid OTP.');
            return Promise.reject({ message: 'Invalid OTP. Please try again.' });
        }
    }
};
