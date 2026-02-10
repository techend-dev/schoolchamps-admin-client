import api from '../api';

export const paymentService = {
    async createOrder() {
        const response = await api.post('/payment/create-order');
        return response.data;
    },

    async verifyPayment(data: {
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
    }) {
        const response = await api.post('/payment/verify', data);
        return response.data;
    },
};
