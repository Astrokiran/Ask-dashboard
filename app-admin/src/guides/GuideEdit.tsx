// src/guides/GuideEdit.tsx
import { Edit, TabbedForm, FormTab, TextInput } from 'react-admin';
import { GuideForm } from './GuideForm'; // We will reuse the main form

export const GuideEdit = () => (
  // Add the sx prop to make the form wider
  <Edit sx={{ maxWidth: '800px', margin: 'auto' }}>
    <TabbedForm>
        <FormTab label="Guide Profile">
            {/* The first tab reuses our existing GuideForm */}
            <GuideForm />
        </FormTab>
        <FormTab label="KYC Verification">
            {/* This is the new tab for KYC documents */}
            <div className="p-4">
                <h3 className="text-xl font-bold mb-4">Verify Documents</h3>
                <p className="mb-4">Review the uploaded documents and update the verification status.</p>
                {/* We can use the verificationStatus field from the GuideForm here */}
                <TextInput source="verificationStatus" fullWidth helperText="Change status to Verified or Rejected" />
            </div>
        </FormTab>
    </TabbedForm>
  </Edit>
);