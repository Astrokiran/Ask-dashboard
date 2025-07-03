import {
  Show,
  useRecordContext,
  EditButton,
  TopToolbar,
  Title,
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
import { Separator } from '../components/ui/separator';

const GuideShowActions = () => (
  <TopToolbar>
    <EditButton />
  </TopToolbar>
);

const DetailItem = ({ label, children }: { label: string, children: React.ReactNode }) => (
  <div>
    <p className="text-sm text-muted-foreground">{label}</p>
    <p className="font-medium">{children || '-'}</p>
  </div>
);

const GuideShowView = () => {
  const record = useRecordContext();
  if (!record) return null;

  return (
    <>
      <Title title={`${record.name}'s Profile`} />
      <Card className="mb-6">
        <CardHeader className="flex-row items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={record.avatar} />
            <AvatarFallback>{record.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-2xl">{record.name}</CardTitle>
            <CardDescription>{record.specialization}</CardDescription>
            <div className="flex gap-1 flex-wrap mt-2">
              {record.skills?.map((skill: string) => <Badge key={skill} variant="secondary">{skill}</Badge>)}
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Guide Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DetailItem label="Email Address">{record.email}</DetailItem>
              <DetailItem label="Phone Number">{record.phone}</DetailItem>
              <DetailItem label="Alternative Number">{record.altPhone}</DetailItem>
              <DetailItem label="Years of Experience">{record.experience} years</DetailItem>
              <DetailItem label="Onboarded Date">{new Date(record.onboardedDate).toLocaleDateString()}</DetailItem>
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardHeader>
              <CardTitle>KYC Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <DetailItem label="PAN Card">{(record.pan?.name) || 'Not Uploaded'}</DetailItem>
              <DetailItem label="Aadhar Card">{(record.aadhar?.name) || 'Not Uploaded'}</DetailItem>
              <DetailItem label="Bank Details">{(record.bank?.name) || 'Not Uploaded'}</DetailItem>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export const GuideShow = () => (
  <Show actions={<GuideShowActions />} component="div" title=" ">
    <GuideShowView />
  </Show>
);