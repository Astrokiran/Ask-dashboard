// srcLoginPage.tsx
import { useState } from 'react';
import { useLogin, useNotify } from 'react-admin';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

// The API endpoint for generating an OTP
const OTP_GENERATE_URL = 'https://askapp.astrokiran.com/api/v1/auth/otp/generate';

export const CustomLoginPage = () => {
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    
    // This state will control the UI flow
    const [otpSent, setOtpSent] = useState(false);
    // This will store the ID needed for the validation step
    const [otpRequestId, setOtpRequestId] = useState('');

    const login = useLogin();
    const notify = useNotify();

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch(OTP_GENERATE_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    area_code: '+91',
                    phone_number: phone,
                    user_type: 'admin',
                    purpose: 'login',
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to send OTP');
            }
            
            notify('OTP sent successfully!', { type: 'success' });
            setOtpRequestId(data.otp_request_id); // Save the request ID
            setOtpSent(true); // Switch to the OTP input view

        } catch (error: any) {
            notify(`Error: ${error.message}`, { type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // We will implement the validation logic in the next step
        // For now, it will call the login hook with the necessary info
        login({ phone, otp, otpRequestId })
            .catch((error: any) => {
                notify(`Error: ${error.message}`, { type: 'error' });
            })
            .finally(() => {
                setLoading(false);
            });
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle>Admin Login</CardTitle>
                    <CardDescription>
                        {otpSent ? 'Enter the OTP sent to your phone.' : 'Enter your phone number to begin.'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={otpSent ? handleLogin : handleSendOtp}>
                        <div className="grid w-full items-center gap-4">
                            <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input 
                                    id="phone" 
                                    type="tel"
                                    placeholder="9876543210"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    disabled={otpSent}
                                    required
                                />
                            </div>

                            {/* This section appears only after the OTP is sent */}
                            {otpSent && (
                                <div className="flex flex-col space-y-1.5">
                                    <Label htmlFor="otp">OTP</Label>
                                    <Input 
                                        id="otp" 
                                        type="text"
                                        placeholder="123456"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        required
                                    />
                                </div>
                            )}
                        </div>

                        <Button className="w-full mt-6" type="submit" disabled={loading}>
                            {loading 
                                ? 'Please wait...'
                                : otpSent ? 'Login' : 'Send OTP'}
                        </Button>
                    </form>
                </CardContent>  
            </Card>
        </div>
    );
};