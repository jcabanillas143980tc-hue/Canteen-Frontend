import { useState, useEffect, useCallback } from 'react';
import api            from '../../services/api';
import LowStockAlert  from './LowStockAlert';
import LoadingSpinner from '../common/LoadingSpinner';
import './InventoryTable.css';

function AdjustModal({ item, cashierView, onSave, onClose }) {
  const [qty,    setQty]    = useState('');
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState('');

  const handleSave = async () => {
    if (!reason.trim() || !qty) { setError('Both fields are required.'); return; }
    setSaving(true); setError('');
    try {
      // Backend route is PATCH /inventory/{id}/adjust
      await api.patch(`/inventory/${item.id}/adjust`, {
        quantity_change: parseInt(qty),
        reason,
      });
      onSave();
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to save. Check console for details.');
    } finally { setSaving(false); }
  };

  const newStock = Math.max(0, (item.stock_quantity || 0) + parseInt(qty || 0));

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>✏️ Adjust Stock — {item.name}</h2>
          <button onClick={onClose} className="modal-close">✕</button>
        </div>
        <div className="modal-body">
          <div className="current-stock">Current stock: <strong>{item.stock_quantity}</strong> units</div>
          {error && <div className="adj-error">⚠️ {error}</div>}
          <div className="form-group">
            <label>Quantity Change (use − to deduct)</label>
            <input type="number" value={qty} onChange={e => setQty(e.target.value)} placeholder="e.g. 50 or -5" />
          </div>
          <div className="form-group">
            <label>Reason *</label>
            <input value={reason} onChange={e => setReason(e.target.value)} placeholder="e.g. Weekly restock delivery" />
          </div>
          {qty !== '' && (
            <div className="stock-preview">
              New stock: <strong style={{ color: parseInt(qty) >= 0 ? '#16a34a' : '#dc2626' }}>{newStock}</strong>
            </div>
          )}
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving || !reason.trim() || !qty}>
              {saving ? 'Saving…' : 'Save Adjustment'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function InventoryTable({ cashierView = false }) {
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [search,  setSearch]  = useState('');
  const [adjust,  setAdjust]  = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/inventory');
      // Backend returns a plain array (not paginated)
      setItems(Array.isArray(data) ? data : data.data || []);
    } catch (e) {
      setError(
        e.response?.status === 403
          ? 'Access denied. Only Admin and Cashier can view inventory.'
          : e.response?.data?.message || `Error ${e.response?.status}: Could not load inventory. Is Laravel running on port 8000?`
      );
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = items.filter(i =>
    !search || i.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="inv-page">
      <div className="inv-header">
        <h1 className="page-title">
          {cashierView ? '📦 Inventory (View & Adjust)' : '📦 Inventory Management'}
        </h1>
        {cashierView && <span className="cashier-badge">Cashier — adjust stock only</span>}
      </div>

      {error && (
        <div className="inv-error">
          ⚠️ {error}
          <button className="btn btn-secondary btn-sm" style={{ marginLeft:12 }} onClick={load}>Retry</button>
        </div>
      )}

      <LowStockAlert items={items} />

      <div className="inv-toolbar">
        <div className="search-box">
          <input className="search-input" placeholder="Search items…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <button className="btn btn-secondary" onClick={load}>🔄 Refresh</button>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="table-card">
          <table className="inv-table">
            <thead>
              <tr>
                <th>Item</th><th>Category</th><th>Price</th>
                <th>Stock</th><th>Status</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign:'center', padding:40, color:'#94a3b8' }}>
                  {items.length === 0 ? 'No items in database. Run: php artisan db:seed' : 'No items match your search.'}
                </td></tr>
              ) : filtered.map(item => (
                <tr key={item.id} className={item.is_low_stock ? 'row-warn' : ''}>
                  <td>
                    <div className="item-name">{item.name}</div>
                    {item.is_low_stock && <div className="item-warn">⚠️ Low Stock</div>}
                  </td>
                  <td><span className="cat-tag">{item.category?.icon} {item.category?.name}</span></td>
                  <td>₱{parseFloat(item.price || 0).toFixed(2)}</td>
                  <td>
                    <div className="stock-cell">
                      <div className="stock-bar">
                        <div className="stock-fill" style={{
                          width: `${Math.min(100, ((item.stock_quantity||0) / Math.max(item.stock_quantity||0, 50)) * 100)}%`,
                          background: item.is_low_stock ? '#ef4444' : '#10b981',
                        }} />
                      </div>
                      <span className="stock-num">{item.stock_quantity}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${item.is_available ? 'badge-green' : 'badge-red'}`}>
                      {item.is_available ? 'Available' : 'Unavailable'}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-secondary btn-sm" onClick={() => setAdjust(item)}>
                      ✏️ Adjust
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {adjust && (
        <AdjustModal
          item={adjust} cashierView={cashierView}
          onSave={() => { setAdjust(null); load(); }}
          onClose={() => setAdjust(null)}
        />
      )}
    </div>
  );
}