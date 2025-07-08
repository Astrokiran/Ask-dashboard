import { DataProvider, fetchUtils } from 'react-admin';
import { guides } from './guideMockData';

const API_URL = 'https://appdev.astrokiran.com';

const refreshToken = async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
        throw new Error('No refresh token found');
    }

    const request = new Request(`${API_URL}/auth/api/v1/auth/refresh`, {
        method: 'POST',
        body: JSON.stringify({ refresh_token: refreshToken }),
        headers: new Headers({ 'Content-Type': 'application/json' }),
    });

    const response = await fetch(request);
    if (!response.ok) {
        throw new Error('Failed to refresh token');
    }

    const data = await response.json();
    localStorage.setItem('access_token', data.access_token);
    if (data.refresh_token) {
        localStorage.setItem('refresh_token', data.refresh_token);
    }

    return data.access_token;
};

export const httpClient = async (url: string, options: fetchUtils.Options = {}) => {
    if (!options.headers) {
        options.headers = new Headers({ Accept: 'application/json' });
    }
    const token = localStorage.getItem('access_token');
    (options.headers as Headers).set('Authorization', `Bearer ${token}`);

    try {
        return await fetchUtils.fetchJson(url, options);
    } catch (error: any) {
        if (error.status === 401) {
            try {
                const newAccessToken = await refreshToken();
                (options.headers as Headers).set('Authorization', `Bearer ${newAccessToken}`);
                return await fetchUtils.fetchJson(url, options);
            } catch (refreshError) {
                throw error;
            }
        }
        throw error;
    }
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
    duration: number; 
    conversationDuration: number; 
    createdAt: Date;
}



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


const transformCustomer = (customer: any) => {
    if (!customer) return null; // Return null if customer is not found
    return {
        id: customer.id,
        name: customer.profile?.full_name || customer.profile?.name || `Customer #${customer.id}`,
        phone: `${customer.country_code} ${customer.phone_number}`,
        createdAt: customer.created_at,
        ...customer, // Include original data
    };
};

export const dataProvider: DataProvider = {
    getList: async (resource, params) => {
        if (resource === 'users') {
            const userString = localStorage.getItem('user');
            const user = userString ? JSON.parse(userString) : null;
            const data = user ? [user] : [];
            return { data, total: data.length };
        }
        if (resource === 'guides') {
            const { page, perPage } = params.pagination || { page: 1, perPage: 10 };
            const { field, order } = params.sort || { field: 'id', order: 'ASC' };
            const filter = params.filter;

            const url = `https://appdev.astrokiran.com/auth/api/v1/guide/all`;
            const { json } = await httpClient(url);
            
             let guides = (json.data.guides || []).map((guide: any) => ({
        ...guide,
        status: guide.online ? 'online' : 'offline',
                }));

            if (filter) {
            guides = guides.filter((guide: any) => {
                const searchMatch = filter.q
                    ? guide.full_name && guide.full_name.toLowerCase().includes(filter.q.toLowerCase())
                    : true;
                
                const statusMatch = (filter.online != null && filter.online !== '')
                    ? String(guide.online) === filter.online
                    : true;

                return searchMatch && statusMatch;
            });
        }
            guides.sort((a: any, b: any) => {
                    if (a[field] < b[field]) return order === 'ASC' ? -1 : 1;
                    if (a[field] > b[field]) return order === 'ASC' ? 1 : -1;
                    return 0;
                });
                
                const total = guides.length;
                const data = guides.slice((page - 1) * perPage, page * perPage);

                return { data, total };
            }

        if (resource === 'pending-verifications') {
            const url = `https://appdev.astrokiran.com/auth/api/v1/admin/guides/pending-verifications`;
            const { json } = await httpClient(url);
            
            const uploaded = (json.data.kyc_uploaded || []).map((guide: any) => ({
                ...guide,
                kyc_status: 'Uploaded', 
            }));

            const pending = (json.data.kyc_pending || []).map((guide: any) => ({
                ...guide,
                kyc_status: 'Pending',
            }));

            const data = [...uploaded, ...pending];

            return {
                data: data,
                total: data.length,
            };
        }
        if (resource === 'customers') {
            const { page, perPage } = params.pagination || { page: 1, perPage: 10 };
            const { q: searchTerm } = params.filter;

            const url = `https://appdev.astrokiran.com/auth/api/v1/customers/?page=${page}&limit=${perPage}`;
            const { json } = await httpClient(url);
            
            let processedCustomers = json.customers.map((customer: any) => ({
                id: customer.id,
                name: customer.profile?.full_name || customer.profile?.name || `Customer #${customer.id}`,
                
                phone: `${customer.country_code} ${customer.phone_number}`,
                createdAt: customer.created_at,
                ...customer 
            }));

            if (searchTerm) {
                processedCustomers = processedCustomers.filter((customer: any) =>
                    (customer.name && customer.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                    (customer.phone && customer.phone.toLowerCase().includes(searchTerm.toLowerCase()))
                );
            }

            return {
                data: processedCustomers,
                total: json.pagination.total_count, 
            };
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

            const apiPayload = {
                ...rest,
                full_name: name,
                years_of_experience: parseInt(experience, 10) || 0
            };

            const { json } = await httpClient(`${API_URL}/auth/api/v1/guide/register`, {
                method: 'POST',
                body: JSON.stringify(apiPayload)
            });

            return { data: { ...json, id: json.id || json.guide_id } };
        }
     
        throw new Error(`Unsupported resource: ${resource}`);
    },
    update: async (resource, params) => {
        if (resource === 'guides') {
            const guideIndex = guides.findIndex(g => g.id == params.id);

            if (guideIndex > -1) {
                const updatedGuide = {
                    ...guides[guideIndex],
                    ...params.data,
                };
                guides[guideIndex] = updatedGuide;
                
                return Promise.resolve({ data: updatedGuide }) as any;
            }
            return Promise.reject(new Error('Guide not found in mock data'));
        }
       

        return Promise.resolve({ data: { ...params.data, id: params.id } }) as any;
    },

    getOne: async (resource, params) => {

        console.log(`getOne triggered for resource: ${resource}, id: ${params.id}`);

        if (resource === 'guides') {
            const url = `${API_URL}/auth/api/v1/guide/all`;
            const { json } = await httpClient(url);
            const record = (json.data.guides || []).find((r: any) => r.id == params.id);
            
            if (!record) {
                throw new Error('Guide not found');
            }
            
            return { data: record };
        }
         if (resource === 'customers') {
            // 1. Fetch the entire list of customers from the base endpoint.
            const url = `${API_URL}/auth/api/v1/customers`;
            const { json } = await httpClient(url);

            // 2. Find the specific customer in the returned array using its ID.
            const customer = (json.customers || []).find((c: any) => String(c.id) === params.id);

            // 3. If not found, throw an error.
            if (!customer) {
                throw new Error('Customer not found in the fetched list.');
            }

            // 4. Transform the found customer and return it.
            return {
                data: transformCustomer(customer)
            };
        }
        
        throw new Error(`getOne is not implemented for resource: ${resource}`);
    },
    updateMany: async (resource, params) => {
    if (resource === 'guides') {
        const { ids, data } = params;
        
        ids.forEach(id => {
            const guideIndex = guides.findIndex(g => g.id == id);
            if (guideIndex > -1) {
                guides[guideIndex] = { ...guides[guideIndex], ...data };
            }
        });
        
        return Promise.resolve({ data: ids });
    }
    throw new Error(`Unsupported resource: ${resource}`);
},

    getMany: async () => ({ data: [] }),
    getManyReference: async () => ({ data: [], total: 0 }),
    delete: async (resource, params) => ({ data: { id: params.id } as any }),
    deleteMany: async () => ({ data: [] }),
};