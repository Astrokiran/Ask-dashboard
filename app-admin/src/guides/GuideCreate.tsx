import { useState } from 'react';
import { useRedirect, Title } from 'react-admin';
import { Card, CardContent, Stepper, Step, StepLabel, Box } from '@mui/material';
import { GuideForm } from './GuideForm';
import { KycUploadForm } from './KycUploadForm';

export const GuideCreate = () => {
    const redirect = useRedirect();
    
    // State to manage the current step and the new guide's data
    const [step, setStep] = useState(0); // 0 = Create Form, 1 = KYC Form
    const [newGuide, setNewGuide] = useState<{ id: number; auth_user_id: number } | null>(null);

    // This is called by GuideForm on successful creation
    const handleCreationSuccess = (response: any) => {
        // The create endpoint now returns the full guide object after creation
        if (response?.id && response?.auth_user_id) {
            setNewGuide({ id: response.id, auth_user_id: response.auth_user_id });
            setStep(1); // Move to the KYC upload step
        } else {
            // Fallback redirect if the response is not as expected
            redirect('/pending-verifications');
        }
    };

    // This is called by KycUploadForm on successful upload
    const handleKycSuccess = () => {
        redirect('/pending-verifications');
    };
    
    const steps = ['Register Guide Details', 'Upload KYC Documents'];

    return (
        <Box>
            <Title title="Create a New Guide" />
            <Card sx={{ maxWidth: '800px', margin: 'auto', mt: 2 }}>
                <CardContent>
                    <Stepper activeStep={step} alternativeLabel sx={{ mb: 4 }}>
                        {steps.map(label => (
                            <Step key={label}>
                                <StepLabel>{label}</StepLabel>
                            </Step>
                        ))}
                    </Stepper>

                    {step === 0 && (
                        <GuideForm onCreationSuccess={handleCreationSuccess} />
                    )}

                    {step === 1 && newGuide && (
                        <KycUploadForm
                            authUserId={newGuide.id}
                            onSuccess={handleKycSuccess} 
                        />
                    )}
                </CardContent>
            </Card>
        </Box>
    );
};