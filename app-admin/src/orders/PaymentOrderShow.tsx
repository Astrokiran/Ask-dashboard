import * as React from 'react';
import {
    Show,
    SimpleShowLayout,
    TextField,
    DateField,
    FunctionField,
    BooleanField,
    NumberField,
    TopToolbar,
    EditButton,
    useRecordContext,
    Labeled,
    useShowController,
} from 'react-admin';
import { Card, CardContent, Box, Typography, Paper, styled } from '@mui/material';

// Payment Order status configurations
const PAYMENT_ORDER_STATUSES = {
    PENDING: { label: 'Pending', color: '#FFA500' },
    SUCCESSFUL: { label: 'Successful', color: '#4CAF50' },
    FAILED: { label: 'Failed', color: '#F44336' },
    CANCELLED: { label: 'Cancelled', color: '#9E9E9E' },
    EXPIRED: { label: 'Expired', color: '#757575' },
};

// Custom Status Field Component
const PaymentOrderStatusField = () => {
    const record = useRecordContext();
    if (!record?.status) return <span>-</span>;

    const statusKey = String(record.status).toUpperCase() as keyof typeof PAYMENT_ORDER_STATUSES;
    const statusConfig = PAYMENT_ORDER_STATUSES[statusKey];

    return (
        <Box
            sx={{
                display: 'inline-block',
                padding: '4px 12px',
                borderRadius: '16px',
                backgroundColor: statusConfig?.color || '#9E9E9E',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '0.875rem',
            }}
        >
            {statusConfig?.label || status}
        </Box>
    );
};

// Custom Actions Component
const PaymentOrderShowActions = () => (
    <TopToolbar>
        <EditButton />
    </TopToolbar>
);

// Styled components
const StyledPaper = styled(Paper)(({ theme }) => ({
    marginBottom: theme.spacing(2),
    padding: theme.spacing(2),
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
    variant: 'h6',
    fontWeight: 'bold',
    marginBottom: theme.spacing(2),
    color: theme.palette.primary.main,
}));

// Currency formatter component
const CurrencyField = ({ source, label }: { source: string; label: string }) => {
    const record = useRecordContext();
    const value = record?.[source];

    if (value === null || value === undefined) {
        return <Typography variant="body2"><strong>{label}:</strong> N/A</Typography>;
    }

    return (
        <Typography variant="body2">
            <strong>{label}:</strong> {new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
            }).format(parseFloat(value))}
        </Typography>
    );
};

const PaymentOrderShow = () => {
    const { record, isLoading } = useShowController();

    if (isLoading || !record) {
        return <div>Loading...</div>;
    }

    return (
        <Show actions={<PaymentOrderShowActions />}>
            <SimpleShowLayout>
                <Box display="flex" flexWrap="wrap" gap={3}>
                    {/* Order Information */}
                    <Box flex="1 1 400px" minWidth="300px">
                        <StyledPaper>
                            <SectionTitle variant="h6">Payment Order Information</SectionTitle>
                            <Box display="flex" flexDirection="column" gap={2}>
                                <Typography variant="body2">
                                    <strong>Payment Order ID:</strong> {record?.id}
                                </Typography>
                                <Typography variant="body2">
                                    <strong>User ID:</strong> {record?.user_id}
                                </Typography>
                                <Typography variant="body2">
                                    <strong>Gateway Order ID:</strong> {record?.gateway_order_id || 'N/A'}
                                </Typography>
                                <Typography variant="body2">
                                    <strong>Payment Method:</strong> {record?.payment_method || 'N/A'}
                                </Typography>
                                <Box>
                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                        <strong>Status:</strong>
                                    </Typography>
                                    <PaymentOrderStatusField />
                                </Box>
                                <Typography variant="body2">
                                    <strong>Task ID:</strong> {record?.task_id || 'N/A'}
                                </Typography>
                            </Box>
                        </StyledPaper>
                    </Box>

                    {/* Financial Information */}
                    <Box flex="1 1 400px" minWidth="300px">
                        <StyledPaper>
                            <SectionTitle variant="h6">Financial Information</SectionTitle>
                            <Box display="flex" flexDirection="column" gap={2}>
                                <CurrencyField source="amount" label="Amount" />
                                <CurrencyField source="tax_amount" label="Tax Amount" />
                                <Typography variant="body2">
                                    <strong>Currency:</strong> {record?.currency || 'N/A'}
                                </Typography>
                                <Typography variant="body2">
                                    <strong>Virtual Cash Amount:</strong> ₹{parseFloat(record?.virtual_cash_amount || 0).toFixed(2)}
                                </Typography>
                                <Typography variant="body2">
                                    <strong>Wallet Credited:</strong> {record?.wallet_credited ? 'Yes' : 'No'}
                                </Typography>
                            </Box>
                        </StyledPaper>
                    </Box>

                    {/* Timestamps */}
                    <Box flex="1 1 400px" minWidth="300px">
                        <StyledPaper>
                            <SectionTitle variant="h6">Timestamps</SectionTitle>
                            <Box display="flex" flexDirection="column" gap={2}>
                                <Typography variant="body2">
                                    <strong>Created At:</strong> {record?.created_at ? new Date(record.created_at).toLocaleString() : 'N/A'}
                                </Typography>
                                <Typography variant="body2">
                                    <strong>Updated At:</strong> {record?.updated_at ? new Date(record.updated_at).toLocaleString() : 'N/A'}
                                </Typography>
                            </Box>
                        </StyledPaper>
                    </Box>
                </Box>
            </SimpleShowLayout>
        </Show>
    );
};

export default PaymentOrderShow;