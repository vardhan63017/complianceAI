/* Seed data for the prototype.
   Everything here is ILLUSTRATIVE DEMO DATA unless a comment says "source-stated".
   People are fictional. BU names and locations are sample records, not confirmed Intertec mappings.
   Clause descriptions are short paraphrases written for the demo, never ISO text. */
window.CA = window.CA || {};

(function (CA) {
  // Fixed demo clock used for SLA / overdue illustration only.
  CA.DEMO_TODAY = "2027-05-10";

  // Source-stated facts (BRD / explanation reference).
  CA.FACTS = {
    buCount: 19,                 // source-stated: ~19 business units
    orgAvg: 93.2,                // source-stated: IA_01_26 organisation average
    orgAvgCycle: "IA_01_26",
    target: 90,                  // source-stated target
    workedExample: { applicable: 47, sat: 42, maj: 2, min: 1, obsAfi: 2, result: 92.9 }, // source-stated BRD example
    iso2026Published: "16 Sep 2026", // source-stated (explanation reference)
    iso2015TransitionEnd: "30 Sep 2029",
    r1GoLive: "26 Apr 2027", r2GoLive: "4 Oct 2027", r3Window: "Oct–Dec 2027",
    r1Build: "7 Dec 2026 – 19 Mar 2027",
    requirements: "154 functional + 22 non-functional"
  };

  CA.ROLES = {
    pm: { label: "Audit Programme Manager", user: "Nadia Farouk", email: "programme.manager@demo.intertec" },
    la: { label: "Lead Auditor", user: "Leila Haddad", email: "lead.auditor@demo.intertec" },
    au: { label: "Auditor", user: "Arjun Menon", email: "auditor@demo.intertec" },
    ae: { label: "Auditee / Action Owner (BU manager)", user: "Omar Siddiqui", email: "sales.manager@demo.intertec" },
    be: { label: "Business Excellence Manager (Q&BE)", user: "Fatima Noor", email: "be.manager@demo.intertec" },
    ex: { label: "Senior Management", user: "Khalid Rahman", email: "management@demo.intertec" },
    ad: { label: "System Administrator", user: "Ravi Das", email: "admin@demo.intertec" }
  };

  // Scoring model — source-stated TPL-59 weights.
  CA.GRADES = [
    { key: "sat", label: "Satisfied", pts: 3, cls: "ok", note: "ISO term 'Conform' under decision D-10" },
    { key: "obs", label: "Observation", pts: 2, cls: "warn", note: "Could become an NC" },
    { key: "afi", label: "Area for Improvement (AFI)", short: "AFI", pts: 2, cls: "warn", note: "Explanation reference calls this 'Opportunity for Improvement'" },
    { key: "min", label: "Minor NC", pts: 1, cls: "bad", note: "Action plan due within 30 days of acknowledgement" },
    { key: "maj", label: "Major NC", pts: 0, cls: "bad", note: "Closure verified within 90 days" }
  ];
  CA.AGENTS = [
    { id: "A01", name: "Standards Watch", purpose: "Tracks standard editions / amendments and identifies affected clauses and checkpoints.", control: "Owner approves every change", rel: "R1 basic · R2 full", r1: true, route: "crosswalk" },
    { id: "A02", name: "Checkpoint Generator", purpose: "Drafts baseline checkpoints from licensed standard content.", control: "Reviewed, approved and versioned before use", rel: "R1", r1: true, route: "checkpoints" },
    { id: "A03", name: "Applicability & Obligations", purpose: "Suggests checkpoint applicability per BU / location, with a reason. Obligations register later.", control: "User confirms or overrides with a reason", rel: "R1 · R2 obligations", r1: true, route: "audit/IA-2027-001/scope" },
    { id: "A04", name: "Checklist Builder", purpose: "Creates the audit-specific checklist from scope, context, prior findings and changed clauses.", control: "Lead Auditor approves the checklist", rel: "R1", r1: true, route: "audit/IA-2027-001/checklist" },
    { id: "A05", name: "Audit Planner", purpose: "Suggests auditor allocation and schedule slots.", control: "Programme Manager reviews and publishes", rel: "R1", r1: true, route: "cycle" },
    { id: "A06", name: "Evidence Analyst", purpose: "Analyses uploaded evidence and supports evidence review.", control: "Auditor decides the result", rel: "Planned R2", r1: false, route: "roadmap" },
    { id: "A07", name: "Finding Writer & Grader", purpose: "Drafts finding statements and suggests a classification; flags repeats.", control: "Lead Auditor confirms every grade", rel: "R1", r1: true, route: "findings" },
    { id: "A08", name: "RCA & CAPA Coach", purpose: "Supports root-cause (Five Whys / Fishbone) and corrective-action drafting.", control: "Auditor accepts or returns", rel: "R1", r1: true, route: "cars" },
    { id: "A09", name: "Follow-up Agent", purpose: "Drafts reminder / escalation wording. Timing is set by deterministic rules.", control: "Closure stays with the auditor", rel: "R1", r1: true, route: "overdue" },
    { id: "A10", name: "Effectiveness Verifier", purpose: "Supports the 60–90 day effectiveness review and recurrence check.", control: "Auditor records the verdict", rel: "R1 · R2 cross-source", r1: true, route: "effectiveness" },
    { id: "A11", name: "Report Narrator", purpose: "Drafts report narrative / executive summary.", control: "Report approval workflow", rel: "R1", r1: true, route: "reports" },
    { id: "A12", name: "Insights Copilot", purpose: "Answers management questions about audit data within the user's access.", control: "Read-only; answers cite records", rel: "Planned R2 (beta) · R3 GA", r1: false, route: "copilot" }
  ];

  // 19 illustrative BUs across the four source-stated countries.
  // h126 values are chosen so their simple average reproduces the source-stated 93.2%.
  var BU_ROWS = [
    ["BU-01", "Sales", "UAE", "Dubai", "Sales & account management", "Omar Siddiqui", 91.4, 90.6],
    ["BU-02", "Presales", "UAE", "Dubai", "Solution design, proposals", "Mei Tanaka", 95.0, 94.1],
    ["BU-03", "Delivery", "UAE", "Dubai", "Project delivery", "Yousef Barakat", 89.1, 90.4],
    ["BU-04", "Marketing", "UAE", "Dubai", "Campaigns, communications", "Clara Ruiz", 96.0, 95.2],
    ["BU-05", "Quality (Q&BE)", "UAE", "Dubai", "Quality management system", "Fatima Noor", 98.0, 97.5],
    ["BU-06", "HR", "UAE", "Dubai", "Recruitment, competence", "Grace Mensah", 94.0, 93.1],
    ["BU-07", "Logistics", "UAE", "Dubai", "Warehousing, dispatch", "Imran Qureshi", 87.2, 88.9],
    ["BU-08", "Finance", "UAE", "Dubai", "Billing, procurement payables", "Tomas Novak", 93.0, 92.2],
    ["BU-09", "Managed Services", "UAE", "Dubai", "Service desk, operations", "Aisha Karim", 92.5, 91.8],
    ["BU-10", "Procurement", "UAE", "Dubai", "Supplier selection", "Victor Hale", 94.4, 93.0],
    ["BU-11", "Cloud BU", "UAE", "Dubai", "Cloud services", "Nora Lindqvist", 95.2, 94.7],
    ["BU-12", "Delivery – Abu Dhabi", "UAE", "Abu Dhabi", "Project delivery", "Samir Aziz", 92.0, 91.3],
    ["BU-13", "Sales – Abu Dhabi", "UAE", "Abu Dhabi", "Sales", "Huda Saleh", 93.6, 92.9],
    ["BU-14", "Sales – Bahrain", "Bahrain", "Manama", "Sales", "Ali Hasan", 94.1, 93.4],
    ["BU-15", "Delivery – Bahrain", "Bahrain", "Manama", "Project delivery", "Rana Jaber", 92.8, 92.0],
    ["BU-16", "Sales – KSA", "KSA", "Riyadh", "Sales", "Faisal Otaibi", 91.9, 91.0],
    ["BU-17", "Delivery – KSA", "KSA", "Riyadh", "Project delivery", "Lina Harbi", 93.3, 92.6],
    ["BU-18", "Sales – Oman", "Oman", "Muscat", "Sales", "Said Balushi", 94.6, 93.9],
    ["BU-19", "Delivery – Oman", "Oman", "Muscat", "Project delivery", "Maya Rawahi", 92.7, 91.8]
  ];
  // Illustrative NC distribution for IA_01_26 [major, minor, obs, afi]
  var NC = { "BU-01": [0, 1, 2, 1], "BU-03": [1, 2, 1, 1], "BU-07": [1, 2, 2, 0], "BU-08": [0, 1, 1, 2], "BU-09": [0, 1, 2, 1], "BU-12": [0, 1, 1, 1], "BU-16": [0, 1, 2, 0], "BU-19": [0, 1, 1, 2], "BU-15": [0, 0, 2, 1], "BU-06": [0, 0, 1, 1] };

  function seed() {
    var bus = BU_ROWS.map(function (r) {
      return {
        id: r[0], name: r[1], country: r[2], location: r[3], processes: r[4], manager: r[5],
        standards: r[1].indexOf("Cloud") > -1 || r[1].indexOf("Managed") > -1 ? ["ISO 9001", "ISO/IEC 27001", "ISO/IEC 20000-1"] : r[1] === "Logistics" ? ["ISO 9001", "ISO 14001", "ISO 45001"] : ["ISO 9001"],
        h126: r[6], h225: r[7], nc: NC[r[0]] || [0, 0, 1, 0], demo: true
      };
    });

    return {
      version: 1,
      session: null,
      guide: { on: false, step: 0 },
      locations: [
        { id: "LOC-DXB", country: "UAE", city: "Dubai", site: "Dubai office", sector: "Technology services" },
        { id: "LOC-AUH", country: "UAE", city: "Abu Dhabi", site: "Abu Dhabi office", sector: "Technology services" },
        { id: "LOC-BAH", country: "Bahrain", city: "Manama", site: "Manama office", sector: "Technology services" },
        { id: "LOC-RUH", country: "KSA", city: "Riyadh", site: "Riyadh office", sector: "Technology services" },
        { id: "LOC-MCT", country: "Oman", city: "Muscat", site: "Muscat office", sector: "Technology services" },
        { id: "LOC-TMS", country: "—", city: "Remote", site: "Microsoft Teams (remote audit)", sector: "—" }
      ],
      sectors: [
        { id: "SEC-01", name: "Technology services", entities: "Intertec Systems (illustrative structure)" },
        { id: "SEC-02", name: "Shared services", entities: "HR, Finance, Procurement, Q&BE" }
      ],
      bus: bus,
      standards: [
        { id: "STD-9001-15", code: "ISO 9001", edition: "2015", name: "Quality management systems", status: "Active · transition", licence: "Licensed copy on file (demo)", clauses: 7, checkpoints: 59, note: "TPL-59 maps to this edition (source-stated)" },
        { id: "STD-9001-26", code: "ISO 9001", edition: "2026", name: "Quality management systems", status: "Active · new edition", licence: "Licensed copy uploaded (demo)", clauses: 7, checkpoints: 62, note: "Published 16 Sep 2026; transition ends 30 Sep 2029 (source-stated)" },
        { id: "STD-20000", code: "ISO/IEC 20000-1", edition: "2018", name: "IT service management", status: "Active", licence: "Licence pending (demo)", clauses: 7, checkpoints: 0, note: "Used in current auditor workbook" },
        { id: "STD-27001", code: "ISO/IEC 27001", edition: "2022", name: "Information security management", status: "Active", licence: "Licensed copy on file (demo)", clauses: 7, checkpoints: 0, note: "Used in current auditor workbook" },
        { id: "STD-14001", code: "ISO 14001", edition: "2015", name: "Environmental management", status: "Active", licence: "Licence pending (demo)", clauses: 7, checkpoints: 0, note: "Used in current auditor workbook" },
        { id: "STD-45001", code: "ISO 45001", edition: "2018", name: "Occupational health & safety", status: "Active", licence: "Licence pending (demo)", clauses: 7, checkpoints: 0, note: "Used in current auditor workbook" }
      ],
      // Illustrative crosswalk concept. NOT the authoritative 2015 → 2026 crosswalk.
      crosswalk: [
        { id: "CW-01", from: "5.1.1", to: "5.1.1", change: "Expanded", topic: "Leadership — quality culture & ethical behaviour (paraphrase)", impact: "1 checkpoint to update", state: "Approved", by: "Fatima Noor" },
        { id: "CW-02", from: "6.1", to: "6.1.2", change: "Restructured", topic: "Opportunities addressed separately from risks (paraphrase)", impact: "2 checkpoints to update", state: "Impact review", by: "" },
        { id: "CW-03", from: "7.1.6", to: "7.1.6", change: "Unchanged", topic: "Organisational knowledge (paraphrase)", impact: "None", state: "Approved", by: "Fatima Noor" },
        { id: "CW-04", from: "8.2.3", to: "8.2.3", change: "Clarified", topic: "Review of requirements before commitment (paraphrase)", impact: "1 checkpoint guidance update", state: "Impact review", by: "" },
        { id: "CW-05", from: "4.1", to: "4.1", change: "Clarified", topic: "Context — relevant issues incl. climate consideration (paraphrase)", impact: "1 checkpoint to update", state: "AI draft", by: "" },
        { id: "CW-06", from: "9.1.2", to: "9.1.2", change: "Unchanged", topic: "Customer satisfaction monitoring (paraphrase)", impact: "None", state: "Approved", by: "Fatima Noor" }
      ],
      checkpoints: [
        { id: "CP-9001-26-041", clause: "4.1", text: "Confirm the BU has identified internal and external issues relevant to its activities and reviews them.", guidance: "Ask for the latest context review; check it is dated within the review cycle.", evidence: "Context / SWOT review, management review minutes", weight: 3, state: "approved", version: "v1.0", reviewer: "Fatima Noor", reviewedAt: "2026-12-14 10:12" },
        { id: "CP-9001-26-511", clause: "5.1.1", text: "Verify leadership promotes a quality culture and ethical conduct within the team.", guidance: "Look for communications and sign-offs, not only policy documents.", evidence: "Town hall notes, code of conduct acknowledgements", weight: 3, state: "approved", version: "v1.0", reviewer: "Fatima Noor", reviewedAt: "2026-12-14 10:20" },
        { id: "CP-9001-26-612", clause: "6.1.2", text: "Check that opportunities are identified and actioned separately from risks.", guidance: "Changed emphasis in the 2026 edition (illustrative). Sample two opportunities.", evidence: "Opportunity register, review minutes", weight: 3, state: "ai-draft", version: "v1.1-draft", reviewer: "", reviewedAt: "", rationale: "Crosswalk CW-02 marks 6.1 as restructured in the 2026 edition." },
        { id: "CP-9001-26-716", clause: "7.1.6", text: "Confirm organisational knowledge needed by the BU is maintained and kept current.", guidance: "Check version history of playbooks / knowledge base.", evidence: "Playbook with version history", weight: 3, state: "approved", version: "v1.0", reviewer: "Fatima Noor", reviewedAt: "2026-12-14 10:41" },
        { id: "CP-9001-26-823", clause: "8.2.3", text: "Verify customer requirements are reviewed before committing to supply (e.g. before a quotation is issued).", guidance: "Sample 10 recent quotations; check for signed contract review.", evidence: "Signed contract review checklist", weight: 3, state: "ai-draft", version: "v1.1-draft", reviewer: "", reviewedAt: "", rationale: "Crosswalk CW-04 clarifies guidance; repeat finding history in H1-2026." },
        { id: "CP-9001-26-912", clause: "9.1.2", text: "Check customer satisfaction is monitored and results are acted on.", guidance: "Look for trend analysis, not only raw survey scores.", evidence: "CSAT survey results, action log", weight: 3, state: "approved", version: "v1.0", reviewer: "Fatima Noor", reviewedAt: "2026-12-14 11:02" },
        { id: "CP-9001-26-1020", clause: "10.2", text: "Verify nonconformities are corrected and corrective actions are effective.", guidance: "Trace one prior CAR from finding to effectiveness check.", evidence: "CAR log, effectiveness records", weight: 3, state: "ai-draft", version: "v1.1-draft", reviewer: "", reviewedAt: "", rationale: "Drafted from licensed clause content (simulated)." }
      ],
      templates: [
        { id: "TPL-59", name: "TPL-59 Internal audit checklist", standard: "ISO 9001:2015", type: "Internal audit", version: "Legacy Excel", items: 59, state: "Migrated (read-only)" },
        { id: "TPL-9001-26-GEN", name: "ISO 9001:2026 generic BU checklist", standard: "ISO 9001:2026", type: "Internal audit", version: "v1.0", items: 47, state: "Approved" },
        { id: "TPL-9001-26-SALES", name: "ISO 9001:2026 sales process checklist", standard: "ISO 9001:2026", type: "Internal audit", version: "v0.9", items: 24, state: "Draft" }
      ],
      auditors: [
        { id: "AUD-01", name: "Leila Haddad", role: "Lead Auditor", quals: ["ISO 9001 Lead Auditor", "ISO/IEC 27001 Internal Auditor"], standards: ["ISO 9001", "ISO/IEC 27001"], exp: 9, dept: "Q&BE", location: "Dubai", availability: "Available", certExpiry: "2028-03-31", prevDept: "", audits: 14 },
        { id: "AUD-02", name: "Arjun Menon", role: "Auditor", quals: ["ISO 9001 Internal Auditor", "ISO/IEC 20000-1 Internal Auditor"], standards: ["ISO 9001", "ISO/IEC 20000-1"], exp: 5, dept: "Managed Services", location: "Dubai", availability: "Available", certExpiry: "2028-03-31", prevDept: "", audits: 9 },
        { id: "AUD-03", name: "Sara Al Mansoori", role: "Auditor", quals: ["ISO 9001 Internal Auditor", "ISO 14001 Internal Auditor", "ISO 45001 Internal Auditor"], standards: ["ISO 9001", "ISO 14001", "ISO 45001"], exp: 6, dept: "Finance", location: "Abu Dhabi", availability: "Available", certExpiry: "2027-11-30", prevDept: "", audits: 11 },
        { id: "AUD-04", name: "Daniel Okafor", role: "Auditor", quals: ["ISO/IEC 27001 Internal Auditor", "ISO 9001 Internal Auditor"], standards: ["ISO 9001", "ISO/IEC 27001"], exp: 4, dept: "Cloud BU", location: "Dubai", availability: "Leave 17–21 May", certExpiry: "2027-07-15", prevDept: "", audits: 6 },
        { id: "AUD-05", name: "Priya Raman", role: "Auditor", quals: ["ISO 9001 Internal Auditor"], standards: ["ISO 9001"], exp: 3, dept: "Presales", location: "Dubai", availability: "Available", certExpiry: "2028-01-31", prevDept: "HR (until Jan 2026)", audits: 4 },
        { id: "AUD-06", name: "Hamad Al Kaabi", role: "Auditor", quals: ["ISO 9001 Internal Auditor", "ISO/IEC 20000-1 Internal Auditor"], standards: ["ISO 9001", "ISO/IEC 20000-1"], exp: 7, dept: "Delivery – KSA", location: "Riyadh", availability: "Available", certExpiry: "2028-06-30", prevDept: "", audits: 12 }
      ],
      programmes: [
        { id: "PRG-2027", name: "Internal Audit Programme 2027", year: 2027, cycle: "H1-2027 (IQA1) + H2-2027 (IQA2)", type: "Internal Audit", standards: ["ISO 9001"], coverage: "All 19 BUs · UAE, Bahrain, KSA, Oman", manager: "Nadia Farouk", start: "2027-04-27", end: "2027-11-30", status: "Draft", history: [{ ts: "2027-03-02 09:15", who: "Nadia Farouk", what: "Programme drafted" }], approvedBy: "" },
        { id: "PRG-2026", name: "Internal Audit Programme 2026", year: 2026, cycle: "H1-2026 (IQA1) + H2-2026 (IQA2)", type: "Internal Audit", standards: ["ISO 9001"], coverage: "All 19 BUs", manager: "Nadia Farouk", start: "2026-04-20", end: "2026-11-30", status: "Approved", history: [{ ts: "2026-03-01 10:00", who: "Fatima Noor", what: "Approved (migrated from Excel)" }], approvedBy: "Fatima Noor" }
      ],
      cyclePlan: { id: "CP-H1-2027", cycle: "H1-2027 · IQA1", status: "Draft", publishedBy: "", publishedAt: "", opening: "2027-04-27" },
      slots: null, // built below
      audits: null,
      findings: [
        { id: "F-IA-2026-001-02", audit: "IA-2026-001", bu: "BU-01", clause: "8.2.3", requirement: "Review of requirements before commitment (paraphrase)", evidence: "2 of 8 sampled quotations without signed review (H1-2026, demo)", statement: "Contract review not consistently evidenced before quotations were issued.", grade: "min", aiGrade: "min", gradeConfirmedBy: "Leila Haddad", status: "Closed", owner: "Omar Siddiqui", due: "2026-06-20", car: "CAR-2026-0004", historic: true },
        { id: "F-IA-2026-003-01", audit: "IA-2026-003", bu: "BU-03", clause: "8.5.1", requirement: "Control of service provision (paraphrase)", evidence: "Delivery checklists missing for 3 projects (demo)", statement: "Project delivery checklists not completed for sampled projects.", grade: "min", aiGrade: "min", gradeConfirmedBy: "Leila Haddad", status: "CAR open", owner: "Yousef Barakat", due: "2027-04-28", car: "CAR-2026-0011", historic: true },
        { id: "F-IA-2026-007-01", audit: "IA-2026-007", bu: "BU-07", clause: "7.1.5", requirement: "Monitoring & measuring resources (paraphrase)", evidence: "Calibration records missing for 2 scales (demo)", statement: "Calibration status of weighing equipment not maintained.", grade: "maj", aiGrade: "min", gradeConfirmedBy: "Leila Haddad", status: "CAR open", owner: "Imran Qureshi", due: "2027-05-01", car: "CAR-2026-0007", historic: true },
        { id: "F-IA-2026-008-02", audit: "IA-2026-008", bu: "BU-08", clause: "8.4.1", requirement: "Control of external providers (paraphrase)", evidence: "Supplier evaluation overdue for 4 suppliers (demo)", statement: "External provider re-evaluation not performed at the defined frequency.", grade: "min", aiGrade: "min", gradeConfirmedBy: "Leila Haddad", status: "CAR open", owner: "Tomas Novak", due: "2027-04-25", car: "CAR-2026-0014", historic: true }
      ],
      cars: [
        { id: "CAR-2026-0004", finding: "F-IA-2026-001-02", bu: "BU-01", owner: "Omar Siddiqui", state: "Effectiveness review", due: "2026-06-20", implemented: "2027-02-20", correction: "Missing reviews completed retrospectively for the 2 quotations.", extent: "All quotations Jan–Mar 2026 checked; no further gaps.", whys: ["Quotations sent without review", "Review step was optional in CRM", "", "", ""], causeCat: "Process / method", rootCause: "CRM allowed a quotation to be issued without the review step.", action: "Made the contract review step mandatory in CRM before quote PDF can be generated.", evidence: ["CRM_workflow_change.pdf"], verifiedBy: "Leila Haddad", effectiveness: null, history: [{ ts: "2026-05-15 10:00", who: "Omar Siddiqui", what: "CAR opened on acknowledgement" }, { ts: "2026-06-12 15:20", who: "Leila Haddad", what: "Action plan accepted" }, { ts: "2027-02-20 11:00", who: "Omar Siddiqui", what: "Implementation evidence submitted" }, { ts: "2027-02-27 09:40", who: "Leila Haddad", what: "Implementation verified; effectiveness review scheduled 60–90 days" }] },
        { id: "CAR-2026-0007", finding: "F-IA-2026-007-01", bu: "BU-07", owner: "Imran Qureshi", state: "Implementation", due: "2027-05-01", correction: "Scales taken out of use.", extent: "", whys: ["", "", "", "", ""], causeCat: "", rootCause: "Calibration schedule not owned after staff change.", action: "Assign calibration owner; add to maintenance calendar.", evidence: [], history: [{ ts: "2026-12-02 09:00", who: "Imran Qureshi", what: "CAR opened" }] },
        { id: "CAR-2026-0011", finding: "F-IA-2026-003-01", bu: "BU-03", owner: "Yousef Barakat", state: "Implementation", due: "2027-05-08", correction: "Checklists completed for the 3 projects.", extent: "", whys: ["", "", "", "", ""], causeCat: "", rootCause: "Checklist not part of project closure gate.", action: "Add checklist to project closure gate.", evidence: [], history: [{ ts: "2026-12-04 09:00", who: "Yousef Barakat", what: "CAR opened" }] },
        { id: "CAR-2026-0014", finding: "F-IA-2026-008-02", bu: "BU-08", owner: "Tomas Novak", state: "Root cause & plan", due: "2027-04-25", correction: "", extent: "", whys: ["", "", "", "", ""], causeCat: "", rootCause: "", action: "", evidence: [], history: [{ ts: "2026-12-06 09:00", who: "Tomas Novak", what: "CAR opened" }] }
      ],
      reports: [
        { id: "RPT-IA-2026-001", audit: "IA-2026-001", bu: "BU-01", title: "Sales – Dubai · IQA1 2026", state: "Issued", score: 91.4, issued: "2026-05-20", archive: "SharePoint › 2026 › Audit Report › Sales_Sent", reads: "Read by BU manager (simulated)" },
        { id: "RPT-IA-2026-002", audit: "IA-2026-002", bu: "BU-02", title: "Presales – Dubai · IQA1 2026", state: "Issued", score: 95.0, issued: "2026-05-22", archive: "SharePoint › 2026 › Audit Report › Presales_Sent", reads: "Read by BU manager (simulated)" }
      ],
      aiLog: [],
      agentsOn: { A01: true, A02: true, A03: true, A04: true, A05: true, A06: false, A07: true, A08: true, A09: true, A10: true, A11: true, A12: false },
      notifications: [
        { id: "N1", text: "Checklist for IA-2027-001 is waiting to be generated", route: "audit/IA-2027-001/checklist", roles: "la pm" },
        { id: "N2", text: "CAR-2026-0014 is 15 days overdue (+14 escalation)", route: "overdue", roles: "pm ex be" },
        { id: "N3", text: "Programme PRG-2027 is in Draft", route: "programmes", roles: "pm be" },
        { id: "N4", text: "Effectiveness review due: CAR-2026-0004", route: "effectiveness/CAR-2026-0004", roles: "la au pm" },
        { id: "N5", text: "2 users waiting for role assignment", route: "admin/users", roles: "ad" }
      ],
      users: [
        { name: "Nadia Farouk", email: "programme.manager@demo.intertec", role: "Audit Programme Manager", status: "Active" },
        { name: "Leila Haddad", email: "lead.auditor@demo.intertec", role: "Lead Auditor", status: "Active" },
        { name: "Arjun Menon", email: "auditor@demo.intertec", role: "Auditor", status: "Active" },
        { name: "Omar Siddiqui", email: "sales.manager@demo.intertec", role: "Auditee / Action Owner", status: "Active" },
        { name: "Fatima Noor", email: "be.manager@demo.intertec", role: "Business Excellence Manager", status: "Active" },
        { name: "Khalid Rahman", email: "management@demo.intertec", role: "Senior Management", status: "Active" },
        { name: "Ravi Das", email: "admin@demo.intertec", role: "System Administrator", status: "Active" },
        { name: "Jon Bauer", email: "new.auditor1@demo.intertec", role: "—", status: "Awaiting role" },
        { name: "Amal Yousef", email: "new.auditor2@demo.intertec", role: "—", status: "Awaiting role" }
      ],
      trail: [
        { ts: "2027-03-02 09:15", actor: "Nadia Farouk", role: "Audit Programme Manager", action: "Created", record: "PRG-2027", detail: "Programme drafted" },
        { ts: "2027-02-27 09:40", actor: "Leila Haddad", role: "Lead Auditor", action: "Verified", record: "CAR-2026-0004", detail: "Implementation verified" },
        { ts: "2026-12-14 11:02", actor: "Fatima Noor", role: "Business Excellence Manager", action: "Approved", record: "CP-9001-26-912", detail: "Baseline checkpoint v1.0 approved" },
        { ts: "2026-12-10 16:30", actor: "Ravi Das", role: "System Administrator", action: "Imported", record: "Excel history", detail: "H2-24 to H1-26 history migrated (simulated)" }
      ],
      counters: { finding: 0, car: 0 }
    };
  }

  function buildSlots(s) {
    // [bu, deptLabel, location, focus, auditor, date, time, mins, status]
    var rows = [
      ["BU-01", "Sales", "Dubai office", "Customer requirements, 8.2", "AUD-02", "2027-05-10", "09:30", 90, 94],
      ["BU-02", "Presales", "Teams", "Risk & opportunity, 6.1", "AUD-03", "2027-05-11", "11:00", 60, 91],
      ["BU-03", "Delivery", "Dubai office", "Operational control, 8.5", "AUD-06", "2027-05-12", "10:00", 90, 88],
      ["BU-04", "Marketing", "Teams", "Communication, 7.4", "AUD-04", "2027-05-13", "11:00", 60, 90],
      ["BU-06", "HR", "Teams", "Competence, 7.2", "AUD-05", "2027-05-19", "14:00", 45, 86],
      ["BU-05", "Quality (Q&BE)", "Dubai office", "Internal audit, 9.2", "AUD-03", "2027-05-04", "10:00", 60, 92],
      ["BU-07", "Logistics", "Dubai office", "Monitoring resources, 7.1.5", "AUD-02", "2027-05-18", "10:00", 60, 89],
      ["BU-08", "Finance", "Teams", "External providers, 8.4", "AUD-06", "2027-05-05", "13:00", 60, 87],
      ["BU-09", "Managed Services", "Dubai office", "Service provision, 8.5", "AUD-03", "2027-05-06", "09:00", 90, 90],
      ["BU-10", "Procurement", "Teams", "External providers, 8.4", "AUD-05", "2027-05-07", "11:00", 60, 85],
      ["BU-11", "Cloud BU", "Dubai office", "Change control, 6.3", "AUD-02", "2027-05-14", "10:00", 60, 88],
      ["BU-12", "Delivery – Abu Dhabi", "Abu Dhabi office", "Operational control, 8.5", "AUD-03", "2027-05-20", "10:00", 90, 93],
      ["BU-13", "Sales – Abu Dhabi", "Abu Dhabi office", "Customer requirements, 8.2", "AUD-03", "2027-05-21", "10:00", 60, 92],
      ["BU-14", "Sales – Bahrain", "Teams", "Customer requirements, 8.2", "AUD-02", "2027-05-24", "11:00", 60, 90],
      ["BU-15", "Delivery – Bahrain", "Teams", "Operational control, 8.5", "AUD-06", "2027-05-25", "11:00", 60, 89],
      ["BU-16", "Sales – KSA", "Riyadh office", "Customer requirements, 8.2", "AUD-06", "2027-05-26", "09:30", 60, 91],
      ["BU-17", "Delivery – KSA", "Riyadh office", "Operational control, 8.5", "AUD-02", "2027-05-27", "10:00", 90, 87],
      ["BU-18", "Sales – Oman", "Teams", "Customer requirements, 8.2", "AUD-04", "2027-05-31", "11:00", 60, 86],
      ["BU-19", "Delivery – Oman", "Teams", "Operational control, 8.5", "AUD-03", "2027-06-01", "10:00", 60, 90]
    ];
    return rows.map(function (r, i) {
      var bu = s.bus.filter(function (b) { return b.id === r[0]; })[0];
      var auditId = "IA-2027-" + String(i + 1).padStart(3, "0");
      var flag = r[0] === "BU-06" ? "Impartiality check: auditor worked in HR until Jan 2026 (24-month cooling-off rule). Reassign or record an override reason." : "";
      return { id: "SL-" + String(i + 1).padStart(2, "0"), audit: auditId, bu: r[0], dept: r[1], manager: bu.manager, location: r[2], focus: r[3], auditor: r[4], lead: "AUD-01", auditees: bu.manager + " + team", date: r[5], time: r[6], mins: r[7], actual: "", status: "AI proposed", invite: "Not sent", match: r[8], flag: flag, override: "" };
    });
  }

  function buildAudits(s) {
    return s.slots.map(function (sl) {
      var bu = s.bus.filter(function (b) { return b.id === sl.bu; })[0];
      return {
        id: sl.audit, bu: sl.bu, title: bu.name + " – " + (sl.location.indexOf("Teams") > -1 ? "Teams" : bu.location) + " · IQA1 2027",
        standard: "ISO 9001:2026", cycle: "H1-2027 · IQA1", type: "Internal Audit", slot: sl.id,
        status: "Planned", lead: "AUD-01", auditor: sl.auditor,
        scope: sl.bu === "BU-01" ? {
          objective: "Determine conformity of Sales BU processes with ISO 9001:2026 and the Intertec QMS.",
          boundaries: "Sales BU, Dubai office; quotations, contract review, customer communication and feedback.",
          activities: ["Quotations", "Contract review", "Customer communication", "Customer feedback"],
          exclusions: "", confirmed: false, confirmedBy: "", confirmedAt: ""
        } : null,
        applicability: null, checklist: null, responses: {}, fieldwork: "Not started",
        meeting: { opening: "", closing: "", attendees: "" },
        agenda: [["09:30", "Opening meeting", "15 min"], ["09:45", "Quotations & contract review (8.2)", "30 min"], ["10:15", "Customer communication & feedback (8.2.1, 9.1.2)", "25 min"], ["10:40", "Auditor consolidation", "10 min"], ["10:50", "Closing meeting", "10 min"]],
        report: null
      };
    });
  }

  CA.seed = function () {
    var s = seed();
    s.slots = buildSlots(s);
    s.audits = buildAudits(s);
    s.findings.forEach(function (f) { f.history = f.history || [{ ts: "2026-05-14 12:00", who: "Leila Haddad", what: "Migrated from Excel history (illustrative)" }]; });
    return s;
  };

  // Deterministic "AI" outputs (simulated). Same input → same output every time.
  CA.SIM = {
    applicability: [
      { clause: "4.1", topic: "Context of the organisation", rec: "Applicable", reason: "Baseline checkpoint; applies to every BU." },
      { clause: "5.1.1", topic: "Leadership commitment", rec: "Applicable", reason: "BU manager leads a team of 12 (demo context)." },
      { clause: "6.1.2", topic: "Risks and opportunities", rec: "Applicable", reason: "Changed in 2026 edition (crosswalk CW-02)." },
      { clause: "7.1.6", topic: "Organisational knowledge", rec: "Applicable", reason: "Sales playbooks and pricing rules held by the BU." },
      { clause: "7.2", topic: "Competence", rec: "Applicable", reason: "Sales staff need product and pricing competence." },
      { clause: "8.2", topic: "Requirements for products & services", rec: "Applicable", reason: "Core sales activity: quotations, contract review." },
      { clause: "8.3", topic: "Design and development", rec: "Proposed not applicable", reason: "Sales BU does not design products or services (per BU profile). Needs human confirmation — never auto-excluded." },
      { clause: "9.1.2", topic: "Customer satisfaction", rec: "Applicable", reason: "BU owns customer feedback collection." },
      { clause: "10.2", topic: "Nonconformity & corrective action", rec: "Applicable", reason: "Open history: F-IA-2026-001-02 (H1-2026)." }
    ],
    checklist: [
      { id: "Q01", clause: "4.1", q: "How does the Sales BU identify and review internal and external issues relevant to its sales activities?", evidence: "Context / SWOT review, management review minutes", guidance: "Check the review is dated within the cycle and actions are tracked.", why: "Baseline checkpoint CP-9001-26-041 (approved v1.0).", flag: "Baseline" },
      { id: "Q02", clause: "5.1.1", q: "How does leadership promote quality culture and ethical conduct in the team?", evidence: "Town hall notes, code of conduct sign-off", guidance: "Ask two team members, not only the manager.", why: "New emphasis in the 2026 edition (crosswalk CW-01).", flag: "Changed in 2026 edition" },
      { id: "Q03", clause: "6.1.2", q: "How does the team identify and plan actions for opportunities, separately from risks?", evidence: "Opportunity register, review minutes", guidance: "Sample two opportunities and trace them to actions.", why: "Restructured in the 2026 edition (crosswalk CW-02).", flag: "Changed in 2026 edition" },
      { id: "Q04", clause: "7.1.6", q: "Where is sales knowledge (pricing rules, playbooks) kept, and how is it kept current?", evidence: "SharePoint playbook, version history", guidance: "Check last update date and owner.", why: "BU activity: pricing rules and playbooks.", flag: "Clause reference could not be verified", guard: true },
      { id: "Q05", clause: "7.2", q: "How is the competence of new sales staff on products and pricing confirmed?", evidence: "Training records, onboarding checklist", guidance: "Sample two staff hired in the last 12 months.", why: "BU activity: quotations require pricing competence.", flag: "Tailored to BU" },
      { id: "Q06", clause: "8.2.1", q: "How are customer enquiries and complaints communicated and tracked?", evidence: "Enquiry log, CRM case history", guidance: "Trace one complaint to closure.", why: "BU activity: customer communication.", flag: "Tailored to BU" },
      { id: "Q07", clause: "8.2.3", q: "Show how customer requirements are reviewed before a quotation is sent.", evidence: "Signed contract review checklist", guidance: "Sample 10 quotations from the last 2 months.", why: "Repeat-risk: similar finding F-IA-2026-001-02 in H1-2026.", flag: "Repeat finding in H1-2026" },
      { id: "Q08", clause: "8.3", q: "Design and development of products and services.", evidence: "—", guidance: "Applicability proposed as not applicable; confirm with auditee.", why: "A03 proposed not applicable — awaiting human decision.", flag: "Proposed not applicable", na: true },
      { id: "Q09", clause: "9.1.2", q: "How is customer satisfaction monitored, and what was done with the last results?", evidence: "CSAT survey results, action log", guidance: "Look for analysis and actions, not only scores.", why: "BU owns customer feedback.", flag: "Tailored to BU" },
      { id: "Q10", clause: "10.2", q: "Show that the corrective action from F-IA-2026-001-02 was implemented and has stayed effective.", evidence: "CAR-2026-0004 records, CRM workflow", guidance: "Check for recurrence in recent quotations.", why: "Prior finding on the same clause and BU.", flag: "Prior finding follow-up" }
    ],
    findingDraft: function (ev) {
      return "Contract review is not consistently performed before quotations are issued. " + (ev || "3 of 10 quotations sampled (Mar–Apr 2027) had no signed review") + ", contrary to the organisation's process for clause 8.2.3 (illustrative).";
    },
    gradeReason: { min: "A partial lapse: the process exists and works in most sampled cases.", maj: "Absence or total breakdown of a required process.", obs: "No requirement breached yet, but a risk was seen.", afi: "Conforms, but could be done better." },
    summary: "The Sales BU (Dubai) demonstrated a generally effective approach to customer communication, competence and customer satisfaction monitoring. One area needs action: contract review before quotations is not consistently evidenced, a repeat of an H1-2026 finding on the same clause. Opportunities planning is in place but not yet separated from risk planning as emphasised in the 2026 edition. (Simulated AI draft — edit before approval.)",
    coach: { cat: "Process / method", text: "Your answers point to the procedure itself, not to individual behaviour. Suggested cause category: Process / method. Consider naming a backup approver so urgent deals do not skip review." },
    followUp: function (car, due) { return "Reminder: corrective action " + car + " is due on " + due + ". Still missing: the updated procedure and one example of a reviewed quotation. Reply with progress or upload evidence. (Simulated AI wording — timing set by workflow rules.)"; },
    effectiveness: "No recurrence found in 12 quotations sampled after implementation (simulated check). Suggested rating: Effective. Auditor decides."
  };
})(window.CA);
