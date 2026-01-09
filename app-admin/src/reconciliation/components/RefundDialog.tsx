import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    CircularProgress,
    Alert,
    FormControlLabel,
    Checkbox,
    Typography,
} from '@mui/material';
import { useDataProvider, useNotify, useRefresh } from 'react-admin';

interface RefundDialogProps {
    open: boolean;
    onClose: () => void;
    consultationId: number;
    customerId: number;
}

export const RefundDialog: React.FC<RefundDialogProps> = ({
    open,
    onClose,
    consultationId,
    customerId,
}) => {
    const [reconciliationMethod, setReconciliationMethod] = useState<'wallet_credit' | 'voucher_allocation'>('voucher_allocation');
    const [offerId, setOfferId] = useState('');
    const [sendNotification, setSendNotification] = useState(true);
    const [loading, setLoading] = useState(false);
    const [offers, setOffers] = useState<any[]>([]);
    const [fetchingOffers, setFetchingOffers] = useState(true);
    const [error, setError] = useState('');

    const dataProvider = useDataProvider();
    const notify = useNotify();
    const refresh = useRefresh();

    // Fetch reconciliation offers on mount
    useEffect(() => {
        const fetchOffers = async () => {
            setFetchingOffers(true);
            try {
                const { data } = await dataProvider.getList('reconciliation-offers', {
                    pagination: { page: 1, perPage: 100 },
                    sort: { field: 'valid_from', order: 'DESC' },
                    filter: {},
                });
                setOffers(data);

                // Pre-select the default reconciliation offer
                const defaultOfferId = 'b333533b-e4fa-4784-be8a-4b2987b891d9';
                if (data.find((o: any) => o.offer_id === defaultOfferId)) {
                    setOfferId(defaultOfferId);
                } else if (data.length > 0) {
                    setOfferId(data[0].offer_id);
                }
            } catch (err) {
                console.error('Error fetching offers:', err);
                notify('Error fetching reconciliation offers', { type: 'error' });
            } finally {
                setFetchingOffers(false);
            }
        };

        if (open) {
            fetchOffers();
        }
    }, [open, dataProvider, notify]);

    const handleSubmit = async () => {
        if (reconciliationMethod === 'voucher_allocation' && !offerId) {
            setError('Please select an offer for voucher allocation.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await dataProvider.custom('triggerRefund', 'consultations', {
                consultationId,
                reconciliationMethod: reconciliationMethod,
                offerId: reconciliationMethod === 'voucher_allocation' ? offerId : undefined,
                sendNotification: sendNotification,
            });

            notify('Refund processed successfully', { type: 'success' });
            refresh();
            handleClose();
        } catch (err: any) {
            console.error('Error processing refund:', err);
            setError(err.message || 'Failed to process refund');
            notify('Failed to process refund', { type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setError('');
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>Process Refund for Consultation #{consultationId}</DialogTitle>
            <DialogContent>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <FormControl fullWidth margin="normal">
                    <InputLabel>Reconciliation Method</InputLabel>
                    <Select
                        value={reconciliationMethod}
                        label="Reconciliation Method"
                        onChange={(e) => setReconciliationMethod(e.target.value as any)}
                    >
                        <MenuItem value="voucher_allocation">Voucher Allocation</MenuItem>
                        <MenuItem value="wallet_credit">Wallet Credit</MenuItem>
                    </Select>
                </FormControl>

                {reconciliationMethod === 'voucher_allocation' && (
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Select Offer</InputLabel>
                        <Select
                            value={offerId}
                            label="Select Offer"
                            onChange={(e) => setOfferId(e.target.value)}
                            disabled={fetchingOffers}
                        >
                            {offers.map((offer) => (
                                <MenuItem key={offer.offer_id} value={offer.offer_id}>
                                    {offer.offer_name} ({offer.free_minutes || 0} minutes)
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                )}

                <FormControlLabel
                    control={
                        <Checkbox
                            checked={sendNotification}
                            onChange={(e) => setSendNotification(e.target.checked)}
                            color="primary"
                        />
                    }
                    label="Send notification to customer"
                    sx={{ mt: 2 }}
                />

                <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                    This will process a refund for consultation #{consultationId} for customer #{customerId}
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} disabled={loading}>
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    color="primary"
                    disabled={loading || fetchingOffers}
                >
                    {loading ? <CircularProgress size={24} /> : 'Process Refund'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
