
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const PaymentPage = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();

    return (
        <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
            <div className="card" style={{ maxWidth: '500px', margin: '0 auto', padding: '40px' }}>
                <h1>결제</h1>
                <p style={{ margin: '20px 0', color: 'var(--text-secondary)' }}>주문번호: {orderId}</p>
                <div style={{ padding: '20px', background: 'var(--bg-primary)', borderRadius: '8px', marginBottom: '30px' }}>
                    토스 페이먼츠 모듈이 여기에 연동됩니다. (구현 예정)
                </div>
                <button onClick={() => { alert('결제 완료!'); navigate('/'); }} className="btn btn-primary" style={{ width: '100%' }}>
                    결제하기 (Mock)
                </button>
            </div>
        </div>
    );
};

export default PaymentPage;
