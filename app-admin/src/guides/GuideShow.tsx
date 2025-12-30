import { useState, useEffect } from 'react';
import {
    Show,
    useRecordContext,
    useNotify,
    useUpdate,
    useRefresh,
    TopToolbar,
    Title,
    Identifier,
    EditButton,
} from 'react-admin';
import { Link } from 'react-router-dom';
import { UserX } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { httpClient } from '../dataProvider';
import {
    CircularProgress,
    Box,
    Switch,
    FormControlLabel,
    Card,
    CardContent,
    Typography,
    Button,
    Chip,
    Avatar,
    Divider,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    DialogContentText,
    TextField,
    Alert,
    AlertTitle,
} from '@mui/material';
import { styled } from '@mui/material/styles';


const API_URL = process.env.REACT_APP_API_URL;

// --- Reusable UI Components ---

const DocumentImage = ({ label, src }: { label: string, src?: string }) => (
    <Box sx={{ textAlign: 'center' }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            {label}
        </Typography>
        <img
            src={src || 'https://placeholder.co/300x200?text=No+Image'}
            alt={label}
            style={{
                borderRadius: '8px',
                border: '2px dashed',
                borderColor: 'divider',
                width: '100%',
                objectFit: 'contain',
            }}
        />
    </Box>
);

const maskAccountNumber = (accNum: string): string => {
    if (accNum && accNum.length > 4) {
        return `****${accNum.slice(-4)}`;
    }
    return '****';
};

const DetailItem = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <Box>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
            {label}
        </Typography>
        <Typography variant="body1" sx={{ fontWeight: 500 }}>
            {children || '-'}
        </Typography>
    </Box>
);

// --- Guide Stats Section ---
const GuideStatsSection = () => {
    const record = useRecordContext();

    if (!record || !record.guide_stats) {
        return null;
    }

    const stats = record.guide_stats;

    return (
        <Card sx={{ mb: 3 }}>
            <Box sx={{ p: 3, pb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Guide Statistics
                </Typography>
                <Typography variant="body2" color="textSecondary">
                    Performance metrics and consultation history
                </Typography>
            </Box>
            <Divider />
            <CardContent>
                <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                    <Box sx={{ flex: "1 1 200px", minWidth: "150px" }}>
                        <DetailItem label="Total Consultations">
                            <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                {stats.total_number_of_completed_consultations || 0}
                            </Typography>
                        </DetailItem>
                    </Box>
                    <Box sx={{ flex: "1 1 200px", minWidth: "150px" }}>
                        <DetailItem label="Average Rating">
                            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#ff9800' }}>
                                {stats.rating ? `${stats.rating} ⭐` : 'N/A'}
                            </Typography>
                        </DetailItem>
                    </Box>
                    <Box sx={{ flex: "1 1 200px", minWidth: "150px" }}>
                        <DetailItem label="Total Reviews">
                            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                                {stats.total_number_of_reviews || 0}
                            </Typography>
                        </DetailItem>
                    </Box>
                    <Box sx={{ flex: "1 1 200px", minWidth: "150px" }}>
                        <DetailItem label="Total Minutes">
                            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#2196f3' }}>
                                {stats.total_consultation_minutes || 0}
                            </Typography>
                        </DetailItem>
                    </Box>
                </Box>

                <Box sx={{ mt: 4, pt: 3 }}>
                    <Divider sx={{ mb: 3 }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                        Consultation Breakdown
                    </Typography>
                    <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                        <Box sx={{ flex: "1 1 300px", minWidth: "250px" }}>
                            <Typography variant="body2" color="textSecondary" sx={{ mb: 2, fontWeight: 500 }}>
                                Chat Consultations
                            </Typography>
                            <DetailItem label="Total Sessions">{stats.total_number_of_chat_consultations || 0}</DetailItem>
                            <DetailItem label="Total Minutes">{stats.total_chat_minutes || 0}</DetailItem>
                            <DetailItem label="Avg Length">{stats.average_consultation_length_chat || 0} min</DetailItem>
                        </Box>
                        <Box sx={{ flex: "1 1 300px", minWidth: "250px" }}>
                            <Typography variant="body2" color="textSecondary" sx={{ mb: 2, fontWeight: 500 }}>
                                Voice Consultations
                            </Typography>
                            <DetailItem label="Total Sessions">{stats.total_number_of_voice_consultations || 0}</DetailItem>
                            <DetailItem label="Total Minutes">{stats.total_voice_minutes || 0}</DetailItem>
                            <DetailItem label="Avg Length">{stats.average_consultation_length_voice || 0} min</DetailItem>
                        </Box>
                        <Box sx={{ flex: "1 1 300px", minWidth: "250px" }}>
                            <Typography variant="body2" color="textSecondary" sx={{ mb: 2, fontWeight: 500 }}>
                                Video Consultations
                            </Typography>
                            <DetailItem label="Total Sessions">{stats.total_number_of_video_consultations || 0}</DetailItem>
                            <DetailItem label="Total Minutes">{stats.total_video_minutes || 0}</DetailItem>
                            <DetailItem label="Avg Length">{stats.average_consultation_length_video || 0} min</DetailItem>
                        </Box>
                    </Box>
                </Box>

                <Box sx={{ mt: 4, pt: 3 }}>
                    <Divider sx={{ mb: 3 }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                        Quick Connect
                    </Typography>
                    <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                        <Box sx={{ flex: "1 1 200px", minWidth: "150px" }}>
                            <DetailItem label="Quick Connect Sessions">{stats.total_quick_connect_consultations || 0}</DetailItem>
                        </Box>
                        <Box sx={{ flex: "1 1 200px", minWidth: "150px" }}>
                            <DetailItem label="Quick Connect Minutes">{stats.total_quick_connect_consultation_minutes || 0}</DetailItem>
                        </Box>
                    </Box>
                </Box>

                {stats.average_consultation_length > 0 && (
                    <Box sx={{ mt: 4, pt: 3 }}>
                        <Divider sx={{ mb: 3 }} />
                        <DetailItem label="Overall Average Consultation Length">
                            <Typography sx={{ fontSize: '1.125rem', fontWeight: 600, color: '#4caf50' }}>
                                {stats.average_consultation_length} minutes
                            </Typography>
                        </DetailItem>
                    </Box>
                )}
            </CardContent>
        </Card>
    );
};

// --- KYC Document Section (Displays Images Only) ---

const KycDocumentSection = ({ guideId }: { guideId: Identifier }) => {
    const [documents, setDocuments] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const notify = useNotify();

    useEffect(() => {
        if (!guideId) return;
        const fetchDocs = async () => {
            setLoading(true);
            try {
                // --- UPDATED: Correct API endpoint for KYC docs ---
                const { json } = await httpClient(`${API_URL}/api/v1/guides/kyc-documents/${guideId}`);
                // This section can be built out when the KYC API is ready
                setDocuments(json.data || {});
            } catch (error: any) {
                // It's okay if this fails for now, we just show an empty section
                console.error(`Could not fetch KYC docs: ${error.message}`);
            } finally {
                setLoading(false);
            }
        };
        fetchDocs();
    }, [guideId, notify]);

    if (loading) {
        return <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>;
    }

    return (
        <Card sx={{ mb: 3 }}>
            <Box sx={{ p: 3, pb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    KYC Documents
                </Typography>
            </Box>
            <Divider />
            <CardContent>
                <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                    <Box sx={{ flex: "1 1 200px", minWidth: "150px" }}>
                        <DocumentImage label="Aadhaar (Front)" src={documents.aadhaar?.front?.src} />
                    </Box>
                    <Box sx={{ flex: "1 1 200px", minWidth: "150px" }}>
                        <DocumentImage label="Aadhaar (Back)" src={documents.aadhaar?.back?.src} />
                    </Box>
                    <Box sx={{ flex: "1 1 200px", minWidth: "150px" }}>
                        <DocumentImage label="PAN (Front)" src={documents.pan?.front?.src} />
                    </Box>
                    <Box sx={{ flex: "1 1 200px", minWidth: "150px" }}>
                        <DocumentImage label="PAN (Back)" src={documents.pan?.back?.src} />
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
};

const OffboardGuideButton = () => {
    const record = useRecordContext();
    const notify = useNotify();
    const refresh = useRefresh();
    const navigate = useNavigate();

    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [isOffboarding, setIsOffboarding] = useState(false);

    if (!record) return null;

    const handleOffboard = async () => {
        setIsOffboarding(true);
        try {
            await httpClient(`${API_URL}/api/v1/guides/${record.id}/offboard`, {
                method: 'POST',
            });
            notify('Guide offboarded successfully!', { type: 'success' });
            setIsOpen(false);
            refresh(); // Refresh the current view to show the new status
            navigate('/guides'); // Optional: redirect back to the list after offboarding
        } catch (error: any) {
            const errorMessage = error.body?.message || error.message || 'An unknown error occurred.';
            notify(`Error: ${errorMessage}`, { type: 'error' });
        } finally {
            setIsOffboarding(false);
        }
    };

    const isConfirmationValid = inputValue === 'OFFBOARD';

    return (
        <>
            <Button
                variant="contained"
                color="error"
                size="small"
                startIcon={<UserX />}
                onClick={() => setIsOpen(true)}
            >
                Offboard Guide
            </Button>
            <Dialog open={isOpen} onClose={() => setIsOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Offboard Guide</DialogTitle>
                <DialogContent>
                    <Alert severity="warning" sx={{ mb: 2 }}>
                        <AlertTitle>Are you absolutely sure?</AlertTitle>
                        This will offboard the guide and change their status. This action can be undone, but will require manual state changes.
                        To confirm, please type <strong>OFFBOARD</strong> in the box below.
                    </Alert>
                    <Box sx={{ mt: 2 }}>
                        <TextField
                            fullWidth
                            label="Confirmation"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Type OFFBOARD to confirm"
                            autoFocus
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => { setIsOpen(false); setInputValue(''); }}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleOffboard}
                        disabled={!isConfirmationValid || isOffboarding}
                        variant="contained"
                        color="error"
                    >
                        {isOffboarding ? <CircularProgress size={20} color="inherit" /> : 'Confirm Offboard'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

// --- Status & Controls Section with Toggles ---
const StatusControlSection = () => {
    const record = useRecordContext();
    const notify = useNotify();
    const refresh = useRefresh();
    const [update, { isLoading }] = useUpdate();

    if (!record) {
        return null;
    }

    const handleToggle = (field: string, value: boolean) => {
        update('guides', {
            id: record.id,
            data: { [field]: value },
            previousData: record
        }, {
            onSuccess: () => {
                notify(`Guide ${field} status updated.`, { type: 'success' });
                refresh();
            },
            onError: (error: any) => {
                notify(`Error: ${error.message}`, { type: 'error' });
            },
        });
    };

    return (
        <Card sx={{ mb: 3 }}>
            <Box sx={{ p: 3, pb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Status & Controls
                </Typography>
            </Box>
            <Divider />
            <CardContent>
                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                    <Box sx={{ flex: "1 1 200px", minWidth: "150px" }}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={record.is_online || false}
                                    onChange={(e) => handleToggle('is_online', e.target.checked)}
                                />
                            }
                            label="Online"
                            disabled={isLoading}
                        />
                    </Box>
                    <Box sx={{ flex: "1 1 200px", minWidth: "150px" }}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={record.chat_enabled || false}
                                    onChange={(e) => handleToggle('chat_enabled', e.target.checked)}
                                />
                            }
                            label="Chat Enabled"
                            disabled={isLoading}
                        />
                    </Box>
                    <Box sx={{ flex: "1 1 200px", minWidth: "150px" }}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={record.voice_enabled || false}
                                    onChange={(e) => handleToggle('voice_enabled', e.target.checked)}
                                />
                            }
                            label="Call Enabled"
                            disabled={isLoading}
                        />
                    </Box>
                    <Box sx={{ flex: "1 1 200px", minWidth: "150px" }}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={record.video_enabled || false}
                                    onChange={(e) => handleToggle('video_enabled', e.target.checked)}
                                />
                            }
                            label="Video Call Enabled"
                            disabled={isLoading}
                        />
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
}


const BankAccountSummaryCard = ({ guideId }: { guideId: Identifier }) => {
    const [defaultAccount, setDefaultAccount] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAccounts = async () => {
            try {
                setLoading(true);
                const { json } = await httpClient(`${API_URL}/api/v1/guides/${guideId}/accounts`);
                const accounts = json || [];
                // Find the default account or take the first one if none is default
                const defaultAcc = accounts.find((acc: any) => acc.is_default) || accounts[0];
                setDefaultAccount(defaultAcc);
            } catch (error) {
                console.error("Could not fetch bank accounts", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAccounts();
    }, [guideId]);

    return (
        <Card sx={{ mb: 3 }}>
            <Box sx={{ p: 3, pb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Bank Account Details
                </Typography>
                <Typography variant="body2" color="textSecondary">
                    Default account for payouts.
                </Typography>
            </Box>
            <Divider />
            <CardContent>
                {loading ? (
                    <Box display="flex" justifyContent="center"><CircularProgress size={24} /></Box>
                ) : defaultAccount ? (
                    <Box>
                        <DetailItem label="Bank Name">{defaultAccount.bank_name}</DetailItem>
                        <DetailItem label="Account Number">{maskAccountNumber(defaultAccount.account_number)}</DetailItem>
                        <Button
                            fullWidth
                            variant="outlined"
                            sx={{ mt: 2 }}
                            onClick={() => navigate(`/guides/${guideId}/accounts`)}
                        >
                            View & Manage All Accounts
                        </Button>
                    </Box>
                ) : (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography color="textSecondary">
                            No bank accounts found.
                        </Typography>
                        <Button
                            fullWidth
                            variant="outlined"
                            sx={{ mt: 2 }}
                            onClick={() => navigate(`/guides/${guideId}/accounts`)}
                        >
                            Add Bank Account
                        </Button>
                    </Box>
                )}
            </CardContent>
        </Card>
    );
};

// --- Main Show View (Updated to display all new data) ---
const GuideShowView = () => {
    const record = useRecordContext();
    const navigate = useNavigate();

    if (!record) {
        return <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>;
    }

    return (
        <>
            <Title title={`Profile: ${record.full_name}`} />

            {/* Guide Financials Buttons */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        <Button
                            onClick={() => navigate(`/guide-earnings/${record.id}`)}
                            variant="outlined"
                            size="small"
                        >
                            View Earnings & Wallet
                        </Button>
                        <Button
                            onClick={() => navigate(`/guide-orders/${record.id}`)}
                            variant="outlined"
                            size="small"
                        >
                            View Completed Orders
                        </Button>
                    </Box>
                </CardContent>
            </Card>

            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 2 }}>
                        <Avatar
                            src={record.profile_picture_url}
                            alt={record.full_name}
                            sx={{ width: 80, height: 80 }}
                        >
                            {record.full_name?.charAt(0)}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                                {record.full_name}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                {(record.skills || []).map((skill: string, index: number) => (
                                    <Chip
                                        key={index}
                                        label={skill}
                                        size="small"
                                        sx={{ bgcolor: 'action.selected' }}
                                    />
                                ))}
                            </Box>
                        </Box>
                    </Box>
                </CardContent>
            </Card>

            <Box sx={{ mb: 3 }}>
                <StatusControlSection />
            </Box>

            <Box sx={{ mb: 3 }}>
                <GuideStatsSection />
            </Box>

            <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap", mb: 3 }}>
                <Box sx={{ flex: "1 1 600px", minWidth: "400px" }}>
                    <Card>
                        <Box sx={{ p: 3, pb: 2 }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                Guide Information
                            </Typography>
                        </Box>
                        <Divider />
                        <CardContent>
                            <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                                <Box sx={{ flex: "1 1 300px", minWidth: "250px" }}>
                                    <DetailItem label="Phone">{record.phone_number}</DetailItem>
                                </Box>
                                <Box sx={{ flex: "1 1 300px", minWidth: "250px" }}>
                                    <DetailItem label="Email Address">{record.email || 'Not provided'}</DetailItem>
                                </Box>
                                <Box sx={{ flex: "1 1 300px", minWidth: "250px" }}>
                                    <DetailItem label="Years of Experience">{record.years_of_experience} years</DetailItem>
                                </Box>
                                <Box sx={{ flex: "1 1 300px", minWidth: "250px" }}>
                                    <DetailItem label="Languages Spoken">{(record.languages || []).join(', ')}</DetailItem>
                                </Box>
                                <Box sx={{ flex: "1 1 300px", minWidth: "250px" }}>
                                    <DetailItem label='Rating'>
                                        <Typography sx={{ color: '#ff9800', fontWeight: 600 }}>
                                            {record.guide_stats?.rating || record.rating || 'N/A'}
                                        </Typography>
                                    </DetailItem>
                                </Box>
                                <Box sx={{ flex: "1 1 300px", minWidth: "250px" }}>
                                    <DetailItem label="Total Consultations">{record.guide_stats?.total_number_of_completed_consultations || record.number_of_consultation || 0}</DetailItem>
                                </Box>
                                <Box sx={{ flex: "1 1 300px", minWidth: "250px" }}>
                                    <DetailItem label="Price per Minute">
                                        <Typography sx={{ color: '#4caf50', fontWeight: 600 }}>
                                            ₹{record.price_per_minute || 'N/A'}
                                        </Typography>
                                    </DetailItem>
                                </Box>
                                <Box sx={{ flex: "1 1 300px", minWidth: "250px" }}>
                                    <DetailItem label="Revenue Share">
                                        <Typography sx={{ fontWeight: 600 }}>
                                            {record.revenue_share ? `${record.revenue_share}%` : 'N/A'}
                                        </Typography>
                                    </DetailItem>
                                </Box>
                                <Box sx={{ flex: "1 1 300px", minWidth: "250px" }}>
                                    <DetailItem label="Tier">{record.tier || 'Standard'}</DetailItem>
                                </Box>
                                <Box sx={{ flex: "1 1 300px", minWidth: "250px" }}>
                                    <DetailItem label="Onboarded On">
                                        {new Date(record.created_at).toLocaleDateString()}
                                    </DetailItem>
                                </Box>
                                {record.bio && (
                                    <Box sx={{ flex: "1 1 100%" }}>
                                        <DetailItem label="Bio">{record.bio}</DetailItem>
                                    </Box>
                                )}
                            </Box>
                        </CardContent>
                    </Card>
                </Box>
                <Box sx={{ flex: "1 1 300px", minWidth: "250px" }}>
                    <BankAccountSummaryCard guideId={record.id} />
                </Box>
            </Box>

            <KycDocumentSection guideId={record.id} />
        </>
    );
};


export const GuideShow = () => {
    const navigate = useNavigate();
    const record = useRecordContext();

    const TopActions = () => (
        <TopToolbar>
            <Button onClick={() => navigate(-1)} size="small">
                Back to Guides
            </Button>

            {/* Guide Financials Redirects */}
            {record && (
                <>
                    <Button
                        onClick={() => navigate(`/guide-earnings/${record.id}`)}
                        variant="outlined"
                        size="small"
                        sx={{ mr: 1 }}
                    >
                        Earnings
                    </Button>
                    <Button
                        onClick={() => navigate(`/guide-orders/${record.id}`)}
                        variant="outlined"
                        size="small"
                        sx={{ mr: 1 }}
                    >
                        Orders
                    </Button>
                    <OffboardGuideButton />
                </>
            )}
        </TopToolbar>
    );

    return (
        <Show actions={<TopActions />} component="div" title=" ">
            <GuideShowView />
        </Show>
    );
};