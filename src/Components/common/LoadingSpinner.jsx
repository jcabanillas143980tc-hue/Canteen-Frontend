import './LoadingSpinner.css';

export default function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className="spinner-wrap">
      <div className="spinner-ring" />
      <span className="spinner-text">{message}</span>
    </div>
  );
}