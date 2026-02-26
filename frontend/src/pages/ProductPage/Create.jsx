
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import productApi from '../../services/api/productApi';
import { Package, Plus, Image as ImageIcon, AlignLeft, DollarSign, Tag, Archive } from 'lucide-react';

const MAX_IMAGE_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const IMGBB_API_KEY = import.meta.env.VITE_IMGBB_API_KEY;

const uploadImageToImgBB = async (file) => {
    if (!IMGBB_API_KEY) {
        throw new Error('이미지 업로드 설정이 필요합니다. VITE_IMGBB_API_KEY를 설정해주세요.');
    }

    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: 'POST',
        body: formData
    });

    const result = await response.json();
    if (!response.ok || !result?.success || !result?.data?.url) {
        throw new Error('이미지 업로드에 실패했습니다. 잠시 후 다시 시도해주세요.');
    }

    return result.data.url;
};

const ProductCreatePage = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [selectedImageFile, setSelectedImageFile] = useState(null);
    const [previewImageUrl, setPreviewImageUrl] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        salePrice: '',
        stock: '',
        category: 'KEYBOARD', // Default
        description: '',
        imageUrl: '',
        detail: {} // Empty map for now
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) {
            if (previewImageUrl) {
                URL.revokeObjectURL(previewImageUrl);
            }
            setSelectedImageFile(null);
            setPreviewImageUrl('');
            setFormData(prev => ({ ...prev, imageUrl: '' }));
            return;
        }

        if (!file.type.startsWith('image/')) {
            setErrorMessage('이미지 파일만 업로드할 수 있습니다.');
            return;
        }

        if (file.size > MAX_IMAGE_FILE_SIZE) {
            setErrorMessage('이미지 파일은 10MB 이하만 업로드할 수 있습니다.');
            return;
        }

        setErrorMessage('');
        setSelectedImageFile(file);
        if (previewImageUrl) {
            URL.revokeObjectURL(previewImageUrl);
        }
        setPreviewImageUrl(URL.createObjectURL(file));
    };

    useEffect(() => {
        return () => {
            if (previewImageUrl) {
                URL.revokeObjectURL(previewImageUrl);
            }
        };
    }, [previewImageUrl]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMessage('');

        try {
            let imageUrl = formData.imageUrl;

            if (selectedImageFile) {
                imageUrl = await uploadImageToImgBB(selectedImageFile);
            }

            await productApi.createProduct({
                ...formData,
                imageUrl,
                price: Number(formData.price),
                salePrice: Number(formData.salePrice || formData.price),
                stock: Number(formData.stock),
            });
            alert('상품이 등록되었습니다.');
            navigate('/mypage?tab=seller-center');
        } catch (error) {
            console.error(error);

            const status = error.response?.status;
            if (status === 403) {
                setErrorMessage('판매자 권한이 없습니다. 판매자 등록 후 이용해주세요.');
            } else if (error.message?.includes('VITE_IMGBB_API_KEY')) {
                setErrorMessage(error.message);
            } else {
                setErrorMessage(error.message || '상품 등록에 실패했습니다. 잠시 후 다시 시도해주세요.');
            }

        } finally {
            setIsLoading(false);
        }
    };

    const handleFormKeyDown = (e) => {
        if (e.key !== 'Enter') return;
        const tagName = (e.target?.tagName || '').toLowerCase();
        if (tagName !== 'textarea') {
            e.preventDefault();
        }
    };

    return (
        <div className="container" style={{ padding: '60px 20px', maxWidth: '1100px' }}>
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '10px', color: 'var(--text-primary)' }}>상품 등록</h1>
                <p style={{ color: 'var(--text-secondary)' }}>새로운 상품을 등록하여 판매를 시작해보세요.</p>
            </div>

            <form onSubmit={handleSubmit} onKeyDown={handleFormKeyDown} style={{ background: '#fff', padding: '40px', borderRadius: '24px', boxShadow: 'var(--shadow-card)', border: '1px solid var(--border-subtle)' }}>
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
                            placeholder="상품 이름을 입력해주세요"
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
                                placeholder="0"
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
                            placeholder="0"
                            style={{ width: '100%', padding: '15px', borderRadius: '12px', border: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '1rem' }}
                        />
                    </div>

                    {/* Image File */}
                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', fontWeight: '600', color: 'var(--text-primary)' }}>
                            <ImageIcon size={18} color="var(--accent-primary)" /> 상품 이미지
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            style={{ width: '100%', padding: '15px', borderRadius: '12px', border: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '1rem' }}
                        />
                        <div style={{ marginTop: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                            업로드 후 이미지 URL로 자동 변환됩니다. (최대 10MB)
                        </div>
                        {previewImageUrl && (
                            <div style={{ marginTop: '10px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
                                <img src={previewImageUrl} alt="Preview" style={{ width: '100%', height: '200px', objectFit: 'cover' }} onError={(e) => e.target.style.display = 'none'} />
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
                            placeholder="상품에 대한 자세한 설명을 적어주세요."
                            style={{ width: '100%', padding: '15px', borderRadius: '12px', border: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '1rem', resize: 'vertical', lineHeight: '1.6' }}
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={isLoading} style={{ marginTop: '20px', padding: '18px', fontSize: '1.1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                        {isLoading ? (
                            '등록 중...'
                        ) : (
                            <>
                                <Plus size={20} /> 상품 등록하기
                            </>
                        )}
                    </button>

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

export default ProductCreatePage;
