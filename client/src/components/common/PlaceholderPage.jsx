import React from 'react';
import { Hammer, ArrowLeft } from 'lucide-react';

export default function PlaceholderPage({ title, onBackToOverview }) {
  return (
    <div style={{
      backgroundColor: '#ffffff',
      border: '1px solid var(--border-color)',
      borderRadius: '8px',
      padding: '40px 24px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px',
      maxWidth: '640px',
      margin: '40px auto',
      textAlign: 'center',
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div style={{
        width: '48px',
        height: '48px',
        borderRadius: '50%',
        backgroundColor: '#eff6ff',
        color: '#1d4ed8',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Hammer size={24} />
      </div>

      <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>
        {title} — Phase 2 Module
      </h2>

      <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', maxWidth: '420px', lineHeight: 1.4 }}>
        This module is scheduled for implementation in Phase 2 of the Agastya AI roadmap.
      </p>

      <span className="badge-tag badge-calc" style={{ marginTop: '4px' }}>
        SCHEDULED PHASE 2 IMPLEMENTATION
      </span>

      <button
        className="btn-outline"
        onClick={onBackToOverview}
        style={{ marginTop: '16px' }}
      >
        <ArrowLeft size={13} />
        <span>Return to Overview Command Center</span>
      </button>
    </div>
  );
}
