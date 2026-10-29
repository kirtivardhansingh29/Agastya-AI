import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { getIncidents } from '../../services/api';

export default function PriorityBanner({ onSelectIncident }) {
  const [priorityIncidents, setPriorityIncidents] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tickerKey, setTickerKey] = useState(0);
  const currentIncidentIdRef = useRef(null);

  const fetchPriorityIncidents = useCallback(async () => {
    try {
      const res = await getIncidents({ severity: 'critical' });
      const allData = res?.data || (Array.isArray(res) ? res : []);

      // Filter strictly where severity === "critical" (case-insensitive)
      const filtered = allData.filter(i => String(i?.severity || '').toLowerCase() === 'critical');

      // Deduplicate by submission_id
      const seen = new Set();
      const uniqueFiltered = [];
      for (const item of filtered) {
        if (item && item.submission_id && !seen.has(item.submission_id)) {
          seen.add(item.submission_id);
          uniqueFiltered.push(item);
        }
      }

      // Sort descending chronologically by date_time (newest incident first)
      uniqueFiltered.sort((a, b) => new Date(b.date_time) - new Date(a.date_time));

      setError(null);
      setPriorityIncidents(() => {
        if (currentIncidentIdRef.current) {
          const matchedIndex = uniqueFiltered.findIndex(i => i.submission_id === currentIncidentIdRef.current);
          if (matchedIndex !== -1) {
            setCurrentIndex(matchedIndex);
          } else {
            setCurrentIndex(0);
          }
        }
        return uniqueFiltered;
      });
    } catch (err) {
      console.error("Error fetching priority incidents for alert feed:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  // Periodic refresh every 30 seconds
  useEffect(() => {
    fetchPriorityIncidents();
    const interval = setInterval(() => {
      fetchPriorityIncidents();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchPriorityIncidents]);

  // Keep track of active submission_id
  useEffect(() => {
    if (priorityIncidents.length > 0 && priorityIncidents[currentIndex]) {
      currentIncidentIdRef.current = priorityIncidents[currentIndex].submission_id;
    } else {
      currentIncidentIdRef.current = null;
    }
  }, [priorityIncidents, currentIndex]);

  // Automatic ticker cycle every 7 seconds if multiple priority incidents exist
  useEffect(() => {
    if (priorityIncidents.length <= 1) return;
    const timer = setTimeout(() => {
      setCurrentIndex(prev => (prev + 1) % priorityIncidents.length);
      setTickerKey(prev => prev + 1);
    }, 7000);
    return () => clearTimeout(timer);
  }, [currentIndex, priorityIncidents.length, tickerKey]);

  // Manual Left Arrow Navigation with wrap-around
  const handlePrev = (e) => {
    e.stopPropagation();
    if (priorityIncidents.length <= 1) return;
    setCurrentIndex(prev => (prev - 1 + priorityIncidents.length) % priorityIncidents.length);
    setTickerKey(prev => prev + 1);
  };

  // Manual Right Arrow Navigation with wrap-around
  const handleNext = (e) => {
    e.stopPropagation();
    if (priorityIncidents.length <= 1) return;
    setCurrentIndex(prev => (prev + 1) % priorityIncidents.length);
    setTickerKey(prev => prev + 1);
  };

  // Clickable alert item -> /incidents/:submissionId
  const handleIncidentClick = (submissionId) => {
    if (onSelectIncident && submissionId) {
      onSelectIncident(submissionId);
    }
  };

  // Error State
  if (error) {
    return (
      <div className="priority-banner priority-banner-error" role="region" aria-label="Priority Alert Banner">
        <div className="priority-banner-left">
          <span className="priority-red-badge">
            <AlertCircle size={12} />
            FEED OFFLINE
          </span>
          <span className="priority-banner-text">Priority incident feed unavailable</span>
        </div>
      </div>
    );
  }

  // Loading State
  if (loading && priorityIncidents.length === 0) {
    return (
      <div className="priority-banner" role="region" aria-label="Priority Alert Banner">
        <div className="priority-banner-left">
          <span className="priority-red-badge">
            <span className="pulse-dot"></span>
            PRIORITY RED
          </span>
          <span className="priority-banner-text">Loading priority incidents...</span>
        </div>
      </div>
    );
  }

  // No Priority Incident State
  if (priorityIncidents.length === 0) {
    return (
      <div className="priority-banner priority-banner-neutral" role="region" aria-label="Priority Alert Banner">
        <div className="priority-banner-left">
          <span className="priority-neutral-badge">
            STATUS NORMAL
          </span>
          <span className="priority-banner-text">
            No active priority incidents
          </span>
        </div>
      </div>
    );
  }

  const currentItem = priorityIncidents[currentIndex] || priorityIncidents[0];
  const totalCount = priorityIncidents.length;
  const isMultiple = totalCount > 1;

  const subId = currentItem.submission_id || '—';
  const mineDisplay = currentItem.mine_id || currentItem.mine_name || '—';
  const descDisplay = currentItem.description || currentItem.incident_type || '—';
  const affectedDisplay = currentItem.people_affected !== undefined && currentItem.people_affected !== null
    ? `${currentItem.people_affected} People Affected`
    : '— People Affected';

  return (
    <div className="priority-banner" role="region" aria-label="Priority Alert Banner">
      <div className="priority-banner-left">
        {/* Severity Badge */}
        <span className="priority-red-badge">
          <span className="pulse-dot"></span>
          PRIORITY RED
        </span>

        {/* Requirement 9, 14: Dynamic Position Counter e.g. 1 / 5 or 1 / 1 */}
        <span className="priority-count-badge">
          {currentIndex + 1} / {totalCount}
        </span>

        {/* Requirement 7, 13, 14: Manual Left / Right Arrow Controls */}
        {isMultiple && (
          <div className="priority-nav-arrows">
            <button
              type="button"
              className="priority-arrow-btn"
              onClick={handlePrev}
              aria-label="Previous priority incident"
              title="Previous priority incident"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              type="button"
              className="priority-arrow-btn"
              onClick={handleNext}
              aria-label="Next priority incident"
              title="Next priority incident"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        )}

        {/* Requirement 4, 5, 6, 17: Interactive Ticker Item */}
        <div
          key={`${currentItem.submission_id}-${tickerKey}`}
          className="priority-ticker-container"
          onClick={() => handleIncidentClick(currentItem.submission_id)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleIncidentClick(currentItem.submission_id);
            }
          }}
          tabIndex={0}
          role="button"
          aria-label={`View detail for incident ${subId}`}
        >
          <div className="priority-ticker-item">
            <span className="ticker-code">{subId}</span>
            <span className="ticker-sep">•</span>
            <span className="ticker-mine">{mineDisplay}</span>
            <span className="ticker-sep">•</span>
            <span className="ticker-desc">{descDisplay}</span>
          </div>
        </div>
      </div>

      {/* Right side: People affected stat */}
      <div className="priority-banner-right">
        <div
          className="priority-stat-item priority-stat-clickable"
          onClick={() => handleIncidentClick(currentItem.submission_id)}
          title="View incident details"
        >
          <AlertCircle size={13} />
          <span>{affectedDisplay}</span>
        </div>
      </div>
    </div>
  );
}
