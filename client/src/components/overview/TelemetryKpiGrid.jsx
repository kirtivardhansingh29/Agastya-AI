// Updated TelemetryKpiGrid component without hardcoded fallback values
import React from 'react';
import {
  Building2,
  CalendarCheck,
  AlertCircle,
  Flame,
  Clock,
  Users,
  UserCheck,
  Sigma
} from 'lucide-react';

export default function TelemetryKpiGrid({ telemetry }) {
  const t = telemetry ?? {};

  return (
    <section className="telemetry-section">
      <div className="telemetry-section-header">
        <div className="telemetry-section-title-group">
          <span className="telemetry-title">Directorate Aggregate Telemetry</span>
          <span className="badge-tag badge-calc">
            <Sigma size={9} />
            ∑ [CALCULATED]
          </span>
        </div>
        <span className="telemetry-auto-recalc">Auto-recalculated across all shifts</span>
      </div>

      <div className="telemetry-cards-grid">
        {/* 1. Total Mines */}
        <div className="kpi-card">
          <div className="kpi-card-top">
            <span className="kpi-card-label">TOTAL MINES</span>
            <Building2 size={14} className="kpi-card-icon" />
          </div>
          <div className="kpi-card-value-row">
            <span className="kpi-card-value">
              {t.totalMines?.value?.toLocaleString() ?? '‑'}
            </span>
          </div>
          <div className="kpi-card-bottom">
            <div>{t.totalMines?.label ?? '‑'}</div>
            <div>
              <span className="kpi-highlight-text">
                • {t.totalMines?.operating ?? '‑'} Operating{' '}
              </span>,{' '}
              <span className="kpi-suspended-text">
                {t.totalMines?.suspended ?? '‑'} Suspended
              </span>
            </div>
          </div>
        </div>

        {/* 2. Inspections */}
        <div className="kpi-card">
          <div className="kpi-card-top">
            <span className="kpi-card-label">INSPECTIONS</span>
            <CalendarCheck size={14} className="kpi-card-icon" />
          </div>
          <div className="kpi-card-value-row">
            <span className="kpi-card-value">
              {t.inspections?.value?.toLocaleString() ?? '‑'}
            </span>
          </div>
          <div className="kpi-card-bottom">
            <div>Submitted 30d</div>
            <div style={{ marginTop: '2px' }}>
              <span className="kpi-badge-trend">
                {t.inspections?.trend ?? '‑'}
              </span>{' '}
              <span style={{ fontSize: '9px' }}>vs prior cycle</span>
            </div>
          </div>
        </div>

        {/* 3. Open Violations */}
        <div className="kpi-card">
          <div className="kpi-card-top">
            <span className="kpi-card-label">OPEN VIOLATIONS</span>
            <span className="kpi-badge-action">Action</span>
          </div>
          <div className="kpi-card-value-row">
            <span className="kpi-card-value kpi-value-red">
              {t.openViolations?.value ?? '‑'}
            </span>
          </div>
          <div className="kpi-card-bottom">
            <div>
              <span style={{ color: 'var(--critical-red)', fontWeight: 700 }}>
                {t.openViolations?.critical ?? '‑'} Crit
              </span>,{' '}
              <span>{t.openViolations?.major ?? '‑'} Major</span>,{' '}
              <span>{t.openViolations?.minor ?? '‑'} Minor</span>
            </div>
          </div>
        </div>

        {/* 4. Critical Incidents */}
        <div className="kpi-card">
          <div className="kpi-card-top">
            <span className="kpi-card-label">CRITICAL INCIDENTS</span>
            <Flame size={14} style={{ color: 'var(--critical-red)' }} />
          </div>
          <div className="kpi-card-value-row">
            <span className="kpi-card-value kpi-value-red">
              {t.criticalIncidents?.value ?? '‑'}
            </span>
          </div>
          <div className="kpi-card-bottom">
            <div>{t.criticalIncidents?.fatalInquiries ?? '‑'} Fatal Inquiries,</div>
            <div>{t.criticalIncidents?.highRiskActive ?? '‑'} High Risk active</div>
          </div>
        </div>

        {/* 5. Pending Review */}
        <div className="kpi-card">
          <div className="kpi-card-top">
            <span className="kpi-card-label">PENDING REVIEW</span>
            <Clock size={14} className="kpi-card-icon" />
          </div>
          <div className="kpi-card-value-row">
            <span className="kpi-card-value">
              {t.pendingReview?.value ?? '‑'}
            </span>
          </div>
          <div className="kpi-card-bottom">
            <div>{t.pendingReview?.label ?? '‑'}</div>
          </div>
        </div>

        {/* 7. Workforce Live */}
        <div className="kpi-card">
          <div className="kpi-card-top">
            <span className="kpi-card-label">WORKFORCE LIVE</span>
            <Users size={14} className="kpi-card-icon" />
          </div>
          <div className="kpi-card-value-row">
            <span className="kpi-card-value">
              {t.workforceLive?.value?.toLocaleString() ?? '‑'}
            </span>
          </div>
          <div className="kpi-card-bottom">
            <div>Shift biometric &amp; geo-tag live check-ins</div>
          </div>
        </div>

        {/* 8. Attendance Rate */}
        <div className="kpi-card">
          <div className="kpi-card-top">
            <span className="kpi-card-label">ATTENDANCE RATE</span>
            <UserCheck size={14} className="kpi-card-icon" />
          </div>
          <div className="kpi-card-value-row">
            <span className="kpi-card-value">
              {t.attendanceRate?.value != null ? `${t.attendanceRate.value}%` : '—'}
            </span>
          </div>
          <div className="kpi-card-bottom">
            <div>
              {t.attendanceRate?.expected?.toLocaleString() ?? '‑'} Expected vs{' '}
              {t.attendanceRate?.actual?.toLocaleString() ?? '‑'} Actual
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
