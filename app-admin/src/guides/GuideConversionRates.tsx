import React, { useState, useEffect } from 'react';
import {
    Card,
    CardContent,
    TextField,
    Button,
    Typography,
    Box,
    Alert,
    LinearProgress,
    Chip,
    Grid,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TableContainer,
} from '@mui/material';
import {
    Title,
    useNotify,
} from 'react-admin';
import { httpClient } from '../dataProvider';
import { TrendingUp, Users, RefreshCw, Calendar } from 'lucide-react';

const API_URL = process.env.REACT_APP_API_URL;

interface ConversionRate {
    guide_id: number;
    guide_name: string;
    total_unique_customers: number;
    returning_customers: number;
    conversion_rate_percent: number;
    first_consultation_at: string | null;
    last_consultation_at: string | null;
}

export const GuideConversionRates = () => {
    const notify = useNotify();
    const [rates, setRates] = useState<ConversionRate[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [rowsPerPage] = useState(100);
    const [hasMore, setHasMore] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchRates();
    }, []);

    const fetchRates = async (newPage = 1, append = false) => {
        if (append) setLoadingMore(true); else setLoading(true);
        try {
            const { json } = await httpClient(`${API_URL}/api/v1/conversation-rates/?page=${newPage}&page_size=${rowsPerPage}`);

            if (json.success && json.data) {
                if (append) {
                    setRates(prev => [...prev, ...json.data]);
                } else {
                    setRates(json.data);
                }
                setPage(newPage);
                setHasMore(json.data.length === rowsPerPage);
            } else {
                notify('Failed to fetch conversion rates', { type: 'error' });
            }
        } catch (error: any) {
            console.error('Error fetching conversion rates:', error);
            notify('Error loading conversion rates', { type: 'error' });
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const handleLoadMore = () => {
        fetchRates(page + 1, true);
    };

    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
        setPage(1);
        fetchRates(1, false);
    };

    const handleRefresh = () => {
        setPage(1);
        fetchRates(1, false);
    };

    const getConversionColor = (rate: number): string => {
        if (rate >= 70) return 'success';
        if (rate >= 50) return 'warning';
        return 'error';
    };

    const filteredRates = rates.filter(rate =>
        rate.guide_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rate.guide_id.toString().includes(searchTerm)
    );

    if (loading && !loadingMore) {
        return (
            <Card>
                <Title title="Guide Conversion Rates" />
                <LinearProgress />
            </Card>
        );
    }

    return (
        <Card>
            <Title title="Guide Conversion Rates" />
            <CardContent>
                {/* Header with Search and Refresh */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6" sx={{ flex: 1 }}>
                        Guide Conversion Rates
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <TextField
                            placeholder="Search by name or ID..."
                            value={searchTerm}
                            onChange={handleSearch}
                            size="small"
                            sx={{ width: 250 }}
                        />
                        <Button
                            variant="outlined"
                            startIcon={<RefreshCw />}
                            onClick={handleRefresh}
                            size="small"
                        >
                            Refresh
                        </Button>
                    </Box>
                </Box>

                {/* Statistics Summary */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid size={{ xs: 12, md: 3 }}>
                        <Paper sx={{ p: 3, textAlign: 'center', height: '100%' }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                                <Users size={32} color="primary" />
                                <Typography variant="h4" fontWeight="bold">
                                    {rates.length}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                    Total Guides
                                </Typography>
                            </Box>
                        </Paper>
                    </Grid>
                    <Grid size={{ xs: 12, md: 3 }}>
                        <Paper sx={{ p: 3, textAlign: 'center', height: '100%', bgcolor: 'action.hover' }}>
                            <TrendingUp size={32} color="success" />
                            <Typography variant="h4" fontWeight="bold">
                                {rates.length > 0 ? (
                                    Math.round(rates.filter(r => r.conversion_rate_percent > 0).length / rates.length * 100)
                                ) : 0}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                                Active Converters (%)
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid size={{ xs: 12, md: 3 }}>
                        <Paper sx={{ p: 3, textAlign: 'center', height: '100%' }}>
                            <Users size={32} color="warning" />
                            <Typography variant="h4" fontWeight="bold">
                                {rates.reduce((sum, r) => sum + r.returning_customers, 0)}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                                Total Returning
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid size={{ xs: 12, md: 3 }}>
                        <Paper sx={{ p: 3, textAlign: 'center', height: '100%' }}>
                            <Calendar size={32} color="info" />
                            <Typography variant="h4" fontWeight="bold">
                                {rates.reduce((sum, r) => sum + r.total_unique_customers, 0)}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                                Total Unique Customers
                            </Typography>
                        </Paper>
                    </Grid>
                </Grid>

                {/* Conversion Rates Table */}
                <Paper sx={{ mt: 3 }}>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Guide ID</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Guide Name</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Conversion Rate</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Total Customers</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Returning Customers</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Unique Customers</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>First Consultation</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Last Consultation</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredRates.length > 0 ? (
                                    filteredRates.map((rate) => (
                                        <TableRow key={rate.guide_id} hover>
                                            <TableCell>{rate.guide_id}</TableCell>
                                            <TableCell sx={{ fontWeight: 500 }}>
                                                {rate.guide_name}
                                            </TableCell>
                                            <TableCell align="center">
                                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                                                    <Chip
                                                        label={`${rate.conversion_rate_percent}%`}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: getConversionColor(rate.conversion_rate_percent) + '.light',
                                                            color: getConversionColor(rate.conversion_rate_percent),
                                                            fontWeight: 'bold',
                                                        }}
                                                    />
                                                </Box>
                                            </TableCell>
                                            <TableCell align="center">{rate.total_unique_customers}</TableCell>
                                            <TableCell align="center">{rate.returning_customers}</TableCell>
                                            <TableCell align="center">{rate.total_unique_customers}</TableCell>
                                            <TableCell align="center">
                                                {rate.first_consultation_at
                                                    ? new Date(rate.first_consultation_at).toLocaleDateString()
                                                    : 'N/A'}
                                            </TableCell>
                                            <TableCell align="center">
                                                {rate.last_consultation_at
                                                    ? new Date(rate.last_consultation_at).toLocaleDateString()
                                                    : 'N/A'}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={8} align="center">
                                            {loading ? (
                                                <LinearProgress />
                                            ) : searchTerm ? 'No guides found matching your search' : 'No conversion rates available'}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                        {hasMore && !loadingMore && (
                            <Button
                                variant="contained"
                                onClick={handleLoadMore}
                                disabled={loadingMore}
                            >
                                Load More
                            </Button>
                        )}
                        {loadingMore && <LinearProgress sx={{ width: '100%' }} />}
                        {!hasMore && rates.length > 0 && (
                            <Typography variant="body2" color="textSecondary">
                                Showing all {rates.length} records
                            </Typography>
                        )}
                    </Box>
                </Paper>

                {/* Legend */}
                <Alert severity="info" sx={{ mt: 3 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        Legend:
                        <span style={{ color: '#2e7d32' }}>●</span> High Conversion (≥70%)
                        <span style={{ color: '#ed6c02', marginLeft: 8 }}>●</span> Medium Conversion (50-69%)
                        <span style={{ color: '#ef4444', marginLeft: 8 }}>●</span> Low Conversion (&lt;50%)
                    </Typography>
                </Alert>
            </CardContent>
        </Card>
    );
};
