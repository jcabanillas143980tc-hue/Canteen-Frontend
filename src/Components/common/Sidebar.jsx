import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
 
const LINKS = {
  admin: [
    { section: 'MAIN' },
    { to: '/dashboard', icon: '📊', label: 'Dashboard'     },
    { to: '/pos',       icon: '🧾', label: 'Point of Sale' },
    { section: 'MANAGE' },
    { to: '/orders',    icon: '📋', label: 'Orders'        },
    { to: '/menu',      icon: '🍱', label: 'Menu'          },
    { to: '/inventory', icon: '📦', label: 'Inventory'     },
    { section: 'SYSTEM' },
    { to: '/users',     icon: '👥', label: 'Users'         },
  ],
  cashier: [
    { section: 'ORDERS' },
    { to: '/cashier/pos',       icon: '🧾', label: 'Point of Sale' },
    { to: '/cashier/orders',    icon: '📋', label: 'Order Queue'   },
    { section: 'VIEW' },
    { to: '/cashier/menu',      icon: '🍱', label: 'Menu'          },
    { to: '/cashier/inventory', icon: '📦', label: 'Inventory'     },
  ],
  customer: [
    { section: 'BROWSE' },
    { to: '/browse',    icon: '🍱', label: 'Browse Menu' },
    { section: 'ORDERS' },
    { to: '/checkout',  icon: '🛒', label: 'My Cart'    },
    { to: '/my-orders', icon: '📋', label: 'My Orders'  },
  ],
};
 
export function Sidebar({ collapsed }) {
  const { user, logout } = useAuth();
  const links = LINKS[user?.role] || [];
 
  return (
    <aside
      className="d-flex flex-column"
      style={{
        width: '100%',
        height: '100%',
        background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
        color: '#fff',
        overflow: 'hidden',
      }}
    >
      {/* Brand */}
      <div
        className="d-flex align-items-center gap-3 px-4"
        style={{ height: 64, borderBottom: '1px solid rgba(255,255,255,0.08)', flexShrink: 0 }}
      >
        <div
          className="d-flex align-items-center justify-content-center rounded-3 flex-shrink-0"
          style={{ width: 38, height: 38, background: '#f97316', fontSize: 20 }}
        >
          🍱
        </div>
        {!collapsed && (
          <div>
            <div className="fw-bold" style={{ fontSize: '0.95rem', letterSpacing: '-0.3px' }}>CanteenPro</div>
            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.45)' }}>Management System</div>
          </div>
        )}
      </div>
 
      {/* Nav Links */}
      <nav className="flex-grow-1 py-3 px-2" style={{ overflowY: 'auto' }}>
        {links.map((item, i) =>
          item.section ? (
            !collapsed && (
              <div
                key={i}
                className="px-3 mb-1 mt-3"
                style={{ fontSize: '0.65rem', fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.8px' }}
              >
                {item.section}
              </div>
            )
          ) : (
            <NavLink
              key={item.to}
              to={item.to}
              title={collapsed ? item.label : ''}
              className="d-flex align-items-center gap-3 rounded-3 text-decoration-none mb-1"
              style={({ isActive }) => ({
                padding: collapsed ? '10px 12px' : '10px 14px',
                background: isActive ? 'rgba(249,115,22,0.18)' : 'transparent',
                color: isActive ? '#f97316' : 'rgba(255,255,255,0.65)',
                fontWeight: isActive ? 600 : 400,
                fontSize: '0.875rem',
                transition: 'all 0.15s',
                borderLeft: isActive ? '3px solid #f97316' : '3px solid transparent',
              })}
            >
              <span style={{ fontSize: 18, flexShrink: 0 }}>{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          )
        )}
      </nav>
 
      {/* Footer: user + logout */}
      <div
        className="px-3 py-3"
        style={{ borderTop: '1px solid rgba(255,255,255,0.08)', flexShrink: 0 }}
      >
        {/* User info */}
        <div className="d-flex align-items-center gap-3 mb-2">
          <div
            className="rounded-circle d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
            style={{ width: 36, height: 36, background: '#f97316', fontSize: 14, color: '#fff' }}
          >
            {user?.name?.[0]?.toUpperCase()}
          </div>
          {!collapsed && (
            <div style={{ overflow: 'hidden' }}>
              <div className="fw-semibold text-truncate" style={{ fontSize: '0.82rem', color: '#fff' }}>{user?.name}</div>
              <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.45)', textTransform: 'capitalize' }}>{user?.role}</div>
            </div>
          )}
        </div>
 
        {/* Logout */}
        <button
          className="btn w-100 d-flex align-items-center gap-2"
          style={{
            background: 'rgba(255,255,255,0.06)',
            color: 'rgba(255,255,255,0.55)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 10,
            fontSize: '0.82rem',
            padding: collapsed ? '8px 0' : '8px 14px',
            justifyContent: collapsed ? 'center' : 'flex-start',
          }}
          onClick={logout}
        >
          <span>🚪</span>
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
 
export default Sidebar;