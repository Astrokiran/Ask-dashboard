import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
    Typography,
    Alert,
    CircularProgress,
    MenuItem,
    Select,
    InputLabel,
    FormControl,
} from '@mui/material';
import { useDataProvider, useRefresh, useNotify } from 'react-admin';

interface CreateReconciliationVoucherDialogProps {
    open: boolean;
    onClose: () => void;
}

interface ReconciliationOffer {
    offer_id: string;
    offer_name: string;
    offer_type: string;
    voucher_subtype: string;
    free_minutes?: number;
    bonus_percentage?: string;
    bonus_fixed_amount?: string;
}

const EXPIRES_IN_SECONDS = 604800; // 7 days

export const CreateReconciliationVoucherDialog: React.FC<CreateReconciliationVoucherDialogProps> = ({
    open,
    onClose,
}) => {
    const [customerId, setCustomerId] = useState('');
    const [consultationId, setConsultationId] = useState('');
    const [reason, setReason] = useState('');
    const [selectedOfferId, setSelectedOfferId] = useState('');
    const [offers, setOffers] = useState<ReconciliationOffer[]>([]);
    const [offersLoading, setOffersLoading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const dataProvider = useDataProvider();
    const refresh = useRefresh();
    const notify = useNotify();

    // Fetch reconciliation offers when dialog opens
    useEffect(() => {
        if (open) {
            fetchReconciliationOffers();
        }
    }, [open]);

    const fetchReconciliationOffers = async () => {
        setOffersLoading(true);
        setError('');
        try {
            const { data } = await dataProvider.getList('reconciliation-offers', {
                pagination: { page: 1, perPage: 100 },
                sort: { field: 'valid_from', order: 'DESC' },
                filter: {},
            });
            setOffers(data);
            // Auto-select the first offer if available
            if (data.length > 0 && !selectedOfferId) {
                setSelectedOfferId(data[0].offer_id);
            }
        } catch (err: any) {
            console.error('Error fetching reconciliation offers:', err);
            setError('Failed to load reconciliation offers. Please try again.');
        } finally {
            setOffersLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Get admin user ID from localStorage if available
            const userStr = localStorage.getItem('user');
            const user = userStr ? JSON.parse(userStr) : null;
            const adminUserId = user?.id;

            await dataProvider.custom('createVoucher', 'reconciliation', {
                offerId: selectedOfferId,
                customerId: parseInt(customerId, 10),
                consultationId: consultationId ? parseInt(consultationId, 10) : undefined,
                reason: reason || undefined,
                expiresInSeconds: EXPIRES_IN_SECONDS,
                adminUserId: adminUserId,
            });

            notify('Reconciliation voucher created successfully', { type: 'success' });
            refresh();

            // Reset form
            setCustomerId('');
            setConsultationId('');
            setReason('');
            setSelectedOfferId('');
            onClose();
        } catch (err: any) {
            console.error('Error creating voucher:', err);
            setError(err.message || 'Failed to create voucher. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (!loading) {
            setCustomerId('');
            setConsultationId('');
            setReason('');
            setSelectedOfferId('');
            setError('');
            onClose();
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>Create Reconciliation Voucher</DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent>
                    <Box sx={{ mb: 2 }}>
                        <Alert severity="info" sx={{ mb: 2 }}>
                            This will create a reconciliation voucher valid for 7 days using the selected offer.
                        </Alert>
                    </Box>

                    {error && (
                        <Box sx={{ mb: 2 }}>
                            <Alert severity="error">{error}</Alert>
                        </Box>
                    )}

                    {offersLoading && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                            <CircularProgress size={24} />
                        </Box>
                    )}

                    <FormControl fullWidth sx={{ mb: 2 }} required>
                        <InputLabel id="offer-select-label">Select Reconciliation Offer</InputLabel>
                        <Select
                            labelId="offer-select-label"
                            value={selectedOfferId}
                            label="Select Reconciliation Offer *"
                            onChange={(e) => setSelectedOfferId(e.target.value)}
                            disabled={loading || offersLoading}
                        >
                            {offers.map((offer) => (
                                <MenuItem key={offer.offer_id} value={offer.offer_id}>
                                    {offer.offer_name}
                                    {offer.voucher_subtype && ` (${offer.voucher_subtype})`}
                                    {offer.free_minutes && ` - ${offer.free_minutes} min`}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <TextField
                        autoFocus
                        margin="dense"
                        label="Customer ID *"
                        type="number"
                        fullWidth
                        required
                        value={customerId}
                        onChange={(e) => setCustomerId(e.target.value)}
                        disabled={loading}
                        sx={{ mb: 2 }}
                    />

                    <TextField
                        margin="dense"
                        label="Consultation ID (Optional)"
                        type="number"
                        fullWidth
                        value={consultationId}
                        onChange={(e) => setConsultationId(e.target.value)}
                        disabled={loading}
                        sx={{ mb: 2 }}
                    />

                    <TextField
                        margin="dense"
                        label="Reason (Optional)"
                        fullWidth
                        multiline
                        rows={3}
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        disabled={loading}
                        placeholder="Reason for granting this voucher..."
                        sx={{ mb: 2 }}
                    />

                    {selectedOfferId && (
                        <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(0, 0, 0, 0.03)', borderRadius: 1 }}>
                            <Typography variant="body2" color="textSecondary">
                                <strong>Offer ID:</strong> {selectedOfferId}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                <strong>Expires In:</strong> 7 days (604800 seconds)
                            </Typography>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} disabled={loading} color="inherit">
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={loading || !customerId || !selectedOfferId}
                        startIcon={loading ? <CircularProgress size={20} /> : null}
                    >
                        {loading ? 'Creating...' : 'Create Voucher'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};
