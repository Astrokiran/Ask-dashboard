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
    Tabs,
    Tab,
    FormControl,
    InputLabel,
    Switch,
    FormControlLabel,
    Chip,
    Paper,
    Divider,
    MenuItem,
    Select,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
    Title,
    useNotify,
} from 'react-admin';
import { MessageSquare, Send, CheckCircle, XCircle, Loader2, Plus } from 'lucide-react';
import { httpClient } from '../dataProvider';

const API_URL = process.env.REACT_APP_API_URL;

interface TemplateConfig {
    template_id: string;
    language: string;
    enabled: boolean;
    params: string[];
}

interface WhatsAppSettings {
    api_base_url?: string;
    api_email?: string;
    default_language?: string;
    whatsapp_enabled?: boolean;
    tenant_id?: string;
    id?: number;
    event_templates?: Record<string, TemplateConfig>;
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

// Helper to format event type label
const formatEventLabel = (eventType: string): string => {
    return eventType
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

export const WhatsAppSettingsPage = () => {
    const notify = useNotify();
    const [tabValue, setTabValue] = useState(0);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [testing, setTesting] = useState(false);
    const [settings, setSettings] = useState<WhatsAppSettings>({});
    const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

    // Event type management
    const [selectedEventType, setSelectedEventType] = useState('');
    const [currentTemplate, setCurrentTemplate] = useState<TemplateConfig>({
        template_id: '',
        language: 'en_US',
        enabled: false,
        params: [],
    });
    const [isNewEventType, setIsNewEventType] = useState(false);

    // Test Notification State
    const [testPhone, setTestPhone] = useState('');
    const [testEventType, setTestEventType] = useState('');
    const [testParams, setTestParams] = useState<Record<string, string>>({
        name: '',
        phone: '',
        guide_name: '',
        message: '',
        consultation_id: '',
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    useEffect(() => {
        if (settings.event_templates && Object.keys(settings.event_templates).length > 0) {
            // Set first event type as default if none selected
            if (!selectedEventType) {
                const firstEvent = Object.keys(settings.event_templates)[0];
                setSelectedEventType(firstEvent);
                setTestEventType(firstEvent);
            }
        }
    }, [settings]);

    useEffect(() => {
        if (selectedEventType && settings.event_templates?.[selectedEventType]) {
            const template = settings.event_templates[selectedEventType];
            if (template) {
                setCurrentTemplate({
                    template_id: template.template_id || '',
                    language: template.language || 'en_US',
                    enabled: template.enabled ?? false,
                    params: template.params || [],
                });
                setIsNewEventType(false);
            }
        }
    }, [settings, selectedEventType]);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const { json: settingsJson } = await httpClient(`${API_URL}/api/v1/notifications/whatsapp/settings`, {
                method: 'GET',
            });
            const settingsData = settingsJson.data || settingsJson;
            setSettings(settingsData);
        } catch (error: any) {
            console.error('Error fetching WhatsApp settings:', error);
            notify(`Error loading settings: ${error.message}`, { type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleSaveTemplate = async () => {
        if (!selectedEventType.trim()) {
            notify('Please enter or select an event type', { type: 'warning' });
            return;
        }

        setSaving(true);
        try {
            await httpClient(
                `${API_URL}/api/v1/notifications/whatsapp/templates/${selectedEventType}`,
                {
                    method: 'PUT',
                    body: JSON.stringify(currentTemplate),
                }
            );
            notify(`Template updated successfully`, { type: 'success' });
            setIsNewEventType(false);
            // Refresh settings after save
            fetchSettings();
        } catch (error: any) {
            console.error('Error updating template:', error);
            let errorMessage = error.message || 'Failed to update template';
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

    const handleTestNotification = async () => {
        if (!testPhone.trim()) {
            notify('Please enter a phone number', { type: 'warning' });
            return;
        }

        if (!testEventType.trim()) {
            notify('Please select an event type', { type: 'warning' });
            return;
        }

        setTesting(true);
        setTestResult(null);

        try {
            const { json } = await httpClient(
                `${API_URL}/api/v1/notifications/whatsapp/test`,
                {
                    method: 'POST',
                    body: JSON.stringify({
                        phone: testPhone.trim(),
                        event_type: testEventType,
                        params: testParams,
                    }),
                }
            );
            setTestResult({ success: true, message: 'Test notification sent successfully!' });
            notify('Test notification sent', { type: 'success' });
        } catch (error: any) {
            console.error('Error testing notification:', error);
            let errorMessage = error.message || 'Failed to send test';
            if (error.body?.detail) {
                errorMessage = typeof error.body.detail === 'string'
                    ? error.body.detail
                    : JSON.stringify(error.body.detail);
            }
            setTestResult({ success: false, message: errorMessage });
            notify(`Test failed: ${errorMessage}`, { type: 'error' });
        } finally {
            setTesting(false);
        }
    };

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    const handleEventTypeChange = (eventType: string) => {
        setSelectedEventType(eventType);
        setIsNewEventType(false);
        const template = settings.event_templates?.[eventType];
        if (template) {
            setCurrentTemplate({
                template_id: template.template_id || '',
                language: template.language || 'en_US',
                enabled: template.enabled ?? false,
                params: template.params || [],
            });
        }
    };

    const handleNewEventType = () => {
        setSelectedEventType('');
        setCurrentTemplate({
            template_id: '',
            language: 'en_US',
            enabled: false,
            params: [],
        });
        setIsNewEventType(true);
    };

    const addParam = (param: string) => {
        if (param && !currentTemplate.params.includes(param)) {
            setCurrentTemplate({
                ...currentTemplate,
                params: [...currentTemplate.params, param],
            });
        }
    };

    const removeParam = (index: number) => {
        const newParams = [...currentTemplate.params];
        newParams.splice(index, 1);
        setCurrentTemplate({
            ...currentTemplate,
            params: newParams,
        });
    };

    // Get sorted event types list
    const getEventTypesList = () => {
        if (!settings.event_templates) return [];
        return Object.keys(settings.event_templates).sort();
    };

    if (loading) {
        return (
            <Card>
                <Title title="WhatsApp Settings" />
                <LinearProgress />
            </Card>
        );
    }

    const eventTypesList = getEventTypesList();

    return (
        <Card>
            <Title title="WhatsApp Notification Settings" />
            <CardContent>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                    <Tabs value={tabValue} onChange={handleTabChange}>
                        <Tab label="Templates" />
                        <Tab label="Test Notification" />
                        <Tab label="API Settings" />
                    </Tabs>
                </Box>

                {/* Templates Tab */}
                <TabPanel value={tabValue} index={0}>
                    <Typography variant="h6" gutterBottom>
                        Manage Event Templates
                    </Typography>

                    {/* Event Type Selector */}
                    <Paper sx={{ p: 2, mb: 3 }}>
                        <Grid container spacing={2} alignItems="center">
                            <Grid size={{ xs: 12, md: isNewEventType ? 8 : 12 }}>
                                {isNewEventType ? (
                                    <TextField
                                        fullWidth
                                        label="New Event Type Name"
                                        placeholder="e.g., consultation_started, order_completed"
                                        value={selectedEventType}
                                        onChange={(e) => setSelectedEventType(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                                        helperText="Use lowercase with underscores (e.g., event_type_name)"
                                    />
                                ) : (
                                    <FormControl fullWidth>
                                        <InputLabel>Select Event Type</InputLabel>
                                        <Select
                                            value={selectedEventType}
                                            onChange={(e) => handleEventTypeChange(e.target.value)}
                                            label="Select Event Type"
                                        >
                                            {eventTypesList.map((type) => (
                                                <MenuItem key={type} value={type}>
                                                    {formatEventLabel(type)}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                )}
                            </Grid>
                            {!isNewEventType && (
                                <Grid size={{ xs: 12 }}>
                                    <Button
                                        startIcon={<Plus />}
                                        onClick={handleNewEventType}
                                        variant="outlined"
                                        size="small"
                                    >
                                        Add New Event Type
                                    </Button>
                                </Grid>
                            )}
                            {isNewEventType && (
                                <Grid size={{ xs: 12, md: 4 }}>
                                    <Button
                                        onClick={() => {
                                            if (eventTypesList.length > 0) {
                                                handleEventTypeChange(eventTypesList[0]);
                                            } else {
                                                setIsNewEventType(false);
                                            }
                                        }}
                                        variant="outlined"
                                        fullWidth
                                    >
                                        Cancel
                                    </Button>
                                </Grid>
                            )}
                        </Grid>
                    </Paper>

                    {/* Template Configuration */}
                    <Paper sx={{ p: 3, mb: 3 }}>
                        <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                            {isNewEventType ? 'New Event Type' : formatEventLabel(selectedEventType)} Configuration
                        </Typography>
                        <Grid container spacing={3}>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    label="Template ID"
                                    value={currentTemplate.template_id}
                                    onChange={(e) =>
                                        setCurrentTemplate({
                                            ...currentTemplate,
                                            template_id: e.target.value,
                                        })
                                    }
                                    fullWidth
                                    helperText="WhatsApp Business template ID from Meta"
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <FormControl fullWidth>
                                    <InputLabel>Language</InputLabel>
                                    <Select
                                        value={currentTemplate.language}
                                        onChange={(e) =>
                                            setCurrentTemplate({
                                                ...currentTemplate,
                                                language: e.target.value,
                                            })
                                        }
                                        label="Language"
                                    >
                                        <MenuItem value="en_US">English (US)</MenuItem>
                                        <MenuItem value="en_GB">English (UK)</MenuItem>
                                        <MenuItem value="hi">Hindi</MenuItem>
                                        <MenuItem value="ta">Tamil</MenuItem>
                                        <MenuItem value="te">Telugu</MenuItem>
                                        <MenuItem value="kn">Kannada</MenuItem>
                                        <MenuItem value="ml">Malayalam</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={currentTemplate.enabled}
                                            onChange={(e) =>
                                                setCurrentTemplate({
                                                    ...currentTemplate,
                                                    enabled: e.target.checked,
                                                })
                                            }
                                            color="primary"
                                        />
                                    }
                                    label="Enable this template"
                                />
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <Typography variant="subtitle2" gutterBottom>
                                    Template Parameters
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
                                    {(currentTemplate.params || []).map((param, index) => (
                                        <Chip
                                            key={index}
                                            label={`{{${param}}}`}
                                            onDelete={() => removeParam(index)}
                                        />
                                    ))}
                                    <TextField
                                        size="small"
                                        placeholder="Add parameter"
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                const value = (e.target as HTMLInputElement).value.trim();
                                                addParam(value);
                                                (e.target as HTMLInputElement).value = '';
                                            }
                                        }}
                                        sx={{ width: 150 }}
                                    />
                                </Box>
                                <Typography variant="caption" color="textSecondary">
                                    These parameters will be replaced with actual values when sending
                                </Typography>
                            </Grid>
                        </Grid>
                        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                            <Button
                                variant="contained"
                                startIcon={saving ? <Loader2 className="animate-spin" /> : <CheckCircle />}
                                onClick={handleSaveTemplate}
                                disabled={saving || !selectedEventType.trim()}
                            >
                                {saving ? 'Saving...' : isNewEventType ? 'Create Template' : 'Save Template'}
                            </Button>
                        </Box>
                    </Paper>
                </TabPanel>

                {/* Test Notification Tab */}
                <TabPanel value={tabValue} index={1}>
                    <Typography variant="h6" gutterBottom>
                        Send Test Notification
                    </Typography>
                    <Paper sx={{ p: 3 }}>
                        <Grid container spacing={3}>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    label="Phone Number"
                                    value={testPhone}
                                    onChange={(e) => setTestPhone(e.target.value)}
                                    fullWidth
                                    placeholder="e.g., 7676753620"
                                    helperText="Phone number without country code"
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <FormControl fullWidth>
                                    <InputLabel>Event Type</InputLabel>
                                    <Select
                                        value={testEventType}
                                        onChange={(e) => setTestEventType(e.target.value)}
                                        label="Event Type"
                                    >
                                        {eventTypesList.map((type) => (
                                            <MenuItem key={type} value={type}>
                                                {formatEventLabel(type)}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <Divider sx={{ my: 2 }} />
                                <Typography variant="subtitle2" gutterBottom>
                                    Template Parameters
                                </Typography>
                            </Grid>
                            <Grid size={{ xs: 12, md: 3 }}>
                                <TextField
                                    label="Name"
                                    value={testParams.name}
                                    onChange={(e) =>
                                        setTestParams({ ...testParams, name: e.target.value })
                                    }
                                    fullWidth
                                    placeholder="{{name}}"
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 3 }}>
                                <TextField
                                    label="Phone"
                                    value={testParams.phone}
                                    onChange={(e) =>
                                        setTestParams({ ...testParams, phone: e.target.value })
                                    }
                                    fullWidth
                                    placeholder="{{phone}}"
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 3 }}>
                                <TextField
                                    label="Guide Name"
                                    value={testParams.guide_name}
                                    onChange={(e) =>
                                        setTestParams({ ...testParams, guide_name: e.target.value })
                                    }
                                    fullWidth
                                    placeholder="{{guide_name}}"
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 3 }}>
                                <TextField
                                    label="Message"
                                    value={testParams.message}
                                    onChange={(e) =>
                                        setTestParams({ ...testParams, message: e.target.value })
                                    }
                                    fullWidth
                                    multiline
                                    rows={2}
                                    placeholder="{{message}}"
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 3 }}>
                                <TextField
                                    label="Consultation ID"
                                    value={testParams.consultation_id}
                                    onChange={(e) =>
                                        setTestParams({ ...testParams, consultation_id: e.target.value })
                                    }
                                    fullWidth
                                    placeholder="{{consultation_id}}"
                                />
                            </Grid>
                        </Grid>
                        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                            <Button
                                variant="outlined"
                                onClick={() => {
                                    setTestPhone('');
                                    setTestParams({ name: '', phone: '', guide_name: '', message: '', consultation_id: '' });
                                    setTestResult(null);
                                }}
                            >
                                Clear
                            </Button>
                            <Button
                                variant="contained"
                                startIcon={testing ? <Loader2 className="animate-spin" /> : <Send />}
                                onClick={handleTestNotification}
                                disabled={testing}
                                color="primary"
                            >
                                {testing ? 'Sending...' : 'Send Test'}
                            </Button>
                        </Box>

                        {testResult && (
                            <Alert
                                severity={testResult.success ? 'success' : 'error'}
                                sx={{ mt: 3 }}
                                icon={testResult.success ? <CheckCircle /> : <XCircle />}
                            >
                                {testResult.message}
                            </Alert>
                        )}
                    </Paper>
                </TabPanel>

                {/* API Settings Tab */}
                <TabPanel value={tabValue} index={2}>
                    <Typography variant="h6" gutterBottom>
                        API Configuration
                    </Typography>
                    <Paper sx={{ p: 3, mb: 3 }}>
                        <Grid container spacing={3}>
                            <Grid size={{ xs: 12 }}>
                                <Alert severity="info" sx={{ mb: 2 }}>
                                    These settings are configured at the server level. Contact your
                                    administrator to modify WhatsApp API credentials.
                                </Alert>
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    label="API Base URL"
                                    value={settings.api_base_url || 'Not configured'}
                                    disabled
                                    fullWidth
                                    helperText="WhatsApp Business API Base URL"
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    label="API Email"
                                    value={settings.api_email || 'Not configured'}
                                    disabled
                                    fullWidth
                                    helperText="WhatsApp Business API Email"
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    label="Default Language"
                                    value={settings.default_language || 'en_US'}
                                    disabled
                                    fullWidth
                                    helperText="Default template language"
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={settings.whatsapp_enabled ?? false}
                                                disabled
                                                color="primary"
                                            />
                                        }
                                        label="WhatsApp Enabled"
                                    />
                                </Box>
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    label="Tenant ID"
                                    value={settings.tenant_id || 'Not configured'}
                                    disabled
                                    fullWidth
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    label="Settings ID"
                                    value={settings.id?.toString() || 'Not configured'}
                                    disabled
                                    fullWidth
                                />
                            </Grid>
                        </Grid>
                    </Paper>

                    {/* Event Templates Overview */}
                    {settings.event_templates && Object.keys(settings.event_templates).length > 0 && (
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                Configured Event Templates ({Object.keys(settings.event_templates).length})
                            </Typography>
                            <Grid container spacing={2}>
                                {Object.entries(settings.event_templates).map(([eventType, template]) => (
                                    <Grid size={{ xs: 12, md: 6 }} key={eventType}>
                                        <Box
                                            sx={{
                                                p: 2,
                                                border: '1px solid',
                                                borderColor: selectedEventType === eventType ? 'primary.main' : 'divider',
                                                borderRadius: 1,
                                                cursor: 'pointer',
                                                bgcolor: selectedEventType === eventType ? 'action.hover' : 'background.paper',
                                            }}
                                            onClick={() => {
                                                setTabValue(0);
                                                handleEventTypeChange(eventType);
                                            }}
                                        >
                                            <Typography variant="subtitle1" fontWeight="bold">
                                                {formatEventLabel(eventType)}
                                            </Typography>
                                            <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 1 }}>
                                                {eventType}
                                            </Typography>
                                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                                                <Chip
                                                    size="small"
                                                    label={`ID: ${template.template_id}`}
                                                    color="primary"
                                                    variant="outlined"
                                                />
                                                <Chip
                                                    size="small"
                                                    label={template.language}
                                                    color="secondary"
                                                    variant="outlined"
                                                />
                                                <Chip
                                                    size="small"
                                                    label={template.enabled ? 'Enabled' : 'Disabled'}
                                                    color={template.enabled ? 'success' : 'default'}
                                                />
                                            </Box>
                                            <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                                                Params: {template.params?.join(', ') || 'None'}
                                            </Typography>
                                        </Box>
                                    </Grid>
                                ))}
                            </Grid>
                        </Paper>
                    )}
                </TabPanel>
            </CardContent>
        </Card>
    );
};
