import { useState, useEffect, useCallback } from 'react';
import api              from '../../services/api';
import { orderService } from '../../services/orderService';
import { useCart }      from '../../context/CartContext';
import OrderReceipt     from './OrderReceipt';
import LoadingSpinner   from '../common/LoadingSpinner';
 
const PAYMENT_METHODS = [
  { key: 'cash',  icon: '💵', label: 'Cash'  },
  { key: 'gcash', icon: '📱', label: 'GCash' },
  { key: 'card',  icon: '💳', label: 'Card'  },
];
 
export default function POSInterface() {
  const { items: cartItems, addItem, removeItem, updateQty, clearCart, total, itemCount } = useCart();
  const [menuItems,  setMenuItems]  = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [catFilter,  setCatFilter]  = useState('');
  const [payment,    setPayment]    = useState('cash');
  const [placing,    setPlacing]    = useState(false);
  const [receipt,    setReceipt]    = useState(null);
 
  const loadMenu = useCallback(async () => {
    setLoading(true);
    try {
      const [m, c] = await Promise.all([
        api.get('/menu', { params: { available: 1 } }),
        api.get('/categories'),
      ]);
      setMenuItems(m.data.data || m.data);
      setCategories(c.data);
    } finally { setLoading(false); }
  }, []);
 
  useEffect(() => { loadMenu(); }, [loadMenu]);
 
  const filtered = menuItems.filter(i => {
    const ms = !search    || i.name.toLowerCase().includes(search.toLowerCase());
    const mc = !catFilter || i.category_id == catFilter;
    return ms && mc;
  });
 
  const handleCheckout = async () => {
    if (!cartItems.length) return;
    setPlacing(true);
    try {
      const { data } = await orderService.create({
        items: cartItems.map(i => ({ menu_item_id: i.menu_item_id, quantity: i.quantity })),
        payment_method: payment,
      });
      setReceipt(data);
      clearCart();
      loadMenu();
    } catch (e) { alert(e.response?.data?.message || 'Order failed.'); }
    finally { setPlacing(false); }
  };
 
  const cartQtyFor = id => cartItems.find(i => i.menu_item_id === id)?.quantity || 0;
 
  return (
    <div className="d-flex flex-column gap-3" style={{ height: '100%' }}>
 
      {/* Page title */}
      <h4 className="fw-bold mb-0" style={{ color: '#1e293b' }}>🧾 Point of Sale</h4>
 
      <div className="row g-3" style={{ flex: 1, minHeight: 0 }}>
 
        {/* ── Left Panel: Menu ── */}
        <div className="col-lg-7 d-flex flex-column gap-3">
 
          {/* Search + category pills */}
          <div className="d-flex flex-column gap-2">
            <input
              className="form-control"
              placeholder="🔍 Search items…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <div className="d-flex flex-wrap gap-2">
              {[{ id: '', icon: '', name: 'All' }, ...categories.map(c => ({ id: c.id, icon: c.icon, name: c.name }))].map(c => (
                <button
                  key={c.id}
                  className="btn btn-sm fw-semibold"
                  onClick={() => setCatFilter(c.id)}
                  style={{
                    borderRadius: 20,
                    border: `1.5px solid ${catFilter == c.id ? '#f97316' : '#e2e8f0'}`,
                    background:   catFilter == c.id ? '#f97316' : '#fff',
                    color:        catFilter == c.id ? '#fff'    : '#64748b',
                  }}
                >
                  {c.icon} {c.name}
                </button>
              ))}
            </div>
          </div>
 
          {/* Item grid */}
          {loading ? <LoadingSpinner /> : (
            <div
              className="row row-cols-2 row-cols-md-3 row-cols-xl-4 g-2"
              style={{ overflowY: 'auto', maxHeight: 480 }}
            >
              {filtered.map(item => {
                const qty = cartQtyFor(item.id);
                const oos = !item.is_available;
                return (
                  <div key={item.id} className="col">
                    <div
                      className="card border-0 text-center position-relative h-100"
                      style={{
                        borderRadius: 14,
                        cursor: oos ? 'not-allowed' : 'pointer',
                        opacity: oos ? 0.55 : 1,
                        background: qty > 0 ? '#fff7ed' : '#f8fafc',
                        border: `2px solid ${qty > 0 ? '#f97316' : 'transparent'}`,
                        transition: 'all 0.15s',
                      }}
                      onClick={() => !oos && addItem(item)}
                    >
                      <div className="card-body p-2 d-flex flex-column align-items-center justify-content-center gap-1">
                        <div style={{ fontSize: 30 }}>🍽️</div>
                        <div className="fw-semibold text-center" style={{ fontSize: '0.78rem', color: '#1e293b', lineHeight: 1.3 }}>
                          {item.name}
                        </div>
                        <div className="fw-bold" style={{ color: '#f97316', fontSize: '0.85rem' }}>
                          ₱{parseFloat(item.price).toFixed(2)}
                        </div>
                        {oos && (
                          <span className="badge" style={{ background: '#ef4444', fontSize: '0.65rem' }}>Out of Stock</span>
                        )}
                      </div>
                      {qty > 0 && (
                        <span
                          className="position-absolute top-0 end-0 m-1 badge rounded-circle d-flex align-items-center justify-content-center"
                          style={{ width: 22, height: 22, background: '#f97316', fontSize: 11, fontWeight: 700 }}
                        >
                          {qty}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
 
        {/* ── Right Panel: Cart ── */}
        <div className="col-lg-5">
          <div
            className="card border-0 shadow-sm d-flex flex-column"
            style={{ borderRadius: 16, height: '100%', minHeight: 520 }}
          >
            {/* Cart header */}
            <div className="d-flex align-items-center justify-content-between px-4 py-3"
              style={{ borderBottom: '1px solid #f1f5f9' }}>
              <span className="fw-bold" style={{ color: '#1e293b' }}>🛒 Order</span>
              {itemCount > 0 && (
                <span className="badge rounded-pill px-2"
                  style={{ background: '#f97316', fontSize: '0.78rem' }}>
                  {itemCount} items
                </span>
              )}
            </div>
 
            {/* Cart items */}
            <div className="flex-grow-1 overflow-auto px-3 py-2" style={{ maxHeight: 240 }}>
              {cartItems.length === 0 ? (
                <div className="d-flex flex-column align-items-center justify-content-center h-100 text-muted py-4 gap-1">
                  <span style={{ fontSize: 38, opacity: 0.3 }}>🛒</span>
                  <span className="small">Cart is empty</span>
                  <span style={{ fontSize: '0.72rem' }}>Click items to add them</span>
                </div>
              ) : cartItems.map(i => (
                <div key={i.menu_item_id}
                  className="d-flex align-items-center justify-content-between py-2"
                  style={{ borderBottom: '1px solid #f8fafc' }}>
                  <div className="flex-grow-1">
                    <div className="fw-semibold small" style={{ color: '#1e293b' }}>{i.name}</div>
                    <div className="text-muted" style={{ fontSize: '0.72rem' }}>₱{i.price.toFixed(2)} each</div>
                    <div className="d-flex align-items-center gap-1 mt-1">
                      <button className="btn btn-sm d-flex align-items-center justify-content-center"
                        style={{ width: 26, height: 26, background: '#fee2e2', border: 'none', borderRadius: 8, color: '#dc2626', fontWeight: 700 }}
                        onClick={() => updateQty(i.menu_item_id, i.quantity - 1)}>−</button>
                      <span className="fw-bold small mx-1">{i.quantity}</span>
                      <button className="btn btn-sm d-flex align-items-center justify-content-center"
                        style={{ width: 26, height: 26, background: '#f1f5f9', border: 'none', borderRadius: 8, fontWeight: 700 }}
                        onClick={() => updateQty(i.menu_item_id, i.quantity + 1)}
                        disabled={i.quantity >= i.max_qty}>+</button>
                      <button className="btn btn-sm ms-1"
                        style={{ background: 'transparent', border: 'none', padding: '0 4px', fontSize: 14 }}
                        onClick={() => removeItem(i.menu_item_id)}>🗑️</button>
                    </div>
                  </div>
                  <span className="fw-bold ms-2" style={{ color: '#1e293b', fontSize: '0.9rem' }}>
                    ₱{(i.price * i.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
 
            {/* Cart footer */}
            <div className="px-4 py-3" style={{ borderTop: '1px solid #f1f5f9' }}>
              {/* Total */}
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="text-muted small">Subtotal</span>
                <span className="fw-semibold">₱{total.toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="fw-bold" style={{ color: '#1e293b' }}>TOTAL</span>
                <span className="fw-bold" style={{ color: '#f97316', fontSize: '1.2rem' }}>₱{total.toFixed(2)}</span>
              </div>
 
              {/* Payment method */}
              <div className="mb-3">
                <div className="text-muted small fw-semibold mb-2 text-uppercase" style={{ letterSpacing: '0.5px' }}>Payment Method</div>
                <div className="d-flex gap-2">
                  {PAYMENT_METHODS.map(m => (
                    <button key={m.key} className="btn btn-sm flex-fill fw-semibold"
                      onClick={() => setPayment(m.key)}
                      style={{
                        borderRadius: 10,
                        border: `2px solid ${payment === m.key ? '#f97316' : '#e2e8f0'}`,
                        background:   payment === m.key ? '#fff7ed' : '#fff',
                        color:        payment === m.key ? '#f97316' : '#64748b',
                      }}>
                      {m.icon} {m.label}
                    </button>
                  ))}
                </div>
              </div>
 
              {/* Checkout button */}
              <button
                className="btn w-100 fw-bold text-white mb-2"
                style={{ background: cartItems.length ? '#f97316' : '#e2e8f0', border: 'none', borderRadius: 12, padding: '12px', fontSize: '0.95rem' }}
                onClick={handleCheckout}
                disabled={placing || !cartItems.length}
              >
                {placing
                  ? <><span className="spinner-border spinner-border-sm me-2" />Processing…</>
                  : `✅ Checkout · ₱${total.toFixed(2)}`}
              </button>
 
              {cartItems.length > 0 && (
                <button className="btn w-100 btn-sm"
                  style={{ background: 'transparent', color: '#94a3b8', border: 'none' }}
                  onClick={clearCart}>
                  🗑️ Clear Cart
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
 
      {receipt && <OrderReceipt order={receipt} onClose={() => setReceipt(null)} />}
    </div>
  );
}
