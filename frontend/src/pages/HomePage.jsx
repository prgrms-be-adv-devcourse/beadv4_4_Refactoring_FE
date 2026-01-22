
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import productApi from '../services/api/productApi';

const HomePage = () => {
    const [featured, setFeatured] = useState([]);

    useEffect(() => {
        // Fetch some products for "New Arrivals"
        productApi.getProducts('ALL', 0, 3).then(res => {
            setFeatured(res.data.content);
        });
    }, []);

    return (
        <div>
            {/* Hero Section */}
            <section style={{
                height: '70vh',
                background: 'radial-gradient(circle at center, #2C2C2C 0%, #121212 70%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px',
                textAlign: 'center'
            }}>
                <h1 style={{ fontSize: '4rem', marginBottom: '1rem', textShadow: '0 0 20px rgba(0,229,255,0.3)' }}>
                    FIND YOUR <span style={{ color: 'var(--accent-primary)' }}>THOCK</span>
                </h1>
                <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', maxWidth: '600px', marginBottom: '2rem' }}>
                    Premium Custom Keyboards, Switches, and Accessories for the enthusiast.
                </p>
                <div style={{ display: 'flex', gap: '20px' }}>
                    <Link to="/products" className="btn btn-primary" style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}>
                        SHOP NOW
                    </Link>
                    <Link to="/products?category=KEYBOARD" className="btn btn-outline" style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}>
                        VIEW KEYBOARDS
                    </Link>
                </div>
            </section>

            {/* Featured Section */}
            <section className="container" style={{ padding: '80px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                    <h2>New Arrivals</h2>
                    <Link to="/products" style={{ color: 'var(--accent-primary)', fontWeight: '600' }}>View All &rarr;</Link>
                </div>

                <div className="grid-cols-3">
                    {featured.map(product => (
                        <Link to={`/products/${product.id}`} key={product.id} className="card" style={{ textDecoration: 'none' }}>
                            <div style={{ height: '240px', overflow: 'hidden', background: '#fff', position: 'relative' }}>
                                <img
                                    src={product.imageUrl}
                                    alt={product.name}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    onError={(e) => { e.target.onerror = null; e.target.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'; }}
                                />
                                {product.stock < 5 && (
                                    <div style={{
                                        position: 'absolute', top: 10, left: 10,
                                        background: 'rgba(0,0,0,0.7)', color: 'var(--accent-secondary)',
                                        padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold'
                                    }}>Low Stock</div>
                                )}
                            </div>
                            <div style={{ padding: '20px' }}>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>{product.category}</div>
                                <h3 style={{ fontSize: '1.1rem', marginBottom: '10px', lineHeight: '1.4' }}>{product.name}</h3>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontWeight: '700', fontSize: '1.1rem' }}>{product.price.toLocaleString()}원</span>
                                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{product.nickname}</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default HomePage;
