import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import authApi from '../../services/api/authApi';
import orderApi from '../../services/api/orderApi';
import paymentApi from '../../services/api/paymentApi';
import productApi from '../../services/api/productApi';
import settlementApi from '../../services/api/settlementApi';
import WithdrawalModal from '../../components/payment/WithdrawalModal';
import { useAuth } from '../../contexts/AuthContext';
import { ShoppingBag, Wallet, History, Package, TrendingUp, DollarSign, Calendar, ChevronRight } from 'lucide-react';

const pad2 = (v) => String(v).padStart(2, '0');
const toLocalIsoDate = (date) => `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
const toLocalYearMonth = (date) => `${date.getFullYear()}-${pad2(date.getMonth() + 1)}`;
const toArray = (value) => {
    if (Array.isArray(value)) return value;
    if (Array.isArray(value?.data)) return value.data;
    return [];
};

const MyPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout, refresh } = useAuth();
    const resolveInitialTab = () => {
        const queryTab = new URLSearchParams(location.search).get('tab');
        return queryTab || 'orders';
    };
    const [activeTab, setActiveTab] = useState(resolveInitialTab);
    const [orders, setOrders] = useState([]);
    const [walletInfo, setWalletInfo] = useState(null);
    const [financialLogs, setFinancialLogs] = useState([]);
    const [paymentLogs, setPaymentLogs] = useState([]);
    const [myProducts, setMyProducts] = useState([]);
    const [monthlySettlements, setMonthlySettlements] = useState([]);
    const [dailySettlementItems, setDailySettlementItems] = useState([]);
    const [monthlyTarget, setMonthlyTarget] = useState(toLocalYearMonth(new Date()));
    const [dailyTarget, setDailyTarget] = useState(toLocalIsoDate(new Date()));
    const [isSettlementLoading, setIsSettlementLoading] = useState(false);
    const [settlementError, setSettlementError] = useState('');
    const [loading, setLoading] = useState(true);
    const [bankInfo, setBankInfo] = useState({ bankCode: '', accountNumber: '', accountHolder: '' });
    const [isWithdrawalModalOpen, setIsWithdrawalModalOpen] = useState(false);

    const isSeller = user?.role === 'SELLER';

    const fetchFinanceData = async (memberId, sellerFlag = isSeller, currentTab = activeTab) => {
        const fetchWallet = async () => {
            try { return await paymentApi.getWallet(memberId); }
            catch (e) { console.error('Wallet fetch failed:', e); return null; }
        };
        const fetchWLogs = async () => {
            try { return await paymentApi.getBalanceLogs(); }
            catch (e) { console.error('Balance logs fetch failed:', e); return { balanceLog: [] }; }
        };
        const fetchRLogs = async () => {
            try { return await paymentApi.getRevenueLogs(); }
            catch (e) { console.error('Revenue logs fetch failed:', e); return { revenueLog: [] }; }
        };
        const fetchPLogs = async () => {
            try { return await paymentApi.getPaymentLogs(); }
            catch (e) { console.error('Payment logs fetch failed:', e); return { paymentLog: [] }; }
        };

        const fetchMyProducts = async () => {
            if (!sellerFlag || currentTab !== 'seller-center') return { content: [] };
            try { return await productApi.getMyProducts(); }
            catch (e) { console.error('My products fetch failed:', e); return { content: [] }; }
        };

        const [wallet, wLogs, rLogs, pLogs, productsRes] = await Promise.all([
            fetchWallet(), fetchWLogs(), fetchRLogs(), fetchPLogs(), fetchMyProducts()
        ]);

        if (wallet) setWalletInfo(wallet);

        const normalizedWalletLogs = Array.isArray(wLogs)
            ? wLogs
            : (wLogs?.walletLog || wLogs?.balanceLog || wLogs?.data?.walletLog || wLogs?.data?.balanceLog || []);
        const normalizedRevenueLogs = Array.isArray(rLogs)
            ? rLogs
            : (rLogs?.revenueLog || rLogs?.data?.revenueLog || []);

        const combinedLogs = [
            ...normalizedWalletLogs,
            ...normalizedRevenueLogs
        ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        setFinancialLogs(combinedLogs);
        const normalizedPaymentLogs = Array.isArray(pLogs)
            ? pLogs
            : (pLogs?.paymentLog || pLogs?.data?.paymentLog || []);
        setPaymentLogs(normalizedPaymentLogs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        if (currentTab === 'seller-center') {
            const normalizedProducts = Array.isArray(productsRes)
                ? productsRes
                : (productsRes?.content || productsRes?.data?.content || []);
            setMyProducts(normalizedProducts);
        }
    };

    const fetchMonthlySettlements = async (sellerId, targetMonth) => {
        setIsSettlementLoading(true);
        setSettlementError('');
        try {
            const response = await settlementApi.getMonthlySummary({ sellerId, targetMonth });
            setMonthlySettlements(toArray(response));
        } catch (err) {
            console.error('Monthly settlement query failed:', err);
            setMonthlySettlements([]);
            setSettlementError('월별 정산 내역 조회에 실패했습니다.');
        } finally {
            setIsSettlementLoading(false);
        }
    };

    const fetchDailySettlementItems = async (sellerId, targetDate) => {
        setIsSettlementLoading(true);
        setSettlementError('');
        try {
            const response = await settlementApi.getDailyItems({ sellerId, targetDate });
            setDailySettlementItems(toArray(response));
        } catch (err) {
            console.error('Daily settlement detail query failed:', err);
            setDailySettlementItems([]);
            setSettlementError('일별 정산 상세 조회에 실패했습니다.');
        } finally {
            setIsSettlementLoading(false);
        }
    };

    useEffect(() => {
        const initMypage = async () => {
            setLoading(true);
            try {
                const currentUser = await refresh();
                try {
                    const orderData = await orderApi.getMyOrders();
                    setOrders(orderData || []);
                } catch (orderErr) {
                    setOrders([]);
                }

                if (currentUser?.memberId) {
                    await fetchFinanceData(
                        currentUser.memberId,
                        currentUser.role === 'SELLER',
                        activeTab
                    );
                }
            } catch (err) {
                console.error('MyPage init error:', err);
            } finally {
                setLoading(false);
            }
        };
        if (authApi.getAccessToken()) initMypage();
    }, []);

    useEffect(() => {
        const queryTab = new URLSearchParams(location.search).get('tab');
        if (queryTab) {
            setActiveTab(queryTab);
        }
    }, [location.search]);

    useEffect(() => {
        if (user?.memberId) {
            fetchFinanceData(user.memberId);
            if (isSeller && activeTab === 'seller-center') {
                fetchMonthlySettlements(user.memberId, monthlyTarget);
                fetchDailySettlementItems(user.memberId, dailyTarget);
            }
        }
    }, [activeTab, isSeller, user?.memberId]);

    const handleUpgradeToSeller = async (e) => {
        e.preventDefault();
        const res = await authApi.upgradeToSeller(bankInfo);
        if (res.success) {
            alert('판매자로 전환되었습니다! 권한 갱신을 위해 다시 로그인해 주세요.');
            logout();
            navigate('/login');
        } else {
            alert(res.error?.message || '실패했습니다.');
        }
    };

    const handleDeleteProduct = async (id) => {
        if (!window.confirm('정말 이 상품을 삭제하시겠습니까?')) return;
        try {
            await productApi.deleteProduct(id);
            alert('상품이 삭제되었습니다.');
            fetchFinanceData(user.memberId);
        } catch (err) {
            alert('상품 삭제에 실패했습니다.');
        }
    };

    const getStatusBadge = (state) => {
        const styles = {
            PAYMENT_COMPLETED: { bg: '#e3f2fd', color: '#1e88e5', text: '결제완료' },
            PENDING_PAYMENT: { bg: '#fff3e0', color: '#fb8c00', text: '결제대기' },
            CANCELLED: { bg: '#ffebee', color: '#e53935', text: '취소됨' },
            PARTIALLY_CANCELLED: { bg: '#fce4ec', color: '#d81b60', text: '부분취소' },
            PARTIALLY_REFUNDED: { bg: '#ede7f6', color: '#5e35b1', text: '부분환불완료' },
            REFUNDED: { bg: '#ede7f6', color: '#4527a0', text: '환불완료' },
            PREPARING: { bg: '#f3e5f5', color: '#8e24aa', text: '배송준비' },
            PARTIALLY_SHIPPED: { bg: '#e0f7fa', color: '#00838f', text: '부분배송' },
            SHIPPING: { bg: '#e1f5fe', color: '#0277bd', text: '배송중' },
            DELIVERED: { bg: '#e8f5e9', color: '#2e7d32', text: '배송완료' },
            CONFIRMED: { bg: '#e8f5e9', color: '#1b5e20', text: '구매확정' }
        };
        const style = styles[state] || { bg: '#f5f5f5', color: '#757575', text: state };
        return <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, backgroundColor: style.bg, color: style.color }}>{style.text}</span>;
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const resolveOrderId = (order) => {
        return order?.orderId ?? order?.id ?? order?.order_id ?? null;
    };

    const handleOrderDetailClick = (order) => {
        const resolvedOrderId = resolveOrderId(order);
        if (!resolvedOrderId) {
            alert('주문 상세 정보를 찾을 수 없습니다. 잠시 후 다시 시도해주세요.');
            return;
        }
        navigate(`/orders/${resolvedOrderId}`);
    };

    const handleMonthlySettlementSearch = async () => {
        if (!user?.memberId) return;
        await fetchMonthlySettlements(user.memberId, monthlyTarget);
    };

    const handleDailySettlementSearch = async () => {
        if (!user?.memberId) return;
        await fetchDailySettlementItems(user.memberId, dailyTarget);
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        navigate(`/mypage?tab=${tab}`, { replace: true });
    };

    const monthlyTotalPayout = monthlySettlements.reduce((sum, row) => sum + (row.totalPayoutAmount || 0), 0);
    const monthlyTotalPayment = monthlySettlements.reduce((sum, row) => sum + (row.totalPaymentAmount || 0), 0);
    const monthlyTotalFee = monthlySettlements.reduce((sum, row) => sum + (row.totalFeeAmount || 0), 0);

    const settlementStatusStyle = (status) => {
        if (status === 'COMPLETED') return { bg: '#e8f5e9', color: '#2e7d32', label: '완료' };
        if (status === 'PENDING') return { bg: '#fff3e0', color: '#ef6c00', label: '대기' };
        return { bg: '#f5f5f5', color: '#616161', label: status || 'UNKNOWN' };
    };

    return (
        <div className="container" style={{ padding: '60px 20px', maxWidth: '1280px' }}>
            {/* Header Area */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: '40px' }}>
                <div>
                    <h1 style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '10px', color: 'var(--text-primary)', letterSpacing: '-1px' }}>마이페이지</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem' }}>
                        반가워요, <span style={{ color: 'var(--text-primary)', fontWeight: '700' }}>{user?.name || user?.username || user?.nickname || user?.memberName || '회원'}</span>님!
                        {isSeller && <span style={{ marginLeft: '10px', padding: '4px 10px', background: 'var(--accent-primary)', color: '#fff', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold' }}>SELLER</span>}
                    </p>
                </div>
                <button
                    onClick={handleLogout}
                    className="btn btn-outline"
                    style={{ padding: '8px 24px', fontSize: '0.9rem', borderRadius: '30px' }}
                >
                    로그아웃
                </button>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '30px', borderBottom: '2px solid var(--border-subtle)', marginBottom: '40px' }}>
                {['orders', 'wallet', isSeller ? 'seller-center' : 'be-seller'].filter(Boolean).map(tab => (
                    <button
                        key={tab}
                        onClick={() => handleTabChange(tab)}
                        style={{
                            padding: '15px 0',
                            fontSize: '1.1rem',
                            background: 'none',
                            border: 'none',
                            color: activeTab === tab ? 'var(--text-primary)' : 'var(--text-muted)',
                            fontWeight: activeTab === tab ? '700' : '500',
                            cursor: 'pointer',
                            position: 'relative',
                            marginBottom: '-2px',
                            borderBottom: activeTab === tab ? '3px solid var(--accent-primary)' : '3px solid transparent',
                            transition: 'color 0.2s'
                        }}
                    >
                        {tab === 'orders' ? '주문 내역' :
                            tab === 'wallet' ? '내 지갑' :
                                tab === 'seller-center' ? '판매자 센터' : '판매자 등록'}
                    </button>
                ))}
            </div>

            {loading ? (
                <div style={{ padding: '100px 0', textAlign: 'center', color: 'var(--text-secondary)' }}>정보를 불러오는 중입니다...</div>
            ) : (
                <div style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
                    {/* Orders Tab */}
                    {activeTab === 'orders' && (
                        <div style={{ display: 'grid', gap: '20px' }}>
                            {orders.length === 0 ? (
                                <div className="card" style={{ padding: '100px 20px', textAlign: 'center', boxShadow: 'none', background: 'var(--bg-secondary)' }}>
                                    <ShoppingBag size={48} style={{ marginBottom: '20px', opacity: 0.3, color: 'var(--text-primary)' }} />
                                    <h3 style={{ marginBottom: '10px', color: 'var(--text-primary)' }}>주문 내역이 없습니다</h3>
                                    <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>마음에 드는 상품을 찾아보세요!</p>
                                    <button onClick={() => navigate('/products')} className="btn btn-primary" style={{ padding: '12px 30px', borderRadius: '30px' }}>상품 둘러보기</button>
                                </div>
                            ) : (
                                orders.map(order => {
                                    const resolvedOrderId = resolveOrderId(order);
                                    const representativeItem = order.items?.[0];
                                    const othersCount = (order.items?.length || 0) - 1;
                                    const representativeName = representativeItem
                                        ? `${representativeItem.productName}${othersCount > 0 ? ` 외 ${othersCount}건` : ''}`
                                        : '상품 정보 없음';

                                    return (
                                        <div key={resolvedOrderId || order.orderNumber} className="card" style={{ padding: '30px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                                                <div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                                        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{new Date(order.createdAt).toLocaleDateString()}</span>
                                                        {getStatusBadge(order.state)}
                                                    </div>
                                                    <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-primary)' }}>{representativeName}</h3>
                                                </div>
                                                <button onClick={() => handleOrderDetailClick(order)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    상세보기 <ChevronRight size={16} />
                                                </button>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '20px', borderTop: '1px solid var(--border-subtle)' }}>
                                                <div style={{ display: 'flex', gap: '20px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                                    <span>주문번호 {order.orderNumber}</span>
                                                </div>
                                                <div style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                                                    {order.totalSalePrice.toLocaleString()}원
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}

                    {/* Wallet Tab */}
                    {activeTab === 'wallet' && (
                        <div style={{ display: 'grid', gap: '30px' }}>
                            <div className="card" style={{ padding: '28px 30px', borderRadius: '16px', background: '#fff', border: '1px solid #dff4f1', boxShadow: '0 10px 24px rgba(0, 196, 180, 0.08)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px', flexWrap: 'wrap' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)' }}>
                                        <Wallet size={18} />
                                        <span style={{ fontSize: '0.92rem', fontWeight: 600 }}>사용 가능한 잔액</span>
                                    </div>
                                    <span style={{ fontSize: '0.78rem', fontWeight: 700, padding: '7px 12px', borderRadius: '999px', color: '#087f76', background: 'rgba(0,196,180,0.12)', border: '1px solid rgba(0,196,180,0.28)' }}>
                                        실시간 잔액
                                    </span>
                                </div>

                                <h2 style={{ fontSize: '3rem', lineHeight: 1.05, fontWeight: 900, letterSpacing: '-1.3px', color: 'var(--text-primary)', margin: '12px 0 0' }}>
                                    {(walletInfo?.balance || 0).toLocaleString()}
                                    <span style={{ fontSize: '1.6rem', marginLeft: '6px', fontWeight: 800 }}>원</span>
                                </h2>

                                <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', color: 'var(--text-secondary)' }}>
                                    <span style={{ fontSize: '0.86rem' }}>정산/출금 요청 전 최신 금액으로 갱신됩니다.</span>
                                    <span style={{ fontSize: '0.8rem' }}>{new Date().toLocaleDateString()} 기준</span>
                                </div>
                            </div>

                            <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                                <div style={{ padding: '25px 30px', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)' }}>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <History size={18} /> 입출금로그
                                    </h3>
                                </div>
                                <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                                    {financialLogs.length === 0 ? (
                                        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>내역이 없습니다.</div>
                                    ) : (
                                        financialLogs.map((log, idx) => (
                                            <div key={idx} style={{ padding: '20px 30px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div>
                                                    <p style={{ fontWeight: '600', fontSize: '1rem', marginBottom: '6px', color: 'var(--text-primary)' }}>
                                                        {log.eventType === '판매수익_입금' ? '상품 판매 수익' : log.eventType ? log.eventType.replace('_', ' ') : '내역'}
                                                    </p>
                                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{new Date(log.createdAt).toLocaleString()}</p>
                                                </div>
                                                <span style={{
                                                    color: log.eventType?.includes('입금') ? 'var(--accent-primary)' : 'var(--accent-secondary)',
                                                    fontWeight: '700',
                                                    fontSize: '1.1rem'
                                                }}>
                                                    {log.eventType?.includes('입금') ? '+' : '-'}{log.amount.toLocaleString()}원
                                                </span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                                <div style={{ padding: '25px 30px', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)' }}>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <DollarSign size={18} /> 결제 로그
                                    </h3>
                                </div>
                                <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                                    {paymentLogs.length === 0 ? (
                                        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>결제 로그가 없습니다.</div>
                                    ) : (
                                        paymentLogs.map((log, idx) => (
                                            <div key={log.id ?? idx} style={{ padding: '20px 30px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div>
                                                    <p style={{ fontWeight: '600', fontSize: '1rem', marginBottom: '6px', color: 'var(--text-primary)' }}>
                                                        주문번호 {log.orderId}
                                                    </p>
                                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                                        상태: {log.paymentStatus} · {new Date(log.createdAt).toLocaleString()}
                                                    </p>
                                                </div>
                                                <span style={{ color: 'var(--text-primary)', fontWeight: '700', fontSize: '1.1rem' }}>
                                                    {(log.amount || 0).toLocaleString()}원
                                                </span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Seller Center */}
                    {isSeller && activeTab === 'seller-center' && (
                        <div style={{ display: 'grid', gap: '40px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                                <div className="card" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                        <div>
                                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>총 판매 수익</p>
                                            <h3 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-primary)' }}>{walletInfo?.revenue?.toLocaleString() || 0}원</h3>
                                        </div>
                                        <div style={{ background: 'var(--bg-secondary)', padding: '12px', borderRadius: '12px' }}>
                                            <TrendingUp size={24} color="var(--accent-primary)" />
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setIsWithdrawalModalOpen(true)}
                                        className="btn btn-primary"
                                        style={{ width: '100%' }}
                                    >
                                        출금 신청하기
                                    </button>
                                </div>
                                <div className="card" style={{ padding: '30px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                                    <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Package size={28} color="var(--accent-primary)" />
                                    </div>
                                    <div>
                                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>등록된 상품</p>
                                        <h3 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-primary)' }}>{myProducts.length}개</h3>
                                        <button
                                            onClick={() => navigate('/products/new')}
                                            style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontWeight: '600', padding: 0, marginTop: '5px', cursor: 'pointer', fontSize: '0.9rem' }}
                                        >
                                            + 새 상품 등록
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Product List */}
                            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                                <div style={{ padding: '25px 30px', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-primary)' }}>내 상품 관리</h3>
                                </div>
                                <div style={{ padding: '30px' }}>
                                    {myProducts.length === 0 ? (
                                        <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>등록된 상품이 없습니다.</div>
                                    ) : (
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
                                            {myProducts.map(product => (
                                                <div key={product.id} style={{ padding: '20px', borderRadius: '16px', border: '1px solid var(--border-subtle)', background: '#fff', boxShadow: 'var(--shadow-card)' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                                                        {product.imageUrl ? (
                                                            <img src={product.imageUrl} alt={product.name} style={{ width: '60px', height: '60px', borderRadius: '10px', objectFit: 'cover' }} />
                                                        ) : (
                                                            <div style={{ width: '60px', height: '60px', borderRadius: '10px', background: 'var(--bg-secondary)' }} />
                                                        )}
                                                        <div style={{ flex: 1 }}>
                                                            <h4 style={{ fontWeight: '600', marginBottom: '4px', color: 'var(--text-primary)' }}>{product.name}</h4>
                                                            <p style={{ color: 'var(--accent-primary)', fontWeight: '700' }}>{product.price.toLocaleString()}원</p>
                                                        </div>
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '10px' }}>
                                                        <button onClick={() => navigate(`/products/${product.id}/edit`)} className="btn btn-outline" style={{ flex: 1, padding: '8px', fontSize: '0.85rem' }}>수정</button>
                                                        <button onClick={() => handleDeleteProduct(product.id)} className="btn btn-outline" style={{ flex: 1, padding: '8px', fontSize: '0.85rem', color: 'var(--accent-secondary)', borderColor: 'rgba(255,107,107,0.3)' }}>삭제</button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Settlements */}
                            <div style={{ display: 'grid', gap: '20px' }}>
                                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                                    <div style={{ padding: '25px 30px', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                                        <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Calendar size={18} /> 월별 정산 조회
                                        </h3>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <input
                                                type="month"
                                                value={monthlyTarget}
                                                onChange={(e) => setMonthlyTarget(e.target.value)}
                                                style={{ padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--border-subtle)', background: '#fff', color: 'var(--text-primary)' }}
                                            />
                                            <button className="btn btn-primary" style={{ padding: '10px 16px' }} onClick={handleMonthlySettlementSearch}>
                                                조회
                                            </button>
                                        </div>
                                    </div>
                                    <div style={{ padding: '24px 30px' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '20px' }}>
                                            <div style={{ padding: '14px', borderRadius: '10px', background: 'var(--bg-secondary)' }}>
                                                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>총 정산 예정액</p>
                                                <p style={{ margin: '6px 0 0', fontWeight: 800, color: 'var(--text-primary)' }}>{monthlyTotalPayout.toLocaleString()}원</p>
                                            </div>
                                            <div style={{ padding: '14px', borderRadius: '10px', background: 'var(--bg-secondary)' }}>
                                                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>총 결제금액</p>
                                                <p style={{ margin: '6px 0 0', fontWeight: 800, color: 'var(--text-primary)' }}>{monthlyTotalPayment.toLocaleString()}원</p>
                                            </div>
                                            <div style={{ padding: '14px', borderRadius: '10px', background: 'var(--bg-secondary)' }}>
                                                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>총 수수료</p>
                                                <p style={{ margin: '6px 0 0', fontWeight: 800, color: 'var(--text-primary)' }}>{monthlyTotalFee.toLocaleString()}원</p>
                                            </div>
                                        </div>

                                        {monthlySettlements.length === 0 ? (
                                            <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '16px 0' }}>해당 월 정산 내역이 없습니다.</div>
                                        ) : (
                                            <div style={{ overflowX: 'auto' }}>
                                                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '720px' }}>
                                                    <thead>
                                                    <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                                                        <th style={{ textAlign: 'left', padding: '10px 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>대상월</th>
                                                        <th style={{ textAlign: 'right', padding: '10px 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>건수</th>
                                                        <th style={{ textAlign: 'right', padding: '10px 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>결제금액</th>
                                                        <th style={{ textAlign: 'right', padding: '10px 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>수수료</th>
                                                        <th style={{ textAlign: 'right', padding: '10px 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>정산금액</th>
                                                        <th style={{ textAlign: 'right', padding: '10px 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>상태</th>
                                                    </tr>
                                                    </thead>
                                                    <tbody>
                                                    {monthlySettlements.map((row) => {
                                                        const statusStyle = settlementStatusStyle(row.status);
                                                        return (
                                                            <tr key={row.monthlySettlementId} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                                                                <td style={{ padding: '14px 0', color: 'var(--text-primary)', fontWeight: 600 }}>
                                                                    {`${String(row.targetYearMonth).slice(0, 4)}-${String(row.targetYearMonth).slice(4, 6)}`}
                                                                </td>
                                                                <td style={{ padding: '14px 0', textAlign: 'right', color: 'var(--text-primary)' }}>{(row.totalCount || 0).toLocaleString()}</td>
                                                                <td style={{ padding: '14px 0', textAlign: 'right', color: 'var(--text-primary)' }}>{(row.totalPaymentAmount || 0).toLocaleString()}원</td>
                                                                <td style={{ padding: '14px 0', textAlign: 'right', color: 'var(--text-primary)' }}>{(row.totalFeeAmount || 0).toLocaleString()}원</td>
                                                                <td style={{ padding: '14px 0', textAlign: 'right', color: 'var(--text-primary)', fontWeight: 700 }}>{(row.totalPayoutAmount || 0).toLocaleString()}원</td>
                                                                <td style={{ padding: '14px 0', textAlign: 'right' }}>
                                                                        <span style={{ padding: '5px 11px', borderRadius: '999px', background: statusStyle.bg, color: statusStyle.color, fontSize: '0.75rem', fontWeight: 700 }}>
                                                                            {statusStyle.label}
                                                                        </span>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                                    <div style={{ padding: '25px 30px', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                                        <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <History size={18} /> 일별 정산 상세 조회
                                        </h3>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <input
                                                type="date"
                                                value={dailyTarget}
                                                onChange={(e) => setDailyTarget(e.target.value)}
                                                style={{ padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--border-subtle)', background: '#fff', color: 'var(--text-primary)' }}
                                            />
                                            <button className="btn btn-primary" style={{ padding: '10px 16px' }} onClick={handleDailySettlementSearch}>
                                                조회
                                            </button>
                                        </div>
                                    </div>
                                    <div style={{ padding: '24px 30px' }}>
                                        {dailySettlementItems.length === 0 ? (
                                            <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '16px 0' }}>해당 일자 정산 상세 내역이 없습니다.</div>
                                        ) : (
                                            <div style={{ display: 'grid', gap: '12px' }}>
                                                {dailySettlementItems.map((item) => (
                                                    <div key={item.dailySettlementItemId} style={{ border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '16px 18px', background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                                                        <div>
                                                            <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '5px' }}>{item.productName}</div>
                                                            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>상품 ID {item.productId} · 수량 {item.finalQuantity}개</div>
                                                        </div>
                                                        <div style={{ textAlign: 'right' }}>
                                                            <div style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{(item.finalAmount || 0).toLocaleString()}원</div>
                                                            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{item.targetDate}</div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {(isSettlementLoading || settlementError) && (
                                    <div style={{ color: settlementError ? 'var(--accent-secondary)' : 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'right' }}>
                                        {isSettlementLoading ? '정산 내역 조회 중...' : settlementError}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Registration Tab */}
                    {!isSeller && activeTab === 'be-seller' && (
                        <div className="card" style={{ padding: '50px 40px', maxWidth: '600px', margin: '40px auto' }}>
                            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                                <TrendingUp size={60} color="var(--accent-primary)" style={{ marginBottom: '20px' }} />
                                <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '10px', color: 'var(--text-primary)' }}>판매자 권한 신청</h2>
                                <p style={{ color: 'var(--text-secondary)' }}>나만의 커스텀 키보드를 전 세계에 판매해보세요.</p>
                            </div>
                            <form onSubmit={handleUpgradeToSeller} style={{ display: 'grid', gap: '25px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-primary)' }}>은행 코드</label>
                                    <input placeholder="예: 004 (신한)" value={bankInfo.bankCode} onChange={e => setBankInfo({ ...bankInfo, bankCode: e.target.value })} required style={{ width: '100%', padding: '15px', borderRadius: '10px', border: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-primary)' }}>계좌 번호</label>
                                    <input placeholder="하이픈(-) 제외" value={bankInfo.accountNumber} onChange={e => setBankInfo({ ...bankInfo, accountNumber: e.target.value })} required style={{ width: '100%', padding: '15px', borderRadius: '10px', border: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-primary)' }}>예금주</label>
                                    <input placeholder="본인 실명" value={bankInfo.accountHolder} onChange={e => setBankInfo({ ...bankInfo, accountHolder: e.target.value })} required style={{ width: '100%', padding: '15px', borderRadius: '10px', border: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                                </div>
                                <button type="submit" className="btn btn-primary" style={{ padding: '18px', fontSize: '1.1rem', marginTop: '10px' }}>신청서 제출</button>
                            </form>
                        </div>
                    )}
                </div>
            )}

            {isWithdrawalModalOpen && (
                <WithdrawalModal
                    isOpen={isWithdrawalModalOpen}
                    onClose={() => setIsWithdrawalModalOpen(false)}
                    availableAmount={walletInfo?.revenue || 0}
                    onSuccess={() => fetchFinanceData(user.memberId)}
                />
            )}
        </div>
    );
};

export default MyPage;
