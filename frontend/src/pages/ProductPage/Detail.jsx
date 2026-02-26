
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import productApi from '../../services/api/productApi';
import cartApi from '../../services/api/cartApi';
import { ShoppingBag, ChevronLeft, Star } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import ReviewSection from './components/ReviewSection';
import { getPriceInfo } from '../../utils/price';
import reviewApi from '../../services/api/reviewApi';

const ProductDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [adding, setAdding] = useState(false);
    const [reviewSummary, setReviewSummary] = useState({ averageRating: 0, reviewCount: 0 });
    const { updateCartCount } = useCart();
    const { originalPrice, salePrice, hasDiscount, discountRate } = getPriceInfo(product || {});

    useEffect(() => {
        let isMounted = true;
        const numericId = Number(id);

        if (!Number.isInteger(numericId) || numericId <= 0) {
            if (isMounted) {
                setLoading(false);
                setProduct(null);
            }
            return () => {
                isMounted = false;
            };
        }

        const fetchProduct = async () => {
            try {
                const detail = await productApi.getProductDetail(numericId);
                let imageUrl = detail?.imageUrl || location.state?.product?.imageUrl || '';
                let originalPrice = location.state?.product?.price || detail?.originalPrice || detail?.price;

                // 상세 API가 imageUrl을 내려주지 않는 경우 검색 결과에서 보강
                if (!imageUrl && detail?.name) {
                    try {
                        const searched = await productApi.searchProducts(detail.name);
                        const matched = (searched || []).find((item) => String(item.id) === String(numericId));
                        imageUrl = matched?.imageUrl || '';
                        originalPrice = matched?.price || originalPrice;
                    } catch (searchError) {
                        console.error('image fallback search failed:', searchError);
                    }
                }

                if (isMounted) {
                    setProduct({
                        ...detail,
                        imageUrl,
                        originalPrice,
                        salePrice: detail?.price
                    });
                    setLoading(false);
                }
            } catch (err) {
                console.error(err);
                if (isMounted) setLoading(false);
            }
        };

        fetchProduct();
        return () => {
            isMounted = false;
        };
    }, [id, location.state]);

    useEffect(() => {
        let isMounted = true;
        const numericId = Number(id);
        if (!Number.isInteger(numericId) || numericId <= 0) return;

        reviewApi.getProductReviewSummary(numericId)
            .then((summary) => {
                if (isMounted) setReviewSummary(summary || { averageRating: 0, reviewCount: 0 });
            })
            .catch((error) => {
                console.error('failed to fetch detail review summary', error);
            });
        return () => {
            isMounted = false;
        };
    }, [id]);

    const handleAddToCart = () => {
        setAdding(true);
        cartApi.addToCart(parseInt(id), quantity).then(() => {
            setAdding(false);
            updateCartCount(); // Sync Header
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
                            src={product.imageUrl || 'https://placehold.co/600x600?text=Thock'}
                            alt={product.name}
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                            onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/600x600?text=${encodeURIComponent(product.name)}`; }}
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

                    <div style={{ marginBottom: '30px' }}>
                        {hasDiscount && (
                            <div style={{ color: 'var(--accent-secondary)', fontWeight: 700, marginBottom: '6px' }}>
                                {discountRate}% 할인
                            </div>
                        )}
                        <div style={{ display: 'flex', alignItems: 'end', gap: '10px' }}>
                            <span style={{ fontSize: '2rem', fontWeight: '700' }}>
                                {(salePrice || 0).toLocaleString()}원
                            </span>
                            {hasDiscount && (
                                <span style={{ color: 'var(--text-muted)', textDecoration: 'line-through', marginBottom: '4px' }}>
                                    {originalPrice.toLocaleString()}원
                                </span>
                            )}
                        </div>
                        <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                color: '#ffcc00',
                                fontWeight: 700,
                                fontSize: '0.82rem'
                            }}>
                                <Star size={14} fill="currentColor" strokeWidth={1.8} />
                                {Number(reviewSummary.averageRating || 0).toFixed(1)}
                            </span>
                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                리뷰 {reviewSummary.reviewCount || 0}개
                            </span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '30px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border-subtle)', borderRadius: '8px' }}>
                            <button
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                style={{ padding: '10px 15px', background: 'transparent', color: 'var(--text-primary)', fontWeight: 700 }}>-</button>
                            <span style={{ padding: '10px 15px', minWidth: '40px', textAlign: 'center' }}>{quantity}</span>
                            <button
                                onClick={() => setQuantity(quantity + 1)}
                                style={{ padding: '10px 15px', background: 'transparent', color: 'var(--text-primary)', fontWeight: 700 }}>+</button>
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

            <ReviewSection productId={id} />
        </div>
    );
};

export default ProductDetailPage;
