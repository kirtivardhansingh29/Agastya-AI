import React from 'react';
import { Sparkles, Users, FileText, Search, AlertCircle, FileCode } from 'lucide-react';

export default function AiRiskIntelligence({ insights }) {
  const list = insights || [];

  return (
    <section className="ai-risk-section">
      <div className="ai-risk-header">
        <div className="ai-risk-header-left">
          <div className="ai-risk-title-row">
            <span className="ai-risk-title">AI Risk Intelligence &amp; Predictive Early Warning</span>
            <span className="badge-tag badge-ai">
              <Sparkles size={9} />
              [AI GENERATED]
            </span>
          </div>
          <span className="ai-risk-subtext">
            Historical pattern recognition and statutory document intelligence.
          </span>
        </div>
      </div>

      {list.length === 0 ? (
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid var(--border-color)',
          borderRadius: '6px',
          padding: '24px',
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: '13px'
        }}>
          <Sparkles size={20} style={{ marginBottom: '8px', opacity: 0.5 }} />
          <div>AI Risk Intelligence: Awaiting data</div>
          <div style={{ fontSize: '11px', marginTop: '4px' }}>No active AI predictive risk models or insights generated for current selection.</div>
        </div>
      ) : (
        <div className="ai-cards-grid">
          {list.map((item) => (
            <div key={item.id || item.title} className="ai-card">
              <div className="ai-card-top-row">
                <div className="ai-anomaly-type">
                  <Sparkles size={13} />
                  <span>{item.type || 'AI Insight'}</span>
                </div>
                {item.priority && (
                  <span className={`ai-priority-badge ${item.priorityType === 'critical' ? 'ai-priority-high' : 'ai-priority-medium'}`}>
                    {item.priority}
                  </span>
                )}
              </div>

              <div className="ai-card-body">
                <h4 className="ai-card-headline">{item.title}</h4>
                {item.targetEntity && <span className="ai-target-entity">{item.targetEntity}</span>}
                {item.description && <p className="ai-card-desc">{item.description}</p>}
              </div>

              {item.actionLabel && (
                <div className="ai-card-action-bar">
                  <button className="btn-outline" style={{ fontSize: '11px', padding: '6px 12px' }}>
                    {item.actionLabel}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
