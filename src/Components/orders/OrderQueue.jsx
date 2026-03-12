import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { orderService } from '../../services/orderService';
import { useAuth }      from '../../context/AuthContext';
import { useCart }      from '../../context/CartContext';
import LoadingSpinner   from '../common/LoadingSpinner';
import OrderReceipt     from './OrderReceipt';
import './OrderQueue.css';


/* ─────────────────────────────────────────
   Shared constants
───────────────────────────────────────── */
const STATUS_FLOW  = ['pending', 'preparing', 'ready', 'completed'];
const STATUS_BADGE = {
  pending:   'badge-yellow',
  preparing: 'badge-blue',
  ready:     'badge-green',
  completed: 'badge-gray',
  cancelled: 'badge-red',
};
const STATUS_ICON = {
  pending:   '⏳',
  preparing: '👨‍🍳',
  ready:     '✅',
  completed: '🎉',
  cancelled: '❌',
};

/* ─────────────────────────────────────────
   Order Card (shared by staff + customer)
───────────────────────────────────────── */
function OrderCard({ order, canUpdate, customerView, onStatusChange }) {
  const next = STATUS_FLOW[STATUS_FLOW.indexOf(order.status) + 1];

  return (
    <div className={`order-card ${order.status}`}>
      <div className="order-card-top">
        <div>
          <div className="order-num">#{order.order_number}</div>
          <div className="order-time">
            {new Date(order.created_at).toLocaleString('en-PH', {
              dateStyle: 'medium', timeStyle: 'short',
            })}
          </div>
        </div>
        <div className="order-status-col">
          <span className={`badge ${STATUS_BADGE[order.status] || 'badge-gray'}`}>
            {STATUS_ICON[order.status]} {order.status}
          </span>
        </div>
      </div>

      {!customerView && order.user && (
        <div className="order-customer">👤 {order.user.name}</div>
      )}
      {customerView && order.payment_method && (
        <div className="order-customer">💳 {order.payment_method?.toUpperCase()}</div>
      )}

      <div className="order-lines">
        {order.order_items?.map(i => (
          <div key={i.id} className="order-line">
            <span>{i.menu_item?.name} × {i.quantity}</span>
            <span>₱{parseFloat(i.subtotal || 0).toFixed(2)}</span>
          </div>
        ))}
      </div>

      <div className="order-card-foot">
        <div className="order-total">
          Total: <strong>₱{parseFloat(order.total_amount || 0).toFixed(2)}</strong>
        </div>

        {/* Staff: advance / cancel */}
        {canUpdate && order.status !== 'completed' && order.status !== 'cancelled' && (
          <div className="order-actions">
            {next && (
              <button className="btn btn-primary btn-sm" onClick={() => onStatusChange(order.id, next)}>
                → {next.charAt(0).toUpperCase() + next.slice(1)}
              </button>
            )}
            {order.status === 'pending' && (
              <button className="btn btn-danger btn-sm" onClick={() => onStatusChange(order.id, 'cancelled')}>
                ✕ Cancel
              </button>
            )}
          </div>
        )}

        {/* Customer: cancel pending only */}
        {customerView && order.status === 'pending' && (
          <button className="btn btn-danger btn-sm" onClick={() => onStatusChange(order.id, 'cancelled')}>
            ✕ Cancel Order
          </button>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   DEFAULT EXPORT — Order Queue (staff + customer history)
───────────────────────────────────────── */
export default function OrderQueue({ customerView = false }) {
  const { user, canProcessOrder } = useAuth();
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [filter,  setFilter]  = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
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
    <div className="orders-page">
      <div className="orders-header">
        <h1 className="page-title">{customerView ? '📋 My Orders' : '📋 Order Queue'}</h1>
        <button className="btn btn-secondary" onClick={load}>🔄 Refresh</button>
      </div>

      <div className="orders-filters">
        {statuses.map(s => (
          <button key={s} className={`cat-btn ${filter === s ? 'active' : ''}`} onClick={() => setFilter(s)}>
            {s ? `${STATUS_ICON[s]} ${s.charAt(0).toUpperCase() + s.slice(1)}` : 'All'}
          </button>
        ))}
      </div>

      {error && <div className="order-error">⚠️ {error}</div>}

      {loading ? <LoadingSpinner /> : (
        <div className="orders-grid">
          {orders.length === 0 ? (
            <div className="empty-state">
              <span>📋</span>
              <p>{customerView ? "You haven't placed any orders yet." : 'No orders found.'}</p>
              {customerView && <Link to="/browse" className="browse-link">🍱 Browse Menu →</Link>}
            </div>
          ) : orders.map(o => (
            <OrderCard
              key={o.id} order={o}
              canUpdate={canProcessOrder()}
              customerView={customerView}
              onStatusChange={handleStatus}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────
   NAMED EXPORT — Customer Checkout
   Used at route: /checkout
───────────────────────────────────────── */
const PAYMENT_METHODS = [
  { key: 'cash',  icon: '💵', label: 'Cash'  },
  { key: 'gcash', icon: '📱', label: 'GCash' },
  { key: 'card',  icon: '💳', label: 'Card'  },
];

export function CustomerCheckout() {
  const { items, updateQty, removeItem, clearCart, total, itemCount } = useCart();
  const navigate  = useNavigate();

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
    <div className="checkout-page">
      <div className="checkout-header">
        <h1 className="page-title">🛒 My Cart</h1>
        <p className="checkout-sub">Review your items then place your order</p>
      </div>

      <div className="checkout-layout">

        {/* ── Left: Items ── */}
        <div className="checkout-items-card">
          <div className="checkout-items-head">
            <h2>Order Items {itemCount > 0 && `(${itemCount})`}</h2>
            {items.length > 0 && (
              <Link to="/browse" className="add-more-link">+ Add More</Link>
            )}
          </div>

          {items.length === 0 ? (
            <div className="checkout-empty">
              <div className="checkout-empty-icon">🛒</div>
              <h3>Your cart is empty</h3>
              <p>Browse the menu and add items to get started</p>
              <Link to="/browse" className="btn-browse">🍱 Browse Menu</Link>
            </div>
          ) : items.map(item => (
            <div key={item.menu_item_id} className="checkout-item">
              <div>
                <div className="ci-name">{item.name}</div>
                <div className="ci-price">₱{item.price.toFixed(2)} each</div>
                <div className="qty-controls">
                  <button className="qty-btn del" onClick={() => updateQty(item.menu_item_id, item.quantity - 1)}>−</button>
                  <span className="qty-num">{item.quantity}</span>
                  <button className="qty-btn" onClick={() => updateQty(item.menu_item_id, item.quantity + 1)} disabled={item.quantity >= item.max_qty}>+</button>
                  <button className="qty-btn del" onClick={() => removeItem(item.menu_item_id)} title="Remove">🗑️</button>
                </div>
              </div>
              <span className="ci-sub">₱{(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>

        {/* ── Right: Summary ── */}
        <div className="checkout-summary">
          <h2>Order Summary</h2>

          <div className="summary-lines">
            {items.map(i => (
              <div key={i.menu_item_id} className="summary-line">
                <span>{i.name} × {i.quantity}</span>
                <span>₱{(i.price * i.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="summary-line total">
              <span>Total</span>
              <span>₱{total.toFixed(2)}</span>
            </div>
          </div>

          <div className="payment-section">
            <h3>Payment Method</h3>
            <div className="payment-grid">
              {PAYMENT_METHODS.map(m => (
                <button key={m.key} className={`pay-btn ${payment === m.key ? 'active' : ''}`} onClick={() => setPayment(m.key)}>
                  <span className="pay-icon">{m.icon}</span>
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <div className="note-group">
            <label>Order Note (optional)</label>
            <textarea className="note-input" rows={3} placeholder="e.g. No onions, extra rice…" value={note} onChange={e => setNote(e.target.value)} />
          </div>

          <button className="btn-place-order" onClick={handlePlaceOrder} disabled={placing || !items.length}>
            {placing
              ? <><span className="co-spinner" /> Placing Order…</>
              : `✅ Place Order · ₱${total.toFixed(2)}`
            }
          </button>

          {items.length > 0 && (
            <button className="btn-clear-cart" onClick={clearCart}>🗑️ Clear Cart</button>
          )}
        </div>
      </div>

      {receipt && <OrderReceipt order={receipt} onClose={handleReceiptClose} />}
    </div>
  );
}