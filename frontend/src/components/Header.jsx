
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Search, Keyboard } from 'lucide-react';

const Header = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [showSearch, setShowSearch] = useState(false);
    const [keyword, setKeyword] = useState('');

    const isActive = (path) => location.pathname === path ? 'active' : '';

    const handleSearch = (e) => {
        if (e.key === 'Enter' && keyword.trim()) {
            navigate(`/products?keyword=${keyword}`);
            setShowSearch(false);
            setKeyword('');
        }
    };

    return (
        <header className="app-header">
            <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                {/* Logo */}
                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.5rem', fontWeight: '800', color: '#fff' }}>
                    <Keyboard color="#00E5FF" size={32} strokeWidth={2.5} />
                    <span>THOCK</span>
                </Link>

                {/* Nav */}
                <nav style={{ display: 'flex', alignItems: 'center' }}>
                    <Link to="/products" className={`nav-link ${isActive('/products')}`}>쇼핑하기</Link>
                    <Link to="/products?category=KEYBOARD" className="nav-link">키보드</Link>
                    <Link to="/products?category=SWITCH" className="nav-link">스위치</Link>
                    <Link to="/products?category=KEYCAP" className="nav-link">키캡</Link>
                </nav>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>

                    {/* Search Bar - Expandable */}
                    <div style={{ display: 'flex', alignItems: 'center', background: showSearch ? 'rgba(255,255,255,0.1)' : 'transparent', borderRadius: '20px', padding: showSearch ? '5px 15px' : '0', transition: 'all 0.3s' }}>
                        {showSearch && (
                            <input
                                type="text"
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                                onKeyDown={handleSearch}
                                placeholder="상품 검색..."
                                autoFocus
                                style={{
                                    background: 'transparent', border: 'none', color: '#fff',
                                    outline: 'none', width: '200px', fontSize: '0.9rem', marginRight: '10px'
                                }}
                            />
                        )}
                        <button
                            className="btn-icon"
                            style={{ background: 'none', color: '#fff', display: 'flex' }}
                            onClick={() => {
                                if (showSearch && keyword.trim()) {
                                    navigate(`/products?keyword=${keyword}`);
                                } else {
                                    setShowSearch(!showSearch);
                                }
                            }}
                        >
                            <Search size={22} />
                        </button>
                    </div>

                    <Link to="/cart" style={{ position: 'relative' }}>
                        <ShoppingCart size={22} color="#fff" />
                        {/* Mock Badge */}
                        <span style={{
                            position: 'absolute', top: -5, right: -8,
                            background: 'var(--accent-secondary)', color: 'white',
                            fontSize: '0.7rem', padding: '2px 5px', borderRadius: '10px', fontWeight: 'bold'
                        }}>2</span>
                    </Link>
                    <Link to="/login">
                        <User size={22} color="#fff" />
                    </Link>
                </div>
            </div>
        </header>
    );
};

export default Header;
