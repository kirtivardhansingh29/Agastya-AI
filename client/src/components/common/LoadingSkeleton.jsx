import React from 'react';

export default function LoadingSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '10px' }}>
      <div className="skeleton-box" style={{ height: '36px', width: '380px' }}></div>
      <div className="skeleton-box" style={{ height: '70px', width: '100%' }}></div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
        {[...Array(7)].map((_, i) => (
          <div key={i} className="skeleton-box" style={{ height: '80px' }}></div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '66% 34%', gap: '12px' }}>
        <div className="skeleton-box" style={{ height: '360px' }}></div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="skeleton-box" style={{ height: '170px' }}></div>
          <div className="skeleton-box" style={{ height: '178px' }}></div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
        <div className="skeleton-box" style={{ height: '180px' }}></div>
        <div className="skeleton-box" style={{ height: '180px' }}></div>
        <div className="skeleton-box" style={{ height: '180px' }}></div>
      </div>
    </div>
  );
}
