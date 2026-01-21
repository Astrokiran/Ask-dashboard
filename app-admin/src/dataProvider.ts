import { DataProvider, fetchUtils } from 'react-admin';
import { guides } from './guideMockData';
import queryString from 'query-string';


// Use the working environment variables from your original .env
const API_URL = process.env.REACT_APP_API_URL;
console.log('API_URL:', API_URL); // Log the API URL to verify it's being read correctly
const AUTH_API_URL = process.env.REACT_APP_AUTH_URL; // Base URL for your API
const OFFERS_BASE_URL = process.env.REACT_APP_OFFERS_BASE_URL;

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
    // Handle both possible API response structures
    let primaryProfile = null;

    if (customer.profile?.profiles && Array.isArray(customer.profile.profiles)) {
      primaryProfile = customer.profile.profiles.find((p: any) => p.is_primary);
    } else if (customer.profile && Array.isArray(customer.profile)) {
      primaryProfile = customer.profile.find((p: any) => p.is_primary);
    }

    // If no primary found, try to use the first profile
    if (!primaryProfile) {
      if (customer.profile?.profiles && Array.isArray(customer.profile.profiles) && customer.profile.profiles.length > 0) {
        primaryProfile = customer.profile.profiles[0];
      } else if (customer.profile && Array.isArray(customer.profile) && customer.profile.length > 0) {
        primaryProfile = customer.profile[0];
      }
    }

    console.log('Transforming customer:', customer.id, 'Primary profile:', primaryProfile);

    return {
      ...customer, // Keep all original data for the show view
      id: customer.id, // Ensure react-admin has the id
      // Set a top-level 'name' for easy display in lists
      name: primaryProfile?.full_name || `Customer #${customer.id}`,
      // Create a formatted phone number
      phone: `${customer.country_code || ''} ${customer.phone_number || ''}`.trim(),
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
                const { customer_id, phone_number, profile_name, from_date, to_date } = params.filter;

                console.log('Customer filters - customer_id:', customer_id, 'phone_number:', phone_number, 'profile_name:', profile_name, 'from_date:', from_date, 'to_date:', to_date);

                // Handle exact customer ID search using dedicated endpoint
                if (customer_id) {
                    console.log('Using dedicated customer endpoint for ID:', customer_id);

                    try {
                        const { json } = await httpClient(`${API_URL}/api/v1/customers/${customer_id}`);
                        console.log('Customer by ID response:', json);

                        const transformedCustomer = transformCustomer(json);
                        console.log('Transformed customer:', transformedCustomer);

                        return {
                            data: transformedCustomer ? [transformedCustomer] : [],
                            total: 1,
                        };
                    } catch (error) {
                        console.log('Customer not found with ID:', customer_id);
                        return {
                            data: [],
                            total: 0,
                        };
                    }
                }

                // Handle phone number and profile name search using list endpoint
                const queryParams = new URLSearchParams({
                    page: page.toString(),
                    per_page: perPage.toString(),
                });

                // Add phone number filter
                if (phone_number) {
                    queryParams.append('phone_number', phone_number.trim());
                    console.log('Searching by phone_number:', phone_number.trim());
                }

                // Add profile name filter
                if (profile_name) {
                    queryParams.append('profile_name', profile_name.trim());
                    console.log('Searching by profile_name:', profile_name.trim());
                }

                // Add date filters with timezone awareness
                if (from_date) {
                    // Convert to ISO 8601 format
                    const fromDateTime = new Date(`${from_date}T00:00:00`).toISOString();
                    queryParams.append('from_date', fromDateTime);
                    console.log('Added from_date filter:', fromDateTime);
                }

                if (to_date) {
                    // Convert to ISO 8601 format
                    const toDateTime = new Date(`${to_date}T23:59:59`).toISOString();
                    queryParams.append('to_date', toDateTime);
                    console.log('Added to_date filter:', toDateTime);
                }

                const url = `${API_URL}/api/v1/customers/?${queryParams.toString()}`;
                console.log('Customer search - URL:', url);

                const { json } = await httpClient(url);
                console.log('Customer search - Response:', json);

                // Handle the response
                let customers = json.customers || [];
                console.log('Server returned customers count:', customers.length);

                const processedCustomers = customers.map(transformCustomer).filter(Boolean);
                console.log('Processed customers count:', processedCustomers.length);

                // Use the total from API response - it's now accurate!
                let total = json.total || 0;

                console.log('Customer total calculation:', {
                    api_total: json.total,
                    final_total: total,
                    page,
                    perPage,
                    processed_customers_count: processedCustomers.length,
                    has_filters: !!(customer_id || phone_number || profile_name || from_date || to_date)
                });

                // Only use estimation if API total is genuinely 0 (fallback)
                if (total === 0 && customers.length > 0 && !customer_id && !phone_number && !profile_name && !from_date && !to_date) {
                    console.log('API returned total=0, using customer count as fallback');
                    total = customers.length;
                }

                console.log('Customers total calculation:', {
                    final_total: total,
                    page,
                    perPage,
                    processed_customers_count: processedCustomers.length,
                    has_filters: !!(customer_id || phone_number || profile_name || from_date || to_date)
                });

                return {
                    data: processedCustomers,
                    total: total,
                };
        }
        if (resource === 'consultations') {
            const { page, perPage } = params.pagination || { page: 1, perPage: 25 };
            // Destructure the filters for cleaner access
            const { q, status, guide_id, customer_id, id, date_from, date_to } = params.filter;

            console.log('Consultations filters received:', params.filter);

            // Handle exact consultation ID search using dedicated endpoint
            if (id) {
                console.log('Using dedicated consultation endpoint for ID:', id);

                try {
                    const { json } = await httpClient(`${API_URL}/api/v1/consultations/${id}`);
                    console.log('Consultation by ID response:', json);

                    // Transform the response to match the list format
                    const consultationData = json.data || json; // Handle both response formats
                    console.log('Transformed consultation data:', consultationData);

                    return {
                        data: [consultationData],
                        total: 1,
                    };
                } catch (error) {
                    console.log('Consultation not found with ID:', id);
                    return {
                        data: [],
                        total: 0,
                    };
                }
            }

            // Handle other filters using list endpoint
            const queryParams = new URLSearchParams();

            // Pagination
            queryParams.append('page', page.toString());
            queryParams.append('pageSize', perPage.toString());

            // Add filters with correct parameter names
            if (q) {
                queryParams.append('query', q); // Correct parameter name for search
            }

            if (status) {
                queryParams.append('status', status.toUpperCase()); // Convert to uppercase as shown in examples
            }

            if (guide_id) {
                queryParams.append('guide_id', guide_id);
            }

            if (customer_id) {
                queryParams.append('customer_id', customer_id);
            }

            // Add date filters with timezone awareness
            // Convert simple date strings to ISO 8601 format with user's local timezone
            if (date_from) {
                // Create date at start of day (00:00:00) in user's local timezone
                const startDateTime = new Date(`${date_from}T00:00:00`).toISOString();
                queryParams.append('start_date', startDateTime);
            }
            if (date_to) {
                // Create date at end of day (23:59:59) in user's local timezone
                const endDateTime = new Date(`${date_to}T23:59:59`).toISOString();
                queryParams.append('end_date', endDateTime);
            }

            // Use the correct admin API endpoint
            const url = `${API_URL}/api/v1/consultations/?${queryParams.toString()}`;
            console.log('Consultations URL with filters:', url);

            const { json } = await httpClient(url);
            console.log('Consultations response:', json);

            // Handle the API response structure
            let consultations = [];
            let total = 0;

            // Check different possible response structures
            if (json.data && Array.isArray(json.data)) {
                // Direct array response
                consultations = json.data;
                total = json.pagination?.total || json.total || consultations.length;
            } else if (json.data && json.data.data && Array.isArray(json.data.data)) {
                // Nested response with data.data
                consultations = json.data.data;
                total = json.data.pagination?.total || json.data.pagination?.totalItems || json.total || consultations.length;
            } else if (json.data && json.data.items && Array.isArray(json.data.items)) {
                // Response with items array
                consultations = json.data.items;
                total = json.data.pagination?.total || json.data.pagination?.totalItems || json.total || consultations.length;
            } else if (Array.isArray(json.data.data)) {
                // Direct array response
                consultations = json.data;
                total = json.pagination?.total || json.total || consultations.length;
            } else {
                console.warn('Unexpected API response structure:', json);
                consultations = [];
                total = 0;
            }

            console.log('Processed consultations:', {
                total: consultations.length,
                totalRecords: total,
                currentPage: page,
                perPage
            });

            return {
                data: consultations,
                total: total,
            };
        }

     
        if (resource === 'orders') {
            // const { page, perPage } = params.pagination || { page: 1, perPage: 10 };
            const customerId = params.filter.customerId;

            // Only fetch if a customerId is provided in the filter
            if (!customerId) {
                return { data: [], total: 0 };
            }

            const url = `${API_URL}/api/v1/customers/${customerId}/orders`;
            const { json } = await httpClient(url);

            // The API response for orders is nested under 'items'
            const orders = json.items || [];

            return {
                data: orders.map((order: any) => ({ ...order, id: order.order_id })),
                total: json.pagination?.total_items || 0,
            };
        }

        if (resource === 'consultation-orders') {
            const { page, perPage } = params.pagination || { page: 1, perPage: 10 };
            const { customer_id, status, service_type } = params.filter;

            // Return mock data when no customer_id is provided to allow filter form to show
            if (!customer_id) {
                return {
                    data: [
                        {
                            id: 'mock',
                            customer_id: '',
                            status: 'pending_payment',
                            service_type: 'Astrology',
                            created_at: new Date().toISOString(),
                            amount: 0,
                            is_mock: true
                        }
                    ],
                    total: 1,
                };
            }

            // Use the existing orders endpoint but filter for consultation/service orders
            const url = `${API_URL}/api/v1/customers/${customer_id}/orders`;
            const { json } = await httpClient(url);

            // Filter the orders to get only consultation/service orders
            let orders = json.items || [];

            // Apply additional filters
            if (status) {
                orders = orders.filter((order: any) =>
                    order.status?.toLowerCase() === status.toLowerCase()
                );
            }

            if (service_type) {
                orders = orders.filter((order: any) =>
                    order.service_type?.toLowerCase() === service_type.toLowerCase()
                );
            }

            // Transform the data for react-admin
            const transformedOrders = orders.map((order: any) => ({
                ...order,
                id: order.order_id,
                customer_id: customer_id, // Add customer_id for easier reference
            }));

            // Store the current customer_id in localStorage for the show page
            if (customer_id) {
                localStorage.setItem('current_customer_id', customer_id.toString());
            }

            // Apply pagination to the filtered results
            const total = transformedOrders.length;
            const startIndex = (page - 1) * perPage;
            const endIndex = startIndex + perPage;
            const paginatedOrders = transformedOrders.slice(startIndex, endIndex);

            return {
                data: paginatedOrders,
                total: total,
            };
        }

        if (resource === 'payment-orders') {
            const { page, perPage } = params.pagination || { page: 1, perPage: 10 };
            const { customer_id, status, payment_method } = params.filter;

            // Return mock data when no customer_id is provided to allow filter form to show
            if (!customer_id) {
                return {
                    data: [
                        {
                            id: 'mock',
                            customer_id: '',
                            status: 'PENDING',
                            payment_method: 'UPI',
                            amount: 0,
                            created_at: new Date().toISOString(),
                            is_mock: true
                        }
                    ],
                    total: 1,
                };
            }

            // Use the wallet payment orders endpoint
            const url = `${API_URL}/api/v1/customers/${customer_id}/wallet/payment-orders`;
            const { json } = await httpClient(url);

            // Filter the payment orders based on additional filters
            let paymentOrders = json.items || [];

            // Apply additional filters
            if (status) {
                paymentOrders = paymentOrders.filter((order: any) =>
                    order.status?.toLowerCase() === status.toLowerCase()
                );
            }

            if (payment_method) {
                paymentOrders = paymentOrders.filter((order: any) =>
                    order.payment_method?.toLowerCase() === payment_method.toLowerCase()
                );
            }

            // Transform the data for react-admin
            const transformedOrders = paymentOrders.map((order: any) => ({
                ...order,
                id: order.payment_order_id,
                customer_id: customer_id, // Add customer_id for easier reference
            }));

            // Apply pagination to the filtered results
            const total = transformedOrders.length;
            const startIndex = (page - 1) * perPage;
            const endIndex = startIndex + perPage;
            const paginatedOrders = transformedOrders.slice(startIndex, endIndex);

            // Store the current customer_id in localStorage for the show page
            if (customer_id) {
                localStorage.setItem('current_customer_id', customer_id.toString());
            }

            return {
                data: paginatedOrders,
                total: total,
            };
        }
        if (resource === 'offers') {
            const url = `${OFFERS_BASE_URL}`;

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
                    const { page = 1, perPage = 25 } = params.pagination ?? {};
                    const { field = 'created_at', order = 'DESC' } = params.sort ?? {};

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
                const { page = 1, perPage = 25 } = params.pagination ?? {};
                const { field = 'created_at', order = 'DESC' } = params.sort ?? {};

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

        // Reconciliation: Get refundable consultations
        if (resource === 'refundable-consultations') {
            const { page = 1, perPage = 20 } = params.pagination ?? {};
            const { is_refunded } = params.filter;

            const queryParams = new URLSearchParams();
            queryParams.append('page', page.toString());
            queryParams.append('page_size', perPage.toString());

            if (is_refunded !== undefined) {
                queryParams.append('is_refunded', is_refunded.toString());
            }

            const url = `${API_URL}/api/v1/consultations/refundable?${queryParams.toString()}`;

            try {
                const { json } = await httpClient(url);

                const consultations = json.data?.consultations || [];
                const pagination = json.data?.pagination || {};

                // The API response already has 'id' field, no transformation needed
                return {
                    data: consultations,
                    total: pagination.total || consultations.length,
                };
            } catch (error) {
                console.error('Error fetching refundable consultations:', error);
                throw error;
            }
        }

        // Reconciliation: Get reconciliation offers
        if (resource === 'reconciliation-offers') {
            const { page = 1, perPage = 25 } = params.pagination ?? {};
            const { field = 'valid_from', order = 'DESC' } = params.sort ?? {};

            let url = `${API_URL}/api/v1/offers/reconciliation`;

            try {
                const { json } = await httpClient(url);

                // The API response has structure: { success: true, message: "...", data: [...] }
                const offers = json.data || [];
                console.log('Reconciliation offers fetched:', offers.length);

                const transformedOffers = offers.map((offer: any) => ({
                    ...offer,
                    id: offer.offer_id,
                }));

                const { page = 1, perPage = 25 } = params.pagination ?? {};

                const sortedOffers = [...transformedOffers].sort((a: any, b: any) => {
                    const aVal = a[field];
                    const bVal = b[field];

                    if (aVal < bVal) return order === 'ASC' ? -1 : 1;
                    if (aVal > bVal) return order === 'ASC' ? 1 : -1;
                    return 0;
                });

                const total = sortedOffers.length;
                const data = sortedOffers.slice((page - 1) * perPage, page * perPage);

                return { data, total };
            } catch (error) {
                console.error('Error fetching reconciliation offers:', error);
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
                source: params.data.source || 'admin-dashboard',
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

            const url = `${API_URL}/api/v1/customers/${customerId}/orders`;
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
            const url = `${OFFERS_BASE_URL}/admin/create`;

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

        if (resource === 'consultation-orders') {
            const { customerId, ...rest } = params.data;
            if (!customerId) throw new Error('Customer ID is required to create a consultation order.');

            // Use the existing orders API endpoint
            const url = `${API_URL}/api/v1/customers/${customerId}/orders`;
            const { json } = await httpClient(url, {
                method: 'POST',
                body: JSON.stringify(rest),
            });

            return {
                data: {
                    ...json,
                    id: json.order_id,
                    customer_id: customerId,
                }
            };
        }

        if (resource === 'payment-orders') {
            const { customerId, ...rest } = params.data;
            if (!customerId) throw new Error('Customer ID is required to create a payment order.');

            // Use the wallet payment orders endpoint
            const url = `${API_URL}/api/v1/customers/${customerId}/wallet/payment-orders`;
            const { json } = await httpClient(url, {
                method: 'POST',
                body: JSON.stringify(rest),
            });

            return {
                data: {
                    ...json,
                    id: json.payment_order_id,
                    customer_id: customerId,
                }
            };
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
            const url = `${OFFERS_BASE_URL}`;

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

        if (resource === 'consultation-orders') {
            // Since there's no direct endpoint for getting a single order,
            // we'll need to fetch all orders for the user and find the specific one
            // This is not ideal but necessary given the API limitations

            // For now, we'll store the customer_id in localStorage when navigating from the list
            // In a real implementation, you'd want to pass this information more elegantly
            const customerId = localStorage.getItem('current_customer_id');

            if (!customerId) {
                throw new Error('Customer ID not found. Please navigate from the consultation orders list.');
            }

            const url = `${API_URL}/api/v1/customers/${customerId}/orders`;
            const { json } = await httpClient(url);

            // Find the specific order by order_id
            const orders = json.items || [];
            const order = orders.find((o: any) => o.order_id === parseInt(params.id as string));

            if (!order) {
                throw new Error(`Consultation order with ID ${params.id} not found`);
            }

            // Transform the data for react-admin
            return {
                data: {
                    ...order,
                    id: order.order_id,
                    customer_id: customerId,
                }
            };
        }

        if (resource === 'payment-orders') {
            // Since there's no direct endpoint for getting a single payment order,
            // we'll fetch all payment orders for the user and find the specific one
            const customerId = localStorage.getItem('current_customer_id');

            if (!customerId) {
                throw new Error('Customer ID not found. Please navigate from the payment orders list.');
            }

            const url = `${API_URL}/api/v1/customers/${customerId}/wallet/payment-orders`;
            const { json } = await httpClient(url);

            // Find the specific payment order by payment_order_id
            const paymentOrders = json.items || [];
            const paymentOrder = paymentOrders.find((po: any) => po.payment_order_id === parseInt(params.id as string));

            if (!paymentOrder) {
                throw new Error(`Payment order with ID ${params.id} not found`);
            }

            // Transform the data for react-admin
            return {
                data: {
                    ...paymentOrder,
                    id: paymentOrder.payment_order_id,
                    customer_id: customerId,
                }
            };
        }

        console.error(`getOne not implemented for resource: ${resource}`);
        return Promise.reject(new Error(`Unsupported resource: ${resource}`));
    },

    // update: async (resource, params) => {
    //     if (resource === 'offers') {
    //         const { id, data } = params;
    //         const url = `${OFFERS_BASE_URL}/admin/${id}`;

    //         const { json } = await httpClient(url, {
    //             method: 'PUT',
    //             body: JSON.stringify(data),
    //         });

    //         return { data: { ...json, id: json.offer_id || json.id } };
    //     }

    //     console.error(`update not implemented for resource: ${resource}`);
    //     return Promise.reject(new Error(`Unsupported resource: ${resource}`));
    // },

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

        // Guide earnings endpoint
        if (resource === 'guides' && type === 'getEarnings') {
            const { consultantId, startDate, endDate } = params;
            let url = `${API_URL}/api/v1/consultants/${consultantId}/earnings`;

            const queryParams = new URLSearchParams();
            if (startDate) queryParams.append('start_date', startDate);
            if (endDate) queryParams.append('end_date', endDate);

            if (queryParams.toString()) {
                url += `?${queryParams.toString()}`;
            }

            const { json } = await httpClient(url);
            return { data: json };
        }

        // Guide wallet balance endpoint
        if (resource === 'guides' && type === 'getWalletBalance') {
            const { consultantId } = params;
            const url = `${API_URL}/api/v1/consultants/${consultantId}/wallet-balance`;

            const { json } = await httpClient(url);
            return { data: json };
        }

        // Guide completed orders endpoint
        if (resource === 'guides' && type === 'getCompletedOrders') {
            const { consultantId, page = 1, perPage = 20, startDate, endDate, status } = params;
            let url = `${API_URL}/api/v1/consultants/${consultantId}/completed-orders`;

            const queryParams = new URLSearchParams();
            queryParams.append('page', page.toString());
            queryParams.append('per_page', perPage.toString());

            if (startDate) queryParams.append('start_date', startDate);
            if (endDate) queryParams.append('end_date', endDate);
            if (status) queryParams.append('status', status);

            url += `?${queryParams.toString()}`;

            const { json } = await httpClient(url);
            return { data: json };
        }

        // Reconciliation: Mark consultation as refundable
        if (resource === 'consultations' && type === 'markRefundable') {
            const { consultationId, adminUserId, reason } = params;
            const url = `${API_URL}/api/v1/admin/consultations/${consultationId}/mark-refundable`;

            const { json } = await httpClient(url, {
                method: 'POST',
                body: JSON.stringify({
                    admin_user_id: adminUserId,
                    reason: reason,
                }),
            });

            return { data: json };
        }

        // Reconciliation: Trigger refund workflow
        if (resource === 'consultations' && type === 'triggerRefund') {
            const { consultationId, reconciliationMethod, offerId, sendNotification } = params;
            const url = `${API_URL}/api/v1/consultations/${consultationId}/refund`;

            const payload: any = {
                reconciliation_method: reconciliationMethod,
            };

            if (reconciliationMethod === 'voucher_allocation' && offerId) {
                payload.offer_id = offerId;
            }

            if (sendNotification !== undefined) {
                payload.send_notification = sendNotification;
            }

            const { json } = await httpClient(url, {
                method: 'POST',
                body: JSON.stringify(payload),
            });

            return { data: json };
        }

        // Reconciliation: Create reconciliation voucher directly
        if (resource === 'reconciliation' && type === 'createVoucher') {
            const { offerId, customerId, consultationId, reason, adminUserId, expiresInSeconds } = params;
            const url = `${API_URL}/api/v1/offers/reconciliation-voucher`;

            const payload: any = {
                offer_id: offerId,
                customer_id: customerId,
            };

            if (consultationId) payload.consultation_id = consultationId;
            if (reason) payload.reason = reason;
            if (adminUserId) payload.admin_user_id = adminUserId;
            if (expiresInSeconds) payload.expires_in_seconds = expiresInSeconds;

            const { json } = await httpClient(url, {
                method: 'POST',
                body: JSON.stringify(payload),
            });

            return { data: json };
        }

        // Reconciliation: Get user reconciliation reservations
        if (resource === 'reconciliation' && type === 'getReservations') {
            const { customerId, status } = params;
            let url = `${OFFERS_BASE_URL}/reservations?customer_id=${customerId}`;

            if (status) {
                url += `&status=${status}`;
            }

            const { json } = await httpClient(url);
            return { data: json };
        }

        throw new Error(`Unsupported custom action: ${type}`);
},

    getMany: async () => ({ data: [] }),
    getManyReference: async () => ({ data: [], total: 0 }),
    delete: async (resource, params) => {
        if (resource === 'offers') {
            const { id } = params;
            const url = `${OFFERS_BASE_URL}/admin/${id}`;

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





