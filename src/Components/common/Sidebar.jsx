import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

const LINKS = {
  admin: [
    { section: 'Main' },
    { to: '/dashboard',  icon: '📊', label: 'Dashboard'     },
    { to: '/pos',        icon: '🧾', label: 'Point of Sale' },
    { section: 'Manage' },
    { to: '/orders',     icon: '📋', label: 'Orders'        },
    { to: '/menu',       icon: '🍱', label: 'Menu'          },
    { to: '/inventory',  icon: '📦', label: 'Inventory'     },
    { section: 'System' },
    { to: '/users',      icon: '👥', label: 'Users'         },
  ],
  cashier: [
    { section: 'Orders' },
    { to: '/cashier/pos',       icon: '🧾', label: 'Point of Sale' },
    { to: '/cashier/orders',    icon: '📋', label: 'Order Queue'   },
    { section: 'View' },
    { to: '/cashier/menu',      icon: '🍱', label: 'Menu'          },
    { to: '/cashier/inventory', icon: '📦', label: 'Inventory'     },
  ],
  customer: [
    { section: 'Browse' },
    { to: '/browse',    icon: '🍱', label: 'Browse Menu' },
    { section: 'Orders' },
    { to: '/checkout',  icon: '🛒', label: 'My Cart'    },
    { to: '/my-orders', icon: '📋', label: 'My Orders'  },
  ],
};

export default function Sidebar({ collapsed }) {
  const { user, logout } = useAuth();
  const links = LINKS[user?.role] || [];

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-brand">
        <div className="brand-icon">🍱</div>
        <div className="brand-text">
          <span className="brand-name">CanteenPro</span>
          <span className="brand-sub">Management System</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {links.map((item, i) =>
          item.section ? (
            <div key={i} className="nav-section">{item.section}</div>
          ) : (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              title={collapsed ? item.label : ''}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </NavLink>
          )
        )}
      </nav>

      <div className="sidebar-footer">
        <div className="user-card">
          <div className="user-avatar">{user?.name?.[0]?.toUpperCase()}</div>
          <div className="user-info">
            <div className="user-name">{user?.name}</div>
            <div className="user-role-tag">{user?.role}</div>
          </div>
        </div>
        <button className="btn-logout" onClick={logout}>
          <span>🚪</span>
          <span className="logout-label">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}