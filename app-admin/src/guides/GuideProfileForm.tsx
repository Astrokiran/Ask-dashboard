import { TextInput, CheckboxGroupInput } from 'react-admin';
import { Button } from '@mui/material';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

// Define the props the component will receive
interface GuideProfileFormProps {
    skillChoices: { id: number; name: string }[];
    languageChoices: { id: number; name: string }[];
    otpSent: boolean;
}

export const GuideProfileForm = ({
    skillChoices,
    languageChoices,
    otpSent,
}: GuideProfileFormProps) => {
    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Guide Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <TextInput source="name" label="Full Name" fullWidth required />
                <TextInput source="experience" label="Years of Experience" fullWidth required />
                <TextInput source="email" label="Email Address" type="email" fullWidth required />

                {/* --- Phone and OTP Verification Section --- */}
                <div className="border p-4 rounded-md space-y-4">
                    <p className="font-semibold">Phone Verification</p>
                    <TextInput
                        source="phone"
                        label="Phone Number"
                        fullWidth
                        required
                    />

                    {otpSent && (
                         <TextInput source="otp_input" label="Enter OTP" fullWidth required />
                    )}

                   
                </div>

                <CheckboxGroupInput source="skill_ids" label="Skills" choices={skillChoices} required />
                <CheckboxGroupInput source="language_ids" label="Languages" choices={languageChoices} required />
            </CardContent>
        </Card>
    );
};