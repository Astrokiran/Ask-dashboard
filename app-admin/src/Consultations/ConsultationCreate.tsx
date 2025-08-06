
import {
    Create,
    SimpleForm,
    ReferenceInput,
    SelectInput,
    NumberInput,
    required,
    minValue,
} from 'react-admin';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

const validateRequired = required('This field is required');
const validateDuration = [required(), minValue(1, 'Duration must be at least 1 minute')];

export const ConsultationCreate = () => (
    <Create title="Start a New Consultation">
        <SimpleForm
            component={CustomFormLayout}
        >
            <ReferenceInput
                source="guide_id"
                reference="guides"
                label="Select a Guide"
            >
                <SelectInput 
                    optionText="full_name" 
                    fullWidth 
                    validate={validateRequired} 
                />
            </ReferenceInput>
            <ReferenceInput
                source="customer_id"
                reference="customers"
                label="Select a Customer"
            >
                <SelectInput
                    validate={validateRequired}
                    optionText="name" fullWidth />
            </ReferenceInput>

            <NumberInput
                source="duration"
                label="Consultation Duration (in minutes)"
                validate={validateDuration}
                fullWidth
            />
        </SimpleForm>
    </Create>
);

const CustomFormLayout = ({ children }: { children: React.ReactNode }) => (
    <Card className="max-w-2xl mx-auto">
        <CardHeader>
            <CardTitle>New Consultation Details</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="flex flex-col gap-4">
                {children}
            </div>
        </CardContent>
    </Card>
);