import React, { useState, useEffect } from 'react';
import {
    Card,
    CardContent,
    Typography,
    TextField,
    Button,
    Box,
    CircularProgress,
    Alert,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Pagination,
    Chip,
    Grid,
    InputAdornment,
} from '@mui/material';
import { Search } from '@mui/icons-material';
import { useDataProvider, useNotify } from 'react-admin';
import { useParams, useNavigate } from 'react-router-dom';

interface CompletedOrder {
    order_id: number;
    user_id: number;
    consultant_id: number;
    service_type: 'CHAT' | 'CALL' | 'VIDEO';
    status: string;
    minutes_ordered: number;
    seconds_ordered: number;
    max_duration_minutes: number;
    max_duration_seconds: number;
    price_per_minute: string;
    total_mrp: string;
    final_amount: string;
    discount: string;
    consultant_share: string;
    consultant_share_percent: string;
    consultant_paid: boolean;
    consultant_payment_date: string | null;
    payout_id: number | null;
    created_at: string;
    completed_at: string | null;
    applied_coupon_code: string;
    metadata: any;
}

interface OrdersResponse {
    items: CompletedOrder[];
    pagination: {
        page: number;
        per_page: number;
        total_items: number;
        total_pages: number;
    };
}

const GuideOrders: React.FC = () => {
    const { id: urlId } = useParams<{ id: string }>();
    const dataProvider = useDataProvider();
    const notify = useNotify();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [orders, setOrders] = useState<CompletedOrder[]>([]);
    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [guideId, setGuideId] = useState(urlId || '');
    const [currentGuideId, setCurrentGuideId] = useState(urlId || '');

    const itemsPerPage = 20;

    const fetchOrders = async (
        page: number = 1,
        search: string = '',
        startDate?: string,
        endDate?: string,
        status: string = ''
    ) => {
        if (!currentGuideId) return;

        setLoading(true);
        setError(null);

        try {
            const result = await dataProvider.custom(
                'getCompletedOrders',
                'guides',
                {
                    consultantId: currentGuideId,
                    page,
                    perPage: itemsPerPage,
                    startDate,
                    endDate,
                    status: status || undefined
                }
            );

            const response: OrdersResponse = result.data;
            setOrders(response.items || []);
            setTotalItems(response.pagination.total_items || 0);
            setCurrentPage(response.pagination.page || 1);
            setTotalPages(response.pagination.total_pages || 1);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch completed orders');
            notify('Failed to fetch completed orders', { type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
        setCurrentPage(value);
        fetchOrders(
            value,
            searchTerm,
            startDate || undefined,
            endDate || undefined,
            statusFilter
        );
    };

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };

    const handleSearch = () => {
        setCurrentPage(1);
        fetchOrders(
            1,
            searchTerm,
            startDate || undefined,
            endDate || undefined,
            statusFilter
        );
    };

    const handleFilter = () => {
        setCurrentPage(1);
        fetchOrders(
            1,
            searchTerm,
            startDate || undefined,
            endDate || undefined,
            statusFilter
        );
    };

    const handleClearFilters = () => {
        setSearchTerm('');
        setStartDate('');
        setEndDate('');
        setStatusFilter('');
        setCurrentPage(1);
        fetchOrders(1);
    };

    const handleGuideIdSubmit = () => {
        if (guideId.trim()) {
            setCurrentGuideId(guideId.trim());
            setOrders([]);
            setTotalItems(0);
            setCurrentPage(1);
            setError(null);
        }
    };

    const handleGuideIdKeyPress = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter') {
            handleGuideIdSubmit();
        }
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString();
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed':
                return 'success';
            case 'cancelled':
                return 'error';
            case 'pending':
                return 'warning';
            default:
                return 'default';
        }
    };

    

    const getServiceTypeColor = (serviceType: string) => {
        switch (serviceType.toLowerCase()) {
            case 'chat':
                return 'primary';
            case 'call':
                return 'secondary';
            case 'video':
                return 'info';
            default:
                return 'default';
        }
    };

    const formatDuration = (minutes: number, seconds: number) => {
        if (minutes === 0 && seconds === 0) return 'N/A';
        return `${minutes}m ${seconds}s`;
    };

    const formatCurrency = (amount: string) => {
        const num = parseFloat(amount) || 0;
        return `${num.toFixed(2)}`;
    };

    const handleOrderClick = (orderId: number, userId: number) => {
        // Store the customer_id for the show page to use
        localStorage.setItem('current_customer_id', userId.toString());
        // Navigate to the consultation order show page
        navigate(`/consultation-orders/${orderId}/show`);
    };

    useEffect(() => {
        if (currentGuideId) {
            fetchOrders();
        }
    }, [currentGuideId]);

    // Guide ID input section
    if (!currentGuideId) {
        return (
            <Box sx={{ width: '100%', p: 3 }}>
                <Typography variant="h4" gutterBottom>
                    Guide Completed Orders
                </Typography>
                <Card sx={{ maxWidth: 500, mx: 'auto' }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Enter Guide ID
                        </Typography>
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                            Please enter the consultant ID to view their completed orders.
                        </Typography>
                        <TextField
                            fullWidth
                            label="Guide/Consultant ID"
                            value={guideId}
                            onChange={(e) => setGuideId(e.target.value)}
                            onKeyPress={handleGuideIdKeyPress}
                            placeholder="e.g., 12345"
                            margin="normal"
                        />
                        <Button
                            variant="contained"
                            onClick={handleGuideIdSubmit}
                            disabled={!guideId.trim()}
                            fullWidth
                            sx={{ mt: 2 }}
                        >
                            View Guide Orders
                        </Button>
                    </CardContent>
                </Card>
            </Box>
        );
    }

    return (
        <Box sx={{ width: '100%' }}>
            <Typography variant="h4" gutterBottom>
                Guide Completed Orders
            </Typography>

            {/* Guide ID selector */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Current Guide ID: {currentGuideId}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                        <TextField
                            label="Change Guide ID"
                            value={guideId}
                            onChange={(e) => setGuideId(e.target.value)}
                            onKeyPress={handleGuideIdKeyPress}
                            placeholder="Enter new guide ID"
                            size="small"
                            sx={{ minWidth: 200 }}
                        />
                        <Button
                            variant="outlined"
                            onClick={handleGuideIdSubmit}
                            disabled={!guideId.trim()}
                        >
                            Switch Guide
                        </Button>
                    </Box>
                </CardContent>
            </Card>

               

                {/* Orders Table */}
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Completed Orders ({totalItems} total)
                        </Typography>

                        {loading ? (
                            <Box display="flex" justifyContent="center" p={4}>
                                <CircularProgress />
                            </Box>
                        ) : error ? (
                            <Alert severity="error">{error}</Alert>
                        ) : orders.length > 0 ? (
                            <>
                                <TableContainer component={Paper}>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Order ID</TableCell>
                                                <TableCell>Service Type</TableCell>
                                                <TableCell>Status</TableCell>
                                                <TableCell>Duration</TableCell>
                                                <TableCell>Final Amount</TableCell>
                                                <TableCell>Consultant Share</TableCell>
                                                <TableCell>Customer ID</TableCell>
                                                <TableCell>Created Date</TableCell>
                                                <TableCell>Completed Date</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {orders.map((order) => (
                                                <TableRow
                                                    key={order.order_id}
                                                    hover
                                                    sx={{ cursor: 'pointer' }}
                                                    onClick={() => {
                                                        // Store customer ID and navigate to consultation order show page
                                                        handleOrderClick(order.order_id, order.user_id);
                                                    }}
                                                >
                                                    <TableCell>
                                                        <Typography variant="body2" fontFamily="monospace">
                                                            #{order.order_id}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={order.service_type}
                                                            color={getServiceTypeColor(order.service_type) as any}
                                                            size="small"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={order.status}
                                                            color={getStatusColor(order.status) as any}
                                                            size="small"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        {formatDuration(order.minutes_ordered, order.seconds_ordered)}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2" fontWeight="bold">
                                                            {formatCurrency(order.final_amount)}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2">
                                                            {formatCurrency(order.consultant_share)} ({order.consultant_share_percent}%)
                                                        </Typography>
                                                        {order.consultant_paid && (
                                                            <Chip label="Paid" color="success" size="small" sx={{ mt: 0.5 }} />
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        ID: {order.user_id}
                                                    </TableCell>
                                                    <TableCell>
                                                        {formatDate(order.created_at)}
                                                    </TableCell>
                                                    <TableCell>
                                                        {formatDate(order.completed_at)}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                                        <Pagination
                                            count={totalPages}
                                            page={currentPage}
                                            onChange={handlePageChange}
                                            color="primary"
                                            showFirstButton
                                            showLastButton
                                        />
                                    </Box>
                                )}
                            </>
                        ) : (
                            <Box sx={{ p: 4, textAlign: 'center' }}>
                                <Typography variant="h6" color="textSecondary">
                                    No completed orders found
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    Try adjusting your filters or check back later
                                </Typography>
                            </Box>
                        )}
                    </CardContent>
                </Card>
            </Box>
    );
};

export default GuideOrders;