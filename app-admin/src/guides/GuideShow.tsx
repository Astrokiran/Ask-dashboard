import { useState, useEffect } from 'react';
import {
    Show,
    useRecordContext,
    useNotify,
    TopToolbar,
    Title,
    Identifier,
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
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { httpClient } from '../dataProvider';
import { CircularProgress, Box } from '@mui/material';

const API_URL = 'https://appdev.astrokiran.com/auth/api/v1/admin/guides';

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
    const notify = useNotify();
    const [documents, setDocuments] = useState<any>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!guideId) return;
        const fetchDocs = async () => {
            setLoading(true);
            try {
                const { json } = await httpClient(`${API_URL}/${guideId}/kyc-documents`);
                const processedDocs: any = {};
                (json.data.documents || []).forEach((doc: any) => {
                    if (!processedDocs[doc.document_type]) processedDocs[doc.document_type] = {};
                    if (!processedDocs[doc.document_type].front) {
                        processedDocs[doc.document_type].front = { src: doc.s3_bucket_url };
                    } else {
                        processedDocs[doc.document_type].back = { src: doc.s3_bucket_url };
                    }
                });
                setDocuments(processedDocs);
            } catch (error: any) {
                notify(`Error fetching KYC: ${error.message}`, { type: 'error' });
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

// --- Main Show View (Contains the Logic and Buttons) ---

const GuideShowView = () => {
    const record = useRecordContext();
    const notify = useNotify();
    const [verifying, setVerifying] = useState(false);

    const handleVerify = async (documentType: 'aadhaar' | 'pan', isVerified: boolean) => {
        if (!record) return;
        setVerifying(true);
        try {
            await httpClient(`${API_URL}/${record.id}/kyc/verify?document_type=${documentType}`, {
                method: 'PATCH',
                body: JSON.stringify({ is_verified: isVerified }),
            });
            notify(`Document ${documentType} has been ${isVerified ? 'verified' : 'rejected'}.`, { type: 'success' });
            // Consider refreshing the view here if status changes are important to see immediately
        } catch (error: any) {
            notify(`Error: ${error.message}`, { type: 'error' });
        } finally {
            setVerifying(false);
        }
    };

    if (!record) {
        return <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>;
    }
    
    const guideName = record.full_name || record.name;

    return (
        <>
            <Title title={`Profile: ${guideName}`} />
            <Card className="mb-6">
                <CardHeader>
                    <div className="flex justify-between items-start w-full">
                        {/* Left Side: Avatar and Info */}
                        <div className="flex items-center gap-4">
                            <Avatar className="h-20 w-20">
                                <AvatarImage src={record.profile_picture_url} alt={guideName} />
                                <AvatarFallback>{guideName?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <CardTitle className="text-2xl">{guideName}</CardTitle>
                                <CardDescription className="text-base">{record.specialization}</CardDescription>
                                <div className="flex gap-1 flex-wrap mt-2">
                                    {(record.skills || []).map((skill: any) => <Badge key={skill.id || skill} variant="secondary">{skill.name || skill}</Badge>)}
                                </div>
                            </div>
                        </div>

                        {/* Right Side: The Action Buttons */}
                        {/* <div className="flex items-center gap-2 flex-shrink-0">
                            <Button onClick={() => handleVerify('pan', true)} disabled={verifying} size="sm" className="bg-orange-500 hover:bg-orange-600"><CheckCircle className="mr-2 h-4 w-4" />Verify PAN</Button>
                            <Button onClick={() => handleVerify('aadhaar', true)} disabled={verifying} size="sm" className="bg-green-600 hover:bg-green-700"><CheckCircle className="mr-2 h-4 w-4" />Verify Aadhaar</Button>
                            <Button onClick={() => { handleVerify('aadhaar', false); handleVerify('pan', false); }} disabled={verifying} size="sm" variant="destructive"><XCircle className="mr-2 h-4 w-4" />Reject All</Button>
                        </div> */}
                    </div>
                </CardHeader>
            </Card>

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
        </TopToolbar>
    );

    return (
        <Show actions={<TopActions />} component="div" title=" ">
            <GuideShowView />
        </Show>
    );
};