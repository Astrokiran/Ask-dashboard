import React, { useState, useMemo, Fragment, useEffect } from 'react';
import {
    Datagrid,
    TextField,
    DateField,
    TopToolbar,
    Title,
    FunctionField,
    useNotify,
    useRefresh,
    List,
    Identifier,
    useListContext,
} from 'react-admin';
import { 
    Send, 
    DoneAll, 
    CheckCircle 
} from '@mui/icons-material';
import { Button, Box, Tabs, Tab, Typography, Alert, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { TextField as MuiTextField } from '@mui/material';
import { UploadFile as UploadKycIcon } from '@mui/icons-material';
import { ArrowBack, VerifiedUser, Preview,GppBad } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { httpClient } from '../dataProvider';
import KycDocumentSection from './KycPreview';
import { KycUploadForm } from './KycUploadForm';

const API_URL = process.env.REACT_APP_API_URL;

const formatStatus = (status: string) => {
    return status.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
};

interface KycActionButtonsProps {
    record: any;
    status: string;
    onUploadClick: (authUserId: number) => void;
}

interface OnboardingDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: (pricePerMinute: string, revenueShare: string) => void;
    guideName: string;
}

const OnboardingDialog = ({ open, onClose, onConfirm, guideName }: OnboardingDialogProps) => {
    const [pricePerMinute, setPricePerMinute] = useState('50.00');
    const [revenueShare, setRevenueShare] = useState('20');

    const handleSubmit = () => {
        // Validate inputs
        const price = parseFloat(pricePerMinute);
        const share = parseFloat(revenueShare);

        if (isNaN(price) || price <= 0) {
            alert('Please enter a valid price per minute');
            return;
        }

        if (isNaN(share) || share < 0 || share > 100) {
            alert('Revenue share must be between 0 and 100');
            return;
        }

        onConfirm(pricePerMinute, revenueShare);
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Complete Onboarding - {guideName}</DialogTitle>
            <DialogContent>
                <Box sx={{ pt: 2 }}>
                    <MuiTextField
                        label="Price Per Minute (₹)"
                        type="number"
                        value={pricePerMinute}
                        onChange={(e) => setPricePerMinute(e.target.value)}
                        fullWidth
                        margin="normal"
                        inputProps={{
                            min: "0",
                            step: "0.01"
                        }}
                        helperText="Enter the per-minute consultation rate for this guide"
                    />
                    <MuiTextField
                        label="Admin Revenue Share (%)"
                        type="number"
                        value={revenueShare}
                        onChange={(e) => setRevenueShare(e.target.value)}
                        fullWidth
                        margin="normal"
                        inputProps={{
                            min: "0",
                            max: "100",
                            step: "1"
                        }}
                        helperText="Enter the percentage share for the admin (0-100)"
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleSubmit} variant="contained" color="primary">
                    Complete Onboarding
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export const KycActionButtons = ({ record, status, onUploadClick }: KycActionButtonsProps) => {
    const notify = useNotify();
    const refresh = useRefresh();
    const [isLoading, setIsLoading] = useState(false);
    const [showOnboardingDialog, setShowOnboardingDialog] = useState(false);

    // Handler for complete onboarding with price and share input
    const handleCompleteOnboarding = async (pricePerMinute: string, revenueShare: string) => {
        setIsLoading(true);
        try {
            // Use the correct admin API endpoint for complete onboarding
            const url = `https://askapp.astrokiran.com/api/v1/admin/guides/${record.id}/complete-onboarding`;
            const body = JSON.stringify({
                chat_base_rate_per_minute: pricePerMinute,
                voice_base_rate_per_minute: pricePerMinute,
                video_base_rate_per_minute: pricePerMinute,
                revenue_share: parseInt(revenueShare, 10)
            });

            await httpClient(url, {
                method: 'POST',
                body: body
            });

            notify('Guide onboarded successfully!', { type: 'success' });
            refresh();
        } catch (error: any) {
            notify(`Error completing onboarding: ${error.message}`, { type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    // Generic handler for most actions (Verify, Send Agreement, etc.)
    const handleAction = async (action: 'send-agreement' | 'mark-agreement-signed' | 'kyc/verify' | 'kyc/reject') => {
        setIsLoading(true);

            try {
                const url = `${API_URL}/api/v1/guides/${record.id}/${action}`;
                const method = action.startsWith('kyc/') ? 'PATCH' : 'POST';
                let body;

                switch (action) {
                    case 'kyc/verify':
                        body = JSON.stringify({ status: "verified", notes: "Verified via admin panel" });
                        break;
                    case 'kyc/reject':
                        body = JSON.stringify({ status: "rejected", notes: "Rejected via admin panel" });
                        break;
                }

                const options = {
                    method: method,
                    body: body,
                }


            await httpClient(url, options);
            const successMessage = action.replace(/-/g, ' ').replace('kyc/', '');
            notify(`Action '${successMessage}' completed successfully.`, { type: 'success' });
            refresh();
        } catch (error: any) {
            notify(`Error performing action: ${error.message}`, { type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {/* Button to open the KYC Upload Form */}
            {status === 'KYC_PENDING' && (
                <Button
                    variant="contained"
                    size="small"
                    color="primary"
                    onClick={(e) => {
                        e.stopPropagation();
                        onUploadClick(record.x_auth_id);
                    }}
                    startIcon={<UploadKycIcon />}
                >
                    Upload KYC
                </Button>
            )}

            {/* Button to Verify already uploaded KYC */}
         {status === 'KYC_UPLOADED' && (
                    <>
                        <Button 
                        variant="contained" 
                        size="small" 
                        color="success" 
                        onClick={() => handleAction('kyc/verify')} 
                        disabled={isLoading} 
                        startIcon={<VerifiedUser />}
                        >
                        Verify KYC
                        </Button>
                        <Button
                        variant="contained"
                        size="small"
                        color="error"
                        onClick={() => handleAction('kyc/reject')}
                        disabled={isLoading}
                        startIcon={<GppBad />} 
                        >
                        Reject KYC
                        </Button>
                    </>
                    )}

            {status === 'KYC_VERIFIED' && (
                <Button 
                    variant="outlined" 
                    size="small" 
                    onClick={() => handleAction('send-agreement')} 
                    disabled={isLoading} 
                    startIcon={<Send />}
                >
                    Send Agreement
                </Button>
            )}

            {status==='KYC_FAILED' && (

                <Button
                  variant='outlined'
                  size='small'
                //   onClick={() => handleAction('kyc/verify')}
                  startIcon={<GppBad />}
                >
                  
                </Button>
            )}

            {/* Button to Mark Agreement as Signed */}
            {status === 'AGREEMENT_SENT' && (
                <Button 
                    variant="outlined" 
                    size="small" 
                    onClick={() => handleAction('mark-agreement-signed')} 
                    disabled={isLoading} 
                    startIcon={<DoneAll />}
                >
                    Mark as Signed
                </Button>
            )}

            {/* Button to Complete Onboarding */}
            {status === 'AGREEMENT_SIGNED' && (
                <Button
                    variant="contained"
                    size="small"
                    color="primary"
                    onClick={() => setShowOnboardingDialog(true)}
                    disabled={isLoading}
                    startIcon={<CheckCircle />}
                >
                    Onboard Guide
                </Button>
            )}

            {/* Onboarding Dialog */}
            <OnboardingDialog
                open={showOnboardingDialog}
                onClose={() => setShowOnboardingDialog(false)}
                onConfirm={handleCompleteOnboarding}
                guideName={record.full_name || `Guide #${record.id}`}
            />
        </Box>
    );
};
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

const KycPendingView = () => {
    const { data, isLoading, error } = useListContext();
    const [currentTab, setCurrentTab] = useState(0);
    const [selectedGuideId, setSelectedGuideId] = useState<Identifier | null>(null);
    const [uploadFormGuideId, setUploadFormGuideId] = useState<Identifier | null>(null);

    const groupedData = useMemo(() => {
        if (!data) return {};
        return data.reduce((acc, guide) => {
            const status = guide.status || 'UNKNOWN';
            if (!acc[status]) {
                acc[status] = [];
            }
            acc[status].push(guide);
            return acc;
        }, {} as Record<string, any[]>);
    }, [data]);

    const statusKeys = useMemo(() => Object.keys(groupedData), [groupedData]);
    const activeStatus = statusKeys[currentTab];
    const activeData = groupedData[activeStatus] || [];

    // Reset tab if current tab index is out of bounds after data changes
    useEffect(() => {
        if (statusKeys.length === 0) {
            // No tabs available, set to 0
            setCurrentTab(0);
        } else if (currentTab >= statusKeys.length) {
            // Current tab is out of bounds, reset to first tab
            setCurrentTab(0);
        } else if (currentTab < 0) {
            // Current tab is negative, reset to first tab
            setCurrentTab(0);
        }
    }, [statusKeys, currentTab]);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setCurrentTab(newValue);
        setSelectedGuideId(null);
        setUploadFormGuideId(null);
    };
    
    const handlePreviewClick = (guideId: Identifier) => {
        setSelectedGuideId(prevId => (prevId === guideId ? null : guideId));
        setUploadFormGuideId(null); 
    };

    const handleUploadClick = (authUserId: number) => {
        setUploadFormGuideId(prevId => (prevId === authUserId ? null : authUserId));
        setSelectedGuideId(null);
    };

    if (isLoading) return null;
    if (error) {
        return <Alert severity="error">Could not load guide data.</Alert>;
    }

    return (
        <Fragment>
            <Box sx={{ width: '100%', mt: 2 }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={currentTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
                        {statusKeys.map((status) => (
                            <Tab key={status} label={`${formatStatus(status)} (${groupedData[status]?.length || 0})`} />
                        ))}
                    </Tabs>
                </Box>
                
                {activeStatus && (
                    <Box mt={3}>
                        <Datagrid data={activeData} bulkActionButtons={<></>}>
                            <TextField source="id" label="Guide ID" />

                            <TextField source="x_auth_id" label="Auth ID" />
                            <TextField source="full_name" />
                            <TextField source="phone_number" />
                            <DateField source="created_at" label="Registered On" showTime />
                            {/* <FunctionField
                                label="KYC Preview"
                                render={(record: any) => (
                                    <Button variant="outlined" color="secondary" size="small" startIcon={<Preview />} onClick={(e) => { e.stopPropagation(); handlePreviewClick(record.id); }}>
                                        {selectedGuideId === record.id ? 'Hide Docs' : 'Show Docs'}
                                    </Button>
                                )}
                            /> */}
                            <FunctionField
                                label="Actions"
                                render={(record: any) => <KycActionButtons record={record} status={activeStatus} onUploadClick={handleUploadClick} />}
                            />
                        </Datagrid>
                    </Box>
                )}
            </Box>

            {uploadFormGuideId && (
                <KycUploadForm
                    authUserId={uploadFormGuideId as number}
                    onSuccess={() => setUploadFormGuideId(null)}
                />
            )}

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

export const KycPendingList = () => (
    <List
        resource="pending-verifications"
        actions={<KycPendingListActions />}
        pagination={false}
        sort={{ field: 'created_at', order: 'DESC' }}
        perPage={1000}
    >
        <KycPendingView />
    </List>
);