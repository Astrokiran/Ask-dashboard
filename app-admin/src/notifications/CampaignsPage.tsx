import React, { useState, useEffect } from 'react';
import {
    Title,
    useNotify,
} from 'react-admin';
import { useNavigate } from 'react-router-dom';
import {
    Card,
    CardContent,
    TextField,
    Button,
    Typography,
    Box,
    Alert,
    LinearProgress,
    Tabs,
    Tab,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Paper,
    Grid,
    Switch,
    FormControlLabel,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material';
import { Megaphone, Send, CheckCircle, Loader2, Plus, Clock, Users, Target, Activity, TrendingUp, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { httpClient } from '../dataProvider';

const API_URL = process.env.REACT_APP_API_URL;

interface AudienceParams {
    min?: number;
    max?: number;
    days_since_last_interaction?: number;
    [key: string]: number | undefined;
}

interface PushData {
    screen?: string;
    [key: string]: string | number | undefined;
}

interface Campaign {
    id?: string;
    name: string;
    description: string;
    audience_type: string;
    audience_params: AudienceParams;
    push_title: string;
    push_body: string;
    push_data: PushData;
    schedule: string;
    cooldown_hours: number;
    max_daily_sends: number;
    is_active?: boolean;
    created_at?: string;
    updated_at?: string;
}

interface DashboardStats {
    total_campaigns: number;
    active_campaigns: number;
    total_labels: number;
    pending_labels: number;
    total_pending: number;
    processing_notifications: number;
    sent_today: number;
    failed_today: number;
}

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

// Audience type definitions
const AUDIENCE_TYPES = [
    {
        value: 'wallet_balance',
        label: 'Wallet Balance',
        description: 'Users with wallet balance above/below threshold',
        params: [
            { name: 'min', label: 'Minimum Balance', type: 'number', default: 100 },
        ],
    },
    {
        value: 'inactive_users',
        label: 'Inactive Users',
        description: 'Users who have not interacted in a while',
        params: [
            { name: 'days_since_last_interaction', label: 'Days Since Last Interaction', type: 'number', default: 30 },
        ],
    },
    {
        value: 'all_customers',
        label: 'All Customers',
        description: 'Send to all registered customers',
        params: [],
    },
    {
        value: 'mvu_customers',
        label: 'MVU Customers',
        description: 'Marketing Value Unit customers',
        params: [
            { name: 'min', label: 'Minimum MVU Score', type: 'number', default: 50 },
        ],
    },
];

// Cron helper
const CRON_PRESETS = [
    { label: 'Daily at 9 AM', value: '0 0 9 * * *' },
    { label: 'Daily at 6 PM', value: '0 0 18 * * *' },
    { label: 'Every Morning (8 AM)', value: '0 0 8 * * *' },
    { label: 'Every Evening (8 PM)', value: '0 0 20 * * *' },
    { label: 'Weekdays at 10 AM', value: '0 0 10 * * 1-5' },
    { label: 'Weekly Monday 9 AM', value: '0 0 9 * * 1' },
];

// Template variables help
const TEMPLATE_VARIABLES = [
    { name: '{{name}}', description: 'User name' },
    { name: '{{wallet_balance}}', description: 'Wallet balance' },
    { name: '{{email}}', description: 'User email' },
    { name: '{{phone}}', description: 'User phone' },
];

const DEEP_LINK_SCREENS = [
    { value: 'guides', label: 'Guides List' },
    { value: 'home', label: 'Home' },
    { value: 'wallet', label: 'Wallet' },
    { value: 'consultations', label: 'My Consultations' },
    { value: 'profile', label: 'Profile' },
];

export const CampaignsPage = () => {
    const notify = useNotify();
    const navigate = useNavigate();
    const [tabValue, setTabValue] = useState(0);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);

    // Stats state
    const [stats, setStats] = useState<DashboardStats>({
        total_campaigns: 0,
        active_campaigns: 0,
        total_labels: 0,
        pending_labels: 0,
        total_pending: 0,
        processing_notifications: 0,
        sent_today: 0,
        failed_today: 0,
    });
    const [statsLoading, setStatsLoading] = useState(true);

    // Form state
    const [campaign, setCampaign] = useState<Campaign>({
        name: '',
        description: '',
        audience_type: 'wallet_balance',
        audience_params: { min: 100 },
        push_title: '',
        push_body: '',
        push_data: { screen: 'guides' },
        schedule: '0 0 9 * * *',
        cooldown_hours: 72,
        max_daily_sends: 2,
    });

    // Custom cron input
    const [customCron, setCustomCron] = useState('');
    const [useCustomCron, setUseCustomCron] = useState(false);

    // Custom time picker state
    const [useCustomTime, setUseCustomTime] = useState(false);
    const [selectedHour, setSelectedHour] = useState(9);
    const [selectedMinute, setSelectedMinute] = useState(0);
    const [selectedPeriod, setSelectedPeriod] = useState<'AM' | 'PM'>('AM');

    // Custom fields state
    const [customFields, setCustomFields] = useState<Array<{ key: string; value: number }>>([]);
    const [newFieldKey, setNewFieldKey] = useState('');
    const [newFieldValue, setNewFieldValue] = useState('');

    useEffect(() => {
        fetchStats();
        fetchCampaigns();
    }, []);

    const fetchStats = async () => {
        setStatsLoading(true);
        try {
            const { json } = await httpClient(`${API_URL}/api/v1/notifications/dashboard/overview`, {
                method: 'GET',
            });
            setStats(json);
        } catch (error: any) {
            console.error('Error fetching stats:', error);
            // Don't show error notification, just log it
        } finally {
            setStatsLoading(false);
        }
    };

    const fetchCampaigns = async () => {
        setLoading(true);
        try {
            const { json } = await httpClient(`${API_URL}/api/v1/notifications/campaigns`, {
                method: 'GET',
            });
            // Ensure campaigns is always an array
            const campaignsData = json?.data || json?.campaigns || json;
            const campaignsArray = Array.isArray(campaignsData) ? campaignsData : [];
            setCampaigns(campaignsArray);
        } catch (error: any) {
            console.error('Error fetching campaigns:', error);
            // Set to empty array on error to prevent .map() errors
            setCampaigns([]);
        } finally {
            setLoading(false);
        }
    };

    const handleCampaignClick = (campaign: Campaign) => {
        navigate(`/campaigns/${campaign.id}`);
    };

    const handleSaveCampaign = async () => {
        // Validation
        if (!campaign.name.trim()) {
            notify('Campaign name is required', { type: 'warning' });
            return;
        }
        if (!campaign.push_title.trim()) {
            notify('Push title is required', { type: 'warning' });
            return;
        }
        if (!campaign.push_body.trim()) {
            notify('Push body is required', { type: 'warning' });
            return;
        }
        if (!campaign.schedule.trim()) {
            notify('Schedule is required', { type: 'warning' });
            return;
        }

        setSaving(true);
        try {
            const payload = {
                name: campaign.name.trim(),
                description: campaign.description.trim(),
                audience_type: campaign.audience_type,
                audience_params: campaign.audience_params,
                push_title: campaign.push_title.trim(),
                push_body: campaign.push_body.trim(),
                push_data: campaign.push_data,
                schedule: campaign.schedule.trim(),
                cooldown_hours: Number(campaign.cooldown_hours),
                max_daily_sends: Number(campaign.max_daily_sends),
            };

            await httpClient(`${API_URL}/api/v1/notifications/campaigns`, {
                method: 'POST',
                body: JSON.stringify(payload),
            });

            notify('Campaign created successfully!', { type: 'success' });
            resetForm();
            fetchCampaigns();
            fetchStats(); // Refresh stats after creating campaign
            setTabValue(0); // Switch to list view
        } catch (error: any) {
            console.error('Error creating campaign:', error);
            let errorMessage = error.message || 'Failed to create campaign';
            if (error.body?.detail) {
                errorMessage = typeof error.body.detail === 'string'
                    ? error.body.detail
                    : JSON.stringify(error.body.detail);
            }
            notify(`Error: ${errorMessage}`, { type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const resetForm = () => {
        setCampaign({
            name: '',
            description: '',
            audience_type: 'wallet_balance',
            audience_params: { min: 100 },
            push_title: '',
            push_body: '',
            push_data: { screen: 'guides' },
            schedule: '0 0 9 * * *',
            cooldown_hours: 72,
            max_daily_sends: 2,
        });
        setCustomCron('');
        setUseCustomCron(false);
        setUseCustomTime(false);
        setSelectedHour(9);
        setSelectedMinute(0);
        setSelectedPeriod('AM');
        setCustomFields([]);
        setNewFieldKey('');
        setNewFieldValue('');
    };

    const handleAudienceTypeChange = (audienceType: string) => {
        const audienceConfig = AUDIENCE_TYPES.find(t => t.value === audienceType);
        const newParams: AudienceParams = {};

        if (audienceConfig) {
            audienceConfig.params.forEach(param => {
                if (param.default !== undefined) {
                    newParams[param.name] = param.default;
                }
            });
        }

        setCampaign({
            ...campaign,
            audience_type: audienceType,
            audience_params: newParams,
        });
        // Clear custom fields when audience type changes
        setCustomFields([]);
    };

    const addCustomField = () => {
        if (newFieldKey.trim() && newFieldValue.trim()) {
            const newField = {
                key: newFieldKey.trim(),
                value: Number(newFieldValue),
            };
            setCustomFields([...customFields, newField]);

            // Update audience_params
            const updatedParams = {
                ...campaign.audience_params,
                [newField.key]: newField.value,
            };
            setCampaign({
                ...campaign,
                audience_params: updatedParams,
            });

            setNewFieldKey('');
            setNewFieldValue('');
        }
    };

    const removeCustomField = (keyToRemove: string) => {
        const updatedFields = customFields.filter(f => f.key !== keyToRemove);
        setCustomFields(updatedFields);

        // Update audience_params
        const updatedParams = { ...campaign.audience_params };
        delete updatedParams[keyToRemove];
        setCampaign({
            ...campaign,
            audience_params: updatedParams,
        });
    };

    const getCronDescription = (cron: string): string => {
        const preset = CRON_PRESETS.find(p => p.value === cron);
        return preset ? preset.label : 'Custom schedule';
    };

    const insertTemplateVariable = (variable: string) => {
        setCampaign({
            ...campaign,
            push_title: campaign.push_title + variable,
        });
    };

    const convertTimeToCron = (hour: number, minute: number, period: 'AM' | 'PM'): string => {
        let hour24 = hour;
        if (period === 'PM' && hour !== 12) {
            hour24 += 12;
        } else if (period === 'AM' && hour === 12) {
            hour24 = 0;
        }
        return `0 ${minute} ${hour24} * * *`;
    };

    const handleCustomTimeApply = () => {
        const cronExpression = convertTimeToCron(selectedHour, selectedMinute, selectedPeriod);
        setCampaign({
            ...campaign,
            schedule: cronExpression,
        });
        setCustomCron(cronExpression);
        setUseCustomTime(false);
    };

    const handleUseCustomTimeToggle = () => {
        if (!useCustomTime) {
            setUseCustomTime(true);
            setUseCustomCron(false);
        } else {
            setUseCustomTime(false);
        }
    };

    const handleUseCustomCronToggle = () => {
        if (!useCustomCron) {
            setUseCustomCron(true);
            setUseCustomTime(false);
        } else {
            setUseCustomCron(false);
        }
    };

    return (
        <Card>
            <Title title="Notification Campaigns" />
            <CardContent>
                {/* Stats Dashboard */}
                <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Activity size={20} />
                            Dashboard Overview
                        </Typography>
                        <Button
                            size="small"
                            onClick={fetchStats}
                            disabled={statsLoading}
                            startIcon={statsLoading ? <Loader2 className="animate-spin" size={16} /> : <Activity size={16} />}
                        >
                            Refresh Stats
                        </Button>
                    </Box>
                    {statsLoading ? (
                        <LinearProgress />
                    ) : (
                        <Grid container spacing={2}>
                            {/* Campaign Stats */}
                            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                <Paper
                                    sx={{
                                        p: 2,
                                        bgcolor: 'primary.50',
                                        border: '1px solid',
                                        borderColor: 'primary.200',
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Megaphone size={20} color="primary" />
                                        <Box>
                                            <Typography variant="caption" color="textSecondary">
                                                Total Campaigns
                                            </Typography>
                                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                                {stats.total_campaigns}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Paper>
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                <Paper
                                    sx={{
                                        p: 2,
                                        bgcolor: 'success.50',
                                        border: '1px solid',
                                        borderColor: 'success.200',
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Box sx={{ color: 'success.main' }}>
                                            <Activity size={20} />
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" color="textSecondary">
                                                Active Campaigns
                                            </Typography>
                                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                                {stats.active_campaigns}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Paper>
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                <Paper
                                    sx={{
                                        p: 2,
                                        bgcolor: 'info.50',
                                        border: '1px solid',
                                        borderColor: 'info.200',
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Box sx={{ color: 'info.main' }}>
                                            <TrendingUp size={20} />
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" color="textSecondary">
                                                Sent Today
                                            </Typography>
                                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                                {stats.sent_today}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Paper>
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                <Paper
                                    sx={{
                                        p: 2,
                                        bgcolor: 'error.50',
                                        border: '1px solid',
                                        borderColor: 'error.200',
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Box sx={{ color: 'error.main' }}>
                                            <AlertCircle size={20} />
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" color="textSecondary">
                                                Failed Today
                                            </Typography>
                                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                                {stats.failed_today}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Paper>
                            </Grid>

                            {/* Additional Stats */}
                            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                <Paper sx={{ p: 2, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Users size={20} color="action" />
                                        <Box>
                                            <Typography variant="caption" color="textSecondary">
                                                Total Labels
                                            </Typography>
                                            <Typography variant="h6">
                                                {stats.total_labels}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Paper>
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                <Paper sx={{ p: 2, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Clock size={20} color="action" />
                                        <Box>
                                            <Typography variant="caption" color="textSecondary">
                                                Pending Labels
                                            </Typography>
                                            <Typography variant="h6">
                                                {stats.pending_labels}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Paper>
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                <Paper sx={{ p: 2, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Loader2 size={20} color="action" />
                                        <Box>
                                            <Typography variant="caption" color="textSecondary">
                                                Processing
                                            </Typography>
                                            <Typography variant="h6">
                                                {stats.processing_notifications}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Paper>
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                <Paper sx={{ p: 2, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <CheckCircle2 size={20} color="action" />
                                        <Box>
                                            <Typography variant="caption" color="textSecondary">
                                                Pending
                                            </Typography>
                                            <Typography variant="h6">
                                                {stats.total_pending}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Paper>
                            </Grid>
                        </Grid>
                    )}
                </Box>

                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                    <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
                        <Tab label="Create Campaign" />
                        <Tab label="Active Campaigns" />
                    </Tabs>
                </Box>

                {/* Create Campaign Tab */}
                <TabPanel value={tabValue} index={0}>
                    <Typography variant="h5" component="h2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Megaphone size={24} />
                        Create Notification Campaign
                    </Typography>

                    <Grid container spacing={3}>
                        {/* Basic Info */}
                        <Grid size={{ xs: 12 }}>
                            <Paper sx={{ p: 3, mb: 2 }}>
                                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Users size={18} />
                                    Campaign Details
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <TextField
                                            label="Campaign Name"
                                            value={campaign.name}
                                            onChange={(e) => setCampaign({ ...campaign, name: e.target.value })}
                                            fullWidth
                                            required
                                            placeholder="e.g., wallet-balance-promo"
                                            helperText="Unique identifier for this campaign"
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <FormControl fullWidth>
                                            <InputLabel>Audience Type</InputLabel>
                                            <Select
                                                value={campaign.audience_type}
                                                onChange={(e) => handleAudienceTypeChange(e.target.value)}
                                                label="Audience Type"
                                            >
                                                {AUDIENCE_TYPES.map((type) => (
                                                    <MenuItem key={type.value} value={type.value}>
                                                        <Box>
                                                            <Typography variant="body2">{type.label}</Typography>
                                                            <Typography variant="caption" color="textSecondary">
                                                                {type.description}
                                                            </Typography>
                                                        </Box>
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid size={{ xs: 12 }}>
                                        <TextField
                                            label="Description"
                                            value={campaign.description}
                                            onChange={(e) => setCampaign({ ...campaign, description: e.target.value })}
                                            fullWidth
                                            multiline
                                            rows={2}
                                            placeholder="Describe the purpose of this campaign"
                                        />
                                    </Grid>
                                </Grid>
                            </Paper>
                        </Grid>

                        {/* Audience Parameters */}
                        <Grid size={{ xs: 12 }}>
                            <Paper sx={{ p: 3, mb: 2 }}>
                                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Target size={18} />
                                    Audience Parameters
                                </Typography>
                                <Grid container spacing={2}>
                                    {AUDIENCE_TYPES.find(t => t.value === campaign.audience_type)?.params.map((param) => (
                                        <Grid size={{ xs: 12, md: 6 }} key={param.name}>
                                            <TextField
                                                label={param.label}
                                                type="number"
                                                value={campaign.audience_params[param.name] || ''}
                                                onChange={(e) =>
                                                    setCampaign({
                                                        ...campaign,
                                                        audience_params: {
                                                            ...campaign.audience_params,
                                                            [param.name]: Number(e.target.value),
                                                        },
                                                    })
                                                }
                                                fullWidth
                                            />
                                        </Grid>
                                    ))}
                                    {AUDIENCE_TYPES.find(t => t.value === campaign.audience_type)?.params.length === 0 && (
                                        <Grid size={{ xs: 12 }}>
                                            <Alert severity="info">
                                                No additional parameters needed for this audience type.
                                            </Alert>
                                        </Grid>
                                    )}

                                    {/* Custom Fields Section */}
                                    <Grid size={{ xs: 12 }}>
                                        <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                                            <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Plus size={16} />
                                                Custom Fields (Optional)
                                            </Typography>
                                            <Typography variant="caption" color="textSecondary" sx={{ mb: 2, display: 'block' }}>
                                                Add additional custom parameters to the audience configuration
                                            </Typography>

                                            {/* List of custom fields */}
                                            {customFields.length > 0 && (
                                                <Box sx={{ mb: 2 }}>
                                                    {customFields.map((field) => (
                                                        <Chip
                                                            key={field.key}
                                                            label={`${field.key}: ${field.value}`}
                                                            onDelete={() => removeCustomField(field.key)}
                                                            sx={{ mr: 1, mb: 1 }}
                                                            color="primary"
                                                            variant="outlined"
                                                        />
                                                    ))}
                                                </Box>
                                            )}

                                            {/* Add new custom field */}
                                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                                                <TextField
                                                    label="Field Key"
                                                    value={newFieldKey}
                                                    onChange={(e) => setNewFieldKey(e.target.value)}
                                                    size="small"
                                                    sx={{ minWidth: 150 }}
                                                    placeholder="e.g., min_age"
                                                />
                                                <TextField
                                                    label="Field Value"
                                                    type="number"
                                                    value={newFieldValue}
                                                    onChange={(e) => setNewFieldValue(e.target.value)}
                                                    size="small"
                                                    sx={{ minWidth: 120 }}
                                                    placeholder="e.g., 18"
                                                />
                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    onClick={addCustomField}
                                                    disabled={!newFieldKey.trim() || !newFieldValue.trim()}
                                                    startIcon={<Plus size={14} />}
                                                >
                                                    Add Field
                                                </Button>
                                            </Box>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </Paper>
                        </Grid>

                        {/* Push Notification Content */}
                        <Grid size={{ xs: 12 }}>
                            <Paper sx={{ p: 3, mb: 2 }}>
                                <Typography variant="h6" gutterBottom>Push Notification Content</Typography>

                                {/* Template Variables Helper */}
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="caption" color="textSecondary" gutterBottom>
                                        Available template variables (click to insert):
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                                        {TEMPLATE_VARIABLES.map((v) => (
                                            <Chip
                                                key={v.name}
                                                label={`${v.name} - ${v.description}`}
                                                onClick={() => insertTemplateVariable(v.name)}
                                                size="small"
                                                clickable
                                                variant="outlined"
                                            />
                                        ))}
                                    </Box>
                                </Box>

                                <TextField
                                    label="Push Title"
                                    value={campaign.push_title}
                                    onChange={(e) => setCampaign({ ...campaign, push_title: e.target.value })}
                                    fullWidth
                                    required
                                    placeholder="e.g., {{name}}, you have ₹{{wallet_balance}} in your wallet!"
                                    helperText="Use {{variable}} for template substitution"
                                />
                                <TextField
                                    label="Push Body"
                                    value={campaign.push_body}
                                    onChange={(e) => setCampaign({ ...campaign, push_body: e.target.value })}
                                    fullWidth
                                    multiline
                                    rows={3}
                                    required
                                    sx={{ mt: 2 }}
                                    placeholder="e.g., Use your balance to book a consultation today."
                                />

                                <Grid container spacing={2} sx={{ mt: 1 }}>
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <FormControl fullWidth>
                                            <InputLabel>Deep Link Screen</InputLabel>
                                            <Select
                                                value={campaign.push_data.screen || ''}
                                                onChange={(e) =>
                                                    setCampaign({
                                                        ...campaign,
                                                        push_data: { screen: e.target.value },
                                                    })
                                                }
                                                label="Deep Link Screen"
                                            >
                                                {DEEP_LINK_SCREENS.map((screen) => (
                                                    <MenuItem key={screen.value} value={screen.value}>
                                                        {screen.label}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                </Grid>
                            </Paper>
                        </Grid>

                        {/* Schedule & Limits */}
                        <Grid size={{ xs: 12 }}>
                            <Paper sx={{ p: 3, mb: 2 }}>
                                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Clock size={18} />
                                    Schedule & Limits
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid size={{ xs: 12 }}>
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={useCustomTime}
                                                    onChange={handleUseCustomTimeToggle}
                                                />
                                            }
                                            label="Use custom time (IST)"
                                        />
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={useCustomCron}
                                                    onChange={handleUseCustomCronToggle}
                                                    disabled={useCustomTime}
                                                />
                                            }
                                            label="Use custom cron schedule"
                                            sx={{ ml: 2 }}
                                        />
                                    </Grid>

                                    {useCustomTime ? (
                                        <Grid size={{ xs: 12 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                                                <FormControl sx={{ minWidth: 100 }}>
                                                    <InputLabel>Hour</InputLabel>
                                                    <Select
                                                        value={selectedHour}
                                                        onChange={(e) => setSelectedHour(Number(e.target.value))}
                                                        label="Hour"
                                                    >
                                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((h) => (
                                                            <MenuItem key={h} value={h}>
                                                                {h}
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                </FormControl>

                                                <FormControl sx={{ minWidth: 100 }}>
                                                    <InputLabel>Minute</InputLabel>
                                                    <Select
                                                        value={selectedMinute}
                                                        onChange={(e) => setSelectedMinute(Number(e.target.value))}
                                                        label="Minute"
                                                    >
                                                        {Array.from({ length: 60 }, (_, i) => (
                                                            <MenuItem key={i} value={i}>
                                                                {i.toString().padStart(2, '0')}
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                </FormControl>

                                                <FormControl sx={{ minWidth: 100 }}>
                                                    <InputLabel>Period</InputLabel>
                                                    <Select
                                                        value={selectedPeriod}
                                                        onChange={(e) => setSelectedPeriod(e.target.value as 'AM' | 'PM')}
                                                        label="Period"
                                                    >
                                                        <MenuItem value="AM">AM</MenuItem>
                                                        <MenuItem value="PM">PM</MenuItem>
                                                    </Select>
                                                </FormControl>

                                                <Button
                                                    variant="contained"
                                                    onClick={handleCustomTimeApply}
                                                    sx={{ mt: 2 }}
                                                >
                                                    Apply Time
                                                </Button>

                                                <Box sx={{ mt: 2, ml: 'auto' }}>
                                                    <Typography variant="caption" color="textSecondary">
                                                        Converted: {convertTimeToCron(selectedHour, selectedMinute, selectedPeriod)}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                            <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                                                Selected Time: {selectedHour}:{selectedMinute.toString().padStart(2, '0')} {selectedPeriod} IST
                                            </Typography>
                                        </Grid>
                                    ) : useCustomCron ? (
                                        <Grid size={{ xs: 12 }}>
                                            <TextField
                                                label="Cron Expression"
                                                value={customCron}
                                                onChange={(e) => {
                                                    setCustomCron(e.target.value);
                                                    setCampaign({ ...campaign, schedule: e.target.value });
                                                }}
                                                fullWidth
                                                placeholder="0 0 9 * * *"
                                                helperText="Format: seconds minutes hours day month weekday (e.g., 0 0 9 * * * for daily at 9 AM)"
                                            />
                                        </Grid>
                                    ) : (
                                        <Grid size={{ xs: 12 }}>
                                            <FormControl fullWidth>
                                                <InputLabel>Schedule Preset</InputLabel>
                                                <Select
                                                    value={campaign.schedule}
                                                    onChange={(e) =>
                                                        setCampaign({ ...campaign, schedule: e.target.value })
                                                    }
                                                    label="Schedule Preset"
                                                >
                                                    {CRON_PRESETS.map((preset) => (
                                                        <MenuItem key={preset.value} value={preset.value}>
                                                            {preset.label}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                            <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                                                Cron: {campaign.schedule}
                                            </Typography>
                                        </Grid>
                                    )}

                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <TextField
                                            label="Cooldown Hours"
                                            type="number"
                                            value={campaign.cooldown_hours}
                                            onChange={(e) =>
                                                setCampaign({ ...campaign, cooldown_hours: Number(e.target.value) })
                                            }
                                            fullWidth
                                            helperText="Minimum hours before user receives another campaign notification"
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <TextField
                                            label="Max Daily Sends"
                                            type="number"
                                            value={campaign.max_daily_sends}
                                            onChange={(e) =>
                                                setCampaign({ ...campaign, max_daily_sends: Number(e.target.value) })
                                            }
                                            fullWidth
                                            helperText="Maximum notifications sent per day for this campaign"
                                        />
                                    </Grid>
                                </Grid>
                            </Paper>
                        </Grid>

                        {/* Actions */}
                        <Grid size={{ xs: 12 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                                <Button
                                    variant="outlined"
                                    onClick={resetForm}
                                    disabled={saving}
                                >
                                    Reset
                                </Button>
                                <Button
                                    variant="contained"
                                    startIcon={saving ? <Loader2 className="animate-spin" /> : <Send />}
                                    onClick={handleSaveCampaign}
                                    disabled={saving}
                                >
                                    {saving ? 'Creating...' : 'Create Campaign'}
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </TabPanel>

                {/* Active Campaigns Tab */}
                <TabPanel value={tabValue} index={1}>
                    <Typography variant="h5" component="h2" gutterBottom>
                        Active Campaigns
                    </Typography>
                    <Alert severity="info" sx={{ mb: 2 }}>
                        Click on any campaign to view detailed statistics, sent notifications, and pending notifications.
                    </Alert>
                    {loading ? (
                        <LinearProgress />
                    ) : campaigns.length === 0 ? (
                        <Alert severity="info">No campaigns found. Create your first campaign!</Alert>
                    ) : (
                        <Grid container spacing={2}>
                            {campaigns.map((c) => (
                                <Grid size={{ xs: 12, md: 6 }} key={c.id}>
                                    <Paper
                                        sx={{
                                            p: 3,
                                            border: '1px solid',
                                            borderColor: c.is_active ? 'success.main' : 'divider',
                                            bgcolor: c.is_active ? 'success.50' : 'background.paper',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            '&:hover': {
                                                boxShadow: 3,
                                                transform: 'translateY(-2px)',
                                            },
                                        }}
                                        onClick={() => handleCampaignClick(c)}
                                    >
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                            <Typography variant="h6">{c.name}</Typography>
                                            <Chip
                                                label={c.is_active ? 'Active' : 'Inactive'}
                                                color={c.is_active ? 'success' : 'default'}
                                                size="small"
                                            />
                                        </Box>
                                        <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                                            {c.description || 'No description'}
                                        </Typography>
                                        <Box sx={{ mt: 2 }}>
                                            <Typography variant="caption" color="textSecondary">
                                                Audience: {c.audience_type}
                                            </Typography>
                                            <br />
                                            <Typography variant="caption" color="textSecondary">
                                                Schedule: {getCronDescription(c.schedule)} ({c.schedule})
                                            </Typography>
                                            <br />
                                            <Typography variant="caption" color="textSecondary">
                                                Cooldown: {c.cooldown_hours}h | Max Daily: {c.max_daily_sends}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                                            <Typography variant="subtitle2">
                                                "{c.push_title}"
                                            </Typography>
                                            <Typography variant="body2" color="textSecondary">
                                                {c.push_body}
                                            </Typography>
                                        </Box>
                                    </Paper>
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </TabPanel>
            </CardContent>
        </Card>
    );
};
