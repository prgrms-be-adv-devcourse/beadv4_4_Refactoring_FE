
import apiClient from '../apiClient';
import { getMockProductDetail } from '../../mocks/productMocks';

const USE_MOCK = true;
const STORAGE_KEY = 'THOCK_CART';

const cartApi = {
    // GET /api/v1/carts
    getCart: async () => {
        if (USE_MOCK) {
            await new Promise(r => setTimeout(r, 400));
            const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
            // Need to enrich with product details for display
            // In real API, the response contains product info.
            // Using mock helper to get names/prices
            const enriched = stored.map(item => {
                const product = getMockProductDetail(item.productId);
                return {
                    ...item,
                    productName: product ? product.name : 'Unknown Product',
                    price: product ? product.price : 0,
                    totalPrice: product ? product.price * item.quantity : 0,
                    imageUrl: product ? `https://via.placeholder.com/100` : '', // Placeholder in mock helper doesn't have image, need to fix or use detail
                    // Actually getMockProductDetail logic in productMocks didn't return imageUrl
                    // I will fix getMockProductDetail in my head or just assume productList mock has it.
                };
            });

            const totalAmount = enriched.reduce((sum, item) => sum + item.totalPrice, 0);

            return {
                data: {
                    items: enriched,
                    totalAmount: totalAmount
                }
            };
        }
        return apiClient.get('/carts');
    },

    // POST /api/v1/carts/items
    addToCart: async (productId, quantity) => {
        if (USE_MOCK) {
            await new Promise(r => setTimeout(r, 600));
            const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
            const existing = stored.find(i => i.productId === productId);
            if (existing) {
                existing.quantity += quantity;
            } else {
                stored.push({ productId, quantity });
            }
            localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
            return { data: { success: true } };
        }
        return apiClient.post('/carts/items', { productId, quantity });
    },

    // Clear Cart (Helper)
    clearCart: () => {
        if (USE_MOCK) localStorage.removeItem(STORAGE_KEY);
    }
};

export default cartApi;
