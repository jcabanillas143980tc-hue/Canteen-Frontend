import { useState, useEffect, useCallback } from 'react';
import api            from '../../services/api';
import LowStockAlert  from './LowStockAlert';
import LoadingSpinner from '../common/LoadingSpinner';
 
function AdjustModal({ item, onSave, onClose }) {
  const [qty,    setQty]    = useState('');
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState('');
 
  const handleSave = async () => {
    if (!reason.trim() || !qty) { setError('Both fields are required.'); return; }
    setSaving(true); setError('');
    try {
      await api.patch(`/inventory/${item.id}/adjust`, {
        quantity_change: parseInt(qty),
        reason,
      });
      onSave();
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to save.');
    } finally { setSaving(false); }
  };
 
  const newStock = Math.max(0, (item.stock_quantity || 0) + parseInt(qty || 0));
  const isDeduct = parseInt(qty) < 0;
 
  return (
    <div className="modal d-block" style={{ background: 'rgba(15,23,42,0.5)' }} tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow" style={{ borderRadius: 16 }}>
 
          {/* Header */}
          <div className="modal-header border-0 px-4 pt-4 pb-2">
            <h5 className="modal-title fw-bold">✏️ Adjust Stock</h5>
            <button type="button" className="btn-close" onClick={onClose} />
          </div>
 
          {/* Body */}
          <div className="modal-body px-4 pb-2">
            {/* Item info */}
            <div className="rounded-3 p-3 mb-3 d-flex align-items-center justify-content-between"
              style={{ background: '#f8fafc' }}>
              <div>
                <div className="fw-semibold" style={{ color: '#1e293b' }}>{item.name}</div>
                <div className="text-muted small">{item.category?.name}</div>
              </div>
              <div className="text-end">
                <div className="fw-bold" style={{ fontSize: '1.3rem', color: '#1e293b' }}>{item.stock_quantity}</div>
                <div className="text-muted" style={{ fontSize: '0.72rem' }}>current stock</div>
              </div>
            </div>
 
            {error && (
              <div className="alert alert-danger py-2 small">⚠️ {error}</div>
            )}
 
            {/* Qty input */}
            <div className="mb-3">
              <label className="form-label fw-semibold small text-secondary">
                Quantity Change <span className="text-muted fw-normal">(use − to deduct)</span>
              </label>
              <input
                type="number"
                className="form-control"
                placeholder="e.g. 50 or -5"
                value={qty}
                onChange={e => setQty(e.target.value)}
              />
            </div>
 
            {/* Reason input */}
            <div className="mb-3">
              <label className="form-label fw-semibold small text-secondary">Reason *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Weekly restock delivery"
                value={reason}
                onChange={e => setReason(e.target.value)}
              />
            </div>
 
            {/* Preview */}
            {qty !== '' && (
              <div className="rounded-3 p-3 text-center"
                style={{ background: isDeduct ? '#fef2f2' : '#f0fdf4' }}>
                <div className="small text-muted mb-1">New stock will be</div>
                <div className="fw-bold" style={{ fontSize: '1.5rem', color: isDeduct ? '#dc2626' : '#16a34a' }}>
                  {newStock} units
                </div>
              </div>
            )}
          </div>
 
          {/* Footer */}
          <div className="modal-footer border-0 px-4 pb-4 pt-2 gap-2">
            <button className="btn btn-light" onClick={onClose}>Cancel</button>
            <button
              className="btn fw-semibold text-white"
              style={{ background: '#f97316', border: 'none', borderRadius: 10 }}
              onClick={handleSave}
              disabled={saving || !reason.trim() || !qty}
            >
              {saving
                ? <><span className="spinner-border spinner-border-sm me-1" />Saving…</>
                : '💾 Save Adjustment'}
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
    setLoading(true); setError('');
    try {
      const { data } = await api.get('/inventory');
      setItems(Array.isArray(data) ? data : data.data || []);
    } catch (e) {
      setError(
        e.response?.status === 403
          ? 'Access denied. Only Admin and Cashier can view inventory.'
          : e.response?.data?.message || `Error ${e.response?.status}: Could not load inventory.`
      );
    } finally { setLoading(false); }
  }, []);
 
  useEffect(() => { load(); }, [load]);
 
  const filtered = items.filter(i =>
    !search || i.name.toLowerCase().includes(search.toLowerCase())
  );
 
  return (
    <div className="d-flex flex-column gap-3">
 
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
        <div>
          <h4 className="fw-bold mb-0" style={{ color: '#1e293b' }}>
            📦 {cashierView ? 'Inventory (View & Adjust)' : 'Inventory Management'}
          </h4>
          {cashierView && (
            <span className="badge mt-1" style={{ background: '#eff6ff', color: '#3b82f6', fontWeight: 600 }}>
              Cashier — adjust stock only
            </span>
          )}
        </div>
      </div>
 
      {/* Error */}
      {error && (
        <div className="alert alert-danger d-flex align-items-center justify-content-between py-2">
          <span>⚠️ {error}</span>
          <button className="btn btn-sm btn-outline-danger ms-3" onClick={load}>Retry</button>
        </div>
      )}
 
      {/* Low Stock Alert */}
      <LowStockAlert items={items} />
 
      {/* Toolbar */}
      <div className="d-flex gap-2 flex-wrap">
        <input
          className="form-control"
          style={{ maxWidth: 280 }}
          placeholder="🔍 Search items…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <button className="btn btn-outline-secondary" onClick={load}>🔄 Refresh</button>
      </div>
 
      {/* Table */}
      {loading ? <LoadingSpinner /> : (
        <div className="card border-0 shadow-sm" style={{ borderRadius: 16, overflow: 'hidden' }}>
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  {['Item','Category','Price','Stock','Status','Action'].map(h => (
                    <th key={h} className="py-3 text-secondary fw-semibold small text-uppercase"
                      style={{ paddingLeft: h === 'Item' ? 24 : undefined }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center text-muted py-5">
                      {items.length === 0
                        ? '📭 No items in database. Run: php artisan db:seed'
                        : 'No items match your search.'}
                    </td>
                  </tr>
                ) : filtered.map(item => {
                  const stockPct = Math.min(100, ((item.stock_quantity || 0) / Math.max(item.stock_quantity || 0, 50)) * 100);
                  const isLow    = item.is_low_stock;
 
                  return (
                    <tr key={item.id} style={isLow ? { background: '#fffbeb' } : {}}>
 
                      {/* Item name */}
                      <td style={{ paddingLeft: 24 }}>
                        <div className="fw-semibold small" style={{ color: '#1e293b' }}>{item.name}</div>
                        {isLow && (
                          <span className="badge mt-1" style={{ background: '#fef3c7', color: '#92400e', fontSize: '0.7rem' }}>
                            ⚠️ Low Stock
                          </span>
                        )}
                      </td>
 
                      {/* Category */}
                      <td>
                        <span className="badge rounded-pill px-2 py-1"
                          style={{ background: '#f1f5f9', color: '#475569', fontWeight: 500, fontSize: '0.78rem' }}>
                          {item.category?.icon} {item.category?.name}
                        </span>
                      </td>
 
                      {/* Price */}
                      <td className="fw-semibold small" style={{ color: '#1e293b' }}>
                        ₱{parseFloat(item.price || 0).toFixed(2)}
                      </td>
 
                      {/* Stock bar */}
                      <td style={{ minWidth: 130 }}>
                        <div className="d-flex align-items-center gap-2">
                          <div className="flex-grow-1 rounded-pill overflow-hidden"
                            style={{ height: 6, background: '#e2e8f0' }}>
                            <div className="rounded-pill" style={{
                              width: `${stockPct}%`,
                              height: '100%',
                              background: isLow ? '#ef4444' : '#10b981',
                              transition: 'width 0.3s',
                            }} />
                          </div>
                          <span className="fw-semibold small" style={{ color: isLow ? '#dc2626' : '#1e293b', minWidth: 28 }}>
                            {item.stock_quantity}
                          </span>
                        </div>
                      </td>
 
                      {/* Status badge */}
                      <td>
                        <span className="badge rounded-pill px-2 py-1"
                          style={{
                            background: item.is_available ? '#dcfce7' : '#fee2e2',
                            color:      item.is_available ? '#15803d' : '#b91c1c',
                            fontSize: '0.78rem',
                          }}>
                          {item.is_available ? '✅ Available' : '❌ Unavailable'}
                        </span>
                      </td>
 
                      {/* Action */}
                      <td>
                        <button
                          className="btn btn-sm fw-semibold"
                          style={{ background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: 8 }}
                          onClick={() => setAdjust(item)}
                        >
                          ✏️ Adjust
                        </button>
                      </td>
 
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
 
      {/* Adjust Modal */}
      {adjust && (
        <AdjustModal
          item={adjust}
          cashierView={cashierView}
          onSave={() => { setAdjust(null); load(); }}
          onClose={() => setAdjust(null)}
        />
      )}
 
    </div>
  );
}