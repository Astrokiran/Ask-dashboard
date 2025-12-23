import React, { useState } from 'react';
import { useNotify, useRefresh } from 'react-admin';
import {
  Box, Button, TextField, Typography, CircularProgress, Card, CardContent, CardHeader, Alert
} from '@mui/material';
import { UploadFile } from '@mui/icons-material';

const API_URL = process.env.REACT_APP_API_URL;

interface KycUploadFormProps {
    authUserId: number;
    onSuccess: () => void;
}

export const KycUploadForm = ({ authUserId, onSuccess }: KycUploadFormProps) => {
  const notify = useNotify();
  const refresh = useRefresh();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [bankDetails, setBankDetails] = useState({
    holder_name: '', account_number: '', ifsc: '', bank_name: '', branch: '',
  });
  const [files, setFiles] = useState<{ [key: string]: File | null }>({
    aadhaar_front: null, aadhaar_back: null, pan_front: null, pan_back: null,
  });

  const handleBankInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBankDetails({ ...bankDetails, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles({ ...files, [e.target.name]: e.target.files[0] });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const auth = JSON.parse(localStorage.getItem('auth') || '{}');
    const token = auth.token;
    const internalApiKey = 'dummy_service_secret';

    // if (!token) {
    //     setError('Authentication token not found. Please log in again.');
    //     setIsLoading(false);
    //     return;
    // }

    const headers = new Headers();
    headers.append('Authorization', `Bearer ${token}`);
    headers.append('X-Internal-API-Key', internalApiKey);

    const formData = new FormData();
    formData.append('bank_account', JSON.stringify(bankDetails));
    Object.entries(files).forEach(([key, value]) => {
      if (value) { formData.append(key, value); }
    });

    fetch(`${API_URL}/api/v1/guides/${authUserId}/kyc/submit`, {
        method: 'POST',
        headers: headers,
        body: formData,
    })
    .then(response => {
        if (!response.ok) { return response.json().then(err => Promise.reject(err)); }
        return response.json();
    })
    .then(() => {
        notify('KYC documents submitted successfully!', { type: 'success' });
        refresh();
        onSuccess();
    })
    .catch(err => {
        const errorMessage = err.detail?.[0]?.msg || err.detail || 'KYC submission failed.';
        setError(errorMessage);
        notify(errorMessage, { type: 'error' });
    })
    .finally(() => {
        setIsLoading(false);
    });
  };

  return (
    <Card sx={{ mt: 4, mb: 4 }}>
      <CardHeader title={`Upload KYC for Guide (Auth User ID: ${authUserId})`} />
      <CardContent>
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Typography variant="h6">Bank Account Details</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ flex: '1 1 45%', minWidth: '200px' }}>
                <TextField name="holder_name" label="Account Holder Name" onChange={handleBankInputChange} fullWidth required />
              </Box>
              <Box sx={{ flex: '1 1 45%', minWidth: '200px' }}>
                <TextField name="account_number" label="Account Number" onChange={handleBankInputChange} fullWidth required />
              </Box>
              <Box sx={{ flex: '1 1 45%', minWidth: '200px' }}>
                <TextField name="ifsc" label="IFSC Code" onChange={handleBankInputChange} fullWidth required />
              </Box>
              <Box sx={{ flex: '1 1 45%', minWidth: '200px' }}>
                <TextField name="bank_name" label="Bank Name" onChange={handleBankInputChange} fullWidth required />
              </Box>
            </Box>
            <Typography variant="h6">KYC Documents</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ flex: '1 1 45%', minWidth: '200px' }}>
                    <Button variant="contained" component="label" fullWidth>
                        Aadhaar Front <input type="file" name="aadhaar_front" hidden onChange={handleFileChange} />
                    </Button>
                    {files.aadhaar_front && <Typography variant="body2" sx={{mt: 1}}>{files.aadhaar_front.name}</Typography>}
                </Box>
                <Box sx={{ flex: '1 1 45%', minWidth: '200px' }}>
                    <Button variant="contained" component="label" fullWidth>
                        Aadhaar Back <input type="file" name="aadhaar_back" hidden onChange={handleFileChange} />
                    </Button>
                    {files.aadhaar_back && <Typography variant="body2" sx={{mt: 1}}>{files.aadhaar_back.name}</Typography>}
                </Box>
                <Box sx={{ flex: '1 1 45%', minWidth: '200px' }}>
                    <Button variant="contained" component="label" fullWidth>
                        PAN Front <input type="file" name="pan_front" hidden onChange={handleFileChange} />
                    </Button>
                    {files.pan_front && <Typography variant="body2" sx={{mt: 1}}>{files.pan_front.name}</Typography>}
                </Box>
                <Box sx={{ flex: '1 1 45%', minWidth: '200px' }}>
                    <Button variant="contained" component="label" fullWidth>
                        PAN Back <input type="file" name="pan_back" hidden onChange={handleFileChange} />
                    </Button>
                    {files.pan_back && <Typography variant="body2" sx={{mt: 1}}>{files.pan_back.name}</Typography>}
                </Box>
            </Box>
            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
              <Button onClick={onSuccess} disabled={isLoading}>Cancel</Button>
              <Button type="submit" variant="contained" color="primary" disabled={isLoading} startIcon={isLoading ? <CircularProgress size={20} /> : <UploadFile />}>
                Submit KYC
              </Button>
            </Box>
          </Box>
        </form>
      </CardContent>
    </Card>
  );
};