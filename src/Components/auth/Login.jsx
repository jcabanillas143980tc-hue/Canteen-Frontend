import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const DEMO_USERS = [
  { role: 'Admin',   icon: '👑', email: 'admin@canteen.com',    password: 'password' },
  { role: 'Cashier', icon: '🧾', email: 'cashier@canteen.com',  password: 'password' },
  { role: 'Student', icon: '🎓', email: 'student1@canteen.com', password: 'password' },
];

export default function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [form,   setForm]   = useState({ email: '', password: '' });
  const [error,  setError]  = useState('');
  const [errors, setErrors] = useState({});

  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: '' })); setError(''); };

  const validate = () => {
    const e = {};
    if (!form.email)    e.email    = 'Email is required';
    if (!form.password) e.password = 'Password is required';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    try {
      const user = await login(form);
      const routes = { admin: '/dashboard', cashier: '/cashier/pos', customer: '/browse' };
      navigate(routes[user.role] || '/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password. Please try again.');
    }
  };

  const fillDemo = (email, password) => { setForm({ email, password }); setErrors({}); setError(''); };

  return (
    <div className="min-vh-100 row g-0">

      {/* ── LEFT — Branding ── */}
      <div className="col-lg-6 d-none d-lg-flex flex-column justify-content-center align-items-center text-white p-5"
        style={{ background: 'linear-gradient(135deg, #f97316 0%, #ea580c 60%, #c2410c 100%)' }}>

        {/* Brand */}
        <div className="d-flex align-items-center gap-3 mb-5">
          <div className="fs-1 bg-white rounded-3 p-2 lh-1">🍱</div>
          <div className="fw-bold" style={{ fontSize: '2rem', letterSpacing: '-0.5px' }}>
            Canteen<span style={{ opacity: 0.75 }}>Pro</span>
          </div>
        </div>

        {/* Icon Row */}
        <div className="d-flex gap-3 mb-4">
          {[['🍱','Meals'],['📊','Reports'],['📦','Inventory']].map(([icon, label]) => (
            <div key={label} className="text-center bg-white bg-opacity-10 rounded-3 p-3" style={{ minWidth: 90 }}>
              <div className="fs-2">{icon}</div>
              <div className="small mt-1 fw-semibold">{label}</div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="d-flex gap-4 mb-5">
          {[['30+','Menu Items'],['200+','Orders'],['3','User Roles']].map(([val, lbl]) => (
            <div key={lbl} className="text-center">
              <div className="fw-bold" style={{ fontSize: '1.8rem' }}>{val}</div>
              <div className="small opacity-75">{lbl}</div>
            </div>
          ))}
        </div>

        {/* Tagline */}
        <div className="text-center" style={{ maxWidth: 380 }}>
          <h2 className="fw-bold mb-2">School Canteen Made Simple</h2>
          <p className="opacity-75 mb-0">Manage orders, track inventory, and view sales reports — all in one place.</p>
        </div>
      </div>

      {/* ── RIGHT — Form ── */}
      <div className="col-lg-6 d-flex align-items-center justify-content-center p-4 bg-white">
        <div className="w-100" style={{ maxWidth: 420 }}>

          {/* Mobile brand */}
          <div className="d-flex d-lg-none align-items-center gap-2 mb-4 justify-content-center">
            <span className="fs-2">🍱</span>
            <span className="fw-bold fs-4" style={{ color: '#f97316' }}>CanteenPro</span>
          </div>

          <h1 className="fw-bold mb-1" style={{ fontSize: '1.75rem', color: '#0f172a' }}>Welcome back 👋</h1>
          <p className="text-muted mb-4">
            Sign in to your <span style={{ color: '#f97316', fontWeight: 600 }}>CanteenPro</span> account
          </p>

          {error && (
            <div className="alert alert-danger d-flex align-items-center gap-2 py-2" role="alert">
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div className="mb-3">
              <label className="form-label fw-semibold small text-secondary">Email Address</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">📧</span>
                <input
                  type="email"
                  className={`form-control border-start-0 bg-light ${errors.email ? 'is-invalid' : ''}`}
                  placeholder="your@email.com"
                  value={form.email}
                  onChange={e => set('email', e.target.value)}
                />
                {errors.email && <div className="invalid-feedback">{errors.email}</div>}
              </div>
            </div>

            {/* Password */}
            <div className="mb-4">
              <label className="form-label fw-semibold small text-secondary">Password</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">🔑</span>
                <input
                  type="password"
                  className={`form-control border-start-0 bg-light ${errors.password ? 'is-invalid' : ''}`}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={e => set('password', e.target.value)}
                />
                {errors.password && <div className="invalid-feedback">{errors.password}</div>}
              </div>
            </div>

            <button
              type="submit"
              className="btn w-100 fw-bold py-2 text-white mb-4"
              style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)', border: 'none', borderRadius: 12 }}
              disabled={loading}
            >
              {loading
                ? <><span className="spinner-border spinner-border-sm me-2" /> Signing in…</>
                : '🔐 Sign In'}
            </button>
          </form>

          {/* Demo Logins */}
          <div className="border rounded-3 p-3 bg-light">
            <p className="text-center text-muted small fw-semibold mb-3 text-uppercase" style={{ letterSpacing: '0.5px' }}>
              Quick Demo Login
            </p>
            <div className="row g-2">
              {DEMO_USERS.map(u => (
                <div key={u.role} className="col-4">
                  <button
                    type="button"
                    className="btn btn-white border w-100 p-2 text-center bg-white"
                    style={{ borderRadius: 10 }}
                    onClick={() => fillDemo(u.email, u.password)}
                  >
                    <div className="fs-4">{u.icon}</div>
                    <div className="fw-bold small">{u.role}</div>
                    <div className="text-muted" style={{ fontSize: '0.65rem' }}>{u.email}</div>
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}