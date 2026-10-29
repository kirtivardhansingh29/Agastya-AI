# Agastya AI — Intelligent Mine Compliance & Evidence Tracking Platform
## Central Regulatory Authority Command Center — Phase 1 Design & Architecture Document

### 1. Project Context & Vision
The Agastya AI — Intelligent Mine Compliance & Evidence Tracking Platform is a regulatory command center dashboard for monitoring coal mines across India under the mandate of the **Directorate General of Mines Safety (DGMS)**, Ministry of Labour & Employment, Government of India (CMR-2017 #SEC-82).

This platform bridges the gap between disconnected paper logs, siloed spreadsheets, and delayed reporting by consolidating:
1. **Field Mobile Telemetry & Inspections:** Offline-first sync from handheld mobile inspection devices.
2. **Environmental & Life-Safety Sensors:** Atmospheric methane ($CH_4$), carbon monoxide ($CO$), and ventilation monitoring.
3. **Workforce Attendance & Biometrics:** Real-time shift check-ins, geo-fenced headcount audits, and contractor vs. permanent labour ratios.
4. **Statutory Compliance & CAPA:** Violation severity escalation, show-cause notices, and corrective action workflows.
5. **AI Risk Intelligence:** Continuous pattern recognition, predictive gas influx alerts, attendance variance anomalies, and OCR compliance indexing.

---

### 2. High-Fidelity UI Reproduction Specification (Stitch Reference)
The Phase 1 user interface reproduces the provided visual source of truth (`Stitch` high-fidelity command center) down to the exact layout, typography, badges, color coding, and spacing.

#### 2.1 Theme & Color Palette (Standard Semantic CSS — Zero Tailwind)
- **Backgrounds:**
  - App Shell / Base: `#f4f6f9` (clean regulatory cool grey/white)
  - Card Surfaces: `#ffffff` with subtle borders `#e2e8f0` and shadows `rgba(15, 23, 42, 0.05)`
  - Sidebar: `#1e293b` (slate navy authority theme) or high-contrast regulatory white/navy
  - Urgent Alert Bar: `#7f1d1d` / `#991b1b` (Priority Red) with white text
- **Accents & Severity Indicators:**
  - Critical / Fatal / Priority Red: `#dc2626` / `#b91c1c`
  - High Severity / Major Hazard: `#ea580c` / `#f97316`
  - Warning / Attention: `#d97706` / `#f59e0b`
  - Safe / Fully Compliant: `#16a34a` / `#22c55e`
  - Regulatory Authority Primary Blue: `#1d4ed8` / `#2563eb`
  - AI Intelligence Purple: `#7c3aed` / `#9333ea`
  - Mobile Data Raw Badge: `#2563eb` (soft blue tag `[RAW MOBILE DATA]`)
  - Calculated Metrics Badge: `#475569` (slate tag `∑ [CALCULATED]`)
  - AI Generated Badge: `#7c3aed` (purple tag `✨ [AI GENERATED]`)

#### 2.2 Typography & Fonts
- Primary Font: Inter / Outfit / System Sans-serif (`system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`)
- Monospace Data Font (for timestamps, coordinates, IDs, sensor telemetry): `'JetBrains Mono', 'SF Mono', Consolas, monospace`

#### 2.3 Visual Hierarchy & Sections
1. **Top Regulatory Header:**
   - Left: Agastya AI Seal / Logo & "NATIONAL MINE SAFETY"
   - Title: "National Mine Safety & Compliance Monitoring" / "Central Regulatory Authority Command Center | DGMS"
   - Global Quick Search (`Ctrl + K`)
   - Telemetry Sync Indicator: "Data Sync: Operational • 2 min ago [Sync Now]"
   - Notification Bell with unread counter
   - Live IST Clock: `LIVE IST / 24 Oct 2024, 14:32:10`
   - Red Authority Alert Feed button with counter badge
2. **Priority Red Notification Banner:**
   - Urgent broadcast marquee: `PRIORITY RED | JH-DHA-BCCL-007 / GAS INFLUX (0.85% CH4) - Pit No. 7, Jharia Coalfield - 4 Evacuated 11:20 IST`
   - Handheld sync queue: `32 Queued Handheld Logs`
   - Telemetry Grid Status: `Telemetry Grid: 99.2% Online`
3. **Sub-Header & Context Title:**
   - Citation: `DGMS MANDATE #SEC-82 Coal Mines Regulations (CMR-2017)`
   - Title: `National Mine Monitoring Overview`
   - Subtitle: `Centralized monitoring of inspections, life-safety sensors, workforce telemetry, and statutory compliance across 8 state coal directorates.`
   - Source Tags: `[RAW MOBILE DATA]`, `∑ [CALCULATED]`, `✨ [AI GENERATED]`
4. **Global Regulatory Filter Toolbar:**
   - Dropdown selectors: State Directorate, Mining District, Monitored Mine Assets, Inspection Scope, Severity Tier, Review Status, Reporting Window
   - Sub-bar: Sync status notice, Retry Sync, Reset Filters, Export Dossier (PDF/CSV), Apply Regulatory Filters
5. **Directorate Aggregate Telemetry (8 KPI Cards):**
   - 1. Total Mines: `412` (Operating vs Suspended breakdown)
   - 2. Inspections: `1,284` (+14% vs prior cycle)
   - 3. Open Violations: `87` (Action Required; Critical, Major, Minor breakdown)
   - 4. Critical Incidents: `4` (Fatal inquiries & high risk active)
   - 5. Pending Review: `38` (Awaiting DGMS Dy. Director Sign-off)
   - 6. Overdue CAPA: `23` (Past statutory rectification deadline)
   - 7. Workforce Live: `64,820` (Shift biometric & geo-tag check-ins)
   - 8. Attendance Rate: `93.4%` (69,400 Expected vs 64,820 Actual)
6. **Geo-Spatial Coal Basin Monitoring & Risk Intelligence (Split Section):**
   - **Left (65%): India Coal Basin Monitoring Map**
     - Tab selectors: Coal Basins | Air Quality (CH4/CO) | Evac Routes
     - Risk Code Index Legend: Critical Emergency (14), High-Severity Issue (32), Warning/Attention (82), Compliant/Clear (284)
     - Interactive SVG/Canvas map with India coal basin regions (Jharia, Raniganj, Korba, Singrauli, Talcher, Godavari Valley)
     - Interactive mine pins with pulse rings for active alerts
     - Detailed selected mine overlay dossier card (e.g. Bharat Coking Coalfield Pit-7, Methane 0.85%, Workforce 480/520, actions: View Dossier, Issue Stop-Work Notice)
     - Telemetry status footer with exact GPS coords and satellite latency
   - **Right (35%): Analytics & Rankings**
     - Card A: **Issue Severity Distribution** (Progress bars showing Critical 3.4%, Major 7.8%, Warning 19.9%, Fully Compliant 68.9%)
     - Card B: **Highest Attention Mines** (AI Ranked Top 4 mines with quick badges: ESCALATED, INQUIRY, NOTICE, OVERDUE)
7. **Recent Incidents & Field Safety Submissions (`[RAW MOBILE DATA]`):**
   - Filter tabs: All (18) | Immediate Action (2)
   - 3 Column cards with rich inspector metadata:
     - Card 1: Toxic Methane Influx Threshold Breached (BCCL Pit-7) - Authority Alert, Critical, 4 Affected (1 Hospitalized), Inspector DGMS-INSP-402, GPS, Photos Attached, Dispatch Inquiry.
     - Card 2: Dumper Hydraulic Brake Line Rupture (SECL Gevra) - Major Hazard, 0 Affected (Near-Miss), Inspector DGMS-INSP-210, Issue Show-Cause.
     - Card 3: Minor Ankle Sprain During Shaft Descent (SCCL Ramagundam) - Resolved On-Site, Closed status, First-Aid Log Verified.
8. **AI Risk Intelligence & Predictive Early Warning (`✨ [AI GENERATED]`):**
   - Card 1: Gas Pattern Anomaly (High Priority) - Repeated Methane Influx Pattern Detected (BCCL Pit-7 & East Pit-4)
   - Card 2: Shift Variance Anomaly (Medium Priority) - Workforce Discrepancy Flagged (SECL Dipka Open Cast)
   - Card 3: OCR Regulatory Intelligence - Statutory Document Intelligence (DGMS Form-IV, expiring blast licences alert)
9. **Authority Sidebar Navigation:**
   - Overview (active), Mine Monitoring, Live Map, Inspections, Safety & Violations, Incidents (badge "2 CRITICAL"), Attendance & Workforce, Contractors & Documents, Grievances & Observations, Corrective Actions, AI Risk Intelligence (badge "AI"), Reports, Alerts (badge "5"), Administration.
   - Director General profile footer: Dr. Ravi Shankar Mishra (DGMS, Ministry of Labour & Employment).

---

### 3. Backend & Frontend Architecture (JavaScript Tech Stack)
#### 3.1 Directory Structure
```
project-root/
├── client/          # React + JavaScript + Vite (Standard CSS, Zero Tailwind)
└── server/          # Node.js + Express (JavaScript ES Modules, Modular Repository Layer)
    ├── data/        # JSON storage following mobile schemas
    │   ├── mines.json
    │   ├── inspections.json
    │   ├── attendance.json
    │   ├── incidents.json
    │   ├── contractors.json
    │   ├── grievances.json
    │   └── users.json
    ├── src/
    │   ├── controllers/
    │   ├── services/
    │   ├── repositories/
    │   ├── routes/
    │   └── index.js
```

#### 3.2 Raw Mobile Schemas (No Derived Fields in Storage)
- **Inspections:** `submission_id`, `mine_id`, `inspector_id`, `inspector_name`, `inspection_type`, `checklist` (`question`, `answer`, `remarks`), `violation_found`, `violation_severity`, `violation_description`, `corrective_action`, `photos_or_videos`, `location`, `date_time`, `sync_status`, `review_status`.
- **Attendance:** `submission_id`, `mine_id`, `shift`, `worker_id`, `worker_name`, `worker_type`, `contractor_id`, `check_in_time`, `check_in_location`, `check_out_time`, `check_out_location`, `expected_headcount`, `actual_headcount`, `date_time`, `sync_status`.
- **Incidents:** `submission_id`, `mine_id`, `inspector_id`, `inspector_name`, `incident_type`, `severity`, `people_affected`, `affected_person_details`, `description`, `immediate_action_taken`, `medical_attention_required`, `equipment_involved`, `photos_or_videos`, `location`, `date_time`, `notify_authority_immediately`, `sync_status`, `review_status`.
- **Contractors:** `contractor_id`, `name`, `license_validity`, `insurance_status`, `compliance_documents`, `document_expiry_dates`, `equipment_inspection_certificates`.
- **Grievances / Observations:** `submission_id`, `mine_id`, `inspector_id`, `inspector_name`, `entry_type`, `category`, `text_content`, `photos_or_videos`, `location`, `date_time`, `priority_flagged_by_ai`, `sync_status`, `review_status`.
- **Mines Metadata:** `mine_id`, `mine_name`, `coalfield`, `state`, `district`, `operator`, `status`, `location` (`latitude`, `longitude`), `methane_category`, `last_inspection_date`.

#### 3.3 Derived Metric Calculation Engine (Server-Side)
The backend calculates all aggregated indicators dynamically:
- `attendanceRate` = $(\sum \text{actual\_headcount} / \sum \text{expected\_headcount}) \times 100$
- `openViolations` = count of violations where review status is not resolved
- `criticalIncidents` = count of incidents with severity `critical` or `fatal`
- `overdueCapa` = count of violations past corrective action deadline
- `attentionMines` = scored based on severity, gas alerts, and open actions
- `issueSeverityDistribution` = mines grouped by highest violation severity tier
### 4. Implementation Status & Component Map (Phase 1 Completed)

#### 4.1 Client Components (`client/src/components/`)
- **Layout & Shell (`layout/`):**
  - `AppShell.jsx`: Full regulatory command center wrapper combining navigation sidebar, top government header, emergency priority banner, and main content area.
  - `TopHeader.jsx`: Agastya AI header with live IST time update, data sync status chip, quick search (`Ctrl K`), statutory notifications, and Authority Alert Feed button.
  - `PriorityBanner.jsx`: Emergency gas breach marquee for `JH-DHA-BCCL-007` with real-time sensor metrics and queued logs.
  - `Sidebar.jsx`: Full 14-item navigation menu, active Overview tab, severity badge counts, and Director General Dr. Ravi Shankar Mishra profile footer.
- **Overview Dashboard (`overview/`):**
  - `SubHeaderBar.jsx`: DGMS Mandate CMR-2017 citation, main title, subtitle, and source badges (`[RAW MOBILE DATA]`, `∑ [CALCULATED]`, `✨ [AI GENERATED]`).
  - `FilterToolbar.jsx`: 7 dropdown selectors (State, District, Asset, Scope, Severity, Status, Window) + Sync notice, Retry Sync, Reset Filters, Export Dossier, and Apply Regulatory Filters.
  - `TelemetryKpiGrid.jsx`: 8 aggregate telemetry KPI cards (Total Mines, Inspections, Open Violations with Action badge, Critical Incidents, Pending Review, Overdue CAPA, Workforce Live, Attendance Rate).
  - `CoalBasinMap.jsx`: Interactive SVG geo-spatial basin map of India with coal basin outlines, risk code index legend, interactive beacons, and floating dossier card for `Bharat Coking Coalfield Pit-7`.
  - `SeverityDistribution.jsx`: Progress bar indicators for Critical Emergencies (3.4%), Major Violations (7.8%), Warning/Rectification (19.9%), and Fully Compliant (68.9%).
  - `HighestAttentionMines.jsx`: AI-ranked Top 4 attention mines with status badges (ESCALATED, INQUIRY, NOTICE, OVERDUE).
  - `RecentIncidents.jsx`: 3 mobile safety incident cards with inspector badge, GPS coordinates, telemetry timestamp, sync status, and action buttons.
  - `AiRiskIntelligence.jsx`: 3 predictive analysis cards (Gas Pattern Anomaly, Shift Variance Anomaly, OCR Statutory Document Intelligence).
- **Common & State Handling (`common/`):**
  - `LoadingSkeleton.jsx`: Polished skeleton layout for initial load and filter refreshes.
  - `ErrorState.jsx`: Professional regulatory dashboard error card with retry button.
  - `PlaceholderPage.jsx`: Clean Phase 2 placeholder view for non-overview routes.

#### 4.2 Server Architecture (`server/src/`)
- `repositories/jsonRepository.js`: Generic repository pattern reading/writing local JSON files. Swappable with Firebase in Phase 2.
- `services/overviewService.js`: Dynamically computes all 8 aggregate telemetry KPIs, severity distributions, attention scoring, and sync statuses.
- `controllers/overviewController.js` & `entityControllers.js`: REST controllers for `/api/overview/*` and `/api/*`.
- `routes/overviewRoutes.js` & `apiRoutes.js`: Express route mappings.
- `index.js`: Server entrypoint with CORS, logging, health check, and error handlers.

#### 4.3 Styling System (Pure Standard CSS — Zero Tailwind)
- `client/src/styles/variables.css`: Theme tokens, regulatory colors, spacing, and typography.
- `client/src/styles/global.css`: CSS reset, font imports, badge classes, buttons, and animations.
- `client/src/styles/shell.css`: Layout grid, sidebar, top header, and emergency banner.
- `client/src/styles/overview.css`: KPI cards, map viewport, progress bars, incident cards, and AI warning cards.

#### 4.4 Verification
- Client build (`npm run build`): Passed with zero errors.
- Server health endpoint (`GET /api/health`): Operational.
- Overview endpoint (`GET /api/overview/summary`): Operational, returns computed telemetry.
- Incidents endpoint (`GET /api/incidents`): Operational, returns mobile submissions.
- Client dev server: Active on `http://localhost:5173/`.
- Backend server: Active on `http://localhost:5000/`.

---

### 5. Debugging Notes: Backend Connection Resolution
1. **Root Cause:**
   - When the client Vite dev server launched, port `5173` had previously been momentarily reserved, causing Vite to bind to `http://localhost:5174`.
   - The Express CORS middleware in `server/src/index.js` was statically configured with an origin list that did not match `http://localhost:5174`, resulting in browsers blocking the request with `TypeError: Failed to fetch`.
   - Additionally, standard error response format needed `{ success: false, error: { message } }` and health check required `{ success: true, message: "Agastya AI server is running" }`.
2. **Resolution Applied:**
   - **Express Dynamic CORS (`server/src/index.js`):** Updated CORS origin resolver to dynamically validate and accept any localhost / loopback port (`http://localhost:*`, `http://127.0.0.1:*`) and reflect `Access-Control-Allow-Origin` and `Access-Control-Allow-Credentials: true`.
   - **Health Check Standard (`server/src/index.js`):** Updated `GET /api/health` to return `{ success: true, message: "Agastya AI server is running" }`.
   - **Error Handling Uniformity (`server/src/controllers/overviewController.js` & `entityControllers.js`):** Standardized all controller catches to output `{ success: false, error: { message: ... } }`.
   - **Vite Proxy Defense (`client/vite.config.js`):** Configured Vite dev proxy to route `/api` to `http://localhost:5000` with `changeOrigin: true`.
   - **Client API Client (`client/src/services/api.js`):** Enhanced error payload extraction for informative diagnostics.
   - **Environment Files:** Created `client/.env.example` and `client/.env` specifying `VITE_API_URL=http://localhost:5000/api`.
