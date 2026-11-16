# Compliance AI: presenter's guide for a non-technical audience

This guide takes you through the prototype one module at a time. For each module you get:

- **Say this:** a one-line explanation in plain words
- **The problem today:** why it matters
- **Real-life example:** an everyday comparison
- **Click this:** what to do in the prototype
- **Point out:** the one thing the audience should remember
- **If they ask:** a likely question and a short answer

**Total time:** about 35–40 minutes. To shorten it, skip the modules marked *(optional)*.

---

## 0. Before you start

**Setup (2 minutes before the meeting)**

1. Open the prototype and sign in. Open the user menu (top right) and choose **Reset demo data**, so you start clean.
2. Sign out again so the audience sees the sign-in page first.
3. Zoom the browser to 110–125% so people at the back can read it.

**The one story to use all the way through**

Non-technical people follow one story much better than ten separate ideas. Use this one for every module:

> *"Imagine a restaurant chain with 19 branches across the UAE, Bahrain, Saudi Arabia and Oman. Twice a year, head office sends inspectors to every branch to check they follow the food-safety rulebook. Today they do it with spreadsheets, emails and phone calls. Compliance AI is the system that runs those inspections from start to finish."*

Then map it once, at the start:

| Restaurant story | Intertec reality |
|---|---|
| 19 restaurant branches | ~19 business units (BUs) |
| Food-safety rulebook | ISO standards (ISO 9001 and others) |
| Inspector's clipboard checklist | Audit checklist |
| Inspection visit | Internal audit (IQA1 in H1, IQA2 in H2) |
| "Fridge is at 9°C" | A finding / nonconformity (NC) |
| Branch manager fixes the fridge | Corrective action (CAR) |
| Head office league table | Management dashboard |

**Three rules to repeat during the demo**

1. **AI drafts, people decide.** Anything in a **blue dashed box** is an AI suggestion. Nothing counts until a named person accepts it.
2. **Rules, not AI, handle dates, scores and permissions.** These must be exact, so they are fixed rules.
3. **This is a prototype.** Email, Teams, sign-in and AI are simulated. Look for the yellow **"Simulated"** tags.

---

## Opening (3 minutes)

**Say this:**
"Today, internal audits at Intertec live in three Excel workbooks on OneDrive, plus Outlook and Teams. Nothing is connected. Compliance AI puts the whole audit, from planning to closing, into one system. AI does the time-consuming drafting, and people stay in charge of every decision."

**The problem today (pick two or three):**
- Checklists are written by hand, so changes to the standard get missed.
- The same checklist is used for every department, even when it doesn't fit.
- Corrective actions are chased by opening spreadsheets and sending emails.
- Nobody checks whether a fix actually worked.
- Management charts are rebuilt by hand every six months.
- Reports are filed by hand into about 19 folders.

**Real-life example:**
"It's like running a restaurant chain's inspections with paper notes, WhatsApp messages and a shared Excel file. It works, but things fall through the cracks."

**Why now:** a new edition, ISO 9001:2026, was published on 16 Sep 2026. Intertec must move to it by 30 Sep 2029, and today's checklist (TPL-59) still follows the 2015 edition.

---

# PHASE 1 · PREPARE: set things up once

## Module 1 · Sign-in and roles

**Say this:** "Everyone signs in with their normal Microsoft work account, and sees only what their job needs."

**Real-life example:** "A hospital key card. A nurse's card opens the wards, a pharmacist's opens the pharmacy, and the CEO's opens the boardroom. Same building, different doors."

**Click this:**
1. On the sign-in page, open **Demo credentials** to show the seven roles.
2. Click **Sign in and start the guided demo**.
3. Point to the dark bar at the top: "This guide takes us through one real audit in 18 steps."

**Point out:** the **Viewing as** box in the top bar. "I can switch roles to show you what each person sees. In the real product, you only have your own role."

**If they ask** "Is this the real login?": "No. The real system uses Microsoft Entra ID single sign-on. Here it's simulated."

---

## Module 2 · Home dashboard and My tasks

**Say this:** "When you sign in, you see what is waiting for you and what's coming up. No hunting through emails."

**Real-life example:** "Your banking app's home screen: balance, bills due, recent payments. Everything important on one screen."

**Click this:**
1. Show the numbers at the top. Point to **93.2%** with its green **Source-stated** tag: "This is Intertec's real figure from the last audit cycle (IA_01_26)."
2. Show **Waiting on me**: "These are my to-dos, worked out automatically."
3. Show **Coming up** and **Overdue actions**.
4. Switch **Viewing as** to *Auditee*, then back. "Different person, different home page."

**Point out:** grey dashed tags say **Illustrative demo data**; green tags say **Source-stated**. "We never mix made-up numbers with real ones without saying so."

---

## Module 3 · Audit Universe

**Say this:** "This is the master list of everything we can audit: countries, offices, business units, what each one does, and which standards apply to it."

**The problem today:** this information is spread across sheets and people's heads.

**Real-life example:** "Head office's list of every restaurant branch: address, manager, whether it's a bakery or a grill, and which hygiene rules apply."

**Click this (guide step 2):**
1. Use the **Country** filter: choose *KSA*. "Only the Saudi BUs."
2. Clear the filter. Click **Add BU**, fill in a name and manager, and save. "It appears in the list straight away."
3. Click a BU name to show its profile.

**Point out:** "Set it up once, and every audit uses the same reliable list."

---

## Module 4 · Standards Library and Standards Watch

**Say this:** "This holds the rulebooks (the ISO standards), which edition we follow, and what changed between editions."

**Real-life example:** "When the government updates the food-safety code, a good restaurant manager compares the old rules with the new ones and asks: what do we need to change?"

**Click this (guide step 3):**
1. Show the catalogue: ISO 9001, 20000-1, 27001, 14001, 45001.
2. Point to **licence status**. "ISO standards are copyrighted. We only use copies Intertec has paid for. The prototype shows clause numbers, never the actual text."
3. Click **Review change impact** to open the **Edition crosswalk**: the 2015 → 2026 changes.
4. As the Business Excellence Manager, click **Approve impact** on one row.

**Point out:** the **Standards Watch (A01)** box. "AI spots that a new edition exists and drafts which clauses changed. A person approves every change."

**If they ask** "Are these the real clause changes?": "No, these are illustrative examples. The real crosswalk comes from the licensed standard."

---

## Module 5 · Baseline checkpoints *(optional)*

**Say this:** "These are the approved, reusable questions for each clause, our master question bank."

**Real-life example:** "A driving examiner's official list of things to check: mirrors, signals, parking. Every examiner uses the same approved list."

**Click this:** go to **Library → Baseline checkpoints** (as BE Manager). Show an **AI draft** in a blue box. Click **Accept**. "It turns green and is stamped with my name and the time."

**Point out:** the difference between this **master question bank** and the **audit-specific checklist** in Module 7.

---

## Module 6 · Scope and applicability

**Say this:** "Before an audit, we decide exactly what we'll check, and AI suggests which rules apply to this department, with a reason for each."

**The problem today:** checklists aren't tailored, so auditors ask irrelevant questions or miss relevant ones.

**Real-life example:** "A bakery doesn't have a deep fryer, so the fryer safety checks don't apply. But someone must confirm that. You can't just quietly skip it."

**Click this (guide step 4):**
1. Show the audit details: Sales BU, Dubai, ISO 9001:2026.
2. Click **Run applicability check (simulated)**.
3. Point to clause **8.3 Design and development**: AI proposes **not applicable**, because the Sales team doesn't design products.
4. For each row, choose **Confirm**. For 8.3, choose *Confirm: not applicable* and type a reason.
5. Click **Confirm scope & continue**.

**Point out:** "**Nothing is excluded silently.** AI proposes, and a person confirms it with a reason, which is recorded. An external auditor can later see exactly why 8.3 was left out."

---

## Module 7 · AI Checklist Builder ⭐ *(the heart of the product: take your time)*

**Say this:** "Today someone writes the checklist by hand in Excel. Here AI drafts a checklist tailored to this department in about a minute. The Lead Auditor then reviews every question."

**Real-life example:** "A personal trainer's assistant drafts this week's workout plan based on your goals and last month's injuries. The trainer still checks every exercise before you start."

**Click this (guide steps 5–7):**
1. Click **Generate checklist**. While it loads, read the six stages aloud: *job queued → retrieve context → draft questions → guardrails check → human review → record & log*.
2. Show one question and walk through its parts: clause number, question, **expected evidence**, guidance, and **AI rationale** ("why this question is here").
3. Point to the labels:
   - **"Repeat finding in H1-2026"**: AI remembered last audit's problem.
   - **"Changed in 2026 edition"**: AI picked up the new rule.
   - **Red "Clause reference could not be verified"**: "The safety check caught a possible mistake. It's flagged, not hidden."
4. Click **Reject** on one question, then **Undo**. Click **Accept** on another.
5. Click **Edit** on the red flagged one, tick the confirmation box and save.
6. Click **Approve checklist**. "Now it's official, stamped with the Lead Auditor's name and the time."

**Point out:** "**Blue dashed means AI draft. Green means a person approved it.** Watch the boxes change colour as I decide."

**If they ask** "What if the AI makes something up?": "Three safeguards. It only works from licensed standard text. Every clause reference is automatically checked. And a qualified person approves every question. The project's quality target is zero invented clause references."

---

# PHASE 2 · PLAN: decide who audits what, and when

## Module 8 · Audit Programme

**Say this:** "The programme is the big-picture plan for the year: which BUs, which standards, which half-year cycles."

**Real-life example:** "A school's academic calendar: exam weeks for the whole year, before anyone decides which teacher supervises which room."

**Click this (guide step 8):**
1. As Programme Manager, show the form and click **Submit for review**.
2. On the review page, show the **programme grid**: BUs down the side, months across the top, IQA1 and IQA2 markers.
3. Click **Approve programme**. It's locked, so the prototype offers to switch to the Business Excellence Manager. Accept and approve.

**Point out:** "**No AI here at all.** This is a management decision, made with fixed rules and a named approver."

---

## Module 9 · Cycle plan and scheduling

**Say this:** "Now we turn the yearly plan into actual appointments: who audits which department, on what day and at what time."

**The problem today:** this is the Plan_IA sheet in Excel, juggled by hand around everyone's calendars.

**Real-life example:** "A hospital duty roster. A scheduling assistant suggests shifts based on skills and availability. It also follows a strict rule: you can't be on the panel judging your own department."

**Click this (guide steps 9–10):**
1. Show the blue cells: "AI (the A05 Audit Planner) proposed these auditors and slots."
2. Point to the red **impartiality** warning on HR: "This auditor worked in HR within the last 24 months. The rule says they can't audit HR."
3. Click **Resolve** and choose a different auditor. The warning clears.
4. Switch to the **Calendar** tab.
5. Click **Publish & send invites** and confirm. A few seconds later, a message shows invitations being accepted.

**Point out:**
- "The 24-month rule is a **fixed rule check**, not an AI opinion."
- "**Nothing is sent until a person presses Publish.**"
- The invites are **simulated**. The real system sends Outlook invitations with Teams links.

---

# PHASE 3 · AUDIT: do the inspection

## Module 10 · Audit record

**Say this:** "Every audit has one page. Scope, team, schedule, checklist, fieldwork, findings and report are all tabs on it. Nothing is copied between files."

**Real-life example:** "A patient's hospital file. Every test, note and prescription is in one folder, not scattered across departments."

**Click this (guide step 11):** show the **status timeline** at the top (Scheduled → Checklist approved → Fieldwork → Findings → Report → Closed) and the row of tabs.

**Point out:** "At a glance, anyone can see where this audit stands."

---

## Module 11 · Fieldwork

**Say this:** "During the audit meeting, the auditor works through the checklist on a laptop or tablet, recording a result, notes and evidence for each question. It saves automatically."

**Real-life example:** "A car inspector at the garage going down the checklist: brakes ✓, lights ✓, tyres ✗, with a photo of the worn tyre attached."

**Click this (guide step 12):**
1. Show the sections on the left, which follow the ISO clause structure.
2. Click a result such as **Satisfied**. "These are the same labels used in today's TPL-59 sheet."
3. Type a note and attach any file: "Only the filename is kept. Nothing is uploaded in the prototype."
4. Click **Load sample responses (demo shortcut)** to save time.
5. Open question **8.2.3** (contract review). It's graded **Minor NC**. Click **Raise finding**.

**Point out:** the **Offline fieldwork: Planned R2** tag. "Working without internet comes in Release 2, not Release 1."

---

## Module 12 · Findings and grading

**Say this:** "A finding records what the rule requires, what the auditor actually saw, and what's wrong. AI drafts the wording and suggests how serious it is. Only the Lead Auditor decides the grade."

**Real-life example:** "A health inspector writes 'Fridge at 9°C, rule requires below 5°C.' An assistant might suggest 'minor issue', but only the senior inspector decides whether it's minor or serious enough to close the kitchen."

**Click this (guide step 13):**
1. Show the AI's draft statement and click **Accept**.
2. Click **Confirm & send to auditee** first. **It's blocked**: "You can't send it until the grade is confirmed."
3. Click **Accept grade** (Minor NC). It turns green with the Lead Auditor's name.
4. Point to **"Similar finding last time"**: "The system noticed the same problem happened in this department last year."
5. Click **Confirm & send to auditee** and show the simulated Teams card.

**Point out the grades (and the points they're worth for scoring):** Satisfied (3) · Observation (2) · Area for Improvement (2) · Minor NC (1) · Major NC (0).

---

# PHASE 4 · CLOSE AND LEARN: fix it, and check the fix worked

## Module 13 · Corrective action (CAR)

**Say this:** "When a problem is confirmed, the department manager gets a corrective action. They must stop the immediate problem, find the real root cause, and fix that cause so it doesn't happen again."

**Real-life example:** "Your car keeps getting a flat tyre. Pumping it up is the *correction*. Finding a nail stuck in it is the *root cause*. Removing the nail and patching the tyre is the *corrective action*."

**Click this (guide step 14, as Auditee):**
1. Click **Acknowledge**. "A CAR opens **automatically by rule**, and the due date (30 days) is set by the rule, not by AI."
2. Fill in **Immediate correction**.
3. Fill in **Five Whys**: "Why were quotes sent without review? Urgent deals skipped it. Why? The only approver was often travelling…"
4. Show the **AI coach (A08)** suggesting the cause category, and click **Use suggested category**.
5. Write the root cause and the action, pick a date, and click **Submit plan for review**.
6. Point to **Deadlines & escalation** on the right.

**The escalation rules (fixed, automatic):**

| When | What happens | Real-life comparison |
|---|---|---|
| 7 days before due | Reminder | Phone reminder for a bill |
| +1 day late | Owner and BU manager notified | Late-payment notice |
| +7 days late | Line manager notified | Call from the bank |
| +14 days late | Top management notified | Letter from the collections department |

**Point out:** "AI only **writes the wording** of reminders. The **rules decide the timing**. Nobody has to remember to chase."

---

## Module 14 · CAR review and verification

**Say this:** "The auditor checks the plan makes sense, then checks the fix was actually done."

**Real-life example:** "A landlord approves your plan to fix the leaking tap, then later visits to see the new tap installed."

**Click this (guide step 15):**
1. As Auditor, click **Accept plan**.
2. Switch to Auditee: attach an evidence file, enter the implementation date, and click **Submit implementation evidence**.
3. Switch back to Auditor and click **Verify implementation**.

**Point out:** the blue note on the screen. "**Done is not the same as effective.** We still check later whether it worked."

---

## Module 15 · Effectiveness check

**Say this:** "Two to three months later, we go back and check the problem hasn't come back. Today nobody does this step."

**Real-life example:** "After a dentist fills a tooth, they check at your next visit that it's holding. A filling that fell out a week later wasn't effective, even though it was done."

**Click this (guide step 16):**
1. Show the 60–90-day review window. "In the demo we skip ahead in time."
2. Show the A10 suggestion: "No recurrence found."
3. Choose **No recurrence found** and click **Effective — close CAR**.
4. Mention the other options: **Not effective** (start again with a new root cause) and **Reopen** (more action needed).

---

## Module 16 · Audit report

**Say this:** "The report builds itself from what was recorded in the audit. AI drafts only the summary paragraph. It then goes through review and approval, and is sent out and filed automatically."

**The problem today:** reports are built by hand and filed into about 19 OneDrive folders.

**Real-life example:** "A school report card. Grades come straight from the marks recorded, the teacher writes the comment, the head teacher signs it, and it's sent to parents."

**Click this (guide step 17):**
1. Click **Generate report** and scroll through the preview: details, scope, results, findings, good practices, score.
2. Try **Submit for technical review**. **It's blocked** until the AI summary is reviewed. Click **Accept** on the summary.
3. Walk the approval path: Lead Auditor submits → Q&BE technical review → Programme Manager approves → **Issue, e-sign & distribute**.
4. Show the distribution list: email, Teams, and the SharePoint folder (all simulated).

**Point out:** the compliance score in the report and its formula, which leads into the next module.

---

## Module 17 · Management dashboard and scoring

**Say this:** "Management sees live compliance across all BUs, against the 90% target, without anyone rebuilding charts in Excel."

**Real-life example:** "A football league table, updated after every match, not once a season by hand."

**Click this (guide step 18, as Senior Management):**
1. Show the headline: **93.2% vs the 90% target**. Both are real figures.
2. Walk through the four charts. "These are the same four charts management gets today, now live."
3. **Click a red bar.** "Below target. One click and we're looking at that department's details."
4. Scroll to **How compliance % is calculated** and explain the formula:

> Each checkpoint earns points: Satisfied 3, Observation or AFI 2, Minor NC 1, Major NC 0.
> **Score = points earned ÷ maximum possible points.**
>
> Real example from the BRD: 47 checkpoints → 42 Satisfied, 2 Observation/AFI, 1 Minor, 2 Major
> = (42×3) + (2×2) + (1×1) + (2×0) = **131 out of 141 = 92.9%**

5. Change a number in the calculator, for example add a Major NC, and watch the score drop. Then click **Reset**.

**Real-life comparison for the formula:** "Like a test out of 141 marks: you got 131, so 92.9%."

**Point out:** "The score is calculated by a **fixed formula**, never by AI. It's the same formula Intertec uses today, so results compare directly with past years."

---

# Supporting modules (5 minutes, pick what's relevant)

| Module | Say this | Real-life example | Where |
|---|---|---|---|
| **Auditor directory** | Who is qualified for which standard, their experience and availability | A hospital's list of which surgeons are certified for which operations | Library → Auditor directory |
| **Clause coverage** | Proves every rule gets audited in every BU over the certification cycle | A school checking every topic in the syllabus was taught | Plan → Clause coverage |
| **Overdue board** | All late actions grouped by how far they've been escalated | A library's overdue-books list, sorted by how late | Actions → Overdue board |
| **Audit trail** | Every action: who did what, and when | A bank statement for decisions; nothing can be quietly changed | Admin → Audit trail |
| **AI settings** | Each AI helper can be switched off, and the audit still works manually | Cruise control: useful, but you can always drive yourself | Admin → AI settings |
| **Teams & Outlook** | Most BU managers never need to open the app; it comes to them | Parcel tracking texts: you don't open the courier's website | Prototype guide → Teams & Outlook |

---

# Closing (3 minutes)

## The 12 AI helpers in one slide
Open **Prototype guide → AI agents (12)**.

**Say this:** "There are twelve specialised AI helpers, each like an assistant with one job. Ten of them come in Release 1. The Evidence Analyst and the Insights Copilot come in Release 2. Every one has a named person who approves its work."

**Real-life example:** "A hospital team: one assistant prepares patient files, another books appointments, another drafts discharge letters. The doctor still makes every medical decision."

## What comes when
Open **Prototype guide → Release roadmap**.

| Release | When | What |
|---|---|---|
| **R1: Audit cycle** | Go-live 26 Apr 2027 | Everything you saw today, in time for the H1-2027 audits |
| **R2: Intelligence** | 4 Oct 2027 | Offline audits, Evidence Analyst, Insights Copilot, Power BI |
| **R3: Product** | Oct–Dec 2027 | Multiple companies, Arabic interface, billing |

## The closing line

> *"Today, audits are spread across spreadsheets, and things get missed. With Compliance AI there's one record from plan to closure. AI does the drafting, rules handle the deadlines and scores, and people make every decision, with their name on it."*

---

# Quick answers to common questions

| Question | Answer |
|---|---|
| "Will AI replace auditors?" | No. It drafts; auditors decide. Every AI output needs a named person's approval. |
| "What if AI gets it wrong?" | A person reviews everything, clause references are checked automatically, and wrong items are flagged, not hidden. |
| "Is our data safe?" | Production design: hosted in Azure UAE, personal data removed before any AI call, customer data never used to train AI. |
| "Can someone change a record secretly?" | No. Every change is in the audit trail with name and time. |
| "Do BU managers need training?" | Very little. Most of it reaches them as Teams messages and Outlook invites. |
| "Is this the real system?" | No. It's a prototype to agree how it should work. Integrations and AI are simulated. |
| "Are these numbers real?" | Only those with a green **Source-stated** tag (e.g. 93.2%, 90% target, 19 BUs). The rest are illustrative. |

---

# Presenter tips

- **Show only what you say.** Don't scroll around while explaining; let people read.
- **Name the colour every time:** "blue dashed, AI draft… now green, approved by a person."
- **Let the blocks happen.** When a button refuses (approve before review, send before grading), pause and say *"See, it won't let me skip the human check."* These moments convince people most.
- **Reuse the restaurant story** whenever someone looks lost.
- **If something goes wrong:** user menu → **Reset demo data**, then **All steps** in the guide bar to jump back to any step.
