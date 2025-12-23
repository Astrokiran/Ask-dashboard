import React, { useState, useEffect, lazy, Suspense } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Skeleton,
} from '@mui/material';
import { useDataProvider } from 'react-admin';

// Helper function to calculate consultation status breakdown
const calculateStatusBreakdown = (consultations: any[]) => {
    return {
        requested: consultations.filter(c => c.state?.toLowerCase() === 'requested').length,
        in_progress: consultations.filter(c => c.state?.toLowerCase() === 'in_progress').length,
        completed: consultations.filter(c => c.state?.toLowerCase() === 'completed').length,
        cancelled: consultations.filter(c => c.state?.toLowerCase() === 'cancelled').length,
        failed: consultations.filter(c => c.state?.toLowerCase() === 'failed').length,
        customer_join_timeout: consultations.filter(c => c.state?.toLowerCase() === 'customer_join_timeout').length,
    };
};

// Lazy load heavy components
const CustomerAnalytics = lazy(() => import('./DashboardComponents').then(module => ({ default: module.CustomerAnalytics })));
const TopPerformingGuides = lazy(() => import('./DashboardComponents').then(module => ({ default: module.TopPerformingGuides })));
const ConsultationStatusAnalytics = lazy(() => import('./DashboardComponents').then(module => ({ default: module.ConsultationStatusAnalytics })));

interface DashboardStats {
    totalCustomers: number;
    todaysCustomers: number;
    activeGuides: number;
    totalGuides: number;
    totalConsultations: number;
    todaysConsultations: number;
    completedConsultations: number;
    failedConsultations: number;
    averageResponseTime: string;
    // Today's status breakdown
    todaysRequestedConsultations: number;
    todaysInProgressConsultations: number;
    todaysCompletedConsultations: number;
    todaysCancelledConsultations: number;
    todaysFailedConsultations: number;
    todaysCustomerJoinTimeoutConsultations: number;
    // Overall status breakdown
    overallInProgressConsultations: number;
    overallCompletedConsultations: number;
    overallCancelledConsultations: number;
    overallFailedConsultations: number;
    overallCustomerJoinTimeoutConsultations: number;
}

const SummaryCard = ({ title, value, loading }: { title: string; value: string; loading?: boolean }) => (
    <Box sx={{ width: { xs: '100%', sm: '50%', md: '25%' }, p: 1.5 }}>
        <Card elevation={2} sx={{ height: '100%' }}>
            <CardContent>
                {loading ? (
                    <>
                        <Skeleton variant="text" width="60%" />
                        <Skeleton variant="text" width="40%" height={40} />
                    </>
                ) : (
                    <>
                        <Typography color="text.secondary" gutterBottom>
                            {title}
                        </Typography>
                        <Typography variant="h5" component="div" fontWeight="bold">
                            {value}
                        </Typography>
                    </>
                )}
            </CardContent>
        </Card>
    </Box>
);

const Dashboard: React.FC = () => {
    const dataProvider = useDataProvider();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<DashboardStats>({
        totalCustomers: 0,
        todaysCustomers: 0,
        activeGuides: 0,
        totalGuides: 0,
        totalConsultations: 0,
        todaysConsultations: 0,
        completedConsultations: 0,
        failedConsultations: 0,
        averageResponseTime: 'N/A',
        // Today's status breakdown
        todaysRequestedConsultations: 0,
        todaysInProgressConsultations: 0,
        todaysCompletedConsultations: 0,
        todaysCancelledConsultations: 0,
        todaysFailedConsultations: 0,
        todaysCustomerJoinTimeoutConsultations: 0,
        // Overall status breakdown
        overallInProgressConsultations: 0,
        overallCompletedConsultations: 0,
        overallCancelledConsultations: 0,
        overallFailedConsultations: 0,
        overallCustomerJoinTimeoutConsultations: 0,
    });

    useEffect(() => {
        const fetchDashboardStats = async () => {
            try {
                setLoading(true);

                // Get today's date for accurate filtering
                const today = new Date().toISOString().split('T')[0];

  console.log('Fetching dashboard stats for today:', today);

                // Fetch stats with detailed status breakdown
                const [
                    totalCustomersRes,
                    totalConsultationsRes,
                    todayConsultationsRes,
                    overallCompletedRes,
                    overallFailedRes,
                    overallCancelledRes,
                    overallInProgressRes,
                    overallTimeoutRes
                ] = await Promise.all([
                    // Total customers
                    dataProvider.getList('customers', {
                        pagination: { page: 1, perPage: 25 },
                        sort: { field: 'id', order: 'DESC' },
                        filter: {},
                    }),
                    // Total consultations
                    dataProvider.getList('consultations', {
                        pagination: { page: 1, perPage: 10 },
                        sort: { field: 'id', order: 'DESC' },
                        filter: {},
                    }),
                    // Today's consultations
                    dataProvider.getList('consultations', {
                        pagination: { page: 1, perPage: 50 }, // Larger sample for today's breakdown
                        sort: { field: 'id', order: 'DESC' },
                        filter: { date_from: today, date_to: today },
                    }).catch(error => {
                        console.log('Trying alternative date filter for consultations');
                        return dataProvider.getList('consultations', {
                            pagination: { page: 1, perPage: 50 },
                            sort: { field: 'id', order: 'DESC' },
                            filter: { start_date: today, end_date: today },
                        });
                    }),
                    // Overall consultations by status - using correct 'status' parameter
                    dataProvider.getList('consultations', {
                        pagination: { page: 1, perPage: 10 },
                        sort: { field: 'id', order: 'DESC' },
                        filter: { status: 'completed' },
                    }),
                    dataProvider.getList('consultations', {
                        pagination: { page: 1, perPage: 10 },
                        sort: { field: 'id', order: 'DESC' },
                        filter: { status: 'failed' },
                    }),
                    dataProvider.getList('consultations', {
                        pagination: { page: 1, perPage: 10 },
                        sort: { field: 'id', order: 'DESC' },
                        filter: { status: 'cancelled' },
                    }),
                    dataProvider.getList('consultations', {
                        pagination: { page: 1, perPage: 10 },
                        sort: { field: 'id', order: 'DESC' },
                        filter: { status: 'in_progress' },
                    }),
                    dataProvider.getList('consultations', {
                        pagination: { page: 1, perPage: 10 },
                        sort: { field: 'id', order: 'DESC' },
                        filter: { status: 'customer_join_timeout' },
                    }),
                ]);

                // Calculate today's customers from the same totalCustomersRes data (no extra API call)
                const todayDate = new Date().toISOString().split('T')[0];
                const todaysCustomers = totalCustomersRes.data.filter((customer: any) => {
                    return customer.created_at && customer.created_at.startsWith(todayDate);
                });

                // Create today's customers response
                const todayCustomersRes = {
                    data: todaysCustomers,
                    total: todaysCustomers.length
                };

                // For compatibility, create completedConsultationsRes and failedConsultationsRes from the new variables
                const completedConsultationsRes = overallCompletedRes;
                const failedConsultationsRes = overallFailedRes;

                // Optimized guides fetching - fetch in smaller batches
                let activeGuidesCount = 0;
                let totalGuidesCount = 0;
                let guidesPage = 1;
                const guidesPerPage = 50; // Smaller batch size
                let hasMoreGuides = true;

                while (hasMoreGuides && guidesPage <= 5) { // Limit to 5 batches (250 guides max)
                    const guidesBatch = await dataProvider.getList('guides', {
                        pagination: { page: guidesPage, perPage: guidesPerPage },
                        sort: { field: 'id', order: 'DESC' },
                        filter: {},
                    });

                    // Count guides in this batch
                    const batchActive = guidesBatch.data.filter((guide: any) => guide.online === true).length;
                    activeGuidesCount += batchActive;
                    totalGuidesCount += guidesBatch.data.length;

                    // Check if there are more guides
                    if (guidesBatch.data.length < guidesPerPage) {
                        hasMoreGuides = false;
                    } else {
                        guidesPage++;
                    }
                }

                // Create guides response object
                const guidesRes = {
                    data: [],
                    total: totalGuidesCount
                };

                console.log('API Response Summary:', {
                    totalCustomers: totalCustomersRes.total,
                    todayCustomers: todayCustomersRes.total,
                    totalConsultations: totalConsultationsRes.total,
                    todayConsultations: todayConsultationsRes.total,
                    completedConsultations: completedConsultationsRes.total,
                    failedConsultations: failedConsultationsRes.total
                });

                // Active guides already counted above in optimized fetching

                // Calculate today's consultation status breakdown
                const todayStatusBreakdown = calculateStatusBreakdown(todayConsultationsRes.data);

                const successRate = (totalConsultationsRes.total ?? 0) > 0
                    ? (((overallCompletedRes.total ?? 0) / (totalConsultationsRes.total ?? 1)) * 100).toFixed(1)
                    : '0.0';

                setStats({
                    totalCustomers: totalCustomersRes.total || 0,
                    todaysCustomers: todayCustomersRes.total || 0,
                    activeGuides: activeGuidesCount,
                    totalGuides: guidesRes.total || 0,
                    totalConsultations: totalConsultationsRes.total || 0,
                    todaysConsultations: todayConsultationsRes.total || 0,
                    completedConsultations: overallCompletedRes.total || 0,
                    failedConsultations: overallFailedRes.total || 0,
                    averageResponseTime: '< 2 min', // Keep as placeholder for now
                    // Today's status breakdown (from today's data)
                    todaysRequestedConsultations: todayStatusBreakdown.requested,
                    todaysInProgressConsultations: todayStatusBreakdown.in_progress,
                    todaysCompletedConsultations: todayStatusBreakdown.completed,
                    todaysCancelledConsultations: todayStatusBreakdown.cancelled,
                    todaysFailedConsultations: todayStatusBreakdown.failed,
                    todaysCustomerJoinTimeoutConsultations: todayStatusBreakdown.customer_join_timeout,
                    // Overall status breakdown (from API totals)
                    overallInProgressConsultations: overallInProgressRes.total || 0,
                    overallCompletedConsultations: overallCompletedRes.total || 0,
                    overallCancelledConsultations: overallCancelledRes.total || 0,
                    overallFailedConsultations: overallFailedRes.total || 0,
                    overallCustomerJoinTimeoutConsultations: overallTimeoutRes.total || 0,
                });

                console.log('Dashboard stats loaded:', {
                    totalCustomers: totalCustomersRes.total,
                    todaysCustomers: todayCustomersRes.total,
                    todaysConsultations: todayConsultationsRes.total,
                    completedConsultations: completedConsultationsRes.total,
                    failedConsultations: failedConsultationsRes.total,
                    successRate
                });

            } catch (error) {
                console.error('Error fetching dashboard stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardStats();
    }, [dataProvider]);

    if (loading) {
        return (
            <Box sx={{ p: 3 }}>
                <Skeleton variant="text" width={200} height={50} sx={{ mb: 3 }} />

                {/* Summary Cards Skeleton */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                    {[1, 2, 3, 4].map((i) => (
                        <Card key={i} elevation={2} sx={{ flex: { xs: '1 1 100%', sm: '1 1 45%', md: '1 1 22%' } }}>
                            <CardContent>
                                <Skeleton variant="text" width="60%" />
                                <Skeleton variant="text" width="40%" height={40} />
                            </CardContent>
                        </Card>
                    ))}
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 4 }}>
                    {[1, 2, 3, 4].map((i) => (
                        <Card key={i} elevation={2} sx={{ flex: { xs: '1 1 100%', sm: '1 1 45%', md: '1 1 22%' } }}>
                            <CardContent>
                                <Skeleton variant="text" width="60%" />
                                <Skeleton variant="text" width="40%" height={40} />
                            </CardContent>
                        </Card>
                    ))}
                </Box>

                {/* Analytics Charts Skeleton */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 4 }}>
                    {[1, 2].map((i) => (
                        <Card key={i} elevation={2} sx={{ flex: { xs: '1 1 100%', md: '1 1 48%' } }}>
                            <CardContent>
                                <Skeleton variant="text" width="50%" height={30} />
                                <Skeleton variant="rectangular" height={280} sx={{ mt: 2, borderRadius: 2 }} />
                            </CardContent>
                        </Card>
                    ))}
                </Box>

                {/* Other sections skeleton */}
                <Skeleton variant="rectangular" height={400} sx={{ mb: 2, borderRadius: 2 }} />
                <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
            </Box>
        );
    }

    const successRate = stats.totalConsultations > 0
        ? ((stats.completedConsultations / stats.totalConsultations) * 100).toFixed(1)
        : '0.0';

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
                Dashboard
            </Typography>

            {/* Summary Cards - 2 Rows */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', mx: -1.5, mb: 2 }}>
                <SummaryCard title="Total Customers" value={stats.totalCustomers.toLocaleString()} loading={false} />
                <SummaryCard title="Today's Customers" value={stats.todaysCustomers.toString()} loading={false} />
                <SummaryCard title="Online Guides" value={`${stats.activeGuides} / ${stats.totalGuides}`} loading={false} />
                <SummaryCard title="Total Consultations" value={stats.totalConsultations.toLocaleString()} loading={false} />
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', mx: -1.5, mb: 4 }}>
                <SummaryCard title="Today's Consultations" value={stats.todaysConsultations.toString()} loading={false} />
                <SummaryCard title="Today's Completed" value={stats.todaysCompletedConsultations.toString()} loading={false} />
                <SummaryCard title="Today's Failed" value={stats.todaysFailedConsultations.toString()} loading={false} />
                <SummaryCard title="Customer Join Timeout" value={stats.todaysCustomerJoinTimeoutConsultations.toString()} loading={false} />
            </Box>

            {/* Today's Status Breakdown */}
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Today's Consultation Status Breakdown
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', mx: -1.5, mb: 4 }}>
                <SummaryCard title="Requested" value={stats.todaysRequestedConsultations.toString()} loading={false} />
                <SummaryCard title="In Progress" value={stats.todaysInProgressConsultations.toString()} loading={false} />
                <SummaryCard title="Cancelled" value={stats.todaysCancelledConsultations.toString()} loading={false} />
                <SummaryCard title="Success Rate" value={stats.todaysConsultations > 0 ? `${((stats.todaysCompletedConsultations / stats.todaysConsultations) * 100).toFixed(1)}%` : '0%'} loading={false} />
            </Box>

            {/* Overall Status Breakdown */}
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Overall Consultation Status Breakdown
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', mx: -1.5, mb: 4 }}>
                <SummaryCard title="Total In Progress" value={stats.overallInProgressConsultations.toLocaleString()} loading={false} />
                <SummaryCard title="Total Completed" value={stats.overallCompletedConsultations.toLocaleString()} loading={false} />
                <SummaryCard title="Total Cancelled" value={stats.overallCancelledConsultations.toLocaleString()} loading={false} />
                <SummaryCard title="Total Failed" value={stats.overallFailedConsultations.toLocaleString()} loading={false} />
            </Box>

            {/* Customer Analytics Chart - Lazy Loaded */}
            <Box sx={{ mb: 4 }}>
                <Suspense fallback={
                    <Card elevation={2}>
                        <CardContent>
                            <Skeleton variant="rectangular" height={320} />
                        </CardContent>
                    </Card>
                }>
                    <CustomerAnalytics stats={stats} />
                </Suspense>
            </Box>

            {/* Top Performing Guides - Lazy Loaded */}
            <Suspense fallback={
                <>
                    <Skeleton variant="text" width={200} height={30} sx={{ mb: 2 }} />
                    <Card elevation={2} sx={{ mb: 4 }}>
                        <CardContent>
                            {[1, 2, 3, 4, 5].map((i) => (
                                <Skeleton key={i} variant="rectangular" height={80} sx={{ mb: 1, borderRadius: 1 }} />
                            ))}
                        </CardContent>
                    </Card>
                </>
            }>
                <TopPerformingGuides />
            </Suspense>

            {/* Consultation Status Analytics - Lazy Loaded */}
            <Suspense fallback={
                <>
                    <Skeleton variant="text" width={200} height={30} sx={{ mb: 2 }} />
                    <Card elevation={2} sx={{ mb: 3 }}>
                        <CardContent>
                            <Skeleton variant="rectangular" height={500} />
                        </CardContent>
                    </Card>
                    <Card elevation={2}>
                        <CardContent>
                            <Skeleton variant="rectangular" height={400} />
                        </CardContent>
                    </Card>
                </>
            }>
                <ConsultationStatusAnalytics />
            </Suspense>
        </Box>
    );
};

export default Dashboard;