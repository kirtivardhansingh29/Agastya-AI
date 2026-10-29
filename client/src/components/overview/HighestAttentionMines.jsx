import React, { useState, useEffect, useCallback } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { getHighestAttentionMines } from '../../services/api';

export default function HighestAttentionMines({ attentionMines, onSelectMine, filters }) {
  const [mines, setMines] = useState(attentionMines || []);
  const [loading, setLoading] = useState(!attentionMines);
  const [error, setError] = useState(null);

  const fetchAttentionMines = useCallback(async () => {
    try {
      setError(null);
      const data = await getHighestAttentionMines(filters || {});
      setMines(data || []);
    } catch (err) {
      console.error("Error loading highest attention mines ranking:", err);
      setError(err.message || "Attention ranking unavailable");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    if (attentionMines && attentionMines.length > 0) {
      setMines(attentionMines);
      setLoading(false);
      return;
    }
    fetchAttentionMines();
  }, [attentionMines, fetchAttentionMines]);

  // Requirement 13: Polling interval (30-60 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchAttentionMines();
    }, 35000);
    return () => clearInterval(interval);
  }, [fetchAttentionMines]);

  return (
    <div className="highest-attention-card">
      <div className="attention-header">
        <div className="attention-title-group">
          <span className="attention-title">Highest Attention Mines</span>
          {/* Requirement 2: Honest CALCULATED badge instead of fake AI RANKED */}
          <span className="badge-tag badge-calculated" style={{ background: '#e0f2fe', color: '#0369a1', border: '1px solid #bae6fd', fontSize: '9.5px', fontWeight: '800' }}>
            <SlidersHorizontal size={9} />
            [CALCULATED]
          </span>
        </div>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Top 4</span>
      </div>

      <div className="attention-list">
        {/* Requirement 17: Loading State */}
        {loading && mines.length === 0 ? (
          <div style={{ padding: '16px 0', textAlign: 'center', color: '#64748b', fontSize: '12px' }}>
            Calculating attention metrics...
          </div>
        ) : error && mines.length === 0 ? (
          /* Requirement 18: Error State */
          <div style={{ color: '#ef4444', fontSize: '12px', padding: '16px 0', textAlign: 'center' }}>
            Attention ranking unavailable
          </div>
        ) : mines.length === 0 ? (
          /* Requirement 16: Empty State */
          <div style={{ color: '#64748b', fontSize: '12px', padding: '16px 0', textAlign: 'center' }}>
            No high-attention mines identified
          </div>
        ) : (
          mines.map((mine) => {
            const mId = mine.mine_id || mine.id;
            const mName = mine.mine_name || mine.name || '—';
            const mState = mine.state || '—';
            const statusText = mine.status || mine.badge || 'REVIEW REQUIRED';
            const headlineText = mine.headline || mine.recentHighlight || 'Attention required';
            const critCount = mine.critical_incidents ?? mine.criticalIssues ?? 0;
            const fatalCount = mine.fatal_incidents ?? 0;
            const violCount = mine.violations ?? 0;

            const badgeClass =
              (statusText === 'ESCALATED' || statusText === 'CRITICAL RISK' || mine.badgeType === 'critical')
                ? 'badge-critical'
                : (statusText === 'HIGH RISK' || statusText === 'UNDER INVESTIGATION' || mine.badgeType === 'warning')
                ? 'badge-warning'
                : 'badge-neutral';

            return (
              <div
                key={mId}
                className="attention-item"
                onClick={() => onSelectMine && onSelectMine(mId)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectMine && onSelectMine(mId);
                  }
                }}
                tabIndex={0}
                role="button"
                aria-label={`View dossier for ${mName}`}
                style={{ cursor: 'pointer' }}
              >
                <div className="attention-item-top">
                  <span className="attention-mine-id-name">
                    {mine.rank} {mName} ({mState})
                  </span>
                  <span className={`badge-tag ${badgeClass}`}>
                    {statusText}
                  </span>
                </div>
                <div className="attention-item-bottom">
                  <span>
                    Crit: <strong className="attention-crit-highlight">{critCount}</strong>
                    {fatalCount > 0 && <span style={{ color: '#dc2626', fontWeight: '800' }}> ({fatalCount} Fatal)</span>}
                    {' | '}
                    Violations: <strong>{violCount}</strong>
                  </span>
                  {headlineText && (
                    <>
                      <span>•</span>
                      <span className="attention-headline-text" title={headlineText} style={{ color: badgeClass === 'badge-critical' ? 'var(--critical-red)' : 'var(--text-muted)' }}>
                        {headlineText}
                      </span>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
