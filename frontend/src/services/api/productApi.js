
import apiClient from '../apiClient';
import { getMockProductList, getMockProductDetail } from '../../mocks/productMocks';

// Toggle this to switch between Real API and Mock Data
// In a real app, this might be an environment variable like import.meta.env.VITE_USE_MOCK
const USE_MOCK = true;

/**
 * Product API Service
 * Mirrors ApiV1ProductController
 */
const productApi = {
    /**
     * Get Product List (Paginated)
     * GET /api/v1/products?category=...&page=...&size=...
     * @param {string} category - KEYBOARD, SWITH, ACCESSORY etc.
     * @param {number} page - 0-indexed
     * @param {number} size
     */
    getProducts: async (category = 'KEYBOARD', page = 0, size = 10) => {
        if (USE_MOCK) {
            console.log(`[Mock API] getProducts category=${category}`);
            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 500));

            const allProducts = getMockProductList();
            // Simple filter by category if needed, or just return all for demo
            // In real mock: filter by category. 
            // Our mock data has categories: KEYBOARD, KEYCAP, SWITCH, CUSTOM_PART
            const filtered = category === 'ALL'
                ? allProducts
                : allProducts.filter(p => p.category === category || (category === 'KEYBOARD' && p.category === 'KEYBOARD')); // Default fallback

            return {
                data: {
                    content: filtered,
                    pageable: { pageNumber: page, pageSize: size },
                    totalPages: 1,
                    totalElements: filtered.length,
                    last: true
                }
            };
        }

        return apiClient.get('/products', {
            params: { category, page, size }
        });
    },

    /**
     * Get Product Detail
     * GET /api/v1/products/{id}
     * @param {number} id
     */
    getProductDetail: async (id) => {
        if (USE_MOCK) {
            console.log(`[Mock API] getProductDetail id=${id}`);
            await new Promise(resolve => setTimeout(resolve, 300));
            const product = getMockProductDetail(id);
            if (!product) return Promise.reject({ response: { status: 404 } });
            return { data: product };
        }

        return apiClient.get(`/products/${id}`);
    },

    /**
     * Create Product (Seller)
     * POST /api/v1/products
     */
    createProduct: async (productData) => {
        if (USE_MOCK) {
            console.log(`[Mock API] createProduct`, productData);
            await new Promise(resolve => setTimeout(resolve, 800));
            return { data: 999 }; // Return fake ID
        }
        return apiClient.post('/products', productData);
    },

    /**
     * Search Products
     * GET /api/v1/products/search?keyword=...
     */
    searchProducts: async (keyword) => {
        if (USE_MOCK) {
            await new Promise(resolve => setTimeout(resolve, 400));
            const all = getMockProductList();
            const filtered = all.filter(p => p.name.toLowerCase().includes(keyword.toLowerCase()));
            return { data: filtered };
        }
        return apiClient.get('/products/search', { params: { keyword } });
    }
};

export default productApi;
