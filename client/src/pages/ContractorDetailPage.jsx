import React, { useState, useEffect } from 'react';
import { ArrowLeft, Building, FileText, ShieldCheck, Calendar, Wrench, FileSpreadsheet, MapPin } from 'lucide-react';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import ErrorState from '../components/common/ErrorState';
import { getContractorDetail } from '../services/api';
import '../styles/mine-monitoring.css';
import '../styles/inspections.css';

export default function ContractorDetailPage({ contractorId, onBack, onSelectMine }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [contractor, setContractor] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchDetail() {
      try {
        setLoading(true);
        setError(null);
        const data = await getContractorDetail(contractorId);
        if (isMounted) {
          setContractor(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || `Failed to load contractor detail for ${contractorId}`);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchDetail();
    return () => { isMounted = false; };
  }, [contractorId]);

  if (loading) return <LoadingSkeleton />;
  if (error || !contractor) {
    return (
      <div className="monitoring-page">
        <button className="btn-secondary" onClick={onBack} style={{ marginBottom: '16px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <ArrowLeft size={16} /> Back to Contractors
        </button>
        <ErrorState message={error || "Contractor record not found (HTTP 404)"} onRetry={onBack} />
      </div>
    );
  }

  const licBadge = contractor.license_status === 'Valid' ? 'badge-operating' : 'badge-critical';
  const insBadge = contractor.insurance_status === 'active' ? 'badge-operating' : 'badge-warning';
  const docBadge =
    contractor.document_status === 'Valid' ? 'badge-operating' :
    contractor.document_status === 'Expiring Soon' ? 'badge-warning' :
    contractor.document_status === 'Expired' ? 'badge-critical' : 'badge-neutral';

  const complianceDocs = Array.isArray(contractor.compliance_documents) ? contractor.compliance_documents : [];
  const expiryList = Array.isArray(contractor.document_expiry_list) ? contractor.document_expiry_list : [];
  const equipmentCerts = Array.isArray(contractor.equipment_inspection_certificates) ? contractor.equipment_inspection_certificates : [];
  const associatedMines = Array.isArray(contractor.associated_mines) ? contractor.associated_mines : [];

  return (
    <div className="monitoring-page">
      {/* Top Navigation */}
      <div style={{ marginBottom: '16px' }}>
        <button className="btn-secondary" onClick={onBack} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <ArrowLeft size={16} /> Back to Contractors
        </button>
      </div>

      {/* Dossier Header Card */}
      <div className="detail-header-card">
        <div className="detail-title-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <h1 className="detail-title">{contractor.company_name}</h1>
            <code style={{ fontSize: '14px', color: '#0284c7', background: '#e0f2fe', padding: '3px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
              {contractor.contractor_id}
            </code>
            <span className={`badge ${licBadge}`}>
              License: {contractor.license_status?.toUpperCase()}
            </span>
            <span className={`badge ${insBadge}`}>
              Insurance: {contractor.insurance_status ? contractor.insurance_status.replace('_', ' ').toUpperCase() : '—'}
            </span>
            <span className={`badge ${docBadge}`}>
              Documents: {contractor.document_status}
            </span>
          </div>
        </div>

        <div className="dossier-meta-grid">
          <div className="meta-item">
            <span className="meta-label"><Calendar size={14} /> License Expiry Validity</span>
            <span className="meta-value">{contractor.license_validity || '—'}</span>
          </div>

          <div className="meta-item">
            <span className="meta-label"><ShieldCheck size={14} /> Insurance Status</span>
            <span className="meta-value" style={{ textTransform: 'capitalize' }}>{contractor.insurance_status ? contractor.insurance_status.replace('_', ' ') : '—'}</span>
          </div>

          <div className="meta-item">
            <span className="meta-label"><FileText size={14} /> Compliance Documents</span>
            <span className="meta-value">{complianceDocs.length} Registered Documents</span>
          </div>

          <div className="meta-item">
            <span className="meta-label"><Building size={14} /> Mines Recorded in Attendance</span>
            <span className="meta-value">{associatedMines.length} Monitored Mines</span>
          </div>
        </div>
      </div>

      {/* Main Grid Sections */}
      <div className="inspection-detail-grid">
        <div className="left-detail-column">
          {/* Section: Document Expiry Dates */}
          <div className="detail-section-card">
            <div className="section-header">
              <Calendar size={18} color="#0284c7" />
              <h2>Document Expiry Details ({expiryList.length})</h2>
            </div>

            {expiryList.length > 0 ? (
              <div className="checklist-table-wrapper">
                <table className="checklist-table">
                  <thead>
                    <tr>
                      <th>Document Identifier / Key</th>
                      <th>Expiry Date</th>
                      <th>Derived Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expiryList.map((doc, idx) => {
                      const stBadge =
                        doc.status === 'Valid' ? 'badge-operating' :
                        doc.status === 'Expiring Soon' ? 'badge-warning' :
                        doc.status === 'Expired' ? 'badge-critical' : 'badge-neutral';

                      return (
                        <tr key={idx}>
                          <td style={{ fontWeight: '600', color: '#0f172a' }}>{doc.document_key}</td>
                          <td style={{ fontSize: '13px' }}>{doc.expiry_date || '—'}</td>
                          <td>
                            <span className={`badge ${stBadge}`}>
                              {doc.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-field-notice">No document expiry dates recorded.</div>
            )}
          </div>

          {/* Section: Compliance Documents */}
          <div className="detail-section-card">
            <div className="section-header">
              <FileText size={18} color="#0284c7" />
              <h2>Compliance Documents ({complianceDocs.length})</h2>
            </div>

            {complianceDocs.length > 0 ? (
              <div className="evidence-grid">
                {complianceDocs.map((file, idx) => (
                  <div key={idx} className="evidence-card">
                    <div className="evidence-thumbnail">
                      <FileText size={24} color="#0284c7" />
                      <span style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>PDF Document</span>
                    </div>
                    <div className="evidence-filename" title={file}>
                      {file}
                    </div>
                    <div style={{ padding: '0 10px 10px 10px' }}>
                      <span className="evidence-unavailable-fallback">Document file reference</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-field-notice">No compliance documents registered.</div>
            )}
          </div>

          {/* Section: Equipment Inspection Certificates */}
          <div className="detail-section-card">
            <div className="section-header">
              <Wrench size={18} color="#0284c7" />
              <h2>Equipment Inspection Certificates ({equipmentCerts.length})</h2>
            </div>

            {equipmentCerts.length > 0 ? (
              <div className="evidence-grid">
                {equipmentCerts.map((file, idx) => (
                  <div key={idx} className="evidence-card">
                    <div className="evidence-thumbnail">
                      <Wrench size={24} color="#ca8a04" />
                      <span style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>Equipment Certificate</span>
                    </div>
                    <div className="evidence-filename" title={file}>
                      {file}
                    </div>
                    <div style={{ padding: '0 10px 10px 10px' }}>
                      <span className="evidence-unavailable-fallback">Inspection certificate reference</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-field-notice">No equipment inspection certificates registered.</div>
            )}
          </div>
        </div>

        {/* Right Column: Associated Mines */}
        <div className="right-detail-column">
          <div className="detail-section-card" style={{ position: 'sticky', top: '80px' }}>
            <div className="section-header">
              <Building size={18} color="#0284c7" />
              <h2>Mines Recorded in Attendance Records ({associatedMines.length})</h2>
            </div>

            {associatedMines.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {associatedMines.map(m => (
                  <div
                    key={m.mine_id}
                    style={{
                      padding: '12px',
                      background: '#f8fafc',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                    onClick={() => onSelectMine && onSelectMine(m.mine_id)}
                  >
                    <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '14px', marginBottom: '2px' }}>
                      {m.mine_name}
                    </div>
                    <div style={{ fontSize: '12px', color: '#0284c7', fontWeight: '600' }}>
                      ID: {m.mine_id}
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                      <MapPin size={10} style={{ display: 'inline' }} /> {m.district ? `${m.district}, ` : ''}{m.state || '—'}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-field-notice">
                No mine attendance associations recorded for this contractor.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
