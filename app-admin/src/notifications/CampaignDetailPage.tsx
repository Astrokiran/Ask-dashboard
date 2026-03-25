import React, { useState, useEffect } from 'react';
import {
    Title,
    useNotify,
} from 'react-admin';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Card,
    CardContent,
    Button,
    Typography,
    Box,
    Alert,
    LinearProgress,
    Paper,
    Grid,
    Chip,
    Tabs,
    Tab,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Pagination,
} from '@mui/material';
import { ArrowLeft, Target, Activity, Users, Clock, TrendingUp, AlertCircle, CheckCircle2, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { httpClient } from '../dataProvider';

const API_URL = process.env.REACT_APP_API_URL;

interface CampaignStats {
    campaign_id: string;
    campaign_name: string;
    audience_size: number;
    labeled: number;
    notified: number;
    pending: number;
    sent_count: number;
    failed_count: number;
    success_rate: number;
    last_sent_at: string | null;
    last_run_at: string;
}

interface CampaignSend {
    id: number;
    campaign_id: string;
    customer_id: number;
    sent_at: string;
    customer_name: string;
    zodiac_sign?: string;
}

interface PendingNotification {
    id: number;
    campaign_id: string;
    customer_id: number;
    title: string;
    body: string;
    status: 'pending' | 'processing' | 'sent' | 'failed';
    attempts: number;
    created_at: string;
    sent_at?: string;
    customer_name: string;
    zodiac_sign?: string;
}

interface Campaign {
    id?: string;
    name: string;
    description: string;
    audience_type: string;
    audience_params: Record<string, number>;
    push_title: string;
    push_body: string;
    push_data: Record<string, string | number>;
    schedule: string;
    cooldown_hours: number;
    max_daily_sends: number;
    is_active?: boolean;
    created_at?: string;
    updated_at?: string;
}

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

const TabPanel = ({ children, value, index }: TabPanelProps) => (
    <div role="tabpanel" hidden={value !== index}>
        {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
);

export const CampaignDetailPage = () => {
    const navigate = useNavigate();
    const notify = useNotify();
    const [loading, setLoading] = useState(true);
    const [campaign, setCampaign] = useState<Campaign | null>(null);
    const [campaignStats, setCampaignStats] = useState<CampaignStats | null>(null);
    const [campaignSends, setCampaignSends] = useState<CampaignSend[]>([]);
    const [pendingNotifications, setPendingNotifications] = useState<PendingNotification[]>([]);
    const [detailTabValue, setDetailTabValue] = useState(0);
    const [sendsLoading, setSendsLoading] = useState(false);
    const [pendingLoading, setPendingLoading] = useState(false);
    const [pendingStatusFilter, setPendingStatusFilter] = useState<string>('all');

    // Pagination state for sends
    const [sendsPage, setSendsPage] = useState(0);
    const [sendsTotalPages, setSendsTotalPages] = useState(0);
    const [sendsTotal, setSendsTotal] = useState(0);

    // Pagination state for pending notifications
    const [pendingPage, setPendingPage] = useState(0);
    const [pendingTotalPages, setPendingTotalPages] = useState(0);
    const [pendingTotal, setPendingTotal] = useState(0);

    // Get campaign ID from URL using React Router
    const { id } = useParams();
    const campaignId = id;

    console.log('CampaignDetailPage rendered, campaignId from URL:', campaignId);
    console.log('Current URL path:', window.location.pathname);

    useEffect(() => {
        if (campaignId) {
            console.log('Fetching campaign data for ID:', campaignId);
            fetchAllCampaignData(campaignId);
        } else {
            console.error('No campaign ID found in URL');
            setLoading(false);
        }
    }, [campaignId]);

    const fetchAllCampaignData = async (id: string) => {
        setLoading(true);
        console.log('Starting to fetch all campaign data for ID:', id);
        try {
            await Promise.all([
                fetchCampaignDetails(id),
                fetchCampaignStats(id),
                fetchCampaignSends(id, 0),
                fetchPendingNotifications(id, 'all', 0),
            ]);
            console.log('All campaign data fetched successfully');
        } catch (error) {
            console.error('Error fetching campaign data:', error);
            notify('Failed to load campaign data', { type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleSendsPageChange = (event: React.ChangeEvent<unknown>, value: number) => {
        if (campaignId) {
            fetchCampaignSends(campaignId, value - 1); // Pagination is 1-indexed, API is 0-indexed
        }
    };

    const handlePendingPageChange = (event: React.ChangeEvent<unknown>, value: number) => {
        if (campaignId) {
            fetchPendingNotifications(campaignId, pendingStatusFilter, value - 1); // Pagination is 1-indexed, API is 0-indexed
        }
    };

    const fetchCampaignDetails = async (id: string) => {
        try {
            console.log('Fetching campaign details from:', `${API_URL}/api/v1/notifications/campaigns/${id}`);
            const { json } = await httpClient(`${API_URL}/api/v1/notifications/campaigns/${id}`, {
                method: 'GET',
            });
            console.log('Campaign details response:', json);
            setCampaign(json);
        } catch (error: any) {
            console.error('Error fetching campaign details:', error);
            notify('Failed to fetch campaign details', { type: 'error' });
        }
    };

    const fetchCampaignStats = async (id: string) => {
        try {
            console.log('Fetching campaign stats from:', `${API_URL}/api/v1/notifications/campaigns/${id}/stats`);
            const { json } = await httpClient(`${API_URL}/api/v1/notifications/campaigns/${id}/stats`, {
                method: 'GET',
            });
            console.log('Campaign stats response:', json);
            setCampaignStats(json);
        } catch (error: any) {
            console.error('Error fetching campaign stats:', error);
        }
    };

    const fetchCampaignSends = async (id: string, page: number = 0) => {
        setSendsLoading(true);
        try {
            const url = `${API_URL}/api/v1/notifications/campaigns/${id}/sends?limit=50&offset=${page * 50}`;
            console.log('Fetching campaign sends from:', url);
            const { json } = await httpClient(url, { method: 'GET' });
            console.log('Campaign sends response:', json);
            setCampaignSends(json.sends || []);
            setSendsTotalPages(json.pages || 0);
            setSendsTotal(json.total || 0);
            setSendsPage(page);
        } catch (error: any) {
            console.error('Error fetching campaign sends:', error);
        } finally {
            setSendsLoading(false);
        }
    };

    const fetchPendingNotifications = async (id: string, status: string = 'all', page: number = 0) => {
        setPendingLoading(true);
        try {
            const url = `${API_URL}/api/v1/notifications/campaigns/${id}/pending?status=${status}&limit=50&offset=${page * 50}`;
            console.log('Fetching pending notifications from:', url);
            const { json } = await httpClient(url, { method: 'GET' });
            console.log('Pending notifications response:', json);
            setPendingNotifications(json.notifications || []);
            setPendingTotalPages(json.pages || 0);
            setPendingTotal(json.total || 0);
            setPendingPage(page);
        } catch (error: any) {
            console.error('Error fetching pending notifications:', error);
        } finally {
            setPendingLoading(false);
        }
    };

    const handleStatusFilterChange = (status: string) => {
        console.log('Status filter changed to:', status);
        setPendingStatusFilter(status);
        setPendingPage(0); // Reset to first page when filter changes
        if (campaignId) {
            fetchPendingNotifications(campaignId, status, 0);
        }
    };

    if (loading) {
        return (
            <Card>
                <Title title="Campaign Details" />
                <CardContent>
                    <LinearProgress />
                    <Typography sx={{ mt: 2, textAlign: 'center' }}>Loading campaign details...</Typography>
                </CardContent>
            </Card>
        );
    }

    if (!campaign) {
        return (
            <Card>
                <Title title="Campaign Details" />
                <CardContent>
                    <Alert severity="error">Campaign not found</Alert>
                    <Button
                        variant="contained"
                        onClick={() => navigate('/campaigns')}
                        sx={{ mt: 2 }}
                        startIcon={<ArrowLeft size={16} />}
                    >
                        Back to Campaigns
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <Title title={`Campaign: ${campaign.name}`} />
            <CardContent>
                {/* Back Button */}
                <Button
                    variant="outlined"
                    onClick={() => navigate('/campaigns')}
                    sx={{ mb: 3 }}
                    startIcon={<ArrowLeft size={16} />}
                >
                    Back to Campaigns
                </Button>

                {/* Campaign Header */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h4" component="h1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Target size={32} />
                        {campaign.name}
                        <Chip
                            label={campaign.is_active ? 'Active' : 'Inactive'}
                            color={campaign.is_active ? 'success' : 'default'}
                            size="medium"
                        />
                    </Typography>
                    <Typography variant="body1" color="textSecondary">
                        {campaign.description || 'No description provided'}
                    </Typography>
                </Box>

                {/* Campaign Info Card */}
                <Paper sx={{ p: 3, mb: 3 }} elevation={2}>
                    <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                        Campaign Information
                    </Typography>
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                                Campaign ID
                            </Typography>
                            <Typography variant="body1" sx={{ fontFamily: 'monospace', fontSize: '0.875rem', wordBreak: 'break-all' }}>
                                {campaign.id}
                            </Typography>
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                                Created At
                            </Typography>
                            <Typography variant="body1">
                                {campaign.created_at ? new Date(campaign.created_at).toLocaleString() : 'N/A'}
                            </Typography>
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                                Audience Type
                            </Typography>
                            <Chip
                                label={campaign.audience_type}
                                variant="outlined"
                                size="small"
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                                Schedule (Cron)
                            </Typography>
                            <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                                {campaign.schedule}
                            </Typography>
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                                Cooldown Period
                            </Typography>
                            <Typography variant="body1">
                                {campaign.cooldown_hours} hours
                            </Typography>
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                                Max Daily Sends
                            </Typography>
                            <Typography variant="body1">
                                {campaign.max_daily_sends}
                            </Typography>
                        </Grid>
                        {Object.keys(campaign.audience_params).length > 0 && (
                            <Grid size={{ xs: 12 }}>
                                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                                    Audience Parameters
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                    {Object.entries(campaign.audience_params).map(([key, value]) => (
                                        <Chip
                                            key={key}
                                            label={`${key}: ${value}`}
                                            variant="outlined"
                                            size="small"
                                        />
                                    ))}
                                </Box>
                            </Grid>
                        )}
                        <Grid size={{ xs: 12 }}>
                            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                                Push Notification Content
                            </Typography>
                            <Paper sx={{ p: 2, bgcolor: 'primary.50', border: '1px solid', borderColor: 'primary.200' }}>
                                <Typography variant="subtitle1" gutterBottom>
                                    {campaign.push_title}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    {campaign.push_body}
                                </Typography>
                            </Paper>
                        </Grid>
                    </Grid>
                </Paper>

                {/* Detail Tabs */}
                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                    <Tabs value={detailTabValue} onChange={(_, v) => setDetailTabValue(v)} aria-label="campaign details tabs">
                        <Tab label={`Statistics ${campaignStats ? `(${campaignStats.sent_count} sent)` : ''}`} />
                        <Tab label={`Sent Notifications (${sendsTotal})`} />
                        <Tab label={`Pending Notifications (${pendingTotal})`} />
                    </Tabs>
                </Box>

                {/* Statistics Tab */}
                <TabPanel value={detailTabValue} index={0}>
                    {campaignStats ? (
                        <Grid container spacing={3}>
                            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                <Paper sx={{ p: 3, bgcolor: 'info.50', border: '1px solid', borderColor: 'info.200', textAlign: 'center' }}>
                                    <Box sx={{ color: 'info.main', mb: 1, display: 'flex', justifyContent: 'center' }}>
                                        <Users size={24} />
                                    </Box>
                                    <Typography variant="caption" color="textSecondary" display="block">
                                        Audience Size
                                    </Typography>
                                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'info.main' }}>
                                        {campaignStats.audience_size}
                                    </Typography>
                                </Paper>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                <Paper sx={{ p: 3, bgcolor: 'success.50', border: '1px solid', borderColor: 'success.200', textAlign: 'center' }}>
                                    <Box sx={{ color: 'success.main', mb: 1, display: 'flex', justifyContent: 'center' }}>
                                        <CheckCircle2 size={24} />
                                    </Box>
                                    <Typography variant="caption" color="textSecondary" display="block">
                                        Labeled
                                    </Typography>
                                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                                        {campaignStats.labeled}
                                    </Typography>
                                </Paper>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                <Paper sx={{ p: 3, bgcolor: 'primary.50', border: '1px solid', borderColor: 'primary.200', textAlign: 'center' }}>
                                    <Box sx={{ color: 'primary.main', mb: 1, display: 'flex', justifyContent: 'center' }}>
                                        <TrendingUp size={24} />
                                    </Box>
                                    <Typography variant="caption" color="textSecondary" display="block">
                                        Sent Count
                                    </Typography>
                                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                        {campaignStats.sent_count}
                                    </Typography>
                                </Paper>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                <Paper sx={{ p: 3, bgcolor: 'error.50', border: '1px solid', borderColor: 'error.200', textAlign: 'center' }}>
                                    <Box sx={{ color: 'error.main', mb: 1, display: 'flex', justifyContent: 'center' }}>
                                        <AlertCircle size={24} />
                                    </Box>
                                    <Typography variant="caption" color="textSecondary" display="block">
                                        Failed Count
                                    </Typography>
                                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                                        {campaignStats.failed_count}
                                    </Typography>
                                </Paper>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                <Paper sx={{ p: 3, bgcolor: 'warning.50', border: '1px solid', borderColor: 'warning.200', textAlign: 'center' }}>
                                    <Box sx={{ color: 'warning.main', mb: 1, display: 'flex', justifyContent: 'center' }}>
                                        <Clock size={24} />
                                    </Box>
                                    <Typography variant="caption" color="textSecondary" display="block">
                                        Pending
                                    </Typography>
                                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                                        {campaignStats.pending}
                                    </Typography>
                                </Paper>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                <Paper sx={{ p: 3, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
                                    <Box sx={{ mb: 1, display: 'flex', justifyContent: 'center' }}>
                                        <Activity size={24} color="action" />
                                    </Box>
                                    <Typography variant="caption" color="textSecondary" display="block">
                                        Success Rate
                                    </Typography>
                                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                                        {campaignStats.success_rate}%
                                    </Typography>
                                </Paper>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                <Paper sx={{ p: 3, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
                                    <Box sx={{ mb: 1, display: 'flex', justifyContent: 'center' }}>
                                        <Users size={24} color="action" />
                                    </Box>
                                    <Typography variant="caption" color="textSecondary" display="block">
                                        Notified
                                    </Typography>
                                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                                        {campaignStats.notified}
                                    </Typography>
                                </Paper>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                <Paper sx={{ p: 3, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
                                    <Box sx={{ mb: 1, display: 'flex', justifyContent: 'center' }}>
                                        <Clock size={24} color="action" />
                                    </Box>
                                    <Typography variant="caption" color="textSecondary" display="block">
                                        Last Run
                                    </Typography>
                                    <Typography variant="body2">
                                        {campaignStats.last_run_at === '0001-01-01T00:00:00Z'
                                            ? 'Never'
                                            : new Date(campaignStats.last_run_at).toLocaleString()}
                                    </Typography>
                                </Paper>
                            </Grid>
                        </Grid>
                    ) : (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                            <LinearProgress sx={{ width: '100%' }} />
                        </Box>
                    )}
                </TabPanel>

                {/* Sent Notifications Tab */}
                <TabPanel value={detailTabValue} index={1}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                        <Box>
                            <Typography variant="h6">
                                Sent Notifications
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                                Showing {campaignSends.length} of {sendsTotal} total (Page {sendsPage + 1} of {sendsTotalPages})
                            </Typography>
                        </Box>
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={() => campaignId && fetchCampaignSends(campaignId, sendsPage)}
                            disabled={sendsLoading}
                            startIcon={sendsLoading ? <Loader2 className="animate-spin" size={16} /> : <Activity size={16} />}
                        >
                            Refresh
                        </Button>
                    </Box>
                    {sendsLoading ? (
                        <LinearProgress />
                    ) : campaignSends.length === 0 ? (
                        <Alert severity="info">No sent notifications found for this campaign</Alert>
                    ) : (
                        <>
                            <Grid container spacing={2}>
                                {campaignSends.map((send) => (
                                <Grid size={{ xs: 12, md: 6 }} key={send.id}>
                                    <Paper
                                        sx={{
                                            p: 2,
                                            border: '1px solid',
                                            borderColor: 'divider',
                                            '&:hover': {
                                                boxShadow: 2,
                                            }
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                            <Box sx={{ flex: 1 }}>
                                                <Typography variant="subtitle1" gutterBottom>
                                                    {send.customer_name}
                                                </Typography>
                                                <Typography variant="caption" color="textSecondary" display="block" gutterBottom>
                                                    Customer ID: {send.customer_id}
                                                </Typography>
                                                {send.zodiac_sign && (
                                                    <Chip
                                                        label={send.zodiac_sign}
                                                        size="small"
                                                        sx={{ mr: 1 }}
                                                        variant="outlined"
                                                        color="primary"
                                                    />
                                                )}
                                            </Box>
                                            <Typography variant="caption" color="textSecondary">
                                                {new Date(send.sent_at).toLocaleString()}
                                            </Typography>
                                        </Box>
                                    </Paper>
                                </Grid>
                            ))}
                        </Grid>

                        {/* Pagination */}
                        {sendsTotalPages > 1 && (
                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 2 }}>
                                <Pagination
                                    count={sendsTotalPages}
                                    page={sendsPage + 1}
                                    onChange={handleSendsPageChange}
                                    color="primary"
                                    size="large"
                                    showFirstButton
                                    showLastButton
                                    disabled={sendsLoading}
                                />
                            </Box>
                        )}
                    </>
                    )}
                </TabPanel>

                {/* Pending Notifications Tab */}
                <TabPanel value={detailTabValue} index={2}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                        <Box>
                            <Typography variant="h6">
                                Pending Notifications
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                                Showing {pendingNotifications.length} of {pendingTotal} total (Page {pendingPage + 1} of {pendingTotalPages})
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                            <FormControl size="small" sx={{ minWidth: 150 }}>
                                <InputLabel>Status Filter</InputLabel>
                                <Select
                                    value={pendingStatusFilter}
                                    onChange={(e) => handleStatusFilterChange(e.target.value)}
                                    label="Status Filter"
                                >
                                    <MenuItem value="all">All Status</MenuItem>
                                    <MenuItem value="pending">Pending</MenuItem>
                                    <MenuItem value="processing">Processing</MenuItem>
                                    <MenuItem value="sent">Sent</MenuItem>
                                    <MenuItem value="failed">Failed</MenuItem>
                                </Select>
                            </FormControl>
                            <Button
                                variant="outlined"
                                size="small"
                                onClick={() => campaignId && fetchPendingNotifications(campaignId, pendingStatusFilter, 0)}
                                disabled={pendingLoading}
                                startIcon={pendingLoading ? <Loader2 className="animate-spin" size={16} /> : <Activity size={16} />}
                            >
                                Refresh
                            </Button>
                        </Box>
                    </Box>
                    {pendingLoading ? (
                        <LinearProgress />
                    ) : pendingNotifications.length === 0 ? (
                        <Alert severity="info">No pending notifications found for this campaign</Alert>
                    ) : (
                        <>
                        <Grid container spacing={2}>
                            {pendingNotifications.map((notif) => (
                                <Grid size={{ xs: 12 }} key={notif.id}>
                                    <Paper
                                        sx={{
                                            p: 2,
                                            border: '1px solid',
                                            borderColor: 'divider',
                                            bgcolor: notif.status === 'sent'
                                                ? 'success.50'
                                                : notif.status === 'failed'
                                                    ? 'error.50'
                                                    : notif.status === 'processing'
                                                        ? 'warning.50'
                                                        : 'background.paper',
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                            <Box sx={{ flex: 1 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                                                    <Typography variant="subtitle1">
                                                        {notif.customer_name}
                                                    </Typography>
                                                    <Chip
                                                        label={notif.status.toUpperCase()}
                                                        size="small"
                                                        color={
                                                            notif.status === 'sent'
                                                                ? 'success'
                                                                : notif.status === 'failed'
                                                                    ? 'error'
                                                                    : notif.status === 'processing'
                                                                        ? 'warning'
                                                                        : 'default'
                                                        }
                                                    />
                                                    {notif.zodiac_sign && (
                                                        <Chip
                                                            label={notif.zodiac_sign}
                                                            size="small"
                                                            variant="outlined"
                                                        />
                                                    )}
                                                    <Chip
                                                        label={`Attempts: ${notif.attempts}`}
                                                        size="small"
                                                        variant="outlined"
                                                    />
                                                </Box>
                                                <Typography variant="body2" sx={{ mb: 1 }}>
                                                    <strong>Title:</strong> {notif.title}
                                                </Typography>
                                                <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                                                    <strong>Body:</strong> {notif.body}
                                                </Typography>
                                                <Typography variant="caption" color="textSecondary">
                                                    Customer ID: {notif.customer_id} |
                                                    Created: {new Date(notif.created_at).toLocaleString()}
                                                    {notif.sent_at && ` | Sent: ${new Date(notif.sent_at).toLocaleString()}`}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Paper>
                                </Grid>
                            ))}
                        </Grid>

                        {/* Pagination */}
                        {pendingTotalPages > 1 && (
                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 2 }}>
                                <Pagination
                                    count={pendingTotalPages}
                                    page={pendingPage + 1}
                                    onChange={handlePendingPageChange}
                                    color="primary"
                                    size="large"
                                    showFirstButton
                                    showLastButton
                                    disabled={pendingLoading}
                                />
                            </Box>
                        )}
                    </>
                    )}
                </TabPanel>
            </CardContent>
        </Card>
    );
};

export default CampaignDetailPage;
