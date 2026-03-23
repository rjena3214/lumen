# lumen
Live Unified Machine for Executing Nodes
# 💡 LUMEN — Live Unified Machine for Executing Nodes

> A production-grade AI automation node platform powered by Claude Sonnet. Execute 10 purpose-built intelligence nodes for real business problems — with a built-in Security Admin Console that validates every request in real time.

![Security](https://img.shields.io/badge/Security-8%20Checks%20Per%20Execution-00FFB2?style=flat-square&logo=shield)
![Nodes](https://img.shields.io/badge/Nodes-10%20Live-7C6EFF?style=flat-square)
![Model](https://img.shields.io/badge/Model-Claude%20Sonnet-FF6B6B?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-FFD700?style=flat-square)
![Version](https://img.shields.io/badge/Version-1.0.0-06B6D4?style=flat-square)

---

## What is LUMEN?

**LUMEN** is a live AI node execution platform. Each "node" is a purpose-built AI automation that processes your real input and returns structured, actionable output — powered by Claude Sonnet and protected by an 8-check security engine on every call.

```
INPUT → [LUMEN SECURITY SCAN] → [CLAUDE SONNET] → [LUMEN SECURITY SCAN] → OUTPUT
```

---

## 🔵 The 10 Execution Nodes

| Node | Category | What It Solves |
|------|----------|----------------|
| 📧 **Email Triage Node** | Communication | Scores urgency, categorizes, drafts priority replies |
| 📝 **Meeting Notes Node** | Productivity | Raw transcripts → summary, decisions, action items |
| 🐛 **Bug Triage Node** | Engineering | Vague reports → P0–P3 severity, root cause, ticket |
| 📱 **Social Content Node** | Marketing | One brief → Twitter, LinkedIn & Instagram posts |
| 🔍 **Code Review Node** | Engineering | Security audit + performance + refactored code |
| 💬 **Feedback Intel Node** | Product | Reviews → NPS, themes, roadmap priorities |
| 🤝 **Sales Intel Node** | Sales | Pre-call battle card with objection handlers |
| 📄 **Contract Clarity Node** | Legal | Legalese → plain English + risk level + negotiation tips |
| 📊 **Data Narrative Node** | Analytics | Raw metrics → executive story + recommended actions |
| 🎓 **Learning Path Node** | Education | Goal → personalized 30-day plan with resources |

---

## 🛡️ Security Admin Console

Every node execution is validated by **8 real-time security checks** — both before the request is sent to Claude and after the response is received.

### The 8 Checks

| # | Check | Type | Trigger |
|---|-------|------|---------|
| 1 | 🧹 Input Sanitization | Warn | XSS, SQL injection, path traversal, oversized input |
| 2 | 💉 Prompt Injection Guard | **Hard Block** | Instruction overrides, persona hijacks, LLM tokens |
| 3 | 🔑 API Key Exposure | Warn | Anthropic, GitHub, Bearer tokens in input |
| 4 | 👤 PII Detection | Warn | SSNs, credit cards, email addresses, phone numbers |
| 5 | 📏 Response Size Guard | Warn | Responses exceeding 8,000 characters |
| 6 | ⏱️ Rate Limit Compliance | Warn | >10 calls/minute or 3+ consecutive errors |
| 7 | 🔐 Node Permission Scope | Warn | Missing node ID binding or runtime prompt modification |
| 8 | 🛡️ Content Policy Filter | **Hard Block** | Policy-violating content patterns |

### Dual-Phase Architecture

```
PHASE 1 (Pre-Call)          PHASE 2 (Post-Call)
─────────────────           ──────────────────
✓ Input Sanitization        ✓ Response Size Guard
✓ Prompt Injection Guard    ✓ Output Credential Scan
✓ API Key Exposure
✓ PII Detection
✓ Rate Limit Check
✓ Node Permission Scope
✓ Content Policy Filter
```

### Security Scoring

| Score | Status | Meaning |
|-------|--------|---------|
| 100% | 🟢 Secure | All checks passed |
| 75–99% | 🟡 Caution | Non-critical warnings |
| <75% | 🔴 At Risk | Critical failures present |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A Claude.ai account (to run within the artifacts environment)

### Run Locally

```bash
git clone https://github.com/rjena3214/lumen.git
cd lumen
npm install
npm run dev
```

Open `http://localhost:5173`

### Build for Production

```bash
npm run build
# Output in dist/
```

### Deploy to Vercel

```bash
npm i -g vercel
vercel --prod
```

### Deploy to Netlify

Drag the `dist/` folder to [netlify.com/drop](https://netlify.com/drop)

---

## 📁 Project Structure

```
lumen/
├── src/
│   └── Lumen.jsx              # Core platform — all 10 nodes + security engine
├── docs/
│   └── NODES.md               # Detailed documentation for each node
├── security/
│   └── SECURITY.md            # Security policy, threat model, disclosure process
├── README.md                  # This file
├── package.json               # React + Vite
└── .gitignore
```

---

## ⚙️ Self-Hosting with Your Own API Key

When running outside Claude.ai, pass your Anthropic key in the fetch headers inside `Lumen.jsx`:

```javascript
headers: {
  "Content-Type": "application/json",
  "x-api-key": import.meta.env.VITE_ANTHROPIC_API_KEY,
  "anthropic-version": "2023-06-01",
}
```

Create a `.env` file in the project root:

```env
VITE_ANTHROPIC_API_KEY=sk-ant-your-key-here
```

> ⚠️ **Never commit your API key.** `.env` is excluded by `.gitignore`.

---

## 🧩 Adding a Custom Node

Edit `NODES` in `src/Lumen.jsx`:

```javascript
{
  id: 11,
  icon: "🆕",
  name: "My Custom Node",
  category: "Custom",
  color: "#FF6B6B",
  problem: "The problem this node solves",
  solution: "What the output looks like",
  sampleInput: `Paste example input data here`,
  systemPrompt: `You are a [role] Node in the LUMEN system.\n## SECTION 1\n## SECTION 2`,
}
```

Security scanning, audit logging, and the UI all work automatically for new nodes.

---

## 📊 Output Format

All nodes are prompted to produce `##` section headers. The UI renders these in the node's accent color using Syne display font, with body content in Space Mono for a clean terminal-style aesthetic.

---

## 🔒 Security Notes

- No credentials are stored client-side
- Prompt injection is blocked before any API call
- All executions generate an audit log entry
- Rate limiting is monitored per session
- API keys are never included in requests from the artifact environment

See [`security/SECURITY.md`](./security/SECURITY.md) for the full threat model.

---

## 🤝 Contributing

```bash
git checkout -b feat/node-name
git commit -m "feat: add [node name] node"
git push origin feat/node-name
# Open a Pull Request
```

---

## 📄 License

MIT © 2024 LUMEN Contributors

---

## ⚡ Tech Stack

| Layer | Technology |
|-------|-----------|
| AI Model | Claude Sonnet (`claude-sonnet-4-20250514`) |
| API | Anthropic Messages API |
| UI Framework | React 18 |
| Typography | Syne (display) + Space Mono (code) |
| Bundler | Vite 5 |
| Deployment | Vercel / Netlify |
