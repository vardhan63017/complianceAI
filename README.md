# Intertec Compliance AI — interactive prototype

A **frontend-only, high-fidelity prototype** of Intertec Systems' Compliance AI audit-management product (owner: Quality & Business Excellence). It is built so non-technical stakeholders can walk through the complete audit journey, see where AI drafts and where a named person decides, and understand the scoring and release boundaries.

> **Not production.** Sign-in, AI, Outlook / Teams / SharePoint, file uploads and e-signatures are all **simulated**. Data is illustrative unless marked *source-stated*. Nothing is sent anywhere.

---

## 1. Run it

No build step and no install.

**Option A: double-click** `index.html`. It works from `file://` because it uses classic scripts, not ES modules.

**Option B (recommended): run a local web server** from this folder:

```bash
python -m http.server 8765
# then open http://localhost:8765/
```

You need an internet connection the first time: Bootstrap 5.3, Bootstrap Icons, Chart.js and Google Fonts load from their public CDNs. These are the only network requests the prototype makes.

### Demo credentials

| Role | Email | Password |
|---|---|---|
| Audit Programme Manager | programme.manager@demo.intertec | `demo` |
| Lead Auditor | lead.auditor@demo.intertec | `demo` |
| Auditor | auditor@demo.intertec | `demo` |
| Auditee / Action Owner (BU manager) | sales.manager@demo.intertec | `demo` |
| Business Excellence Manager (Q&BE) | be.manager@demo.intertec | `demo` |
| Senior Management | management@demo.intertec | `demo` |
| System Administrator | admin@demo.intertec | `demo` |

All names are fictional. To switch roles at any time, use **Viewing as** in the top bar. This is a visual simulation, not security.

**Fastest path:** on the sign-in page, press **"Sign in and start the guided demo"**. A dark bar walks you through all 18 steps and switches to the right role at each one.

Demo state is saved in your browser's `localStorage`. To start again, open the user menu and choose **Reset demo data**.

---

## 2. Source files used

| Source (from the brief) | Present? | How it was used |
|---|---|---|
| `compliance-ai-wireframe.html` | **Yes**, read in full | Exact 43-screen inventory and names, menu grouping, role list, visual conventions (blue dashed = AI draft), journey, sample IDs and values |
| `compliance-ai-explained.html` | **Yes**, read in full | Lifecycle (4 phases / 10 steps), 12 agents with release labels and human controls, scoring model and worked example, escalation timeline, architecture, milestones, R1/R2/R3 scope, open decisions D-05…D-13 |
| BRD v1.0 (DOCX) | **No** | Not in the workspace. Used only via the brief's extracted requirements |
| Product & Technical Design v1.0 (DOCX) | **No** | As above |
| Project Plan v1.0 (DOCX) | **No** | As above (dates cross-checked against the explainer's milestone table) |

The Execution Plan, Project Tracker and any other research document were **not** available and were not used.

---

## 3. Project structure

```
compliance-ai-prototype/
├── index.html                  shell, CDN links, modal + toast containers
├── README.md
├── css/
│   ├── tokens.css              colours / fonts from the source HTML references
│   ├── layout.css              top bar, sidebar, guide bar, login
│   ├── components.css          chips, AI boxes, timelines, tables, calendar, report paper, print
│   └── responsive.css          laptop / tablet breakpoints
└── js/
    ├── mock-data.js            seed data, source-stated facts, deterministic "AI" outputs (CA.SIM)
    ├── state.js                store (localStorage), lookups, scoring, dates, escalation rules, audit trail
    ├── components.js           UI helpers, role-gated buttons, sortable tables, modals, toasts
    ├── router.js               hash router (#/path/:param?query), back / forward
    ├── app.js                  login, top bar, role-aware sidebar, guided demo, event delegation
    └── screens/
        ├── dashboard.js        home, my tasks, management dashboard (4 charts), BU drill-down, standard reports
        ├── library.js          organisation, locations, universe, standards, crosswalk, checkpoints, templates, auditors
        ├── planning.js         programmes, programme grid & approval, clause coverage, cycle plan, calendar
        ├── execution.js        audit record, plan & agenda, meeting record, fieldwork, consolidation
        ├── checklist.js        scope & applicability (A03), AI checklist builder (A04)
        ├── findings.js         findings register, finding editor (A07)
        ├── corrective-actions.js  CAR workspace, review & verification, effectiveness, overdue board
        ├── reports.js          report builder (A11), reports list, distribution & archive
        ├── admin.js            lists & scoring, SLAs, users, AI settings, audit trail, data import
        └── guide.js            R2/R3 previews, lifecycle, agents, Teams & Outlook, roadmap, screen inventory
```

Stack: HTML5, CSS3, vanilla JavaScript (ES5-style, no build), Bootstrap 5.3, Bootstrap Icons, Chart.js 4. The Motion library and Originkit were **not** used (see §8).

---

## 4. Screen inventory, mapped to the source wireframe

All **43** planned screens from `compliance-ai-wireframe.html` ("All 43 planned screens, by menu section") are implemented under the wireframe's names. The in-app **Prototype guide → Screen inventory** page links every row.

| Menu | Wireframe screen | Route | Release |
|---|---|---|---|
| Home | Home dashboard | `#/home` | R1 |
| Home | My tasks | `#/tasks` | R1 |
| Plan | Programme list & approval | `#/programmes` | R1 |
| Plan | Programme grid | `#/programme/PRG-2027` | R1 |
| Plan | Clause coverage report | `#/coverage` | R1 |
| Plan | Cycle plan builder | `#/cycle` | R1 |
| Plan | Audit calendar | `#/calendar` | R1 |
| Audits | Audit record | `#/audit/IA-2027-001` | R1 |
| Audits | Audit plan & agenda | `#/audit/IA-2027-001/plan` | R1 |
| Audits | Meeting record | `#/audit/IA-2027-001/meeting` | R1 |
| Audits | Checklist builder | `#/audit/IA-2027-001/checklist` (+ `/scope` for steps 1–3) | R1 |
| Audits | Fieldwork checklist | `#/audit/IA-2027-001/fieldwork` | R1 |
| Audits | Consolidation view | `#/audit/IA-2027-001/consolidation` | R1 |
| Audits | Finding editor | `#/finding/:id` | R1 |
| Audits | Findings register | `#/findings` | R1 |
| Audits | Report builder | `#/audit/IA-2027-001/report` | R1 |
| Audits | Distribution & archive | `#/distribution` | R1 |
| Audits | External auditor portal | `#/external-portal` | **Planned R2** |
| Actions | CAR workspace | `#/car/:id` | R1 |
| Actions | CAR review & verification | `#/car/:id/review` | R1 |
| Actions | Effectiveness check | `#/effectiveness/:id` | R1 |
| Actions | Overdue board | `#/overdue` | R1 |
| Library | Organisation & sectors | `#/org` | R1 |
| Library | Locations & business units | `#/locations` | R1 |
| Library | Universe register | `#/universe` | R1 |
| Library | Standards library | `#/standards` | R1 |
| Library | Edition crosswalk (2015 → 2026) | `#/crosswalk` | R1 |
| Library | Baseline checkpoint review | `#/checkpoints` | R1 |
| Library | Checklist template library | `#/templates` | R1 |
| Library | Auditor directory | `#/auditors` | R1 |
| Library | Auditor profile | `#/auditor/:id` | R1 |
| Library | Obligation register | `#/obligations` | **Planned R2** |
| Library | Qualification assessment | `#/qualification` | **Planned R2** |
| Insights | Management dashboard | `#/dashboard` | R1 |
| Insights | Standard reports | `#/std-reports` | R1 |
| Insights | Insights Copilot panel | `#/copilot` | **Planned R2** |
| Admin | Lists & scoring | `#/admin/lists` | R1 |
| Admin | SLAs & notifications | `#/admin/sla` | R1 |
| Admin | Users & access | `#/admin/users` | R1 |
| Admin | AI settings | `#/admin/ai` | R1 |
| Admin | Audit trail viewer | `#/admin/trail` | R1 |
| Admin | Data import | `#/admin/import` | R1 |
| Admin | Tenant console | `#/admin/tenant` | **Planned R3** |

The wireframe's **"Outside the app"** section (Teams cards, Outlook invites, report emails, SharePoint archive) is at `#/outside` as simulated mock-ups.

**Extra prototype pages (not counted in the 43):** list pages (`#/audits`, `#/cars`, `#/effectiveness`, `#/reports`), BU drill-down (`#/bu/:id`), Audit lifecycle, AI agents, Release roadmap and Screen inventory.

---

## 5. The guided journey (brief §12)

Scenario: **Sales BU · Dubai · ISO 9001:2026 · H1-2027 IQA1 · Internal Audit · IA-2027-001**. All values are illustrative; this is not a confirmed Intertec assignment.

| # | Step | Role | What you do |
|---|---|---|---|
| 1 | Sign in → Dashboard | Programme Manager | Simulated sign-in; role dashboard |
| 2 | Audit Universe | Programme Manager | Filter, Add / Edit BU (row appears) |
| 3 | Standards Library | BE Manager | Catalogue, licence status, 2015 → 2026 delta, Standards Watch |
| 4 | Scope & applicability | Lead Auditor | Run A03, confirm / override each clause (8.3 N/A needs a reason), confirm scope |
| 5 | AI Checklist Builder | Lead Auditor | Steps 1–3 done; step 4 ready |
| 6 | Generate checklist | Lead Auditor | 6-stage simulated loader → 10 deterministic suggestions |
| 7 | Review & approve | Lead Auditor | Accept / Edit / Reject; the flagged clause must be edited; Approve (name + time stamped) |
| 8 | Audit Programme | PM → BE Manager | Submit for review → review page → approve (locked button offers the role switch) |
| 9 | Cycle plan | Programme Manager | Resolve the 24-month impartiality flag; edit slots; table / calendar views |
| 10 | Publish schedule | Programme Manager | Publish → simulated invites sent → simulated acceptances |
| 11 | Audit record | Lead Auditor | Scope, team, schedule, status timeline, history |
| 12 | Fieldwork | Auditor | Record result + note + local file (filename only); demo shortcut fills the rest; Raise finding on 8.2.3 |
| 13 | Finding → grade | Lead Auditor | Accept A07 wording; confirm grade (cannot send before); send to auditee |
| 14 | CAR → root cause | Auditee | Acknowledge → CAR-2027-0001 opens by rule; correction, Five Whys, Fishbone, A08 category, action, submit |
| 15 | Evidence → review | Auditor (+ Auditee) | Accept plan; auditee uploads evidence; auditor verifies |
| 16 | Effectiveness | Lead Auditor | Recurrence check; Effective / Not effective / Reopen |
| 17 | Report | LA → BE → PM | Generate; review the A11 summary; technical review; approve; issue & archive (simulated) |
| 18 | Management dashboard | Senior Management | 93.2% vs 90%, four charts, click a bar → BU drill-down, H1-2027 live view |

---

## 6. Simulated interactions

| Interaction | What really happens |
|---|---|
| Sign-in, Forgot password, Entra ID provisioning | Local role selection; no auth call |
| Role switching | Changes the menu and gates buttons visually; no real permissions |
| A01–A05, A07–A11 "AI" outputs | Deterministic mock data from `CA.SIM` after a short timed loader; no model is called |
| Outlook invitations / acceptances | Status values change after a timer |
| Teams cards, email reminders, report emails | In-app mock-ups and status chips |
| SharePoint archive, e-signature, read receipts | Text values only |
| Evidence and licensed-text uploads | `<input type=file>` reads **only the filename**; nothing is read or sent |
| Data import validation | Fixed mock validation table |
| Word / PDF / Excel export, standard-report download | Toast message; the report preview can be printed with the browser's Print |
| "Demo time-skip" on effectiveness | You can record the 60–90-day decision immediately so the journey completes |

The **audit trail** and **AI suggestion log** are real within the demo. Every acceptance, edit, rejection and approval is recorded with actor, role and timestamp.

---

## 7. R2 / R3 features shown as future

Each is a disabled preview with a "Planned R2 / R3" label. None works as if it were live in R1.

- **Planned R2:** Obligation register, Qualification assessment, External auditor portal (incl. external-body response packs), Insights Copilot panel (A12, beta), A06 Evidence Analyst, offline fieldwork (chip on Fieldwork), full Standards Watch (A01 is basic in R1), Power BI / HR feeds, risk-based frequency (roadmap).
- **Planned R3:** Tenant console (onboarding / administration), licensing & billing, marketplace listing, Insights Copilot GA, Arabic UI, GRC / CAPA connectors (roadmap).

---

## 8. Source discrepancies, ambiguities and assumptions

**Source conflicts (flagged, not silently resolved)**

1. **Audit ID.** The wireframe uses `IA-2027-004` for Sales – Dubai; the brief specifies `IA-2027-001`. **I followed the brief.** Finding IDs follow the wireframe pattern (`F-IA-2027-001-01`).
2. **Grade labels.** The BRD / brief use *Satisfied, Observation, Area for Improvement (AFI), Minor NC, Major NC*. The explainer shows *Conform* and *Opportunity for Improvement*. That is open decision **D-10**. BRD labels are used, with notes.
3. **Lifecycle framing.** The brief's 10 steps put Standards Library as a separate step 2 and the report in Phase 3 (Audit). The explainer's 10 steps merge universe & standards, add a separate "Follow-up" step and put the report under Close & learn. The in-app lifecycle uses the **brief's** structure and shows a note.
4. **Escalation day basis.** The brief says the explainer describes +1 / +7 / +14 as working-day offsets. The explainer's escalation table says "+1 day / +7 days / +14 days" and mentions a UAE-calendar SLA engine. **The prototype counts calendar days and labels the basis "to be confirmed against the BRD".**
5. **Worked example split.** The brief lists "Observation / AFI: 2". The explainer splits this as Observation 2, OFI 0. Same points either way: 131 / 141 = **92.9%**.
6. **Cause categories.** "Intertec's seven vs 6M" is open decision **D-11**. A seven-item illustrative list is used and labelled.
7. **Wireframe values not reused.** The wireframe home shows "14 / 19 BU audits done" and "0 conflicts". The prototype computes these live from demo state and deliberately includes one impartiality conflict so the check can be shown.
8. **Technical reviewer.** The wireframe shows a "Technical review" stage without naming the role. The prototype assigns it to the Business Excellence Manager (Q&BE). This is an assumption.
9. **CAR state labels.** The wireframe uses Acknowledged → Root cause & plan → Implement → Verified → Effectiveness check. The brief suggests Draft → Submitted → Review → Accepted / Returned → Implementation → Verification → Closed. The prototype merges them: *Acknowledged → Root cause & plan → Plan review (Accept / Return) → Implementation → Verification → Effectiveness check → Closed*, plus *Returned* and *Reopened*. Validate against the Product & Technical Design.

**Assumptions**

- **Demo clock fixed at 10 May 2027** (the Sales – Dubai audit date) so the overdue and escalation tiers are meaningful. Approval timestamps combine this date with your local time-of-day. The planning steps (programme, cycle plan) are "replayed" on this date, although in reality they would happen before the 27 Apr 2027 opening meeting.
- **19 BUs, their names and locations are illustrative** (spread across the four source-stated countries). Their H1-2026 values are invented but chosen so that their **simple average reproduces the source-stated 93.2%** for IA_01_26. 17 / 19 are at or above target, matching the wireframe.
- **The organisation figure is a simple average** across BU audits, per the source. No weighted aggregate is used.
- **ISO clause numbers** for 9001:2026 follow the wireframe's examples (5.1.1, 6.1.2, 7.1.6, 8.2.3…). All topics and questions are **paraphrased and illustrative**; no ISO text is reproduced. The crosswalk rows are concept examples, **not** the authoritative 2015 → 2026 crosswalk.
- **The checklist is a 10-item sample** (not the 47-item template), so it stays reviewable in a demo. Its live score uses the same formula.
- **Minor NC action plans are due 30 days after acknowledgement.** Major NC closure is verified within 90 days. The effectiveness window is 60–90 days after implementation. Reports are due within 5 working days (Mon–Fri counted). All of these come from the explainer.
- **The external certification body** appears only as "SV1 (date TBC)" in the programme grid.
- **Motion / Originkit not used.** Originkit components are React-based, and the brief requires vanilla JS, so selected effects were recreated natively in CSS / JS: staggered KPI entrance, number counters, word-reveal heading and drifting glow on sign-in, the AI-generation progress loader, page fade and button press feedback. All of them respect `prefers-reduced-motion`. I could not inspect the Originkit catalogue from this environment, so no specific Originkit component is claimed.

---

## 9. What was actually tested

Tested in headless Chrome 156 (Puppeteer) against `python -m http.server`. The test scripts live outside this folder and are not part of the deliverable.

**Route sweep:** 60 routes × 7 roles = 420 page loads. Result: **0 render failures, 0 JavaScript errors.** Role-restricted screens show a "not available for this role" card with role-switch buttons rather than an error. The only external hosts contacted were `cdn.jsdelivr.net`, `fonts.googleapis.com` and `fonts.gstatic.com`.

**End-to-end journey:** 60 automated checks, all passing, driven by real clicks:

| Brief §18 item | Result |
|---|---|
| 1 Starts locally via README | ✅ served with `python -m http.server` |
| 2 Login simulation (incl. wrong-password rejection) | ✅ |
| 3 Every nav item opens a real screen | ✅ (route sweep) |
| 4 Exact 43-screen inventory preserved | ✅ |
| 5 No dead ends in the lifecycle | ✅ 18 steps completed end to end; prerequisite screens show a link to the missing step |
| 6 Forms validate required fields | ✅ e.g. empty CAR plan blocked; Add BU; scope reasons for N/A |
| 7 Submissions update state / navigate | ✅ programme → review page; finding → CAR; and so on |
| 8 Checklist generation shows simulated results | ✅ |
| 9 Accept / Edit / Reject change state | ✅ incl. Undo and the guardrail-flagged item |
| 10 Human approval visually distinct from AI draft | ✅ dashed indigo vs green-edged stamped panels |
| 11 Programme and cycle-plan actions | ✅ submit, approve (role-gated), impartiality block, edit slot, publish |
| 12 Fieldwork responses recorded | ✅ incl. filename-only evidence |
| 13 Finding creation | ✅ cannot send before the Lead Auditor confirms the grade |
| 14 CAR submission and review states | ✅ submit → accept → evidence → verify |
| 15 Effectiveness decision | ✅ Effective → closed; Not effective → Reopened; Reopen → Implementation; "Effective" blocked when recurrence found |
| 16 Report preview / approval | ✅ blocked until the AI summary is reviewed; draft → tech review → approval → issued |
| 17 Charts render with coherent data | ✅ 4 charts; bar click → BU drill-down |
| 18 Formula matches the BRD example | ✅ `(42×3)+(2×0)+(1×1)+(2×2) = 131 ÷ 141 = 92.9%` |
| 19 93.2% and 90% labelled | ✅ "Source-stated" chips; average reproduced from BU data |
| 20 R2 / R3 clearly marked | ✅ |
| 21 Responsive at laptop / tablet | ✅ no horizontal overflow at 1024 px and 768 px; sidebar collapses under 900 px |
| 22 Keyboard focus / basic accessibility | ⚠️ partly. Visible `:focus-visible` rings, skip link, labelled form controls, `aria-current`, `aria-sort`, keyboard-sortable headers. **No screen-reader or full keyboard-only audit was done.** |
| 23 No console errors | ✅ |
| 24 No unintended network / backend calls | ✅ CDN assets only |
| 25 Integrations and AI labelled simulated | ✅ |

**Also checked:** browser back / forward, state persists across reload, the audit trail records named approvals, the AI suggestion log records human decisions, the finding *Dispute* path, opening `index.html` directly from `file://`, and `prefers-reduced-motion` (counters show final values immediately).

**Not tested:** Firefox and Safari, mobile phone widths (under 600 px is usable but not polished), offline / no-CDN behaviour (charts show a fallback message if Chart.js fails to load), and print layout in every browser (checked only through the print stylesheet).
