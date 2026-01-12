import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Chip,
    CircularProgress,
    Avatar,
    LinearProgress,
    Skeleton,
} from '@mui/material';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    Legend,
} from 'recharts';
import { useDataProvider } from 'react-admin';

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
}

interface CustomerByDate {
    date: string;
    count: number;
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

interface TopGuide {
    id: number;
    name: string;
    consultations: number;
    rating: number;
    profile_picture_url?: string;
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

const StatusChip = ({ status }: { status: string }) => {
    let color: "success" | "info" | "warning" | "default" | "error" = 'info';
    const label = status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');

    if (status === 'completed') color = 'success';
    if (status === 'requested' || status === 'in_progress') color = 'info';
    if (status === 'cancelled') color = 'warning';
    if (status === 'failed') color = 'error';

    return <Chip label={label} color={color} size="small" />;
};

// Lazy-loaded Customer Analytics
export const CustomerAnalytics = ({ stats }: { stats: DashboardStats }) => {
    const [customersByDate, setCustomersByDate] = useState<CustomerByDate[]>([]);
    const [loading, setLoading] = useState(true);
    const dataProvider = useDataProvider();

    useEffect(() => {
        const fetchCustomerData = async () => {
            try {
                console.log('Fetching customer analytics with date filters...');

                // Get last 7 days customer data using date range filters
                const last7Days: CustomerByDate[] = [];

                for (let i = 6; i >= 0; i--) {
                    const date = new Date();
                    date.setDate(date.getDate() - i);
                    const dateStr = date.toISOString().split('T')[0];
                    const displayDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

                    console.log(`Fetching customers for date: ${dateStr}`);

                    // Use date filter to get customers for this specific day
                    // Much faster than fetching all and filtering client-side
                    const dayCustomersRes = await dataProvider.getList('customers', {
                        pagination: { page: 1, perPage: 1 }, // Only need count, not actual data
                        sort: { field: 'id', order: 'DESC' },
                        filter: { from_date: dateStr, to_date: dateStr },
                    });

                    console.log(`Date ${dateStr} customers count:`, dayCustomersRes.total);
                    last7Days.push({ date: displayDate, count: dayCustomersRes.total || 0 });
                }

                console.log('Final customer data:', last7Days);
                setCustomersByDate(last7Days);
            } catch (error) {
                console.error('Error fetching customer analytics:', error);
                // Fallback to empty data
                setCustomersByDate([]);
            } finally {
                setLoading(false);
            }
        };

        fetchCustomerData();
    }, [dataProvider]);

    return (
        <Card elevation={2}>
            <CardContent>
                <Typography variant="h6" gutterBottom fontWeight="bold">Customer Registrations</Typography>
                <Typography variant="caption" color="text.secondary">Last 7 Days</Typography>
                <Box sx={{ height: 280, mt: 2 }}>
                    {loading ? (
                        <Skeleton variant="rectangular" height="100%" />
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={customersByDate}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                                <YAxis allowDecimals={false} />
                                <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid #ccc', borderRadius: '4px' }} />
                                <Bar dataKey="count" fill="#1976d2" name="New Customers" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </Box>
            </CardContent>
        </Card>
    );
};

// Lazy-loaded Consultation Analytics
export const ConsultationAnalytics = () => {
    const [consultationsByDate, setConsultationsByDate] = useState<ConsultationByDate[]>([]);
    const [loading, setLoading] = useState(true);
    const dataProvider = useDataProvider();

    useEffect(() => {
        const fetchConsultationData = async () => {
            try {
                console.log('Fetching consultation analytics...');
                const last7DaysConsultations: ConsultationByDate[] = [];

                for (let i = 6; i >= 0; i--) {
                    const date = new Date();
                    date.setDate(date.getDate() - i);
                    const dateStr = date.toISOString().split('T')[0];
                    const displayDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

                    console.log(`Fetching consultations for date: ${dateStr}`);

                    // Use date filter to get consultations for each day - try both formats
                    let dayConsultationsRes;
                    try {
                        dayConsultationsRes = await dataProvider.getList('consultations', {
                            pagination: { page: 1, perPage: 1 },
                            sort: { field: 'id', order: 'DESC' },
                            filter: { date_from: dateStr, date_to: dateStr },
                        });
                    } catch (error) {
                        console.log(`Trying alternative date filter for ${dateStr}`);
                        dayConsultationsRes = await dataProvider.getList('consultations', {
                            pagination: { page: 1, perPage: 1 },
                            sort: { field: 'id', order: 'DESC' },
                            filter: { start_date: dateStr, end_date: dateStr },
                        });
                    }

                    console.log(`Date ${dateStr} consultations:`, dayConsultationsRes.total);
                    last7DaysConsultations.push({ date: displayDate, count: dayConsultationsRes.total || 0 });
                }

                console.log('Final consultation data:', last7DaysConsultations);
                setConsultationsByDate(last7DaysConsultations);
            } catch (error) {
                console.error('Error fetching consultation analytics:', error);
                setConsultationsByDate([]);
            } finally {
                setLoading(false);
            }
        };

        fetchConsultationData();
    }, [dataProvider]);

    return (
        <Card elevation={2} sx={{ flex: { xs: '1 1 100%', md: '1 1 48%' } }}>
            <CardContent>
                <Typography variant="h6" gutterBottom fontWeight="bold">Consultation Trends</Typography>
                <Typography variant="caption" color="text.secondary">Last 7 Days</Typography>
                <Box sx={{ height: 280, mt: 2 }}>
                    {loading ? (
                        <Skeleton variant="rectangular" height="100%" />
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={consultationsByDate}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                                <YAxis allowDecimals={false} />
                                <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid #ccc', borderRadius: '4px' }} />
                                <Line type="monotone" dataKey="count" stroke="#4caf50" strokeWidth={3} name="Consultations" dot={{ fill: '#4caf50', r: 5 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </Box>
            </CardContent>
        </Card>
    );
};

// Lazy-loaded Top Guides
export const TopPerformingGuides = () => {
    const [topGuides, setTopGuides] = useState<TopGuide[]>([]);
    const [loading, setLoading] = useState(true);
    const dataProvider = useDataProvider();

    useEffect(() => {
        const fetchTopGuides = async () => {
            try {
                // Fetch guides in smaller batch to improve performance
                const guidesRes = await dataProvider.getList('guides', {
                    pagination: { page: 1, perPage: 100 }, // Reduced from 1000 for better performance
                    sort: { field: 'id', order: 'DESC' },
                    filter: {},
                });

                const guidesWithStats = guidesRes.data
                    .filter((guide: any) => guide.guide_stats?.total_number_of_completed_consultations > 0)
                    .map((guide: any) => ({
                        id: guide.id,
                        name: guide.full_name,
                        consultations: guide.guide_stats?.total_number_of_completed_consultations || 0,
                        rating: guide.guide_stats?.rating || 0,
                        profile_picture_url: guide.profile_picture_url,
                    }))
                    .sort((a: TopGuide, b: TopGuide) => b.consultations - a.consultations)
                    .slice(0, 5);

                setTopGuides(guidesWithStats);
            } catch (error) {
                console.error('Error fetching top guides:', error);
                setTopGuides([]);
            } finally {
                setLoading(false);
            }
        };

        fetchTopGuides();
    }, [dataProvider]);

    if (loading) {
        return (
            <>
                <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
                    Top Performing Guides
                </Typography>
                <Card elevation={2} sx={{ mb: 4 }}>
                    <CardContent>
                        {[1, 2, 3, 4, 5].map((i) => (
                            <Skeleton key={i} variant="rectangular" height={80} sx={{ mb: 1, borderRadius: 1 }} />
                        ))}
                    </CardContent>
                </Card>
            </>
        );
    }

    return (
        <>
            <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
                Top Performing Guides
            </Typography>
            <Card elevation={2} sx={{ mb: 4 }}>
                <CardContent>
                    {topGuides.length === 0 ? (
                        <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
                            No guide performance data available
                        </Typography>
                    ) : (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {topGuides.map((guide, index) => (
                                <Box
                                    key={guide.id}
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        p: 2,
                                        borderRadius: 2,
                                        backgroundColor: index === 0 ? 'rgba(76, 175, 80, 0.1)' : 'transparent',
                                        border: index === 0 ? '2px solid #4caf50' : '1px solid #e0e0e0',
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                                        <Typography variant="h6" sx={{ minWidth: 30, color: index === 0 ? '#4caf50' : 'text.secondary' }}>
                                            #{index + 1}
                                        </Typography>
                                        <Avatar
                                            src={guide.profile_picture_url}
                                            alt={guide.name}
                                            sx={{ width: 50, height: 50, mx: 2 }}
                                        />
                                        <Box sx={{ flex: 1 }}>
                                            <Typography variant="subtitle1" fontWeight="bold">
                                                {guide.name}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {guide.consultations} consultations • ⭐ {guide.rating.toFixed(1)}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    {topGuides.length > 0 && (
                                        <Box sx={{ width: 200, mr: 2 }}>
                                            <LinearProgress
                                                variant="determinate"
                                                value={Math.min((guide.consultations / topGuides[0].consultations) * 100, 100)}
                                                sx={{
                                                    height: 8,
                                                    borderRadius: 4,
                                                    backgroundColor: '#e0e0e0',
                                                    '& .MuiLinearProgress-bar': {
                                                        backgroundColor: index === 0 ? '#4caf50' : '#2196f3',
                                                    }
                                                }}
                                            />
                                        </Box>
                                    )}
                                </Box>
                            ))}
                        </Box>
                    )}
                </CardContent>
            </Card>
        </>
    );
};

// Lazy-loaded Consultation Status Analytics
export const ConsultationStatusAnalytics = () => {
    const [consultationsByStatus, setConsultationsByStatus] = useState<ConsultationByStatus[]>([]);
    const [loading, setLoading] = useState(true);
    const dataProvider = useDataProvider();

    useEffect(() => {
        const fetchConsultationStatusData = async () => {
            try {
                const statuses = ['completed', 'in_progress', 'requested', 'cancelled', 'failed', 'request_expired'];
                const statusColors: { [key: string]: string } = {
                    completed: '#4caf50',
                    in_progress: '#2196f3',
                    requested: '#ff9800',
                    cancelled: '#9e9e9e',
                    failed: '#f44336',
                    request_expired: '#795548',
                };

                const statusCountPromises = statuses.map(status =>
                    dataProvider.getList('consultations', {
                        pagination: { page: 1, perPage: 1 },
                        sort: { field: 'id', order: 'DESC' },
                        filter: { status: status },
                    }).then(res => ({
                        status: status,
                        count: res.total || 0
                    })).catch(error => {
                        console.error(`Error fetching ${status} consultations:`, error);
                        return { status: status, count: 0 };
                    })
                );

                const statusCountsArray = await Promise.all(statusCountPromises);

                const consultationStatusData: ConsultationByStatus[] = statusCountsArray
                    .filter(item => item.count > 0)
                    .map(item => ({
                        status: item.status.charAt(0).toUpperCase() + item.status.slice(1).replace('_', ' '),
                        count: item.count,
                        color: statusColors[item.status] || '#607d8b',
                    }));

                setConsultationsByStatus(consultationStatusData);
            } catch (error) {
                console.error('Error fetching consultation status analytics:', error);
                setConsultationsByStatus([]);
            } finally {
                setLoading(false);
            }
        };

        fetchConsultationStatusData();
    }, [dataProvider]);

    if (loading) {
        return (
            <>
                <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
                    Consultation Analytics
                </Typography>
                <Card elevation={2} sx={{ mb: 3 }}>
                    <CardContent>
                        <Skeleton variant="text" width="40%" height={30} />
                        <Skeleton variant="rectangular" height={450} sx={{ mt: 2, borderRadius: 2 }} />
                    </CardContent>
                </Card>
                <Card elevation={2} sx={{ mb: 4 }}>
                    <CardContent>
                        <Skeleton variant="text" width="40%" height={30} />
                        <Skeleton variant="rectangular" height={350} sx={{ mt: 2, borderRadius: 2 }} />
                    </CardContent>
                </Card>
            </>
        );
    }

    return (
        <>
            <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
                Consultation Analytics
            </Typography>

            {/* Pie Chart */}
            <Card elevation={2} sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>Consultations by Status</Typography>
                    {consultationsByStatus.length === 0 ? (
                        <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
                            No consultation status data available
                        </Typography>
                    ) : (
                        <Box sx={{ height: 450, mt: 2 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={consultationsByStatus}
                                        dataKey="count"
                                        nameKey="status"
                                        cx="50%"
                                        cy="45%"
                                        outerRadius={130}
                                        innerRadius={60}
                                        label={({ percent }) =>
                                            `${(percent * 100).toFixed(1)}%`
                                        }
                                        labelLine={false}
                                        paddingAngle={2}
                                    >
                                        {consultationsByStatus.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value: any, name: any, props: any) =>
                                            [`${value} consultations`, props.payload.status]
                                        }
                                        contentStyle={{
                                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                            border: '1px solid #ccc',
                                            borderRadius: '4px',
                                            padding: '10px'
                                        }}
                                    />
                                    <Legend
                                        verticalAlign="bottom"
                                        height={70}
                                        formatter={(value, entry: any) => `${value}: ${entry.payload.count}`}
                                        wrapperStyle={{ paddingTop: '20px' }}
                                        iconType="circle"
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </Box>
                    )}
                </CardContent>
            </Card>

            {/* Bar Chart */}
            <Card elevation={2} sx={{ mb: 4 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>Status Distribution</Typography>
                    {consultationsByStatus.length === 0 ? (
                        <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
                            No consultation status data available
                        </Typography>
                    ) : (
                        <Box sx={{ height: 350, mt: 2 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={consultationsByStatus}
                                    margin={{ top: 20, right: 50, left: 50, bottom: 80 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis
                                        dataKey="status"
                                        angle={-45}
                                        textAnchor="end"
                                        height={80}
                                        tick={{ fontSize: 13 }}
                                    />
                                    <YAxis
                                        allowDecimals={false}
                                        label={{ value: 'Number of Consultations', angle: -90, position: 'insideLeft' }}
                                    />
                                    <Tooltip
                                        formatter={(value: any) => [`${value} consultations`, 'Count']}
                                        contentStyle={{
                                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                            border: '1px solid #ccc',
                                            borderRadius: '4px',
                                            padding: '10px'
                                        }}
                                    />
                                    <Bar dataKey="count" name="Consultations" radius={[8, 8, 0, 0]} maxBarSize={80}>
                                        {consultationsByStatus.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </Box>
                    )}
                </CardContent>
            </Card>
        </>
    );
};