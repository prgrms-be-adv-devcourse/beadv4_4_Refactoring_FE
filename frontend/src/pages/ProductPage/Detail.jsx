
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import productApi from '../../services/api/productApi';
import cartApi from '../../services/api/cartApi';
import { ShoppingBag, ChevronLeft } from 'lucide-react';

const ProductDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [adding, setAdding] = useState(false);

    useEffect(() => {
        productApi.getProductDetail(id).then(res => {
            setProduct(res.data);
            setLoading(false);
        }).catch(err => {
            console.error(err);
            setLoading(false);
        });
    }, [id]);

    const handleAddToCart = () => {
        setAdding(true);
        cartApi.addToCart(parseInt(id), quantity).then(() => {
            setAdding(false);
            if (window.confirm('장바구니에 담았습니다. 장바구니로 이동하시겠습니까?')) {
                navigate('/cart');
            }
        }).catch(() => setAdding(false));
    };

    if (loading) return <div className="container" style={{ padding: '50px', textAlign: 'center' }}>로딩 중...</div>;
    if (!product) return <div className="container" style={{ padding: '50px', textAlign: 'center' }}>상품을 찾을 수 없습니다.</div>;

    return (
        <div className="container" style={{ padding: '40px 20px' }}>
            <button onClick={() => navigate(-1)} className="btn btn-outline" style={{ marginBottom: '20px', padding: '0.5rem 1rem' }}>
                <ChevronLeft size={16} /> 뒤로가기
            </button>

            <div style={{ display: 'flex', gap: '50px', flexWrap: 'wrap' }}>
                {/* Image Side */}
                <div style={{ flex: 1, minWidth: '300px' }}>
                    <div style={{ background: '#fff', borderRadius: '12px', overflow: 'hidden', height: '100%', maxHeight: '500px' }}>
                        <img
                            src={product.imageUrl || 'https://via.placeholder.com/600x600?text=Thock'}
                            alt={product.name}
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                            onError={(e) => { e.target.onerror = null; e.target.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'; }}
                        />
                    </div>
                </div>

                {/* Info Side */}
                <div style={{ flex: 1, minWidth: '300px' }}>
                    <div style={{ fontSize: '0.9rem', color: 'var(--accent-primary)', marginBottom: '10px' }}>{product.category}</div>
                    <h1 style={{ marginBottom: '20px' }}>{product.name}</h1>
                    <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: '30px', lineHeight: '1.6' }}>
                        {product.description}
                    </p>

                    <div style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '30px' }}>
                        {product.price ? product.price.toLocaleString() : 0}원
                    </div>

                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '30px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border-subtle)', borderRadius: '8px' }}>
                            <button
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                style={{ padding: '10px 15px', background: 'transparent', color: '#fff' }}>-</button>
                            <span style={{ padding: '10px 15px', minWidth: '40px', textAlign: 'center' }}>{quantity}</span>
                            <button
                                onClick={() => setQuantity(quantity + 1)}
                                style={{ padding: '10px 15px', background: 'transparent', color: '#fff' }}>+</button>
                        </div>
                        <span style={{ color: 'var(--text-secondary)' }}>
                            재고: {product.stock}개
                        </span>
                    </div>

                    <button
                        onClick={handleAddToCart}
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}
                        disabled={adding}
                    >
                        <ShoppingBag size={20} style={{ marginRight: '10px' }} />
                        {adding ? '담는 중...' : '장바구니 담기'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailPage;
