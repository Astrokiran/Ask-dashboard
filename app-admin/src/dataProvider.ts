import { DataProvider, fetchUtils } from 'react-admin';
import { guides } from './guideMockData';
import queryString from 'query-string';


const API_URL = 'https://devvm.astrokiran.com/auth/api/pixel-admin'; 
console.log('API_URL:', API_URL); // Log the API URL to verify it's being read correctly
const AUTH_API_URL = process.env.NEXT_PUBLIC_AUTH_URL; // Base URL for your API

const refreshToken = async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
        throw new Error('No refresh token found');
    }

    const request = new Request(`${AUTH_API_URL}/refresh`, {
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
    const url = `${API_URL}/api/v1/customers/${customerId}/orders/${orderId}/${action}`;
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
        id: guide.ID || guide.id, // Map uppercase 'ID' to lowercase 'id' or use existing id
        x_auth_id: guide.XAuthID || guide.x_auth_id,
        full_name: guide.FullName || guide.full_name,
        email: guide.Email || guide.email,
        phone_number: guide.PhoneNumber || guide.phone_number,
        created_at: guide.CreatedAt || guide.created_at,
        profile_picture_url: guide.ProfilePictureURL || guide.profile_picture_url,
        chat_enabled: guide.ChatEnabled !== undefined ? guide.ChatEnabled : guide.chat_enabled,
        voice_enabled: guide.VoiceEnabled !== undefined ? guide.VoiceEnabled : guide.voice_enabled,
        video_enabled: guide.VideoEnabled !== undefined ? guide.VideoEnabled : guide.video_enabled,
        is_online: guide.is_online,
        voice_channel_name: guide.VoiceChannelName || guide.voice_channel_name,
        video_channel_name: guide.VideoChannelName || guide.video_channel_name,
        years_of_experience: guide.YearsOfExperience || guide.years_of_experience,
        is_busy: guide.is_busy,
        tier: guide.tier,
        is_celebrity: guide.is_celebrity,
        bio: guide.bio || guide.Bio || '',
        skills: guide.skills,
        languages: guide.languages,
        rating: guide.rating,
        number_of_consultation: guide.number_of_consultation,
        price_per_minute: guide.price_per_minute,
        revenue_share: guide.revenue_share,
        guide_stats: guide.guide_stats || {},
        reports: guide.reports || [],
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

            const url = `${API_URL}/api/v1/admin-users/?${queryString.stringify(query)}`;
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

            const url = `${API_URL}/api/v1/guides/`;
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
                const url = `${API_URL}/api/v1/guides/pending-verifications?page=${page}&per_page=${perPage}`;

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
                const { page, perPage } = params.pagination || { page: 1, perPage: 25 };
                const { q: searchTerm } = params.filter;

                // Build query parameters
                const queryParams = new URLSearchParams({
                    page: page.toString(),
                    per_page: perPage.toString(),
                });

                // Add search parameter if provided
                if (searchTerm) {
                    queryParams.append('search', searchTerm);
                }

                const url = `${API_URL}/api/v1/customers/?${queryParams.toString()}`;
                const { json } = await httpClient(url);

                // Handle the response
                const customers = json.customers || [];
                const processedCustomers = customers.map(transformCustomer);

                // Calculate total from pagination info
                let total = json.total || 0;

                // Backend bug workaround: Calculate from pagination metadata
                if (total === 0) {
                    // If we received a full page, assume there might be more
                    if (processedCustomers.length === perPage) {
                        // Estimate: at least one more page exists
                        // This will make pagination show "Next" button
                        total = page * perPage + 1;
                    } else if (processedCustomers.length > 0) {
                        // Last page: exact total calculation
                        total = (page - 1) * perPage + processedCustomers.length;
                    }
                }

                return {
                    data: processedCustomers,
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
            const url = `${API_URL}/api/v1/consultations/?${queryString.stringify(query)}`;

            const { json } = await httpClient(url);

            console.log('Consultations API Response:', json);
            console.log('Consultations Data:', json.data);
            console.log('Consultations Pagination:', json.data?.pagination);

            return {
                data: json.data.data,
                total: json.data.pagination.totalItems || json.data.pagination.total_items || 0,
            };
        }

     
        if (resource === 'orders') {
            // const { page, perPage } = params.pagination || { page: 1, perPage: 10 };
            const customerId = params.filter.customerId;

            // Only fetch if a customerId is provided in the filter
            if (!customerId) {
                return { data: [], total: 0 };
            }

            const url = `${API_URL}/api/v1/customers/${customerId}/orders/`;
            const { json } = await httpClient(url);

            // The API response for orders is nested under 'items'
            const orders = json.items || [];

            return {
                data: orders.map((order: any) => ({ ...order, id: order.order_id })),
                total: json.pagination?.total_items || 0,
            };
        }
        if (resource === 'offers') {
            const url = `https://devvm.astrokiran.com/auth/api/v1/offers`;

            try {
                const { json } = await httpClient(url);

                // The API returns an array of offers directly
                const offers = Array.isArray(json) ? json : [];

                // Transform offers to ensure they have id field for react-admin
                const transformedOffers = offers.map((offer: any) => ({
                    ...offer,
                    id: offer.offer_id, // Use offer_id as the id field
                }));

                // Apply filtering if provided
                if (params.filter) {
                    const filteredOffers = transformedOffers.filter((offer: any) => {
                        // Filter by offer name
                        if (params.filter.offer_name) {
                            const searchMatch = offer.offer_name
                                .toLowerCase()
                                .includes(params.filter.offer_name.toLowerCase());
                            if (!searchMatch) return false;
                        }

                        // Filter by offer type
                        if (params.filter.offer_type) {
                            if (offer.offer_type !== params.filter.offer_type) return false;
                        }

                        // Filter by offer category
                        if (params.filter.offer_category) {
                            if (offer.offer_category !== params.filter.offer_category) return false;
                        }

                        return true;
                    });

                    // Apply pagination
                    const { page = 1, perPage = 25 } = params.pagination;
                    const { field = 'created_at', order = 'DESC' } = params.sort;

                    // Sort the filtered results
                    filteredOffers.sort((a: any, b: any) => {
                        const aVal = a[field];
                        const bVal = b[field];

                        if (aVal < bVal) return order === 'ASC' ? -1 : 1;
                        if (aVal > bVal) return order === 'ASC' ? 1 : -1;
                        return 0;
                    });

                    // Paginate the sorted results
                    const total = filteredOffers.length;
                    const data = filteredOffers.slice((page - 1) * perPage, page * perPage);

                    return { data, total };
                }

                // If no filters, apply pagination to all offers
                const { page = 1, perPage = 25 } = params.pagination;
                const { field = 'created_at', order = 'DESC' } = params.sort;

                // Sort all offers
                const sortedOffers = [...transformedOffers].sort((a: any, b: any) => {
                    const aVal = a[field];
                    const bVal = b[field];

                    if (aVal < bVal) return order === 'ASC' ? -1 : 1;
                    if (aVal > bVal) return order === 'ASC' ? 1 : -1;
                    return 0;
                });

                // Paginate
                const total = sortedOffers.length;
                const data = sortedOffers.slice((page - 1) * perPage, page * perPage);

                return { data, total };
            } catch (error) {
                console.error('Error fetching offers:', error);
                throw error;
            }
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

            const { json } = await httpClient(`${API_URL}/api/v1/guides/`, {
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
            const { json } = await httpClient(`${API_URL}/api/v1/customers/`, {
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

            const url = `${API_URL}/api/v1/customers/${customerId}/orders/`;
            const { json } = await httpClient(url, {
                method: 'POST',
                body: JSON.stringify(rest),
            });
            return { data: { ...json, id: json.order_id } };
        }
        if (resource === 'admin-users') {
            const url = `${API_URL}/api/v1/admin-users/`;

            // Add +91 prefix to phone_number if not already present
            const modifiedData = {
                ...params.data,
                phone_number: params.data.phone_number && !params.data.phone_number.startsWith('+91')
                    ? `+91${params.data.phone_number}`
                    : params.data.phone_number
            };

            const { json } = await httpClient(url, {
                method: 'POST',
                body: JSON.stringify(modifiedData),
            });
            return { data: { ...json, id: json.id } };
        }
        if (resource === 'offers') {
            const url = `https://devvm.astrokiran.com/auth/api/v1/offers/admin/create`;

            try {
                const { json } = await httpClient(url, {
                    method: 'POST',
                    body: JSON.stringify(params.data),
                });

                // The API should return the created offer data
                return {
                    data: {
                        ...json,
                        id: json.offer_id || json.data?.offer_id || json.id,
                    }
                };
            } catch (error) {
                console.error('Error creating offer:', error);
                throw error;
            }
        }

        throw new Error(`Unsupported resource: ${resource}`);
    },
    update: async (resource, params) => {
         if (resource === 'guides') {
            const url = `${API_URL}/api/v1/guides/${params.id}`;
            const { json } = await httpClient(url, {
                method: 'PATCH',
                body: JSON.stringify(params.data),
            });
            return { data: transformGuide(json) };        }
        if (resource === 'admin-users') {
             const url = `${API_URL}/api/v1/admin-users/${params.id}`;

             // Add +91 prefix to phone_number if not already present (for consistency)
             const modifiedData = {
                 ...params.data,
                 phone_number: params.data.phone_number && !params.data.phone_number.startsWith('+91')
                     ? `+91${params.data.phone_number}`
                     : params.data.phone_number
             };

             const { json } = await httpClient(url, {
                method: 'PATCH', // PATCH is suitable for updating parts of a resource
                body: JSON.stringify(modifiedData),
             });
             return { data: { ...json, id: json.id } };
        }
       

        return Promise.resolve({ data: { ...params.data, id: params.id } }) as any;
        
    },

    getOne: async (resource, params) => {

        console.log(`getOne triggered for resource: ${resource}, id: ${params.id}`);

        if (resource === 'guides') {
            // Fetch from the guides list endpoint which has complete data including guide_stats
            const url = `${API_URL}/api/v1/guides/`;
            const { json } = await httpClient(url);

            // Find the specific guide by ID
            const guides = json.data.guides || [];
            const guide = guides.find((g: any) => g.id === params.id || g.id === parseInt(params.id as string));

            if (!guide) {
                throw new Error(`Guide with ID ${params.id} not found`);
            }

            // Add the status field
            const guideWithStatus = {
                ...guide,
                status: guide.online ? 'online' : 'offline',
            };

            return { data: guideWithStatus };
        }
        if (resource === 'customers') {
            // CHANGED: Fetch a single customer from the API
            const url = `${API_URL}/api/v1/customers/${params.id}`;
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
            const url = `${API_URL}/api/v1/consultations/${params.id}`;
            const { json } = await httpClient(url);

            // Assuming the getOne response is { success: true, data: { ...consultation } }
            return {
                data: json.data,
            };
        }
        if (resource === 'offers') {
            // Fetch a single offer from the API
            const url = `https://devvm.astrokiran.com/auth/api/v1/offers`;

            try {
                const { json } = await httpClient(url);

                // The API returns an array of offers, so we need to find the specific one
                const offers = Array.isArray(json) ? json : [];
                const offer = offers.find((o: any) => o.offer_id === params.id);

                if (!offer) {
                    throw new Error(`Offer with ID ${params.id} not found`);
                }

                // Transform the offer to ensure it has id field
                const transformedOffer = {
                    ...offer,
                    id: offer.offer_id,
                };

                return { data: transformedOffer };
            } catch (error) {
                console.error('Error fetching offer:', error);
                throw error;
            }
        }

        console.error(`getOne not implemented for resource: ${resource}`);
        return Promise.reject(new Error(`Unsupported resource: ${resource}`));
    },

    update: async (resource, params) => {
        if (resource === 'offers') {
            const { id, data } = params;
            const url = `https://devvm.astrokiran.com/auth/api/v1/offers/admin/${id}`;

            const { json } = await httpClient(url, {
                method: 'PUT',
                body: JSON.stringify(data),
            });

            return { data: { ...json, id: json.offer_id || json.id } };
        }

        console.error(`update not implemented for resource: ${resource}`);
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
    delete: async (resource, params) => {
        if (resource === 'offers') {
            const { id } = params;
            const url = `https://devvm.astrokiran.com/auth/api/v1/offers/admin/${id}`;

            await httpClient(url, {
                method: 'DELETE',
            });

            return { data: { id } };
        }

        // Default fallback for other resources
        return { data: { id: params.id } as any };
    },
    deleteMany: async () => ({ data: [] }),
};





