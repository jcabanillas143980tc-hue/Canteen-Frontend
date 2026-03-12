import { useState, useEffect, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell,
  LineChart, Line,
} from 'recharts';
import api from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';

/* ─── Colour palette ─── */
const COLORS = ['#f97316','#3b82f6','#10b981','#8b5cf6','#f43f5e','#14b8a6'];

/* ─── Formatters ─── */
const peso  = v => `₱${Number(v ?? 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;
const short = v => v >= 1000 ? `₱${(v/1000).toFixed(1)}k` : `₱${v}`;
const fmtDate = d => new Date(d + 'T00:00:00').toLocaleDateString('en-PH', { month:'short', day:'numeric' });
const fmtWeek = w => { const s = String(w); return `Wk ${s.slice(4)}`; };

/* ─── Stat Card ─── */
function StatCard({ icon, label, value, sub, bg }) {
  return (
    <div className="col-sm-6 col-xl-3">
      <div className="card border-0 shadow-sm h-100" style={{ borderRadius: 16 }}>
        <div className="card-body d-flex align-items-center gap-3 p-4">
          <div className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
            style={{ width: 52, height: 52, background: bg, fontSize: 22 }}>
            {icon}
          </div>
          <div>
            <div className="fw-bold" style={{ fontSize: '1.35rem', color: '#1e293b' }}>{value}</div>
            <div className="text-muted small">{label}</div>
            {sub && <div className="text-muted" style={{ fontSize: '0.72rem' }}>{sub}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Custom Tooltip ─── */
function CustomTooltip({ active, payload, label, type }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-dark text-white rounded-3 p-2 px-3 shadow" style={{ fontSize: 13 }}>
      <div className="text-secondary mb-1 fw-semibold">{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color }}>
          {p.name}: {type === 'currency' ? peso(p.value) : p.value}
        </div>
      ))}
    </div>
  );
}

/* ─── Chart Card wrapper ─── */
function ChartCard({ title, subtitle, children }) {
  return (
    <div className="card border-0 shadow-sm h-100" style={{ borderRadius: 16 }}>
      <div className="card-body p-4">
        <div className="d-flex align-items-baseline gap-2 mb-3">
          <h6 className="fw-semibold mb-0" style={{ color: '#1e293b' }}>{title}</h6>
          <span className="text-muted" style={{ fontSize: '0.75rem' }}>{subtitle}</span>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   DEFAULT EXPORT — Admin Dashboard
═══════════════════════════════════════ */
export default function AdminDashboard() {
  const [period,    setPeriod]    = useState('weekly');
  const [summary,   setSummary]   = useState(null);
  const [salesData, setSalesData] = useState([]);
  const [pieData,   setPieData]   = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [topItems,  setTopItems]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [sumRes, salesRes, catRes, trendRes, topRes] = await Promise.allSettled([
        api.get('/reports/summary'),
        period === 'weekly' ? api.get('/reports/weekly-sales') : api.get('/reports/daily-sales?days=30'),
        api.get('/reports/category-breakdown'),
        api.get('/reports/daily-sales?days=30'),
        api.get('/reports/top-items?limit=5'),
      ]);

      if (sumRes.status === 'fulfilled') {
        const d = sumRes.value.data;
        setSummary({
          total_sales:      d.total_sales      ?? 0,
          total_orders:     d.total_orders     ?? 0,
          avg_order_value:  d.average_order    ?? 0,
          cancelled_orders: d.cancelled_orders ?? 0,
        });
      }
      if (salesRes.status === 'fulfilled') {
        const raw = salesRes.value.data ?? [];
        setSalesData(raw.map(r => ({
          label:   period === 'weekly' ? fmtWeek(r.week) : fmtDate(r.date),
          revenue: parseFloat(r.revenue ?? 0),
          orders:  parseInt(r.orders   ?? 0, 10),
        })));
      }
      if (catRes.status === 'fulfilled') {
        const raw = catRes.value.data ?? [];
        setPieData(raw.map(r => ({ name: r.category, value: parseFloat(r.revenue ?? 0) })));
      }
      if (trendRes.status === 'fulfilled') {
        const raw = trendRes.value.data ?? [];
        setTrendData(raw.map(r => ({ date: fmtDate(r.date), orders: parseInt(r.orders ?? 0, 10) })));
      }
      if (topRes.status === 'fulfilled') {
        const raw = topRes.value.data ?? [];
        setTopItems(raw.slice(0, 5).map(r => ({
          id:            r.menu_item_id,
          name:          r.menu_item?.name           ?? `Item #${r.menu_item_id}`,
          category:      r.menu_item?.category?.name ?? '—',
          total_qty:     parseInt(r.total_qty         ?? 0, 10),
          total_revenue: parseFloat(r.total_revenue   ?? 0),
        })));
      }
    } catch {
      setError('Could not load dashboard data.');
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <LoadingSpinner message="Loading dashboard…" />;

  return (
    <div className="d-flex flex-column gap-4">

      {/* ── Header ── */}
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
        <div>
          <h4 className="fw-bold mb-0" style={{ color: '#1e293b' }}>📊 Admin Dashboard</h4>
          <p className="text-muted small mb-0">Sales reports &amp; system overview</p>
        </div>
        <div className="d-flex align-items-center gap-2">
          <div className="btn-group" role="group">
            {['daily','weekly'].map(p => (
              <button key={p} type="button"
                className={`btn btn-sm ${period === p ? 'text-white' : 'btn-outline-secondary'}`}
                style={period === p ? { background:'#f97316', borderColor:'#f97316' } : {}}
                onClick={() => setPeriod(p)}>
                {p === 'daily' ? 'Daily (30d)' : 'Weekly (8wk)'}
              </button>
            ))}
          </div>
          <button className="btn btn-sm btn-outline-secondary" onClick={load}>🔄</button>
        </div>
      </div>

      {error && <div className="alert alert-danger py-2">⚠️ {error}</div>}

      {/* ── Stat Cards ── */}
      <div className="row g-3">
        <StatCard icon="💰" label="Total Sales"       bg="#fff7ed"
          value={summary ? peso(summary.total_sales) : '—'}
          sub={summary ? `${summary.total_orders} completed orders` : ''} />
        <StatCard icon="🛒" label="Total Orders"      bg="#eff6ff"
          value={summary?.total_orders ?? '—'}
          sub={summary ? `Avg ${peso(summary.avg_order_value)} / order` : ''} />
        <StatCard icon="❌" label="Cancelled Orders"  bg="#fef2f2"
          value={summary?.cancelled_orders ?? '—'}
          sub="This month" />
        <StatCard icon="📊" label="Avg Order Value"   bg="#f0fdf4"
          value={summary ? peso(summary.avg_order_value) : '—'}
          sub="Per completed order" />
      </div>

      {/* ── Charts Row 1 ── */}
      <div className="row g-3">
        {/* Bar Chart */}
        <div className="col-lg-8">
          <ChartCard title="📈 Sales Revenue" subtitle={period === 'weekly' ? 'last 8 weeks' : 'last 30 days'}>
            {salesData.length === 0
              ? <div className="text-center text-muted py-5">No sales data available.</div>
              : <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={salesData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                    <YAxis tickFormatter={short} tick={{ fontSize: 12 }} />
                    <Tooltip content={<CustomTooltip type="currency" />} />
                    <Legend />
                    <Bar dataKey="revenue" name="Revenue" fill="#f97316" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
            }
          </ChartCard>
        </div>

        {/* Pie Chart */}
        <div className="col-lg-4">
          <ChartCard title="🥧 Sales by Category" subtitle="distribution">
            {pieData.length === 0
              ? <div className="text-center text-muted py-5">No category data available.</div>
              : <>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={pieData} dataKey="value" nameKey="name"
                        cx="50%" cy="50%" outerRadius={80} innerRadius={40}>
                        {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(v) => peso(v)} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="d-flex flex-column gap-1 mt-2">
                    {pieData.map((d, i) => (
                      <div key={i} className="d-flex align-items-center gap-2">
                        <span className="rounded-circle flex-shrink-0"
                          style={{ width: 10, height: 10, background: COLORS[i % COLORS.length], display:'inline-block' }} />
                        <span className="flex-grow-1 small text-secondary">{d.name}</span>
                        <span className="small fw-semibold" style={{ color:'#1e293b' }}>{peso(d.value)}</span>
                      </div>
                    ))}
                  </div>
                </>
            }
          </ChartCard>
        </div>
      </div>

      {/* ── Charts Row 2 ── */}
      <div className="row g-3">
        {/* Line Chart */}
        <div className="col-lg-8">
          <ChartCard title="📉 Order Volume Trend" subtitle="past 30 days">
            {trendData.length === 0
              ? <div className="text-center text-muted py-5">No trend data available.</div>
              : <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={trendData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
                    <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                    <Tooltip content={<CustomTooltip type="count" />} />
                    <Legend />
                    <Line type="monotone" dataKey="orders" name="Orders"
                      stroke="#3b82f6" strokeWidth={2} dot={false} activeDot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
            }
          </ChartCard>
        </div>

        {/* Top Items */}
        <div className="col-lg-4">
          <ChartCard title="🏆 Top Selling Items" subtitle="by quantity">
            {topItems.length === 0
              ? <div className="text-center text-muted py-5">No items data available.</div>
              : <div className="d-flex flex-column gap-2">
                  {topItems.map((item, i) => (
                    <div key={item.id ?? i} className="d-flex align-items-center gap-3 p-2 rounded-3"
                      style={{ background: '#f8fafc' }}>
                      <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 text-white fw-bold"
                        style={{ width: 28, height: 28, background: '#f97316', fontSize: 12 }}>
                        {i + 1}
                      </div>
                      <div className="flex-grow-1 overflow-hidden">
                        <div className="fw-semibold small text-truncate" style={{ color:'#1e293b' }}>{item.name}</div>
                        <div className="text-muted" style={{ fontSize: '0.72rem' }}>{item.category}</div>
                      </div>
                      <div className="text-end flex-shrink-0">
                        <div className="small fw-bold" style={{ color:'#f97316' }}>{item.total_qty} sold</div>
                        <div className="text-muted" style={{ fontSize: '0.72rem' }}>{peso(item.total_revenue)}</div>
                      </div>
                    </div>
                  ))}
                </div>
            }
          </ChartCard>
        </div>
      </div>

    </div>
  );
}

/* ═══════════════════════════════════════
   NAMED EXPORT — User Management
═══════════════════════════════════════ */

function AddUserModal({ onSave, onClose }) {
  const [form,   setForm]   = useState({ name: '', email: '', password: '', role: 'customer' });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const setF = (k, v) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: '' })); };

  const validate = () => {
    const e = {};
    if (!form.name.trim())  e.name     = 'Name is required';
    if (!form.email.trim()) e.email    = 'Email is required';
    if (!form.password)     e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'Min 6 characters';
    setErrors(e); return !Object.keys(e).length;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try { await api.post('/users', form); onSave(); }
    catch (err) {
      if (err.response?.data?.message) setErrors({ email: err.response.data.message });
      else setErrors(err.response?.data?.errors || {});
    } finally { setSaving(false); }
  };

  return (
    <div className="modal d-block" style={{ background: 'rgba(15,23,42,0.5)' }} tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow" style={{ borderRadius: 16 }}>
          <div className="modal-header border-0 pb-0 px-4 pt-4">
            <h5 className="modal-title fw-bold">➕ Add New User</h5>
            <button type="button" className="btn-close" onClick={onClose} />
          </div>
          <div className="modal-body px-4 py-3">
            {[
              { key:'name',     label:'Full Name *',     type:'text',     ph:'e.g. Juan dela Cruz' },
              { key:'email',    label:'Email Address *', type:'email',    ph:'user@school.edu' },
              { key:'password', label:'Password *',      type:'password', ph:'Min. 6 characters' },
            ].map(f => (
              <div key={f.key} className="mb-3">
                <label className="form-label fw-semibold small text-secondary">{f.label}</label>
                <input type={f.type} placeholder={f.ph} value={form[f.key]}
                  className={`form-control ${errors[f.key] ? 'is-invalid' : ''}`}
                  onChange={e => setF(f.key, e.target.value)} />
                {errors[f.key] && <div className="invalid-feedback">{errors[f.key]}</div>}
              </div>
            ))}
            <div className="mb-3">
              <label className="form-label fw-semibold small text-secondary">Role *</label>
              <select className="form-select" value={form.role} onChange={e => setF('role', e.target.value)}>
                <option value="customer">🎓 Customer (Student)</option>
                <option value="cashier">🧾 Cashier</option>
                <option value="admin">👑 Admin</option>
              </select>
            </div>
          </div>
          <div className="modal-footer border-0 px-4 pb-4 pt-0 gap-2">
            <button className="btn btn-light" onClick={onClose}>Cancel</button>
            <button className="btn text-white fw-semibold" disabled={saving}
              style={{ background:'#f97316', border:'none' }} onClick={handleSave}>
              {saving ? <><span className="spinner-border spinner-border-sm me-1" />Creating…</> : '✅ Create User'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const ROLE_COLORS = { admin: '#fff7ed', cashier: '#eff6ff', customer: '#f0fdf4' };
const ROLE_TEXT   = { admin: '#f97316', cashier: '#3b82f6', customer: '#10b981' };
const AVA_BG      = { admin: 'linear-gradient(135deg,#f97316,#ea580c)', cashier: 'linear-gradient(135deg,#3b82f6,#2563eb)', customer: 'linear-gradient(135deg,#10b981,#059669)' };

export function UserManagement() {
  const [users,      setUsers]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showAdd,    setShowAdd]    = useState(false);
  const [updating,   setUpdating]   = useState({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/users');
      setUsers(Array.isArray(data) ? data : data.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const updateUser = async (id, patch) => {
    setUpdating(p => ({ ...p, [id]: true }));
    try {
      await api.patch(`/users/${id}`, patch);
      setUsers(p => p.map(u => u.id === id ? { ...u, ...patch } : u));
    } catch (e) { console.error(e); }
    finally { setUpdating(p => ({ ...p, [id]: false })); }
  };

  const handleDelete = async (user) => {
    if (!confirm(`Delete "${user.name}"? This cannot be undone.`)) return;
    try { await api.delete(`/users/${user.id}`); setUsers(p => p.filter(u => u.id !== user.id)); }
    catch (e) { alert(e.response?.data?.message || 'Could not delete user.'); }
  };

  const filtered = users.filter(u => {
    const ms = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const mr = !roleFilter || u.role === roleFilter;
    return ms && mr;
  });

  return (
    <div className="d-flex flex-column gap-4">

      {/* Header */}
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
        <h4 className="fw-bold mb-0" style={{ color: '#1e293b' }}>👥 User Management</h4>
        <button className="btn text-white fw-semibold"
          style={{ background:'#f97316', border:'none', borderRadius: 10 }}
          onClick={() => setShowAdd(true)}>
          ➕ Add User
        </button>
      </div>

      {/* Stats */}
      <div className="row g-3">
        {[
          { label:'Total Users', val: users.length,                                  bg:'#f8fafc', color:'#1e293b' },
          { label:'Admins',      val: users.filter(u=>u.role==='admin').length,       bg:'#fff7ed', color:'#f97316' },
          { label:'Cashiers',    val: users.filter(u=>u.role==='cashier').length,     bg:'#eff6ff', color:'#3b82f6' },
          { label:'Customers',   val: users.filter(u=>u.role==='customer').length,    bg:'#f0fdf4', color:'#10b981' },
        ].map(s => (
          <div key={s.label} className="col-6 col-md-3">
            <div className="card border-0 shadow-sm text-center p-3" style={{ borderRadius: 14, background: s.bg }}>
              <div className="fw-bold" style={{ fontSize: '1.8rem', color: s.color }}>{s.val}</div>
              <div className="text-muted small">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="d-flex gap-2 flex-wrap">
        <input className="form-control" style={{ maxWidth: 280 }}
          placeholder="Search by name or email…"
          value={search} onChange={e => setSearch(e.target.value)} />
        <select className="form-select" style={{ maxWidth: 150 }}
          value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="cashier">Cashier</option>
          <option value="customer">Customer</option>
        </select>
        <button className="btn btn-outline-secondary" onClick={load}>🔄 Refresh</button>
      </div>

      {/* Table */}
      {loading ? <LoadingSpinner message="Loading users…" /> : (
        <div className="card border-0 shadow-sm" style={{ borderRadius: 16, overflow:'hidden' }}>
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="ps-4 py-3 text-secondary fw-semibold small text-uppercase">User</th>
                  <th className="py-3 text-secondary fw-semibold small text-uppercase">Role</th>
                  <th className="py-3 text-secondary fw-semibold small text-uppercase">Status</th>
                  <th className="py-3 text-secondary fw-semibold small text-uppercase">Joined</th>
                  <th className="py-3 text-secondary fw-semibold small text-uppercase">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={5} className="text-center text-muted py-5">No users found.</td></tr>
                ) : filtered.map(user => (
                  <tr key={user.id}>
                    {/* User */}
                    <td className="ps-4">
                      <div className="d-flex align-items-center gap-3">
                        <div className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold flex-shrink-0"
                          style={{ width: 40, height: 40, background: AVA_BG[user.role] || AVA_BG.customer, fontSize: 15 }}>
                          {user.name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <div className="fw-semibold small" style={{ color:'#1e293b' }}>{user.name}</div>
                          <div className="text-muted" style={{ fontSize: '0.75rem' }}>{user.email}</div>
                        </div>
                      </div>
                    </td>
                    {/* Role */}
                    <td>
                      <select className="form-select form-select-sm" style={{ maxWidth: 120 }}
                        value={user.role} disabled={!!updating[user.id]}
                        onChange={e => updateUser(user.id, { role: e.target.value })}>
                        <option value="admin">Admin</option>
                        <option value="cashier">Cashier</option>
                        <option value="customer">Customer</option>
                      </select>
                    </td>
                    {/* Status toggle */}
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div className="form-check form-switch mb-0">
                          <input className="form-check-input" type="checkbox" role="switch"
                            checked={user.is_active !== false} disabled={!!updating[user.id]}
                            onChange={() => updateUser(user.id, { is_active: !(user.is_active !== false) })} />
                        </div>
                        <span className="small" style={{ color: user.is_active !== false ? '#10b981' : '#94a3b8' }}>
                          {user.is_active !== false ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </td>
                    {/* Joined */}
                    <td className="text-muted small">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString('en-PH',{year:'numeric',month:'short',day:'numeric'}) : '—'}
                    </td>
                    {/* Delete */}
                    <td>
                      <button className="btn btn-sm" style={{ background:'#fee2e2', color:'#dc2626', border:'none', borderRadius: 8 }}
                        onClick={() => handleDelete(user)} disabled={!!updating[user.id]}>
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showAdd && <AddUserModal onSave={() => { setShowAdd(false); load(); }} onClose={() => setShowAdd(false)} />}
    </div>
  );
}