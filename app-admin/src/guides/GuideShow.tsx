import { useState, useEffect, useCallback } from 'react';
import {
    Show,
    useRecordContext,
    useNotify,
    useUpdate,
    useRefresh,
    TopToolbar,
    Title,
    Identifier,
    EditButton,
} from 'react-admin';
import { Link } from 'react-router-dom';
import { UserX } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { httpClient } from '../dataProvider';
import {
    CircularProgress,
    Box,
    Switch,
    FormControlLabel,
    Card,
    CardContent,
    Typography,
    Button,
    Chip,
    Avatar,
    Divider,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    DialogContentText,
    TextField,
    Alert,
    AlertTitle,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { WebRTCCallButton } from '../components/WebRTCCallButton';
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
import { PhoneCall, Users, UserCheck, TrendingUp, AlertCircle } from 'lucide-react';


const API_URL = process.env.REACT_APP_API_URL;

// --- Reusable UI Components ---

const DocumentImage = ({ label, src }: { label: string, src?: string }) => (
    <Box sx={{ textAlign: 'center' }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            {label}
        </Typography>
        <img
            src={src || 'https://placeholder.co/300x200?text=No+Image'}
            alt={label}
            style={{
                borderRadius: '8px',
                border: '2px dashed',
                borderColor: 'divider',
                width: '100%',
                objectFit: 'contain',
            }}
        />
    </Box>
);

const maskAccountNumber = (accNum: string): string => {
    if (accNum && accNum.length > 4) {
        return `****${accNum.slice(-4)}`;
    }
    return '****';
};

const DetailItem = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <Box>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
            {label}
        </Typography>
        <Typography variant="body1" sx={{ fontWeight: 500 }}>
            {children || '-'}
        </Typography>
    </Box>
);

// --- Guide Stats Section ---
const GuideStatsSection = () => {
    const record = useRecordContext();

    if (!record || !record.guide_stats) {
        return null;
    }

    const stats = record.guide_stats;

    return (
        <Card sx={{ mb: 3 }}>
            <Box sx={{ p: 3, pb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Guide Statistics
                </Typography>
                <Typography variant="body2" color="textSecondary">
                    Performance metrics and consultation history
                </Typography>
            </Box>
            <Divider />
            <CardContent>
                <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                    <Box sx={{ flex: "1 1 200px", minWidth: "150px" }}>
                        <DetailItem label="Total Consultations">
                            <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                {stats.total_number_of_completed_consultations || 0}
                            </Typography>
                        </DetailItem>
                    </Box>
                    <Box sx={{ flex: "1 1 200px", minWidth: "150px" }}>
                        <DetailItem label="Average Rating">
                            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#ff9800' }}>
                                {stats.rating ? `${stats.rating} ⭐` : 'N/A'}
                            </Typography>
                        </DetailItem>
                    </Box>
                    <Box sx={{ flex: "1 1 200px", minWidth: "150px" }}>
                        <DetailItem label="Total Reviews">
                            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                                {stats.total_number_of_reviews || 0}
                            </Typography>
                        </DetailItem>
                    </Box>
                    <Box sx={{ flex: "1 1 200px", minWidth: "150px" }}>
                        <DetailItem label="Total Minutes">
                            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#2196f3' }}>
                                {stats.total_consultation_minutes || 0}
                            </Typography>
                        </DetailItem>
                    </Box>
                </Box>

                <Box sx={{ mt: 4, pt: 3 }}>
                    <Divider sx={{ mb: 3 }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                        Consultation Breakdown
                    </Typography>
                    <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                        <Box sx={{ flex: "1 1 300px", minWidth: "250px" }}>
                            <Typography variant="body2" color="textSecondary" sx={{ mb: 2, fontWeight: 500 }}>
                                Chat Consultations
                            </Typography>
                            <DetailItem label="Total Sessions">{stats.total_number_of_chat_consultations || 0}</DetailItem>
                            <DetailItem label="Total Minutes">{stats.total_chat_minutes || 0}</DetailItem>
                            <DetailItem label="Avg Length">{stats.average_consultation_length_chat || 0} min</DetailItem>
                        </Box>
                        <Box sx={{ flex: "1 1 300px", minWidth: "250px" }}>
                            <Typography variant="body2" color="textSecondary" sx={{ mb: 2, fontWeight: 500 }}>
                                Voice Consultations
                            </Typography>
                            <DetailItem label="Total Sessions">{stats.total_number_of_voice_consultations || 0}</DetailItem>
                            <DetailItem label="Total Minutes">{stats.total_voice_minutes || 0}</DetailItem>
                            <DetailItem label="Avg Length">{stats.average_consultation_length_voice || 0} min</DetailItem>
                        </Box>
                        <Box sx={{ flex: "1 1 300px", minWidth: "250px" }}>
                            <Typography variant="body2" color="textSecondary" sx={{ mb: 2, fontWeight: 500 }}>
                                Video Consultations
                            </Typography>
                            <DetailItem label="Total Sessions">{stats.total_number_of_video_consultations || 0}</DetailItem>
                            <DetailItem label="Total Minutes">{stats.total_video_minutes || 0}</DetailItem>
                            <DetailItem label="Avg Length">{stats.average_consultation_length_video || 0} min</DetailItem>
                        </Box>
                    </Box>
                </Box>

                <Box sx={{ mt: 4, pt: 3 }}>
                    <Divider sx={{ mb: 3 }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                        Quick Connect
                    </Typography>
                    <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                        <Box sx={{ flex: "1 1 200px", minWidth: "150px" }}>
                            <DetailItem label="Quick Connect Sessions">{stats.total_quick_connect_consultations || 0}</DetailItem>
                        </Box>
                        <Box sx={{ flex: "1 1 200px", minWidth: "150px" }}>
                            <DetailItem label="Quick Connect Minutes">{stats.total_quick_connect_consultation_minutes || 0}</DetailItem>
                        </Box>
                    </Box>
                </Box>

                {stats.average_consultation_length > 0 && (
                    <Box sx={{ mt: 4, pt: 3 }}>
                        <Divider sx={{ mb: 3 }} />
                        <DetailItem label="Overall Average Consultation Length">
                            <Typography sx={{ fontSize: '1.125rem', fontWeight: 600, color: '#4caf50' }}>
                                {stats.average_consultation_length} minutes
                            </Typography>
                        </DetailItem>
                    </Box>
                )}
            </CardContent>
        </Card>
    );
};

// --- Guide Performance Section (with Charts) ---
interface PerformanceData {
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

const COLORS = {
    accepted: '#4caf50',
    rejected: '#f44336',
    cancelled: '#ff9800',
    promotional: '#2196f3',
    unique: '#3f51b5',
    repeat: '#9c27b0',
    loyal: '#e91e63',
    paid: '#00bcd4',
};

const GuidePerformanceSection = () => {
    const record = useRecordContext();
    const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const notify = useNotify();
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const fetchPerformance = useCallback(async (start?: string, end?: string) => {
        if (!record?.id) return;

        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            if (start) params.append('start_date', start);
            if (end) params.append('end_date', end);
            const queryString = params.toString() ? `?${params.toString()}` : '';

            const response = await httpClient(`${process.env.REACT_APP_AUTH_URL?.replace(/\/auth$/, '')}/admin/guides/${record.id}/performance${queryString}`);
            setPerformanceData(response.json.data);
        } catch (err: any) {
            const errorMsg = err.body?.message || err.message || 'Failed to fetch performance data';
            setError(errorMsg);
            console.error('Performance fetch error:', err);
        } finally {
            setLoading(false);
        }
    }, [record?.id]);

    useEffect(() => {
        fetchPerformance(startDate, endDate);
    }, [fetchPerformance, startDate, endDate]);

    const handleDateFilter = () => {
        fetchPerformance(startDate, endDate);
    };

    const handleClearFilters = () => {
        setStartDate('');
        setEndDate('');
        fetchPerformance('', '');
    };

    const handleLast30Days = () => {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 30);
        const startDateStr = start.toISOString().split('T')[0];
        const endDateStr = end.toISOString().split('T')[0];
        setStartDate(startDateStr);
        setEndDate(endDateStr);
        fetchPerformance(startDateStr, endDateStr);
    };

    const handleLast90Days = () => {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 90);
        const startDateStr = start.toISOString().split('T')[0];
        const endDateStr = end.toISOString().split('T')[0];
        setStartDate(startDateStr);
        setEndDate(endDateStr);
        fetchPerformance(startDateStr, endDateStr);
    };

    if (loading) {
        return (
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Box display="flex" justifyContent="center" alignItems="center" py={4}>
                        <CircularProgress />
                    </Box>
                </CardContent>
            </Card>
        );
    }

    if (error || !performanceData) {
        return (
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Alert severity="info">
                        Performance data not available. {error}
                    </Alert>
                </CardContent>
            </Card>
        );
    }

    // Prepare data for charts
    const callsData = [
        { name: 'Accepted', value: performanceData.total_calls_accepted, color: COLORS.accepted },
        { name: 'Rejected', value: performanceData.total_rejected_by_guide, color: COLORS.rejected },
        { name: 'Cancelled', value: performanceData.total_cancelled_by_user, color: COLORS.cancelled },
    ].filter(item => item.value > 0);

    const customerData = [
        { name: 'Unique', value: performanceData.unique_customers_count, color: COLORS.unique },
        { name: 'Repeat', value: performanceData.repeat_customers_count, color: COLORS.repeat },
        { name: 'Loyal', value: performanceData.loyal_customers_count, color: COLORS.loyal },
        { name: 'Paid Repeat', value: performanceData.paid_repeat_customers_count, color: COLORS.paid },
    ].filter(item => item.value > 0);

    const rateData = [
        { name: 'Acceptance Rate', value: performanceData.acceptance_rate, fill: COLORS.accepted },
        { name: 'Repeat Rate', value: performanceData.repeat_rate, fill: COLORS.repeat },
        { name: 'Paid Repeat Rate', value: performanceData.paid_repeat_rate, fill: COLORS.paid },
        { name: 'Loyal Customer Rate', value: performanceData.loyal_customer_rate, fill: COLORS.loyal },
    ];

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <Box sx={{ bgcolor: 'background.paper', p: 1.5, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{payload[0].name}</Typography>
                    <Typography variant="body2">{`${payload[0].value}%`}</Typography>
                </Box>
            );
        }
        return null;
    };

    return (
        <Card sx={{ mb: 3 }}>
            <Box sx={{ p: 3, pb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                            Performance Analytics
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            Call acceptance, customer retention, and conversion metrics
                        </Typography>
                    </Box>
                    <Chip
                        label={`Updated: ${new Date(performanceData.last_updated_at).toLocaleString()}`}
                        size="small"
                        variant="outlined"
                    />
                </Box>

                {/* Date Filter */}
                <Box sx={{ mt: 2, display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
                    <TextField
                        label="Start Date"
                        type="date"
                        size="small"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        sx={{ width: 150 }}
                    />
                    <TextField
                        label="End Date"
                        type="date"
                        size="small"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        sx={{ width: 150 }}
                    />
                    <Button
                        variant="contained"
                        size="small"
                        onClick={handleDateFilter}
                        disabled={loading}
                    >
                        Apply
                    </Button>
                    <Button
                        variant="outlined"
                        size="small"
                        onClick={handleLast30Days}
                        disabled={loading}
                    >
                        Last 30 Days
                    </Button>
                    <Button
                        variant="outlined"
                        size="small"
                        onClick={handleLast90Days}
                        disabled={loading}
                    >
                        Last 90 Days
                    </Button>
                    {(startDate || endDate) && (
                        <Button
                            variant="text"
                            size="small"
                            onClick={handleClearFilters}
                            disabled={loading}
                            color="error"
                        >
                            Clear
                        </Button>
                    )}
                </Box>
            </Box>
            <Divider />

            {/* Key Metrics Cards */}
            <CardContent>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
                    {/* Total Calls Given */}
                    <Box sx={{ flex: '1 1 180px', minWidth: '150px' }}>
                        <Box sx={{ bgcolor: 'rgba(33, 150, 243, 0.08)', p: 2, borderRadius: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Box sx={{ color: '#2196f3', display: 'flex' }}><PhoneCall size={18} /></Box>
                                <Typography variant="body2" color="textSecondary">Total Calls</Typography>
                            </Box>
                            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#2196f3' }}>
                                {performanceData.total_calls_given}
                            </Typography>
                        </Box>
                    </Box>

                    {/* Acceptance Rate */}
                    <Box sx={{ flex: '1 1 180px', minWidth: '150px' }}>
                        <Box sx={{ bgcolor: 'rgba(76, 175, 80, 0.08)', p: 2, borderRadius: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Box sx={{ color: '#4caf50', display: 'flex' }}><TrendingUp size={18} /></Box>
                                <Typography variant="body2" color="textSecondary">Acceptance Rate</Typography>
                            </Box>
                            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#4caf50' }}>
                                {performanceData.acceptance_rate.toFixed(1)}%
                            </Typography>
                        </Box>
                    </Box>

                    {/* Unique Customers */}
                    <Box sx={{ flex: '1 1 180px', minWidth: '150px' }}>
                        <Box sx={{ bgcolor: 'rgba(63, 81, 181, 0.08)', p: 2, borderRadius: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Box sx={{ color: '#3f51b5', display: 'flex' }}><Users size={18} /></Box>
                                <Typography variant="body2" color="textSecondary">Unique Customers</Typography>
                            </Box>
                            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#3f51b5' }}>
                                {performanceData.unique_customers_count}
                            </Typography>
                        </Box>
                    </Box>

                    {/* Promo to Paid Conversions */}
                    <Box sx={{ flex: '1 1 180px', minWidth: '150px' }}>
                        <Box sx={{ bgcolor: 'rgba(156, 39, 176, 0.08)', p: 2, borderRadius: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Box sx={{ color: '#9c27b0', display: 'flex' }}><UserCheck size={18} /></Box>
                                <Typography variant="body2" color="textSecondary">Promo→Paid</Typography>
                            </Box>
                            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#9c27b0' }}>
                                {performanceData.promo_to_paid_conversions}
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                {/* Charts Section */}
                {performanceData.total_calls_given > 0 ? (
                    <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mt: 3 }}>
                        {/* Call Distribution Pie Chart */}
                        <Box sx={{ flex: '1 1 350px', minWidth: '300px' }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                                Call Distribution
                            </Typography>
                            <Box sx={{ height: 250 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={callsData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                            outerRadius={80}
                                            dataKey="value"
                                        >
                                            {callsData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center', mt: 2 }}>
                                {performanceData.total_calls_accepted > 0 && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: COLORS.accepted }} />
                                        <Typography variant="caption">Accepted: {performanceData.total_calls_accepted}</Typography>
                                    </Box>
                                )}
                                {performanceData.total_rejected_by_guide > 0 && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: COLORS.rejected }} />
                                        <Typography variant="caption">Rejected: {performanceData.total_rejected_by_guide}</Typography>
                                    </Box>
                                )}
                                {performanceData.total_cancelled_by_user > 0 && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: COLORS.cancelled }} />
                                        <Typography variant="caption">Cancelled: {performanceData.total_cancelled_by_user}</Typography>
                                    </Box>
                                )}
                            </Box>
                        </Box>

                        {/* Customer Distribution */}
                        <Box sx={{ flex: '1 1 350px', minWidth: '300px' }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                                Customer Distribution
                            </Typography>
                            <Box sx={{ height: 250 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={customerData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => percent > 5 ? `${name}: ${(percent * 100).toFixed(0)}%` : name}
                                            outerRadius={80}
                                            dataKey="value"
                                        >
                                            {customerData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center', mt: 2 }}>
                                {performanceData.unique_customers_count > 0 && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: COLORS.unique }} />
                                        <Typography variant="caption">Unique: {performanceData.unique_customers_count}</Typography>
                                    </Box>
                                )}
                                {performanceData.repeat_customers_count > 0 && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: COLORS.repeat }} />
                                        <Typography variant="caption">Repeat: {performanceData.repeat_customers_count}</Typography>
                                    </Box>
                                )}
                                {performanceData.paid_repeat_customers_count > 0 && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: COLORS.paid }} />
                                        <Typography variant="caption">Paid Repeat: {performanceData.paid_repeat_customers_count}</Typography>
                                    </Box>
                                )}
                                {performanceData.loyal_customers_count > 0 && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: COLORS.loyal }} />
                                        <Typography variant="caption">Loyal: {performanceData.loyal_customers_count}</Typography>
                                    </Box>
                                )}
                            </Box>
                        </Box>

                        {/* Rate Metrics Bar Chart */}
                        <Box sx={{ flex: '1 1 350px', minWidth: '300px' }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                                Performance Rates (%)
                            </Typography>
                            <Box sx={{ height: 250 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={rateData} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                        <XAxis type="number" domain={[0, 100]} />
                                        <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12 }} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                                            {rateData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.fill} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </Box>
                        </Box>
                    </Box>
                ) : (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Box sx={{ color: 'text.secondary', mb: 1, display: 'flex', justifyContent: 'center' }}>
                            <AlertCircle size={48} />
                        </Box>
                        <Typography variant="body1" color="textSecondary">
                            No call data available yet
                        </Typography>
                    </Box>
                )}

                {/* Additional Metrics */}
                <Box sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                        Additional Metrics
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                        <Box sx={{ flex: '1 1 150px', minWidth: '120px' }}>
                            <Typography variant="body2" color="textSecondary">Promotional Consultations</Typography>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>{performanceData.total_promotional_consultations}</Typography>
                        </Box>
                        <Box sx={{ flex: '1 1 150px', minWidth: '120px' }}>
                            <Typography variant="body2" color="textSecondary">Repeat Rate</Typography>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>{performanceData.repeat_rate.toFixed(1)}%</Typography>
                        </Box>
                        <Box sx={{ flex: '1 1 150px', minWidth: '120px' }}>
                            <Typography variant="body2" color="textSecondary">Paid Repeat Rate</Typography>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>{performanceData.paid_repeat_rate.toFixed(1)}%</Typography>
                        </Box>
                        <Box sx={{ flex: '1 1 150px', minWidth: '120px' }}>
                            <Typography variant="body2" color="textSecondary">Loyal Customer Rate</Typography>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>{performanceData.loyal_customer_rate.toFixed(1)}%</Typography>
                        </Box>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
};

// --- KYC Document Section (Displays Images Only) ---

const KycDocumentSection = ({ guideId }: { guideId: Identifier }) => {
    const [documents, setDocuments] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const notify = useNotify();

    useEffect(() => {
        if (!guideId) return;
        const fetchDocs = async () => {
            setLoading(true);
            try {
                // --- UPDATED: Correct API endpoint for KYC docs ---
                const { json } = await httpClient(`${API_URL}/api/v1/guides/kyc-documents/${guideId}`);
                // This section can be built out when the KYC API is ready
                setDocuments(json.data || {});
            } catch (error: any) {
                // It's okay if this fails for now, we just show an empty section
                console.error(`Could not fetch KYC docs: ${error.message}`);
            } finally {
                setLoading(false);
            }
        };
        fetchDocs();
    }, [guideId, notify]);

    if (loading) {
        return <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>;
    }

    return (
        <Card sx={{ mb: 3 }}>
            <Box sx={{ p: 3, pb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    KYC Documents
                </Typography>
            </Box>
            <Divider />
            <CardContent>
                <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                    <Box sx={{ flex: "1 1 200px", minWidth: "150px" }}>
                        <DocumentImage label="Aadhaar (Front)" src={documents.aadhaar?.front?.src} />
                    </Box>
                    <Box sx={{ flex: "1 1 200px", minWidth: "150px" }}>
                        <DocumentImage label="Aadhaar (Back)" src={documents.aadhaar?.back?.src} />
                    </Box>
                    <Box sx={{ flex: "1 1 200px", minWidth: "150px" }}>
                        <DocumentImage label="PAN (Front)" src={documents.pan?.front?.src} />
                    </Box>
                    <Box sx={{ flex: "1 1 200px", minWidth: "150px" }}>
                        <DocumentImage label="PAN (Back)" src={documents.pan?.back?.src} />
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
};

const OffboardGuideButton = () => {
    const record = useRecordContext();
    const notify = useNotify();
    const refresh = useRefresh();
    const navigate = useNavigate();

    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [isOffboarding, setIsOffboarding] = useState(false);

    if (!record) return null;

    const handleOffboard = async () => {
        setIsOffboarding(true);
        try {
            await httpClient(`${API_URL}/api/v1/guides/${record.id}/offboard`, {
                method: 'POST',
            });
            notify('Guide offboarded successfully!', { type: 'success' });
            setIsOpen(false);
            refresh(); // Refresh the current view to show the new status
            navigate('/guides'); // Optional: redirect back to the list after offboarding
        } catch (error: any) {
            const errorMessage = error.body?.message || error.message || 'An unknown error occurred.';
            notify(`Error: ${errorMessage}`, { type: 'error' });
        } finally {
            setIsOffboarding(false);
        }
    };

    const isConfirmationValid = inputValue === 'OFFBOARD';

    return (
        <>
            <Button
                variant="contained"
                color="error"
                size="small"
                startIcon={<UserX />}
                onClick={() => setIsOpen(true)}
            >
                Offboard Guide
            </Button>
            <Dialog open={isOpen} onClose={() => setIsOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Offboard Guide</DialogTitle>
                <DialogContent>
                    <Alert severity="warning" sx={{ mb: 2 }}>
                        <AlertTitle>Are you absolutely sure?</AlertTitle>
                        This will offboard the guide and change their status. This action can be undone, but will require manual state changes.
                        To confirm, please type <strong>OFFBOARD</strong> in the box below.
                    </Alert>
                    <Box sx={{ mt: 2 }}>
                        <TextField
                            fullWidth
                            label="Confirmation"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Type OFFBOARD to confirm"
                            autoFocus
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => { setIsOpen(false); setInputValue(''); }}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleOffboard}
                        disabled={!isConfirmationValid || isOffboarding}
                        variant="contained"
                        color="error"
                    >
                        {isOffboarding ? <CircularProgress size={20} color="inherit" /> : 'Confirm Offboard'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

// --- Status & Controls Section with Toggles ---
const StatusControlSection = () => {
    const record = useRecordContext();
    const notify = useNotify();
    const refresh = useRefresh();
    const [update, { isLoading }] = useUpdate();

    if (!record) {
        return null;
    }

    const handleToggle = (field: string, value: boolean) => {
        update('guides', {
            id: record.id,
            data: { [field]: value },
            previousData: record
        }, {
            onSuccess: () => {
                notify(`Guide ${field} status updated.`, { type: 'success' });
                refresh();
            },
            onError: (error: any) => {
                notify(`Error: ${error.message}`, { type: 'error' });
            },
        });
    };

    return (
        <Card sx={{ mb: 3 }}>
            <Box sx={{ p: 3, pb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Status & Controls
                </Typography>
            </Box>
            <Divider />
            <CardContent>
                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                    <Box sx={{ flex: "1 1 200px", minWidth: "150px" }}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={record.is_online || false}
                                    onChange={(e) => handleToggle('is_online', e.target.checked)}
                                />
                            }
                            label="Online"
                            disabled={isLoading}
                        />
                    </Box>
                    <Box sx={{ flex: "1 1 200px", minWidth: "150px" }}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={record.chat_enabled || false}
                                    onChange={(e) => handleToggle('chat_enabled', e.target.checked)}
                                />
                            }
                            label="Chat Enabled"
                            disabled={isLoading}
                        />
                    </Box>
                    <Box sx={{ flex: "1 1 200px", minWidth: "150px" }}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={record.voice_enabled || false}
                                    onChange={(e) => handleToggle('voice_enabled', e.target.checked)}
                                />
                            }
                            label="Call Enabled"
                            disabled={isLoading}
                        />
                    </Box>
                    <Box sx={{ flex: "1 1 200px", minWidth: "150px" }}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={record.video_enabled || false}
                                    onChange={(e) => handleToggle('video_enabled', e.target.checked)}
                                />
                            }
                            label="Video Call Enabled"
                            disabled={isLoading}
                        />
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
}


const BankAccountSummaryCard = ({ guideId }: { guideId: Identifier }) => {
    const [defaultAccount, setDefaultAccount] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAccounts = async () => {
            try {
                setLoading(true);
                const { json } = await httpClient(`${API_URL}/api/v1/guides/${guideId}/accounts`);
                const accounts = json || [];
                // Find the default account or take the first one if none is default
                const defaultAcc = accounts.find((acc: any) => acc.is_default) || accounts[0];
                setDefaultAccount(defaultAcc);
            } catch (error) {
                console.error("Could not fetch bank accounts", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAccounts();
    }, [guideId]);

    return (
        <Card sx={{ mb: 3 }}>
            <Box sx={{ p: 3, pb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Bank Account Details
                </Typography>
                <Typography variant="body2" color="textSecondary">
                    Default account for payouts.
                </Typography>
            </Box>
            <Divider />
            <CardContent>
                {loading ? (
                    <Box display="flex" justifyContent="center"><CircularProgress size={24} /></Box>
                ) : defaultAccount ? (
                    <Box>
                        <DetailItem label="Bank Name">{defaultAccount.bank_name}</DetailItem>
                        <DetailItem label="Account Number">{maskAccountNumber(defaultAccount.account_number)}</DetailItem>
                        <Button
                            fullWidth
                            variant="outlined"
                            sx={{ mt: 2 }}
                            onClick={() => navigate(`/guides/${guideId}/accounts`)}
                        >
                            View & Manage All Accounts
                        </Button>
                    </Box>
                ) : (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography color="textSecondary">
                            No bank accounts found.
                        </Typography>
                        <Button
                            fullWidth
                            variant="outlined"
                            sx={{ mt: 2 }}
                            onClick={() => navigate(`/guides/${guideId}/accounts`)}
                        >
                            Add Bank Account
                        </Button>
                    </Box>
                )}
            </CardContent>
        </Card>
    );
};

// --- Main Show View (Updated to display all new data) ---
const GuideShowView = () => {
    const record = useRecordContext();
    const navigate = useNavigate();

    if (!record) {
        return <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>;
    }

    return (
        <>
            <Title title={`Profile: ${record.full_name}`} />

            {/* Guide Financials Buttons */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        <Button
                            onClick={() => navigate(`/guide-earnings/${record.id}`)}
                            variant="outlined"
                            size="small"
                        >
                            View Earnings & Wallet
                        </Button>
                        <Button
                            onClick={() => navigate(`/guide-orders/${record.id}`)}
                            variant="outlined"
                            size="small"
                        >
                            View Completed Orders
                        </Button>
                    </Box>
                </CardContent>
            </Card>

            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 2 }}>
                        <Avatar
                            src={record.profile_picture_url}
                            alt={record.full_name}
                            sx={{ width: 80, height: 80 }}
                        >
                            {record.full_name?.charAt(0)}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                                {record.full_name}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                {(record.skills || []).map((skill: string, index: number) => (
                                    <Chip
                                        key={index}
                                        label={skill}
                                        size="small"
                                        sx={{ bgcolor: 'action.selected' }}
                                    />
                                ))}
                            </Box>
                        </Box>
                    </Box>
                </CardContent>
            </Card>

            <Box sx={{ mb: 3 }}>
                <StatusControlSection />
            </Box>

            <Box sx={{ mb: 3 }}>
                <GuideStatsSection />
            </Box>

            <Box sx={{ mb: 3 }}>
                <GuidePerformanceSection />
            </Box>

            <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap", mb: 3 }}>
                <Box sx={{ flex: "1 1 600px", minWidth: "400px" }}>
                    <Card>
                        <Box sx={{ p: 3, pb: 2 }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                Guide Information
                            </Typography>
                        </Box>
                        <Divider />
                        <CardContent>
                            <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                                <Box sx={{ flex: "1 1 300px", minWidth: "250px" }}>
                                    <DetailItem label="Phone">
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            {record.phone_number}
                                            {record.phone_number && (
                                                <WebRTCCallButton
                                                    phoneNumber={record.phone_number}
                                                    customerName={record.full_name}
                                                    label="📞 Call"
                                                />
                                            )}
                                        </Box>
                                    </DetailItem>
                                </Box>
                                <Box sx={{ flex: "1 1 300px", minWidth: "250px" }}>
                                    <DetailItem label="Email Address">{record.email || 'Not provided'}</DetailItem>
                                </Box>
                                <Box sx={{ flex: "1 1 300px", minWidth: "250px" }}>
                                    <DetailItem label="Years of Experience">{record.years_of_experience} years</DetailItem>
                                </Box>
                                <Box sx={{ flex: "1 1 300px", minWidth: "250px" }}>
                                    <DetailItem label="Languages Spoken">{(record.languages || []).join(', ')}</DetailItem>
                                </Box>
                                <Box sx={{ flex: "1 1 300px", minWidth: "250px" }}>
                                    <DetailItem label='Rating'>
                                        <Typography sx={{ color: '#ff9800', fontWeight: 600 }}>
                                            {record.guide_stats?.rating || record.rating || 'N/A'}
                                        </Typography>
                                    </DetailItem>
                                </Box>
                                <Box sx={{ flex: "1 1 300px", minWidth: "250px" }}>
                                    <DetailItem label="Total Consultations">{record.guide_stats?.total_number_of_completed_consultations || record.number_of_consultation || 0}</DetailItem>
                                </Box>
                                <Box sx={{ flex: "1 1 300px", minWidth: "250px" }}>
                                    <DetailItem label="Price per Minute">
                                        <Typography sx={{ color: '#4caf50', fontWeight: 600 }}>
                                            ₹{record.price_per_minute || 'N/A'}
                                        </Typography>
                                    </DetailItem>
                                </Box>
                                <Box sx={{ flex: "1 1 300px", minWidth: "250px" }}>
                                    <DetailItem label="Revenue Share">
                                        <Typography sx={{ fontWeight: 600 }}>
                                            {record.revenue_share ? `${record.revenue_share}%` : 'N/A'}
                                        </Typography>
                                    </DetailItem>
                                </Box>
                                <Box sx={{ flex: "1 1 300px", minWidth: "250px" }}>
                                    <DetailItem label="Tier">{record.tier || 'Standard'}</DetailItem>
                                </Box>
                                <Box sx={{ flex: "1 1 300px", minWidth: "250px" }}>
                                    <DetailItem label="Onboarded On">
                                        {new Date(record.created_at).toLocaleDateString()}
                                    </DetailItem>
                                </Box>
                                {record.bio && (
                                    <Box sx={{ flex: "1 1 100%" }}>
                                        <DetailItem label="Bio">{record.bio}</DetailItem>
                                    </Box>
                                )}
                            </Box>
                        </CardContent>
                    </Card>
                </Box>
                <Box sx={{ flex: "1 1 300px", minWidth: "250px" }}>
                    <BankAccountSummaryCard guideId={record.id} />
                </Box>
            </Box>

            <KycDocumentSection guideId={record.id} />
        </>
    );
};


export const GuideShow = () => {
    const navigate = useNavigate();
    const record = useRecordContext();

    const TopActions = () => (
        <TopToolbar>
            <Button onClick={() => navigate(-1)} size="small">
                Back to Guides
            </Button>

            {/* Guide Financials Redirects */}
            {record && (
                <>
                    <Button
                        onClick={() => navigate(`/guide-earnings/${record.id}`)}
                        variant="outlined"
                        size="small"
                        sx={{ mr: 1 }}
                    >
                        Earnings
                    </Button>
                    <Button
                        onClick={() => navigate(`/guide-orders/${record.id}`)}
                        variant="outlined"
                        size="small"
                        sx={{ mr: 1 }}
                    >
                        Orders
                    </Button>
                    <OffboardGuideButton />
                </>
            )}
        </TopToolbar>
    );

    return (
        <Show actions={<TopActions />} component="div" title=" ">
            <GuideShowView />
        </Show>
    );
};