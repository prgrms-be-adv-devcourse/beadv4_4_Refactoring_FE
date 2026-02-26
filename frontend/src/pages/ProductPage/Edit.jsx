
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import productApi from '../../services/api/productApi';
import { Package, Save, Image as ImageIcon, AlignLeft, DollarSign, Tag, Archive, ArrowLeft } from 'lucide-react';

const ProductEditPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        salePrice: '',
        stock: '',
        category: 'KEYBOARD',
        description: '',
        imageUrl: '',
        detail: {}
    });

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await productApi.getProductDetail(id);
                // Map API response to form data
                setFormData({
                    name: res.name || '',
                    price: res.price || '',
                    salePrice: res.salePrice || res.price || '',
                    stock: res.stock || '',
                    category: res.category || 'KEYBOARD',
                    description: res.description || '',
                    imageUrl: res.imageUrl || '',
                    detail: res.detail || {}
                });
            } catch (err) {
                console.error('Fetch error:', err);
                setErrorMessage('상품 정보를 불러오는 데 실패했습니다.');
            } finally {
                setIsFetching(false);
            }
        };
        fetchProduct();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await productApi.updateProduct(id, {
                ...formData,
                price: Number(formData.price),
                salePrice: Number(formData.salePrice || formData.price),
                stock: Number(formData.stock),
            });
            alert('상품 정보가 수정되었습니다.');
            navigate('/mypage?tab=seller-center');
        } catch (error) {
            console.error(error);
            setErrorMessage('상품 수정에 실패했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    if (isFetching) return (
        <div style={{ padding: '100px 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
            데이터를 불러오는 중...
        </div>
    );

    return (
        <div className="container" style={{ padding: '60px 20px', maxWidth: '1100px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
                <button
                    onClick={() => navigate(-1)}
                    style={{ background: 'none', border: 'none', padding: '8px', cursor: 'pointer', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                    <ArrowLeft size={24} color="var(--text-primary)" />
                </button>
                <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>상품 정보 수정</h1>
            </div>

            <form onSubmit={handleSubmit} style={{ background: '#fff', padding: '40px', borderRadius: '24px', boxShadow: 'var(--shadow-card)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'grid', gap: '25px' }}>

                    {/* Name */}
                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', fontWeight: '600', color: 'var(--text-primary)' }}>
                            <Tag size={18} color="var(--accent-primary)" /> 상품명
                        </label>
                        <input
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            style={{ width: '100%', padding: '15px', borderRadius: '12px', border: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '1rem' }}
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', fontWeight: '600', color: 'var(--text-primary)' }}>
                            <Archive size={18} color="var(--accent-primary)" /> 카테고리
                        </label>
                        <div style={{ position: 'relative' }}>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                style={{ width: '100%', padding: '15px', borderRadius: '12px', border: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '1rem', appearance: 'none', cursor: 'pointer' }}>
                                <option value="KEYBOARD">키보드</option>
                                <option value="KEYCAP">키캡</option>
                                <option value="SWITCH">스위치</option>
                                <option value="DIY_KIT">DIY 키트</option>
                            </select>
                            <div style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
                            </div>
                        </div>
                    </div>

                    {/* Prices */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', fontWeight: '600', color: 'var(--text-primary)' }}>
                                <DollarSign size={18} color="var(--accent-primary)" /> 정가
                            </label>
                            <input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                required
                                style={{ width: '100%', padding: '15px', borderRadius: '12px', border: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '1rem' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', fontWeight: '600', color: 'var(--text-primary)' }}>
                                <DollarSign size={18} color="var(--accent-secondary)" /> 할인가 (판매가)
                            </label>
                            <input
                                type="number"
                                name="salePrice"
                                value={formData.salePrice}
                                onChange={handleChange}
                                placeholder="비워두면 정가와 동일"
                                style={{ width: '100%', padding: '15px', borderRadius: '12px', border: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '1rem' }}
                            />
                        </div>
                    </div>

                    {/* Stock */}
                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', fontWeight: '600', color: 'var(--text-primary)' }}>
                            <Package size={18} color="var(--accent-primary)" /> 재고 수량
                        </label>
                        <input
                            type="number"
                            name="stock"
                            value={formData.stock}
                            onChange={handleChange}
                            required
                            style={{ width: '100%', padding: '15px', borderRadius: '12px', border: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '1rem' }}
                        />
                    </div>

                    {/* Image URL */}
                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', fontWeight: '600', color: 'var(--text-primary)' }}>
                            <ImageIcon size={18} color="var(--accent-primary)" /> 이미지 URL
                        </label>
                        <input
                            name="imageUrl"
                            value={formData.imageUrl}
                            onChange={handleChange}
                            placeholder="https://..."
                            style={{ width: '100%', padding: '15px', borderRadius: '12px', border: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '1rem' }}
                        />
                        {formData.imageUrl && (
                            <div style={{ marginTop: '10px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
                                <img src={formData.imageUrl} alt="Preview" style={{ width: '100%', height: '200px', objectFit: 'cover' }} onError={(e) => e.target.style.display = 'none'} />
                            </div>
                        )}
                    </div>

                    {/* Description */}
                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', fontWeight: '600', color: 'var(--text-primary)' }}>
                            <AlignLeft size={18} color="var(--accent-primary)" /> 상세 설명
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={8}
                            style={{ width: '100%', padding: '15px', borderRadius: '12px', border: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '1rem', resize: 'vertical', lineHeight: '1.6' }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
                        <button type="button" onClick={() => navigate(-1)} className="btn btn-outline" style={{ flex: 1, padding: '18px', fontSize: '1.1rem', borderRadius: '12px' }}>
                            취소
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={isLoading} style={{ flex: 2, padding: '18px', fontSize: '1.1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                            {isLoading ? '저장 중...' : (<><Save size={20} /> 변경사항 저장</>)}
                        </button>
                    </div>

                    {errorMessage && (
                        <div style={{ padding: '15px', color: '#ff4444', background: '#ffebee', borderRadius: '12px', textAlign: 'center', fontWeight: '600' }}>
                            {errorMessage}
                        </div>
                    )}
                </div>
            </form>
        </div>
    );
};

export default ProductEditPage;
