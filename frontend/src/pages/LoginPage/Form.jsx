
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authApi from '../../services/api/authApi';

const LoginForm = () => {
    const navigate = useNavigate();
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const result = await authApi.signin({ email: identifier, password });

        setIsLoading(false);

        if (result.success) {
            navigate('/');
        } else {
            setError(result.error?.message || '로그인에 실패했습니다.');
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
            {error && (
                <div style={{ padding: '10px', background: 'rgba(255, 64, 129, 0.1)', border: '1px solid var(--accent-secondary)', color: 'var(--accent-secondary)', borderRadius: '8px', fontSize: '0.9rem' }}>
                    {error}
                </div>
            )}
            <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>이메일</label>
                <input
                    type="email"
                    value={identifier}
                    onChange={e => setIdentifier(e.target.value)}
                    style={{
                        width: '100%', padding: '12px', borderRadius: '8px',
                        border: '1px solid var(--border-subtle)', background: 'var(--bg-primary)',
                        color: 'var(--text-primary)', outline: 'none'
                    }}
                    placeholder="example@thock.com"
                    required
                />
            </div>
            <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>비밀번호</label>
                <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    style={{
                        width: '100%', padding: '12px', borderRadius: '8px',
                        border: '1px solid var(--border-subtle)', background: 'var(--bg-primary)',
                        color: 'var(--text-primary)', outline: 'none'
                    }}
                    placeholder="비밀번호를 입력하세요"
                    required
                />
            </div>
            <button type="submit" className="btn btn-primary" style={{ marginTop: '20px' }} disabled={isLoading}>
                {isLoading ? '로그인 중...' : '로그인'}
            </button>
        </form>
    );
};

export default LoginForm;
