# 🔵 LUMEN Node Reference

Detailed documentation for all 10 execution nodes in LUMEN.

---

## Node #01 — 📧 Email Triage Node
**Category:** Communication  
**Accent:** `#00FFB2`

### Problem
Professionals lose hours triaging inboxes. Critical messages get buried under newsletters and low-priority threads.

### Input Format
Paste a list of emails in any format — `From: Name <email> — "Subject or snippet"` works well.

### Output Sections
- `## 📊 URGENCY SCORES` — Each email scored 1–5
- `## 🏷️ CATEGORIES` — CRITICAL / ACTION / REPLY / INFO / IGNORE
- `## 📬 SORTED BY PRIORITY` — Ranked list
- `## ✍️ DRAFT REPLY` — Professional reply for #1 priority

### Best For
Executives, customer success teams, operations managers, executive assistants.

---

## Node #02 — 📝 Meeting Notes Node
**Category:** Productivity  
**Accent:** `#FFD700`

### Problem
Raw transcripts are long and unstructured. Action items get lost. Nobody reads them.

### Input Format
Paste raw meeting transcript — speaker names, timestamps optional but helpful.

### Output Sections
- `## 📋 MEETING SUMMARY` — 2–3 sentences
- `## ✅ KEY DECISIONS` — Bulleted decisions made
- `## 🎯 ACTION ITEMS` — Owner + deadline per item
- `## 📅 NEXT STEPS` — What happens next
- `## 📨 FOLLOW-UP EMAIL DRAFT` — Ready to send

### Best For
Project managers, team leads, executive assistants, anyone running recurring syncs.

---

## Node #03 — 🐛 Bug Triage Node
**Category:** Engineering  
**Accent:** `#FF6B6B`

### Problem
Bug reports arrive vague, mislabeled, and without reproduction steps. Engineering wastes time triaging.

### Input Format
Paste the bug report as written — the messier the better. Include any context: platform, timing, affected %, recent deployments.

### Output Sections
- `## 🔴 SEVERITY LEVEL` — P0/P1/P2/P3 with justification
- `## 🔍 ROOT CAUSE HYPOTHESIS` — What likely broke
- `## 📱 AFFECTED SCOPE` — Who, what, where
- `## 🔬 REPRODUCTION STEPS` — Step-by-step
- `## ⚡ IMMEDIATE MITIGATION` — What to do right now
- `## 🛠️ SUGGESTED FIX` — Technical approach
- `## ⏱️ EFFORT ESTIMATE` — In hours
- `## 📋 STRUCTURED TICKET` — Title + description ready to paste

### Best For
Engineering leads, QA teams, DevOps engineers, on-call engineers.

---

## Node #04 — 📱 Social Content Node
**Category:** Marketing  
**Accent:** `#A78BFA`

### Problem
Each platform needs different tone, length, and format. Creating content from scratch for all three is slow.

### Input Format
Describe your product or message: name, key benefit, proof point, price, target audience.

### Output Sections
- `## 🐦 TWITTER/X POST` — ≤280 chars, punchy, 1–2 hashtags
- `## 💼 LINKEDIN POST` — Professional, 150–200 words, story-driven
- `## 📸 INSTAGRAM CAPTION` — Emotional, lifestyle, 5+ hashtags, CTA
- `## 📧 EMAIL SUBJECT LINE` — For a launch or announcement email
- `## 🎯 KEY MESSAGE PILLARS` — 3 consistency anchors

### Best For
Marketers, founders, content creators, social media managers.

---

## Node #05 — 🔍 Code Review Node
**Category:** Engineering  
**Accent:** `#34D399`

### Problem
Reviews are inconsistent. Junior engineers miss security issues. Senior engineers are too busy.

### Input Format
Paste any code snippet in any language. Works best with 10–100 lines.

### Output Sections
- `## 🚨 CRITICAL ISSUES` — Must fix before shipping
- `## ⚠️ SECURITY VULNERABILITIES` — With CVE references where applicable
- `## 🐌 PERFORMANCE ISSUES` — Inefficiencies and bottlenecks
- `## 🎨 CODE QUALITY & STYLE` — Readability, naming, structure
- `## ✅ WHAT'S GOOD` — Positive reinforcement
- `## 🔧 REFACTORED CODE` — Improved version
- `## 📊 OVERALL SCORE: X/10`

### Best For
Engineering teams, solo developers, code reviewers, bootcamp students.

---

## Node #06 — 💬 Feedback Intel Node
**Category:** Product  
**Accent:** `#F97316`

### Problem
Hundreds of reviews go unread. Product teams make decisions based on intuition instead of data.

### Input Format
Paste customer reviews in any format — star rating optional but helpful.

### Output Sections
- `## 📊 SENTIMENT BREAKDOWN` — % positive / neutral / negative
- `## 🏆 TOP PRAISED FEATURES` — What users love
- `## 🚑 TOP PAIN POINTS` — Ranked by frequency
- `## 💡 PRODUCT IMPROVEMENT PRIORITIES` — Top 5 with business impact
- `## 🎯 SUPPORT ISSUES` — Immediate fixes
- `## 📣 BEST MARKETING QUOTE` — Pull quote from reviews
- `## 📈 ESTIMATED NPS SCORE` — With reasoning
- `## 🗺️ RECOMMENDED ROADMAP CHANGES`

### Best For
Product managers, founders, customer success leads, UX researchers.

---

## Node #07 — 🤝 Sales Intel Node
**Category:** Sales  
**Accent:** `#06B6D4`

### Problem
Reps go into discovery calls without knowing the prospect's likely pain points, objections, or what success looks like.

### Input Format
Describe the prospect: company, industry, size, your product, meeting type, contact role, any context.

### Output Sections
- `## 🏢 PROSPECT PROFILE` — 3-bullet company snapshot
- `## 😤 LIKELY PAIN POINTS` — Based on their profile
- `## 💰 BUSINESS CASE` — ROI framing specific to them
- `## 🎯 OPENING HOOK` — First 30 seconds of the call
- `## ❓ DISCOVERY QUESTIONS` — 5 questions to ask
- `## 🛡️ OBJECTION HANDLERS` — Top 3 objections + responses
- `## 🚩 RED FLAGS` — Watch for these
- `## ✅ MEETING SUCCESS CRITERIA` — What a win looks like

### Best For
Account executives, SDRs, founders doing sales, account managers.

---

## Node #08 — 📄 Contract Clarity Node
**Category:** Legal  
**Accent:** `#EC4899`

### Problem
Dense legal language obscures what you're actually agreeing to. Risky clauses get missed.

### Input Format
Paste one or more contract clauses. Works on any contract type.

### Output Per Clause
- `## 📌 PLAIN ENGLISH SUMMARY`
- `## 🚦 RISK LEVEL: GREEN / YELLOW / RED`
- `## ⚠️ WHAT YOU'RE ACTUALLY AGREEING TO`
- `## 💡 NEGOTIATION TIP`

### Summary Output
- `## 📊 OVERALL CONTRACT RISK SCORE`
- `## 🎯 TOP 3 THINGS TO NEGOTIATE`

### Best For
Founders signing vendor contracts, freelancers, anyone without a lawyer on speed dial.

> ⚠️ This node provides informational analysis only — not legal advice. Consult a licensed attorney for binding decisions.

---

## Node #09 — 📊 Data Narrative Node
**Category:** Analytics  
**Accent:** `#84CC16`

### Problem
Metrics live in dashboards. Nobody writes the story. Leaders don't know what action to take.

### Input Format
Paste any set of metrics — weekly/monthly KPIs, growth numbers, engagement data. Trend indicators (`↑`, `↓`) are helpful.

### Output Sections
- `## 📖 THE STORY` — 3-sentence executive narrative
- `## 🚨 CRITICAL SIGNALS` — What needs attention now
- `## 📈 BRIGHT SPOTS` — What's working
- `## 🔗 CONNECTED DOTS` — How metrics relate to each other
- `## 🔍 ROOT CAUSE HYPOTHESES` — What might explain the patterns
- `## 🎯 RECOMMENDED ACTIONS` — Prioritized, with owners
- `## 📅 WHAT TO WATCH NEXT WEEK`

### Best For
CEOs, heads of growth, data analysts presenting to leadership, BI teams.

---

## Node #10 — 🎓 Learning Path Node
**Category:** Education  
**Accent:** `#F59E0B`

### Problem
People know what they want to learn but not how to start, what to skip, or how to stay on track.

### Input Format
Describe your goal, current level, available time per day, learning style preference, and any deadline.

### Output Sections
- `## 🎯 GOAL ANALYSIS & REALITY CHECK` — Achievable? Adjusted scope if needed
- `## 📊 SKILL GAP MAP` — What to learn and in what order
- `## 🗓️ 30-DAY ROADMAP` — Week-by-week breakdown
- `## 📚 CURATED RESOURCES` — Specific courses, books, tutorials
- `## 💻 HANDS-ON PROJECTS` — 3 projects from beginner to goal
- `## ⚡ DAILY PRACTICE PROMPTS` — Sample exercises for week 1
- `## 🏁 MILESTONES & SUCCESS METRICS` — How to know you're on track
- `## ⚠️ COMMON PITFALLS TO AVOID`

### Best For
Developers upskilling, career changers, self-learners, bootcamp graduates.
