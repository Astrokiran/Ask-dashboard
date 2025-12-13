
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useNotify, useRefresh, Title } from 'react-admin';
import { httpClient } from '../dataProvider';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../components/ui/alert-dialog';
import { ArrowLeft, Trash2, CheckCircle, PlusCircle } from 'lucide-react';
import { CircularProgress, Box } from '@mui/material';
import { AddBankAccountForm } from './AddBankAccountForm';


const API_URL = 'https://devvm.astrokiran.com/auth/api/pixel-admin';


export const GuideBankAccountsPage = () => {
    const { id: guideId } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const notify = useNotify();
    const refresh = useRefresh(); // You might not need refresh if you refetch manually
    const [accounts, setAccounts] = useState<any[]>([]);
    const [guide, setGuide] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);

    const fetchData = async () => {
        if (!guideId) return;
        setLoading(true);
        try {
            const [{ json: guideJson }, { json: accountsJson }] = await Promise.all([
                httpClient(`${API_URL}/api/v1/guides/${guideId}`),
                httpClient(`${API_URL}/api/v1/guides/${guideId}/accounts`),
            ]);
            setGuide(guideJson.data);
            setAccounts(accountsJson || []);
        } catch (error: any) {
            notify(`Error fetching data: ${error.message}`, { type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [guideId]);

    const handleSetDefault = async (accountId: number) => {
        try {
            await httpClient(`${API_URL}/api/v1/guides/${guideId}/accounts/${accountId}/default`, {
                method: 'POST',
            });
            notify('Default bank account updated successfully.', { type: 'success' });
            fetchData(); // Refetch data to show the change
        } catch (error: any) {
            notify(`Error: ${error.message}`, { type: 'error' });
        }
    };
    
    const handleDelete = async (accountId: number) => {
        try {
            await httpClient(`${API_URL}/api/v1/guides/${guideId}/accounts/${accountId}`, {
                method: 'DELETE',
            });
            notify('Bank account deleted successfully.', { type: 'success' });
            fetchData(); // Refetch data to show the change
        } catch (error: any) {
            notify(`Error: ${error.message}`, { type: 'error' });
        }
    };

    if (loading) {
        return <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>;
    }
    
    return (
        <>
        <div className="p-4">
            <Title title={`Bank Accounts for ${guide?.full_name || 'Guide'}`} />
            <div className="flex justify-between items-center mb-4">
                <Button onClick={() => navigate(`/guides/${guideId}/show`)} variant="ghost" size="sm">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Profile
                </Button>
                <Button onClick={() => setIsFormOpen(true)}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add New Account
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Manage Bank Accounts</CardTitle>
                    <CardDescription>
                        Full details for all bank accounts associated with {guide?.full_name}.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Account Holder</TableHead>
                                <TableHead>Bank Name</TableHead>
                                <TableHead>Account Number</TableHead>
                                <TableHead>IFSC Code</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {accounts.length > 0 ? accounts.map((acc) => (
                                <TableRow key={acc.id}>
                                    <TableCell className="font-medium">
                                        {acc.account_holder_name}
                                        {acc.is_default && <Badge className="ml-2">Default</Badge>}
                                    </TableCell>
                                    <TableCell>{acc.bank_name}</TableCell>
                                    <TableCell>{acc.account_number}</TableCell>
                                    <TableCell>{acc.ifsc_code}</TableCell>
                                    <TableCell><Badge variant={acc.status === 'VERIFIED' ? 'default' : 'secondary'}>{acc.status}</Badge></TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            onClick={() => handleSetDefault(acc.id)}
                                            disabled={acc.is_default}
                                        >
                                            <CheckCircle className="mr-2 h-4 w-4" />
                                            Set Default
                                        </Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="destructive" size="sm"><Trash2 className="h-4 w-4" /></Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This will permanently delete the bank account. This action cannot be undone.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDelete(acc.id)}>Delete</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center">No bank accounts found.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
         {guideId && (  
            <AddBankAccountForm
                guideId={guideId}
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSuccess={fetchData}
            />
        )}
    </> 
    );
};  