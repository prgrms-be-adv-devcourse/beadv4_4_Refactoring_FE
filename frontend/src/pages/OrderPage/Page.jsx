
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import cartApi from '../../services/api/cartApi';
import OrderForm from './Form';

const OrderPage = () => {
    const navigate = useNavigate();
    const [basket, setBasket] = useState(null);

    useEffect(() => {
        cartApi.getCart().then(res => setBasket(res.data)).catch(console.error);
    }, []);

    const handleOrderSubmit = (formData) => {
        // Mock order submission
        console.log('Order submitted:', formData, basket);
        alert('주문이 접수되었습니다! 결제 페이지로 이동합니다 (Mock)');
        // In real app, create order then navigate to payment
        navigate('/payment/123'); // sending fake order id
    };

    if (!basket) return <div className="container" style={{ padding: '50px' }}>로딩 중...</div>;

    return (
        <div className="container" style={{ padding: '40px 20px', display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
            <OrderForm onSubmit={handleOrderSubmit} />

            <div style={{ flex: 1, minWidth: '300px' }}>
                <div className="card" style={{ padding: '30px' }}>
                    <h3 style={{ marginBottom: '20px' }}>주문 요약</h3>
                    <div style={{ marginBottom: '20px' }}>
                        {basket.items.map((item, idx) => (
                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.9rem' }}>
                                <span>{item.productName} × {item.quantity}</span>
                                <span>{item.totalPrice.toLocaleString()}원</span>
                            </div>
                        ))}
                    </div>
                    <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.2rem' }}>
                        <span>총 결제금액</span>
                        <span style={{ color: 'var(--accent-primary)' }}>{basket.totalAmount.toLocaleString()}원</span>
                    </div>
                    <button type="submit" onClick={() => document.querySelector('form').requestSubmit()} className="btn btn-primary" style={{ width: '100%', marginTop: '20px' }}>
                        결제하기
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderPage;
