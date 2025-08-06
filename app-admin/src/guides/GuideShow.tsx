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


const API_URL = 'http://localhost:8082/api/v1';

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
                const { json } = await httpClient(`${API_URL}/guides/${guideId}/kyc-documents`);
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
                  <Card>
                      <CardHeader><CardTitle>Bank Account Details</CardTitle></CardHeader>
                      <CardContent className="space-y-4">
                          <DetailItem label="Account Holder">{record.bank_details?.holder_name}</DetailItem>
                          <DetailItem label="Account Number">{record.bank_details?.account_number}</DetailItem>
                          <DetailItem label="IFSC Code">{record.bank_details?.ifsc_code}</DetailItem>
                          <DetailItem label="Bank Name">{record.bank_details?.bank_name}</DetailItem>
                      </CardContent>
                  </Card>
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
        <EditButton />
        </TopToolbar>
    );

    return (
        <Show actions={<TopActions />} component="div" title=" ">
            <GuideShowView />
        </Show>
    );
};