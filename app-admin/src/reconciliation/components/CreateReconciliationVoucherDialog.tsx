import React, { useState } from 'react';
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
} from '@mui/material';
import { useDataProvider, useRefresh, useNotify } from 'react-admin';

interface CreateReconciliationVoucherDialogProps {
    open: boolean;
    onClose: () => void;
}

const OFFER_ID = 'b333533b-e4fa-4784-be8a-4b2987b891d9';
const EXPIRES_IN_SECONDS = 604800; // 7 days

export const CreateReconciliationVoucherDialog: React.FC<CreateReconciliationVoucherDialogProps> = ({
    open,
    onClose,
}) => {
    const [customerId, setCustomerId] = useState('');
    const [consultationId, setConsultationId] = useState('');
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const dataProvider = useDataProvider();
    const refresh = useRefresh();
    const notify = useNotify();

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
                offerId: OFFER_ID,
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
                            This will create a reconciliation voucher with 3 free minutes valid for 7 days.
                        </Alert>
                    </Box>

                    {error && (
                        <Box sx={{ mb: 2 }}>
                            <Alert severity="error">{error}</Alert>
                        </Box>
                    )}

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

                    <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(0, 0, 0, 0.03)', borderRadius: 1 }}>
                        <Typography variant="body2" color="textSecondary">
                            <strong>Offer ID:</strong> {OFFER_ID}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            <strong>Expires In:</strong> 7 days (604800 seconds)
                        </Typography>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} disabled={loading} color="inherit">
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={loading || !customerId}
                        startIcon={loading ? <CircularProgress size={20} /> : null}
                    >
                        {loading ? 'Creating...' : 'Create Voucher'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};
