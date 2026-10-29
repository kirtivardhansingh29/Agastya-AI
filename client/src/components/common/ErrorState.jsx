import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function ErrorState({ message, onRetry }) {
  return (
    <div className="error-boundary-card">
      <AlertTriangle size={36} color="#dc2626" />
      <h3 className="error-title">Unable to Load Regulatory Telemetry</h3>
      <p className="error-msg">
        {message || "The Agastya AI backend service is currently unreachable or timed out."}
      </p>
      <button className="btn-primary" onClick={onRetry} style={{ marginTop: '8px' }}>
        <RefreshCw size={13} />
        <span>Retry Connection</span>
      </button>
    </div>
  );
}
