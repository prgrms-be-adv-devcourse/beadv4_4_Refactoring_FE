
import React from 'react';
import { Link } from 'react-router-dom';

const ProductItem = ({ product }) => {
    return (
        <Link to={`/products/${product.id}`} className="card" style={{ textDecoration: 'none' }}>
            <div style={{ height: '240px', overflow: 'hidden', background: '#fff' }}>
                <img
                    src={product.imageUrl}
                    alt={product.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { e.target.onerror = null; e.target.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'; }}
                />
            </div>
            <div style={{ padding: '20px' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>{product.category}</div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '10px', height: '44px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {product.name}
                </h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: '700', fontSize: '1.1rem' }}>{product.price.toLocaleString()}원</span>
                </div>
            </div>
        </Link>
    );
};

export default ProductItem;
