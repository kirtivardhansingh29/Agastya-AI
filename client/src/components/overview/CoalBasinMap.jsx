import React, { useState, useEffect } from 'react';
import { Navigation } from 'lucide-react';
import LeafletMineMap from '../map/LeafletMineMap';
import { getMineMapData } from '../../services/api';

export default function CoalBasinMap({ onSelectMine }) {
  const [mapMarkers, setMapMarkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    getMineMapData()
      .then(data => {
        if (isMounted) {
          setMapMarkers(data || []);
          setLoading(false);
        }
      })
      .catch(err => {
        if (isMounted) {
          console.error("Failed to load map markers for Overview:", err);
          setError(err.message);
          setLoading(false);
        }
      });
    return () => { isMounted = false; };
  }, []);

  return (
    <div className="basin-map-card">
      <div className="basin-map-header">
        <div className="basin-map-title-box">
          <div className="basin-map-title-row">
            <span className="basin-map-title">India Coal Basin Monitoring Map</span>
            <span className="badge-tag badge-raw">
              <Navigation size={9} />
              [LIVE LEAFLET TELEMETRY]
            </span>
          </div>
          <span className="basin-map-sub">
            Interactive OpenStreetMap telemetry featuring dynamic mine location markers &amp; risk classification.
          </span>
        </div>
      </div>

      <div className="basin-map-viewport" style={{ height: '420px', padding: 0 }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted, #94a3b8)' }}>
            Loading Leaflet map telemetry...
          </div>
        ) : error ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#ef4444' }}>
            Unable to render map: {error}
          </div>
        ) : (
          <LeafletMineMap
            markers={mapMarkers}
            onSelectMine={onSelectMine}
            height="100%"
          />
        )}
      </div>

      <div className="basin-map-footer">
        <span>Displaying {mapMarkers.length} active mine coordinates across India</span>
        <span>Leaflet + OpenStreetMap Engine • DGMS Regulatory Telemetry</span>
      </div>
    </div>
  );
}
