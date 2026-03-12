export default function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center py-5 gap-3">
      <div
        className="spinner-border"
        style={{ width: 40, height: 40, color: '#f97316', borderWidth: 3 }}
        role="status"
      />
      <span className="text-muted small fw-medium">{message}</span>
    </div>
  );
}