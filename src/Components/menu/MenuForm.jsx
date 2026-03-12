import { useState } from 'react';
import api from '../../services/api';
 
export default function MenuForm({ item, categories, onSave, onClose }) {
  const [form, setForm] = useState(item ? {
    name:           item.name,
    description:    item.description || '',
    price:          item.price,
    category_id:    item.category_id,
    stock_quantity: item.stock_quantity,
    is_available:   item.is_available,
  } : {
    name: '', description: '', price: '',
    category_id: '', stock_quantity: '', is_available: true,
  });
 
  const [image,  setImage]  = useState(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
 
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setErrors({});
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (image) fd.append('image', image);
      const headers = { 'Content-Type': 'multipart/form-data' };
      if (item?.id) await api.post(`/menu/${item.id}?_method=PUT`, fd, { headers });
      else          await api.post('/menu', fd, { headers });
      onSave();
    } catch (err) {
      setErrors(err.response?.data?.errors || {});
    } finally { setSaving(false); }
  };
 
  return (
    <div className="modal d-block" style={{ background: 'rgba(15,23,42,0.5)' }} tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content border-0 shadow" style={{ borderRadius: 16 }}>
 
          {/* Header */}
          <div className="modal-header border-0 px-4 pt-4 pb-2">
            <h5 className="modal-title fw-bold">
              {item ? '✏️ Edit Menu Item' : '➕ Add Menu Item'}
            </h5>
            <button type="button" className="btn-close" onClick={onClose} />
          </div>
 
          <form onSubmit={handleSubmit}>
            <div className="modal-body px-4 py-3">
              <div className="row g-3">
 
                {/* Name */}
                <div className="col-md-6">
                  <label className="form-label fw-semibold small text-secondary">Item Name *</label>
                  <input
                    className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                    value={form.name} onChange={e => set('name', e.target.value)}
                    placeholder="e.g. Chicken Adobo" required />
                  {errors.name && <div className="invalid-feedback">{errors.name[0]}</div>}
                </div>
 
                {/* Category */}
                <div className="col-md-6">
                  <label className="form-label fw-semibold small text-secondary">Category *</label>
                  <select
                    className={`form-select ${errors.category_id ? 'is-invalid' : ''}`}
                    value={form.category_id} onChange={e => set('category_id', e.target.value)} required>
                    <option value="">Select category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                  </select>
                  {errors.category_id && <div className="invalid-feedback">{errors.category_id[0]}</div>}
                </div>
 
                {/* Price */}
                <div className="col-md-6">
                  <label className="form-label fw-semibold small text-secondary">Price (₱) *</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0">₱</span>
                    <input type="number" step="0.01" min="0"
                      className={`form-control border-start-0 ${errors.price ? 'is-invalid' : ''}`}
                      value={form.price} onChange={e => set('price', e.target.value)}
                      placeholder="0.00" required />
                    {errors.price && <div className="invalid-feedback">{errors.price[0]}</div>}
                  </div>
                </div>
 
                {/* Stock */}
                <div className="col-md-6">
                  <label className="form-label fw-semibold small text-secondary">Stock Quantity *</label>
                  <input type="number" min="0"
                    className={`form-control ${errors.stock_quantity ? 'is-invalid' : ''}`}
                    value={form.stock_quantity} onChange={e => set('stock_quantity', e.target.value)}
                    placeholder="0" required />
                  {errors.stock_quantity && <div className="invalid-feedback">{errors.stock_quantity[0]}</div>}
                </div>
 
                {/* Description */}
                <div className="col-12">
                  <label className="form-label fw-semibold small text-secondary">Description</label>
                  <textarea className="form-control" rows={3}
                    value={form.description} onChange={e => set('description', e.target.value)}
                    placeholder="Brief description of the item…" />
                </div>
 
                {/* Image upload */}
                <div className="col-md-6">
                  <label className="form-label fw-semibold small text-secondary">Item Photo</label>
                  <input type="file" className="form-control" accept="image/*"
                    onChange={e => setImage(e.target.files[0])} />
                  {item?.image && (
                    <div className="mt-2 text-muted" style={{ fontSize: '0.75rem' }}>
                      Current image will be replaced if a new one is selected.
                    </div>
                  )}
                </div>
 
                {/* Availability toggle */}
                <div className="col-md-6 d-flex align-items-end">
                  <div className="w-100 rounded-3 p-3" style={{ background: '#f8fafc' }}>
                    <div className="d-flex align-items-center justify-content-between">
                      <div>
                        <div className="fw-semibold small" style={{ color: '#1e293b' }}>Availability</div>
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                          {form.is_available ? 'Visible on menu' : 'Hidden from menu'}
                        </div>
                      </div>
                      <div className="form-check form-switch mb-0">
                        <input className="form-check-input" type="checkbox" role="switch"
                          checked={form.is_available}
                          onChange={e => set('is_available', e.target.checked)}
                          style={{ width: 44, height: 22, cursor: 'pointer' }} />
                      </div>
                    </div>
                  </div>
                </div>
 
              </div>
            </div>
 
            {/* Footer */}
            <div className="modal-footer border-0 px-4 pb-4 pt-0 gap-2">
              <button type="button" className="btn btn-light" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn fw-semibold text-white"
                style={{ background: '#f97316', border: 'none', borderRadius: 10 }}
                disabled={saving}>
                {saving
                  ? <><span className="spinner-border spinner-border-sm me-1" />Saving…</>
                  : item ? '✅ Update Item' : '✅ Add Item'}
              </button>
            </div>
          </form>
 
        </div>
      </div>
    </div>
  );
}