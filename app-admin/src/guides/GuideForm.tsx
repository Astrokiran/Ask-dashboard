import { useState } from 'react';
import { SimpleForm, Toolbar, SaveButton, useNotify } from 'react-admin';
import { useFormContext } from 'react-hook-form'; // Correct import
import { ArrowRight } from 'lucide-react';

import { GuideProfileForm } from './GuideProfileForm';
import { GuideAddressForm } from './GuideAddressForm';

const FormFields = ({ setLoading, setOtpVerified }: any) => {
    const notify = useNotify();
    const { getValues } = useFormContext(); // This is now safe

    const [otpSent, setOtpSent] = useState(false);
    const [otpRequestId, setOtpRequestId] = useState('');

    
    return (
        <div className="flex flex-col gap-8 w-full">
            <GuideProfileForm
                skillChoices={[
                    { id: 11, name: 'Vedic Astrology' },
                    { id: 12, name: 'Tarot Reading' },
                ]}
                languageChoices={[
                    { id: 11, name: 'English' },
                    { id: 12, name: 'Hindi' },
                ]}
                otpSent={otpSent}
            />
            <GuideAddressForm />
        </div>
    );
};


export const GuideForm = () => {
    const [loading, setLoading] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);

    return (
        <SimpleForm
            toolbar={
                <Toolbar>
                    <SaveButton
                        label="Register & Continue"
                        icon={<ArrowRight className="ml-2 h-4 w-12" />}
                        disabled={!otpVerified || loading}
                    />
                </Toolbar>
            }
        >
            <FormFields setLoading={setLoading} setOtpVerified={setOtpVerified} />
        </SimpleForm>
    );
};