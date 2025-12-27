import {
    Show,
    SimpleShowLayout,
    TextField,
    DateField,
    BooleanField,
    NumberField,
    FunctionField,
    useRedirect,
} from 'react-admin';
import {
    Chip,
    Typography,
    Box,
    Card,
    CardContent,
    Tooltip,
    Divider,
    Avatar,
    Stack,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
    Timeline,
    TimelineItem,
    TimelineSeparator,
    TimelineDot,
    TimelineConnector,
    TimelineContent,
} from '@mui/lab';
import {
    Info as InfoIcon,
    Person as PersonIcon,
    Schedule as ScheduleIcon,
    AttachMoney as MoneyIcon,
    Settings as SettingsIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Styled card with header feel
const StyledCard = styled(Card)(({ theme }) => ({
    marginBottom: theme.spacing(3),
    borderRadius: theme.spacing(2),
    boxShadow: '0 6px 12px rgba(0,0,0,0.08)',
    border: `1px solid ${theme.palette.divider}`,
}));

const SectionHeader = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
    marginBottom: theme.spacing(2),
    paddingBottom: theme.spacing(1),
    borderBottom: `1px solid ${theme.palette.divider}`,
}));

// Enhanced StatusField Component with color mapping
const StatusField = ({ record }: { record?: any }) => {
    if (!record || !record.state) return null;
    const status = record.state;
    const statusStyles: { [key: string]: any } = {
        requested: { bgcolor: 'rgba(245, 124, 0, 0.15)', color: '#f57c00' },
        in_progress: { bgcolor: 'rgba(2, 136, 209, 0.15)', color: '#0288d1' },
        completed: { bgcolor: 'rgba(56, 142, 60, 0.15)', color: '#388e3c' },
        cancelled: { bgcolor: 'rgba(109, 109, 109, 0.15)', color: '#6d6d6d' },
        failed: { bgcolor: 'rgba(211, 47, 47, 0.15)', color: '#d32f2f' },
        customer_join_timeout: { bgcolor: 'rgba(183, 28, 28, 0.15)', color: '#b71c1c' },
        rejected: { bgcolor: 'rgba(123, 31, 162, 0.15)', color: '#7b1fa2' },
        expired: { bgcolor: 'rgba(251, 140, 0, 0.15)', color: '#fb8c00' },
    };
    return (
        <Tooltip title={`Consultation is ${status.replace(/_/g, ' ')}`}>
            <Chip
                label={status.replace(/_/g, ' ').toUpperCase()}
                sx={{
                    ...statusStyles[status],
                    fontWeight: 600,
                    px: 1.5,
                    py: 0.5,
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    letterSpacing: '0.5px',
                }}
                icon={<InfoIcon fontSize="small" />}
            />
        </Tooltip>
    );
};

// Timeline Event with better visuals
const TimelineEvent = ({ label, date }: { label: string; date: string | null }) => {
    if (!date) return null;
    return (
        <TimelineItem>
            <TimelineSeparator>
                <TimelineDot color="primary" />
                <TimelineConnector />
            </TimelineSeparator>
            <TimelineContent>
                <Typography variant="subtitle2" color="text.secondary">
                    {label}
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                    {new Date(date).toLocaleString('en-US', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                    })}
                </Typography>
            </TimelineContent>
        </TimelineItem>
    );
};

// Clickable Customer ID Component
const ClickableCustomerId = ({ customerId }: { customerId: number }) => {
    const redirect = useRedirect();
    return (
        <Typography
            component="span"
            sx={{
                color: 'primary.main',
                cursor: 'pointer',
                textDecoration: 'underline',
                '&:hover': {
                    textDecoration: 'none',
                    color: 'primary.dark',
                },
            }}
            onClick={() => redirect('show', 'customers', customerId)}
        >
            {customerId}
        </Typography>
    );
};

// Clickable Guide ID Component
const ClickableGuideId = ({ guideId }: { guideId: number }) => {
    const redirect = useRedirect();

    return (
        <Typography
            component="span"
            sx={{
                color: 'primary.main',
                cursor: 'pointer',
                textDecoration: 'underline',
                '&:hover': {
                    textDecoration: 'none',
                    color: 'primary.dark',
                },
            }}
            onClick={() => redirect('show', 'guides', guideId)}
        >
            {guideId}
        </Typography>
    );
};

export const ConsultationShow = () => (
    <Show title="Consultation Details">
        <SimpleShowLayout>
            <Box sx={{ maxWidth: 1100, margin: 'auto', padding: 3 }}>
                {/* Consultation Details */}
                <StyledCard>
                    <CardContent>
                        <SectionHeader>
                            <Avatar sx={{ bgcolor: 'primary.main' }}>
                                <InfoIcon fontSize="small" />
                            </Avatar>
                            <Typography variant="h6">Consultation Details</Typography>
                        </SectionHeader>
                        <Box display="flex" flexWrap="wrap" gap={2}>
                            <Box flex="1" minWidth={{ xs: '100%', sm: 'calc(50% - 8px)' }}>
                                <FunctionField
                                    label="Consultation ID"
                                    render={(record: any) => (
                                        <Box>
                                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.5 }}>
                                                Consultation ID
                                            </Typography>
                                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                                {record.id || 'N/A'}
                                            </Typography>
                                        </Box>
                                    )}
                                />
                            </Box>
                            <Box flex="1" minWidth={{ xs: '100%', sm: 'calc(50% - 8px)' }}>
                                <FunctionField
                                    label="Status"
                                    render={(record: any) => (
                                        <Box>
                                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.5 }}>
                                                Status
                                            </Typography>
                                            <StatusField record={record} />
                                        </Box>
                                    )}
                                />
                            </Box>
                            <Box flex="1" minWidth={{ xs: '100%', sm: 'calc(50% - 8px)' }}>
                                <FunctionField
                                    label="Consultation Mode"
                                    render={(record: any) => (
                                        <Box>
                                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.5 }}>
                                                Consultation Mode
                                            </Typography>
                                            <Typography variant="body1" sx={{ fontWeight: 500, textTransform: 'capitalize' }}>
                                                {record.mode || 'N/A'}
                                            </Typography>
                                        </Box>
                                    )}
                                />
                            </Box>
                            <Box flex="1" minWidth={{ xs: '100%', sm: 'calc(50% - 8px)' }}>
                                <FunctionField
                                    label="Category"
                                    render={(record: any) => (
                                        <Box>
                                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.5 }}>
                                                Category
                                            </Typography>
                                            <Typography variant="body1" sx={{ fontWeight: 500, textTransform: 'capitalize' }}>
                                                {record.category || 'N/A'}
                                            </Typography>
                                        </Box>
                                    )}
                                />
                            </Box>
                        </Box>
                    </CardContent>
                </StyledCard>

                {/* User Details */}
                <StyledCard>
                    <CardContent>
                        <SectionHeader>
                            <Avatar sx={{ bgcolor: 'secondary.main' }}>
                                <PersonIcon fontSize="small" />
                            </Avatar>
                            <Typography variant="h6">User Details</Typography>
                        </SectionHeader>

                        {/* Customer Details */}
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'primary.main', mb: 2 }}>
                                🧑‍💼 Customer Information
                            </Typography>
                            <Box display="flex" flexWrap="wrap" gap={2}>
                                <Box flex="1" minWidth={{ xs: '100%', sm: 'calc(50% - 8px)' }}>
                                    <FunctionField
                                        label="Customer Name"
                                        render={(record: any) => (
                                            <Box>
                                                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.5 }}>
                                                    Customer Name
                                                </Typography>
                                                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                                    {record.customer_name || 'N/A'}
                                                </Typography>
                                            </Box>
                                        )}
                                    />
                                </Box>
                                <Box flex="1" minWidth={{ xs: '100%', sm: 'calc(50% - 8px)' }}>
                                    <FunctionField
                                        label="Customer ID"
                                        render={(record: any) => (
                                            <Box>
                                                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.5 }}>
                                                    Customer ID
                                                </Typography>
                                                <ClickableCustomerId customerId={record.customer_id} />
                                            </Box>
                                        )}
                                    />
                                </Box>
                            </Box>
                        </Box>

                        {/* Guide Details */}
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'secondary.main', mb: 2 }}>
                                🧑‍🏫 Guide Information
                            </Typography>
                            <Box display="flex" flexWrap="wrap" gap={2}>
                                <Box flex="1" minWidth={{ xs: '100%', sm: 'calc(50% - 8px)' }}>
                                    <FunctionField
                                        label="Guide Name"
                                        render={(record: any) => (
                                            <Box>
                                                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.5 }}>
                                                    Guide Name
                                                </Typography>
                                                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                                    {record.guide_name || 'N/A'}
                                                </Typography>
                                            </Box>
                                        )}
                                    />
                                </Box>
                                <Box flex="1" minWidth={{ xs: '100%', sm: 'calc(50% - 8px)' }}>
                                    <FunctionField
                                        label="Guide ID"
                                        render={(record: any) => (
                                            <Box>
                                                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.5 }}>
                                                    Guide ID
                                                </Typography>
                                                <ClickableGuideId guideId={record.guide_id} />
                                            </Box>
                                        )}
                                    />
                                </Box>
                            </Box>
                        </Box>

                        {/* Profile Details */}
                        <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'info.main', mb: 2 }}>
                                📋 Profile Information
                            </Typography>
                            <Box display="flex" flexWrap="wrap" gap={2}>
                                <Box flex="1" minWidth={{ xs: '100%', sm: 'calc(50% - 8px)' }}>
                                    <FunctionField
                                        label="Profile ID"
                                        render={(record: any) => (
                                            <Box>
                                                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.5 }}>
                                                    Profile ID
                                                </Typography>
                                                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                                    {record.profile_id || 'N/A'}
                                                </Typography>
                                            </Box>
                                        )}
                                    />
                                </Box>
                            </Box>
                        </Box>
                    </CardContent>
                </StyledCard>

                {/* Timeline */}
                <StyledCard>
                    <CardContent>
                        <SectionHeader>
                            <Avatar sx={{ bgcolor: 'info.main' }}>
                                <ScheduleIcon fontSize="small" />
                            </Avatar>
                            <Typography variant="h6">Timeline</Typography>
                        </SectionHeader>
                        <Timeline position="right">
                            <FunctionField render={(r: any) => <TimelineEvent label="Requested At" date={r.requested_at} />} />
                            <FunctionField render={(r: any) => <TimelineEvent label="Accepted At" date={r.accepted_at} />} />
                            <FunctionField render={(r: any) => <TimelineEvent label="Customer Joined At" date={r.user_joined_at} />} />
                            <FunctionField render={(r: any) => <TimelineEvent label="Completed At" date={r.completed_at} />} />
                            <FunctionField render={(r: any) => <TimelineEvent label="Cancelled At" date={r.cancelled_at} />} />
                            <FunctionField render={(r: any) => <TimelineEvent label="Rejected At" date={r.rejected_at} />} />
                            <FunctionField render={(r: any) => <TimelineEvent label="Expires At" date={r.expires_at} />} />
                        </Timeline>
                    </CardContent>
                </StyledCard>

                {/* Completion Details */}
                <StyledCard>
                    <CardContent>
                        <SectionHeader>
                            <Avatar sx={{ bgcolor: 'info.main' }}>
                                <InfoIcon fontSize="small" />
                            </Avatar>
                            <Typography variant="h6">Completion Details</Typography>
                        </SectionHeader>
                        <Box display="flex" flexWrap="wrap" gap={3}>
                            {/* Base Rate Card */}
                            <Box flex="1" minWidth={{ xs: '100%', md: 'calc(33.333% - 12px)' }}>
                                <Box
                                    sx={{
                                        p: 3,
                                        border: '2px solid #e3f2fd',
                                        borderRadius: 3,
                                        bgcolor: '#f8f9fa',
                                        textAlign: 'center',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                            transform: 'translateY(-2px)'
                                        }
                                    }}
                                >
                                    <FunctionField
                                        render={(record: any) => (
                                            <>
                                                <Typography variant="h4" color="primary.main" sx={{ fontWeight: 'bold', mb: 1 }}>
                                                    {record?.base_rate_per_minute || '0'}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    Base Rate per Minute
                                                </Typography>
                                            </>
                                        )}
                                    />
                                </Box>
                            </Box>

                            {/* Duration Card */}
                            <Box flex="1" minWidth={{ xs: '100%', md: 'calc(33.333% - 12px)' }}>
                                <FunctionField
                                    render={(record: any) => {
                                        let durationText = 'N/A';
                                        let borderColor = '#e8f5e8';
                                        let bgColor = '#f1f8f1';

                                        // Only calculate duration for completed consultations
                                        // Calculate from requested_at to completed_at
                                        if (record.state === 'completed' && record.completed_at && record.requested_at) {
                                            const start = new Date(record.requested_at);
                                            const end = new Date(record.completed_at);
                                            const duration = Math.round((end.getTime() - start.getTime()) / 1000 / 60);
                                            durationText = `${duration} min`;
                                        } else {
                                            // For non-completed states, show N/A with different styling
                                            borderColor = '#e0e0e0';
                                            bgColor = '#f5f5f5';
                                        }

                                        return (
                                            <Box
                                                sx={{
                                                    p: 3,
                                                    border: `2px solid ${borderColor}`,
                                                    borderRadius: 3,
                                                    bgcolor: bgColor,
                                                    textAlign: 'center',
                                                    transition: 'all 0.3s ease',
                                                    '&:hover': {
                                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                                        transform: 'translateY(-2px)'
                                                    }
                                                }}
                                            >
                                                <Typography variant="h4" color={record.state === 'completed' ? 'success.main' : 'text.secondary'} sx={{ fontWeight: 'bold', mb: 1 }}>
                                                    {durationText}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    Duration
                                                </Typography>
                                            </Box>
                                        );
                                    }}
                                />
                            </Box>

                            {/* Total Earnings Card */}
                            <Box flex="1" minWidth={{ xs: '100%', md: 'calc(33.333% - 12px)' }}>
                                <FunctionField
                                    render={(record: any) => {
                                        let totalEarnings = 'N/A';
                                        let borderColor = '#fff3e0';
                                        let bgColor = '#fffbf0';

                                        // Only calculate earnings for completed consultations
                                        // Calculate from requested_at to completed_at
                                        if (record.state === 'completed' && record.completed_at && record.requested_at) {
                                            const start = new Date(record.requested_at);
                                            const end = new Date(record.completed_at);
                                            const duration = Math.round((end.getTime() - start.getTime()) / 1000 / 60);
                                            const earnings = duration * (record.base_rate_per_minute || 0);
                                            totalEarnings = earnings.toFixed(2);
                                        } else {
                                            // For non-completed states, show N/A with different styling
                                            borderColor = '#e0e0e0';
                                            bgColor = '#f5f5f5';
                                        }

                                        return (
                                            <Box
                                                sx={{
                                                    p: 3,
                                                    border: `2px solid ${borderColor}`,
                                                    borderRadius: 3,
                                                    bgcolor: bgColor,
                                                    textAlign: 'center',
                                                    transition: 'all 0.3s ease',
                                                    '&:hover': {
                                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                                        transform: 'translateY(-2px)'
                                                    }
                                                }}
                                            >
                                                <Typography variant="h4" color={record.state === 'completed' ? 'warning.main' : 'text.secondary'} sx={{ fontWeight: 'bold', mb: 1 }}>
                                                    {totalEarnings}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    Total Earnings
                                                </Typography>
                                            </Box>
                                        );
                                    }}
                                />
                            </Box>

                            {/* Additional Details */}
                            {/* <Box flex="1" minWidth={{ xs: '100%', md: 'calc(50% - 8px)' }}>
                                <TextField source="completed_by" label="Completed By" />
                            </Box> */}
                            {/* <Box flex="1" minWidth={{ xs: '100%', md: 'calc(50% - 8px)' }}>
                                <BooleanField source="is_quick_connect_request" label="Quick Connect Request" />
                            </Box> */}
                        </Box>
                    </CardContent>
                </StyledCard>

                {/* Financials
                <StyledCard>
                    <CardContent>
                        <SectionHeader>
                            <Avatar sx={{ bgcolor: 'success.main' }}>
                                <MoneyIcon fontSize="small" />
                            </Avatar>
                            <Typography variant="h6">Financial Information</Typography>
                        </SectionHeader>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, sm: 4 }}>
                                <NumberField
                                    source="order_id"
                                    label="Order ID"
                                    sx={{
                                        '& .RaTextField-label': { fontWeight: 600 },
                                        '& .RaTextField-value': { fontSize: '1.1rem', fontWeight: 'bold' }
                                    }}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 4 }}>
                                <NumberField
                                    source="wallet_user_id"
                                    label="Wallet User ID"
                                    sx={{
                                        '& .RaTextField-label': { fontWeight: 600 },
                                        '& .RaTextField-value': { fontSize: '1.1rem', fontWeight: 'bold' }
                                    }}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 4 }}>
                                <TextField source="category" label="Category" />
                            </Grid>
                        </Grid>
                    </CardContent>
                </StyledCard> */}

                {/* Rejection Details */}
                <StyledCard>
                    <CardContent>
                        <SectionHeader>
                            <Avatar sx={{ bgcolor: 'error.main' }}>
                                <InfoIcon fontSize="small" />
                            </Avatar>
                            <Typography variant="h6">Rejection Details</Typography>
                        </SectionHeader>
                        <Box display="flex" flexWrap="wrap" gap={2}>
                            <Box flex="1" minWidth={{ xs: '100%', sm: 'calc(50% - 8px)' }}>
                                <TextField source="rejected_by" label="Rejected By" />
                            </Box>
                            <Box flex="1" minWidth={{ xs: '100%', sm: 'calc(50% - 8px)' }}>
                                <FunctionField
                                    label="Rejection Reason"
                                    render={(record: any) =>
                                        record.rejection_reason ? (
                                            <Typography variant="body2" color="error.main">
                                                {record.rejection_reason}
                                            </Typography>
                                        ) : (
                                            <Typography variant="body2" color="text.secondary">
                                                No rejection reason provided
                                            </Typography>
                                        )
                                    }
                                />
                            </Box>
                        </Box>
                    </CardContent>
                </StyledCard>

                {/* System Details */}
                {/* <StyledCard>
                    <CardContent>
                        <SectionHeader>
                            <Avatar sx={{ bgcolor: 'warning.main' }}>
                                <SettingsIcon fontSize="small" />
                            </Avatar>
                            <Typography variant="h6">System Details</Typography>
                        </SectionHeader>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, sm: 4 }}>
                                <DateField source="created_at" label="Created At" showTime />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 4 }}>
                                <DateField source="updated_at" label="Updated At" showTime />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 4 }}>
                                <TextField source="id" label="Consultation ID" />
                            </Grid>
                        </Grid>
                    </CardContent>
                </StyledCard> */}

              </Box>
        </SimpleShowLayout>
    </Show>
);

export default ConsultationShow;
