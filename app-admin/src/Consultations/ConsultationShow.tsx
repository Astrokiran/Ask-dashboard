import {
    Show,
    SimpleShowLayout,
    TextField,
    DateField,
    BooleanField,
    NumberField,
    FunctionField,
} from 'react-admin';
import {
    Chip,
    Typography,
    Box,
    Card,
    CardContent,
    Grid,
    Tooltip,
    Divider,
    Avatar,
    Stack,
} from '@mui/material';
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
    };
    return (
        <Tooltip title={`Consultation is ${status}`}>
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
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField source="id" label="Consultation ID" />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FunctionField
                                    label="Status"
                                    render={(record: any) => <StatusField record={record} />}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField source="mode" label="Consultation Mode" />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField source="category" label="Category" />
                            </Grid>
                        </Grid>
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
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField source="customer_name" label="Customer Name" />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <NumberField source="customer_id" label="Customer ID" />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField source="guide_name" label="Guide Name" />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <NumberField source="guide_id" label="Guide ID" />
                            </Grid>
                        </Grid>
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
                            <FunctionField render={(r: any) => <TimelineEvent label="Expires At" date={r.expires_at} />} />
                        </Timeline>
                    </CardContent>
                </StyledCard>

                {/* Financials */}
                <StyledCard>
                    <CardContent>
                        <SectionHeader>
                            <Avatar sx={{ bgcolor: 'success.main' }}>
                                <MoneyIcon fontSize="small" />
                            </Avatar>
                            <Typography variant="h6">Financials</Typography>
                        </SectionHeader>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={4}>
                                <NumberField
                                    source="base_rate_per_minute"
                                    label="Base Rate/Min"
                                    options={{ style: 'currency', currency: 'USD' }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <NumberField source="order_id" label="Order ID" />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <NumberField source="wallet_user_id" label="Wallet User ID" />
                            </Grid>
                        </Grid>
                    </CardContent>
                </StyledCard>

                {/* Other Details */}
                <StyledCard>
                    <CardContent>
                        <SectionHeader>
                            <Avatar sx={{ bgcolor: 'warning.main' }}>
                                <SettingsIcon fontSize="small" />
                            </Avatar>
                            <Typography variant="h6">Other Details</Typography>
                        </SectionHeader>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <BooleanField source="is_quick_connect_request" label="Quick Connect Request" />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FunctionField
                                    label="Rejection Reason"
                                    render={(record: any) =>
                                        record.rejection_reason ? (
                                            <TextField source="rejection_reason" />
                                        ) : (
                                            <Typography variant="body2" color="text.secondary">
                                                No rejection reason provided
                                            </Typography>
                                        )
                                    }
                                />
                            </Grid>
                        </Grid>
                    </CardContent>
                </StyledCard>
            </Box>
        </SimpleShowLayout>
    </Show>
);

export default ConsultationShow;
