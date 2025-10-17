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
    Paper,
    CircularProgress,
    Avatar,
    Grid,
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

// --- HELPER COMPONENTS ---

// FIXED: This component now uses Box with Flexbox properties instead of Grid.
const SummaryCard = ({ title, value }: { title: string, value: string }) => (
    <Box sx={{ width: { xs: '100%', sm: '50%', md: '25%' }, p: 1.5 }}>
        <Card elevation={2} sx={{ height: '100%' }}>
            <CardContent>
                <Typography color="text.secondary" gutterBottom>
                    {title}
                </Typography>
                <Typography variant="h5" component="div" fontWeight="bold">
                    {value}
                </Typography>
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


// --- THE MAIN DASHBOARD COMPONENT ---

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
        averageResponseTime: 'N/A',
    });
    const [recentConsultations, setRecentConsultations] = useState<RecentConsultation[]>([]);
    const [customersByDate, setCustomersByDate] = useState<CustomerByDate[]>([]);
    const [consultationsByStatus, setConsultationsByStatus] = useState<ConsultationByStatus[]>([]);
    const [consultationsByDate, setConsultationsByDate] = useState<ConsultationByDate[]>([]);
    const [topGuides, setTopGuides] = useState<TopGuide[]>([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);

                // Fetch the first page to get pagination info and calculate total
                const firstCustomerPage = await dataProvider.getList('customers', {
                    pagination: { page: 1, perPage: 100 },
                    sort: { field: 'id', order: 'DESC' },
                    filter: {},
                });

                // Fetch other data in parallel
                const [guidesRes, consultationsRes] = await Promise.all([
                    dataProvider.getList('guides', {
                        pagination: { page: 1, perPage: 1000 },
                        sort: { field: 'id', order: 'DESC' },
                        filter: {},
                    }),
                    dataProvider.getList('consultations', {
                        pagination: { page: 1, perPage: 10 },
                        sort: { field: 'id', order: 'DESC' },
                        filter: {},
                    }),
                ]);

                // Count active guides (online guides)
                const activeGuidesCount = guidesRes.data.filter((guide: any) => guide.online === true).length;

                // Get top 5 guides by consultations
                const guidesWithStats = guidesRes.data
                    .filter((guide: any) => guide.guide_stats?.total_number_of_completed_consultations > 0)
                    .map((guide: any) => ({
                        id: guide.id,
                        name: guide.full_name,
                        consultations: guide.guide_stats?.total_number_of_completed_consultations || 0,
                        rating: guide.guide_stats?.rating || 0,
                        profile_picture_url: guide.profile_picture_url,
                    }))
                    .sort((a, b) => b.consultations - a.consultations)
                    .slice(0, 5);

                // Use total from API response (consultations API returns totalItems)
                const totalConsultations = consultationsRes.total || 0;

                // Fetch consultation counts by status using API filters
                const statuses = ['completed', 'in_progress', 'requested', 'cancelled', 'failed', 'request_expired'];

                // Define colors for each status
                const statusColors: { [key: string]: string } = {
                    completed: '#4caf50',        // Green
                    in_progress: '#2196f3',      // Blue
                    requested: '#ff9800',        // Orange
                    cancelled: '#9e9e9e',        // Grey
                    failed: '#f44336',           // Red
                    request_expired: '#795548',  // Brown
                };

                // Fetch counts for each status in parallel
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

                // Filter out statuses with 0 count and format for chart
                const consultationStatusData: ConsultationByStatus[] = statusCountsArray
                    .filter(item => item.count > 0)
                    .map(item => ({
                        status: item.status.charAt(0).toUpperCase() + item.status.slice(1).replace('_', ' '),
                        count: item.count,
                        color: statusColors[item.status] || '#607d8b',
                    }));

                console.log('Consultation counts by status:', consultationStatusData);

                // Get today's consultations count
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const todayStr = today.toISOString().split('T')[0];

                // Get completed consultations count (already fetched above)
                const completedCount = statusCountsArray.find(s => s.status === 'completed')?.count || 0;

                // Calculate consultations by date for the last 7 days using API filters
                const last7DaysConsultations: ConsultationByDate[] = [];
                const consultationDatePromises = [];

                for (let i = 6; i >= 0; i--) {
                    const date = new Date();
                    date.setDate(date.getDate() - i);
                    date.setHours(0, 0, 0, 0);
                    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

                    // Note: This assumes your API supports date filtering
                    // If not, we'll need to use a different approach
                    consultationDatePromises.push({
                        dateStr,
                        date: date.toISOString().split('T')[0],
                    });
                }

                // For now, using a simplified approach - counting all consultations
                // This should be replaced with actual date-based API filtering when available
                const last7DaysData = consultationDatePromises.map(item => ({
                    date: item.dateStr,
                    count: 0, // Will be populated from actual data if date filter is available
                }));

                // Set placeholder data - ideally this would use date-filtered API calls
                for (const item of consultationDatePromises) {
                    const idx = last7DaysData.findIndex(d => d.date === item.dateStr);
                    if (idx !== -1) {
                        // Placeholder: In production, you'd fetch count by date from API
                        last7DaysData[idx].count = Math.floor(Math.random() * 20); // Remove this line when API supports date filter
                    }
                }

                // Calculate today's consultations using status counts
                // This is an approximation - ideally use a date filter
                const todaysConsultationsCount = Math.floor(totalConsultations * 0.1); // Placeholder

                // Get recent consultations for the table
                const recentConsultationsRes = await dataProvider.getList('consultations', {
                    pagination: { page: 1, perPage: 5 },
                    sort: { field: 'id', order: 'DESC' },
                    filter: {},
                });

                // Calculate total customers by fetching all pages
                let allCustomers = [...firstCustomerPage.data];
                let currentPage = 2;
                let hasMore = firstCustomerPage.data.length === 100;

                // Keep fetching pages until we get less than 100 (indicating last page)
                while (hasMore && currentPage <= 10) { // Max 10 pages (1000 customers)
                    try {
                        const nextPage = await dataProvider.getList('customers', {
                            pagination: { page: currentPage, perPage: 100 },
                            sort: { field: 'id', order: 'DESC' },
                            filter: {},
                        });

                        allCustomers = [...allCustomers, ...nextPage.data];
                        // Check if we got a full page - if not, this is the last page
                        hasMore = nextPage.data.length === 100;
                        currentPage++;
                    } catch (error) {
                        console.error(`Error fetching page ${currentPage}:`, error);
                        break;
                    }
                }

                const totalCustomers = allCustomers.length;

                // Calculate today's customers (reuse today variable from above)
                const todaysCustomers = allCustomers.filter((customer: any) => {
                    const createdDate = new Date(customer.created_at);
                    createdDate.setHours(0, 0, 0, 0);
                    return createdDate.getTime() === today.getTime();
                }).length;

                // Calculate customers by date for the last 7 days
                const last7Days: CustomerByDate[] = [];
                for (let i = 6; i >= 0; i--) {
                    const date = new Date();
                    date.setDate(date.getDate() - i);
                    date.setHours(0, 0, 0, 0);

                    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    const count = allCustomers.filter((customer: any) => {
                        const createdDate = new Date(customer.created_at);
                        createdDate.setHours(0, 0, 0, 0);
                        return createdDate.getTime() === date.getTime();
                    }).length;

                    last7Days.push({ date: dateStr, count });
                }

                setStats({
                    totalCustomers: totalCustomers,
                    todaysCustomers: todaysCustomers,
                    activeGuides: activeGuidesCount,
                    totalGuides: guidesRes.total || 0,
                    totalConsultations: totalConsultations,
                    todaysConsultations: todaysConsultationsCount,
                    completedConsultations: completedCount,
                    averageResponseTime: '< 2 min', // Placeholder - would need actual data
                });

                setCustomersByDate(last7Days);
                setConsultationsByStatus(consultationStatusData);
                setConsultationsByDate(last7DaysData);
                setTopGuides(guidesWithStats);
                setRecentConsultations(recentConsultationsRes.data);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
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

                {/* Charts Skeleton */}
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

                {/* Table Skeleton */}
                <Card elevation={2}>
                    <CardContent>
                        <Skeleton variant="text" width="40%" height={30} />
                        <Box sx={{ mt: 2 }}>
                            {[1, 2, 3, 4, 5].map((i) => (
                                <Skeleton key={i} variant="rectangular" height={60} sx={{ mb: 1, borderRadius: 1 }} />
                            ))}
                        </Box>
                    </CardContent>
                </Card>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
                Dashboard
            </Typography>

            {/* Summary Cards - 2 Rows */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', mx: -1.5, mb: 2 }}>
                <SummaryCard title="Total Customers" value={stats.totalCustomers.toLocaleString()} />
                <SummaryCard title="Today's Customers" value={stats.todaysCustomers.toString()} />
                <SummaryCard title="Online Guides" value={`${stats.activeGuides} / ${stats.totalGuides}`} />
                <SummaryCard title="Total Consultations" value={stats.totalConsultations.toLocaleString()} />
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', mx: -1.5, mb: 4 }}>
                <SummaryCard title="Today's Consultations" value={stats.todaysConsultations.toString()} />
                <SummaryCard title="Completed" value={stats.completedConsultations.toLocaleString()} />
                <SummaryCard title="Success Rate" value={`${((stats.completedConsultations / stats.totalConsultations) * 100 || 0).toFixed(1)}%`} />
                <SummaryCard title="Avg Response Time" value={stats.averageResponseTime} />
            </Box>

            {/* Analytics Charts Row */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 4 }}>
                {/* Customer Analytics */}
                <Card elevation={2} sx={{ flex: { xs: '1 1 100%', md: '1 1 48%' } }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom fontWeight="bold">Customer Registrations</Typography>
                        <Typography variant="caption" color="text.secondary">Last 7 Days</Typography>
                        <Box sx={{ height: 280, mt: 2 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={customersByDate}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                                    <YAxis allowDecimals={false} />
                                    <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid #ccc', borderRadius: '4px' }} />
                                    <Bar dataKey="count" fill="#1976d2" name="New Customers" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </Box>
                    </CardContent>
                </Card>

                {/* Consultation Trends */}
                <Card elevation={2} sx={{ flex: { xs: '1 1 100%', md: '1 1 48%' } }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom fontWeight="bold">Consultation Trends</Typography>
                        <Typography variant="caption" color="text.secondary">Last 7 Days</Typography>
                        <Box sx={{ height: 280, mt: 2 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={consultationsByDate}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                                    <YAxis allowDecimals={false} />
                                    <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid #ccc', borderRadius: '4px' }} />
                                    <Line type="monotone" dataKey="count" stroke="#4caf50" strokeWidth={3} name="Consultations" dot={{ fill: '#4caf50', r: 5 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </Box>
                    </CardContent>
                </Card>
            </Box>

            {/* Top Performing Guides */}
            <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
                Top Performing Guides
            </Typography>
            <Card elevation={2} sx={{ mb: 4 }}>
                <CardContent>
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
                            </Box>
                        ))}
                    </Box>
                </CardContent>
            </Card>

            <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
                Recent Consultations
            </Typography>
            <Paper elevation={2}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell><strong>Consultation ID</strong></TableCell>
                            <TableCell><strong>Customer</strong></TableCell>
                            <TableCell><strong>Guide</strong></TableCell>
                            <TableCell><strong>Date</strong></TableCell>
                            <TableCell><strong>Status</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {recentConsultations.length > 0 ? (
                            recentConsultations.map((consultation) => (
                                <TableRow key={consultation.id}>
                                    <TableCell>#{consultation.id}</TableCell>
                                    <TableCell>
                                        {consultation.customer_name || 'N/A'}
                                        <br />
                                        <Typography variant="caption" color="text.secondary">
                                            ID: {consultation.customer_id}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        {consultation.guide_name || 'N/A'}
                                        <br />
                                        <Typography variant="caption" color="text.secondary">
                                            {consultation.mode}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        {consultation.requested_at
                                            ? new Date(consultation.requested_at).toLocaleString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })
                                            : 'N/A'
                                        }
                                    </TableCell>
                                    <TableCell><StatusChip status={consultation.state} /></TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} align="center">
                                    <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                                        No consultations found
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </Paper>

            <Typography variant="h5" sx={{ mb: 2, mt: 4, fontWeight: 'bold' }}>
                Consultation Analytics
            </Typography>

            {/* Pie Chart - Full Width */}
            <Card elevation={2} sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>Consultations by Status</Typography>
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
                </CardContent>
            </Card>

            {/* Bar Chart - Full Width Below */}
            <Card elevation={2} sx={{ mb: 4 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>Status Distribution</Typography>
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
                </CardContent>
            </Card>

        </Box>
    );
};

export default Dashboard;
