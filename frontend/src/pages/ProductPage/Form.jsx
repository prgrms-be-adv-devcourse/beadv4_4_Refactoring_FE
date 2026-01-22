
import React from 'react';
import { Filter } from 'lucide-react';

const CATEGORIES = [
    { id: 'ALL', label: '전체 상품' },
    { id: 'KEYBOARD', label: '키보드' },
    { id: 'SWITCH', label: '스위치' },
    { id: 'KEYCAP', label: '키캡' },
    { id: 'CUSTOM_PART', label: '액세서리' }
];

const ProductForm = ({ currentCategory, onCategoryChange }) => {
    return (
        <aside style={{ width: '250px', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', color: 'var(--accent-primary)' }}>
                <Filter size={20} />
                <h3 style={{ margin: 0, fontSize: '1.2rem' }}>필터</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {CATEGORIES.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => onCategoryChange(cat.id)}
                        style={{
                            textAlign: 'left',
                            background: currentCategory === cat.id ? 'var(--bg-tertiary)' : 'transparent',
                            color: currentCategory === cat.id ? 'var(--accent-primary)' : 'var(--text-secondary)',
                            padding: '10px 15px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: currentCategory === cat.id ? '600' : '400',
                            display: 'flex', justifyContent: 'space-between'
                        }}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>
        </aside>
    );
};

export default ProductForm;
