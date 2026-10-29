import React from 'react';
import { Sigma } from 'lucide-react';

export default function SeverityDistribution({ distribution }) {
  const d = distribution ?? {};
  const totalMines = d.totalMines ?? d.totalAssets ?? '—';
  const items = [
    d.criticalViolations || d.criticalEmergencies,
    d.majorViolations,
    d.minorViolations || d.warningRectification,
    d.noViolation || d.fullyCompliant,
  ].filter(Boolean);

  return (
    <div className="severity-dist-card">
      <div className="severity-dist-header">
        <div className="dist-title-group">
          <span className="dist-title">Issue Severity Distribution</span>
          <span className="badge-tag badge-calc">
            <Sigma size={8} />
            [CALCULATED]
          </span>
        </div>
        <span className="dist-total-assets">{totalMines} Total Mines</span>
      </div>

      <div className="severity-bars-list">
        {items.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', fontSize: '11px', padding: '12px 0' }}>No severity data available</div>
        ) : (
          items.map((item, idx) => (
            <div key={idx} className="severity-bar-item">
              <div className="severity-bar-label-row">
                <span className="severity-bar-name">
                  <span
                    className="severity-bar-indicator"
                    style={{ backgroundColor: item.color }}
                  ></span>
                  {item.label}
                </span>
                <span className="severity-bar-stats" style={{ color: item.color }}>
                  {item.count} Inspections ({item.percentage}%)
                </span>
              </div>
              <div className="severity-progress-track">
                <div
                  className="severity-progress-fill"
                  style={{
                    width: `${item.percentage}%`,
                    backgroundColor: item.color
                  }}
                ></div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
