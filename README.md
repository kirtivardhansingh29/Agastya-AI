# Agastya AI — Intelligent Mine Compliance & Evidence Tracking Platform
## Central Regulatory Authority Command Center — Phase 1

### Overview & Purpose
The **Agastya AI — Intelligent Mine Compliance & Evidence Tracking Platform** is a centralized regulatory command center dashboard for monitoring coal mines across India under the statutory mandate of the **Directorate General of Mines Safety (DGMS)**, Ministry of Labour & Employment, Government of India (CMR-2017 #SEC-82).

This platform replaces fragmented paper logs, siloed spreadsheets, and delayed reporting workflows by synthesizing:
1. **Field Mobile Telemetry & Inspections:** Offline-first sync from handheld mobile inspector devices.
2. **Life-Safety & Environmental Sensors:** Continuous atmospheric methane ($CH_4$) and carbon monoxide ($CO$) monitoring relays.
3. **Workforce & Biometrics Telemetry:** Real-time shift check-ins, geo-fenced headcount audits, and contractor vs. permanent labour ratios.
4. **Statutory Compliance & CAPA:** Violation severity escalation, show-cause notices, and corrective action tracking.
5. **AI Risk Intelligence:** Pattern detection across shifts, predictive gas influx alerts, attendance variance anomalies, and OCR compliance indexing.

> **DEMONSTRATION & MOCK DATA NOTICE:**  
> All records in `server/data/*.json` are realistic mock demonstration data created for development and architectural validation. They do not represent actual classified government mine statistics.

---

### Phase 1 Scope
Phase 1 focuses strictly on:
- Establishing the two-tier full-stack architecture (`client/` and `server/`).
- Standard CSS design system (**Zero Tailwind CSS**) reproducing the high-fidelity Stitch regulatory command center.
- Express REST backend with modular repository/service abstraction over mobile JSON datasets.
- Calculation of dynamic derived metrics (KPIs, severity distribution, AI ranking, sync status).
- Complete Overview page with all widgets, interactive geo-spatial basin map, recent mobile incidents, AI predictive warning cards, and responsive shell.
- Placeholder views for future phase navigation modules (Inspections, Mine Details, Contractors, etc.).

---

### Project Architecture

```
PS24/
│
├── client/                     # React + JavaScript + Vite (Standard CSS)
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/         # LoadingSkeleton, ErrorState, PlaceholderPage
│   │   │   ├── layout/         # AppShell, TopHeader, PriorityBanner, Sidebar
│   │   │   └── overview/       # SubHeaderBar, FilterToolbar, TelemetryKpiGrid,
│   │   │                       # CoalBasinMap, SeverityDistribution,
│   │   │                       # HighestAttentionMines, RecentIncidents,
│   │   │                       # AiRiskIntelligence
│   │   ├── pages/              # OverviewPage
│   │   ├── services/           # API client (api.js)
│   │   ├── styles/             # Vanilla CSS design tokens, reset, layout, components
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
└── server/                     # Node.js + Express (ES Modules)
    ├── data/                   # JSON storage strictly conforming to mobile schemas
    │   ├── mines.json          # 412 monitored mines metadata
    │   ├── inspections.json    # 128 mobile inspection submissions with checklists
    │   ├── attendance.json     # 336 worker shift attendance records
    │   ├── incidents.json      # Mobile incident reports with GPS & photos
    │   ├── contractors.json    # Contractor permits & expiry dates
    │   ├── grievances.json     # Grievances and inspector observations
    │   └── users.json          # Official accounts (no plaintext secrets)
    ├── scripts/
    │   └── generate_data.js    # Data generator for mock datasets
    ├── src/
    │   ├── controllers/        # Express handlers (overviewController, entityControllers)
    │   ├── repositories/       # Generic JSON Repository layer (swap target for Firebase)
    │   ├── routes/             # REST endpoints (overviewRoutes, apiRoutes)
    │   ├── services/           # Derived metrics calculation engine (overviewService)
    │   └── index.js            # Express server entrypoint, CORS, error middleware
    ├── .env.example
    └── package.json
```

---

### Raw Mobile Schema Compliance
The data stored in `server/data/` strictly preserves raw field schemas without pre-computed or derived client values:
- **Inspections:** `submission_id`, `mine_id`, `inspector_id`, `inspector_name`, `inspection_type`, `checklist` (`question`, `answer`, `remarks`), `violation_found`, `violation_severity`, `violation_description`, `corrective_action`, `photos_or_videos`, `location`, `date_time`, `sync_status`, `review_status`.
- **Attendance:** `submission_id`, `mine_id`, `shift`, `worker_id`, `worker_name`, `worker_type`, `contractor_id`, `check_in_time`, `check_in_location`, `check_out_time`, `check_out_location`, `expected_headcount`, `actual_headcount`, `date_time`, `sync_status`.
- **Incidents:** `submission_id`, `mine_id`, `inspector_id`, `inspector_name`, `incident_type`, `severity`, `people_affected`, `affected_person_details`, `description`, `immediate_action_taken`, `medical_attention_required`, `equipment_involved`, `photos_or_videos`, `location`, `date_time`, `notify_authority_immediately`, `sync_status`, `review_status`.

---

### Future Firebase Integration Strategy
The server uses a **Repository Pattern** (`server/src/repositories/jsonRepository.js`).
```
React Frontend
      ↓ (HTTP / REST)
Express API Controllers
      ↓
Domain Services (Calculates KPIs, Distribution, Trends)
      ↓
Data Repository Interface
      ↓
[Phase 1: Local JSON Files]  ──►  [Phase 2: Firebase Firestore / RTDB]
```
To migrate to Firebase in future phases:
1. Implement `firebaseRepository.js` adhering to the same interface methods (`getAll`, `getById`, `filter`, `insert`, `update`).
2. Supply Firebase Admin SDK credentials in `server/.env`.
3. Switch imports in `overviewService.js` / controllers.
4. **No React components require code modifications.**

---

### Setup & Running Instructions

#### 1. Backend Server Setup
```bash
cd server
npm install
npm run dev   # Starts Express with auto-reload on http://localhost:5000
```

#### 2. Frontend Client Setup
```bash
cd client
npm install
npm run dev   # Starts Vite dev server on http://localhost:5173
```

#### 3. Accessing the Dashboard
Open your browser at `http://localhost:5173`.

---

### Primary API Endpoints
- `GET /api/health` — Service health and DGMS operational status
- `GET /api/overview/summary` — Computed Directorate aggregate telemetry, 8 KPI metrics, severity distribution, highest-attention mines, priority alert, and AI risk warnings
- `GET /api/overview/incidents?filter=all` — Recent mobile inspector safety incident submissions
- `POST /api/overview/sync` — Triggers telemetry synchronization simulation
- `GET /api/mines` — List of all 412 monitored coal mine assets
- `GET /api/inspections` — Raw inspection logs
- `GET /api/attendance` — Raw shift attendance logs
- `GET /api/contractors` — Statutory contractor licenses and document renewals
# Agastya-AI
