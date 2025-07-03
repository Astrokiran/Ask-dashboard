import React from 'react';
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
} from 'recharts';

// --- MOCK DATA (This remains the same) ---

const summaryData = {
    totalCustomers: '1,250',
    activeGuides: '25',
    pendingRequests: '15',
    totalRevenue: '$12,500',
};

const revenueOverTimeData = [
    { name: 'Jan', revenue: 600 },
    { name: 'Feb', revenue: 800 },
    { name: 'Mar', revenue: 1200 },
    { name: 'Apr', revenue: 900 },
    { name: 'May', revenue: 1500 },
    { name: 'Jun', revenue: 1300 },
    { name: 'Jul', revenue: 1800 },
];

const revenueByServiceData = [
    { name: 'Astrology Reading', revenue: 4000 },
    { name: 'Career Guidance', revenue: 3000 },
    { name: 'Relationship Advice', revenue: 2000 },
    { name: 'Personal Growth', revenue: 2500 },
];

const recentConsultationsData = [
    { id: 1, customer: 'Sophia Clark', guide: 'Ethan Bennett', date: '2024-07-15', status: 'Completed' },
    { id: 2, customer: 'Liam Carter', guide: 'Olivia Hayes', date: '2024-07-16', status: 'Scheduled' },
    { id: 3, customer: 'Ava Turner', guide: 'Noah Foster', date: '2024-07-17', status: 'Pending' },
    { id: 4, customer: 'Isabella Reed', guide: 'Lucas Morgan', date: '2024-07-18', status: 'Completed' },
    { id: 5, customer: 'Mia Cooper', guide: 'Chloe Evans', date: '2024-07-19', status: 'Scheduled' },
];

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
    let color: "success" | "info" | "warning" = 'info';
    if (status === 'Completed') color = 'success';
    if (status === 'Pending') color = 'warning';
    return <Chip label={status} color={color} size="small" />;
};


// --- THE MAIN DASHBOARD COMPONENT ---

const Dashboard: React.FC = () => {
    return (
        <Box sx={{ p: 3,  }}>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
                Dashboard
            </Typography>

            {/* FIXED: Replaced Grid container with a Box using Flexbox */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', mx: -1.5, mb: 4 }}>
                <SummaryCard title="Total Customers" value={summaryData.totalCustomers} />
                <SummaryCard title="Active Guides" value={summaryData.activeGuides} />
                <SummaryCard title="Pending Requests" value={summaryData.pendingRequests} />
                <SummaryCard title="Total Revenue" value={summaryData.totalRevenue} />
            </Box>
            
            <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
                Revenue
            </Typography>
            {/* FIXED: Replaced Grid container with a Box using Flexbox */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', mx: -1.5, mb: 4 }}>
                <Box sx={{ width: { xs: '100%', md: '66.66%' }, p: 1.5 }}>
                    <Card elevation={2}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>Revenue Over Time</Typography>
                            <Typography variant="h5" fontWeight="bold">$12,500 <Typography component="span" color="success.main">+15%</Typography></Typography>
                            <Box sx={{ height: 300, mt: 2 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={revenueOverTimeData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} activeDot={{ r: 8 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </Box>
                        </CardContent>
                    </Card>
                </Box>
                <Box sx={{ width: { xs: '100%', md: '33.33%' }, p: 1.5 }}>
                     <Card elevation={2}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>Revenue by Service</Typography>
                            <Typography variant="h5" fontWeight="bold">$12,500 <Typography component="span" color="success.main">+15%</Typography></Typography>
                             <Box sx={{ height: 300, mt: 2 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={revenueByServiceData} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                        <XAxis type="number" hide />
                                        <YAxis type="category" dataKey="name" width={120} tickLine={false} axisLine={false} />
                                        <Tooltip />
                                        <Bar dataKey="revenue" fill="#82ca9d" barSize={20} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Box>
                        </CardContent>
                    </Card>
                </Box>
            </Box>

            <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
                Consultations
            </Typography>
            <Paper elevation={2}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Customer</TableCell>
                            <TableCell>Guide</TableCell>
                            <TableCell>Date</TableCell>
                            <TableCell>Status</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {recentConsultationsData.map((row) => (
                            <TableRow key={row.id}>
                                <TableCell>{row.customer}</TableCell>
                                <TableCell>{row.guide}</TableCell>
                                <TableCell>{row.date}</TableCell>
                                <TableCell><StatusChip status={row.status} /></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Paper>

        </Box>
    );
};

export default Dashboard;
