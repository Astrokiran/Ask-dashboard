import {
    Show,
    TextField,
    DateField,
    useRecordContext,
    useNotify,
    useRefresh,
} from 'react-admin';
import { useNavigate } from 'react-router-dom';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from '../components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '../components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '../components/ui/dialog';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { FormEvent, useState,useEffect } from 'react';
import { User, CreditCard, Users, History, Cake,PlusCircle,Clock, MapPin, Languages, Sparkles,ShoppingCart, Pencil, ChevronDown, ChevronRight } from 'lucide-react'; 

import { httpClient } from '../dataProvider';

const API_URL = process.env.REACT_APP_API_URL;

const CreateProfileForm = ({ onSave, saving }: { onSave: (data: any) => void; saving: boolean }) => {
    const [name, setName] = useState('');
    const [dob, setDob] = useState('');
    const [tob, setTob] = useState('');
    const [birthCity, setBirthCity] = useState('');
    const [birthCountry, setBirthCountry] = useState('');
    const [preferredLanguage, setPreferredLanguage] = useState('');
    const [zodiacSign, setZodiacSign] = useState('');
    const [isPrimary, setIsPrimary] = useState(false);

    const handleSubmit = (event: FormEvent) => {
        event.preventDefault();
        onSave({ 
            name, 
            dob: dob || null,
            tob: tob || null,
            birth_city: birthCity,
            birth_country: birthCountry,
            preferred_language: preferredLanguage,
            zodiac_sign: zodiacSign,
            is_primary: isPrimary,
        });
    };
    
    return (
       // This form now uses a responsive grid layout
       <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 p-4">
            <div className="md:col-span-2">
                <label className="text-sm font-medium">Full Name *</label>
                <input value={name} onChange={e => setName(e.target.value)} required className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </div>
            <div>
                <label className="text-sm font-medium">Date of Birth</label>
                <input type="date" value={dob} onChange={e => setDob(e.target.value)} className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </div>
            <div>
                <label className="text-sm font-medium">Time of Birth</label>
                <input type="time" value={tob} onChange={e => setTob(e.target.value)} className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </div>
            <div>
                <label className="text-sm font-medium">Birth City</label>
                <input value={birthCity} onChange={e => setBirthCity(e.target.value)} className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </div>
            <div>
                <label className="text-sm font-medium">Birth Country</label>
                <input value={birthCountry} onChange={e => setBirthCountry(e.target.value)} className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </div>
            <div>
                <label className="text-sm font-medium">Preferred Language</label>
                <input value={preferredLanguage} onChange={e => setPreferredLanguage(e.target.value)} className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </div>
             <div>
                <label className="text-sm font-medium">Zodiac Sign</label>
                <input value={zodiacSign} onChange={e => setZodiacSign(e.target.value)} className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </div>
            <div className="md:col-span-2 flex items-center gap-2 mt-2">
                <input type="checkbox" checked={isPrimary} onChange={e => setIsPrimary(e.target.checked)} id="is_primary" />
                <label htmlFor="is_primary" className="text-sm font-medium">Set as Primary Profile</label>
            </div>
            <div className="md:col-span-2">
                <Button type="submit" disabled={saving} className="w-full mt-4">
                    {saving ? 'Saving...' : 'Save Profile'}
                </Button>
            </div>
        </form>
    );
}


const ProfilesGrid = () => {
    const record = useRecordContext();
    const notify = useNotify();
    const refresh = useRefresh();
    
    const [isDialogOpen, setDialogOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // --- 2. Added State and Logic for the EDIT Dialog ---
    const [editingProfile, setEditingProfile] = useState<any | null>(null);

    // This correctly and safely accesses the nested profile data from your API response
    const profileData = record?.profile?.[0];

    const handleSave = (formData: any) => {
        if (!record) return;
        setIsSaving(true);
        
        httpClient(`${API_URL}/api/v1/customers/${record.id}/profile`, {
            method: 'POST',
            body: JSON.stringify(formData),
        })
        .then(() => {   
            notify('Profile created successfully!', { type: 'success' });
            setDialogOpen(false);
            refresh();
        })
        .catch((error: any) => {
            const errorMessage = error.body?.detail?.message || error.message || 'An unknown error occurred';
            notify(`Error: ${errorMessage}`, { type: 'warning' });
        })
        .finally(() => {
            setIsSaving(false);
        });
    };

    const handleUpdateSave = (formData: any) => {
        if (!record) return;
        setIsSaving(true);
        httpClient(`${API_URL}/api/v1/customers/${record.id}/profile`, { // The API endpoint for updating
            method: 'PUT',
            body: JSON.stringify(formData),
        })
        .then(() => { notify('Profile updated successfully!'); setEditingProfile(null); refresh(); })
        .catch(error => notify(`Error: ${error.message || 'An error occurred'}`, { type: 'warning' }))
        .finally(() => setIsSaving(false));
    };


    if (!record) return null;
    // const profileData = record?.profile?.[0];


  return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-2">
                       <Users className="h-5 w-5 text-muted-foreground" />
                       Associated Profiles
                    </CardTitle>
                    <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="flex items-center gap-1">
                                <PlusCircle className="h-4 w-4" />
                                Create New Profile
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create a New Profile for {record.name}</DialogTitle>
                            </DialogHeader>
                            <CreateProfileForm onSave={handleSave} saving={isSaving} />
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>
            <CardContent>
                {(!profileData || !profileData.profiles || profileData.profiles.length === 0) ? (
                    <p>No profiles found for this customer.</p>
                ) : (
                    // This grid now displays more detailed profile cards
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                         {profileData.profiles.map((profile: any, index: number) => (
                            <div key={profile.id || index} className="p-4 border rounded-lg bg-background flex flex-col gap-2 text-sm">
                                {/* --- Header --- */}
                                <div className="flex justify-between items-center">
                                    <h3 className="font-semibold text-base">{profile.name || `Profile #${profile.customer_id}`}</h3>
                                    {profile.is_primary && <Badge variant="default">Primary</Badge>}
                                </div>
                                
                                <hr className="my-1"/>

                                {/* --- Details Section --- */}
                                <div className="space-y-2 text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        <Cake className="h-4 w-4" />
                                        <span><strong>DOB:</strong> {profile.dob ? new Date(profile.dob).toLocaleDateString() : 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4" />
                                        <span><strong>TOB:</strong> {profile.tob || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4" />
                                        <span><strong>Birth Place:</strong> {`${profile.birth_city || ''}${profile.birth_country ? ', ' + profile.birth_country : ''}` || 'N/A'}</span>
                                    </div>
                                     <div className="flex items-center gap-2">
                                        <Languages className="h-4 w-4" />
                                        <span><strong>Language:</strong> {profile.preferred_language || 'N/A'}</span>
                                    </div>
                                     <div className="flex items-center gap-2">
                                        <Sparkles className="h-4 w-4" />
                                        <span><strong>Zodiac:</strong> {profile.zodiac_sign || 'N/A'}</span>
                                    </div>
                                </div>
                                
                                {/* --- Footer with Creation Date --- */}
                                <div className="text-xs text-muted-foreground mt-auto pt-2 text-right">
                                    Created: {new Date(profile.created_at).toLocaleString()}
                                </div>
                                <div className="mt-auto pt-2 flex justify-end">
                                    <Button variant="secondary" size="sm" className="flex items-center gap-1" onClick={() => setEditingProfile(profile)}>
                                        <Pencil className="h-3 w-3" />
                                        Edit
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
            <Dialog open={!!editingProfile} onOpenChange={(isOpen) => !isOpen && setEditingProfile(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Profile for {record.name}</DialogTitle>
                    </DialogHeader>
                    <UpdateProfileForm 
                        profile={editingProfile} 
                        onSave={handleUpdateSave} 
                        onCancel={() => setEditingProfile(null)}
                        saving={isSaving}
                    />
                </DialogContent>
            </Dialog>
        </Card>
    );
};

// --- Payment Orders Component (fetches its own data) ---
const CustomerPaymentOrders = ({ customerId }: { customerId: number }) => {
    const [orders, setOrders] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (!customerId) return;
        setIsLoading(true);
        httpClient(`${API_URL}/api/v1/customers/${customerId}/wallet/payment-orders`)
            .then(({ json }) => {
                // Handle different response structures
                if (Array.isArray(json)) {
                    setOrders(json);
                } else if (json.data && Array.isArray(json.data)) {
                    setOrders(json.data);
                } else if (json.items && Array.isArray(json.items)) {
                    setOrders(json.items);
                } else {
                    setOrders([]);
                }
            })
            .finally(() => setIsLoading(false));
    }, [customerId]);

    const handlePaymentOrderClick = (orderId: number) => {
        navigate(`/payment-orders/${orderId}/show`);
    };

    // Calculate payment order statistics
    const getPaymentOrderStats = () => {
        if (orders.length === 0) {
            return {
                total: 0,
                successful: 0,
                failed: 0,
                pending: 0,
                successfulPercentage: 0,
                failedPercentage: 0,
                pendingPercentage: 0,
                totalAmount: 0,
                successfulAmount: 0
            };
        }

        const successful = orders.filter(order => order.status?.toLowerCase() === 'successful').length;
        const failed = orders.filter(order => order.status?.toLowerCase() === 'failed').length;
        const pending = orders.filter(order => order.status?.toLowerCase() === 'pending').length;

        const totalAmount = orders.reduce((sum, order) => sum + (parseFloat(order.amount || '0')), 0);
        const successfulAmount = orders
            .filter(order => order.status?.toLowerCase() === 'successful')
            .reduce((sum, order) => sum + (parseFloat(order.amount || '0')), 0);

        return {
            total: orders.length,
            successful,
            failed,
            pending,
            successfulPercentage: orders.length > 0 ? ((successful / orders.length) * 100).toFixed(1) : '0',
            failedPercentage: orders.length > 0 ? ((failed / orders.length) * 100).toFixed(1) : '0',
            pendingPercentage: orders.length > 0 ? ((pending / orders.length) * 100).toFixed(1) : '0',
            totalAmount,
            successfulAmount
        };
    };

    const stats = getPaymentOrderStats();

    const getOrderStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'successful':
                return 'text-green-600';
            case 'failed':
                return 'text-red-600';
            case 'pending':
                return 'text-yellow-600';
            default:
                return 'text-gray-600';
        }
    };

    return (
        <div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Payment Order ID</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Date</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                         <TableRow><TableCell colSpan={4} className="text-center">Loading payment orders...</TableCell></TableRow>
                    ) : orders.length > 0 ? (
                        orders.map((order: any) => (
                            <TableRow key={order.id || order.payment_order_id}>
                                <TableCell>
                                    <button
                                        onClick={() => handlePaymentOrderClick(order.id || order.payment_order_id)}
                                        className="text-blue-600 hover:text-blue-800 hover:underline font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
                                        title="Click to view payment order details"
                                    >
                                        #{order.id || order.payment_order_id}
                                    </button>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={order.status?.toLowerCase() === 'successful' ? 'default' : 'secondary'}>
                                        {order.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="font-medium">
                                    ₹{parseFloat(order.amount || '0').toFixed(2)}
                                </TableCell>
                                <TableCell>{new Date(order.created_at).toLocaleString()}</TableCell>
                            </TableRow>
                        ))
                    ) : (
                         <TableRow><TableCell colSpan={4} className="text-center">No payment orders found.</TableCell></TableRow>
                    )}
                </TableBody>
            </Table>

            {/* Payment Order Statistics Summary */}
            <div className="mt-4 border-t bg-gray-50 p-4 rounded-lg">
                <div className="space-y-4">
                    <h3 className="font-semibold text-sm text-gray-700 uppercase tracking-wider">Payment Order Summary</h3>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {/* Total Payment Orders */}
                        <div className="text-center p-3 bg-white rounded-lg border">
                            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                            <div className="text-xs text-gray-500 font-medium">Total Orders</div>
                        </div>

                        {/* Successful Orders */}
                        <div className="text-center p-3 bg-white rounded-lg border">
                            <div className="text-2xl font-bold text-green-600">{stats.successful}</div>
                            <div className="text-xs text-gray-500 font-medium">Successful ({stats.successfulPercentage}%)</div>
                        </div>

                        {/* Failed Orders */}
                        <div className="text-center p-3 bg-white rounded-lg border">
                            <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
                            <div className="text-xs text-gray-500 font-medium">Failed ({stats.failedPercentage}%)</div>
                        </div>

                        {/* Pending Orders */}
                        <div className="text-center p-3 bg-white rounded-lg border">
                            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                            <div className="text-xs text-gray-500 font-medium">Pending ({stats.pendingPercentage}%)</div>
                        </div>
                    </div>

                    {/* Amount Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-white rounded-lg border">
                            <div className="text-2xl font-bold text-blue-600">
                                ₹{stats.totalAmount.toFixed(2)}
                            </div>
                            <div className="text-xs text-gray-500 font-medium">Total Amount (All Orders)</div>
                        </div>

                        <div className="text-center p-3 bg-white rounded-lg border">
                            <div className="text-2xl font-bold text-green-600">
                                ₹{stats.successfulAmount.toFixed(2)}
                            </div>
                            <div className="text-xs text-gray-500 font-medium">Amount from Successful Orders</div>
                        </div>
                    </div>

                    {/* Visual Status Bar */}
                    {stats.total > 0 && (
                        <div className="w-full bg-gray-200 rounded-full h-8 overflow-hidden flex">
                            {stats.successful > 0 && (
                                <div
                                    className="bg-green-500 h-full flex items-center justify-center text-white text-xs font-medium"
                                    style={{ width: `${stats.successfulPercentage}%` }}
                                >
                                    {stats.successfulPercentage}%
                                </div>
                            )}
                            {stats.failed > 0 && (
                                <div
                                    className="bg-red-500 h-full flex items-center justify-center text-white text-xs font-medium"
                                    style={{ width: `${stats.failedPercentage}%` }}
                                >
                                    {stats.failedPercentage}%
                                </div>
                            )}
                            {stats.pending > 0 && (
                                <div
                                    className="bg-yellow-500 h-full flex items-center justify-center text-white text-xs font-medium"
                                    style={{ width: `${stats.pendingPercentage}%` }}
                                >
                                    {stats.pendingPercentage}%
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- Collapsible Section Component ---
const CollapsibleSection = ({ title, icon, children, defaultOpen = false }: {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    defaultOpen?: boolean;
}) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <Card className="mt-6">
            <CardHeader
                className="cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setIsOpen(!isOpen)}
            >
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {icon}
                        {title}
                    </div>
                    {isOpen ? (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    ) : (
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    )}
                </CardTitle>
            </CardHeader>
            {isOpen && (
                <CardContent>
                    {children}
                </CardContent>
            )}
        </Card>
    );
};



const WalletBalance = ({ customerId }: { customerId: number }) => {
    const [balanceData, setBalanceData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const notify = useNotify();

    useEffect(() => {
        if (!customerId) return;
        setIsLoading(true);
        httpClient(`${API_URL}/api/v1/customers/${customerId}/wallet/balance`)
            .then(({ json }) => setBalanceData(json))
            .catch(() => notify('Could not load wallet balance.', { type: 'warning' }))
            .finally(() => setIsLoading(false));
    }, [customerId, notify]);

    const formatCurrency = (value: string | number | undefined) => parseFloat(String(value || '0')).toFixed(2);
    
    if (isLoading) return <p>Loading balance...</p>;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center p-4 border rounded-lg bg-background mb-6">
            <div>
                <p className="text-sm text-muted-foreground">Real Cash</p>
                <p className="text-2xl font-bold">₹{formatCurrency(balanceData?.real_cash)}</p>
            </div>
            <div>
                <p className="text-sm text-muted-foreground">Virtual Cash</p>
                <p className="text-2xl font-bold">₹{formatCurrency(balanceData?.virtual_cash)}</p>
            </div>
            <div className="border-l-0 md:border-l pl-0 md:pl-4">
                <p className="text-sm font-bold text-primary">Total Balance</p>
                <p className="text-2xl font-bold text-primary">₹{formatCurrency(balanceData?.cumulative_sum)}</p>
            </div>
        </div>
    );
};

const UpdateProfileForm = ({ profile, onSave, onCancel, saving }: { profile: any; onSave: (data: any) => void; onCancel: () => void; saving: boolean; }) => {
    const [name, setName] = useState('');
    const [dob, setDob] = useState('');
    const [tob, setTob] = useState('');
    const [birthCity, setBirthCity] = useState('');
    const [birthCountry, setBirthCountry] = useState('');
    const [preferredLanguage, setPreferredLanguage] = useState('');
    const [zodiacSign, setZodiacSign] = useState('');
    

    // This effect pre-fills the form when the component loads with profile data
    useEffect(() => {
        if (profile) {
            setName(profile.name || '');
            // The <input type="date"> needs the date in "YYYY-MM-DD" format.
            setDob(profile.dob ? new Date(profile.dob).toISOString().split('T')[0] : '');
            setTob(profile.tob || '');
            setBirthCity(profile.birth_city || '');
            setBirthCountry(profile.birth_country || '');
            setPreferredLanguage(profile.preferred_language || '');
            setZodiacSign(profile.zodiac_sign || '');
        }
    }, [profile]);

    const handleSubmit = (event: FormEvent) => {
        event.preventDefault();
        onSave({ 
            name, 
            dob: dob || null,
            tob: tob || null,
            birth_city: birthCity,
            birth_country: birthCountry,
            preferred_language: preferredLanguage,
            zodiac_sign: zodiacSign,
        });
    };
    
    return (
       <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 p-4">
            <div className="md:col-span-2">
                <label className="text-sm font-medium">Full Name *</label>
                <input value={name} onChange={e => setName(e.target.value)} required className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </div>
            <div>
                <label className="text-sm font-medium">Date of Birth</label>
                <input type="date" value={dob} onChange={e => setDob(e.target.value)} className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </div>
            <div>
                <label className="text-sm font-medium">Time of Birth</label>
                <input type="time" value={tob} onChange={e => setTob(e.target.value)} className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </div>
            <div className="md:col-span-2">
                <label className="text-sm font-medium">Birth City</label>
                <input value={birthCity} onChange={e => setBirthCity(e.target.value)} className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </div>
            <div className="md:col-span-2">
                <label className="text-sm font-medium">Birth Country</label>
                <input value={birthCountry} onChange={e => setBirthCountry(e.target.value)} className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </div>
            <div className="md:col-span-2">
                <label className="text-sm font-medium">Preferred Language</label>
                <input value={preferredLanguage} onChange={e => setPreferredLanguage(e.target.value)} className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </div>
            <div className="md:col-span-2">
                <label className="text-sm font-medium">Zodiac Sign</label>
                <input value={zodiacSign} onChange={e => setZodiacSign(e.target.value)} className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </div>
            <div className="md:col-span-2 flex justify-end gap-2 mt-4">
                <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
                <Button type="submit" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                </Button>
            </div>
        </form>
    );
}

// --- Transactions Component (fetches its own data) ---
const WalletTransactions = ({ customerId }: { customerId: number }) => {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!customerId) return;
        setIsLoading(true);
        httpClient(`${API_URL}/api/v1/customers/${customerId}/wallet/transactions`)
            // CHANGED: Reads from the 'items' array in your API response
            .then(({ json }) => setTransactions(json.items || []))
            .finally(() => setIsLoading(false));
    }, [customerId]);

    // Helper function to make the transaction type look nice
    const getTransactionStyle = (type: string) => {
        switch (type.toUpperCase()) {
            case 'ADD':
                return { text: 'Credit', variant: 'default' as const, color: 'text-green-600' };
            // Add other types like 'DEDUCT', 'SUBTRACT', 'SPEND' here
            case 'DEDUCT':
            case 'SPEND':
                return { text: 'Debit', variant: 'destructive' as const, color: 'text-red-600' };
            default:
                return { text: type, variant: 'secondary' as const, color: 'text-gray-600' };
        }
    };

    return (
        <div className="mt-6">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
                <History className="h-4 w-4 text-muted-foreground" />
                Transaction History
            </h3>
            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Details</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow><TableCell colSpan={3} className="text-center">Loading transactions...</TableCell></TableRow>
                        ) : transactions.length > 0 ? (
                            transactions.map((tx: any) => {
                                const style = getTransactionStyle(tx.type);
                                return (
                                    <TableRow key={tx.transaction_id}>
                                        <TableCell>
                                            {/* Show the descriptive comment */}
                                            <p className="font-medium">{tx.comment}</p>
                                            {/* Show the date underneath */}
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(tx.created_at).toLocaleString()}
                                            </p>
                                        </TableCell>
                                        <TableCell>
                                            {/* Show a colored badge for the type */}
                                            <Badge variant={style.variant}>{style.text}</Badge>
                                        </TableCell>
                                        <TableCell className={`text-right font-medium ${style.color}`}>
                                            {/* Add a +/- sign and format the amount */}
                                            {style.text === 'Credit' ? '+' : '-'} ₹{parseFloat(tx.amount).toFixed(2)}
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        ) : (
                            <TableRow><TableCell colSpan={3} className="text-center">No transactions found.</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};

// --- Orders Component (fetches its own data) ---
const CustomerOrders = ({ customerId }: { customerId: number }) => {
    const [orders, setOrders] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (!customerId) return;
        setIsLoading(true);
        httpClient(`${API_URL}/api/v1/customers/${customerId}/orders`)
            .then(({ json }) => setOrders(json.items || []))
            .finally(() => setIsLoading(false));
    }, [customerId]);

    const handleOrderClick = (orderId: number) => {
        // Store the customer_id for the show page to use
        localStorage.setItem('current_customer_id', customerId.toString());
        // Navigate to the consultation order show page
        navigate(`/consultation-orders/${orderId}/show`);
    };

    // Calculate order statistics
    const getOrderStats = () => {
        if (orders.length === 0) {
            return {
                total: 0,
                completed: 0,
                cancelled: 0,
                pending: 0,
                completedPercentage: 0,
                cancelledPercentage: 0,
                totalRevenue: 0,
                completedRevenue: 0
            };
        }

        const completed = orders.filter(order => order.status?.toLowerCase() === 'completed').length;
        const cancelled = orders.filter(order => order.status?.toLowerCase() === 'cancelled').length;
        const pending = orders.filter(order =>
            order.status?.toLowerCase() !== 'completed' &&
            order.status?.toLowerCase() !== 'cancelled'
        ).length;

        const totalRevenue = orders.reduce((sum, order) => sum + (order.final_amount || 0), 0);
        const completedRevenue = orders
            .filter(order => order.status?.toLowerCase() === 'completed')
            .reduce((sum, order) => sum + (order.final_amount || 0), 0);

        return {
            total: orders.length,
            completed,
            cancelled,
            pending,
            completedPercentage: orders.length > 0 ? ((completed / orders.length) * 100).toFixed(1) : '0',
            cancelledPercentage: orders.length > 0 ? ((cancelled / orders.length) * 100).toFixed(1) : '0',
            totalRevenue,
            completedRevenue
        };
    };

    const stats = getOrderStats();

    return (
        <div>
            <Table>
                <TableHeader><TableRow><TableHead>Order ID</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead></TableRow></TableHeader>
                <TableBody>
                    {isLoading ? (
                         <TableRow><TableCell colSpan={3} className="text-center">Loading orders...</TableCell></TableRow>
                    ) : orders.length > 0 ? (
                        orders.map((order: any) => (
                            <TableRow key={order.order_id}>
                                <TableCell>
                                    <button
                                        onClick={() => handleOrderClick(order.order_id)}
                                        className="text-blue-600 hover:text-blue-800 hover:underline font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
                                        title="Click to view order details"
                                    >
                                        #{order.order_id}
                                    </button>
                                </TableCell>
                                <TableCell><Badge>{order.status}</Badge></TableCell>
                                <TableCell>{new Date(order.created_at).toLocaleString()}</TableCell>
                            </TableRow>
                        ))
                    ) : (
                         <TableRow><TableCell colSpan={3} className="text-center">No orders found.</TableCell></TableRow>
                    )}
                </TableBody>
            </Table>

            {/* Order Statistics Summary */}
            <div className="mt-4 border-t bg-gray-50 p-4 rounded-lg">
                <div className="space-y-4">
                    <h3 className="font-semibold text-sm text-gray-700 uppercase tracking-wider">Order Summary</h3>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {/* Total Orders */}
                        <div className="text-center p-3 bg-white rounded-lg border">
                            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                            <div className="text-xs text-gray-500 font-medium">Total Orders</div>
                        </div>

                        {/* Completed Orders */}
                        <div className="text-center p-3 bg-white rounded-lg border">
                            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
                            <div className="text-xs text-gray-500 font-medium">Completed ({stats.completedPercentage}%)</div>
                        </div>

                        {/* Cancelled Orders */}
                        <div className="text-center p-3 bg-white rounded-lg border">
                            <div className="text-2xl font-bold text-red-600">{stats.cancelled}</div>
                            <div className="text-xs text-gray-500 font-medium">Cancelled ({stats.cancelledPercentage}%)</div>
                        </div>

                        {/* Pending Orders */}
                        <div className="text-center p-3 bg-white rounded-lg border">
                            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                            <div className="text-xs text-gray-500 font-medium">Other Status</div>
                        </div>
                    </div>

                    {/* Revenue Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-white rounded-lg border">
                            <div className="text-2xl font-bold text-blue-600">
                                ₹{stats.totalRevenue.toFixed(2)}
                            </div>
                            <div className="text-xs text-gray-500 font-medium">Total Revenue (All Orders)</div>
                        </div>

                        <div className="text-center p-3 bg-white rounded-lg border">
                            <div className="text-2xl font-bold text-green-600">
                                ₹{stats.completedRevenue.toFixed(2)}
                            </div>
                            <div className="text-xs text-gray-500 font-medium">Revenue from Completed Orders</div>
                        </div>
                    </div>

                    {/* Visual Status Bar */}
                    {stats.total > 0 && (
                        <div className="w-full bg-gray-200 rounded-full h-8 overflow-hidden flex">
                            {stats.completed > 0 && (
                                <div
                                    className="bg-green-500 h-full flex items-center justify-center text-white text-xs font-medium"
                                    style={{ width: `${stats.completedPercentage}%` }}
                                >
                                    {stats.completedPercentage}%
                                </div>
                            )}
                            {stats.cancelled > 0 && (
                                <div
                                    className="bg-red-500 h-full flex items-center justify-center text-white text-xs font-medium"
                                    style={{ width: `${stats.cancelledPercentage}%` }}
                                >
                                    {stats.cancelledPercentage}%
                                </div>
                            )}
                            {stats.pending > 0 && (
                                <div
                                    className="bg-yellow-500 h-full flex items-center justify-center text-white text-xs font-medium"
                                    style={{ width: `${(100 - parseFloat(String(stats.completedPercentage)) - parseFloat(String(stats.cancelledPercentage))).toFixed(1)}%` }}
                                >
                                    {(100 - parseFloat(String(stats.completedPercentage)) - parseFloat(String(stats.cancelledPercentage))).toFixed(1)}%
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );  
};

const CustomerShowView = () => {
    const record = useRecordContext();

    // The component will now only render when 'record' is available.
    if (!record) return null;

    const customerIdAsNumber = Number(record.id);

    return (
        <div className="flex flex-col gap-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                        <User className="h-6 w-6 text-muted-foreground" />
                        Customer Overview
                    </CardTitle>
                </CardHeader>
                <CardContent>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-4 text-sm p-4">

                         <div>
                             <p className="font-semibold text-muted-foreground">Primary Phone</p>
                             <TextField source="phone" className="text-base" emptyText="N/A"/>
                         </div>

                         <div>
                            <p className="font-semibold text-muted-foreground">Customer ID</p>
                            <TextField source="id" className="text-base" />
                         </div>
                         <div>
                            <p className="font-semibold text-muted-foreground">Customer Since</p>
                            <DateField source="created_at" showTime className="text-base" />
                         </div>
                      </div>
                </CardContent>
            </Card>

            <ProfilesGrid />

            {/* Collapsible Wallet Section */}
            <CollapsibleSection
                title="Wallet"
                icon={<CreditCard className="h-5 w-5" />}
                defaultOpen={false}
            >
                <WalletBalance customerId={customerIdAsNumber} />
                <WalletTransactions customerId={customerIdAsNumber} />
            </CollapsibleSection>

            {/* Collapsible Consultation Orders Section */}
            <CollapsibleSection
                title="Consultation Orders"
                icon={<ShoppingCart className="h-5 w-5" />}
                defaultOpen={false}
            >
                <CustomerOrders customerId={customerIdAsNumber} />
            </CollapsibleSection>

            {/* Collapsible Payment Orders Section */}
            <CollapsibleSection
                title="Payment Orders"
                icon={<CreditCard className="h-5 w-5" />}
                defaultOpen={false}
            >
                <CustomerPaymentOrders customerId={customerIdAsNumber} />
            </CollapsibleSection>
        </div>
    );
};

export const CustomerShow = () => (
    <Show>
        <CustomerShowView />
    </Show>
);