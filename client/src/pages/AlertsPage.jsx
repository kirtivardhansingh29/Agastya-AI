import React, { useState, useEffect } from 'react';
import {
  AlertOctagon,
  Search,
  ExternalLink,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { getAlerts } from '../services/api';
import '../styles/alerts.css';

export default function AlertsPage({ onSelectIncident, onUpdateAlertsCount }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [alertsData, setAlertsData] = useState({ alerts: [], totalCount: 0 });

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    getAlerts({ search: searchQuery })
      .then(res => {
        if (isMounted) {
          setAlertsData(res || { alerts: [], totalCount: 0 });
          const count = res?.totalCount ?? res?.count ?? (Array.isArray(res?.alerts) ? res.alerts.length : 0);
          if (onUpdateAlertsCount && !searchQuery) {
            onUpdateAlertsCount(count);
          }
          setError(null);
          setLoading(false);
        }
      })

      .catch(err => {
        if (isMounted) {
          console.error("Error fetching critical incident alerts:", err);
          setError("Failed to load critical incident alerts.");
          setLoading(false);
        }
      });

    return () => { isMounted = false; };
  }, [searchQuery]);

  const handleAlertClick = (submissionId) => {
    if (onSelectIncident) {
      onSelectIncident(submissionId);
    }
  };

  const alertsList = alertsData.alerts || [];

  return (
    <div className="alerts-container">
      {/* Header Bar */}
      <div className="alerts-header">
        <div className="alerts-title-area">
          <div className="alerts-badge">
            <AlertOctagon size={14} />
            <span>CRITICAL INCIDENT ALERTS</span>
          </div>
          <h1>Critical Incident Alerts</h1>
          <p>Chronological telemetry feed of all severe critical incidents requiring regulatory attention</p>
        </div>
      </div>

      {/* Toolbar & Search */}
      <div className="alerts-toolbar">
        <div className="alerts-summary-pill">
          <AlertOctagon size={15} style={{ color: '#dc2626' }} />
          <span>All Critical Alerts: <strong>{alertsData.totalCount || 0}</strong></span>
        </div>

        <div className="alerts-search-box">
          <Search size={14} style={{ color: '#64748b' }} />
          <input
            type="text"
            className="alerts-search-input"
            placeholder="Search critical incidents by ID, mine, or type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="alerts-empty">
          <div className="loading-spinner" />
          <p>Fetching critical incident feed...</p>
        </div>
      ) : error ? (
        <div className="alerts-empty" style={{ color: '#ef4444' }}>
          <AlertTriangle size={32} style={{ marginBottom: '0.5rem' }} />
          <p>{error}</p>
        </div>
      ) : alertsList.length === 0 ? (
        <div className="alerts-empty">
          <div className="alerts-empty-icon">
            <CheckCircle2 size={32} />
          </div>
          <h3>No Critical Incidents Found</h3>
          <p>No critical incident records match the active criteria.</p>
        </div>
      ) : (
        <div className="alerts-list">
          {alertsList.map(alert => (
            <div key={alert.id} className="alert-card border-critical">
              <div className="alert-card-top">
                <div className="alert-type-badge-row">
                  <span className="severity-pill critical">
                    CRITICAL INCIDENT
                  </span>
                  {alert.incident_type && (
                    <span className="category-tag">
                      {alert.incident_type.replace(/_/g, ' ').toUpperCase()}
                    </span>
                  )}
                  {alert.notify_authority_immediately === 'yes' && (
                    <span className="authority-immediate-tag">
                      IMMEDIATE NOTIFICATION
                    </span>
                  )}
                </div>

                <div className="alert-time">
                  <Clock size={13} />
                  <span>{alert.timestamp ? new Date(alert.timestamp).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : 'Recent'}</span>
                </div>
              </div>

              <div className="alert-card-body">
                <h2 className="alert-card-title">{alert.subtitle}</h2>
                <p className="alert-card-description">{alert.description}</p>
              </div>

              <div className="alert-card-footer">
                <div className="alert-meta-info">
                  {alert.mine_name && (
                    <div className="alert-meta-item">
                      <MapPin size={13} />
                      <span>{alert.mine_name} ({alert.mine_id})</span>
                    </div>
                  )}
                  {alert.people_affected > 0 && (
                    <div className="alert-meta-item">
                      <Users size={13} />
                      <span>{alert.people_affected} People Affected</span>
                    </div>
                  )}
                </div>

                <button
                  className="alert-action-btn"
                  onClick={() => handleAlertClick(alert.submission_id)}
                >
                  <span>View Incident</span>
                  <ExternalLink size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
