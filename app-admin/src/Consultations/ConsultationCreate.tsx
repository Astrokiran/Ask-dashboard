// src/consultations/ConsultationCreate.tsx

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

// Validation functions
const validateRequired = required('This field is required');
const validateDuration = [required(), minValue(1, 'Duration must be at least 1 minute')];

// The main create component
export const ConsultationCreate = () => (
    <Create title="Start a New Consultation">
        <SimpleForm
            // Using a custom component for layout to match the UI style
            component={CustomFormLayout}
            // You can define a default value if needed, e.g., for status
            // defaultValues={{ status: 'Scheduled' }}
        >
            {/* Input to select a Guide */}
            <ReferenceInput
                source="guide_id"
                reference="guides"
                label="Select a Guide"
            >
                <SelectInput 
                    optionText="full_name" 
                    fullWidth 
                    validate={validateRequired} // The prop is now correctly on the child
                />
            </ReferenceInput>
            {/* Input to select a Customer */}
            <ReferenceInput
                source="customer_id"
                reference="customers"
                label="Select a Customer"
            >
                {/* `optionText` should match a field in your customers data, e.g., 'name' */}
                <SelectInput
                    validate={validateRequired}
                    optionText="name" fullWidth />
            </ReferenceInput>

            {/* Input for the duration */}
            <NumberInput
                source="duration"
                label="Consultation Duration (in minutes)"
                validate={validateDuration}
                fullWidth
            />
        </SimpleForm>
    </Create>
);

// Optional: A custom layout component to wrap the form in a Card for consistent UI
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