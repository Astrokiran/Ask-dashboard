import React, { useState, useEffect, useCallback } from 'react';
import {
    Card,
    CardContent,
    TextField,
    Button,
    Typography,
    Box,
    LinearProgress,
    Chip,
    Grid,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    CircularProgress,
    Alert,
} from '@mui/material';
import {
    Title,
    useNotify,
    useDataProvider,
} from 'react-admin';
import { httpClient } from '../dataProvider';
import { TrendingUp, Users, RefreshCw, Phone, CheckCircle, XCircle, UserCheck, Star, ArrowUpDown } from 'lucide-react';

interface GuidePerformanceData {
    guide_id: number;
    total_calls_given: number;
    total_calls_accepted: number;
    total_promotional_consultations: number;
    total_rejected_by_guide: number;
    total_cancelled_by_user: number;
    unique_customers_count: number;
    repeat_customers_count: number;
    paid_repeat_customers_count: number;
    loyal_customers_count: number;
    promo_to_paid_conversions: number;
    acceptance_rate: number;
    repeat_rate: number;
    paid_repeat_rate: number;
    loyal_customer_rate: number;
    last_updated_at: string;
}

interface GuideWithProfile extends GuidePerformanceData {
    full_name?: string;
    profile_picture_url?: string;
}

export const GuidePerformanceStats = () => {
    const notify = useNotify();
    const dataProvider = useDataProvider();
    const [stats, setStats] = useState<GuideWithProfile[]>([]);
    const [filteredStats, setFilteredStats] = useState<GuideWithProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<keyof GuidePerformanceData>('total_calls_given');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    const fetchStats = useCallback(async () => {
        setLoading(true);
        try {
            const authUrl = process.env.REACT_APP_AUTH_URL?.replace(/\/auth$/, '');
            const response = await httpClient(`${authUrl}/admin/guides/performance`);

            if (response.json.success && response.json.data) {
                // Fetch guide details to get names
                const guideIds = response.json.data.map((g: GuidePerformanceData) => g.guide_id);
                const guideDetails = await fetchGuideDetails(guideIds);

                const statsWithProfiles = response.json.data.map((stat: GuidePerformanceData) => ({
                    ...stat,
                    full_name: guideDetails[stat.guide_id]?.full_name || `Guide ${stat.guide_id}`,
                    profile_picture_url: guideDetails[stat.guide_id]?.profile_picture_url,
                }));

                setStats(statsWithProfiles);
                setFilteredStats(statsWithProfiles);
            } else {
                notify('Failed to fetch performance stats', { type: 'error' });
            }
        } catch (error: any) {
            console.error('Error fetching performance stats:', error);
            notify('Error loading performance stats', { type: 'error' });
        } finally {
            setLoading(false);
        }
    }, [notify]);

    const fetchGuideDetails = async (guideIds: number[]) => {
        try {
            // Fetch in batches to avoid URL length issues
            const batchSize = 50;
            const guideDetailsMap: Record<number, { full_name: string; profile_picture_url?: string }> = {};

            for (let i = 0; i < guideIds.length; i += batchSize) {
                const batch = guideIds.slice(i, i + batchSize);
                const filterQuery = batch.map(id => `id=${id}`).join('&');
                const response = await dataProvider.getList('guides', {
                    pagination: { page: 1, perPage: batchSize },
                    sort: { field: 'id', order: 'ASC' },
                    filter: { [filterQuery]: '' }, // Use the filter query
                });

                if (response.data) {
                    response.data.forEach((guide: any) => {
                        guideDetailsMap[guide.id] = {
                            full_name: guide.full_name,
                            profile_picture_url: guide.profile_picture_url,
                        };
                    });
                }
            }

            return guideDetailsMap;
        } catch (error) {
            console.error('Error fetching guide details:', error);
            return {};
        }
    };

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    useEffect(() => {
        // Filter stats based on search term
        const filtered = stats.filter(stat =>
            stat.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            stat.guide_id.toString().includes(searchTerm)
        );

        // Sort filtered stats
        const sorted = [...filtered].sort((a, b) => {
            const aValue = a[sortBy];
            const bValue = b[sortBy];
            if (typeof aValue === 'number' && typeof bValue === 'number') {
                return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
            }
            return 0;
        });

        setFilteredStats(sorted);
    }, [searchTerm, sortBy, sortOrder, stats]);

    const handleSort = (column: keyof GuidePerformanceData) => {
        if (sortBy === column) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(column);
            setSortOrder('desc');
        }
    };

    const getRateColor = (rate: number): 'success' | 'warning' | 'error' => {
        if (rate >= 70) return 'success';
        if (rate >= 50) return 'warning';
        return 'error';
    };

    const SortableHeader = ({ children, column }: { children: React.ReactNode; column: keyof GuidePerformanceData }) => (
        <TableCell
            sx={{
                fontWeight: 'bold',
                cursor: 'pointer',
                userSelect: 'none',
                '&:hover': { bgcolor: 'action.hover' },
            }}
            onClick={() => handleSort(column)}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {children}
                {sortBy === column && (
                    <ArrowUpDown size={14} style={{ transform: sortOrder === 'asc' ? 'scaleY(-1)' : 'none' }} />
                )}
            </Box>
        </TableCell>
    );

    if (loading) {
        return (
            <Card>
                <Title title="Guide Performance Stats" />
                <LinearProgress />
            </Card>
        );
    }

    // Calculate summary statistics
    const totalCalls = stats.reduce((sum, s) => sum + s.total_calls_given, 0);
    const avgAcceptanceRate = stats.length > 0
        ? stats.reduce((sum, s) => sum + s.acceptance_rate, 0) / stats.length
        : 0;
    const totalUniqueCustomers = stats.reduce((sum, s) => sum + s.unique_customers_count, 0);
    const activeGuides = stats.filter(s => s.total_calls_given > 0).length;

    return (
        <Card>
            <Title title="Guide Performance Stats" />
            <CardContent>
                {/* Header with Search and Refresh */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                    <Typography variant="h6" sx={{ flex: 1 }}>
                        All Guides Performance Stats
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <TextField
                            placeholder="Search by name or ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            size="small"
                            sx={{ width: 250 }}
                        />
                        <Button
                            variant="outlined"
                            startIcon={<RefreshCw />}
                            onClick={fetchStats}
                            size="small"
                        >
                            Refresh
                        </Button>
                    </Box>
                </Box>

                {/* Summary Statistics */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Paper sx={{ p: 2, textAlign: 'center', height: '100%' }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                                <Users size={28} color="#1976d2" />
                                <Typography variant="h5" fontWeight="bold">
                                    {stats.length}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                    Total Guides ({activeGuides} active)
                                </Typography>
                            </Box>
                        </Paper>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Paper sx={{ p: 2, textAlign: 'center', height: '100%', bgcolor: 'rgba(76, 175, 80, 0.08)' }}>
                            <Phone size={28} color="#4caf50" />
                            <Typography variant="h5" fontWeight="bold">
                                {totalCalls.toLocaleString()}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                                Total Calls
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Paper sx={{ p: 2, textAlign: 'center', height: '100%', bgcolor: 'rgba(25, 118, 210, 0.08)' }}>
                            <CheckCircle size={28} color="#2196f3" />
                            <Typography variant="h5" fontWeight="bold">
                                {avgAcceptanceRate.toFixed(1)}%
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                                Avg Acceptance Rate
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Paper sx={{ p: 2, textAlign: 'center', height: '100%', bgcolor: 'rgba(156, 39, 176, 0.08)' }}>
                            <UserCheck size={28} color="#9c27b0" />
                            <Typography variant="h5" fontWeight="bold">
                                {totalUniqueCustomers.toLocaleString()}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                                Total Unique Customers
                            </Typography>
                        </Paper>
                    </Grid>
                </Grid>

                {/* Performance Stats Table */}
                <TableContainer component={Paper} sx={{ mt: 2 }}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <SortableHeader column="guide_id">Guide ID</SortableHeader>
                                <TableCell sx={{ fontWeight: 'bold' }}>Guide Name</TableCell>
                                <SortableHeader column="total_calls_given">Total Calls</SortableHeader>
                                <SortableHeader column="acceptance_rate">Acceptance Rate</SortableHeader>
                                <SortableHeader column="total_calls_accepted">Accepted</SortableHeader>
                                <SortableHeader column="total_rejected_by_guide">Rejected</SortableHeader>
                                <SortableHeader column="total_cancelled_by_user">Cancelled</SortableHeader>
                                <SortableHeader column="unique_customers_count">Unique</SortableHeader>
                                <SortableHeader column="repeat_rate">Repeat Rate</SortableHeader>
                                <SortableHeader column="paid_repeat_rate">Paid Repeat</SortableHeader>
                                <SortableHeader column="loyal_customer_rate">Loyal Rate</SortableHeader>
                                <SortableHeader column="promo_to_paid_conversions">Promo→Paid</SortableHeader>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredStats.length > 0 ? (
                                filteredStats.map((stat) => (
                                    <TableRow key={stat.guide_id} hover>
                                        <TableCell>{stat.guide_id}</TableCell>
                                        <TableCell sx={{ fontWeight: 500 }}>
                                            {stat.full_name}
                                        </TableCell>
                                        <TableCell>{stat.total_calls_given}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={`${stat.acceptance_rate.toFixed(1)}%`}
                                                size="small"
                                                color={getRateColor(stat.acceptance_rate)}
                                                sx={{ fontWeight: 'bold', minWidth: 60 }}
                                            />
                                        </TableCell>
                                        <TableCell>{stat.total_calls_accepted}</TableCell>
                                        <TableCell>{stat.total_rejected_by_guide}</TableCell>
                                        <TableCell>{stat.total_cancelled_by_user}</TableCell>
                                        <TableCell>{stat.unique_customers_count}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={`${stat.repeat_rate.toFixed(1)}%`}
                                                size="small"
                                                color={getRateColor(stat.repeat_rate)}
                                                sx={{ minWidth: 60 }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={`${stat.paid_repeat_rate.toFixed(1)}%`}
                                                size="small"
                                                color={getRateColor(stat.paid_repeat_rate)}
                                                sx={{ minWidth: 60 }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={`${stat.loyal_customer_rate.toFixed(1)}%`}
                                                size="small"
                                                color={getRateColor(stat.loyal_customer_rate)}
                                                sx={{ minWidth: 60 }}
                                            />
                                        </TableCell>
                                        <TableCell>{stat.promo_to_paid_conversions}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={12} align="center">
                                        {searchTerm ? 'No guides found matching your search' : 'No performance stats available'}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Legend */}
                <Alert severity="info" sx={{ mt: 3 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        Click on column headers to sort. •
                        <span style={{ color: '#2e7d32' }}>●</span> High Rate (≥70%)
                        <span style={{ color: '#ed6c02', marginLeft: 8 }}>●</span> Medium Rate (50-69%)
                        <span style={{ color: '#ef4444', marginLeft: 8 }}>●</span> Low Rate (&lt;50%)
                    </Typography>
                </Alert>
            </CardContent>
        </Card>
    );
};
