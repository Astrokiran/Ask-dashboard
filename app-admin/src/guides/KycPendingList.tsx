import React, { useState, useEffect, useMemo, Fragment } from 'react';
import {
    Datagrid,
    TextField,
    DateField,
    TopToolbar,
    Title,
    FunctionField,
    useNotify,
    useRefresh,
    Identifier,
} from 'react-admin';
import { Button, Box, Tabs, Tab, Typography, CircularProgress, Alert } from '@mui/material';
import { ArrowBack, VerifiedUser, Preview } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { httpClient } from '../dataProvider';
import KycDocumentSection from './KycPreview'; // Ensure this path is correct

const API_URL = 'https://appdev.astrokiran.com/auth/api/v1/admin/guides';

const formatStatus = (status: string) => {
    return status
        .toLowerCase()
        .replace(/_/g, ' ')
        .replace(/\b\w/g, char => char.toUpperCase());
};

const KycActionButtons = ({ record, status }: { record: any; status: string }) => {
    const notify = useNotify();
    const refresh = useRefresh();
    const [isLoading, setIsLoading] = useState(false);

   const handlePostAction = async (action: 'send-agreement' | 'mark-agreement-signed' | 'complete-onboarding') => {
        setIsLoading(true);
        try {
            const options: RequestInit = { method: 'POST' };

            if (action === 'complete-onboarding') {
                const payload = {
                    base_rate_per_minutes: 50
                };
                options.body = JSON.stringify(payload);
                options.headers = new Headers({ 'Content-Type': 'application/json' });
            }

            await httpClient(`${API_URL}/${record.id}/${action}`, options);

            const successMessage = action.replace(/-/g, ' ');
            notify(`Action '${successMessage}' completed successfully.`, { type: 'success' });
            refresh();
        } catch (error: any) {
            notify(`Error: ${error.message}`, { type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleKycVerify = async () => {
        setIsLoading(true);
        try {
            await httpClient(`${API_URL}/${record.id}/kyc/verify`, {
                method: 'PATCH',
                body: JSON.stringify({ is_verified: true }),
            });
            notify(`KYC for ${record.full_name} has been verified.`, { type: 'success' });
            refresh();
        } catch (error: any) {
            notify(`Error verifying KYC: ${error.message}`, { type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {status === 'KYC_UPLOADED' && (
                <Button
                    variant="contained"
                    size="small"
                    color="success"
                    onClick={handleKycVerify}
                    disabled={isLoading}
                    startIcon={<VerifiedUser />}
                >
                    Verify KYC
                </Button>
            )}
            {status === 'KYC_VERIFIED' && (
                <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handlePostAction('send-agreement')}
                    disabled={isLoading}
                >
                    Send Agreement
                </Button>
            )}
            {status === 'AGREEMENT_SENT' && (
                 <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handlePostAction('mark-agreement-signed')}
                    disabled={isLoading}
                >
                    Mark as Signed
                </Button>
            )}
            {status === 'AGREEMENT_SIGNED' && (
                <Button
                    variant="contained"
                    size="small"
                    color="primary"
                    onClick={() => handlePostAction('complete-onboarding')}
                    disabled={isLoading}
                >
                    Onboard Guide
                </Button>
            )}
        </Box>
    );
};


// --- KycPendingListActions Component (No Changes) ---
const KycPendingListActions = () => {
    const navigate = useNavigate();
    return (
        <TopToolbar>
            <Title title="Guides Pending Onboarding" />
            <Button onClick={() => navigate('/guides')} startIcon={<ArrowBack />} sx={{ ml: 'auto' }}>
                Back to All Guides
            </Button>
        </TopToolbar>
    );
};

// --- KycPendingList Component (MODIFIED with Tabs) ---
export const KycPendingList = () => {
    const [data, setData] = useState<Record<string, any[]> | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [selectedGuideId, setSelectedGuideId] = useState<Identifier | null>(null);
    const [currentTab, setCurrentTab] = useState(0); // State for active tab index
    const notify = useNotify();

    useEffect(() => {
        httpClient(`${API_URL}/pending-verifications`)
            .then(({ json }) => {
                if (json.data && typeof json.data === 'object') {
                    setData(json.data);
                } else {
                    throw new Error("Invalid data format received from API.");
                }
            })
            .catch((e: any) => {
                setError(e);
                notify(`Error fetching guides: ${e.message}`, { type: 'error' });
            })
            .finally(() => {
                setLoading(false);
            });
    }, [httpClient, notify]);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setCurrentTab(newValue);
    };

    const handlePreviewClick = (guideId: Identifier) => {
        setSelectedGuideId(prevId => (prevId === guideId ? null : guideId));
    };
    
    // Memoize status keys to prevent recalculation on re-renders
    const statusKeys = useMemo(() => (data ? Object.keys(data) : []), [data]);
    const activeStatus = statusKeys[currentTab];

    if (loading) {
        return <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>;
    }

    if (error) {
        return <Alert severity="error">Could not load guide data. Please try again later.</Alert>;
    }

    return (
        <Fragment>
            <KycPendingListActions />
            <Box sx={{ width: '100%', mt: 2 }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={currentTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
                        {statusKeys.map((status) => (
                            <Tab
                                key={status}
                                label={`${formatStatus(status)} (${data?.[status]?.length || 0})`}
                            />
                        ))}
                    </Tabs>
                </Box>
                
                {activeStatus && data?.[activeStatus] && (
                     <Box mt={3}>
                        <Datagrid
                            data={data[activeStatus]}
                            bulkActionButtons={false}
                        >
                            <TextField source="id" label="Guide ID" />
                            <TextField source="full_name" />
                            <TextField source="phone_number" />
                            <DateField source="created_at" label="Registered On" showTime />
                            <FunctionField
                                label="KYC Preview"
                                render={(record: any) => (
                                    <Button
                                        variant="outlined"
                                        color="secondary"
                                        size="small"
                                        startIcon={<Preview />}
                                        onClick={() => handlePreviewClick(record.id)}
                                    >
                                        {selectedGuideId === record.id ? 'Hide Docs' : 'Show Docs'}
                                    </Button>
                                )}
                            />
                            <FunctionField
                                label="Actions"
                                render={(record: any) => <KycActionButtons record={record} status={activeStatus} />}
                            />
                        </Datagrid>
                    </Box>
                )}
            </Box>

            {selectedGuideId && (
                <Box mt={4} border={1} borderColor="divider" p={2} borderRadius={1}>
                    <Typography variant="h6" gutterBottom>
                        KYC Documents for Guide #{selectedGuideId}
                    </Typography>
                    <KycDocumentSection guideId={selectedGuideId} />
                </Box>
            )}
        </Fragment>
    );
};