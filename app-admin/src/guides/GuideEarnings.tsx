import React, { useState, useEffect } from 'react';
import {
    Card,
    CardContent,
    Typography,
    Grid,
    TextField,
    Button,
    Box,
    CircularProgress,
    Alert,
    Tab,
    Tabs,
} from '@mui/material';
import { useDataProvider, useNotify } from 'react-admin';
import { useParams } from 'react-router-dom';

interface WalletBalance {
    total_balance: string;
    consultant_id: number;
}

interface EarningsData {
    total_earnings: string;
    consultant_id: number;
    date_range: any;
}

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );
}

const GuideEarnings: React.FC = () => {
    const { id: urlId } = useParams<{ id: string }>();
    const dataProvider = useDataProvider();
    const notify = useNotify();

    const [tabValue, setTabValue] = useState(0);
    const [loading, setLoading] = useState(false);
    const [walletBalance, setWalletBalance] = useState<WalletBalance | null>(null);
    const [earnings, setEarnings] = useState<EarningsData | null>(null);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [guideId, setGuideId] = useState(urlId || '');
    const [currentGuideId, setCurrentGuideId] = useState(urlId || '');

    const fetchWalletBalance = async () => {
        if (!currentGuideId) return;

        setLoading(true);
        setError(null);

        try {
            const result = await dataProvider.custom(
                'getWalletBalance',
                'guides',
                { consultantId: currentGuideId }
            );
            setWalletBalance(result.data);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch wallet balance');
            notify('Failed to fetch wallet balance', { type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const fetchEarnings = async (startDate?: string, endDate?: string) => {
        if (!currentGuideId) return;

        setLoading(true);
        setError(null);

        try {
            const result = await dataProvider.custom(
                'getEarnings',
                'guides',
                {
                    consultantId: currentGuideId,
                    startDate,
                    endDate
                }
            );
            setEarnings(result.data);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch earnings');
            notify('Failed to fetch earnings', { type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleGuideIdSubmit = () => {
        if (guideId.trim()) {
            setCurrentGuideId(guideId.trim());
            setWalletBalance(null);
            setEarnings(null);
            setError(null);
        }
    };

    const handleGuideIdKeyPress = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter') {
            handleGuideIdSubmit();
        }
    };

    const handleThisMonth = () => {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const start = firstDay.toISOString().split('T')[0];
        const end = lastDay.toISOString().split('T')[0];

        setStartDate(start);
        setEndDate(end);
        fetchEarnings(start, end);
    };

    const handleAllTime = () => {
        setStartDate('');
        setEndDate('');
        fetchEarnings();
    };

    const handleCustomDateRange = () => {
        if (startDate && endDate) {
            fetchEarnings(startDate, endDate);
        }
    };

    useEffect(() => {
        if (currentGuideId) {
            fetchWalletBalance();
            fetchEarnings(); // Fetch all-time earnings initially
        }
    }, [currentGuideId]);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    // Guide ID input section
    if (!currentGuideId) {
        return (
            <Box sx={{ width: '100%', p: 3 }}>
                <Typography variant="h4" gutterBottom>
                    Guide Financials
                </Typography>
                <Card sx={{ maxWidth: 500, mx: 'auto' }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Enter Guide ID
                        </Typography>
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                            Please enter the consultant ID to view their earnings and wallet information.
                        </Typography>
                        <TextField
                            fullWidth
                            label="Guide/Consultant ID"
                            value={guideId}
                            onChange={(e) => setGuideId(e.target.value)}
                            onKeyPress={handleGuideIdKeyPress}
                            placeholder="e.g., 12345"
                            margin="normal"
                        />
                        <Button
                            variant="contained"
                            onClick={handleGuideIdSubmit}
                            disabled={!guideId.trim()}
                            fullWidth
                            sx={{ mt: 2 }}
                        >
                            View Guide Financials
                        </Button>
                    </CardContent>
                </Card>
            </Box>
        );
    }

    return (
        <Box sx={{ width: '100%' }}>
            <Typography variant="h4" gutterBottom>
                Guide Financials
            </Typography>

            {/* Guide ID selector */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Current Guide ID: {currentGuideId}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                        <TextField
                            label="Change Guide ID"
                            value={guideId}
                            onChange={(e) => setGuideId(e.target.value)}
                            onKeyPress={handleGuideIdKeyPress}
                            placeholder="Enter new guide ID"
                            size="small"
                            sx={{ minWidth: 200 }}
                        />
                        <Button
                            variant="outlined"
                            onClick={handleGuideIdSubmit}
                            disabled={!guideId.trim()}
                        >
                            Switch Guide
                        </Button>
                    </Box>
                </CardContent>
            </Card>

                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={tabValue} onChange={handleTabChange}>
                        <Tab label="Wallet Balance" />
                        <Tab label="Earnings" />
                    </Tabs>
                </Box>

                <TabPanel value={tabValue} index={0}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Current Wallet Balance
                            </Typography>

                            {loading ? (
                                <Box display="flex" justifyContent="center" p={4}>
                                    <CircularProgress />
                                </Box>
                            ) : error ? (
                                <Alert severity="error">{error}</Alert>
                            ) : walletBalance ? (
                                <Grid container spacing={2}>
                                    <Grid item xs={12} md={6}>
                                        <Typography variant="h3" color="primary">
                                            ${parseFloat(walletBalance.total_balance).toLocaleString()}
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary">
                                            Available balance (Consultant ID: {walletBalance.consultant_id})
                                        </Typography>
                                    </Grid>
                                </Grid>
                            ) : (
                                <Typography>No balance data available</Typography>
                            )}
                        </CardContent>
                    </Card>
                </TabPanel>

                <TabPanel value={tabValue} index={1}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Earnings Overview
                            </Typography>

                            <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                                <TextField
                                    label="Start Date"
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    size="small"
                                    InputLabelProps={{ shrink: true }}
                                />
                                <TextField
                                    label="End Date"
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    size="small"
                                    InputLabelProps={{ shrink: true }}
                                />
                                <Button variant="contained" onClick={handleCustomDateRange} disabled={!startDate || !endDate}>
                                    Apply Range
                                </Button>
                                <Button variant="outlined" onClick={handleThisMonth}>
                                    This Month
                                </Button>
                                <Button variant="outlined" onClick={handleAllTime}>
                                    All Time
                                </Button>
                            </Box>

                            {loading ? (
                                <Box display="flex" justifyContent="center" p={4}>
                                    <CircularProgress />
                                </Box>
                            ) : error ? (
                                <Alert severity="error">{error}</Alert>
                            ) : earnings ? (
                                <Grid container spacing={2}>
                                    <Grid item xs={12} md={6}>
                                        <Typography variant="h3" color="primary">
                                            ${parseFloat(earnings.total_earnings).toLocaleString()}
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary">
                                            Total Earnings (Consultant ID: {earnings.consultant_id})
                                            {startDate && endDate && (
                                                ` (${startDate} to ${endDate})`
                                            )}
                                            {!startDate && !endDate && (
                                                ` (All time)`
                                            )}
                                        </Typography>
                                    </Grid>
                                </Grid>
                            ) : (
                                <Typography>No earnings data available</Typography>
                            )}
                        </CardContent>
                    </Card>
                </TabPanel>
            </Box>
  );
};

export default GuideEarnings;