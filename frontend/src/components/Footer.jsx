
import React from 'react';

const Footer = () => {
    return (
        <footer style={{
            background: 'var(--bg-secondary)',
            borderTop: '1px solid var(--border-subtle)',
            padding: '40px 0',
            marginTop: 'auto'
        }}>
            <div className="container" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                <div style={{ marginBottom: '20px', fontWeight: 'bold', fontSize: '1.2rem', color: '#fff' }}>THOCK</div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '20px' }}>
                    <span>이용약관</span>
                    <span>개인정보처리방침</span>
                    <span>고객센터</span>
                </div>
                <p style={{ fontSize: '0.9rem' }}>
                    (주)또각 | 대표: 김개발 | 사업자등록번호: 123-45-67890<br />
                    주소: 서울특별시 강남구 테헤란로 123 | 이메일: support@thock.com
                </p>
                <p style={{ fontSize: '0.8rem', marginTop: '20px', color: 'var(--text-muted)' }}>
                    © 2024 Thock. All rights reserved.
                </p>
            </div>
        </footer>
    );
};

export default Footer;
