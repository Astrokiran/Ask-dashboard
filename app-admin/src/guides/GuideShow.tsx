import { useState, useEffect } from 'react';
import {
    Show,
    useRecordContext,
    useNotify,
    useUpdate,
    useRefresh,
    TopToolbar,
    Title,
    Identifier,
    EditButton,
} from 'react-admin';
import { Link } from 'react-router-dom';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '../components/ui/alert-dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { UserX } from 'lucide-react';
import { Banknote, Eye } from 'lucide-react';
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    CardDescription,
} from '../components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { httpClient } from '../dataProvider';
import { CircularProgress, Box, Switch, FormControlLabel } from '@mui/material';


const API_URL = 'http://localhost:8083/api/pixel-admin/api/v1';

// --- Reusable UI Components ---

const DocumentImage = ({ label, src }: { label: string, src?: string }) => (
    <div className="text-center">
        <p className="font-semibold mb-2">{label}</p>
        <img
            src={src || 'https://placeholder.co/300x200?text=No+Image'}
            alt={label}
            className="rounded-lg border-2 border-dashed w-full object-contain"
        />
    </div>
);

const maskAccountNumber = (accNum: string): string => {
    if (accNum && accNum.length > 4) {
        return `****${accNum.slice(-4)}`;
    }
    return '****';
};

const DetailItem = ({ label, children }: { label: string, children: React.ReactNode }) => (
  <div>
    <p className="text-sm text-muted-foreground">{label}</p>
    <p className="font-medium text-base">{children || '-'}</p>
  </div>
);

// --- KYC Document Section (Displays Images Only) ---

const KycDocumentSection = ({ guideId }: { guideId: Identifier }) => {
    const [documents, setDocuments] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const notify = useNotify();
    
    useEffect(() => {
        if (!guideId) return;
        const fetchDocs = async () => {
            setLoading(true);
            try {
                // --- UPDATED: Correct API endpoint for KYC docs ---
                const { json } = await httpClient(`${API_URL}/guides/kyc-documents/${guideId}`);
                // This section can be built out when the KYC API is ready
                setDocuments(json.data || {});
            } catch (error: any) {
                // It's okay if this fails for now, we just show an empty section
                console.error(`Could not fetch KYC docs: ${error.message}`);
            } finally {
                setLoading(false);
            }
        };
        fetchDocs();
    }, [guideId, notify]);

    if (loading) {
        return <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>;
    }

    return (
        <Card>
            <CardHeader><CardTitle>KYC Documents</CardTitle></CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                   <DocumentImage label="Aadhaar (Front)" src={documents.aadhaar?.front?.src} />
                   <DocumentImage label="Aadhaar (Back)" src={documents.aadhaar?.back?.src} />
                   <DocumentImage label="PAN (Front)" src={documents.pan?.front?.src} />
                   <DocumentImage label="PAN (Back)" src={documents.pan?.back?.src} />
                </div>
            </CardContent>
        </Card>
    );
};

const OffboardGuideButton = () => {
    const record = useRecordContext();
    const notify = useNotify();
    const refresh = useRefresh();
    const navigate = useNavigate();
    
    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [isOffboarding, setIsOffboarding] = useState(false);

    if (!record) return null;

  

    const handleOffboard = async () => {
        setIsOffboarding(true);
        try {
            await httpClient(`${API_URL}/guides/${record.id}/offboard`, {
                method: 'POST',
            });
            notify('Guide offboarded successfully!', { type: 'success' });
            setIsOpen(false);
            refresh(); // Refresh the current view to show the new status
            navigate('/guides'); // Optional: redirect back to the list after offboarding
        } catch (error: any) {
            const errorMessage = error.body?.message || error.message || 'An unknown error occurred.';
            notify(`Error: ${errorMessage}`, { type: 'error' });
        } finally {
            setIsOffboarding(false);
        }
    };

    const isConfirmationValid = inputValue === 'OFFBOARD';

    return (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                    <UserX className="mr-2 h-4 w-4" />
                    Offboard Guide
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will offboard the guide and change their status. This action can be undone, but will require manual state changes.
                        To confirm, please type <strong>OFFBOARD</strong> in the box below.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="py-4">
                    <Label htmlFor="offboard-confirm">Confirmation</Label>
                    <Input
                        id="offboard-confirm"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Type OFFBOARD to confirm"
                        autoFocus
                    />
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setInputValue('')}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleOffboard}
                        disabled={!isConfirmationValid || isOffboarding}
                        className="bg-destructive hover:bg-destructive/90"
                    >
                        {isOffboarding ? <CircularProgress size={20} color="inherit" /> : 'Confirm Offboard'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

// --- NEW: Status & Controls Section with Toggles ---
const StatusControlSection = () => {
    const record = useRecordContext();
    const notify = useNotify();
    const refresh = useRefresh();
    const [update, { isLoading }] = useUpdate();

    // --- FIX IS HERE ---
    // Add a check to ensure the record is defined before proceeding.
    if (!record) {
        return null;
    }

    const handleToggle = (field: string, value: boolean) => {
        update('guides', { 
            id: record.id, 
            data: { [field]: value },
            previousData: record 
        }, {
            onSuccess: () => {
                notify(`Guide ${field} status updated.`, { type: 'success' });
                refresh();
            },
            onError: (error: any) => {
                notify(`Error: ${error.message}`, { type: 'error' });
            },
        });
    };

    return (
        <Card>
            <CardHeader><CardTitle>Status & Controls</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <FormControlLabel
                    control={<Switch checked={record.is_online || false} onChange={(e) => handleToggle('is_online', e.target.checked)} />}
                    label="Online"
                    disabled={isLoading}
                />
                <FormControlLabel
                    control={<Switch checked={record.chat_enabled || false} onChange={(e) => handleToggle('chat_enabled', e.target.checked)} />}
                    label="Chat Enabled"
                    disabled={isLoading}
                />
                <FormControlLabel
                    control={<Switch checked={record.voice_enabled || false} onChange={(e) => handleToggle('voice_enabled', e.target.checked)} />}
                    label="Call Enabled"
                    disabled={isLoading}
                />
                <FormControlLabel
                    control={<Switch checked={record.video_enabled || false} onChange={(e) => handleToggle('video_enabled', e.target.checked)} />}
                    label="Video Call Enabled"
                    disabled={isLoading}
                />
            </CardContent>
        </Card>
    );
}


const BankAccountSummaryCard = ({ guideId }: { guideId: Identifier }) => {
    const [defaultAccount, setDefaultAccount] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAccounts = async () => {
            try {
                setLoading(true);
                const { json } = await httpClient(`${API_URL}/guides/${guideId}/accounts`);
                const accounts = json || [];
                // Find the default account or take the first one if none is default
                const defaultAcc = accounts.find((acc: any) => acc.is_default) || accounts[0];
                setDefaultAccount(defaultAcc);
            } catch (error) {
                console.error("Could not fetch bank accounts", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAccounts();
    }, [guideId]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Bank Account Details</CardTitle>
                <CardDescription>Default account for payouts.</CardDescription>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <Box display="flex" justifyContent="center"><CircularProgress size={24} /></Box>
                ) : defaultAccount ? (
                    <div className="space-y-4">
                        <DetailItem label="Bank Name">{defaultAccount.bank_name}</DetailItem>
                        <DetailItem label="Account Number">{maskAccountNumber(defaultAccount.account_number)}</DetailItem>
                        <Button 
                            className="w-full mt-4" 
                            variant="outline" 
                            onClick={() => navigate(`/guides/${guideId}/accounts`)}
                        >
                            <Eye className="mr-2 h-4 w-4" /> View & Manage All Accounts
                        </Button>
                    </div>
                ) : (
                    <div className="text-center text-muted-foreground py-4">
                        <Banknote className="mx-auto h-8 w-8 mb-2" />
                        <p>No bank accounts found.</p>
                        <Button 
                            className="w-full mt-4" 
                            onClick={() => navigate(`/guides/${guideId}/accounts`)}
                        >
                            Add Bank Account
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

// --- Main Show View (Updated to display all new data) ---
const GuideShowView = () => {
    const record = useRecordContext();

    if (!record) {
        return <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>;
    }
    
    return (
        <>
            <Title title={`Profile: ${record.full_name}`} />
            <Card className="mb-6">
                <CardHeader>
                    <div className="flex justify-between items-start w-full">
                        <div className="flex items-center gap-4">
                            <Avatar className="h-20 w-20">
                                <AvatarImage src={record.profile_picture_url} alt={record.full_name} />
                                <AvatarFallback>{record.full_name?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <CardTitle className="text-2xl">{record.full_name}</CardTitle>
                                <div className="flex gap-1 flex-wrap mt-2">
                                    {(record.skills || []).map((skill: string) => <Badge key={skill} variant="secondary">{skill}</Badge>)}
                                </div>
                            </div>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            <div className="grid grid-cols-1 gap-6 mb-6">
              <StatusControlSection />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="lg:col-span-2">
                  <Card>
                      <CardHeader><CardTitle>Guide Information</CardTitle></CardHeader>
                      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <DetailItem label="Phone">{record.phone_number}</DetailItem>
                          <DetailItem label="Email Address">{record.email}</DetailItem>
                          <DetailItem label="Years of Experience">{record.years_of_experience} years</DetailItem>
                          <DetailItem label="Languages Spoken">{(record.languages || []).join(', ')}</DetailItem>
                          <DetailItem label='Rating'>
                              <span className="text-orange-500 font-semibold">{record.rating || 'N/A'}</span>
                          </DetailItem>
                          <DetailItem label="Total Consultations">{record.number_of_consultation}</DetailItem>
                          <DetailItem label="Onboarded On">
                              <span>{new Date(record.created_at).toLocaleDateString()}</span>
                          </DetailItem>
                      </CardContent>
                  </Card>
                </div>
                <div>
                      <BankAccountSummaryCard guideId={record.id} />
                </div>
            </div>
      
            <KycDocumentSection guideId={record.id} />
        </>
    );
};


export const GuideShow = () => {
    const navigate = useNavigate();
    const TopActions = () => (
        <TopToolbar>
            <Button onClick={() => navigate(-1)} variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Guides
            </Button>
            <div className="flex-grow" /> {/* This pushes the buttons to the right */}
            <EditButton />
            <OffboardGuideButton /> 
        </TopToolbar>
    );

    return (
        <Show actions={<TopActions />} component="div" title=" ">
            <GuideShowView />
        </Show>
    );
};