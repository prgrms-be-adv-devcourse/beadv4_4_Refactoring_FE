
import React from 'react';
import { Link } from 'react-router-dom';
import LoginForm from './Form';

const LoginPage = () => {
    return (
        <div className="container" style={{ padding: '80px 20px', display: 'flex', justifyContent: 'center' }}>
            <div className="card" style={{ padding: '40px', width: '100%', maxWidth: '400px' }}>
                <h1 style={{ textAlign: 'center', marginBottom: '40px', fontSize: '1.8rem' }}>로그인</h1>
                <LoginForm />
                <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    계정이 없으신가요? <Link to="/signup" style={{ color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: 'bold' }}>회원가입</Link>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
