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

  const isAdmin    = useCallback(() => user?.role === 'admin',    [user]);
  const isCashier  = useCallback(() => user?.role === 'cashier',  [user]);
  const isCustomer = useCallback(() => user?.role === 'customer', [user]);

  const canManageMenu      = useCallback(() => isAdmin(), [isAdmin]);
  const canProcessOrder    = useCallback(() => isAdmin() || isCashier(), [isAdmin, isCashier]);
  const canViewInventory   = useCallback(() => isAdmin() || isCashier(), [isAdmin, isCashier]);
  const canManageInventory = useCallback(() => isAdmin(), [isAdmin]);
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