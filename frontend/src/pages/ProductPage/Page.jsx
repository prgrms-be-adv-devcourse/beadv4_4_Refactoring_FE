
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import productApi from '../../services/api/productApi';
import ProductForm from './Form';
import ProductItem from './components/ProductItem';

const ProductPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const category = searchParams.get('category') || 'ALL';
    const keyword = searchParams.get('keyword');

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        const fetchMethod = keyword
            ? productApi.searchProducts(keyword)
            : productApi.getProducts(category);

        fetchMethod.then(res => {
            setProducts(res.data.content || res.data); // Search endpoint might return list directly or page
            setLoading(false);
        }).catch(err => {
            console.error(err);
            setLoading(false);
        });
    }, [category, keyword]);

    const handleCategoryChange = (catId) => {
        if (catId === 'ALL') setSearchParams({});
        else setSearchParams({ category: catId });
    };

    return (
        <div className="container" style={{ padding: '40px 20px', display: 'flex', gap: '40px' }}>
            <ProductForm currentCategory={category} onCategoryChange={handleCategoryChange} />

            <main style={{ flex: 1 }}>
                <div style={{ marginBottom: '20px' }}>
                    <h2 style={{ textTransform: 'capitalize' }}>
                        {/* Simple mapping for title, ideally pass map from Form or utils */}
                        {keyword ? `'${keyword}' 검색 결과` :
                            category === 'ALL' ? '전체 상품' :
                                category === 'KEYBOARD' ? '키보드' :
                                    category === 'SWITCH' ? '스위치' :
                                        category === 'KEYCAP' ? '키캡' : '액세서리'}
                    </h2>
                    <p style={{ color: 'var(--text-secondary)' }}>총 {products.length}개의 상품</p>
                </div>

                {loading ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>로딩 중...</div>
                ) : (
                    <div className="grid-cols-3">
                        {products.map(product => (
                            <ProductItem key={product.id} product={product} />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default ProductPage;
