import { createContext, useContext, useState, useCallback } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  const addItem = useCallback((menuItem, qty = 1) => {
    setItems(prev => {
      const exists = prev.find(i => i.menu_item_id === menuItem.id);
      if (exists) {
        return prev.map(i =>
          i.menu_item_id === menuItem.id
            ? { ...i, quantity: Math.min(i.quantity + qty, i.max_qty) }
            : i
        );
      }
      return [...prev, {
        menu_item_id: menuItem.id,
        name:    menuItem.name,
        price:   parseFloat(menuItem.price),
        quantity: qty,
        max_qty: menuItem.stock_quantity,
      }];
    });
  }, []);

  const removeItem = useCallback((id) => setItems(p => p.filter(i => i.menu_item_id !== id)), []);

  const updateQty = useCallback((id, qty) => {
    if (qty <= 0) { removeItem(id); return; }
    setItems(p => p.map(i => i.menu_item_id === id ? { ...i, quantity: Math.min(qty, i.max_qty) } : i));
  }, [removeItem]);

  const clearCart = useCallback(() => setItems([]), []);

  const total     = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const itemCount = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clearCart, total, itemCount }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
};