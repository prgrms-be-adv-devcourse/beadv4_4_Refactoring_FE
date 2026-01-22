
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import cartApi from '../../services/api/cartApi';
import CartItem from './components/CartItem';
import { AlertCircle } from 'lucide-react';

const CartPage = () => {
    const [basket, setBasket] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadCart();
    }, []);

    const loadCart = () => {
        setLoading(true);
        cartApi.getCart().then(res => {
            setBasket(res.data);
            setLoading(false);
        }).catch(err => {
            console.error(err);
            setLoading(false);
        });
    };

    if (loading) return <div className="container" style={{ padding: '50px', textAlign: 'center' }}>장바구니 로딩 중...</div>;

    if (!basket || !basket.items || basket.items.length === 0) {
        return (
            <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
                <div style={{ marginBottom: '20px' }}>
                    <AlertCircle size={60} color="var(--text-muted)" />
                </div>
                <h2>장바구니가 비어있습니다.</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>
                    아직 담은 상품이 없습니다.
                </p>
                <Link to="/products" className="btn btn-primary">
                    쇼핑하러 가기
                </Link>
            </div>
        );
    }

    return (
        <div className="container" style={{ padding: '40px 20px' }}>
            <h1 style={{ marginBottom: '30px', fontSize: '2rem' }}>장바구니</h1>

            <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
                {/* Cart Items */}
                <div style={{ flex: 2, minWidth: '300px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {basket.items.map((item, idx) => (
                            <CartItem key={idx} item={item} />
                        ))}
                    </div>
                </div>

                {/* Summary */}
                <div style={{ flex: 1, minWidth: '280px' }}>
                    <div className="card" style={{ padding: '30px', position: 'sticky', top: '100px' }}>
                        <h3 style={{ marginBottom: '20px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '15px' }}>결제 상세</h3>

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', color: 'var(--text-secondary)' }}>
                            <span>상품 금액</span>
                            <span>{basket.totalAmount.toLocaleString()}원</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px', color: 'var(--text-secondary)' }}>
                            <span>배송비</span>
                            <span>무료</span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', fontSize: '1.2rem', fontWeight: 'bold' }}>
                            <span>총 결제금액</span>
                            <span style={{ color: 'var(--accent-primary)' }}>{basket.totalAmount.toLocaleString()}원</span>
                        </div>

                        <Link to="/orders/new" className="btn btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', textAlign: 'center', textDecoration: 'none' }}>
                            주문하기
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartPage;
