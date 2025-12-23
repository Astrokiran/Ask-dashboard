import {
    List,
    Datagrid,
    TextField,
    DateField,
    ChipField,
    useNotify,
    useRefresh,
    TopToolbar,
    FilterForm,
    NumberInput,
    RaRecord,
    useDataProvider,
    useListContext,
    Loading,
} from 'react-admin';
import { useState, FormEvent, useEffect } from 'react';
import { httpClient } from '../dataProvider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';

const API_URL = process.env.REACT_APP_API_URL;

// Service Order Form
const ServiceOrderCreateForm = ({ onSave, saving }: { onSave: (data: any) => void; saving: boolean }) => {
    const [customerId, setCustomerId] = useState('');
    const [consultantId, setConsultantId] = useState('');
    const [serviceType, setServiceType] = useState('Astrology');

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        onSave({
            customerId: parseInt(customerId, 10),
            consultant_id: parseInt(consultantId, 10),
            service_type: serviceType,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer ID *</label>
                <input
                    type="number"
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter Customer ID"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Consultant ID *</label>
                <input
                    type="number"
                    value={consultantId}
                    onChange={(e) => setConsultantId(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter Consultant ID"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Service Type *</label>
                <select
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="Astrology">Astrology</option>
                    <option value="Consulting">Consulting</option>
                    <option value="Advisory">Advisory</option>
                </select>
            </div>
            <button
                type="submit"
                disabled={saving}
                className={`w-full py-2 px-4 rounded-md text-white font-medium ${
                    saving ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                } transition-colors`}
            >
                {saving ? 'Creating...' : 'Create Service Order'}
            </button>
        </form>
    );
};

// Payment Order Form
const PaymentOrderCreateForm = ({ onSave, saving }: { onSave: (data: any) => void; saving: boolean }) => {
    const [customerId, setCustomerId] = useState('');
    const [amount, setAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('UPI');

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        onSave({
            customerId: parseInt(customerId, 10),
            amount: (parseFloat(amount) * 100).toString(),
            payment_method: paymentMethod,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer ID *</label>
                <input
                    type="number"
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter Customer ID"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (e.g., 500) *</label>
                <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter Amount"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="UPI">UPI</option>
                    <option value="Card">Card</option>
                    <option value="NetBanking">Net Banking</option>
                </select>
            </div>
            <button
                type="submit"
                disabled={saving}
                className={`w-full py-2 px-4 rounded-md text-white font-medium ${
                    saving ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                } transition-colors`}
            >
                {saving ? 'Creating...' : 'Create Payment Order'}
            </button>
        </form>
    );
};

// Order Filters
const orderFilters = [<NumberInput label="Customer ID" source="customerId" alwaysOn />];

// List Actions Component
const ListActions = () => {
    const notify = useNotify();
    const refresh = useRefresh();
    const [serviceOrderOpen, setServiceOrderOpen] = useState(false);
    const [paymentOrderOpen, setPaymentOrderOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const handleSaveServiceOrder = (data: any) => {
        const { customerId, ...payload } = data;
        setIsSaving(true);
        httpClient(`${API_URL}/api/v1/customers/${customerId}/orders`, {
            method: 'POST',
            body: JSON.stringify(payload),
        })
            .then(() => {
                notify('Service Order Created');
                setServiceOrderOpen(false);
                refresh();
            })
            .catch((err) => notify(`Error: ${err.message}`, { type: 'error' }))
            .finally(() => setIsSaving(false));
    };

    const handleSavePaymentOrder = (data: any) => {
        const { customerId, ...payload } = data;
        setIsSaving(true);
        httpClient(`${API_URL}/api/v1/customers/${customerId}/wallet/payment-orders`, {
            method: 'POST',
            body: JSON.stringify(payload),
        })
            .then(() => {
                notify('Payment Order Created');
                setPaymentOrderOpen(false);
            })
            .catch((err) => notify(`Error: ${err.message}`, { type: 'error' }))
            .finally(() => setIsSaving(false));
    };

    return (
        <TopToolbar className="flex items-center space-x-4">
            <FilterForm filters={orderFilters} />
            <Dialog open={serviceOrderOpen} onOpenChange={setServiceOrderOpen}>
                <DialogTrigger asChild>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                        Create Service Order
                    </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Create New Service Order</DialogTitle>
                    </DialogHeader>
                    <ServiceOrderCreateForm onSave={handleSaveServiceOrder} saving={isSaving} />
                </DialogContent>
            </Dialog>
            <Dialog open={paymentOrderOpen} onOpenChange={setPaymentOrderOpen}>
                <DialogTrigger asChild>
                    <button className="px-4 py-2 bg-white text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 transition-colors">
                        Create Payment Order
                    </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Create New Payment Order</DialogTitle>
                    </DialogHeader>
                    <PaymentOrderCreateForm onSave={handleSavePaymentOrder} saving={isSaving} />
                </DialogContent>
            </Dialog>
        </TopToolbar>
    );
};

// Order Actions Component
const OrderActions = ({ record }: { record?: RaRecord }) => {
    const notify = useNotify();
    const refresh = useRefresh();
    const dataProvider = useDataProvider();
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    if (!record) return null;

    const handleAction = (action: string, data?: any) => {
        setIsLoading(true);
        dataProvider
            .custom('action', 'orders', {
                customerId: record.user_id,
                orderId: record.order_id,
                action,
                data,
            })
            .then(() => {
                notify(`Order action '${action}' successful!`);
                refresh();
                setIsOpen(false);
            })
            .catch((error: any) => {
                notify(`Error: ${error.message || 'An error occurred'}`, { type: 'error' });
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    const handleCancel = () => {
        if (window.confirm('Are you sure you want to cancel this order?')) {
            handleAction('cancel');
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                disabled={isLoading}
                className="p-2 text-gray-600 hover:text-gray-900"
            >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                    />
                </svg>
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 ring-1 ring-black ring-opacity-5">
                    <div className="py-1">
                        <button
                            onClick={() => handleAction('confirm-rates')}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                            Confirm Rates
                        </button>
                        <button
                            onClick={() => handleAction('start')}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                            Start Order
                        </button>
                        <button
                            onClick={handleCancel}
                            className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                        >
                            Cancel Order
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

// Custom Order List Component
const OrderListContent = () => {
    const { data, isLoading, filterValues } = useListContext();

    if (isLoading) return <Loading />;

    return (
        <>
            <Datagrid data={data || []} rowClick="edit">
                <TextField source="order_id" label="Order ID" />
                <TextField source="user_id" label="Customer ID" />
                <ChipField source="status" />
                <TextField source="service_type" label="Service Type" />
                <DateField source="created_at" label="Created At" showTime />
                <OrderActions />
            </Datagrid>
            {!data?.length && (
                <div className="p-4 text-gray-600">
                    <p>No orders yet. Please enter a Customer ID to view existing orders or create a new order.</p>
                    {filterValues.customerId && <p>Customer ID {filterValues.customerId} has no orders.</p>}
                </div>
            )}
        </>
    );
};

export const OrderList = () => (
    <List actions={<ListActions />} empty={false}>
        <OrderListContent />
    </List>
);