
import React from 'react';
import { Link } from 'react-router-dom';

const CartItem = ({ item }) => {
    return (
        <div className="card" style={{ display: 'flex', padding: '15px', alignItems: 'center', gap: '20px' }}>
            <div style={{ width: '80px', height: '80px', background: '#fff', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
                <img
                    src={item.imageUrl || 'https://via.placeholder.com/100'}
                    alt="Product"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { e.target.onerror = null; e.target.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'; }}
                />
            </div>

            <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '5px' }}>
                    <Link to={`/products/${item.productId}`}>{item.productName}</Link>
                </h3>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    {item.price.toLocaleString()}원 × {item.quantity}
                </div>
            </div>

            <div style={{ fontWeight: '700', fontSize: '1.1rem' }}>
                {item.totalPrice.toLocaleString()}원
            </div>
        </div>
    );
};

export default CartItem;
