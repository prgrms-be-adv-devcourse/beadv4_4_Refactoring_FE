import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import orderApi from '../../services/api/orderApi';
import { ArrowLeft, Package, Clock, AlertCircle, CheckCircle, XCircle, Truck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const CANCEL_REASON_OPTIONS = [
    { value: 'CHANGE_OF_MIND', label: '단순 변심' },
    { value: 'DELIVERY_DELAY', label: '배송 지연' },
    { value: 'PRODUCT_DEFECT', label: '상품 불량' },
    { value: 'WRONG_OPTION', label: '옵션 잘못 선택' },
    { value: 'ETC', label: '기타' }
];

const OrderDetailPage = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedItems, setSelectedItems] = useState([]);
    const [isCancelling, setIsCancelling] = useState(false);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [cancelTarget, setCancelTarget] = useState(null);
    const [cancelReasonType, setCancelReasonType] = useState('CHANGE_OF_MIND');
    const [cancelReasonDetail, setCancelReasonDetail] = useState('');
    const formatPrice = (value) => Number(value ?? 0).toLocaleString();

    useEffect(() => {
        fetchOrderDetail();
    }, [orderId]);

    const fetchOrderDetail = async () => {
        if (!orderId || orderId === 'undefined' || orderId === 'null') {
            alert('유효하지 않은 주문 정보입니다.');
            navigate('/mypage');
            return;
        }

        try {
            const data = await orderApi.getOrderDetail(orderId);
            setOrder(data);
        } catch (error) {
            console.error('Failed to fetch order detail:', error);
            alert('주문 정보를 불러오는데 실패했습니다.');
            navigate(-1);
        } finally {
            setLoading(false);
        }
    };

    const handleCheckboxChange = (orderItemId) => {
        setSelectedItems(prev => {
            if (prev.includes(orderItemId)) {
                return prev.filter(id => id !== orderItemId);
            } else {
                return [...prev, orderItemId];
            }
        });
    };

    const openCancelModal = (target) => {
        setCancelTarget(target);
        setCancelReasonType('CHANGE_OF_MIND');
        setCancelReasonDetail('');
        setIsCancelModalOpen(true);
    };

    const closeCancelModal = () => {
        if (isCancelling) return;
        setIsCancelModalOpen(false);
        setCancelTarget(null);
    };

    const handleConfirmCancel = async () => {
        if (!cancelTarget) return;
        if (cancelReasonType === 'ETC' && !cancelReasonDetail.trim()) {
            alert('기타 사유를 선택한 경우 상세 사유를 입력해주세요.');
            return;
        }

        const reasonDetail = cancelReasonType === 'ETC' ? cancelReasonDetail.trim() : '';
        setIsCancelling(true);
        try {
            if (cancelTarget === 'full') {
                await orderApi.cancelOrder(orderId, cancelReasonType, reasonDetail);
                alert('주문이 전체 취소되었습니다.');
            } else {
                await orderApi.cancelOrderItem(orderId, selectedItems, cancelReasonType, reasonDetail);
                alert('선택한 상품이 취소되었습니다.');
                setSelectedItems([]);
            }
            closeCancelModal();
            fetchOrderDetail();
        } catch (error) {
            console.error('Cancel failed:', error);
            alert(error.response?.data?.message || '취소에 실패했습니다.');
        } finally {
            setIsCancelling(false);
        }
    };

    const handleFullCancel = () => {
        openCancelModal('full');
    };

    const handlePartialCancel = async () => {
        if (selectedItems.length === 0) {
            alert('취소할 상품을 선택해주세요.');
            return;
        }
        openCancelModal('partial');
    };

    if (loading) return <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>로딩 중...</div>;
    if (!order) return null;

    const isOrderCancellable = order.state === 'PAYMENT_COMPLETED' || order.state === 'PENDING_PAYMENT';

    // Helper to get status color/text
    const getStatusInfo = (state) => {
        const map = {
            PAYMENT_COMPLETED: { color: '#1e88e5', bg: '#e3f2fd', text: '결제 완료', icon: CheckCircle },
            PENDING_PAYMENT: { color: '#fb8c00', bg: '#fff3e0', text: '결제 대기', icon: Clock },
            CANCELLED: { color: '#e53935', bg: '#ffebee', text: '취소됨', icon: XCircle },
            PARTIALLY_CANCELLED: { color: '#d81b60', bg: '#fce4ec', text: '부분 취소', icon: XCircle },
            REFUNDED: { color: '#4527a0', bg: '#ede7f6', text: '환불 완료', icon: CheckCircle },
            PARTIALLY_REFUNDED: { color: '#5e35b1', bg: '#ede7f6', text: '부분 환불 완료', icon: CheckCircle },
            PREPARING: { color: '#8e24aa', bg: '#f3e5f5', text: '배송 준비', icon: Package },
            PARTIALLY_SHIPPED: { color: '#00838f', bg: '#e0f7fa', text: '부분 배송', icon: Truck },
            SHIPPING: { color: '#0288d1', bg: '#e1f5fe', text: '배송 중', icon: Truck },
            DELIVERED: { color: '#2e7d32', bg: '#e8f5e9', text: '배송 완료', icon: CheckCircle },
            CONFIRMED: { color: '#1b5e20', bg: '#e8f5e9', text: '구매 확정', icon: CheckCircle },
        };
        return map[state] || { color: '#757575', bg: '#f5f5f5', text: state, icon: AlertCircle };
    };

    const statusInfo = getStatusInfo(order.state);
    const StatusIcon = statusInfo.icon;
    const recipientName =
        order?.receiverName ||
        order?.recipientName ||
        order?.buyerName ||
        user?.name ||
        user?.username ||
        user?.nickname ||
        user?.memberName ||
        '-';
    const postalCode = order?.zipCode || '-';
    const shippingAddress = [order?.baseAddress, order?.detailAddress].filter(Boolean).join(' ') || '-';

    return (
        <>
            <div className="container" style={{ padding: '60px 20px', maxWidth: '1280px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                    <button
                        onClick={() => navigate(-1)}
                        style={{
                            padding: '10px',
                            background: 'var(--bg-secondary)',
                            border: '1px solid var(--border-subtle)',
                            cursor: 'pointer',
                            borderRadius: '50%',
                            transition: 'background-color 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <ArrowLeft size={24} color="var(--text-primary)" />
                    </button>
                    <div style={{ flex: 1 }}>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--text-primary)', margin: 0 }}>주문 상세 정보</h1>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '4px', margin: 0 }}>주문번호 {order.orderNumber}</p>
                    </div>
                    <div style={{
                        padding: '8px 16px',
                        borderRadius: '30px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        backgroundColor: statusInfo.bg,
                        color: statusInfo.color
                    }}>
                        <StatusIcon size={18} />
                        <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{statusInfo.text}</span>
                    </div>
                </div>

                <div style={{ display: 'grid', gap: '24px' }}>
                    {/* Product List */}
                    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                        <div style={{
                            padding: '20px 30px',
                            borderBottom: '1px solid var(--border-subtle)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            backgroundColor: 'var(--bg-secondary)'
                        }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--text-primary)', margin: 0 }}>주문 상품 정보</h3>
                            {/* Actions for Cancellable Order */}
                            {isOrderCancellable && (
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                                    {selectedItems.length > 0 && (
                                        <button
                                            onClick={handlePartialCancel}
                                            disabled={isCancelling}
                                            className="btn btn-outline"
                                            style={{
                                                fontSize: '0.85rem',
                                                padding: '6px 14px',
                                                borderColor: '#ef5350',
                                                color: '#ef5350',
                                                opacity: isCancelling ? 0.5 : 1
                                            }}
                                        >
                                            선택 상품 취소
                                        </button>
                                    )}
                                    <button
                                        onClick={handleFullCancel}
                                        disabled={isCancelling}
                                        className="btn btn-outline"
                                        style={{
                                            fontSize: '0.85rem',
                                            padding: '6px 14px',
                                            borderColor: 'var(--text-secondary)',
                                            color: 'var(--text-primary)',
                                            opacity: isCancelling ? 0.5 : 1
                                        }}
                                    >
                                        주문 전체 취소
                                    </button>
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            {order.items?.map((item, idx) => {
                                const isSelected = selectedItems.includes(item.orderItemId);
                                return (
                                    <div key={item.orderItemId || idx} style={{
                                        padding: '24px 30px',
                                        display: 'flex',
                                        gap: '20px',
                                        backgroundColor: isSelected ? 'rgba(0, 196, 180, 0.05)' : 'transparent',
                                        borderBottom: idx < order.items.length - 1 ? '1px solid var(--border-subtle)' : 'none'
                                    }}>
                                        {/* Checkbox for partial cancel */}
                                        {isOrderCancellable && (
                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                {item.state === 'CANCELLED' ? (
                                                    <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#e53935', padding: '4px 8px', backgroundColor: '#ffebee', borderRadius: '4px' }}>취소됨</span>
                                                ) : (
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() => handleCheckboxChange(item.orderItemId)}
                                                        style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: 'var(--accent-primary)' }}
                                                    />
                                                )}
                                            </div>
                                        )}

                                        <div style={{
                                            width: '70px',
                                            height: '70px',
                                            backgroundColor: 'var(--bg-secondary)',
                                            border: '1px solid var(--border-subtle)',
                                            borderRadius: '10px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0
                                        }}>
                                            <Package size={30} color="var(--text-muted)" />
                                        </div>

                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                                <h4 style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '1.05rem', margin: 0, paddingRight: '16px' }}>{item.productName}</h4>
                                                <span style={{ fontWeight: 'bold', color: 'var(--text-primary)', flexShrink: 0, fontSize: '1.1rem' }}>
                                                {formatPrice(item.totalSalePrice ?? item.totalPrice)}원
                                            </span>
                                            </div>
                                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0 }}>
                                                수량: {item.quantity ?? 0}개 | 개당 {formatPrice(item.salePrice ?? item.price)}원
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Delivery Info */}
                    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                        <div style={{
                            padding: '20px 30px',
                            borderBottom: '1px solid var(--border-subtle)',
                            backgroundColor: 'var(--bg-secondary)'
                        }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--text-primary)', margin: 0 }}>배송지 정보</h3>
                        </div>
                        <div style={{ padding: '30px', display: 'grid', gap: '16px', fontSize: '0.95rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>이름</span>
                                <span style={{ color: 'var(--text-primary)' }}>{recipientName}</span>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>우편번호</span>
                                <span style={{ color: 'var(--text-primary)' }}>{postalCode}</span>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>배송지</span>
                                <span style={{ color: 'var(--text-primary)' }}>{shippingAddress}</span>
                            </div>
                        </div>
                    </div>

                    {/* Return/Refund Policy (Static) */}
                    <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', padding: '24px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        <h4 style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '10px', fontSize: '1rem' }}>취소 및 환불 안내</h4>
                        <p style={{ margin: '0 0 6px 0' }}>• 결제 완료 상태에서는 즉시 취소가 가능합니다.</p>
                        <p style={{ margin: '0 0 6px 0' }}>• 배송 준비 중 상태에서는 판매자 확인 후 취소가 가능합니다.</p>
                        <p style={{ margin: 0 }}>• 부분 취소 시, 선택한 상품의 금액만큼 부분 환불 처리됩니다.</p>
                    </div>
                </div>
            </div>
            {isCancelModalOpen && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.45)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        padding: '20px'
                    }}
                >
                    <div
                        style={{
                            width: '100%',
                            maxWidth: '460px',
                            backgroundColor: '#fff',
                            borderRadius: '14px',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
                            overflow: 'hidden'
                        }}
                    >
                        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)' }}>
                            <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                                {cancelTarget === 'full' ? '주문 전체 취소' : `선택 상품 ${selectedItems.length}건 취소`}
                            </h3>
                        </div>

                        <div style={{ padding: '20px 24px', display: 'grid', gap: '12px' }}>
                            <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>취소 사유</label>
                            <select
                                value={cancelReasonType}
                                onChange={(e) => setCancelReasonType(e.target.value)}
                                disabled={isCancelling}
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    borderRadius: '8px',
                                    border: '1px solid var(--border-subtle)',
                                    fontSize: '0.95rem',
                                    color: 'var(--text-primary)'
                                }}
                            >
                                {CANCEL_REASON_OPTIONS.map((reason) => (
                                    <option key={reason.value} value={reason.value}>
                                        {reason.label}
                                    </option>
                                ))}
                            </select>

                            {cancelReasonType === 'ETC' && (
                                <>
                                    <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>상세 사유</label>
                                    <textarea
                                        value={cancelReasonDetail}
                                        onChange={(e) => setCancelReasonDetail(e.target.value)}
                                        disabled={isCancelling}
                                        placeholder="상세 사유를 입력해주세요."
                                        rows={3}
                                        style={{
                                            width: '100%',
                                            padding: '10px 12px',
                                            borderRadius: '8px',
                                            border: '1px solid var(--border-subtle)',
                                            fontSize: '0.9rem',
                                            resize: 'vertical'
                                        }}
                                    />
                                </>
                            )}
                        </div>

                        <div style={{ padding: '16px 24px 20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            <button
                                type="button"
                                className="btn btn-outline"
                                onClick={closeCancelModal}
                                disabled={isCancelling}
                                style={{ minWidth: '88px' }}
                            >
                                닫기
                            </button>
                            <button
                                type="button"
                                className="btn btn-outline"
                                onClick={handleConfirmCancel}
                                disabled={isCancelling}
                                style={{
                                    minWidth: '110px',
                                    borderColor: '#ef5350',
                                    color: '#ef5350',
                                    opacity: isCancelling ? 0.6 : 1
                                }}
                            >
                                {isCancelling ? '처리 중...' : '취소 확정'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default OrderDetailPage;
