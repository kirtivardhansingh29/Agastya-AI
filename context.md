# Agastya AI System - Development Context & Progress Summary

## System Architecture Overview

```
                 ┌─────────────────────────┐
                 │   Firebase / Firestore  │
                 │    (minova-ef69c)       │
                 │                         │
                 │   inspections           │
                 │   incidents             │
                 │   attendance            │
                 │   grievances            │
                 └────────────┬────────────┘
                              │
                              ▼
                       Node.js / Express (Port 5000)
                              │
                  ┌───────────┴───────────┐
                  │                       │
                  ▼                       ▼
        Firestore Repository       JSON Repository
                  │                       │
                  ▼                       ▼
        inspections/incidents/     mines/users/contractors
        attendance/grievances      (server/data/*.json)
                  │                       │
                  └───────────┬───────────┘
                              ▼
                       Hybrid Repository
                 (Historical JSON + Firestore)
                              │
                              ▼
                        REST API (/api/*)
                              │
                              ▼
                   React Dashboard (Port 5173)
```

- **Backend**: Express.js REST server (`server/src/index.js`) running on port 5000.
- **Frontend**: React + Vite SPA (`client/src/App.jsx`) with Vanilla CSS styling (NO Tailwind CSS).
- **Data Access Architecture (Phase 6C Hybrid Repository)**:
  - **Runtime Hybrid Datasets**: `inspections`, `incidents`, `attendance`, `grievances` (merging historical JSON records with live mobile app submissions from Cloud Firestore via `server/src/repositories/hybridRepository.js`).
  - **Local Master Datasets**: `mines`, `users`, `contractors` (served from `server/data/*.json` via `jsonRepository.js`).
- **Source Data Preservation Policy**: All 7 JSON files in `server/data/` (`mines.json`, `inspections.json`, `incidents.json`, `attendance.json`, `contractors.json`, `grievances.json`, `users.json`) remain **100% byte-for-byte unchanged** as a read-only historical reference copy.

---

## Phase Completion Summary

### Phase 1: Core Architecture & Layout
- Established Express REST server and React SPA layout system.
- Global navigation, header telemetry, theme tokens, and dynamic layout shell (`AppShell.jsx`).

### Phase 2: Mine Monitoring & Mine Detail Dossier
- Merged Mine Monitoring and Live Map (`/mine-monitoring`) with interactive Leaflet map, filter toolbar, pagination.
- `/mine/:mineId` Mine Detail dossier page with multi-tab layout (Overview, Inspections, Violations, Incidents, Attendance, Contractors, Grievances).
- Dynamic AI-ranked **Highest Attention Mines** component on Overview page.

### Phase 3: Inspection & Compliance Management
- `/inspections` directory with status filters and summary cards.
- `/safety-violations` violations register with severity filtering.
- `/corrective-actions` corrective action tracking with extracted resolution deadlines.

### Phase 4: Incident Management & Attendance Monitoring
- `/incidents` directory with severity filtering, casualty details, equipment involved, and evidence media.
- `/attendance-workforce` attendance monitoring with shift breakdown and headcount calculations.
- Dynamic **Priority Red Banner** ticker with severity badges and manual carousel navigation.

### Phase 5: Contractors & Documents + Grievances & Observations
- `/contractors` and `/contractors/:contractorId` directory and detail dossier pages.
- Centralized document expiry logic (`Valid`, `Expiring Soon`, `Expired`, `Mixed`, `Unknown`) with derived license status based on reference date `2024-10-25`.
- `/grievances` and `/grievances/:submissionId` directory and detail dossier pages.

### Phase 6A & 6B: Firebase Migration & Selective Integration
- Configured Firebase Admin SDK via `GOOGLE_APPLICATION_CREDENTIALS=./config/firebase-service-account.json`.
- Cloud Firestore project: `minova-ef69c`.
- Batch migrated 4 core transactional datasets (`inspections`, `incidents`, `attendance`, `grievances`) to Firestore.

### Phase 6C: Hybrid Repository Layer
- Created `server/src/repositories/hybridRepository.js` unifying local JSON data with live Firestore collections.
- Resolved infinite recursion bug between `HybridRepository.getWhere()` and `getByMineId()`.

### Phase 7: AI Mine Risk Intelligence & Groq Integration
- Endpoint `GET /api/ai/mine-analysis/:mineId` powered by Groq LLM API.
- Configured Groq model: `openai/gpt-oss-120b`.
- Updated `AiRiskIntelligence.jsx` UI to match Agastya AI Light Theme (`#ffffff` cards, `#0f172a` headers, `#0284c7` accents).

### Phase 8: Reports & Alerts Modules
1. **Reports Module** (`/reports` via `ReportsPage.jsx` & `reportService.js`):
   - Integrated **Recharts** charting library.
   - 6 distinct graphical reports: Compliance Distribution, Violation Severity, Risk Levels, Inspection & Violation Trends, Incident Types, Mine Health Index.
   - Filter toolbar (State, District, Mine, Date Range) dynamically updating analytics.
2. **Alerts Module** (`/alerts` via `AlertsPage.jsx` & `alertService.js`):
   - Dedicated feed displaying **ONLY** critical incidents (`severity === "critical"` sorted by `date_time` DESC).
   - Dynamic Sidebar Badge: Bound `alertsCount` directly to `GET /api/alerts` count.
3. **Priority Red Banner Fix**:
   - Made server-side pagination optional (`pageSize` query param optional) so unpaginated calls return full datasets.
   - Priority Red banner queries all critical incidents chronologically.
4. **Overview Data Unification**:
   - Replaced inner-join mine ID filtering with state/district/operator metadata enrichment in `overviewService.js`.
   - Overview KPIs match module totals (1,286 total inspections, 85 violations).

### Phase 8 Evidence & Cloudinary Media Display Fixes
1. **Incident Detail Page** ([`IncidentDetailPage.jsx`](file:///d:/VibecodingWithHarsh/PS24/client/src/pages/IncidentDetailPage.jsx)):
   - Implemented `EvidenceItemCard` inspecting `photos_or_videos`.
   - Valid HTTP/HTTPS Cloudinary URLs render actual images with overlay, Lightbox modal preview, and `onError` image load failure fallback to "Evidence File / Evidence file unavailable".
2. **Inspection Detail Page** ([`InspectionDetailPage.jsx`](file:///d:/VibecodingWithHarsh/PS24/client/src/pages/InspectionDetailPage.jsx)):
   - Reused `EvidenceItemCard` rendering logic and Lightbox modal preview for `photos_or_videos`.
3. **Grievances & Observations Detail Page** ([`GrievanceDetailPage.jsx`](file:///d:/VibecodingWithHarsh/PS24/client/src/pages/GrievanceDetailPage.jsx)):
   - Reused `EvidenceItemCard` rendering logic and Lightbox modal preview for `photos_or_videos`.

### UI Branding: Agastya AI Logo in Sidebar
- Moved `client/public/logo.png` (`/logo.png`) to the TOP-LEFT branding area of the sidebar ([`Sidebar.jsx`](file:///d:/VibecodingWithHarsh/PS24/client/src/components/layout/Sidebar.jsx) `.sidebar-header`), replacing legacy text branding (`Agastya AI / NATIONAL MINE SAFETY`).
- Main top navigation bar ([`TopHeader.jsx`](file:///d:/VibecodingWithHarsh/PS24/client/src/components/layout/TopHeader.jsx)) preserves clean regulatory title and command center subtitle.

---

## Active Environment & Configuration

- **Server Port**: `5000` (`npm run dev` in `server/`)
- **Client Port**: `5173` (`npm run dev` in `client/`)
- **Vite Build Verification**: `npm run build` in `client/` compiles cleanly in ~500ms.
- **Data Integrity**: SHA-256 checksums of all 7 files in `server/data/*.json` verified 100% intact.

---

## Quick Resume Checklist

1. Verify backend running on `http://localhost:5000`.
2. Verify frontend running on `http://localhost:5173`.
3. Check navigation routes: Overview, Mine Monitoring, Inspections, Safety & Violations, Incidents, Attendance & Workforce, Contractors, Grievances, AI Risk Intelligence, Reports, Alerts.
