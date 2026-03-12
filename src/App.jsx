import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider }    from './context/AuthContext';
import { CartProvider }    from './context/CartContext';
import ProtectedRoute      from './Components/auth/ProtectedRoute';
import Login               from './Components/auth/Login';
import Layout              from './Components/common/Layout';
import ErrorBoundary       from './Components/common/ErrorBoundary';
import OrderQueue, { CustomerCheckout } from './Components/orders/OrderQueue';
import AdminDashboard, { UserManagement } from './Components/dashboard/AdminDashboard';


/* Menu */
import MenuList from './Components/menu/MenuList';

/* Orders — also contains CustomerCheckout as named export */
import POSInterface from './Components/orders/POSInterface';

/* Inventory */
import InventoryTable from './Components/inventory/InventoryTable';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <ErrorBoundary>
            <Routes>

              {/* ── Public ── */}
              <Route path="/login" element={<Login />} />

              {/* ══════════════════════════════════
                  ADMIN — full access
                  Dashboard, POS, Orders, Menu (CRUD),
                  Inventory (full), User Management
              ══════════════════════════════════ */}
              <Route element={<ProtectedRoute roles={['admin']} />}>
                <Route element={<Layout />}>
                  <Route path="/dashboard"  element={<AdminDashboard />} />
                  <Route path="/pos"        element={<POSInterface />} />
                  <Route path="/orders"     element={<OrderQueue />} />
                  <Route path="/menu"       element={<MenuList />} />
                  <Route path="/inventory"  element={<InventoryTable />} />
                  <Route path="/users"      element={<UserManagement />} />
                </Route>
              </Route>

              {/* ══════════════════════════════════
                  CASHIER — POS + Orders +
                  view-only Menu + basic Inventory
              ══════════════════════════════════ */}
              <Route element={<ProtectedRoute roles={['cashier']} />}>
                <Route element={<Layout />}>
                  <Route path="/cashier/pos"       element={<POSInterface />} />
                  <Route path="/cashier/orders"    element={<OrderQueue />} />
                  <Route path="/cashier/menu"      element={<MenuList />} />
                  <Route path="/cashier/inventory" element={<InventoryTable cashierView />} />
                </Route>
              </Route>

              {/* ══════════════════════════════════
                  CUSTOMER — browse, cart/checkout,
                  order history
              ══════════════════════════════════ */}
              <Route element={<ProtectedRoute roles={['customer']} />}>
                <Route element={<Layout />}>
                  <Route path="/browse"    element={<MenuList customerView />} />
                  <Route path="/checkout"  element={<CustomerCheckout />} />
                  <Route path="/my-orders" element={<OrderQueue customerView />} />
                </Route>
              </Route>

              {/* ── Fallback ── */}
              <Route path="/"  element={<Navigate to="/login" replace />} />
              <Route path="*"  element={<Navigate to="/login" replace />} />

            </Routes>
          </ErrorBoundary>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}