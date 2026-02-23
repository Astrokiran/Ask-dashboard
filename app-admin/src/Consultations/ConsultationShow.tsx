import {
    Show,
    SimpleShowLayout,
    TextField,
    DateField,
    BooleanField,
    NumberField,
    FunctionField,
    useRedirect,
    useRecordContext,
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
    Button,
    List as MuiList,
    ListItem,
    ListItemText,
    Paper,
    IconButton,
    Collapse,
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
    Videocam as VideocamIcon,
    Mic as MicIcon,
    Chat as ChatIcon,
    PlayArrow as PlayArrowIcon,
    Download as DownloadIcon,
    ExpandMore as ExpandMoreIcon,
    ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useState } from 'react';

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
        guide_rejected: { bgcolor: 'rgba(123, 31, 162, 0.15)', color: '#7b1fa2' },
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

// Recordings Component for Voice/Video consultations
const ConsultationRecordings = () => {
    const record = useRecordContext();
    const [expanded, setExpanded] = useState(true);

    if (!record) return null;

    const recordings = record.recordings?.recording_urls;

    // Only show recordings section if mode is voice or video and recordings exist
    if (record.mode !== 'voice' && record.mode !== 'video') return null;
    if (!recordings || recordings.length === 0) {
        return (
            <StyledCard>
                <CardContent>
                    <SectionHeader>
                        <Avatar sx={{ bgcolor: record.mode === 'voice' ? 'secondary.main' : 'primary.main' }}>
                            {record.mode === 'voice' ? <MicIcon fontSize="small" /> : <VideocamIcon fontSize="small" />}
                        </Avatar>
                        <Typography variant="h6">
                            {record.mode === 'voice' ? 'Voice Recording' : 'Video Recording'}
                        </Typography>
                    </SectionHeader>
                    <Box sx={{ p: 3, textAlign: 'center', bgcolor: 'background.paper', borderRadius: 2 }}>
                        <Typography variant="body1" color="text.secondary">
                            No recordings available for this consultation
                        </Typography>
                    </Box>
                </CardContent>
            </StyledCard>
        );
    }

    return (
        <StyledCard>
            <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                    <SectionHeader sx={{ mb: 0, pb: 0, borderBottom: 'none' }}>
                        <Avatar sx={{ bgcolor: record.mode === 'voice' ? 'secondary.main' : 'primary.main' }}>
                            {record.mode === 'voice' ? <MicIcon fontSize="small" /> : <VideocamIcon fontSize="small" />}
                        </Avatar>
                        <Typography variant="h6">
                            {record.mode === 'voice' ? 'Voice Recordings' : 'Video Recordings'}
                        </Typography>
                    </SectionHeader>
                    <IconButton onClick={() => setExpanded(!expanded)}>
                        {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                </Box>

                <Collapse in={expanded}>
                    <Box sx={{ mt: 3 }}>
                        {record.cloud_recording_session_id && (
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" color="text.secondary">
                                    Session ID: {record.cloud_recording_session_id}
                                </Typography>
                            </Box>
                        )}

                        {recordings.map((recording: any, index: number) => (
                            <Box
                                key={index}
                                sx={{
                                    mb: 2,
                                    p: 2,
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    borderRadius: 2,
                                    bgcolor: 'background.paper',
                                    '&:hover': {
                                        boxShadow: 2,
                                    }
                                }}
                            >
                                <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                        Recording {index + 1}
                                    </Typography>
                                    <Chip
                                        label={recording.recording_type || record.mode}
                                        size="small"
                                        sx={{ bgcolor: record.mode === 'voice' ? 'secondary.light' : 'primary.light', color: 'white' }}
                                    />
                                </Box>

                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: '0.8rem' }}>
                                    {recording.file_name || `Recording ${index + 1}`}
                                </Typography>

                                {recording.expires_at && (
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                                        Expires: {new Date(recording.expires_at).toLocaleString()}
                                    </Typography>
                                )}

                                <Box display="flex" gap={1}>
                                    <Button
                                        variant="contained"
                                        size="small"
                                        startIcon={<PlayArrowIcon />}
                                        href={recording.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        Play
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        startIcon={<DownloadIcon />}
                                        href={recording.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        download
                                    >
                                        Download
                                    </Button>
                                </Box>
                            </Box>
                        ))}

                        {record.cloud_recording_started_at && (
                            <Box sx={{ mt: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                                <Typography variant="caption" color="text.secondary">
                                    Recording started: {new Date(record.cloud_recording_started_at).toLocaleString()}
                                </Typography>
                                <br />
                                <Typography variant="caption" color="text.secondary">
                                    Recording stopped: {new Date(record.cloud_recording_stopped_at).toLocaleString()}
                                </Typography>
                            </Box>
                        )}
                    </Box>
                </Collapse>
            </CardContent>
        </StyledCard>
    );
};

// Chat Messages Component for Chat consultations
const ConsultationChatMessages = () => {
    const record = useRecordContext();
    const [expanded, setExpanded] = useState(true);

    if (!record) return null;

    const messages = record.chat_messages || [];

    // Only show chat section if mode is chat
    if (record.mode !== 'chat') return null;

    if (messages.length === 0) {
        return (
            <StyledCard>
                <CardContent>
                    <SectionHeader>
                        <Avatar sx={{ bgcolor: 'info.main' }}>
                            <ChatIcon fontSize="small" />
                        </Avatar>
                        <Typography variant="h6">Chat Messages</Typography>
                    </SectionHeader>
                    <Box sx={{ p: 3, textAlign: 'center', bgcolor: 'background.paper', borderRadius: 2 }}>
                        <Typography variant="body1" color="text.secondary">
                            No messages available for this consultation
                        </Typography>
                    </Box>
                </CardContent>
            </StyledCard>
        );
    }

    return (
        <StyledCard>
            <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                    <SectionHeader sx={{ mb: 0, pb: 0, borderBottom: 'none' }}>
                        <Avatar sx={{ bgcolor: 'info.main' }}>
                            <ChatIcon fontSize="small" />
                        </Avatar>
                        <Typography variant="h6">Chat Messages ({record.total_chat_messages || messages.length})</Typography>
                    </SectionHeader>
                    <IconButton onClick={() => setExpanded(!expanded)}>
                        {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                </Box>

                <Collapse in={expanded}>
                    <Box sx={{ mt: 3 }}>
                        <MuiList sx={{ bgcolor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                            {messages.map((message: any, index: number) => (
                                <ListItem
                                    key={message.message_id || index}
                                    sx={{
                                        borderBottom: index < messages.length - 1 ? '1px solid' : 'none',
                                        borderBottomColor: 'divider',
                                        bgcolor: message.sender_type === 'customer' ? 'action.hover' : 'background.paper',
                                        '&:hover': {
                                            bgcolor: 'action.selected',
                                        },
                                        py: 2,
                                    }}
                                >
                                    <ListItemText
                                        primary={
                                            <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                                                <Box display="flex" alignItems="center" gap={1}>
                                                    <Chip
                                                        label={message.sender_type === 'customer' ? record.customer_name : record.guide_name}
                                                        size="small"
                                                        color={message.sender_type === 'customer' ? 'primary' : 'secondary'}
                                                        sx={{ fontWeight: 600 }}
                                                    />
                                                    {message.type !== 'text' && (
                                                        <Chip
                                                            label={message.type}
                                                            size="small"
                                                            variant="outlined"
                                                            sx={{ fontSize: '0.7rem' }}
                                                        />
                                                    )}
                                                </Box>
                                                <Typography variant="caption" color="text.secondary">
                                                    {new Date(message.timestamp).toLocaleString()}
                                                </Typography>
                                            </Box>
                                        }
                                        secondary={
                                            <Box>
                                                {message.type === 'image' ? (
                                                    <Box>
                                                        <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                                                            Image: {message.content}
                                                        </Typography>
                                                    </Box>
                                                ) : (
                                                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                                                        {message.content}
                                                    </Typography>
                                                )}
                                                {message.status && (
                                                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                                                        Status: {message.status}
                                                    </Typography>
                                                )}
                                            </Box>
                                        }
                                    />
                                </ListItem>
                            ))}
                        </MuiList>
                    </Box>
                </Collapse>
            </CardContent>
        </StyledCard>
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
                                                {record.consultation_id || record.id || 'N/A'}
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
                                            <Box display="flex" alignItems="center" gap={1}>
                                                {record.mode === 'voice' && <MicIcon fontSize="small" color="secondary" />}
                                                {record.mode === 'video' && <VideocamIcon fontSize="small" color="primary" />}
                                                {record.mode === 'chat' && <ChatIcon fontSize="small" color="info" />}
                                                <Typography variant="body1" sx={{ fontWeight: 500, textTransform: 'capitalize' }}>
                                                    {record.mode || 'N/A'}
                                                </Typography>
                                            </Box>
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

                        {/* Additional consultation details */}
                        <Box display="flex" flexWrap="wrap" gap={2} mt={2}>
                            <Box flex="1" minWidth={{ xs: '100%', sm: 'calc(50% - 8px)' }}>
                                <FunctionField
                                    label="Source"
                                    render={(record: any) => (
                                        <Box>
                                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.5 }}>
                                                Source
                                            </Typography>
                                            <Typography variant="body1" sx={{ fontWeight: 500, textTransform: 'capitalize' }}>
                                                {record.source || 'N/A'}
                                            </Typography>
                                        </Box>
                                    )}
                                />
                            </Box>
                            <Box flex="1" minWidth={{ xs: '100%', sm: 'calc(50% - 8px)' }}>
                                <FunctionField
                                    label="Order ID"
                                    render={(record: any) => (
                                        <Box>
                                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.5 }}>
                                                Order ID
                                            </Typography>
                                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                                {record.order_id || 'N/A'}
                                            </Typography>
                                        </Box>
                                    )}
                                />
                            </Box>
                            <Box flex="1" minWidth={{ xs: '100%', sm: 'calc(50% - 8px)' }}>
                                <FunctionField
                                    label="Quick Connect"
                                    render={(record: any) => (
                                        <Box>
                                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.5 }}>
                                                Quick Connect Request
                                            </Typography>
                                            <Chip
                                                label={record.is_quick_connect_request ? 'Yes' : 'No'}
                                                size="small"
                                                color={record.is_quick_connect_request ? 'primary' : 'default'}
                                            />
                                        </Box>
                                    )}
                                />
                            </Box>
                            <Box flex="1" minWidth={{ xs: '100%', sm: 'calc(50% - 8px)' }}>
                                <FunctionField
                                    label="Max Duration"
                                    render={(record: any) => (
                                        <Box>
                                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.5 }}>
                                                Max Call Duration
                                            </Typography>
                                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                                {record.max_call_duration_minutes ? `${record.max_call_duration_minutes} min` : 'N/A'}
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
                                        border: '2px solid',
                                        borderColor: 'primary.light',
                                        borderRadius: 3,
                                        bgcolor: 'background.paper',
                                        textAlign: 'center',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            boxShadow: 4,
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
                                        let borderColor = 'success.light';
                                        let bgColor = 'success.main';

                                        // Use call_duration_seconds from API if available
                                        if (record.call_duration_seconds !== undefined && record.call_duration_seconds !== null) {
                                            const durationMinutes = Math.round(record.call_duration_seconds / 60);
                                            const durationSeconds = record.call_duration_seconds % 60;
                                            durationText = durationMinutes > 0
                                                ? `${durationMinutes}m ${durationSeconds}s`
                                                : `${durationSeconds}s`;
                                        } else if (record.state === 'completed' && record.completed_at && record.requested_at) {
                                            // Fallback: calculate from requested_at to completed_at
                                            const start = new Date(record.requested_at);
                                            const end = new Date(record.completed_at);
                                            const duration = Math.round((end.getTime() - start.getTime()) / 1000 / 60);
                                            durationText = `${duration} min`;
                                        } else {
                                            // For non-completed states, show N/A with different styling
                                            borderColor = 'divider';
                                            bgColor = 'background.paper';
                                        }

                                        return (
                                            <Box
                                                sx={{
                                                    p: 3,
                                                    border: '2px solid',
                                                    borderColor: borderColor,
                                                    borderRadius: 3,
                                                    bgcolor: bgColor === 'success.main' ? 'background.paper' : bgColor,
                                                    opacity: (record.state === 'completed' || record.call_duration_seconds > 0) ? 1 : 0.7,
                                                    textAlign: 'center',
                                                    transition: 'all 0.3s ease',
                                                    '&:hover': {
                                                        boxShadow: 4,
                                                        transform: 'translateY(-2px)'
                                                    }
                                                }}
                                            >
                                                <Typography variant="h4" color={(record.state === 'completed' || record.call_duration_seconds > 0) ? 'success.main' : 'text.secondary'} sx={{ fontWeight: 'bold', mb: 1 }}>
                                                    {durationText}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    Call Duration
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
                                        let borderColor = 'warning.light';
                                        let bgColor = 'warning.main';

                                        // Calculate earnings based on actual call duration
                                        if (record.call_duration_seconds !== undefined && record.call_duration_seconds !== null && record.call_duration_seconds > 0) {
                                            const durationMinutes = Math.ceil(record.call_duration_seconds / 60); // Round up for billing
                                            const earnings = durationMinutes * (record.base_rate_per_minute || 0);
                                            totalEarnings = earnings.toFixed(2);
                                        } else if (record.state === 'completed' && record.completed_at && record.requested_at) {
                                            // Fallback: calculate from requested_at to completed_at
                                            const start = new Date(record.requested_at);
                                            const end = new Date(record.completed_at);
                                            const duration = Math.ceil((end.getTime() - start.getTime()) / 1000 / 60);
                                            const earnings = duration * (record.base_rate_per_minute || 0);
                                            totalEarnings = earnings.toFixed(2);
                                        } else {
                                            // For non-completed states, show N/A with different styling
                                            borderColor = 'divider';
                                            bgColor = 'background.paper';
                                        }

                                        return (
                                            <Box
                                                sx={{
                                                    p: 3,
                                                    border: '2px solid',
                                                    borderColor: borderColor,
                                                    borderRadius: 3,
                                                    bgcolor: bgColor === 'warning.main' ? 'background.paper' : bgColor,
                                                    opacity: (record.state === 'completed' || record.call_duration_seconds > 0) ? 1 : 0.7,
                                                    textAlign: 'center',
                                                    transition: 'all 0.3s ease',
                                                    '&:hover': {
                                                        boxShadow: 4,
                                                        transform: 'translateY(-2px)'
                                                    }
                                                }}
                                            >
                                                <Typography variant="h4" color={(record.state === 'completed' || record.call_duration_seconds > 0) ? 'warning.main' : 'text.secondary'} sx={{ fontWeight: 'bold', mb: 1 }}>
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

                {/* Refund Information */}
                <StyledCard>
                    <CardContent>
                        <SectionHeader>
                            <Avatar sx={{ bgcolor: 'warning.main' }}>
                                <MoneyIcon fontSize="small" />
                            </Avatar>
                            <Typography variant="h6">Refund Information</Typography>
                        </SectionHeader>
                        <Box display="flex" flexWrap="wrap" gap={2}>
                            <Box flex="1" minWidth={{ xs: '100%', sm: 'calc(50% - 8px)' }}>
                                <FunctionField
                                    label="Is Refundable"
                                    render={(record: any) => (
                                        <Box>
                                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.5 }}>
                                                Is Refundable
                                            </Typography>
                                            <Chip
                                                label={record.is_refundable ? 'Yes' : 'No'}
                                                size="small"
                                                color={record.is_refundable ? 'success' : 'default'}
                                                sx={{ fontWeight: 600 }}
                                            />
                                        </Box>
                                    )}
                                />
                            </Box>
                            <Box flex="1" minWidth={{ xs: '100%', sm: 'calc(50% - 8px)' }}>
                                <FunctionField
                                    label="Is Refunded"
                                    render={(record: any) => (
                                        <Box>
                                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.5 }}>
                                                Is Refunded
                                            </Typography>
                                            <Chip
                                                label={record.is_refunded ? 'Yes' : 'No'}
                                                size="small"
                                                color={record.is_refunded ? 'success' : 'default'}
                                                sx={{ fontWeight: 600 }}
                                            />
                                        </Box>
                                    )}
                                />
                            </Box>
                        </Box>
                    </CardContent>
                </StyledCard>

                {/* Recordings/Chat Section - Dynamic based on mode */}
                <ConsultationRecordings />
                <ConsultationChatMessages />

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
