// src/guides/GuideAddressForm.tsx
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { CustomTextInput } from '../components/admin/ui/CustomTextInput';

export const GuideAddressForm = () => (
    <Card className="dark:bg-card dark:text-card-foreground">
        <CardHeader><CardTitle>Address</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CustomTextInput source="address.line1" label="Address Line 1" />
            <CustomTextInput source="address.city" label="City" />
            <CustomTextInput source="address.state" label="State" />
            <CustomTextInput source="address.pincode" label="Pincode" />
            <CustomTextInput source="address.country" label="Country" />
        </CardContent>
    </Card>
);