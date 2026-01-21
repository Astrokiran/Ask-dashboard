import {
    Show,
    TextField,
    DateField,
    useRecordContext,
    useNotify,
    useRefresh,
} from 'react-admin';
import { useNavigate } from 'react-router-dom';
import {
    Card,
    CardContent,
    Typography,
    Button,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Divider,
    Box,
    TextField as MuiTextField,
    Checkbox,
    FormControlLabel,
    IconButton,
    Collapse,
    Paper,
    Alert,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
} from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { FormEvent, useState, useEffect } from 'react';
import { httpClient } from '../dataProvider';

const API_URL = process.env.REACT_APP_API_URL;

const CreateProfileForm = ({ onSave, saving }: { onSave: (data: any) => void; saving: boolean }) => {
    const [name, setName] = useState('');
    const [dob, setDob] = useState('');
    const [tob, setTob] = useState('');
    const [birthCity, setBirthCity] = useState('');
    const [birthCountry, setBirthCountry] = useState('');
    const [preferredLanguage, setPreferredLanguage] = useState('');
    const [zodiacSign, setZodiacSign] = useState('');
    const [isPrimary, setIsPrimary] = useState(false);

    const handleSubmit = (event: FormEvent) => {
        event.preventDefault();
        onSave({
            name,
            dob: dob || null,
            tob: tob || null,
            birth_city: birthCity,
            birth_country: birthCountry,
            preferred_language: preferredLanguage,
            zodiac_sign: zodiacSign,
            is_primary: isPrimary,
        });
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px' }}>
            <MuiTextField
                label="Full Name *"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                fullWidth
                size="small"
            />
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
                    <MuiTextField
                        label="Date of Birth"
                        type="date"
                        value={dob}
                        onChange={e => setDob(e.target.value)}
                        fullWidth
                        size="small"
                        InputLabelProps={{ shrink: true }}
                    />
                </Box>
                <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
                    <MuiTextField
                        label="Time of Birth"
                        type="time"
                        value={tob}
                        onChange={e => setTob(e.target.value)}
                        fullWidth
                        size="small"
                        InputLabelProps={{ shrink: true }}
                    />
                </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
                    <MuiTextField
                        label="Birth City"
                        value={birthCity}
                        onChange={e => setBirthCity(e.target.value)}
                        fullWidth
                        size="small"
                    />
                </Box>
                <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
                    <MuiTextField
                        label="Birth Country"
                        value={birthCountry}
                        onChange={e => setBirthCountry(e.target.value)}
                        fullWidth
                        size="small"
                    />
                </Box>
            </Box>
            <MuiTextField
                label="Preferred Language"
                value={preferredLanguage}
                onChange={e => setPreferredLanguage(e.target.value)}
                fullWidth
                size="small"
            />
            <MuiTextField
                label="Zodiac Sign"
                value={zodiacSign}
                onChange={e => setZodiacSign(e.target.value)}
                fullWidth
                size="small"
            />
            <FormControlLabel
                control={
                    <Checkbox
                        checked={isPrimary}
                        onChange={e => setIsPrimary(e.target.checked)}
                    />
                }
                label="Set as Primary Profile"
            />
            <Button type="submit" disabled={saving} variant="contained" fullWidth>
                {saving ? 'Saving...' : 'Save Profile'}
            </Button>
        </form>
    );
};


const ProfilesGrid = () => {
    const record = useRecordContext();
    const notify = useNotify();
    const refresh = useRefresh();

    const [isDialogOpen, setDialogOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // --- 2. Added State and Logic for the EDIT Dialog ---
    const [editingProfile, setEditingProfile] = useState<any | null>(null);

    // This correctly and safely accesses the nested profile data from your API response
    const profileData = record?.profile?.[0];

    const handleSave = (formData: any) => {
        if (!record) return;
        setIsSaving(true);

        httpClient(`${API_URL}/api/v1/customers/${record.id}/profile`, {
            method: 'POST',
            body: JSON.stringify(formData),
        })
        .then(({ json }) => {
            console.log('Profile created response:', json);
            notify('Profile created successfully!', { type: 'success' });
            setDialogOpen(false);
            refresh();
        })
        .catch((error: any) => {
            const errorMessage = error.body?.detail?.message || error.message || 'An unknown error occurred';
            notify(`Error: ${errorMessage}`, { type: 'warning' });
        })
        .finally(() => {
            setIsSaving(false);
        });
    };

    const handleUpdateSave = (formData: any) => {
        if (!record || !editingProfile) return;
        setIsSaving(true);

        const profileId = editingProfile.profile_id;
        const url = `${API_URL}/api/v1/customers/${record.id}/profile/${profileId}`;

        console.log('=== Profile Update ===');
        console.log('URL:', url);
        console.log('Method: PATCH');
        console.log('Profile ID:', profileId);
        console.log('Form data:', JSON.stringify(formData, null, 2));

        // Use the endpoint with profile_id in the URL and PATCH method
        httpClient(url, {
            method: 'PATCH',
            body: JSON.stringify(formData),
        })
        .then(({ json }) => {
            console.log('Profile updated response:', json);
            notify('Profile updated successfully!');
            setEditingProfile(null);
            refresh();
        })
        .catch((error: any) => {
            console.error('Profile update error:', error);
            console.error('Error status:', error.status);
            console.error('Error body:', error.body);
            const errorMessage = error.body?.detail?.message || error.message || 'An error occurred';
            notify(`Error: ${errorMessage}`, { type: 'warning' });
        })
        .finally(() => setIsSaving(false));
    };


    if (!record) return null;
    // const profileData = record?.profile?.[0];


  return (
        <Card>
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="h6">Associated Profiles</Typography>
                    </Box>
                    <Button
                        variant="outlined"
                        size="small"
                        onClick={() => setDialogOpen(true)}
                        startIcon={<span style={{ fontSize: '16px' }}>+</span>}
                    >
                        Create New Profile
                    </Button>
                </Box>
                <Dialog open={isDialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
                    <DialogTitle>Create a New Profile for {record.name}</DialogTitle>
                    <DialogContent>
                        <CreateProfileForm onSave={handleSave} saving={isSaving} />
                    </DialogContent>
                </Dialog>

                {(!profileData || !profileData.profiles || profileData.profiles.length === 0) ? (
                    <Typography color="textSecondary">No profiles found for this customer.</Typography>
                ) : (
                    <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                         {profileData.profiles.map((profile: any, index: number) => (
                            <Box sx={{ flex: "1 1 300px", minWidth: "250px" }} key={profile.id || index}>
                                <Paper
                                    sx={{
                                        p: 2,
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 1,
                                        bgcolor: 'background.paper',
                                        border: 1,
                                        borderColor: 'divider',
                                    }}
                                >
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography variant="subtitle1" fontWeight="-semibold">
                                            {profile.name || `Profile #${profile.customer_id}`}
                                        </Typography>
                                        {profile.is_primary && (
                                            <Chip label="Primary" color="primary" size="small" />
                                        )}
                                    </Box>

                                    <Divider />

                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, color: 'text.secondary' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Typography variant="body2">
                                                <strong>DOB:</strong> {profile.dob ? new Date(profile.dob).toLocaleDateString() : 'N/A'}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Typography variant="body2">
                                                <strong>TOB:</strong> {profile.tob || 'N/A'}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Typography variant="body2">
                                                <strong>Birth Place:</strong> {`${profile.birth_city || ''}${profile.birth_country ? ', ' + profile.birth_country : ''}` || 'N/A'}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Typography variant="body2">
                                                <strong>Language:</strong> {profile.preferred_language || 'N/A'}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Typography variant="body2">
                                                <strong>Zodiac:</strong> {profile.zodiac_sign || 'N/A'}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Box sx={{ mt: 'auto', pt: 1, textAlign: 'right' }}>
                                        <Typography variant="caption" color="textSecondary">
                                            Created: {new Date(profile.created_at).toLocaleString()}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ mt: 'auto', pt: 1, display: 'flex', justifyContent: 'flex-end' }}>
                                        <Button
                                            variant="text"
                                            size="small"
                                            onClick={() => setEditingProfile(profile)}
                                        >
                                            Edit
                                        </Button>
                                    </Box>
                                </Paper>
                            </Box>
                        ))}
                    </Box>
                )}
            </CardContent>
            <Dialog open={!!editingProfile} onClose={() => setEditingProfile(null)} maxWidth="md" fullWidth>
                <DialogTitle>Edit Profile for {record.name}</DialogTitle>
                <DialogContent>
                    <UpdateProfileForm
                        profile={editingProfile}
                        onSave={handleUpdateSave}
                        onCancel={() => setEditingProfile(null)}
                        saving={isSaving}
                        customerId={record.id}
                        refresh={refresh}
                    />
                </DialogContent>
            </Dialog>
        </Card>
    );
};

// --- Payment Orders Component (fetches its own data) ---
const CustomerPaymentOrders = ({ customerId }: { customerId: number }) => {
    const [orders, setOrders] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (!customerId) return;
        setIsLoading(true);
        httpClient(`${API_URL}/api/v1/customers/${customerId}/wallet/payment-orders`)
            .then(({ json }) => {
                // Handle different response structures
                if (Array.isArray(json)) {
                    setOrders(json);
                } else if (json.data && Array.isArray(json.data)) {
                    setOrders(json.data);
                } else if (json.items && Array.isArray(json.items)) {
                    setOrders(json.items);
                } else {
                    setOrders([]);
                }
            })
            .finally(() => setIsLoading(false));
    }, [customerId]);

    const handlePaymentOrderClick = (orderId: number) => {
        navigate(`/payment-orders/${orderId}/show`);
    };

    // Calculate payment order statistics
    const getPaymentOrderStats = () => {
        if (orders.length === 0) {
            return {
                total: 0,
                successful: 0,
                failed: 0,
                pending: 0,
                successfulPercentage: 0,
                failedPercentage: 0,
                pendingPercentage: 0,
                totalAmount: 0,
                successfulAmount: 0
            };
        }

        const successful = orders.filter(order => order.status?.toLowerCase() === 'successful').length;
        const failed = orders.filter(order => order.status?.toLowerCase() === 'failed').length;
        const pending = orders.filter(order => order.status?.toLowerCase() === 'pending').length;

        const totalAmount = orders.reduce((sum, order) => sum + (parseFloat(order.amount || '0')), 0);
        const successfulAmount = orders
            .filter(order => order.status?.toLowerCase() === 'successful')
            .reduce((sum, order) => sum + (parseFloat(order.amount || '0')), 0);

        return {
            total: orders.length,
            successful,
            failed,
            pending,
            successfulPercentage: orders.length > 0 ? ((successful / orders.length) * 100).toFixed(1) : '0',
            failedPercentage: orders.length > 0 ? ((failed / orders.length) * 100).toFixed(1) : '0',
            pendingPercentage: orders.length > 0 ? ((pending / orders.length) * 100).toFixed(1) : '0',
            totalAmount,
            successfulAmount
        };
    };

    const stats = getPaymentOrderStats();

    const getOrderStatusColor = (status: string): "success" | "error" | "warning" | "default" => {
        switch (status?.toLowerCase()) {
            case 'successful':
                return 'success';
            case 'failed':
                return 'error';
            case 'pending':
                return 'warning';
            default:
                return 'default';
        }
    };

    return (
        <Box>
            <TableContainer component={Box} sx={{ border: 1, borderColor: 'divider', borderRadius: 1, overflow: 'hidden' }}>
                <Table sx={{ minWidth: 650 }}>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold', width: '25%', whiteSpace: 'nowrap' }}>Payment Order ID</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', width: '20%', whiteSpace: 'nowrap' }}>Status</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', width: '15%', whiteSpace: 'nowrap' }}>Amount</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', width: '40%', whiteSpace: 'nowrap' }}>Date</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {isLoading ? (
                             <TableRow><TableCell colSpan={4} align="center">Loading payment orders...</TableCell></TableRow>
                        ) : orders.length > 0 ? (
                            orders.map((order: any) => (
                                <TableRow key={order.id || order.payment_order_id} hover>
                                    <TableCell component="th" scope="row">
                                        <Button
                                            onClick={() => handlePaymentOrderClick(order.id || order.payment_order_id)}
                                            sx={{ color: 'primary.main', fontWeight: 500, textTransform: 'none' }}
                                        >
                                            #{order.id || order.payment_order_id}
                                        </Button>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={order.status}
                                            color={getOrderStatusColor(order.status)}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 500 }}>
                                        ₹{parseFloat(order.amount || '0').toFixed(2)}
                                    </TableCell>
                                    <TableCell>{new Date(order.created_at).toLocaleString()}</TableCell>
                                </TableRow>
                            ))
                        ) : (
                             <TableRow><TableCell colSpan={4} align="center">No payment orders found.</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Payment Order Statistics Summary */}
            <Paper
                sx={{
                    mt: 2,
                    p: 3,
                    borderTop: 1,
                    borderColor: 'divider',
                    bgcolor: 'action.hover'
                }}
            >
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
                        Payment Order Summary
                    </Typography>

                    <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                        {/* Total Payment Orders */}
                        <Box sx={{ flex: "1 1 200px", minWidth: "150px" }}>
                            <Paper
                                sx={{
                                    p: 2,
                                    textAlign: 'center',
                                    bgcolor: 'background.paper',
                                    border: 1,
                                    borderColor: 'divider',
                                }}
                            >
                                <Typography variant="h4" fontWeight="bold" color="textPrimary">
                                    {stats.total}
                                </Typography>
                                <Typography variant="caption" color="textSecondary" fontWeight="medium">
                                    Total Orders
                                </Typography>
                            </Paper>
                        </Box>

                        {/* Successful Orders */}
                        <Box sx={{ flex: "1 1 200px", minWidth: "150px" }}>
                            <Paper
                                sx={{
                                    p: 2,
                                    textAlign: 'center',
                                    bgcolor: 'background.paper',
                                    border: 1,
                                    borderColor: 'divider',
                                }}
                            >
                                <Typography variant="h4" fontWeight="bold" color="success.main">
                                    {stats.successful}
                                </Typography>
                                <Typography variant="caption" color="textSecondary" fontWeight="medium">
                                    Successful ({stats.successfulPercentage}%)
                                </Typography>
                            </Paper>
                        </Box>

                        {/* Failed Orders */}
                        <Box sx={{ flex: "1 1 200px", minWidth: "150px" }}>
                            <Paper
                                sx={{
                                    p: 2,
                                    textAlign: 'center',
                                    bgcolor: 'background.paper',
                                    border: 1,
                                    borderColor: 'divider',
                                }}
                            >
                                <Typography variant="h4" fontWeight="bold" color="error.main">
                                    {stats.failed}
                                </Typography>
                                <Typography variant="caption" color="textSecondary" fontWeight="medium">
                                    Failed ({stats.failedPercentage}%)
                                </Typography>
                            </Paper>
                        </Box>

                        {/* Pending Orders */}
                        <Box sx={{ flex: "1 1 200px", minWidth: "150px" }}>
                            <Paper
                                sx={{
                                    p: 2,
                                    textAlign: 'center',
                                    bgcolor: 'background.paper',
                                    border: 1,
                                    borderColor: 'divider',
                                }}
                            >
                                <Typography variant="h4" fontWeight="bold" color="warning.main">
                                    {stats.pending}
                                </Typography>
                                <Typography variant="caption" color="textSecondary" fontWeight="medium">
                                    Pending ({stats.pendingPercentage}%)
                                </Typography>
                            </Paper>
                        </Box>
                    </Box>

                    {/* Amount Summary */}
                    <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                        <Box sx={{ flex: "1 1 300px", minWidth: "250px" }}>
                            <Paper
                                sx={{
                                    p: 2,
                                    textAlign: 'center',
                                    bgcolor: 'background.paper',
                                    border: 1,
                                    borderColor: 'divider',
                                }}
                            >
                                <Typography variant="h4" fontWeight="bold" color="primary.main">
                                    ₹{stats.totalAmount.toFixed(2)}
                                </Typography>
                                <Typography variant="caption" color="textSecondary" fontWeight="medium">
                                    Total Amount (All Orders)
                                </Typography>
                            </Paper>
                        </Box>

                        <Box sx={{ flex: "1 1 300px", minWidth: "250px" }}>
                            <Paper
                                sx={{
                                    p: 2,
                                    textAlign: 'center',
                                    bgcolor: 'background.paper',
                                    border: 1,
                                    borderColor: 'divider',
                                }}
                            >
                                <Typography variant="h4" fontWeight="bold" color="success.main">
                                    ₹{stats.successfulAmount.toFixed(2)}
                                </Typography>
                                <Typography variant="caption" color="textSecondary" fontWeight="medium">
                                    Amount from Successful Orders
                                </Typography>
                            </Paper>
                        </Box>
                    </Box>

                    {/* Visual Status Bar */}
                    {stats.total > 0 && (
                        <Box
                            sx={{
                                width: '100%',
                                height: 32,
                                bgcolor: 'divider',
                                borderRadius: 16,
                                overflow: 'hidden',
                                display: 'flex',
                            }}
                        >
                            {stats.successful > 0 && (
                                <Box
                                    sx={{
                                        bgcolor: 'success.main',
                                        height: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        fontSize: '0.75rem',
                                        fontWeight: 'medium',
                                        width: `${stats.successfulPercentage}%`,
                                    }}
                                >
                                    {stats.successfulPercentage}%
                                </Box>
                            )}
                            {stats.failed > 0 && (
                                <Box
                                    sx={{
                                        bgcolor: 'error.main',
                                        height: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        fontSize: '0.75rem',
                                        fontWeight: 'medium',
                                        width: `${stats.failedPercentage}%`,
                                    }}
                                >
                                    {stats.failedPercentage}%
                                </Box>
                            )}
                            {stats.pending > 0 && (
                                <Box
                                    sx={{
                                        bgcolor: 'warning.main',
                                        height: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        fontSize: '0.75rem',
                                        fontWeight: 'medium',
                                        width: `${stats.pendingPercentage}%`,
                                    }}
                                >
                                    {stats.pendingPercentage}%
                                </Box>
                            )}
                        </Box>
                    )}
                </Box>
            </Paper>
        </Box>
    );
};

// --- Collapsible Section Component ---
const CollapsibleSection = ({ title, icon, children, defaultOpen = false }: {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    defaultOpen?: boolean;
}) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <Card sx={{ mt: 3 }}>
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 2,
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'action.hover' },
                    transition: 'background-color 0.2s',
                }}
                onClick={() => setIsOpen(!isOpen)}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {icon}
                    <Typography variant="h6">{title}</Typography>
                </Box>
                {isOpen ? <ExpandLess color="action" /> : <ExpandMore color="action" />}
            </Box>
            <Collapse in={isOpen}>
                <CardContent>
                    {children}
                </CardContent>
            </Collapse>
        </Card>
    );
};



const WalletBalance = ({ customerId }: { customerId: number }) => {
    const [balanceData, setBalanceData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const notify = useNotify();

    useEffect(() => {
        if (!customerId) return;
        setIsLoading(true);
        httpClient(`${API_URL}/api/v1/customers/${customerId}/wallet/balance`)
            .then(({ json }) => setBalanceData(json))
            .catch(() => notify('Could not load wallet balance.', { type: 'warning' }))
            .finally(() => setIsLoading(false));
    }, [customerId, notify]);

    const formatCurrency = (value: string | number | undefined) => parseFloat(String(value || '0')).toFixed(2);

    if (isLoading) return <Typography>Loading balance...</Typography>;

    return (
        <Paper
            sx={{
                p: 3,
                mb: 3,
                bgcolor: 'background.paper',
                border: 1,
                borderColor: 'divider',
            }}
        >
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", textAlign: "center" }}>
                <Box sx={{ flex: "1 1 300px", minWidth: "250px" }}>
                    <Typography variant="body2" color="textSecondary">Real Cash</Typography>
                    <Typography variant="h5" fontWeight="bold">₹{formatCurrency(balanceData?.real_cash)}</Typography>
                </Box>
                <Box sx={{ flex: "1 1 300px", minWidth: "250px" }}>
                    <Typography variant="body2" color="textSecondary">Virtual Cash</Typography>
                    <Typography variant="h5" fontWeight="bold">₹{formatCurrency(balanceData?.virtual_cash)}</Typography>
                </Box>
                <Box sx={{ flex: "1 1 300px", minWidth: "250px", borderLeft: { md: 1 }, borderColor: 'divider', pl: { md: 2 } }}>
                    <Typography variant="body2" fontWeight="bold" color="primary">Total Balance</Typography>
                    <Typography variant="h5" fontWeight="bold" color="primary">₹{formatCurrency(balanceData?.cumulative_sum)}</Typography>
                </Box>
            </Box>
        </Paper>
    );
};

const UpdateProfileForm = ({ profile, onSave, onCancel, saving, customerId, refresh }: { profile: any; onSave: (data: any) => void; onCancel: () => void; saving: boolean; customerId: number; refresh: () => void; }) => {
    const notify = useNotify();
    const [name, setName] = useState('');
    const [dob, setDob] = useState('');
    const [tob, setTob] = useState('');
    const [birthCity, setBirthCity] = useState('');
    const [birthCountry, setBirthCountry] = useState('');
    const [preferredLanguage, setPreferredLanguage] = useState('');
    const [zodiacSign, setZodiacSign] = useState('');
    const [leftHandImage, setLeftHandImage] = useState<File | null>(null);
    const [rightHandImage, setRightHandImage] = useState<File | null>(null);
    const [uploadingImages, setUploadingImages] = useState(false);


    // This effect pre-fills the form when the component loads with profile data
    useEffect(() => {
        if (profile) {
            setName(profile.name || '');
            // The <input type="date"> needs the date in "YYYY-MM-DD" format.
            setDob(profile.dob ? new Date(profile.dob).toISOString().split('T')[0] : '');
            setTob(profile.tob || '');
            setBirthCity(profile.birth_city || '');
            setBirthCountry(profile.birth_country || '');
            setPreferredLanguage(profile.preferred_language || '');
            setZodiacSign(profile.zodiac_sign || '');
        }
    }, [profile]);

    // Separate handler for profile update only
    const handleProfileUpdate = (event: FormEvent) => {
        event.preventDefault();

        const profileData = {
            name,
            dob: dob || null,
            tob: tob || null,
            birth_city: birthCity,
            birth_country: birthCountry,
            preferred_language: preferredLanguage,
            zodiac_sign: zodiacSign,
        };

        onSave(profileData);
    };

    // Separate handler for hand image upload only
    const handleHandImageUpload = async () => {
        if (!leftHandImage && !rightHandImage) {
            notify('Please select at least one hand image to upload.', { type: 'warning' });
            return;
        }

        const profileId = profile.profile_id;

        if (!profileId) {
            notify('Error: Profile ID not found. Unable to upload hand images.', { type: 'error' });
            return;
        }

        setUploadingImages(true);

        try {
            const formData = new FormData();

            if (leftHandImage) {
                formData.append('left_hand_image', leftHandImage);
            }

            if (rightHandImage) {
                formData.append('right_hand_image', rightHandImage);
            }

            const token = localStorage.getItem('access_token');
            const uploadUrl = `${API_URL}/api/v1/customers/${customerId}/profile/${profileId}/hand-images`;

            console.log('Uploading hand images to:', uploadUrl);

            const response = await fetch(uploadUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'X-Internal-API-Key': 'dummy_service_secret',
                },
                body: formData,
            });

            if (response.ok) {
                console.log('Hand images uploaded successfully');
                notify('Hand images uploaded successfully!', { type: 'success' });

                // Clear the file inputs after successful upload
                setLeftHandImage(null);
                setRightHandImage(null);
                const fileInputs = document.querySelectorAll('input[type="file"]');
                fileInputs.forEach(input => (input as HTMLInputElement).value = '');

                // Close the dialog and refresh data
                onCancel();
                refresh();
            } else {
                const errorData = await response.json();
                console.error('Failed to upload hand images:', errorData);
                const errorMessage = errorData.detail?.message || errorData.message || 'Failed to upload hand images';
                notify(errorMessage, { type: 'error' });
            }
        } catch (error: any) {
            console.error('Error uploading hand images:', error);
            notify(`Error uploading hand images: ${error.message}`, { type: 'error' });
        } finally {
            setUploadingImages(false);
        }
    };

    return (
       <div style={{ display: 'contents' }}>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", p: 2 }}>
                <Box sx={{ flex: "1 1 100%" }}>
                    <MuiTextField
                        label="Full Name *"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        required
                        fullWidth
                        size="small"
                    />
                </Box>
                <Box sx={{ flex: "1 1 300px", minWidth: "250px" }}>
                    <MuiTextField
                        label="Date of Birth"
                        type="date"
                        value={dob}
                        onChange={e => setDob(e.target.value)}
                        fullWidth
                        size="small"
                        InputLabelProps={{ shrink: true }}
                    />
                </Box>
                <Box sx={{ flex: "1 1 300px", minWidth: "250px" }}>
                    <MuiTextField
                        label="Time of Birth"
                        type="time"
                        value={tob}
                        onChange={e => setTob(e.target.value)}
                        fullWidth
                        size="small"
                        InputLabelProps={{ shrink: true }}
                    />
                </Box>
                <Box sx={{ flex: "1 1 100%" }}>
                    <MuiTextField
                        label="Birth City"
                        value={birthCity}
                        onChange={e => setBirthCity(e.target.value)}
                        fullWidth
                        size="small"
                    />
                </Box>
                <Box sx={{ flex: "1 1 100%" }}>
                    <MuiTextField
                        label="Birth Country"
                        value={birthCountry}
                        onChange={e => setBirthCountry(e.target.value)}
                        fullWidth
                        size="small"
                    />
                </Box>
                <Box sx={{ flex: "1 1 100%" }}>
                    <MuiTextField
                        label="Preferred Language"
                        value={preferredLanguage}
                        onChange={e => setPreferredLanguage(e.target.value)}
                        fullWidth
                        size="small"
                    />
                </Box>
                <Box sx={{ flex: "1 1 100%" }}>
                    <MuiTextField
                        label="Zodiac Sign"
                        value={zodiacSign}
                        onChange={e => setZodiacSign(e.target.value)}
                        fullWidth
                        size="small"
                    />
                </Box>
                <Box sx={{ flex: "1 1 100%" }}>
                    <Typography variant="subtitle2" gutterBottom fontWeight="medium">
                        Left Hand Image
                    </Typography>
                    <Box
                        sx={{
                            border: 1,
                            borderColor: 'divider',
                            borderRadius: 1,
                            p: 2,
                            bgcolor: 'background.paper',
                        }}
                    >
                        <input
                            type="file"
                            accept="image/jpeg,image/jpg,image/png"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) setLeftHandImage(file);
                            }}
                            style={{ width: '100%' }}
                        />
                        <Typography variant="caption" color="textSecondary" display="block" sx={{ mt: 1 }}>
                            Upload left hand image (JPEG, PNG)
                        </Typography>
                        {leftHandImage && (
                            <Chip
                                label={`Selected: ${leftHandImage.name}`}
                                size="small"
                                color="primary"
                                sx={{ mt: 1 }}
                                onDelete={() => setLeftHandImage(null)}
                            />
                        )}
                    </Box>
                </Box>
                <Box sx={{ flex: "1 1 100%" }}>
                    <Typography variant="subtitle2" gutterBottom fontWeight="medium">
                        Right Hand Image
                    </Typography>
                    <Box
                        sx={{
                            border: 1,
                            borderColor: 'divider',
                            borderRadius: 1,
                            p: 2,
                            bgcolor: 'background.paper',
                        }}
                    >
                        <input
                            type="file"
                            accept="image/jpeg,image/jpg,image/png"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) setRightHandImage(file);
                            }}
                            style={{ width: '100%' }}
                        />
                        <Typography variant="caption" color="textSecondary" display="block" sx={{ mt: 1 }}>
                            Upload right hand image (JPEG, PNG)
                        </Typography>
                        {rightHandImage && (
                            <Chip
                                label={`Selected: ${rightHandImage.name}`}
                                size="small"
                                color="primary"
                                sx={{ mt: 1 }}
                                onDelete={() => setRightHandImage(null)}
                            />
                        )}
                    </Box>
                </Box>
                <Box sx={{ flex: "1 1 100%", display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2, flexWrap: 'wrap', gap: 2 }}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button type="button" onClick={onCancel} variant="outlined">
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={handleProfileUpdate}
                            variant="contained"
                            disabled={saving}
                            color="primary"
                        >
                            {saving ? 'Updating Profile...' : 'Update Profile'}
                        </Button>
                    </Box>

                    <Button
                        type="button"
                        onClick={handleHandImageUpload}
                        variant="contained"
                        disabled={uploadingImages}
                        color="secondary"
                        startIcon={uploadingImages ? <span>⏳</span> : <span>📤</span>}
                    >
                        {uploadingImages ? 'Uploading...' : 'Upload Hand Images'}
                    </Button>
                </Box>
            </Box>
        </div>
    );
}

// --- Transactions Component (fetches its own data) ---
const WalletTransactions = ({ customerId }: { customerId: number }) => {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!customerId) return;
        setIsLoading(true);
        httpClient(`${API_URL}/api/v1/customers/${customerId}/wallet/transactions`)
            // CHANGED: Reads from the 'items' array in your API response
            .then(({ json }) => setTransactions(json.items || []))
            .finally(() => setIsLoading(false));
    }, [customerId]);

    // Helper function to make the transaction type look nice
    const getTransactionStyle = (type: string) => {
        switch (type.toUpperCase()) {
            case 'ADD':
                return { text: 'Credit', color: 'success' as const };
            // Add other types like 'DEDUCT', 'SUBTRACT', 'SPEND' here
            case 'DEDUCT':
            case 'SPEND':
                return { text: 'Debit', color: 'error' as const };
            default:
                return { text: type, color: 'default' as const };
        }
    };

    return (
        <Box sx={{ mt: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Transaction History
            </Typography>
            <Paper sx={{ border: 1, borderColor: 'divider', borderRadius: 1, overflow: 'hidden' }}>
                <TableContainer sx={{ overflowX: 'auto' }}>
                    <Table sx={{ minWidth: 600 }}>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold', width: '50%', whiteSpace: 'nowrap' }}>Details</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', width: '25%', whiteSpace: 'nowrap' }}>Type</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', width: '25%', whiteSpace: 'nowrap' }} align="right">Amount</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {isLoading ? (
                                <TableRow><TableCell colSpan={3} align="center">Loading transactions...</TableCell></TableRow>
                            ) : transactions.length > 0 ? (
                                transactions.map((tx: any) => {
                                    const style = getTransactionStyle(tx.type);
                                    return (
                                        <TableRow key={tx.transaction_id} hover>
                                            <TableCell>
                                                {/* Show the descriptive comment */}
                                                <Typography variant="body2" fontWeight="medium">{tx.comment}</Typography>
                                                {/* Show the date underneath */}
                                                <Typography variant="caption" color="textSecondary">
                                                    {new Date(tx.created_at).toLocaleString()}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                {/* Show a colored badge for the type */}
                                                <Chip label={style.text} color={style.color} size="small" />
                                            </TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 'medium', color: `${style.color}.main` }}>
                                                {/* Add a +/- sign and format the amount */}
                                                {style.text === 'Credit' ? '+' : '-'} ₹{parseFloat(tx.amount).toFixed(2)}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            ) : (
                                <TableRow><TableCell colSpan={3} align="center">No transactions found.</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Box>
    );
};

// --- Orders Component (fetches its own data) ---
const CustomerOrders = ({ customerId }: { customerId: number }) => {
    const [orders, setOrders] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (!customerId) return;
        setIsLoading(true);
        httpClient(`${API_URL}/api/v1/customers/${customerId}/orders`)
            .then(({ json }) => setOrders(json.items || []))
            .finally(() => setIsLoading(false));
    }, [customerId]);

    const handleOrderClick = (orderId: number) => {
        // Store the customer_id for the show page to use
        localStorage.setItem('current_customer_id', customerId.toString());
        // Navigate to the consultation order show page
        navigate(`/consultation-orders/${orderId}/show`);
    };

    // Calculate order statistics
    const getOrderStats = () => {
        if (orders.length === 0) {
            return {
                total: 0,
                completed: 0,
                cancelled: 0,
                pending: 0,
                completedPercentage: 0,
                cancelledPercentage: 0,
                totalRevenue: 0,
                completedRevenue: 0
            };
        }

        const completed = orders.filter(order => order.status?.toLowerCase() === 'completed').length;
        const cancelled = orders.filter(order => order.status?.toLowerCase() === 'cancelled').length;
        const pending = orders.filter(order =>
            order.status?.toLowerCase() !== 'completed' &&
            order.status?.toLowerCase() !== 'cancelled'
        ).length;

        const totalRevenue = orders.reduce((sum, order) => sum + (order.final_amount || 0), 0);
        const completedRevenue = orders
            .filter(order => order.status?.toLowerCase() === 'completed')
            .reduce((sum, order) => sum + (order.final_amount || 0), 0);

        return {
            total: orders.length,
            completed,
            cancelled,
            pending,
            completedPercentage: orders.length > 0 ? ((completed / orders.length) * 100).toFixed(1) : '0',
            cancelledPercentage: orders.length > 0 ? ((cancelled / orders.length) * 100).toFixed(1) : '0',
            totalRevenue,
            completedRevenue
        };
    };

    const stats = getOrderStats();

    return (
        <Box>
            <TableContainer component={Box} sx={{ border: 1, borderColor: 'divider', borderRadius: 1, overflow: 'hidden' }}>
                <Table sx={{ minWidth: 600 }}>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold', width: '35%', whiteSpace: 'nowrap' }}>Order ID</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', width: '25%', whiteSpace: 'nowrap' }}>Status</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', width: '40%', whiteSpace: 'nowrap' }}>Date</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {isLoading ? (
                             <TableRow><TableCell colSpan={3} align="center">Loading orders...</TableCell></TableRow>
                        ) : orders.length > 0 ? (
                            orders.map((order: any) => (
                                <TableRow key={order.order_id} hover>
                                    <TableCell component="th" scope="row">
                                        <Button
                                            onClick={() => handleOrderClick(order.order_id)}
                                            sx={{ color: 'primary.main', fontWeight: 500, textTransform: 'none' }}
                                        >
                                            #{order.order_id}
                                        </Button>
                                    </TableCell>
                                    <TableCell><Chip label={order.status} size="small" /></TableCell>
                                    <TableCell>{new Date(order.created_at).toLocaleString()}</TableCell>
                                </TableRow>
                            ))
                        ) : (
                             <TableRow><TableCell colSpan={3} align="center">No orders found.</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Order Statistics Summary */}
            <Paper
                sx={{
                    mt: 2,
                    p: 3,
                    borderTop: 1,
                    borderColor: 'divider',
                    bgcolor: 'action.hover'
                }}
            >
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
                        Order Summary
                    </Typography>

                    <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                        {/* Total Orders */}
                        <Box sx={{ flex: "1 1 200px", minWidth: "150px" }}>
                            <Paper
                                sx={{
                                    p: 2,
                                    textAlign: 'center',
                                    bgcolor: 'background.paper',
                                    border: 1,
                                    borderColor: 'divider',
                                }}
                            >
                                <Typography variant="h4" fontWeight="bold" color="textPrimary">
                                    {stats.total}
                                </Typography>
                                <Typography variant="caption" color="textSecondary" fontWeight="medium">
                                    Total Orders
                                </Typography>
                            </Paper>
                        </Box>

                        {/* Completed Orders */}
                        <Box sx={{ flex: "1 1 200px", minWidth: "150px" }}>
                            <Paper
                                sx={{
                                    p: 2,
                                    textAlign: 'center',
                                    bgcolor: 'background.paper',
                                    border: 1,
                                    borderColor: 'divider',
                                }}
                            >
                                <Typography variant="h4" fontWeight="bold" color="success.main">
                                    {stats.completed}
                                </Typography>
                                <Typography variant="caption" color="textSecondary" fontWeight="medium">
                                    Completed ({stats.completedPercentage}%)
                                </Typography>
                            </Paper>
                        </Box>

                        {/* Cancelled Orders */}
                        <Box sx={{ flex: "1 1 200px", minWidth: "150px" }}>
                            <Paper
                                sx={{
                                    p: 2,
                                    textAlign: 'center',
                                    bgcolor: 'background.paper',
                                    border: 1,
                                    borderColor: 'divider',
                                }}
                            >
                                <Typography variant="h4" fontWeight="bold" color="error.main">
                                    {stats.cancelled}
                                </Typography>
                                <Typography variant="caption" color="textSecondary" fontWeight="medium">
                                    Cancelled ({stats.cancelledPercentage}%)
                                </Typography>
                            </Paper>
                        </Box>

                        {/* Pending Orders */}
                        <Box sx={{ flex: "1 1 200px", minWidth: "150px" }}>
                            <Paper
                                sx={{
                                    p: 2,
                                    textAlign: 'center',
                                    bgcolor: 'background.paper',
                                    border: 1,
                                    borderColor: 'divider',
                                }}
                            >
                                <Typography variant="h4" fontWeight="bold" color="warning.main">
                                    {stats.pending}
                                </Typography>
                                <Typography variant="caption" color="textSecondary" fontWeight="medium">
                                    Other Status
                                </Typography>
                            </Paper>
                        </Box>
                    </Box>

                    {/* Revenue Summary */}
                    <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                        <Box sx={{ flex: "1 1 300px", minWidth: "250px" }}>
                            <Paper
                                sx={{
                                    p: 2,
                                    textAlign: 'center',
                                    bgcolor: 'background.paper',
                                    border: 1,
                                    borderColor: 'divider',
                                }}
                            >
                                <Typography variant="h4" fontWeight="bold" color="primary.main">
                                    ₹{stats.totalRevenue.toFixed(2)}
                                </Typography>
                                <Typography variant="caption" color="textSecondary" fontWeight="medium">
                                    Total Revenue (All Orders)
                                </Typography>
                            </Paper>
                        </Box>

                        <Box sx={{ flex: "1 1 300px", minWidth: "250px" }}>
                            <Paper
                                sx={{
                                    p: 2,
                                    textAlign: 'center',
                                    bgcolor: 'background.paper',
                                    border: 1,
                                    borderColor: 'divider',
                                }}
                            >
                                <Typography variant="h4" fontWeight="bold" color="success.main">
                                    ₹{stats.completedRevenue.toFixed(2)}
                                </Typography>
                                <Typography variant="caption" color="textSecondary" fontWeight="medium">
                                    Revenue from Completed Orders
                                </Typography>
                            </Paper>
                        </Box>
                    </Box>

                    {/* Visual Status Bar */}
                    {stats.total > 0 && (
                        <Box
                            sx={{
                                width: '100%',
                                height: 32,
                                bgcolor: 'divider',
                                borderRadius: 16,
                                overflow: 'hidden',
                                display: 'flex',
                            }}
                        >
                            {stats.completed > 0 && (
                                <Box
                                    sx={{
                                        bgcolor: 'success.main',
                                        height: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        fontSize: '0.75rem',
                                        fontWeight: 'medium',
                                        width: `${stats.completedPercentage}%`,
                                    }}
                                >
                                    {stats.completedPercentage}%
                                </Box>
                            )}
                            {stats.cancelled > 0 && (
                                <Box
                                    sx={{
                                        bgcolor: 'error.main',
                                        height: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        fontSize: '0.75rem',
                                        fontWeight: 'medium',
                                        width: `${stats.cancelledPercentage}%`,
                                    }}
                                >
                                    {stats.cancelledPercentage}%
                                </Box>
                            )}
                            {stats.pending > 0 && (
                                <Box
                                    sx={{
                                        bgcolor: 'warning.main',
                                        height: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        fontSize: '0.75rem',
                                        fontWeight: 'medium',
                                        width: `${(100 - parseFloat(String(stats.completedPercentage)) - parseFloat(String(stats.cancelledPercentage))).toFixed(1)}%`,
                                    }}
                                >
                                    {(100 - parseFloat(String(stats.completedPercentage)) - parseFloat(String(stats.cancelledPercentage))).toFixed(1)}%
                                </Box>
                            )}
                        </Box>
                    )}
                </Box>
            </Paper>
        </Box>
    );
};

// --- QR Code Payment Order Component ---
const QRCodePaymentOrder = ({ customerId, customerPhone }: { customerId: number; customerPhone: string }) => {
    const [amount, setAmount] = useState('25');
    const [qrData, setQrData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [paymentOrders, setPaymentOrders] = useState<any[]>([]);
    const [loadingOrders, setLoadingOrders] = useState(true);
    const [sendDialogOpen, setSendDialogOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [caption, setCaption] = useState('');
    const [sendingMedia, setSendingMedia] = useState(false);
    const notify = useNotify();

    // Fetch payment orders on component mount
    useEffect(() => {
        fetchPaymentOrders();
    }, [customerId]);

    const fetchPaymentOrders = async () => {
        setLoadingOrders(true);
        try {
            const token = localStorage.getItem('access_token');
            const url = `${API_URL}/api/v1/customers/${customerId}/wallet/payment-orders`;

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'X-Internal-API-Key': 'dummy_service_secret',
                },
            });

            const data = await response.json();

            if (response.ok) {
                const orders = data.items || [];
                setPaymentOrders(orders);
            } else {
                console.error('Failed to fetch payment orders:', data);
            }
        } catch (err) {
            console.error('Error fetching payment orders:', err);
        } finally {
            setLoadingOrders(false);
        }
    };

    const handleCreateQR = async () => {
        if (!amount || parseFloat(amount) <= 0) {
            setError('Please enter a valid amount');
            return;
        }

        setLoading(true);
        setError(null);
        setQrData(null);

        try {
            const token = localStorage.getItem('access_token');
            const url = `${API_URL}/api/v1/customers/${customerId}/wallet/payment-orders/qr-code`;

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'X-Internal-API-Key': 'dummy_service_secret',
                },
                body: JSON.stringify({ amount: amount }),
            });

            const data = await response.json();

            if (response.ok) {
                setQrData(data);
                notify('QR code created successfully!', { type: 'success' });
                // Refresh payment orders list
                setTimeout(() => fetchPaymentOrders(), 1000);
            } else {
                const errorMsg = data.detail?.message || data.message || data.error || 'Failed to create QR code';
                setError(errorMsg);
                notify(`Error: ${errorMsg}`, { type: 'error' });
            }
        } catch (err: any) {
            const errorMsg = err.message || 'Network error occurred';
            setError(errorMsg);
            notify(`Error: ${errorMsg}`, { type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleSendToWhatsApp = (order: any) => {
        setSelectedOrder(order);
        setCaption('');
        setSendDialogOpen(true);
    };

    const handleSendMedia = async () => {
        if (!selectedOrder || !customerPhone) {
            notify('Missing required information', { type: 'error' });
            return;
        }

        setSendingMedia(true);

        try {
            const url = 'https://prod.astrokiran.com/api/conversations/send-media/';

            const payload = {
                phone: customerPhone,
                media_type: 'image',
                media_url: selectedOrder.qr_code_url || selectedOrder.image_url,
                caption: caption || `Please scan this QR code to pay ₹${selectedOrder.amount}`,
            };

            console.log('Sending to WhatsApp:', payload);

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (response.ok && result.status === 'success') {
                notify('QR code sent to WhatsApp successfully!', { type: 'success' });
                setSendDialogOpen(false);
            } else {
                const errorMsg = result.message || result.error || 'Failed to send';
                notify(`Error: ${errorMsg}`, { type: 'error' });
            }
        } catch (err: any) {
            const errorMsg = err.message || 'Network error occurred';
            notify(`Error: ${errorMsg}`, { type: 'error' });
        } finally {
            setSendingMedia(false);
        }
    };

    return (
        <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                QR Code Payment Orders
            </Typography>

            {/* Amount Input Form */}
            <Paper
                sx={{
                    p: 3,
                    mb: 3,
                    bgcolor: 'background.paper',
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                }}
            >
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end', flexWrap: 'wrap' }}>
                    <Box sx={{ flex: '1 1 200px', minWidth: '150px' }}>
                        <Typography variant="body2" gutterBottom fontWeight="medium">
                            Amount (₹)
                        </Typography>
                        <MuiTextField
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            fullWidth
                            size="small"
                            placeholder="Enter amount"
                            inputProps={{ min: '1', step: '1' }}
                        />
                    </Box>
                    <Button
                        variant="contained"
                        onClick={handleCreateQR}
                        disabled={loading}
                        sx={{ height: 40 }}
                    >
                        {loading ? 'Creating...' : 'Generate QR Code'}
                    </Button>
                </Box>
            </Paper>

            {/* Error Display */}
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {/* Latest QR Code Display */}
            {qrData && (
                <Paper
                    sx={{
                        p: 3,
                        mb: 3,
                        bgcolor: 'success.light',
                        border: 1,
                        borderColor: 'success.main',
                        borderRadius: 1,
                    }}
                >
                    <Typography variant="h6" fontWeight="medium" gutterBottom>
                        Latest QR Code Generated
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                        {qrData.image_url && (
                            <Box
                                sx={{
                                    p: 1,
                                    bgcolor: 'white',
                                    borderRadius: 1,
                                    border: 1,
                                    borderColor: 'divider',
                                }}
                            >
                                <img
                                    src={qrData.image_url}
                                    alt="Payment QR Code"
                                    style={{
                                        width: '100px',
                                        height: '100px',
                                        display: 'block',
                                    }}
                                />
                            </Box>
                        )}

                        <Box sx={{ flex: 1 }}>
                            <Typography variant="body1" gutterBottom>
                                <strong>Amount:</strong> ₹{qrData.amount || amount}
                            </Typography>
                            {qrData.payment_url && (
                                <Typography variant="body2" sx={{ mt: 1 }}>
                                    <a href={qrData.payment_url} target="_blank" rel="noopener noreferrer">
                                        {qrData.payment_url}
                                    </a>
                                </Typography>
                            )}
                            {qrData.qr_code_id && (
                                <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
                                    Order ID: {qrData.qr_code_id}
                                </Typography>
                            )}
                        </Box>

                        <Button
                            variant="outlined"
                            size="small"
                            onClick={() => handleSendToWhatsApp({
                                ...qrData,
                                amount: qrData.amount || amount
                            })}
                            startIcon={<span>💬</span>}
                        >
                            Send to WhatsApp
                        </Button>
                    </Box>
                </Paper>
            )}

            {/* Payment Orders List */}
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Payment Orders History
            </Typography>

            {loadingOrders ? (
                <Typography color="textSecondary">Loading payment orders...</Typography>
            ) : paymentOrders.length === 0 ? (
                <Typography color="textSecondary">No payment orders found.</Typography>
            ) : (
                <TableContainer component={Paper} sx={{ border: 1, borderColor: 'divider' }}>
                    <Table sx={{ minWidth: 650 }}>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>Order ID</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>QR Code</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Amount</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Created</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {paymentOrders.map((order: any) => (
                                <TableRow key={order.payment_order_id} hover>
                                    <TableCell>
                                        <Typography variant="body2" fontWeight="medium">
                                            #{order.payment_order_id}
                                        </Typography>
                                        {order.gateway_order_id && (
                                            <Typography variant="caption" color="textSecondary" display="block">
                                                Gateway: {order.gateway_order_id}
                                            </Typography>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {order.qr_code_url || order.image_url ? (
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <img
                                                    src={order.qr_code_url || order.image_url}
                                                    alt="QR Code"
                                                    style={{
                                                        width: '50px',
                                                        height: '50px',
                                                        border: '1px solid #ddd',
                                                        borderRadius: '4px',
                                                    }}
                                                />
                                            </Box>
                                        ) : (
                                            <Typography variant="caption" color="textSecondary">
                                                No QR
                                            </Typography>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" fontWeight="medium">
                                            ₹{parseFloat(order.amount || '0').toFixed(2)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={order.status}
                                            size="small"
                                            color={order.status === 'PENDING' ? 'warning' : order.status === 'SUCCESS' ? 'success' : 'default'}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="caption" color="textSecondary">
                                            {new Date(order.created_at).toLocaleString()}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        {(order.qr_code_url || order.image_url) && (
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                onClick={() => handleSendToWhatsApp(order)}
                                                startIcon={<span>💬</span>}
                                            >
                                                Send
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Send to WhatsApp Dialog */}
            <Dialog open={sendDialogOpen} onClose={() => setSendDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Send QR Code to WhatsApp</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        {selectedOrder && (
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" color="textSecondary" gutterBottom>
                                    Order Details:
                                </Typography>
                                <Typography variant="body2">
                                    <strong>Amount:</strong> ₹{parseFloat(selectedOrder.amount || '0').toFixed(2)}
                                </Typography>
                                <Typography variant="body2">
                                    <strong>Phone:</strong> {customerPhone}
                                </Typography>
                            </Box>
                        )}

                        {selectedOrder?.qr_code_url && (
                            <Box sx={{ mb: 2, textAlign: 'center' }}>
                                <img
                                    src={selectedOrder.qr_code_url}
                                    alt="QR Code"
                                    style={{
                                        width: '150px',
                                        height: '150px',
                                        border: '1px solid #ddd',
                                        borderRadius: '8px',
                                    }}
                                />
                            </Box>
                        )}

                        <MuiTextField
                            label="Caption (optional)"
                            multiline
                            rows={3}
                            fullWidth
                            value={caption}
                            onChange={(e) => setCaption(e.target.value)}
                            placeholder="Enter a message to send with the QR code..."
                            helperText={`Default: Please scan this QR code to pay ₹${selectedOrder?.amount || '0'}`}
                            sx={{ mt: 2 }}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setSendDialogOpen(false)}>Cancel</Button>
                    <Button
                        onClick={handleSendMedia}
                        variant="contained"
                        disabled={sendingMedia}
                        startIcon={<span>💬</span>}
                    >
                        {sendingMedia ? 'Sending...' : 'Send to WhatsApp'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

// --- WhatsApp Consultation Creation Component ---
const WhatsAppConsultation = ({ customerId, xAuthId, profiles }: { customerId: number; xAuthId: number; profiles: any[] }) => {
    const [selectedProfileId, setSelectedProfileId] = useState('');
    const [mode, setMode] = useState('voice');
    const [loading, setLoading] = useState(false);
    const [consultationData, setConsultationData] = useState<any>(null);
    const notify = useNotify();

    const handleCreateConsultation = async () => {
        if (!selectedProfileId) {
            notify('Please select a profile', { type: 'warning' });
            return;
        }

        setLoading(true);
        setConsultationData(null);

        try {
            const token = localStorage.getItem('access_token');
            const url = `${API_URL}/api/v1/consultations/whatsapp`;

            const payload = {
                customer_id: customerId,
                customer_x_auth_id: xAuthId,
                profile_id: parseInt(selectedProfileId, 10),
                user_source: 'whatsapp',
                mode: mode,
            };

            console.log('Creating WhatsApp consultation:', payload);

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'X-Internal-API-Key': 'dummy_service_secret',
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (response.ok) {
                setConsultationData(data);
                notify('Consultation created successfully!', { type: 'success' });
            } else {
                const errorMsg = data.detail?.message || data.message || data.error || 'Failed to create consultation';
                notify(`Error: ${errorMsg}`, { type: 'error' });
            }
        } catch (err: any) {
            const errorMsg = err.message || 'Network error occurred';
            notify(`Error: ${errorMsg}`, { type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Create WhatsApp Consultation
            </Typography>

            {/* Consultation Creation Form */}
            <Paper
                sx={{
                    p: 3,
                    mb: 3,
                    bgcolor: 'background.paper',
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                }}
            >
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {/* Profile Selection */}
                    <Box>
                        <Typography variant="body2" gutterBottom fontWeight="medium">
                            Select Profile *
                        </Typography>
                        <MuiTextField
                            select
                            value={selectedProfileId}
                            onChange={(e) => setSelectedProfileId(e.target.value)}
                            fullWidth
                            size="small"
                            SelectProps={{
                                native: true,
                            }}
                        >
                            <option value="">Select a profile</option>
                            {profiles.map((profile: any) => (
                                <option key={profile.profile_id} value={profile.profile_id}>
                                    {profile.name} (ID: {profile.profile_id})
                                </option>
                            ))}
                        </MuiTextField>
                    </Box>

                    {/* Mode Selection */}
                    <Box>
                        <Typography variant="body2" gutterBottom fontWeight="medium">
                            Consultation Mode *
                        </Typography>
                        <MuiTextField
                            select
                            value={mode}
                            onChange={(e) => setMode(e.target.value)}
                            fullWidth
                            size="small"
                            SelectProps={{
                                native: true,
                            }}
                        >
                            <option value="voice">Voice Call</option>
                            <option value="video">Video Call</option>
                            <option value="chat">Chat</option>
                        </MuiTextField>
                    </Box>

                    {/* Create Button */}
                    <Button
                        variant="contained"
                        onClick={handleCreateConsultation}
                        disabled={loading || !selectedProfileId}
                        sx={{ alignSelf: 'flex-start' }}
                    >
                        {loading ? 'Creating...' : 'Create Consultation'}
                    </Button>
                </Box>
            </Paper>

            {/* Consultation Result Display */}
            {consultationData && (
                <Paper
                    sx={{
                        p: 3,
                        bgcolor: 'success.light',
                        border: 1,
                        borderColor: 'success.main',
                        borderRadius: 1,
                    }}
                >
                    <Typography variant="h6" fontWeight="medium" gutterBottom>
                        Consultation Created Successfully!
                    </Typography>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}>
                        <Typography variant="body2">
                            <strong>Consultation ID:</strong> {consultationData.consultation_id}
                        </Typography>
                        <Typography variant="body2">
                            <strong>State:</strong> {consultationData.state}
                        </Typography>
                        <Typography variant="body2">
                            <strong>Mode:</strong> {consultationData.mode}
                        </Typography>
                        <Typography variant="body2">
                            <strong>Customer ID:</strong> {consultationData.customer_id}
                        </Typography>
                        <Typography variant="body2">
                            <strong>Profile ID:</strong> {consultationData.profile_id}
                        </Typography>
                        {consultationData.workflow_id && (
                            <Typography variant="body2">
                                <strong>Workflow ID:</strong> {consultationData.workflow_id}
                            </Typography>
                        )}
                        {consultationData.message && (
                            <Alert severity="success" sx={{ mt: 2 }}>
                                {consultationData.message}
                            </Alert>
                        )}
                    </Box>
                </Paper>
            )}
        </Box>
    );
};

const CustomerShowView = () => {
    const record = useRecordContext();

    // The component will now only render when 'record' is available.
    if (!record) return null;

    const customerIdAsNumber = Number(record.id);

    // Extract x_auth_id and profiles for WhatsApp consultation
    const xAuthId = record.x_auth_id;
    const profiles = record.profile?.[0]?.profiles || [];

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Card>
                <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <Typography variant="h5">Customer Overview</Typography>
                    </Box>
                    <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", p: 2 }}>
                        <Box sx={{ flex: "1 1 300px", minWidth: "250px" }}>
                            <Typography variant="subtitle2" color="textSecondary" fontWeight="-semibold">
                                Primary Phone
                            </Typography>
                            <TextField source="phone" />
                        </Box>

                        <Box sx={{ flex: "1 1 300px", minWidth: "250px" }}>
                            <Typography variant="subtitle2" color="textSecondary" fontWeight="-semibold">
                                Customer ID
                            </Typography>
                            <TextField source="id" />
                        </Box>

                        <Box sx={{ flex: "1 1 300px", minWidth: "250px" }}>
                            <Typography variant="subtitle2" color="textSecondary" fontWeight="-semibold">
                                Customer Since
                            </Typography>
                            <DateField source="created_at" showTime />
                        </Box>
                    </Box>
                </CardContent>
            </Card>

            <ProfilesGrid />

            {/* Collapsible Wallet Section */}
            <CollapsibleSection
                title="Wallet"
                icon={<span>💳</span>}
                defaultOpen={false}
            >
                <WalletBalance customerId={customerIdAsNumber} />
                <WalletTransactions customerId={customerIdAsNumber} />
            </CollapsibleSection>

            {/* Collapsible Consultation Orders Section */}
            <CollapsibleSection
                title="Consultation Orders"
                icon={<span>🛒</span>}
                defaultOpen={false}
            >
                <CustomerOrders customerId={customerIdAsNumber} />
            </CollapsibleSection>

            {/* Collapsible Payment Orders Section */}
            <CollapsibleSection
                title="Payment Orders"
                icon={<span>💳</span>}
                defaultOpen={false}
            >
                <CustomerPaymentOrders customerId={customerIdAsNumber} />
            </CollapsibleSection>

            {/* Collapsible QR Code Payment Order Section */}
            <CollapsibleSection
                title="QR Code Payment"
                icon={<span>📱</span>}
                defaultOpen={false}
            >
                <QRCodePaymentOrder customerId={customerIdAsNumber} customerPhone={record.phone} />
            </CollapsibleSection>

            {/* Collapsible WhatsApp Consultation Section */}
            {profiles && profiles.length > 0 && (
                <CollapsibleSection
                    title="WhatsApp Consultation"
                    icon={<span>💬</span>}
                    defaultOpen={false}
                >
                    <WhatsAppConsultation
                        customerId={customerIdAsNumber}
                        xAuthId={xAuthId}
                        profiles={profiles}
                    />
                </CollapsibleSection>
            )}
        </Box>
    );
};

export const CustomerShow = () => (
    <Show>
        <CustomerShowView />
    </Show>
);
