// src/orders/OrderCreate.tsx
import { Create, SimpleForm, required, SelectInput, ReferenceInput } from 'react-admin';
import { useWatch } from 'react-hook-form'; // CORRECTED: Import useWatch from react-hook-form
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { CustomFileInput } from '../components/admin/ui/CustomFileInput';

// A component to conditionally show the hand image uploads
const PalmistryFields = () => {
    // This hook now correctly watches the form state
    const consultationType = useWatch({ name: 'consultationType' });
    if (consultationType !== 'palmistry') {
        return null;
    }
    return (
        <Card>
            <CardHeader>
                <CardTitle>Palmistry Images</CardTitle>
                <p className="text-sm text-muted-foreground">Please upload images of the customer's hands.</p>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <CustomFileInput source="leftHandImage" label="Left Hand Image" />
                <CustomFileInput source="rightHandImage" label="Right Hand Image" />
            </CardContent>
        </Card>
    );
};

export const OrderCreate = () => (
  <Create title="Create a New Order">
    <SimpleForm>
      <div className="flex flex-col gap-8">
        <Card>
            <CardHeader>
                <CardTitle>Order Details</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ReferenceInput source="customerId" reference="customers">
                    <SelectInput optionText="name" label="Select Customer" validate={[required()]} fullWidth />
                </ReferenceInput>
                <SelectInput source="consultationType" label="Consultation Type" validate={[required()]} fullWidth choices={[
                    { id: 'astrology', name: 'Astrology' },
                    { id: 'palmistry', name: 'Palmistry' },
                    { id: 'tarot', name: 'Tarot Reading' },
                ]} />
                <SelectInput source="product" label="Select Product" fullWidth choices={[
                    { id: 'product_a', name: 'Product A' },
                    { id: 'product_b', name: 'Product B' },
                ]} />
                <SelectInput source="service" label="Select Service" fullWidth choices={[
                    { id: 'service_x', name: 'Service X' },
                    { id: 'service_y', name: 'Service Y' },
                ]} />
            </CardContent>
        </Card>
        
        <PalmistryFields />
      </div>
    </SimpleForm>
  </Create>
);