
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authApi from '../../services/api/authApi';

const SignupForm = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        name: '', // User name/nickname
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('비밀번호가 일치하지 않습니다.');
            return;
        }

        setLoading(true);
        const result = await authApi.signup({
            email: formData.email,
            name: formData.name,
            password: formData.password
        });
        setLoading(false);

        if (result.success) {
            alert('회원가입이 완료되었습니다! 로그인해주세요.');
            navigate('/login');
        } else {
            setError(result.error?.message || '회원가입 중 오류가 발생했습니다.');
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
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
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
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>이름 (닉네임)</label>
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    style={{
                        width: '100%', padding: '12px', borderRadius: '8px',
                        border: '1px solid var(--border-subtle)', background: 'var(--bg-primary)',
                        color: 'var(--text-primary)', outline: 'none'
                    }}
                    placeholder="홍길동"
                    required
                />
            </div>
            <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>비밀번호</label>
                <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    style={{
                        width: '100%', padding: '12px', borderRadius: '8px',
                        border: '1px solid var(--border-subtle)', background: 'var(--bg-primary)',
                        color: 'var(--text-primary)', outline: 'none'
                    }}
                    placeholder="비밀번호"
                    required
                />
            </div>
            <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>비밀번호 확인</label>
                <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    style={{
                        width: '100%', padding: '12px', borderRadius: '8px',
                        border: '1px solid var(--border-subtle)', background: 'var(--bg-primary)',
                        color: 'var(--text-primary)', outline: 'none'
                    }}
                    placeholder="비밀번호 재입력"
                    required
                />
            </div>
            <button type="submit" className="btn btn-primary" style={{ marginTop: '20px' }} disabled={loading}>
                {loading ? '처리중...' : '회원가입'}
            </button>
        </form>
    );
};

export default SignupForm;
