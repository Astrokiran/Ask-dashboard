import {
    Edit,
    SimpleForm,
    TextInput,
    BooleanInput,
    NumberInput,
    DateTimeInput,
    useNotify,
    useRedirect,
    useDataProvider,
} from 'react-admin';
import { Box, Typography } from '@mui/material';

export const PromoCodeEdit = () => {
    const notify = useNotify();
    const redirect = useRedirect();
    const dataProvider = useDataProvider();

    const handleSubmit = async (values: any) => {
        try {
            const payload: Record<string, any> = {};

            if (values.description !== undefined) payload.description = values.description;
            if (values.is_active !== undefined) payload.is_active = values.is_active;
            if (values.max_redemptions !== undefined) payload.max_redemptions = values.max_redemptions;
            if (values.valid_to !== undefined) payload.valid_to = values.valid_to;

            await dataProvider.update('promo-codes', {
                id: values.id,
                data: payload,
                previousData: values,
            });
            notify('Promo code updated successfully', { type: 'success' });
            redirect('show', 'promo-codes', values.id);
        } catch (error: any) {
            notify(error?.message || 'Failed to update promo code', { type: 'error' });
        }
    };

    return (
        <Edit>
            <SimpleForm onSubmit={handleSubmit}>
                <Typography variant="h6" gutterBottom>
                    Edit Promo Code
                </Typography>

                <TextInput source="code" label="Code" disabled fullWidth />

                <Box display="flex" gap={2} width="100%">
                    <TextInput source="description" label="Description" fullWidth />
                    <BooleanInput source="is_active" label="Active" />
                </Box>

                <Box display="flex" gap={2} width="100%">
                    <NumberInput
                        source="max_redemptions"
                        label="Max Redemptions"
                        min={1}
                        fullWidth
                    />
                    <DateTimeInput source="valid_to" label="Valid To" fullWidth />
                </Box>
            </SimpleForm>
        </Edit>
    );
};
