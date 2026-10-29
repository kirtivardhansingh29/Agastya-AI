import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.markercluster';
import '../../styles/map.css';

/**
 * Helper component inside MapContainer to manage dynamic bounds and Leaflet Marker Cluster layer
 */
function MarkerClusterLayer({ markers, onSelectMine }) {
  const map = useMap();
  const clusterGroupRef = useRef(null);

  useEffect(() => {
    if (!map) return;

    // Remove old layer if exists
    if (clusterGroupRef.current) {
      map.removeLayer(clusterGroupRef.current);
      clusterGroupRef.current = null;
    }

    if (!markers || markers.length === 0) {
      // Zero markers matching filter: reset map view to India center
      map.setView([22.5937, 78.9629], 5);
      return;
    }

    // Create marker cluster group
    const clusterGroup = L.markerClusterGroup({
      chunkedLoading: true,
      maxClusterRadius: 50,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true
    });

    const validBounds = [];

    markers.forEach(m => {
      if (typeof m.latitude !== 'number' || typeof m.longitude !== 'number' || isNaN(m.latitude) || isNaN(m.longitude)) {
        return;
      }

      validBounds.push([m.latitude, m.longitude]);

      const riskClass =
        m.risk_level === 'critical' ? 'risk-critical' :
        m.risk_level === 'high' ? 'risk-high' :
        m.risk_level === 'warning' ? 'risk-warning' :
        m.risk_level === 'compliant' ? 'risk-compliant' : 'risk-unknown';

      const customIcon = L.divIcon({
        className: `custom-mine-pin ${riskClass}`,
        iconSize: [14, 14],
        iconAnchor: [7, 7]
      });

      const marker = L.marker([m.latitude, m.longitude], { icon: customIcon });

      // Build popup DOM content
      const popupDiv = document.createElement('div');
      popupDiv.className = 'mine-popup-card';
      popupDiv.innerHTML = `
        <div class="mine-popup-header">
          <span class="mine-popup-title">${m.mine_name || '—'}</span>
          <span class="mine-popup-sub">${m.mine_id} • ${m.state || '—'}, ${m.district || '—'}</span>
          <div class="mine-popup-tags">
            <span class="badge ${m.status === 'operating' ? 'badge-operating' : 'badge-suspended'}">${m.status || '—'}</span>
            <span class="badge ${m.risk_level ? 'badge-' + m.risk_level : 'badge-neutral'}">${m.risk_level ? m.risk_level.toUpperCase() : 'UNKNOWN'}</span>
          </div>
        </div>
        <div class="mine-popup-body">
          <div class="mine-popup-row"><label>Operator:</label><span>${m.operator || '—'}</span></div>
          <div class="mine-popup-row"><label>Latest Inspection:</label><span>${m.latest_inspection ? new Date(m.latest_inspection).toLocaleDateString() : '—'}</span></div>
          <div class="mine-popup-row"><label>Violations:</label><span>${m.violation_count ?? '—'}</span></div>
          <div class="mine-popup-row"><label>Incidents:</label><span>${m.incident_count ?? '—'}</span></div>
        </div>
        <button class="mine-popup-btn" id="btn-view-${m.mine_id}">View Mine →</button>
      `;

      // Bind button click event
      const viewBtn = popupDiv.querySelector(`#btn-view-${m.mine_id}`);
      if (viewBtn) {
        viewBtn.addEventListener('click', (e) => {
          e.preventDefault();
          if (onSelectMine) {
            onSelectMine(m.mine_id);
          }
        });
      }

      marker.bindPopup(popupDiv);
      clusterGroup.addLayer(marker);
    });

    map.addLayer(clusterGroup);
    clusterGroupRef.current = clusterGroup;

    // Dynamic Bounds Calculation: recalculate strictly from valid returned coordinates
    if (validBounds.length === 1) {
      map.setView(validBounds[0], 12);
    } else if (validBounds.length > 1) {
      const bounds = L.latLngBounds(validBounds);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 });
    }

    return () => {
      if (clusterGroupRef.current) {
        map.removeLayer(clusterGroupRef.current);
        clusterGroupRef.current = null;
      }
    };
  }, [map, markers, onSelectMine]);

  return null;
}

/**
 * Main Interactive India Mine Map component powered by Leaflet & OpenStreetMap
 */
export default function LeafletMineMap({ markers = [], onSelectMine, height = '450px', showLegend = true }) {
  const defaultCenter = [22.5937, 78.9629];
  const defaultZoom = 5;

  return (
    <div className="leaflet-map-container" style={{ height }}>
      {showLegend && (
        <div className="map-legend-overlay">
          <div className="map-legend-title">Risk Code Index</div>
          <div className="map-legend-items">
            <span className="map-legend-item"><span className="legend-dot critical"></span> Critical Risk</span>
            <span className="map-legend-item"><span className="legend-dot high"></span> High Risk</span>
            <span className="map-legend-item"><span className="legend-dot warning"></span> Warning</span>
            <span className="map-legend-item"><span className="legend-dot compliant"></span> Compliant</span>
            <span className="map-legend-item"><span className="legend-dot unknown"></span> Unknown / Unrated</span>
          </div>
        </div>
      )}

      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        style={{ width: '100%', height: '100%' }}
        zoomControl={true}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={18}
        />
        <MarkerClusterLayer markers={markers} onSelectMine={onSelectMine} />
      </MapContainer>
    </div>
  );
}
