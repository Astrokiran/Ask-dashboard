import { AuthProvider, fetchUtils } from 'react-admin';

const AUTH_API_URL = 'https://askapp.astrokiran.com/api/v1/auth';

/**
 * A function that refreshes the access token using the refresh token.
 * This is called by the httpClient when a 401 error is received.
 */
const refreshToken = async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
        throw new Error('No refresh token found');
    }

    const request = new Request(`${AUTH_API_URL}/refresh`, {
        method: 'POST',
        body: JSON.stringify({ refresh_token: refreshToken }),
        headers: new Headers({ 'Content-Type': 'application/json' }),
    });

    const response = await fetch(request);
    if (!response.ok) {
        throw new Error('Failed to refresh token');
    }

    const data = await response.json();
    localStorage.setItem('access_token', data.access_token);
    // Some services rotate refresh tokens; update if a new one is provided.
    if (data.refresh_token) {
        localStorage.setItem('refresh_token', data.refresh_token);
    }

    return data.access_token;
};

export const httpClient = async (url: string, options: fetchUtils.Options = {}) => {
    if (!options.headers) {
        options.headers = new Headers({ Accept: 'application/json' });
    }
    const token = localStorage.getItem('access_token');
    (options.headers as Headers).set('Authorization', `Bearer ${token}`);

    try {
        // First, try the request with the current token
        return await fetchUtils.fetchJson(url, options);
    } catch (error: any) {
        // If the request fails with a 401 status, it means the token expired
        if (error.status === 401) {
            try {
                // Attempt to get a new token
                const newAccessToken = await refreshToken();
                // Update the header with the new token
                (options.headers as Headers).set('Authorization', `Bearer ${newAccessToken}`);
                // Retry the original request with the new token
                return await fetchUtils.fetchJson(url, options);
            } catch (refreshError) {
                // If refreshing the token fails, then log the user out
                localStorage.clear();
                // We re-throw the original error to trigger the checkError logic
                throw error;
            }
        }
        // If the error is not 401, just re-throw it
        throw error;
    }
};

export const authProvider: AuthProvider = {
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
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        const userToStore = {
            id: data.auth_user_id,
            fullName: 'Admin User',
            phone_number: phone, 
            status: 'Verified' 
        };
        localStorage.setItem('user', JSON.stringify(userToStore));
                return Promise.resolve();
    },

    logout: () => {
        localStorage.clear();
        return Promise.resolve();
    },

    checkError: (error) => {
        const status = error.status;
        if (status === 401 || status === 403) {
            localStorage.clear();
            return Promise.reject(); // This will redirect to the login page
        }
        return Promise.resolve();
    },

    checkAuth: () => {
        return localStorage.getItem('access_token') ? Promise.resolve() : Promise.reject();
    },

    getIdentity: () => {
        try {
            const user = localStorage.getItem('user');
            return user ? Promise.resolve(JSON.parse(user)) : Promise.reject();
        } catch (error) {
            return Promise.reject(error);
        }
    },

    getPermissions: () => Promise.resolve(['admin']),
};