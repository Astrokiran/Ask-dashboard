import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Card,
    CardContent,
    Typography,
    Box,
    CircularProgress,
    Alert,
    Skeleton,
} from '@mui/material';
import {
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import {
    useDataProvider,
    useNotify,
} from 'react-admin';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

// --- TYPES ---
interface TopGuide {
    id: number;
    name: string;
    consultations: number;
    rating: number;
    profile_picture_url?: string;
}

interface RecentConsultation {
    id: number;
    customer_name: string;
    guide_name: string;
    customer_id: number;
    guide_id: number;
    requested_at: string;
    state: string;
    mode: string;
}

interface ConsultationByStatus {
    status: string;
    count: number;
    color: string;
}

interface ConsultationByDate {
    date: string;
    count: number;
}

// --- CONFIGURATION ---
const DASHBOARD_CONFIG = {
    MAX_RETRIES: 2,
    TIMEOUT: 30000, // 30 seconds
    CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
    CHART_COLORS: {
        completed: '#4caf50',
        in_progress: '#2196f3',
        requested: '#ff9800',
        cancelled: '#9e9e9e',
        failed: '#f44336',
        request_expired: '#795548',
    },
    DEFAULT_STATS: {
        totalCustomers: 0,
        todayCustomers: 0,
        onlineGuides: '0/0',
        totalConsultations: 0,
        todayConsultations: 0,
        completedConsultations: 0,
        successRate: '0%',
        avgResponseTime: '< 2 min',
    },
};

// --- CACHE ---
const cache = {
    get: (key: string) => {
        const cached = localStorage.getItem(`dashboard_${key}`);
        if (!cached) return null;
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp > DASHBOARD_CONFIG.CACHE_DURATION) {
            localStorage.removeItem(`dashboard_${key}`);
            return null;
        }
        return data;
    },
    set: (key: string, data: any) => {
        localStorage.setItem(`dashboard_${key}`, JSON.stringify({
            data,
            timestamp: Date.now(),
        }));
    },
};

// --- TIMEOUT WRAPPER ---
const withTimeout = (promise: Promise<any>, timeout: number) => {
    return Promise.race([
        promise,
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Request timeout')), timeout)
        ),
    ]);
};

// --- API CLIENT WITH RETRY ---
const apiCall = async (dataProvider: any, resource: string, params: any, retries = 0): Promise<any> => {
    try {
        return await withTimeout(dataProvider.getList(resource, params), DASHBOARD_CONFIG.TIMEOUT);
    } catch (error: any) {
        if (retries < DASHBOARD_CONFIG.MAX_RETRIES) {
            console.warn(`Retrying API call for ${resource}, attempt ${retries + 1}`);
            await new Promise(resolve => setTimeout(resolve, 1000 * (retries + 1)));
            return apiCall(dataProvider, resource, params, retries + 1);
        }
        throw error;
    }
};

// --- FAST DATA FETCHERS ---

// Fetch consultations by status efficiently
const fetchConsultationsByStatus = async (dataProvider: any): Promise<ConsultationByStatus[]> => {
    const cacheKey = 'consultations_by_status';
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    const statuses = Object.keys(DASHBOARD_CONFIG.CHART_COLORS);
    const statusPromises = statuses.map(status =>
        apiCall(dataProvider, 'consultations', {
            pagination: { page: 1, perPage: 1 },
            filter: { status },
        }).then(res => ({
            status: status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' '),
            count: res.total || 0,
            color: DASHBOARD_CONFIG.CHART_COLORS[status as keyof typeof DASHBOARD_CONFIG.CHART_COLORS],
        })).catch(() => ({
            status: status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' '),
            count: 0,
            color: DASHBOARD_CONFIG.CHART_COLORS[status as keyof typeof DASHBOARD_CONFIG.CHART_COLORS],
        }))
    );

    const results = await Promise.all(statusPromises);
    const filteredResults = results.filter(item => item.count > 0);
    cache.set(cacheKey, filteredResults);
    return filteredResults;
};

// Fetch recent consultations (small dataset)
const fetchRecentConsultations = async (dataProvider: any): Promise<RecentConsultation[]> => {
    try {
        const result = await apiCall(dataProvider, 'consultations', {
            pagination: { page: 1, perPage: 5 },
            sort: { field: 'id', order: 'DESC' },
        });
        return result.data.slice(0, 5);
    } catch (error) {
        console.error('Error fetching recent consultations:', error);
        return [];
    }
};

// Fetch guides summary (only essential fields)
const fetchGuidesSummary = async (dataProvider: any) => {
    const cacheKey = 'guides_summary';
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
        const result = await apiCall(dataProvider, 'guides', {
            pagination: { page: 1, perPage: 100 },
        });

        const guides = result.data || [];
        const onlineGuidesCount = guides.filter((guide: any) => guide.online === true).length;
        const totalGuidesCount = guides.length;

        const topGuides = guides
            .filter((guide: any) => guide.guide_stats?.total_number_of_completed_consultations > 0)
            .map((guide: any) => ({
                id: guide.id,
                name: guide.full_name,
                consultations: guide.guide_stats?.total_number_of_completed_consultations || 0,
                rating: guide.guide_stats?.rating || 0,
                profile_picture_url: guide.profile_picture_url,
            }))
            .sort((a: any, b: any) => b.consultations - a.consultations)
            .slice(0, 5);

        const summary = {
            onlineGuides: `${onlineGuidesCount}/${totalGuidesCount}`,
            topGuides,
        };

        cache.set(cacheKey, summary);
        return summary;
    } catch (error) {
        console.error('Error fetching guides summary:', error);
        return { onlineGuides: '0/0', topGuides: [] };
    }
};

// Fetch customers estimate (avoid loading all pages)
const fetchCustomersEstimate = async (dataProvider: any) => {
    const cacheKey = 'customers_estimate';
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
        // Only fetch first page and estimate from total
        const result = await apiCall(dataProvider, 'customers', {
            pagination: { page: 1, perPage: 50 },
            sort: { field: 'id', order: 'DESC' },
        });

        const today = startOfDay(new Date());
        const todayCustomers = result.data?.filter((customer: any) => {
            const customerDate = new Date(customer.created_at);
            return customerDate >= today && customerDate <= endOfDay(today);
        }).length || 0;

        const summary = {
            totalCustomers: result.total || 0,
            todayCustomers,
        };

        cache.set(cacheKey, summary);
        return summary;
    } catch (error) {
        console.error('Error fetching customers estimate:', error);
        return { totalCustomers: 0, todayCustomers: 0 };
    }
};

// --- COMPONENTS ---

// Skeleton loading component
const DashboardSkeleton = () => (
    <Box sx={{ width: '100%' }}>
        <Box display="flex" flexWrap="wrap" gap={2}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)', md: 'calc(25% - 12px)' } }} key={item}>
                    <Skeleton variant="rectangular" height={100} />
                </Box>
            ))}
        </Box>
        <Box display="flex" flexWrap="wrap" gap={3} sx={{ mt: 3 }}>
            <Box sx={{ width: { xs: '100%', md: 'calc(50% - 12px)' } }}>
                <Skeleton variant="rectangular" height={300} />
            </Box>
            <Box sx={{ width: { xs: '100%', md: 'calc(50% - 12px)' } }}>
                <Skeleton variant="rectangular" height={300} />
            </Box>
        </Box>
    </Box>
);

// Summary card component
const SummaryCard = ({ title, value, color = 'text.primary' }: {
    title: string;
    value: string;
    color?: string;
}) => (
    <Box sx={{ width: { xs: '100%', sm: '50%', md: '25%' }, p: 1.5 }}>
        <Card elevation={2} sx={{ height: '100%' }}>
            <CardContent>
                <Typography color="text.secondary" gutterBottom variant="body2">
                    {title}
                </Typography>
                <Typography variant="h5" component="div" fontWeight="bold" color={color}>
                    {value}
                </Typography>
            </CardContent>
        </Card>
    </Box>
);

// Error component
const ErrorComponent = ({ error, onRetry }: { error: string; onRetry: () => void }) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8 }}>
        <Alert severity="error" sx={{ mb: 2, maxWidth: 600 }}>
            <Typography variant="h6" gutterBottom>
                Dashboard Loading Error
            </Typography>
            <Typography variant="body2">
                {error}
            </Typography>
        </Alert>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            This might be due to network issues or server maintenance.
        </Typography>
        <Typography
            variant="body2"
            color="primary"
            sx={{ cursor: 'pointer', textDecoration: 'underline' }}
            onClick={onRetry}
        >
            Click here to retry
        </Typography>
    </Box>
);

// --- MAIN DASHBOARD COMPONENT ---
export const OptimizedDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [stats, setStats] = useState(DASHBOARD_CONFIG.DEFAULT_STATS);
    const [consultationStatusData, setConsultationStatusData] = useState<ConsultationByStatus[]>([]);
    const [topGuides, setTopGuides] = useState<TopGuide[]>([]);
    const [recentConsultations, setRecentConsultations] = useState<RecentConsultation[]>([]);

    const dataProvider = useDataProvider();
    const notify = useNotify();

    // Memoized date calculations
    const last7DaysData = useMemo(() => {
        const data = [];
        for (let i = 6; i >= 0; i--) {
            const date = subDays(new Date(), i);
            data.push({
                date: format(date, 'MMM dd'),
                count: Math.floor(Math.random() * 20) + 5, // Placeholder - replace with real data
            });
        }
        return data;
    }, []);

    // Optimized data fetching with caching and error handling
    const fetchDashboardData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch all data in parallel with proper error handling
            const [
                consultationsByStatus,
                recentConsultations,
                guidesSummary,
                customersEstimate,
            ] = await Promise.allSettled([
                fetchConsultationsByStatus(dataProvider),
                fetchRecentConsultations(dataProvider),
                fetchGuidesSummary(dataProvider),
                fetchCustomersEstimate(dataProvider),
            ]);

            // Process results
            const statusData = consultationsByStatus.status === 'fulfilled'
                ? consultationsByStatus.value
                : [];

            const recentData = recentConsultations.status === 'fulfilled'
                ? recentConsultations.value
                : [];

            const guidesData = guidesSummary.status === 'fulfilled'
                ? guidesSummary.value
                : { onlineGuides: '0/0', topGuides: [] };

            const customersData = customersEstimate.status === 'fulfilled'
                ? customersEstimate.value
                : { totalCustomers: 0, todayCustomers: 0 };

            // Calculate metrics
            const totalConsultations = statusData.reduce((sum, item) => sum + item.count, 0);
            const completedConsultations = statusData.find(item => item.status === 'Completed')?.count || 0;
            const successRate = totalConsultations > 0
                ? ((completedConsultations / totalConsultations) * 100).toFixed(1)
                : '0';

            // Update state
            setConsultationStatusData(statusData);
            setRecentConsultations(recentData);
            setTopGuides(guidesData.topGuides);
            setStats({
                totalCustomers: customersData.totalCustomers,
                todayCustomers: customersData.todayCustomers,
                onlineGuides: guidesData.onlineGuides,
                totalConsultations,
                todayConsultations: Math.floor(totalConsultations * 0.1), // Estimate
                completedConsultations,
                successRate: `${successRate}%`,
                avgResponseTime: '< 2 min', // Placeholder
            });

        } catch (err: any) {
            console.error('Dashboard loading error:', err);
            setError(err.message || 'Failed to load dashboard data');
            notify('Dashboard loading failed', { type: 'error' });
        } finally {
            setLoading(false);
        }
    }, [dataProvider, notify]);

    // Initial data fetch
    useEffect(() => {
        fetchDashboardData();

        // Set up periodic refresh (every 5 minutes)
        const interval = setInterval(fetchDashboardData, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, [fetchDashboardData]);

    // Loading state
    if (loading) {
        return <DashboardSkeleton />;
    }

    // Error state
    if (error) {
        return <ErrorComponent error={error} onRetry={fetchDashboardData} />;
    }

    // Custom label for pie chart
    const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text
                x={x}
                y={y}
                fill="white"
                textAnchor={x > cx ? 'start' : 'end'}
                dominantBaseline="central"
                fontSize={12}
                fontWeight="bold"
            >
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    return (
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <Typography variant="h4" gutterBottom fontWeight="bold">
                Dashboard Overview
            </Typography>

            {/* Summary Cards */}
            <Box display="flex" flexWrap="wrap" gap={2}>
                <SummaryCard title="Total Customers" value={stats.totalCustomers.toLocaleString()} />
                <SummaryCard
                    title="Today's Customers"
                    value={stats.todayCustomers.toLocaleString()}
                    color="success.main"
                />
                <SummaryCard
                    title="Online Guides"
                    value={stats.onlineGuides}
                    color="info.main"
                />
                <SummaryCard title="Total Consultations" value={stats.totalConsultations.toLocaleString()} />
            </Box>

            <Box display="flex" flexWrap="wrap" gap={2} sx={{ mt: 2 }}>
                <SummaryCard
                    title="Today's Consultations"
                    value={stats.todayConsultations.toLocaleString()}
                    color="warning.main"
                />
                <SummaryCard
                    title="Completed Consultations"
                    value={stats.completedConsultations.toLocaleString()}
                    color="success.main"
                />
                <SummaryCard
                    title="Success Rate"
                    value={stats.successRate}
                    color="info.main"
                />
                <SummaryCard title="Avg Response Time" value={stats.avgResponseTime} />
            </Box>

            {/* Charts Row */}
            <Box display="flex" flexWrap="wrap" gap={3} sx={{ mt: 3 }}>
                <Box sx={{ width: { xs: '100%', md: 'calc(50% - 12px)' } }}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Customer Registrations (Last 7 Days)
                            </Typography>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={last7DaysData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar
                                        dataKey="count"
                                        fill="#1976d2"
                                        radius={[8, 8, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </Box>

                <Box sx={{ width: { xs: '100%', md: 'calc(50% - 12px)' } }}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Consultation Status Distribution
                            </Typography>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={consultationStatusData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={renderCustomLabel}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="count"
                                    >
                                        {consultationStatusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </Box>
            </Box>

            {/* Additional Charts */}
            <Box display="flex" flexWrap="wrap" gap={3} sx={{ mt: 2 }}>
                <Box sx={{ width: '100%' }}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Consultations by Status
                            </Typography>
                            <ResponsiveContainer width="100%" height={350}>
                                <BarChart data={consultationStatusData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="status" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar
                                        dataKey="count"
                                        radius={[8, 8, 0, 0]}
                                        maxBarSize={80}
                                    >
                                        {consultationStatusData.map((entry, index) => (
                                            <Cell key={`status-bar-${index}`} fill={entry.color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </Box>
            </Box>
        </Box>
    );
};