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
        .then(() => {
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
        if (!record) return;
        setIsSaving(true);
        httpClient(`${API_URL}/api/v1/customers/${record.id}/profile`, { // The API endpoint for updating
            method: 'PUT',
            body: JSON.stringify(formData),
        })
        .then(() => { notify('Profile updated successfully!'); setEditingProfile(null); refresh(); })
        .catch(error => notify(`Error: ${error.message || 'An error occurred'}`, { type: 'warning' }))
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
            <Dialog open={!!editingProfile} onClose={() => setEditingProfile(null)} maxWidth="sm" fullWidth>
                <DialogTitle>Edit Profile for {record.name}</DialogTitle>
                <DialogContent>
                    <UpdateProfileForm
                        profile={editingProfile}
                        onSave={handleUpdateSave}
                        onCancel={() => setEditingProfile(null)}
                        saving={isSaving}
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

const UpdateProfileForm = ({ profile, onSave, onCancel, saving }: { profile: any; onSave: (data: any) => void; onCancel: () => void; saving: boolean; }) => {
    const [name, setName] = useState('');
    const [dob, setDob] = useState('');
    const [tob, setTob] = useState('');
    const [birthCity, setBirthCity] = useState('');
    const [birthCountry, setBirthCountry] = useState('');
    const [preferredLanguage, setPreferredLanguage] = useState('');
    const [zodiacSign, setZodiacSign] = useState('');


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
        });
    };

    return (
       <form onSubmit={handleSubmit} style={{ display: 'contents' }}>
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
                <Box sx={{ flex: "1 1 100%", display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
                    <Button type="button" onClick={onCancel}>Cancel</Button>
                    <Button type="submit" variant="contained" disabled={saving}>
                        {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </Box>
            </Box>
        </form>
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

const CustomerShowView = () => {
    const record = useRecordContext();

    // The component will now only render when 'record' is available.
    if (!record) return null;

    const customerIdAsNumber = Number(record.id);

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
        </Box>
    );
};

export const CustomerShow = () => (
    <Show>
        <CustomerShowView />
    </Show>
);
