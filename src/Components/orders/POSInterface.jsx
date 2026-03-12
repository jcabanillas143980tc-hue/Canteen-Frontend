import { useState, useEffect, useCallback } from 'react';
import api               from '../../services/api';
import { orderService }  from '../../services/orderService';
import { useCart }      from '../../context/CartContext';
import OrderReceipt     from './OrderReceipt';
import LoadingSpinner   from '../common/LoadingSpinner';
import './POSInterface.css';

const PAYMENT_METHODS = [
  { key: 'cash',   icon: '💵', label: 'Cash' },
  { key: 'gcash',  icon: '📱', label: 'GCash' },
  { key: 'card',   icon: '💳', label: 'Card' },
];

export default function POSInterface() {
  const { items: cartItems, addItem, removeItem, updateQty, clearCart, total, itemCount } = useCart();
  const [menuItems,   setMenuItems]   = useState([]);
  const [categories,  setCategories]  = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState('');
  const [catFilter,   setCatFilter]   = useState('');
  const [payment,     setPayment]     = useState('cash');
  const [placing,     setPlacing]     = useState(false);
  const [receipt,     setReceipt]     = useState(null);

  const loadMenu = useCallback(async () => {
    setLoading(true);
    try {
      const [m, c] = await Promise.all([api.get('/menu', { params: { available: 1 } }), api.get('/categories')]);
      setMenuItems(m.data.data || m.data);
      setCategories(c.data);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadMenu(); }, [loadMenu]);

  const filtered = menuItems.filter(i => {
    const matchSearch = !search || i.name.toLowerCase().includes(search.toLowerCase());
    const matchCat    = !catFilter || i.category_id == catFilter;
    return matchSearch && matchCat;
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

  const cartQtyFor = (id) => cartItems.find(i => i.menu_item_id === id)?.quantity || 0;

  return (
    <div className="pos-page">
      <h1 className="page-title">🧾 Point of Sale</h1>
      <div className="pos-layout">

        {/* ── Left: Menu ── */}
        <div className="pos-menu-panel">
          <div className="pos-toolbar">
            <div className="pos-search-wrap">
              <input className="pos-search" placeholder="Search items…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
          <div className="pos-cats">
            <button className={`cat-btn ${!catFilter ? 'active' : ''}`} onClick={() => setCatFilter('')}>All</button>
            {categories.map(c => (
              <button key={c.id} className={`cat-btn ${catFilter == c.id ? 'active' : ''}`} onClick={() => setCatFilter(c.id)}>
                {c.icon} {c.name}
              </button>
            ))}
          </div>
          {loading ? <LoadingSpinner /> : (
            <div className="pos-items">
              {filtered.map(item => {
                const qty = cartQtyFor(item.id);
                return (
                  <div
                    key={item.id}
                    className={`pos-item ${!item.is_available ? 'oos' : ''}`}
                    onClick={() => item.is_available && addItem(item)}
                  >
                    <span className="pos-item-emoji">🍽️</span>
                    <span className="pos-item-name">{item.name}</span>
                    <span className="pos-item-price">₱{parseFloat(item.price).toFixed(2)}</span>
                    {qty > 0 && <span className="pos-item-in-cart">{qty}</span>}
                    {!item.is_available && <div className="pos-oos-tag">Out of Stock</div>}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Right: Cart ── */}
        <div className="pos-cart">
          <div className="cart-header">
            <span className="cart-title">🛒 Order</span>
            {itemCount > 0 && <span className="cart-count-pill">{itemCount} items</span>}
          </div>

          {cartItems.length === 0 ? (
            <div className="cart-empty">
              <div className="cart-empty-icon">🛒</div>
              <p>Cart is empty</p>
              <small>Click items to add them</small>
            </div>
          ) : (
            <div className="cart-items">
              {cartItems.map(i => (
                <div key={i.menu_item_id} className="cart-item">
                  <div>
                    <div className="cart-item-name">{i.name}</div>
                    <div className="cart-item-price">₱{i.price.toFixed(2)} each</div>
                    <div className="qty-controls">
                      <button className="qty-btn qty-del" onClick={() => updateQty(i.menu_item_id, i.quantity - 1)}>−</button>
                      <span className="qty-num">{i.quantity}</span>
                      <button className="qty-btn" onClick={() => updateQty(i.menu_item_id, i.quantity + 1)} disabled={i.quantity >= i.max_qty}>+</button>
                      <button className="qty-btn qty-del" onClick={() => removeItem(i.menu_item_id)}>🗑️</button>
                    </div>
                  </div>
                  <span className="cart-item-sub">₱{(i.price * i.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}

          <div className="cart-footer">
            <div className="cart-totals">
              <div className="cart-row"><span>Subtotal</span><span>₱{total.toFixed(2)}</span></div>
              <div className="cart-total"><span>TOTAL</span><span>₱{total.toFixed(2)}</span></div>
            </div>

            <div className="payment-section">
              <div className="payment-label">PAYMENT METHOD</div>
              <div className="pay-grid">
                {PAYMENT_METHODS.map(m => (
                  <button key={m.key} className={`pay-btn ${payment === m.key ? 'active' : ''}`} onClick={() => setPayment(m.key)}>
                    <span className="pay-icon">{m.icon}</span>
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            <button className="btn-checkout" onClick={handleCheckout} disabled={placing || !cartItems.length}>
              {placing ? '⏳ Processing…' : `✅ Checkout · ₱${total.toFixed(2)}`}
            </button>
            {cartItems.length > 0 && (
              <button className="btn-clear" onClick={clearCart}>Clear Cart</button>
            )}
          </div>
        </div>
      </div>

      {receipt && <OrderReceipt order={receipt} onClose={() => setReceipt(null)} />}
    </div>
  );
}