import { DataProvider, fetchUtils } from 'react-admin';
import { guides } from './guideMockData';
import queryString from 'query-string';

const API_URL = 'http://localhost:8083';

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

    const apiKey = 'dummy_service_secret'; 
    (options.headers as Headers).set('X-Internal-API-Key', apiKey);

    if (options.body) { 
        (options.headers as Headers).set('Content-Type', 'application/json');
    }

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

const orderAction = (action: string, customerId: number, orderId: number, data?: any) => {
    const url = `${API_URL}/api/pixel-admin/api/v1/customers/${customerId}/orders/${orderId}/${action}`;
    return httpClient(url, {
        method: 'POST',
        body: data ? JSON.stringify(data) : undefined,
    });
};

interface Guide {
    id: number;
    // Add any other fields you consistently use
    status: string;
    [key: string]: any; // Allows for other properties
}


const transformCustomer = (customer: any) => {
    if (!customer) return null;

    // Find the primary profile to get the customer's main name
    const primaryProfile = customer.profile?.profiles?.find((p: any) => p.is_primary);
    
    return {
      ...customer, // Keep all original data for the show view
      id: customer.id, // Ensure react-admin has the id
      // Set a top-level 'name' for easy display in lists
      name: primaryProfile?.full_name || `Customer #${customer.id}`,
      // Create a formatted phone number
      phone: `${customer.country_code} ${customer.phone_number}`,
    };
};

const transformGuide = (guide: any) => {
    if (!guide) return null;
    return {
        id: guide.ID, // Map uppercase 'ID' to lowercase 'id'
        x_auth_id: guide.XAuthID,
        full_name: guide.FullName,
        email: guide.Email,
        phone_number: guide.PhoneNumber,
        created_at: guide.CreatedAt,
        profile_picture_url: guide.ProfilePictureURL,
        chat_enabled: guide.ChatEnabled,
        voice_enabled: guide.VoiceEnabled,
        video_enabled: guide.VideoEnabled,
        is_online: guide.is_online,
        voice_channel_name: guide.VoiceChannelName,
        video_channel_name: guide.VideoChannelName,
        years_of_experience: guide.YearsOfExperience,
        is_busy: guide.is_busy,
        skills: guide.skills,
        languages: guide.languages,
        rating: guide.rating,
        number_of_consultation: guide.number_of_consultation,
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
        if (resource === 'admin-users') {
            const { page, perPage } = params.pagination || { page: 1, perPage: 10 };
            const { field, order } = params.sort || { field: 'id', order: 'ASC' };
            
            // Handle filters from the AdminUserList component
            const query = {
                ...fetchUtils.flattenObject(params.filter),
                _sort: field,
                _order: order,
                page: page,
                per_page: perPage,
            };
            
            const url = `${API_URL}/api/pixel-admin/api/v1/admin-users/?${queryString.stringify(query)}`;
            const { json } = await httpClient(url);

            return {
                data: json.admin_users || [],
                total: json.total || 0,
            };
        }
        if (resource === 'guides') {
            const { page, perPage } = params.pagination || { page: 1, perPage: 10 };
            const { field, order } = params.sort || { field: 'id', order: 'ASC' };
            const filter = params.filter;

            const url = `http://localhost:8083/api/pixel-admin/api/v1/guides/`;
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
                const { page, perPage } = params.pagination || { page: 1, perPage: 10 };
                // This URL should already be correct from the previous fix
                const url = `${API_URL}/api/pixel-admin/api/v1/guides/pending-verifications?page=${page}&per_page=${perPage}`;
                
                const { json } = await httpClient(url);

                // --- START: CORRECTED LOGIC ---

                // The API response nests the grouped data inside a 'data' property.
                const groupedData = json.data || {};
                let flattenedData: any[] = [];

                // Dynamically loop through all statuses returned by the API (e.g., ACTIVE, KYC_PENDING)
                for (const status in groupedData) {
                    // Check to ensure we are not iterating over prototype properties
                    if (Object.prototype.hasOwnProperty.call(groupedData, status)) {
                        const guidesForStatus = groupedData[status] || [];
                        
                        // Add a 'status' field to each guide. This is crucial for grouping in the UI.
                        const taggedGuides = guidesForStatus.map((guide: any) => ({
                            ...guide,
                            status: status 
                        }));

                        // Add the guides for this status to our final flat array
                        flattenedData = flattenedData.concat(taggedGuides);
                    }
                }
                
                // Return the final flat array and its total count, as react-admin expects.
                return {
                    data: flattenedData,
                    total: flattenedData.length,
                };
                // --- END: CORRECTED LOGIC ---
            }
        
            if (resource === 'customers') {
                const { page, perPage } = params.pagination || { page: 1, perPage: 10 };
                const { q: searchTerm } = params.filter;
                
                // CHANGED: Point to the correct admin-service list endpoint
                const url = `${API_URL}/api/pixel-admin/api/v1/customers/?page=${page}&per_page=${perPage}${searchTerm ? `&search=${searchTerm}` : ''}`;
                const { json } = await httpClient(url);

                const processedCustomers = json.customers.map(transformCustomer);
                let total = json.total;
                const receivedCount = json.customers?.length || 0;

                // If the API incorrectly reports 0 but we received customers,
                // override the total to at least show the current page.
                if (total === 0 && receivedCount > 0) {
                    total = receivedCount;
                }
                    
                return {
                    data: processedCustomers,
                    // NOTE: Your API should return the TOTAL number of customers in the database here.
                    // The sample response had 'total: 0', which is likely a bug.
                    // React Admin needs the true total for pagination to work correctly.
                    total: total,
                };

                
        }
        if (resource === 'consultations') {
            const { page, perPage } = params.pagination || { page: 1, perPage: 10 };
            // Destructure the filters for cleaner access
            const { q, status, guide_id, customer_id,id } = params.filter;

            const query = {
                page: page,
                pageSize: perPage,
                // Add the filters to the query object.
                // queryString will ignore any that are null or undefined.
                query: q, 
                status: status,
                guide_id: guide_id,
                customer_id: customer_id,
                id: id,
            };

            // --- THIS IS THE FIX ---
            // Use queryString.stringify to correctly append the filters to the URL
            const url = `${API_URL}/api/pixel-admin/api/v1/consultations?${queryString.stringify(query)}`;
            
            const { json } = await httpClient(url);

            return {
                data: json.data.data,
                total: json.data.pagination.total_items,
            };
        }

     
        if (resource === 'orders') {
            // const { page, perPage } = params.pagination || { page: 1, perPage: 10 };
            const customerId = params.filter.customerId;

            // Only fetch if a customerId is provided in the filter
            if (!customerId) {
                return { data: [], total: 0 };
            }

            const url = `${API_URL}/api/pixel-admin/api/v1/customers/${customerId}/orders/`;
            const { json } = await httpClient(url);
            
            // The API response for orders is nested under 'items'
            const orders = json.items || [];
            
            return {
                data: orders.map((order: any) => ({ ...order, id: order.order_id })),
                total: json.pagination?.total_items || 0,
            };
        }
            throw new Error(`Unsupported resource for getList: ${resource}`);

    },

     create: async (resource, params) => {
        if (resource === 'guides') {
            // --- FIX #2: Remove the incorrect payload transformation ---
            // The form data already has the correct field names like "full_name".
            const apiPayload = {
                ...params.data,
                years_of_experience: parseInt(params.data.years_of_experience, 10) || 0
            };

            const { json } = await httpClient(`${API_URL}/api/pixel-admin/api/v1/guides/`, {
                method: 'POST',
                body: JSON.stringify(apiPayload)
            });

            return { 
                data: { ...json, id: json.guide_id } 
            };
        }

        if (resource === 'customers') {
            // 1. The form data now directly matches the API payload.
            const apiPayload = {
                area_code: params.data.area_code,
                phone_number: params.data.phone_number,
            };
            
            // 2. Make the single API call to your admin-service.
            const { json } = await httpClient(`${API_URL}/api/pixel-admin/api/v1/customers/`, {
                method: 'POST',
                body: JSON.stringify(apiPayload),
            });
            
            // 3. Return the data in the format React Admin expects.
            return { 
                data: { ...json, id: json.customer_id } 
            };
        }
            
        if (resource === 'orders') {
            const { customerId, ...rest } = params.data;
            if (!customerId) throw new Error('Customer ID is required to create an order.');

            const url = `${API_URL}/api/pixel-admin/api/v1/customers/${customerId}/orders/`;
            const { json } = await httpClient(url, {
                method: 'POST',
                body: JSON.stringify(rest),
            });
            return { data: { ...json, id: json.order_id } };
        }
        if (resource === 'admin-users') {
            const url = `${API_URL}/api/pixel-admin/api/v1/admin-users/`;
            const { json } = await httpClient(url, {
                method: 'POST',
                body: JSON.stringify(params.data),
            });
            return { data: { ...json, id: json.id } };
        }
        
        throw new Error(`Unsupported resource: ${resource}`);
    },
    update: async (resource, params) => {
         if (resource === 'guides') {
            const url = `${API_URL}/api/pixel-admin/api/v1/guides/${params.id}`;
            const { json } = await httpClient(url, {
                method: 'PATCH',
                body: JSON.stringify(params.data),
            });
            return { data: transformGuide(json) };        }
        if (resource === 'admin-users') {
             const url = `${API_URL}/api/pixel-admin/api/v1/admin-users/${params.id}`;
             const { json } = await httpClient(url, {
                method: 'PATCH', // PATCH is suitable for updating parts of a resource
                body: JSON.stringify(params.data),
             });
             return { data: { ...json, id: json.id } };
        }
       

        return Promise.resolve({ data: { ...params.data, id: params.id } }) as any;
        
    },

    getOne: async (resource, params) => {

        console.log(`getOne triggered for resource: ${resource}, id: ${params.id}`);

        if (resource === 'guides') {
        const url = `${API_URL}/api/pixel-admin/api/v1/guides/${params.id}`;
        const { json } = await httpClient(url);

        // Check if the API returned any data at all
        if (!json) {
            throw new Error('API returned no data for the guide');
        }

        // --- FIX: Transform the API data to what react-admin expects ---
        const transformedData = {
            id: json.ID, // Map uppercase 'ID' to lowercase 'id' (Required)
            x_auth_id: json.XAuthID,
            full_name: json.FullName,
            email: json.Email,
            phone_number: json.PhoneNumber,
            created_at: json.CreatedAt,
            profile_picture_url: json.ProfilePictureURL,
            chat_enabled: json.ChatEnabled,
            voice_enabled: json.VoiceEnabled,
            video_enabled: json.VideoEnabled,
            is_online: json.is_online,
            voice_channel_name: json.VoiceChannelName,
            video_channel_name: json.VideoChannelName,
            years_of_experience: json.YearsOfExperience,
            is_busy: json.is_busy,
            skills: json.skills,
            languages: json.languages,
            rating: json.rating,
            number_of_consultation: json.number_of_consultation,
        };
        
        return { data: transformedData };
        }
        if (resource === 'customers') {
            // CHANGED: Fetch a single customer from the API
            const url = `${API_URL}/api/pixel-admin/api/v1/customers/${params.id}`;
            const { json } = await httpClient(url);
            
            // Use the same transformation for consistency
            const transformedData = transformCustomer(json);

            if (!transformedData) {
                throw new Error('Customer not found');
            }
            return { data: transformedData };
        }
        if (resource === 'consultations') {
            // This assumes you will create a `getOne` endpoint in your Go service
            const url = `${API_URL}/api/pixel-admin/api/v1/consultations/${params.id}`;
            const { json } = await httpClient(url);
            
            // Assuming the getOne response is { success: true, data: { ...consultation } }
            return {
                data: json.data,
            };
        }

        console.error(`getOne not implemented for resource: ${resource}`);
        return Promise.reject(new Error(`Unsupported resource: ${resource}`));
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
    
    custom: async (type: string, resource: string, params: any) => {
        if (resource === 'orders' && type === 'action') {
            const { customerId, orderId, action, data } = params;
            return orderAction(action, customerId, orderId, data);
        }
        throw new Error(`Unsupported custom action: ${type}`);
},

    getMany: async () => ({ data: [] }),
    getManyReference: async () => ({ data: [], total: 0 }),
    delete: async (resource, params) => ({ data: { id: params.id } as any }),
    deleteMany: async () => ({ data: [] }),
};