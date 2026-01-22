
import React from 'react';
import { Link } from 'react-router-dom';
import SignupForm from './Form';

const SignupPage = () => {
    return (
        <div className="container" style={{ padding: '80px 20px', display: 'flex', justifyContent: 'center' }}>
            <div className="card" style={{ padding: '40px', width: '100%', maxWidth: '400px' }}>
                <h1 style={{ textAlign: 'center', marginBottom: '40px', fontSize: '1.8rem' }}>회원가입</h1>
                <SignupForm />
                <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    이미 계정이 있으신가요? <Link to="/login" style={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}>로그인</Link>
                </div>
            </div>
        </div>
    );
};

export default SignupPage;
