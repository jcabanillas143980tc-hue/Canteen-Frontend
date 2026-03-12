import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
 
const PAGE_TITLES = {
  '/dashboard':         '📊 Dashboard',
  '/pos':               '🧾 Point of Sale',
  '/orders':            '📋 Order Queue',
  '/menu':              '🍱 Menu Management',
  '/inventory':         '📦 Inventory',
  '/users':             '👥 User Management',
  '/cashier/pos':       '🧾 Point of Sale',
  '/cashier/orders':    '📋 Order Queue',
  '/cashier/menu':      '🍱 Menu',
  '/cashier/inventory': '📦 Inventory',
  '/browse':            '🍱 Browse Menu',
  '/checkout':          '🛒 My Cart',
  '/my-orders':         '📋 My Orders',
};
 
export function Navbar({ collapsed, onToggle }) {
  const { isAdmin, isCashier, isCustomer } = useAuth();
  const { itemCount } = useCart();
  const location = useLocation();
  const title = PAGE_TITLES[location.pathname] || 'CanteenPro';
  const cartTo = isCustomer() ? '/checkout' : (isAdmin() ? '/pos' : '/cashier/pos');
 
  return (
    <header
      className="d-flex align-items-center justify-content-between px-4"
      style={{
        height: 64,
        background: '#fff',
        borderBottom: '1px solid #f1f5f9',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      {/* Left: toggle + title */}
      <div className="d-flex align-items-center gap-3">
        <button
          className="btn btn-sm btn-light d-flex align-items-center justify-content-center"
          style={{ width: 36, height: 36, borderRadius: 10, border: '1px solid #e2e8f0' }}
          onClick={onToggle}
          aria-label="Toggle sidebar"
        >
          {collapsed ? '☰' : '✕'}
        </button>
        <span className="fw-semibold" style={{ color: '#1e293b', fontSize: '0.95rem' }}>{title}</span>
      </div>
 
      {/* Right: Cart */}
      <NavLink
        to={cartTo}
        className="d-flex align-items-center gap-2 text-decoration-none px-3 py-2 rounded-3 fw-semibold"
        style={{ background: '#f97316', color: '#fff', fontSize: '0.85rem', position: 'relative' }}
      >
        🛒 Cart
        {itemCount > 0 && (
          <span
            className="d-flex align-items-center justify-content-center rounded-circle text-white fw-bold"
            style={{ width: 20, height: 20, background: '#fff', color: '#f97316', fontSize: 11 }}
          >
            {itemCount}
          </span>
        )}
      </NavLink>
    </header>
  );
}
 
export default Navbar;