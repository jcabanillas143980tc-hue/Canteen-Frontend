import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import './Navbar.css';

const PAGE_TITLES = {
  '/dashboard':           '📊 Dashboard',
  '/pos':                 '🧾 Point of Sale',
  '/orders':              '📋 Order Queue',
  '/menu':                '🍱 Menu Management',
  '/inventory':           '📦 Inventory',
  '/users':               '👥 User Management',
  '/cashier/pos':         '🧾 Point of Sale',
  '/cashier/orders':      '📋 Order Queue',
  '/cashier/menu':        '🍱 Menu',
  '/cashier/inventory':   '📦 Inventory',
  '/browse':              '🍱 Browse Menu',
  '/checkout':            '🛒 My Cart',
  '/my-orders':           '📋 My Orders',
};

export default function Navbar({ collapsed, onToggle }) {
  const { isAdmin, isCashier, isCustomer } = useAuth();
  const { itemCount } = useCart();
  const location = useLocation();
  const title = PAGE_TITLES[location.pathname] || 'CanteenPro';

  /* Cart destination depends on role */
  const cartTo = isCustomer() ? '/checkout' : (isAdmin() ? '/pos' : '/cashier/pos');

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="collapse-btn" onClick={onToggle} aria-label="Toggle sidebar">
          {collapsed ? '☰' : '✕'}
        </button>
        <span className="topbar-title">{title}</span>
      </div>

      <div className="topbar-right">
        {/* Cart pill — visible to ALL roles */}
        <NavLink to={cartTo} className="cart-pill">
          🛒 {isCustomer() ? 'Cart' : 'Cart'}
          {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
        </NavLink>
      </div>
    </header>
  );
}