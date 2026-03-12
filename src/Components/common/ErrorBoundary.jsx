import { Component } from 'react';
 
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, info) { console.error('ErrorBoundary:', error, info); }
 
  render() {
    if (this.state.hasError) {
      return (
        <div className="d-flex flex-column align-items-center justify-content-center min-vh-100 text-center p-4">
          <div style={{ fontSize: 64, marginBottom: 16 }}>⚠️</div>
          <h4 className="fw-bold mb-2" style={{ color: '#1e293b' }}>Something went wrong</h4>
          <p className="text-muted mb-4" style={{ maxWidth: 360 }}>
            {this.state.error?.message || 'An unexpected error occurred.'}
          </p>
          <button
            className="btn fw-semibold text-white px-4"
            style={{ background: '#f97316', border: 'none', borderRadius: 12 }}
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            🔄 Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}