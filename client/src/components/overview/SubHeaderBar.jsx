import React from 'react';
import { Database, Sigma, Sparkles } from 'lucide-react';

export default function SubHeaderBar() {
  return (
    <div className="overview-subhead-section">
      <div className="mandate-link">
        DGMS MANDATE #SEC-82 &nbsp; Coal Mines Regulations (CMR-2017)
      </div>

      <div className="overview-title-row">
        <h1 className="overview-h1">National Mine Monitoring Overview</h1>

        <div className="overview-classification-tags">
          <span className="badge-tag badge-raw" title="Direct telemetry straight from mobile inspector handhelds">
            <Database size={10} />
            [RAW MOBILE DATA]
          </span>
          <span className="badge-tag badge-calc" title="Aggregated and derived mathematically across state directorates">
            <Sigma size={10} />
            ∑ [CALCULATED]
          </span>
          <span className="badge-tag badge-ai" title="Inferred through neural risk patterns &amp; variance anomaly models">
            <Sparkles size={10} />
            ✨ [AI GENERATED]
          </span>
        </div>
      </div>

      <p className="overview-subtitle">
        Centralized monitoring of inspections, life-safety sensors, workforce telemetry, and statutory compliance across 8 state coal directorates.
      </p>
    </div>
  );
}
