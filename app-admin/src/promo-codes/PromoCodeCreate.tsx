import { useState, useEffect } from 'react';
import {
    Create,
    SimpleForm,
    TextInput,
    NumberInput,
    DateTimeInput,
    SelectInput,
    useNotify,
    useRedirect,
    useDataProvider,
} from 'react-admin';
import { Box, Typography } from '@mui/material';

export const PromoCodeCreate = () => {
    const notify = useNotify();
    const redirect = useRedirect();
    const dataProvider = useDataProvider();
    const [offerChoices, setOfferChoices] = useState<{ id: string; name: string }[]>([]);

    useEffect(() => {
        const fetchOffers = async () => {
            try {
                const { data } = await dataProvider.getList('offers', {
                    pagination: { page: 1, perPage: 200 },
                    sort: { field: 'created_at', order: 'DESC' },
                    filter: {},
                });
                const choices = data
                    .filter((o: any) => o.voucher_subtype)
                    .map((o: any) => ({
                        id: o.offer_id || o.id,
                        name: `${o.offer_name} (${o.voucher_subtype}${o.free_minutes ? ` - ${o.free_minutes}min` : ''}${o.bonus_fixed_amount && parseFloat(o.bonus_fixed_amount) > 0 ? ` - ₹${o.bonus_fixed_amount}` : ''})`,
                    }));
                setOfferChoices(choices);
            } catch {
                setOfferChoices([]);
            }
        };
        fetchOffers();
    }, [dataProvider]);

    const handleSubmit = async (values: any) => {
        try {
            const payload = {
                ...values,
                code: values.code?.toUpperCase().trim(),
            };

            await dataProvider.create('promo-codes', { data: payload });
            notify('Promo code created successfully', { type: 'success' });
            redirect('list', 'promo-codes');
        } catch (error: any) {
            notify(error?.message || 'Failed to create promo code', { type: 'error' });
        }
    };

    return (
        <Create>
            <SimpleForm onSubmit={handleSubmit}>
                <Typography variant="h6" gutterBottom>
                    Create Promo Code
                </Typography>

                <Box display="flex" gap={2} width="100%">
                    <TextInput
                        source="code"
                        label="Promo Code"
                        helperText="Alphanumeric code (e.g., ASTRO2026). Will be stored uppercase."
                        required
                        fullWidth
                        format={(v: string) => v?.toUpperCase()}
                    />
                    <SelectInput
                        source="offer_id"
                        label="Linked Offer"
                        choices={offerChoices}
                        required
                        fullWidth
                        helperText="The offer defines the reward (free minutes or wallet credit)."
                    />
                </Box>

                <Box display="flex" gap={2} width="100%">
                    <TextInput source="description" label="Description" fullWidth />
                    <TextInput source="created_by" label="Created By" fullWidth />
                </Box>

                <Box display="flex" gap={2} width="100%">
                    <NumberInput
                        source="max_redemptions"
                        label="Max Redemptions"
                        min={1}
                        defaultValue={100}
                        required
                        fullWidth
                    />
                </Box>

                <Box display="flex" gap={2} width="100%">
                    <DateTimeInput source="valid_from" label="Valid From" fullWidth />
                    <DateTimeInput source="valid_to" label="Valid To" required fullWidth />
                </Box>
            </SimpleForm>
        </Create>
    );
};
