import { useState, useEffect, useCallback } from 'react';
import api            from '../../services/api';
import { useAuth }    from '../../context/AuthContext';
import { useCart }    from '../../context/CartContext';
import MenuItemCard   from './MenuItemCard';
import MenuForm       from './MenuForm';
import LoadingSpinner from '../common/LoadingSpinner';
 
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
      if (customerView) params.available   = 1;
 
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
 
  const canManage  = canManageMenu() && !customerView;
  const cashierOnly = isCashier();
 
  const pageTitle = customerView      ? '🍱 Browse Menu'
    : cashierOnly                     ? '🍱 Menu (View Only)'
    :                                   '🍱 Menu Management';
 
  return (
    <div className="d-flex flex-column gap-3">
 
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
        <div className="d-flex align-items-center gap-2">
          <h4 className="fw-bold mb-0" style={{ color: '#1e293b' }}>{pageTitle}</h4>
          {cashierOnly && !customerView && (
            <span className="badge"
              style={{ background: '#eff6ff', color: '#3b82f6', fontWeight: 600 }}>
              View Only
            </span>
          )}
        </div>
        {canManage && (
          <button className="btn fw-semibold text-white"
            style={{ background: '#f97316', border: 'none', borderRadius: 10 }}
            onClick={() => { setEditItem(null); setShowForm(true); }}>
            ➕ Add Item
          </button>
        )}
      </div>
 
      {/* Search + Category filter pills */}
      <div className="d-flex flex-column gap-2">
        <input
          className="form-control"
          style={{ maxWidth: 320 }}
          placeholder="🔍 Search menu items…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="d-flex flex-wrap gap-2">
          {/* "All" pill */}
          <button
            className="btn btn-sm fw-semibold"
            onClick={() => setCatFilter('')}
            style={{
              borderRadius: 20,
              border: `1.5px solid ${!catFilter ? '#f97316' : '#e2e8f0'}`,
              background:   !catFilter ? '#f97316' : '#fff',
              color:        !catFilter ? '#fff'    : '#64748b',
            }}
          >All</button>
 
          {/* Category pills */}
          {categories.map(c => (
            <button
              key={c.id}
              className="btn btn-sm fw-semibold"
              onClick={() => setCatFilter(c.id)}
              style={{
                borderRadius: 20,
                border: `1.5px solid ${catFilter == c.id ? '#f97316' : '#e2e8f0'}`,
                background:   catFilter == c.id ? '#f97316' : '#fff',
                color:        catFilter == c.id ? '#fff'    : '#64748b',
              }}
            >
              {c.icon} {c.name}
            </button>
          ))}
        </div>
      </div>
 
      {/* Grid / empty state */}
      {loading ? <LoadingSpinner /> : (
        items.length === 0 ? (
          <div className="d-flex flex-column align-items-center justify-content-center py-5 text-muted gap-2">
            <span style={{ fontSize: 56, opacity: 0.3 }}>🍽️</span>
            <p className="mb-0">No menu items found.</p>
          </div>
        ) : (
          <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-xl-4 g-3">
            {items.map(item => (
              <div key={item.id} className="col">
                <MenuItemCard
                  item={item}
                  canManage={canManage}
                  customerView={customerView}
                  onEdit={i  => { setEditItem(i); setShowForm(true); }}
                  onToggle={handleToggle}
                  onDelete={handleDelete}
                  onAddToCart={i => addItem(i)}
                />
              </div>
            ))}
          </div>
        )
      )}
 
      {/* Add / Edit modal */}
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