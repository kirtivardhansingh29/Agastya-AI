import {
  contractorRepo,
  attendanceRepo,
  mineRepo
} from '../repositories/firestoreRepository.js';

/**
 * Service logic for Phase 5 Contractors & Documents
 */

const REF_DATE = new Date('2024-10-25T00:00:00+05:30');
const THRESHOLD_DATE = new Date('2024-11-25T23:59:59+05:30');

export function deriveLicenseStatus(licenseValidity) {
  if (!licenseValidity) return 'Unknown';
  const d = new Date(licenseValidity);
  if (isNaN(d.getTime())) return 'Unknown';
  return d <= REF_DATE ? 'Expired' : 'Valid';
}

export function deriveDocumentStatus(documentExpiryDates) {
  if (!documentExpiryDates || typeof documentExpiryDates !== 'object') return 'Unknown';
  const entries = Object.entries(documentExpiryDates);
  if (entries.length === 0) return 'Unknown';

  let expiredCount = 0;
  let expiringSoonCount = 0;
  let validCount = 0;

  for (const [, dateVal] of entries) {
    if (!dateVal) continue;
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) continue;

    if (d <= REF_DATE) {
      expiredCount++;
    } else if (d <= THRESHOLD_DATE) {
      expiringSoonCount++;
    } else {
      validCount++;
    }
  }

  if (expiredCount === 0 && expiringSoonCount === 0 && validCount === 0) return 'Unknown';
  if (expiredCount > 0 && (validCount > 0 || expiringSoonCount > 0)) return 'Mixed';
  if (expiringSoonCount > 0 && validCount > 0) return 'Mixed';
  if (expiredCount > 0) return 'Expired';
  if (expiringSoonCount > 0) return 'Expiring Soon';
  return 'Valid';
}

export function getDocumentExpiryDetails(documentExpiryDates) {
  if (!documentExpiryDates || typeof documentExpiryDates !== 'object') return [];
  return Object.entries(documentExpiryDates).map(([docKey, dateVal]) => {
    let status = 'Unknown';
    if (dateVal) {
      const d = new Date(dateVal);
      if (!isNaN(d.getTime())) {
        if (d <= REF_DATE) status = 'Expired';
        else if (d <= THRESHOLD_DATE) status = 'Expiring Soon';
        else status = 'Valid';
      }
    }
    return {
      document_key: docKey,
      expiry_date: dateVal,
      status
    };
  });
}

export function countExpiringDocuments(documentExpiryDates) {
  if (!documentExpiryDates || typeof documentExpiryDates !== 'object') return 0;
  let count = 0;
  for (const dateVal of Object.values(documentExpiryDates)) {
    if (!dateVal) continue;
    const d = new Date(dateVal);
    if (!isNaN(d.getTime()) && d > REF_DATE && d <= THRESHOLD_DATE) {
      count++;
    }
  }
  return count;
}

export async function getFilteredContractors(query = {}) {
  const [allContractors, allAttendance, allMines] = await Promise.all([
    contractorRepo.getAll(),
    attendanceRepo.getAll(),
    mineRepo.getAll()
  ]);

  // Mine lookup map by mine_id
  const mineMap = new Map();
  for (const m of allMines) {
    if (m.mine_id) mineMap.set(m.mine_id, m);
  }

  // Derive unique associated mines per contractor_id from attendance.json
  const contractorMinesMap = new Map();
  for (const att of allAttendance) {
    if (att.contractor_id && att.mine_id) {
      if (!contractorMinesMap.has(att.contractor_id)) {
        contractorMinesMap.set(att.contractor_id, new Set());
      }
      contractorMinesMap.get(att.contractor_id).add(att.mine_id);
    }
  }

  // Enrich contractors with derived statuses and associated mines
  let enriched = allContractors.map(c => {
    const licenseStatus = deriveLicenseStatus(c.license_validity);
    const documentStatus = deriveDocumentStatus(c.document_expiry_dates);
    const documentExpiryList = getDocumentExpiryDetails(c.document_expiry_dates);
    const expiringDocsCount = countExpiringDocuments(c.document_expiry_dates);

    const mineIdSet = contractorMinesMap.get(c.contractor_id) || new Set();
    const associatedMines = Array.from(mineIdSet).map(mId => {
      const m = mineMap.get(mId) || {};
      return {
        mine_id: mId,
        mine_name: m.mine_name || mId,
        state: m.state || null,
        district: m.district || null,
        operator: m.operator || null
      };
    });

    return {
      ...c,
      license_status: licenseStatus,
      document_status: documentStatus,
      document_expiry_list: documentExpiryList,
      expiring_docs_count: expiringDocsCount,
      associated_mines: associatedMines
    };
  });

  // Apply filters
  let filtered = enriched;

  if (query.contractor_id && query.contractor_id !== 'ALL') {
    filtered = filtered.filter(c => c.contractor_id && c.contractor_id.toLowerCase() === query.contractor_id.toLowerCase());
  }

  if (query.insurance_status && query.insurance_status !== 'ALL') {
    filtered = filtered.filter(c => c.insurance_status && c.insurance_status.toLowerCase() === query.insurance_status.toLowerCase());
  }

  if (query.license_status && query.license_status !== 'ALL') {
    filtered = filtered.filter(c => c.license_status && c.license_status.toLowerCase() === query.license_status.toLowerCase());
  }

  if (query.document_status && query.document_status !== 'ALL') {
    filtered = filtered.filter(c => c.document_status && c.document_status.toLowerCase() === query.document_status.toLowerCase());
  }

  if (query.state && query.state !== 'ALL') {
    filtered = filtered.filter(c => c.associated_mines.some(m => m.state && m.state.toLowerCase() === query.state.toLowerCase()));
  }

  if (query.district && query.district !== 'ALL') {
    filtered = filtered.filter(c => c.associated_mines.some(m => m.district && m.district.toLowerCase() === query.district.toLowerCase()));
  }

  if (query.search) {
    const q = query.search.trim().toLowerCase();
    filtered = filtered.filter(c =>
      (c.contractor_id && c.contractor_id.toLowerCase().includes(q)) ||
      (c.company_name && c.company_name.toLowerCase().includes(q)) ||
      (c.insurance_status && c.insurance_status.toLowerCase().includes(q)) ||
      (Array.isArray(c.compliance_documents) && c.compliance_documents.some(doc => doc.toLowerCase().includes(q))) ||
      (Array.isArray(c.equipment_inspection_certificates) && c.equipment_inspection_certificates.some(cert => cert.toLowerCase().includes(q)))
    );
  }

  // Summary Metrics calculated ON FILTERED CONTRACTORS DATASET
  const totalContractors = filtered.length;
  const activeInsurance = filtered.filter(c => String(c.insurance_status).toLowerCase() === 'active').length;
  const renewalDue = filtered.filter(c => String(c.insurance_status).toLowerCase() === 'renewal_due').length;
  const expiredLicenses = filtered.filter(c => c.license_status === 'Expired').length;

  // Expiring Documents Count = total individual expiring document entries across filtered contractors
  let expiringDocumentsCount = 0;
  for (const c of filtered) {
    expiringDocumentsCount += c.expiring_docs_count;
  }

  // Server-side Pagination
  const page = parseInt(query.page, 10) || 1;
  const pageSize = parseInt(query.pageSize, 10) || 15;
  const totalPages = Math.ceil(totalContractors / pageSize) || 1;
  const startIndex = (page - 1) * pageSize;
  const pagedData = filtered.slice(startIndex, startIndex + pageSize);

  return {
    summary: {
      totalContractors,
      activeInsurance,
      renewalDue,
      expiredLicenses,
      expiringDocumentsCount
    },
    pagination: {
      page,
      pageSize,
      total: totalContractors,
      totalPages
    },
    data: pagedData
  };
}

export async function getContractorById(contractorId) {
  const contractor = await contractorRepo.getById('contractor_id', contractorId);
  if (!contractor) return null;

  const [allAttendance, allMines] = await Promise.all([
    attendanceRepo.filter(a => a.contractor_id === contractorId),
    mineRepo.getAll()
  ]);

  const mineMap = new Map();
  for (const m of allMines) {
    if (m.mine_id) mineMap.set(m.mine_id, m);
  }

  // Deduplicate mine IDs
  const mineIdSet = new Set();
  for (const att of allAttendance) {
    if (att.mine_id) mineIdSet.add(att.mine_id);
  }

  const associatedMines = Array.from(mineIdSet).map(mId => {
    const m = mineMap.get(mId) || {};
    return {
      mine_id: mId,
      mine_name: m.mine_name || mId,
      state: m.state || null,
      district: m.district || null,
      operator: m.operator || null
    };
  });

  const licenseStatus = deriveLicenseStatus(contractor.license_validity);
  const documentStatus = deriveDocumentStatus(contractor.document_expiry_dates);
  const documentExpiryList = getDocumentExpiryDetails(contractor.document_expiry_dates);
  const expiringDocsCount = countExpiringDocuments(contractor.document_expiry_dates);

  return {
    ...contractor,
    license_status: licenseStatus,
    document_status: documentStatus,
    document_expiry_list: documentExpiryList,
    expiring_docs_count: expiringDocsCount,
    associated_mines: associatedMines
  };
}

export async function getMineContractors(mineId) {
  const [mineAttendance, allContractors, mine] = await Promise.all([
    attendanceRepo.filter(a => a.mine_id === mineId),
    contractorRepo.getAll(),
    mineRepo.getById('mine_id', mineId)
  ]);

  // Extract unique valid contractor IDs
  const contractorIdSet = new Set();
  for (const att of mineAttendance) {
    if (att.contractor_id) contractorIdSet.add(att.contractor_id);
  }

  const contractorMap = new Map();
  for (const c of allContractors) {
    if (c.contractor_id) contractorMap.set(c.contractor_id, c);
  }

  const result = [];
  for (const cId of contractorIdSet) {
    const c = contractorMap.get(cId);
    if (c) {
      result.push({
        ...c,
        license_status: deriveLicenseStatus(c.license_validity),
        document_status: deriveDocumentStatus(c.document_expiry_dates),
        document_expiry_list: getDocumentExpiryDetails(c.document_expiry_dates),
        associated_mine: {
          mine_id: mineId,
          mine_name: mine?.mine_name || mineId,
          state: mine?.state || null,
          district: mine?.district || null
        }
      });
    }
  }

  return result;
}
