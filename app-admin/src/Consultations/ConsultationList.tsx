// /consultations/ConsultationList.tsx
import React from 'react';
import {
    Box,
    Button,
    Card,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Avatar,
    Chip,
    Stack,
    SvgIcon,
} from '@mui/material';
import { PlusCircle, Video, MessageSquare, Phone } from 'lucide-react';

// --- Types for our dummy data ---
type ConsultationStatus = 'Completed' | 'In-Progress' | 'Failed' | 'Scheduled';
type ConsultationMode = 'Video' | 'Chat' | 'Call';

interface Consultation {
    id: string;
    guide: {
        name: string;
        avatarUrl: string;
    };
    customer: {
        name: string;
        avatarUrl: string;
    };
    mode: ConsultationMode;
    duration: number; // in seconds
    status: ConsultationStatus;
}

// --- Dummy Data ---
const consultations: Consultation[] = [
    { id: 'CON-001', guide: { name: 'Dr. Aris', avatarUrl: '/avatars/guide1.png' }, customer: { name: 'John Doe', avatarUrl: '/avatars/customer1.png' }, mode: 'Video', duration: 3600, status: 'Completed' },
    { id: 'CON-002', guide: { name: 'Isabelle', avatarUrl: '/avatars/guide2.png' }, customer: { name: 'Jane Smith', avatarUrl: '/avatars/customer2.png' }, mode: 'Chat', duration: 1250, status: 'In-Progress' },
    { id: 'CON-003', guide: { name: 'Master Zed', avatarUrl: '/avatars/guide3.png' }, customer: { name: 'Peter Jones', avatarUrl: '/avatars/customer3.png' }, mode: 'Call', duration: 500, status: 'Failed' },
    { id: 'CON-004', guide: { name: 'Dr. Aris', avatarUrl: '/avatars/guide1.png' }, customer: { name: 'Mary Jane', avatarUrl: '/avatars/customer4.png' }, mode: 'Video', duration: 1800, status: 'Completed' },
    { id: 'CON-005', guide: { name: 'Oracle Kai', avatarUrl: '/avatars/guide4.png' }, customer: { name: 'Chris Lee', avatarUrl: '/avatars/customer5.png' }, mode: 'Chat', duration: 0, status: 'Scheduled' },
];

// --- Helper Components for Styling ---

// A styled Chip for the status
const StatusChip = ({ status }: { status: ConsultationStatus }) => {
    const statusStyles = {
        Completed: { bgcolor: 'rgba(56, 142, 60, 0.1)', color: '#388e3c' },
        'In-Progress': { bgcolor: 'rgba(2, 136, 209, 0.1)', color: '#0288d1' },
        Failed: { bgcolor: 'rgba(211, 47, 47, 0.1)', color: '#d32f2f' },
        Scheduled: { bgcolor: 'rgba(245, 124, 0, 0.1)', color: '#f57c00' },
    };
    return <Chip label={status} sx={{ ...statusStyles[status], fontWeight: 500 }} />;
};

// A component to display user info with an avatar
const UserCell = ({ name, avatarUrl }: { name: string; avatarUrl: string }) => (
    <Stack direction="row" alignItems="center" spacing={1.5}>
        <Avatar src={avatarUrl} sx={{ width: 32, height: 32 }} />
        <Typography variant="body2" fontWeight={500}>{name}</Typography>
    </Stack>
);

// --- Main Component ---
export const ConsultationList = () => {
    const ModeIcon = ({ mode }: { mode: ConsultationMode }) => {
        const icons = {
            Video: Video,
            Chat: MessageSquare,
            Call: Phone,
        };
        const Icon = icons[mode];
        return (
            <Stack direction="row" alignItems="center" spacing={1} color="text.secondary">
                 <SvgIcon component={Icon} sx={{width: 16, height: 16}} />
                 <Typography variant="body2">{mode}</Typography>
            </Stack>
        );
    };
    
    return (
        <Box sx={{ p: 3, backgroundColor: '#f9fafb', minHeight: '100vh' }}>
            {/* Header */}
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" fontWeight={700}>
                    Consultations
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<PlusCircle size={20} />}
                    sx={{ textTransform: 'none', fontWeight: 600, py: 1.5, px: 3 }}
                >
                    Create Consultation
                </Button>
            </Stack>

            {/* Table Card */}
            <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <TableContainer>
                    <Table>
                        <TableHead sx={{ '& .MuiTableCell-head': {
                            bgcolor: 'grey.50',
                            color: 'text.secondary',
                            fontWeight: 600,
                            borderBottom: '1px solid #e0e0e0',
                        } }}>
                            <TableRow>
                                <TableCell>CONSULTATION ID</TableCell>
                                <TableCell>GUIDE</TableCell>
                                <TableCell>CUSTOMER</TableCell>
                                <TableCell>MODE</TableCell>
                                <TableCell>TIME SPENT</TableCell>
                                <TableCell>STATUS</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody sx={{ '& .MuiTableRow-root:hover': { bgcolor: 'grey.100' } }}>
                            {consultations.map((row) => (
                                <TableRow key={row.id} sx={{ '& .MuiTableCell-root': { border: 0, py: 2 } }}>
                                    <TableCell>
                                        <Typography variant="body2" color="text.secondary">{row.id}</Typography>
                                    </TableCell>
                                    <TableCell><UserCell name={row.guide.name} avatarUrl={row.guide.avatarUrl} /></TableCell>
                                    <TableCell><UserCell name={row.customer.name} avatarUrl={row.customer.avatarUrl} /></TableCell>
                                    <TableCell><ModeIcon mode={row.mode} /></TableCell>
                                    <TableCell>
                                        <Typography variant="body2">{`${Math.floor(row.duration / 60)} min ${row.duration % 60} sec`}</Typography>
                                    </TableCell>
                                    <TableCell><StatusChip status={row.status} /></TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Card>
        </Box>
    );
};

export default ConsultationList;