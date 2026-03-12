import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { orderService } from '../../services/orderService';
import { useAuth }      from '../../context/AuthContext';
import { useCart }      from '../../context/CartContext';
import LoadingSpinner   from '../common/LoadingSpinner';
import OrderReceipt     from './OrderReceipt';
 
const STATUS_FLOW  = ['pending', 'preparing', 'ready', 'completed'];
const STATUS_STYLE = {
  pending:   { bg: '#fef9c3', color: '#854d0e', icon: '⏳' },
  preparing: { bg: '#dbeafe', color: '#1e40af', icon: '👨‍🍳' },
  ready:     { bg: '#dcfce7', color: '#15803d', icon: '✅' },
  completed: { bg: '#f1f5f9', color: '#475569', icon: '🎉' },
  cancelled: { bg: '#fee2e2', color: '#b91c1c', icon: '❌' },
};
 
function OrderCard({ order, canUpdate, customerView, onStatusChange }) {
  const next   = STATUS_FLOW[STATUS_FLOW.indexOf(order.status) + 1];
  const style  = STATUS_STYLE[order.status] || STATUS_STYLE.completed;
 
  return (
    <div className="card border-0 shadow-sm h-100" style={{ borderRadius: 16 }}>
      <div className="card-body p-4 d-flex flex-column gap-2">
 
        {/* Top row */}
        <div className="d-flex align-items-start justify-content-between">
          <div>
            <div className="fw-bold" style={{ color: '#1e293b', fontSize: '1rem' }}>
              #{order.order_number}
            </div>
            <div className="text-muted" style={{ fontSize: '0.75rem' }}>
              {new Date(order.created_at).toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' })}
            </div>
          </div>
          <span
            className="badge px-2 py-1 fw-semibold"
            style={{ background: style.bg, color: style.color, fontSize: '0.78rem', borderRadius: 8 }}
          >
            {style.icon} {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </span>
        </div>
 
        {/* Customer / payment info */}
        {!customerView && order.user && (
          <div className="small text-muted">👤 {order.user.name}</div>
        )}
        {customerView && order.payment_method && (
          <div className="small text-muted">💳 {order.payment_method.toUpperCase()}</div>
        )}
 
        {/* Order lines */}
        <div className="flex-grow-1">
          {order.order_items?.map(i => (
            <div key={i.id} className="d-flex justify-content-between small py-1"
              style={{ borderBottom: '1px solid #f8fafc' }}>
              <span className="text-secondary">{i.menu_item?.name} × {i.quantity}</span>
              <span className="fw-semibold" style={{ color: '#1e293b' }}>
                ₱{parseFloat(i.subtotal || 0).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
 
        {/* Total + actions */}
        <div className="d-flex align-items-center justify-content-between mt-1">
          <div className="fw-bold" style={{ color: '#1e293b' }}>
            ₱{parseFloat(order.total_amount || 0).toFixed(2)}
          </div>
 
          {/* Staff actions */}
          {canUpdate && order.status !== 'completed' && order.status !== 'cancelled' && (
            <div className="d-flex gap-2">
              {next && (
                <button
                  className="btn btn-sm fw-semibold text-white"
                  style={{ background: '#f97316', border: 'none', borderRadius: 8 }}
                  onClick={() => onStatusChange(order.id, next)}
                >
                  → {next.charAt(0).toUpperCase() + next.slice(1)}
                </button>
              )}
              {order.status === 'pending' && (
                <button
                  className="btn btn-sm fw-semibold"
                  style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 8 }}
                  onClick={() => onStatusChange(order.id, 'cancelled')}
                >
                  ✕ Cancel
                </button>
              )}
            </div>
          )}
 
          {/* Customer cancel */}
          {customerView && order.status === 'pending' && (
            <button
              className="btn btn-sm fw-semibold"
              style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 8 }}
              onClick={() => onStatusChange(order.id, 'cancelled')}
            >
              ✕ Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
 
export default function OrderQueue({ customerView = false }) {
  const { user, canProcessOrder } = useAuth();
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [filter,  setFilter]  = useState('');
 
  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const params = {};
      if (filter) params.status = filter;
      if (customerView && user?.id) params.user_id = user.id;
      const { data } = await orderService.getAll(params);
      setOrders(data.data || data);
    } catch {
      setError('Could not load orders. Make sure the backend is running.');
    } finally { setLoading(false); }
  }, [filter, customerView, user]);
 
  useEffect(() => { load(); }, [load]);
 
  const handleStatus = async (id, status) => {
    try { await orderService.updateStatus(id, status); load(); }
    catch (e) { alert(e.response?.data?.message || 'Could not update order.'); }
  };
 
  const statuses = ['', 'pending', 'preparing', 'ready', 'completed', 'cancelled'];
 
  return (
    <div className="d-flex flex-column gap-3">
 
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
        <h4 className="fw-bold mb-0" style={{ color: '#1e293b' }}>
          {customerView ? '📋 My Orders' : '📋 Order Queue'}
        </h4>
        <button className="btn btn-outline-secondary btn-sm" onClick={load}>🔄 Refresh</button>
      </div>
 
      {/* Status filter pills */}
      <div className="d-flex flex-wrap gap-2">
        {statuses.map(s => {
          const st = STATUS_STYLE[s];
          const active = filter === s;
          return (
            <button key={s} className="btn btn-sm fw-semibold"
              onClick={() => setFilter(s)}
              style={{
                borderRadius: 20,
                border: `1.5px solid ${active ? (st?.color || '#f97316') : '#e2e8f0'}`,
                background:   active ? (st?.bg || '#fff7ed') : '#fff',
                color:        active ? (st?.color || '#f97316') : '#64748b',
              }}>
              {s ? `${st?.icon} ${s.charAt(0).toUpperCase() + s.slice(1)}` : 'All Orders'}
            </button>
          );
        })}
      </div>
 
      {error && <div className="alert alert-danger py-2 small">⚠️ {error}</div>}
 
      {loading ? <LoadingSpinner /> : (
        orders.length === 0 ? (
          <div className="d-flex flex-column align-items-center justify-content-center py-5 text-muted gap-2">
            <span style={{ fontSize: 52, opacity: 0.3 }}>📋</span>
            <p className="mb-1">
              {customerView ? "You haven't placed any orders yet." : 'No orders found.'}
            </p>
            {customerView && (
              <Link to="/browse" className="btn btn-sm fw-semibold text-white"
                style={{ background: '#f97316', border: 'none', borderRadius: 10 }}>
                🍱 Browse Menu →
              </Link>
            )}
          </div>
        ) : (
          <div className="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-3">
            {orders.map(o => (
              <div key={o.id} className="col">
                <OrderCard
                  order={o}
                  canUpdate={canProcessOrder()}
                  customerView={customerView}
                  onStatusChange={handleStatus}
                />
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
 
 
/* ═══════════════════════════════════════
   NAMED EXPORT — Customer Checkout
═══════════════════════════════════════ */
const CHECKOUT_PAYMENT_METHODS = [
  { key: 'cash',  icon: '💵', label: 'Cash'  },
  { key: 'gcash', icon: '📱', label: 'GCash' },
  { key: 'card',  icon: '💳', label: 'Card'  },
];
 
export function CustomerCheckout() {
  const { items, updateQty, removeItem, clearCart, total, itemCount } = useCart();
  const navigate = useNavigate();
 
  const [payment, setPayment] = useState('cash');
  const [note,    setNote]    = useState('');
  const [placing, setPlacing] = useState(false);
  const [receipt, setReceipt] = useState(null);
 
  const handlePlaceOrder = async () => {
    if (!items.length) return;
    setPlacing(true);
    try {
      const { data } = await orderService.create({
        items: items.map(i => ({ menu_item_id: i.menu_item_id, quantity: i.quantity })),
        payment_method: payment,
        ...(note.trim() ? { note: note.trim() } : {}),
      });
      setReceipt(data);
      clearCart();
    } catch (e) {
      alert(e.response?.data?.message || 'Could not place order. Please try again.');
    } finally { setPlacing(false); }
  };
 
  const handleReceiptClose = () => { setReceipt(null); navigate('/my-orders'); };
 
  return (
    <div className="d-flex flex-column gap-3">
 
      {/* Header */}
      <div>
        <h4 className="fw-bold mb-0" style={{ color: '#1e293b' }}>🛒 My Cart</h4>
        <p className="text-muted small mb-0">Review your items then place your order</p>
      </div>
 
      <div className="row g-4 align-items-start">
 
        {/* ── Left: Cart Items ── */}
        <div className="col-lg-7">
          <div className="card border-0 shadow-sm" style={{ borderRadius: 16 }}>
            <div className="card-body p-4">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h6 className="fw-bold mb-0" style={{ color: '#1e293b' }}>
                  Order Items {itemCount > 0 && <span className="text-muted fw-normal">({itemCount})</span>}
                </h6>
                {items.length > 0 && (
                  <Link to="/browse" className="small fw-semibold text-decoration-none"
                    style={{ color: '#f97316' }}>+ Add More</Link>
                )}
              </div>
 
              {items.length === 0 ? (
                <div className="d-flex flex-column align-items-center py-5 text-muted gap-2">
                  <span style={{ fontSize: 52, opacity: 0.3 }}>🛒</span>
                  <p className="fw-semibold mb-1">Your cart is empty</p>
                  <p className="small mb-3">Browse the menu and add items to get started</p>
                  <Link to="/browse" className="btn fw-semibold text-white"
                    style={{ background: '#f97316', border: 'none', borderRadius: 12 }}>
                    🍱 Browse Menu
                  </Link>
                </div>
              ) : items.map(item => (
                <div key={item.menu_item_id}
                  className="d-flex align-items-center justify-content-between py-3"
                  style={{ borderBottom: '1px solid #f8fafc' }}>
                  <div className="flex-grow-1">
                    <div className="fw-semibold small" style={{ color: '#1e293b' }}>{item.name}</div>
                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>₱{item.price.toFixed(2)} each</div>
                    <div className="d-flex align-items-center gap-1 mt-2">
                      <button className="btn btn-sm d-flex align-items-center justify-content-center"
                        style={{ width: 28, height: 28, background: '#fee2e2', border: 'none', borderRadius: 8, color: '#dc2626', fontWeight: 700 }}
                        onClick={() => updateQty(item.menu_item_id, item.quantity - 1)}>−</button>
                      <span className="fw-bold small mx-2">{item.quantity}</span>
                      <button className="btn btn-sm d-flex align-items-center justify-content-center"
                        style={{ width: 28, height: 28, background: '#f1f5f9', border: 'none', borderRadius: 8, fontWeight: 700 }}
                        onClick={() => updateQty(item.menu_item_id, item.quantity + 1)}
                        disabled={item.quantity >= item.max_qty}>+</button>
                      <button className="btn btn-sm ms-2"
                        style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 8, padding: '4px 8px' }}
                        onClick={() => removeItem(item.menu_item_id)}>🗑️</button>
                    </div>
                  </div>
                  <span className="fw-bold ms-3" style={{ color: '#f97316', fontSize: '1rem' }}>
                    ₱{(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
 
        {/* ── Right: Order Summary ── */}
        <div className="col-lg-5">
          <div className="card border-0 shadow-sm" style={{ borderRadius: 16 }}>
            <div className="card-body p-4 d-flex flex-column gap-3">
              <h6 className="fw-bold mb-0" style={{ color: '#1e293b' }}>Order Summary</h6>
 
              {/* Line items */}
              <div className="d-flex flex-column gap-1">
                {items.map(i => (
                  <div key={i.menu_item_id} className="d-flex justify-content-between small">
                    <span className="text-muted">{i.name} × {i.quantity}</span>
                    <span style={{ color: '#1e293b' }}>₱{(i.price * i.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="d-flex justify-content-between fw-bold mt-2 pt-2"
                  style={{ borderTop: '2px solid #f1f5f9' }}>
                  <span style={{ color: '#1e293b' }}>Total</span>
                  <span style={{ color: '#f97316', fontSize: '1.1rem' }}>₱{total.toFixed(2)}</span>
                </div>
              </div>
 
              {/* Payment method */}
              <div>
                <div className="fw-semibold small text-secondary mb-2 text-uppercase" style={{ letterSpacing: '0.5px' }}>
                  Payment Method
                </div>
                <div className="d-flex gap-2">
                  {CHECKOUT_PAYMENT_METHODS.map(m => (
                    <button key={m.key} className="btn btn-sm flex-fill fw-semibold"
                      onClick={() => setPayment(m.key)}
                      style={{
                        borderRadius: 10,
                        border: `2px solid ${payment === m.key ? '#f97316' : '#e2e8f0'}`,
                        background:   payment === m.key ? '#fff7ed' : '#fff',
                        color:        payment === m.key ? '#f97316' : '#64748b',
                        padding: '8px 4px',
                      }}>
                      <div>{m.icon}</div>
                      <div style={{ fontSize: '0.75rem' }}>{m.label}</div>
                    </button>
                  ))}
                </div>
              </div>
 
              {/* Note */}
              <div>
                <label className="form-label fw-semibold small text-secondary">
                  Order Note <span className="fw-normal">(optional)</span>
                </label>
                <textarea
                  className="form-control"
                  rows={2}
                  placeholder="e.g. No onions, extra rice…"
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  style={{ borderRadius: 10, fontSize: '0.875rem' }}
                />
              </div>
 
              {/* Place order */}
              <button
                className="btn w-100 fw-bold text-white"
                style={{
                  background: items.length ? '#f97316' : '#e2e8f0',
                  border: 'none', borderRadius: 12, padding: '13px',
                }}
                onClick={handlePlaceOrder}
                disabled={placing || !items.length}
              >
                {placing
                  ? <><span className="spinner-border spinner-border-sm me-2" />Placing Order…</>
                  : `✅ Place Order · ₱${total.toFixed(2)}`}
              </button>
 
              {items.length > 0 && (
                <button className="btn btn-sm w-100"
                  style={{ background: 'transparent', color: '#94a3b8', border: 'none' }}
                  onClick={clearCart}>
                  🗑️ Clear Cart
                </button>
              )}
 
            </div>
          </div>
        </div>
      </div>
 
      {receipt && <OrderReceipt order={receipt} onClose={handleReceiptClose} />}
    </div>
  );
}