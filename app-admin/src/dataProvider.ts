import { DataProvider, fetchUtils } from 'react-admin';

const API_URL = 'https://appdev.astrokiran.com';

export const httpClient = (url: string, options: fetchUtils.Options = {}) => {
    const headers = new Headers(options.headers);

    if (options.body) {
        headers.set('Content-Type', 'application/json');
    }

    const token = localStorage.getItem('access_token');
    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    const newOptions = { ...options, headers };
    
    return fetchUtils.fetchJson(url, newOptions);
};

interface Customer {
  id: number;
  name: string;
  phone: string;
  altPhone: string;
  createdAt: Date;
}

interface Order {
    id: number;
    customerId: number;
    customer: { name: string; phone: string; };
    status: string;
    consultationType: string;
    paymentUrl: string;
    activeConsultations: number;
}

interface User {
    id: number;
    fullName: string;
    email: string;
    avatar: string;
}
interface Consultation {
    id: string;
    guide: string;
    customer: {
        name: string;
        phone: string;
    };
    status: 'In Progress' | 'Customer Canceled' | 'Completed' | 'Short Duration';
    duration: number; // in minutes
    conversationDuration: number; // in seconds
    createdAt: Date;
}



// --- Dummy Data Setup ---
let customers: Customer[] = [
    { id: 1, name: 'John Doe', phone: '123-456-7890', altPhone: '098-765-4321', createdAt: new Date() },
    { id: 2, name: 'Jane Smith', phone: '555-555-5555', altPhone: '', createdAt: new Date() },
];

let orders: Order[] = [
    { id: 101, customerId: 1, customer: { name: 'John Doe', phone: '123-456-7890' }, status: 'Completed', consultationType: 'Astrology', paymentUrl: 'https://example.com/pay/101', activeConsultations: 0 },
    { id: 102, customerId: 2, customer: { name: 'Jane Smith', phone: '555-555-5555' }, status: 'Pending', consultationType: 'Palmistry', paymentUrl: 'https://example.com/pay/102', activeConsultations: 1 },
];

let consultations: Consultation[] = [
    {
        id: "CONS-18C44E87",
        guide: "Kalpana Tripathi",
        customer: { name: "Pintu Kumar Sah", phone: "8651769650" },
        status: "In Progress",
        duration: 5,
        conversationDuration: 0,
        createdAt: new Date("2025-07-03T01:00:00Z"),
    },
    {
        id: "CONS-22EFDF09",
        guide: "Kalpana Tripathi",
        customer: { name: "ravi sharma", phone: "9300555964" },
        status: "Customer Canceled",
        duration: 5,
        conversationDuration: 0,
        createdAt: new Date("2025-07-03T01:00:00Z"),
    },
    {
        id: "CONS-F570CBBB",
        guide: "Anjali",
        customer: { name: "Atul", phone: "7355557583" },
        status: "Completed",
        duration: 5,
        conversationDuration: 305,
        createdAt: new Date("2025-07-03T01:00:00Z"),
    },
    {
        id: "CONS-E99C6557",
        guide: "Kalpana Tripathi",
        customer: { name: "ravijaiswal1249", phone: "6307641249" },
        status: "Customer Canceled",
        duration: 5,
        conversationDuration: 0,
        createdAt: new Date("2025-07-03T01:00:00Z"),
    },
    {
        id: "CONS-AA75AF6E",
        guide: "Anjali",
        customer: { name: "Rajendra Singh Rana", phone: "7302944788" },
        status: "Completed",
        duration: 5,
        conversationDuration: 300,
        createdAt: new Date("2025-07-03T01:00:00Z"),
    },
];

export const dataProvider: DataProvider = {
    getList: async (resource, params) => {
        if (resource === 'users') {
            const userString = localStorage.getItem('user');
            const user = userString ? JSON.parse(userString) : null;
            const data = user ? [user] : [];
            return { data, total: data.length };
        }
        if (resource === 'guides') {
            const url = `${API_URL}/auth/api/v1/guide/all?mode=call`;
            const { json } = await httpClient(url);
            const guides = json.data.guides.map((guide: any) => ({
                ...guide, name: guide.full_name, avatar: guide.profile_picture_url, status: guide.online ? 'online' : 'offline',
            }));
            return { data: guides, total: json.data.total };
        }
        if (resource === 'customers') {
            return { data: customers, total: customers.length };
        }
        if (resource === 'orders') {
            return { data: orders, total: orders.length };
        }
        if (resource === 'consultations') {
            return { data: consultations, total:consultations.length}
        }
        throw new Error(`Unsupported resource: ${resource}`);
    },

    create: async (resource, params) => {
        if (resource === 'guides') {
            const { name, experience, ...rest } = params.data;
            const apiPayload = { ...rest, full_name: name, years_of_experience: experience };
            const { json } = await httpClient(`${API_URL}/auth/api/v1/guide/register`, { 
                method: 'POST', 
                body: JSON.stringify(apiPayload) 
            });
            return { data: { ...json, id: json.id || json.guide_id } };
        }
        if (resource === 'customers') {
            const newCustomer: Customer = {
                id: Math.max(0, ...customers.map(c => c.id)) + 1,
                name: params.data.name,
                phone: params.data.phone,
                altPhone: params.data.altPhone,
                createdAt: new Date(),
            };
            customers.push(newCustomer);
            return { data: newCustomer };
        }
        throw new Error(`Unsupported resource: ${resource}`);
    },

    getOne: async (resource, params) => {
        if (resource === 'guides') {
            const url = `${API_URL}/auth/api/v1/guide/${params.id}`;
            const { json } = await httpClient(url);
            return { data: { ...json.data, name: json.data.full_name } };
        }
        return { data: { id: params.id } as any };
    },
    getMany: async () => ({ data: [] }),
    getManyReference: async () => ({ data: [], total: 0 }),
    update: async (resource, params) => ({ data: params.data as any }),
    updateMany: async () => ({ data: [] }),
    delete: async (resource, params) => ({ data: { id: params.id } as any }),
    deleteMany: async () => ({ data: [] }),
};