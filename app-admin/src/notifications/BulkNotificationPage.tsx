import React, { useState } from 'react';
import { Title, useNotify, useDataProvider } from 'react-admin';
import {
    Card,
    CardContent,
    TextField,
    Button,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Typography,
    Box,
    Alert,
    LinearProgress
} from '@mui/material';
import { httpClient } from '../dataProvider';

const API_URL = process.env.REACT_APP_API_URL;

export const BulkNotificationPage = () => {
    const notify = useNotify();
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [targetType, setTargetType] = useState('customer');
    const [deepLink, setDeepLink] = useState('');
    const [userIds, setUserIds] = useState<string[]>([]);
    const [fileName, setFileName] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setFileName(file.name);
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            // Parse CSV: assume simple list or "user_id" header
            const lines = text.split(/\r\n|\n/).map(line => line.trim()).filter(line => line);

            // Remove header if present (heuristic: "user_id" or "id" case insensitive)
            const firstLine = lines[0].toLowerCase();
            let ids = lines;
            if (firstLine.includes('user') || firstLine.includes('id')) {
                ids = lines.slice(1);
            }

            // Simple validation: remove empty strings and clean up
            const cleanIds = ids.map(id => id.replace(/["',]/g, '').trim()).filter(id => id);
            setUserIds(cleanIds);
            notify(`Loaded ${cleanIds.length} user IDs`, { type: 'info' });
        };
        reader.readAsText(file);
    };

    const handleSend = async () => {
        if (!title.trim() || !body.trim() || userIds.length === 0) {
            notify('Please fill all fields and upload a valid CSV', { type: 'warning' });
            return;
        }

        setLoading(true);
        setResult(null);

        // Get current admin user ID
        const userString = localStorage.getItem('user');
        const user = userString ? JSON.parse(userString) : null;
        const adminId = user ? (user.id || user.ID || 'admin') : 'admin';

        try {
            const payload: any = {
                user_ids: userIds,
                title: title.trim(),
                body: body.trim(),
                target_type: targetType,
                priority: "transactional",
                created_by: adminId
            };

            // Only add deep_link if properly set
            if (deepLink && deepLink.trim()) {
                payload.deep_link = deepLink.trim();
            }

            // Using httpClient which handles auth headers automatically
            const { json } = await httpClient(`${API_URL}/api/v1/notifications/bulk`, {
                method: 'POST',
                body: JSON.stringify(payload),
            });

            setResult(json);
            notify('Bulk notification process completed', { type: 'success' });
        } catch (error: any) {
            console.error('Error sending notifications:', error);

            // Try to extract validation error message
            let errorMessage = error.message || 'Failed to send notifications';

            if (error.body && error.body.detail) {
                // If detail is array (standard FastAPI validation error)
                if (Array.isArray(error.body.detail)) {
                    errorMessage = error.body.detail
                        .map((err: any) => `${err.loc.join('.')}: ${err.msg}`)
                        .join(', ');
                } else if (typeof error.body.detail === 'string') {
                    errorMessage = error.body.detail;
                }
            }

            notify(`Error: ${errorMessage}`, { type: 'error', multiLine: true });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <Title title="Send Bulk Notifications" />
            <CardContent>
                <Box sx={{ maxWidth: 600, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Typography variant="h5" component="h2" gutterBottom>
                        Create Bulk Notification
                    </Typography>

                    <FormControl fullWidth>
                        <InputLabel>Target Type</InputLabel>
                        <Select
                            value={targetType}
                            label="Target Type"
                            onChange={(e) => setTargetType(e.target.value)}
                        >
                            <MenuItem value="customer">Customer</MenuItem>
                            <MenuItem value="guide">Guide</MenuItem>
                        </Select>
                    </FormControl>

                    <TextField
                        label="Notification Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        fullWidth
                        required
                    />

                    <TextField
                        label="Notification Body"
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        multiline
                        rows={4}
                        fullWidth
                        required
                    />

                    <TextField
                        label="Deep Link (Optional)"
                        value={deepLink}
                        onChange={(e) => setDeepLink(e.target.value)}
                        fullWidth
                        helperText="e.g., myapp://home"
                    />

                    <Box sx={{ border: '1px dashed grey', p: 2, borderRadius: 1, textAlign: 'center' }}>
                        <Button
                            variant="contained"
                            component="label"
                        >
                            Upload CSV File
                            <input
                                type="file"
                                hidden
                                accept=".csv,.txt"
                                onChange={handleFileChange}
                            />
                        </Button>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                            {fileName ? `Selected: ${fileName} (${userIds.length} IDs)` : 'Upload a CSV file containing User IDs'}
                        </Typography>
                    </Box>

                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSend}
                        disabled={loading || userIds.length === 0}
                        size="large"
                    >
                        {loading ? 'Sending...' : 'Send Notifications'}
                    </Button>

                    {loading && <LinearProgress />}

                    {result && (
                        <Alert severity="success" sx={{ mt: 2 }}>
                            <Typography variant="subtitle1">Process Completed!</Typography>
                            <Typography variant="body2">Total Requested: {result.total_requested}</Typography>
                            <Typography variant="body2">Successful: {result.successful_sends}</Typography>
                            <Typography variant="body2">Failed: {result.failed_sends}</Typography>
                        </Alert>
                    )}
                </Box>
            </CardContent>
        </Card>
    );
};
