import * as React from 'react';
import {
    List,
    Datagrid,
    TextField,
    DateField,
    ReferenceField,
    ChipField,
    TopToolbar,
    FilterButton,
    CreateButton,
    ExportButton,
    useListContext,
    useRecordContext,
    TextInput,
    SelectInput,
    FunctionField,
    NumberField
} from 'react-admin';
import { Card, CardContent, Box, Typography, Paper, styled, Grid } from '@mui/material';
import { DateProvider } from 'react-admin';
import { format } from 'date-fns';

// Custom styled components for better appearance
const StyledCard = styled(Card)(({ theme }) => ({
    marginBottom: theme.spacing(2),
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
}));

const StatusChip = styled(ChipField)(({ theme }) => ({
    '&.ra-field': {
        fontWeight: 'bold',
    },
}));

// Payment Order status configurations
const PAYMENT_ORDER_STATUSES = {
    PENDING: { label: 'Pending', color: '#FFA500' },
    SUCCESSFUL: { label: 'Successful', color: '#4CAF50' },
    FAILED: { label: 'Failed', color: '#F44336' },
    CANCELLED: { label: 'Cancelled', color: '#9E9E9E' },
    EXPIRED: { label: 'Expired', color: '#757575' },
};

// Custom Status Field Component
const PaymentOrderStatusField = ({ source }) => {
    const record = useRecordContext();
    if (!record?.[source]) return <span>-</span>;

    const status = record[source];
    const statusConfig = PAYMENT_ORDER_STATUSES[status.toUpperCase()];

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

// Filters for the payment orders list
const PaymentOrderFilters = [
    <TextInput source="customer_id" label="Customer ID" alwaysOn />,
    <SelectInput
        source="status"
        choices={Object.entries(PAYMENT_ORDER_STATUSES).map(([key, value]) => ({
            id: value.label,
            name: value.label,
        }))}
    />,
    <TextInput source="payment_method" label="Payment Method" />,
];

// Custom List Actions
const PaymentOrderListActions = () => {
    return (
        <TopToolbar>
            <FilterButton />
            <CreateButton
                label="Create Payment Order"
                resource="payment-orders"
            />
            <ExportButton />
        </TopToolbar>
    );
};

// Statistics calculation function
const getPaymentOrderStats = (orders: any[]) => {
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
            successfulAmount: 0,
            walletCreditedCount: 0
        };
    }

    const successful = orders.filter(order => order.status?.toLowerCase() === 'successful').length;
    const failed = orders.filter(order => order.status?.toLowerCase() === 'failed').length;
    const pending = orders.filter(order => order.status?.toLowerCase() === 'pending').length;
    const other = orders.filter(order =>
        order.status?.toLowerCase() !== 'successful' &&
        order.status?.toLowerCase() !== 'failed' &&
        order.status?.toLowerCase() !== 'pending'
    ).length;

    const totalAmount = orders.reduce((sum, order) => sum + (parseFloat(order.amount || 0)), 0);
    const successfulAmount = orders
        .filter(order => order.status?.toLowerCase() === 'successful')
        .reduce((sum, order) => sum + (parseFloat(order.amount || 0)), 0);

    const walletCreditedCount = orders.filter(order => order.wallet_credited === true).length;

    return {
        total: orders.length,
        successful,
        failed,
        pending: pending + other,
        successfulPercentage: orders.length > 0 ? ((successful / orders.length) * 100).toFixed(1) : '0',
        failedPercentage: orders.length > 0 ? ((failed / orders.length) * 100).toFixed(1) : '0',
        pendingPercentage: orders.length > 0 ? (((pending + other) / orders.length) * 100).toFixed(1) : '0',
        totalAmount,
        successfulAmount,
        walletCreditedCount
    };
};

const StyledPaper = styled(Paper)(({ theme }) => ({
    marginBottom: theme.spacing(2),
    padding: theme.spacing(2),
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
    variant: 'h6',
    fontWeight: 'bold',
    marginBottom: theme.spacing(2),
    color: theme.palette.primary.main,
}));

// Main Component
const PaymentOrderListContent = (props) => {
    const { data, filterValues } = useListContext();

    // Filter out mock data
    const realData = data?.filter(item => !item.is_mock) || [];

    // Calculate statistics based on filtered data
    const stats = getPaymentOrderStats(realData);

    // Show message when no customer_id is provided or when only mock data exists
    if (!filterValues.customer_id || (data?.length === 1 && data[0].is_mock)) {
        return (
            <Box p={4} textAlign="center">
                <Typography variant="h6" color="textSecondary">
                    Enter a Customer ID to view payment orders
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                    Use the filter above to search for payment orders by customer
                </Typography>
            </Box>
        );
    }

    return (
        <Box>
            <Datagrid
                rowClick="show"
                bulkActionButtons={false}
                {...props}
            >
                <TextField
                    source="id"
                    label="Payment Order ID"
                    sortable={false}
                />
                <TextField
                    source="user_id"
                    label="User ID"
                    sortable={false}
                />
                <PaymentOrderStatusField
                    source="status"
                    label="Status"
                    sortable={false}
                />
                <FunctionField
                    label="Amount"
                    render={(record) => {
                        if (!record?.amount) return 'N/A';
                        return new Intl.NumberFormat('en-IN', {
                            style: 'currency',
                            currency: 'INR',
                        }).format(parseFloat(record.amount));
                    }}
                    sortable={false}
                />
                <TextField
                    source="payment_method"
                    label="Payment Method"
                    sortable={false}
                />
                <TextField
                    source="gateway_order_id"
                    label="Gateway Order ID"
                    sortable={false}
                />
                <DateField
                    source="created_at"
                    label="Created At"
                    showTime
                    sortable={false}
                />
                <FunctionField
                    label="Wallet Credited"
                    render={(record) => record?.wallet_credited ? 'Yes' : 'No'}
                    sortable={false}
                />
            </Datagrid>

            {/* Payment Order Statistics Summary - Only show when there's real data */}
            {realData.length > 0 && (
                <Box mt={3}>
                    <StyledPaper>
                        <SectionTitle>Payment Order Summary</SectionTitle>

                        <Box mb={3}>
                            <Grid container spacing={2}>
                                {/* Total Orders */}
                                <Grid item xs={6} sm={3}>
                                    <Box textAlign="center" p={2} className="bg-white rounded border">
                                        <Typography variant="h4" fontWeight="bold" color="textPrimary">
                                            {stats.total}
                                        </Typography>
                                        <Typography variant="caption" color="textSecondary">
                                            Total Orders
                                        </Typography>
                                    </Box>
                                </Grid>

                                {/* Successful Orders */}
                                <Grid item xs={6} sm={3}>
                                    <Box textAlign="center" p={2} className="bg-white rounded border">
                                        <Typography variant="h4" fontWeight="bold" color="success.main">
                                            {stats.successful}
                                        </Typography>
                                        <Typography variant="caption" color="textSecondary">
                                            Successful ({stats.successfulPercentage}%)
                                        </Typography>
                                    </Box>
                                </Grid>

                                {/* Failed Orders */}
                                <Grid item xs={6} sm={3}>
                                    <Box textAlign="center" p={2} className="bg-white rounded border">
                                        <Typography variant="h4" fontWeight="bold" color="error.main">
                                            {stats.failed}
                                        </Typography>
                                        <Typography variant="caption" color="textSecondary">
                                            Failed ({stats.failedPercentage}%)
                                        </Typography>
                                    </Box>
                                </Grid>

                                {/* Other Status Orders */}
                                <Grid item xs={6} sm={3}>
                                    <Box textAlign="center" p={2} className="bg-white rounded border">
                                        <Typography variant="h4" fontWeight="bold" color="warning.main">
                                            {stats.pending}
                                        </Typography>
                                        <Typography variant="caption" color="textSecondary">
                                            Other ({stats.pendingPercentage}%)
                                        </Typography>
                                    </Box>
                                </Grid>
                            </Grid>
                        </Box>

                        {/* Amount Summary */}
                        <Box mb={3}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={4}>
                                    <Box textAlign="center" p={2} className="bg-white rounded border">
                                        <Typography variant="h5" fontWeight="bold" color="primary.main">
                                            ₹{stats.totalAmount.toFixed(2)}
                                        </Typography>
                                        <Typography variant="caption" color="textSecondary">
                                            Total Amount
                                        </Typography>
                                    </Box>
                                </Grid>

                                <Grid item xs={12} sm={4}>
                                    <Box textAlign="center" p={2} className="bg-white rounded border">
                                        <Typography variant="h5" fontWeight="bold" color="success.main">
                                            ₹{stats.successfulAmount.toFixed(2)}
                                        </Typography>
                                        <Typography variant="caption" color="textSecondary">
                                            Successful Amount
                                        </Typography>
                                    </Box>
                                </Grid>

                                <Grid item xs={12} sm={4}>
                                    <Box textAlign="center" p={2} className="bg-white rounded border">
                                        <Typography variant="h5" fontWeight="bold" color="info.main">
                                            {stats.walletCreditedCount}
                                        </Typography>
                                        <Typography variant="caption" color="textSecondary">
                                            Wallet Credited
                                        </Typography>
                                    </Box>
                                </Grid>
                            </Grid>
                        </Box>

                        {/* Visual Status Bar */}
                        {stats.total > 0 && (
                            <Box>
                                <Box
                                    sx={{
                                        width: '100%',
                                        backgroundColor: 'grey.200',
                                        borderRadius: 2,
                                        height: 32,
                                        overflow: 'hidden',
                                        display: 'flex'
                                    }}
                                >
                                    {stats.successful > 0 && (
                                        <Box
                                            sx={{
                                                backgroundColor: 'success.main',
                                                height: '100%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'white',
                                                fontSize: '0.75rem',
                                                fontWeight: 'bold',
                                                width: `${stats.successfulPercentage}%`
                                            }}
                                        >
                                            {stats.successfulPercentage}%
                                        </Box>
                                    )}
                                    {stats.failed > 0 && (
                                        <Box
                                            sx={{
                                                backgroundColor: 'error.main',
                                                height: '100%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'white',
                                                fontSize: '0.75rem',
                                                fontWeight: 'bold',
                                                width: `${stats.failedPercentage}%`
                                            }}
                                        >
                                            {stats.failedPercentage}%
                                        </Box>
                                    )}
                                    {stats.pending > 0 && (
                                        <Box
                                            sx={{
                                                backgroundColor: 'warning.main',
                                                height: '100%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'white',
                                                fontSize: '0.75rem',
                                                fontWeight: 'bold',
                                                width: `${stats.pendingPercentage}%`
                                            }}
                                        >
                                            {stats.pendingPercentage}%
                                        </Box>
                                    )}
                                </Box>
                                <Box mt={1} display="flex" justifyContent="center" gap={2}>
                                    <Box display="flex" alignItems="center" gap={1}>
                                        <Box sx={{ width: 12, height: 12, backgroundColor: 'success.main', borderRadius: 0.5 }} />
                                        <Typography variant="caption" color="textSecondary">Successful</Typography>
                                    </Box>
                                    <Box display="flex" alignItems="center" gap={1}>
                                        <Box sx={{ width: 12, height: 12, backgroundColor: 'error.main', borderRadius: 0.5 }} />
                                        <Typography variant="caption" color="textSecondary">Failed</Typography>
                                    </Box>
                                    <Box display="flex" alignItems="center" gap={1}>
                                        <Box sx={{ width: 12, height: 12, backgroundColor: 'warning.main', borderRadius: 0.5 }} />
                                        <Typography variant="caption" color="textSecondary">Other</Typography>
                                    </Box>
                                </Box>
                            </Box>
                        )}
                    </StyledPaper>
                </Box>
            )}
        </Box>
    );
};

// Export the component with filters and actions
export const PaymentOrderList = (props) => {
    return (
        <List
            {...props}
            filters={PaymentOrderFilters}
            actions={<PaymentOrderListActions />}
            title="Payment Orders"
            empty={
                <Box p={2} textAlign="center">
                    <Typography variant="h6" color="textSecondary">
                        No payment orders found
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                        Create a new payment order to get started
                    </Typography>
                </Box>
            }
        >
            <PaymentOrderListContent />
        </List>
    );
};

export default PaymentOrderList;