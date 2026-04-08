import { useState, useEffect } from 'react';
import {
    Show,
    SimpleShowLayout,
    TextField,
    DateField,
    FunctionField,
    EditButton,
    DeleteButton,
    TopToolbar,
    useRecordContext,
    useDataProvider,
} from 'react-admin';
import {
    Card,
    CardContent,
    Chip,
    Grid,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    Paper,
} from '@mui/material';

const PromoCodeShowActions = () => (
    <TopToolbar>
        <EditButton />
        <DeleteButton />
    </TopToolbar>
);

const RedemptionHistory = () => {
    const record = useRecordContext();
    const dataProvider = useDataProvider();
    const [redemptions, setRedemptions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!record?.id) return;
        const fetchRedemptions = async () => {
            try {
                const { data } = await dataProvider.custom('promo-codes/redemptions', {
                    codeId: record.id,
                });
                setRedemptions(data || []);
            } catch {
                setRedemptions([]);
            } finally {
                setLoading(false);
            }
        };
        fetchRedemptions();
    }, [record?.id, dataProvider]);

    if (loading) return <Typography>Loading redemptions...</Typography>;
    if (redemptions.length === 0) return <Typography color="textSecondary">No redemptions yet.</Typography>;

    return (
        <TableContainer component={Paper} variant="outlined">
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>User ID</TableCell>
                        <TableCell>Voucher ID</TableCell>
                        <TableCell>Wallet Txn ID</TableCell>
                        <TableCell>Redeemed At</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {redemptions.map((r: any) => (
                        <TableRow key={r.redemption_id}>
                            <TableCell>{r.user_id}</TableCell>
                            <TableCell>{r.voucher_id || '-'}</TableCell>
                            <TableCell>{r.wallet_txn_id || '-'}</TableCell>
                            <TableCell>{new Date(r.redeemed_at).toLocaleString()}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export const PromoCodeShow = () => (
    <Show actions={<PromoCodeShowActions />}>
        <SimpleShowLayout>
            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                    <Card variant="outlined">
                        <CardContent>
                            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                                Code Details
                            </Typography>
                            <TextField source="code" label="Code" />
                            <TextField source="description" label="Description" />
                            <TextField source="offer_name" label="Linked Offer" />
                            <FunctionField
                                label="Offer ID"
                                render={(record: any) => (
                                    <Typography variant="body2" color="textSecondary">
                                        {record.offer_id}
                                    </Typography>
                                )}
                            />
                            <FunctionField
                                label="Reward Type"
                                render={(record: any) => {
                                    const type = record.voucher_type;
                                    if (!type) return '-';
                                    return (
                                        <Chip
                                            label={type === 'FREE_MINUTES' ? 'Free Minutes' : 'Free Credit'}
                                            size="small"
                                            color={type === 'FREE_MINUTES' ? 'info' : 'secondary'}
                                        />
                                    );
                                }}
                            />
                            <FunctionField
                                label="Reward Value"
                                render={(record: any) => {
                                    if (record.voucher_type === 'FREE_MINUTES' && record.free_minutes) {
                                        return `${record.free_minutes} minutes`;
                                    }
                                    if (record.voucher_type === 'FREE_CREDIT' && record.free_credit_amount) {
                                        return `₹${record.free_credit_amount}`;
                                    }
                                    return '-';
                                }}
                            />
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                    <Card variant="outlined">
                        <CardContent>
                            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                                Usage & Validity
                            </Typography>
                            <FunctionField
                                label="Status"
                                render={(record: any) => {
                                    const isExpired = new Date(record.valid_to) < new Date();
                                    if (!record.is_active) return <Chip label="Inactive" size="small" color="default" />;
                                    if (isExpired) return <Chip label="Expired" size="small" color="warning" />;
                                    return <Chip label="Active" size="small" color="success" />;
                                }}
                            />
                            <FunctionField
                                label="Redemptions"
                                render={(record: any) =>
                                    `${record.current_redemptions} / ${record.max_redemptions}`
                                }
                            />
                            <DateField source="valid_from" label="Valid From" showTime />
                            <DateField source="valid_to" label="Valid To" showTime />
                            <TextField source="created_by" label="Created By" />
                            <DateField source="created_at" label="Created At" showTime />
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12 }}>
                    <Card variant="outlined">
                        <CardContent>
                            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                                Redemption History
                            </Typography>
                            <RedemptionHistory />
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </SimpleShowLayout>
    </Show>
);
