// /consultations/ConsultationCreate.tsx
import React, { useState } from 'react';
import {
    Box,
    Button,
    Card,
    Typography,
    Grid,
    Avatar,
    Stack,
    TextField,
    MenuItem,
    Divider,
    IconButton,
} from '@mui/material';
import { ArrowLeft, User, Search, CheckCircle } from 'lucide-react';

// --- Types and Dummy Data ---
interface SelectableUser {
    id: string;
    name: string;
    avatarUrl: string;
    description: string; // e.g., Customer ID or Guide Skills
}

const customers: SelectableUser[] = [
    { id: 'CUST-101', name: 'John Doe', avatarUrl: '/avatars/customer1.png', description: 'ID: CUST-101' },
    { id: 'CUST-102', name: 'Jane Smith', avatarUrl: '/avatars/customer2.png', description: 'ID: CUST-102' },
];

const guides: SelectableUser[] = [
    { id: 'GUIDE-A', name: 'Dr. Aris', avatarUrl: '/avatars/guide1.png', description: 'Skills: Astrology, Tarot' },
    { id: 'GUIDE-B', name: 'Isabelle', avatarUrl: '/avatars/guide2.png', description: 'Skills: Palmistry' },
];


// --- Helper Components for the Form ---

// A reusable component for selecting a user (customer or guide)
const UserSelector = ({ title, users, selectedUser, onSelectUser }: {
    title: string;
    users: SelectableUser[];
    selectedUser: SelectableUser | null;
    onSelectUser: (user: SelectableUser) => void;
}) => (
    <Card variant="outlined" sx={{ p: 2, height: '100%' }}>
        <Typography variant="h6" fontWeight={600} mb={2}>{title}</Typography>
        <TextField fullWidth placeholder="Search..." InputProps={{ startAdornment: <Search size={20} style={{marginRight: 8}} color="gray" /> }} />
        <Stack spacing={2} mt={2}>
            {users.map(user => (
                <Card 
                    key={user.id} 
                    variant="outlined"
                    onClick={() => onSelectUser(user)}
                    sx={{ 
                        p: 1.5, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        borderColor: selectedUser?.id === user.id ? 'primary.main' : 'rgba(0, 0, 0, 0.12)',
                        boxShadow: selectedUser?.id === user.id ? '0 0 0 2px rgba(25, 118, 210, 0.5)' : 'none',
                    }}
                >
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar src={user.avatarUrl} />
                        <Box>
                            <Typography variant="subtitle1" fontWeight={600}>{user.name}</Typography>
                            <Typography variant="body2" color="text.secondary">{user.description}</Typography>
                        </Box>
                    </Stack>
                    {selectedUser?.id === user.id && <CheckCircle color="primary" />}
                </Card>
            ))}
        </Stack>
    </Card>
);

// --- Main Component ---
export const ConsultationCreate = () => {
    const [selectedCustomer, setSelectedCustomer] = useState<SelectableUser | null>(null);
    const [selectedGuide, setSelectedGuide] = useState<SelectableUser | null>(null);

    return (
        <Box sx={{ p: 3, backgroundColor: '#f9fafb', minHeight: '100vh' }}>
            {/* Header */}
            <Stack direction="row" alignItems="center" spacing={2} mb={3}>
                <IconButton>
                    <ArrowLeft />
                </IconButton>
                <Typography variant="h4" fontWeight={700}>
                    Create New Consultation
                </Typography>
            </Stack>

            {/* Main Content Grid */}
            <Grid container spacing={3}>
                {/* Left Column: User Selection */}
                <Grid item xs={12} md={5}>
                    <Stack spacing={3}>
                       <UserSelector title="1. Select Customer" users={customers} selectedUser={selectedCustomer} onSelectUser={setSelectedCustomer} />
                       <UserSelector title="2. Select Guide" users={guides} selectedUser={selectedGuide} onSelectUser={setSelectedGuide} />
                    </Stack>
                </Grid>

                {/* Right Column: Consultation Details */}
                <Grid item xs={12} md={7}>
                    <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', p: 4, height: '100%' }}>
                        <Typography variant="h5" fontWeight={600} mb={3}>
                           3. Consultation Details
                        </Typography>
                        <Divider sx={{mb: 3}} />
                        <Grid container spacing={3}>
                             <Grid item xs={12} sm={6}>
                                <TextField select label="Consultation Mode" defaultValue="" fullWidth>
                                    <MenuItem value="Call">Call</MenuItem>
                                    <MenuItem value="Chat">Chat</MenuItem>
                                    <MenuItem value="Video">Video</MenuItem>
                                </TextField>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField select label="Consultation Type" defaultValue="" fullWidth>
                                    <MenuItem value="Astrology">Astrology</MenuItem>
                                    <MenuItem value="Palmistry">Palmistry</MenuItem>
                                    <MenuItem value="Numerology">Numerology</MenuItem>
                                    <MenuItem value="Tarot Reading">Tarot Reading</MenuItem>
                                </TextField>
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label="Notes for Admin (Optional)"
                                    multiline
                                    rows={4}
                                    fullWidth
                                    placeholder="e.g., Customer requested a follow-up session."
                                />
                            </Grid>
                        </Grid>
                        
                        <Stack direction="row" spacing={2} mt={4} justifyContent="flex-end">
                            <Button variant="outlined" color="secondary" sx={{textTransform: 'none', fontWeight: 600}}>Cancel</Button>
                            <Button variant="contained" sx={{textTransform: 'none', fontWeight: 600}}>Create Consultation</Button>
                        </Stack>
                    </Card>
                </Grid>
            </Grid>
            
        </Box>      
    );
};

export default ConsultationCreate;