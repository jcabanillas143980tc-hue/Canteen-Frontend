import { useState, useEffect, useCallback } from 'react';
import api            from '../../services/api';
import { useAuth }    from '../../context/AuthContext';
import { useCart }    from '../../context/CartContext';
import MenuItemCard   from './MenuItemCard';
import MenuForm       from './MenuForm';
import LoadingSpinner from '../common/LoadingSpinner';
import './MenuList.css';

/*
  Props:
    customerView — customer browsing: only available items, add-to-cart buttons
    (default)    — admin: full CRUD panel
    (cashier)    — read-only view: no CRUD, no add-to-cart, canManage=false
                   detected by role via canManageMenu()
*/
export default function MenuList({ customerView = false }) {
  const { canManageMenu, isCashier } = useAuth();
  const { addItem } = useCart();

  const [items,      setItems]      = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [catFilter,  setCatFilter]  = useState('');
  const [showForm,   setShowForm]   = useState(false);
  const [editItem,   setEditItem]   = useState(null);

  const fetchMenu = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search)       params.search      = search;
      if (catFilter)    params.category_id = catFilter;
      if (customerView) params.available   = 1;   // customer sees available only

      const [menuRes, catRes] = await Promise.all([
        api.get('/menu', { params }),
        api.get('/categories'),
      ]);
      setItems(menuRes.data.data || menuRes.data);
      setCategories(catRes.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [search, catFilter, customerView]);

  useEffect(() => { fetchMenu(); }, [fetchMenu]);

  const handleDelete = async (item) => {
    if (!confirm(`Delete "${item.name}"?`)) return;
    await api.delete(`/menu/${item.id}`);
    fetchMenu();
  };

  const handleToggle = async (item) => {
    await api.patch(`/menu/${item.id}/toggle`);
    fetchMenu();
  };

  /* Admin = can CRUD; cashier = view only; customer = add to cart only */
  const canManage   = canManageMenu() && !customerView;  // admin only
  const cashierView = isCashier();                        // read-only label

  const pageTitle = customerView
    ? '🍱 Browse Menu'
    : cashierView
    ? '🍱 Menu (View Only)'
    : '🍱 Menu Management';

  return (
    <div className="menu-page">
      <div className="menu-header">
        <h1 className="page-title">{pageTitle}</h1>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          {cashierView && !customerView && (
            <span className="view-only-badge">View Only</span>
          )}
          {canManage && (
            <button
              className="btn btn-primary"
              onClick={() => { setEditItem(null); setShowForm(true); }}
            >
              ➕ Add Item
            </button>
          )}
        </div>
      </div>

      <div className="menu-toolbar">
        <div className="filter-row">
          <div className="search-box">
            <input
              className="search-input"
              placeholder="Search menu items…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="cat-filters">
          <button
            className={`cat-btn ${!catFilter ? 'active' : ''}`}
            onClick={() => setCatFilter('')}
          >All</button>
          {categories.map(c => (
            <button
              key={c.id}
              className={`cat-btn ${catFilter == c.id ? 'active' : ''}`}
              onClick={() => setCatFilter(c.id)}
            >
              {c.icon} {c.name}
            </button>
          ))}
        </div>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="menu-grid">
          {items.length === 0
            ? <div className="empty-state"><span>🍽️</span><p>No menu items found.</p></div>
            : items.map(item => (
              <MenuItemCard
                key={item.id}
                item={item}
                canManage={canManage}
                customerView={customerView}
                onEdit={i  => { setEditItem(i); setShowForm(true); }}
                onToggle={handleToggle}
                onDelete={handleDelete}
                onAddToCart={i => addItem(i)}
              />
            ))
          }
        </div>
      )}

      {showForm && (
        <MenuForm
          item={editItem}
          categories={categories}
          onSave={() => { setShowForm(false); fetchMenu(); }}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}