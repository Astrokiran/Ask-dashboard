// src/auth/authProvider.ts
import { AuthProvider } from 'react-admin';

const AUTH_API_URL = 'https://appdev.astrokiran.com/auth/api/v1/auth';

export const authProvider: AuthProvider = {
    // --- LOGIN ---
     login: async ({ phone, otp, otpRequestId }) => {
        const request = new Request(`${AUTH_API_URL}/otp/validate`, {
            method: 'POST',
            body: JSON.stringify({
                area_code: '+91',
                phone_number: phone,
                user_type: 'admin',
                otp_code: otp,
                request_id: otpRequestId,
                device_info: { device_type: 'web', device_name: 'Admin Panel', platform: 'web' },
            }),
            headers: new Headers({ 'Content-Type': 'application/json' }),
        });

        const response = await fetch(request);
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.details || 'Login failed');
        }

        const data = await response.json();
                // After successful validation, store tokens and user info
        const identity = {
            id: data.auth_user_id,
            fullName: `Admin User`, 
            phone: phone, 
        };

        // Save tokens and the new identity object to localStorage
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        localStorage.setItem('user', JSON.stringify(identity));

        return Promise.resolve();
    },
        getIdentity: () => {
        const user = localStorage.getItem('user');
        if (user) {
            // Return the full user object we saved during login
            return Promise.resolve(JSON.parse(user));
        }
        return Promise.reject();
    },



    // --- LOGOUT ---
    logout: () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        return Promise.resolve();
    },

    checkError: ({ status }) => {
        if (status === 401 || status === 403) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user');
            return Promise.reject(); 
        }
        return Promise.resolve();
    },

    checkAuth: () => {
        return localStorage.getItem('access_token')
            ? Promise.resolve()
            : Promise.reject();
    },

    getPermissions: () => {
        return Promise.resolve(['admin']);
    },

 
};