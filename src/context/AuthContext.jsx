import { createContext, useContext, useState, useCallback } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(() => {
    try { return JSON.parse(localStorage.getItem('user') || 'null'); }
    catch { return null; }
  });
  const [loading, setLoading] = useState(false);

  const login = async (credentials) => {
    setLoading(true);
    try {
      const { data } = await authService.login(credentials);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user',  JSON.stringify(data.user));
      setUser(data.user);
      return data.user;
    } finally { setLoading(false); }
  };

  const logout = useCallback(async () => {
    try { await authService.logout(); } catch (_) {}
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  /* ── Role helpers ── */
  const isAdmin    = useCallback(() => user?.role === 'admin',    [user]);
  const isCashier  = useCallback(() => user?.role === 'cashier',  [user]);
  const isCustomer = useCallback(() => user?.role === 'customer', [user]);

  /* ── Permission helpers ── */
  // Only admin can add/edit/delete menu items
  const canManageMenu      = useCallback(() => isAdmin(), [isAdmin]);
  // Admin & cashier can process (advance status) orders
  const canProcessOrder    = useCallback(() => isAdmin() || isCashier(), [isAdmin, isCashier]);
  // Admin & cashier can view full inventory; cashier can adjust stock
  const canViewInventory   = useCallback(() => isAdmin() || isCashier(), [isAdmin, isCashier]);
  // Only admin can do bulk restocks or full inventory management
  const canManageInventory = useCallback(() => isAdmin(), [isAdmin]);
  // Only admin can manage users
  const canManageUsers     = useCallback(() => isAdmin(), [isAdmin]);

  return (
    <AuthContext.Provider value={{
      user, loading, login, logout,
      isAdmin, isCashier, isCustomer,
      canManageMenu, canProcessOrder,
      canViewInventory, canManageInventory, canManageUsers,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};