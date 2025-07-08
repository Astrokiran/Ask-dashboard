import { 
    Edit, 
    SimpleForm, 
    TextInput, 
    ImageInput, 
    ImageField,
    Toolbar,
    SaveButton,
    required
} from 'react-admin';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';

const KYCToolbar = () => (
    <Toolbar>
        <SaveButton label="Save KYC Details" alwaysEnable />
    </Toolbar>
);

const DocumentPlaceholder = ({ text }: { text: string }) => (
    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-center p-4 h-48 w-full text-sm text-gray-500 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
        <span>{text}</span>
    </div>
);

export const GuideEdit = () => (
    <Edit title="Complete Guide KYC">
        <SimpleForm toolbar={<KYCToolbar />}>
            <div className="max-w-4xl mx-auto space-y-6">

                <Card>
                    <CardHeader>
                        <CardTitle>Bank Account Details</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <TextInput source="kyc.bank.account_holder_name" label="Account Holder Name" validate={required()} fullWidth />
                        <TextInput source="kyc.bank.account_number" label="Account Number" validate={required()} fullWidth />
                        <TextInput source="kyc.bank.bank_name" label="Bank Name" validate={required()} fullWidth />
                        <TextInput source="kyc.bank.ifsc_code" label="IFSC Code" validate={required()} fullWidth />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>KYC Documents</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-8">
                        <div>
                            <h3 className="text-lg font-semibold mb-2">Aadhaar Card</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <ImageInput source="kyc.aadhaar.front" label="Aadhaar Front" accept="image/*">
                                    <ImageField source="src" title="title" sx={{ '& .RaImageField-image': { margin: 0, height: 192, width: '100%', objectFit: 'contain' } }}/>
                                </ImageInput>
                                <ImageInput source="kyc.aadhaar.back" label="Aadhaar Back" accept="image/*">
                                    <ImageField source="src" title="title" sx={{ '& .RaImageField-image': { margin: 0, height: 192, width: '100%', objectFit: 'contain' } }}/>
                                </ImageInput>
                            </div>
                        </div>
                        
                        <div>
                            <h3 className="text-lg font-semibold mb-2">PAN Card</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <ImageInput source="kyc.pan.front" label="PAN Front" accept="image/*">
                                     <ImageField source="src" title="title" sx={{ '& .RaImageField-image': { margin: 0, height: 192, width: '100%', objectFit: 'contain' } }}/>
                                </ImageInput>
                                <ImageInput source="kyc.pan.back" label="PAN Back" accept="image/*">
                                     <ImageField source="src" title="title" sx={{ '& .RaImageField-image': { margin: 0, height: 192, width: '100%', objectFit: 'contain' } }}/>
                                </ImageInput>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </SimpleForm>
    </Edit>
);