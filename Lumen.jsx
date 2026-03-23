import { useState, useEffect, useRef } from "react";

// ─────────────────────────────────────────────
// LUMEN — Live Unified Machine for Executing Nodes
// Security Engine v1.0
// ─────────────────────────────────────────────
const SECURITY_CHECKS = {
  inputSanitization: {
    label: "Input Sanitization",
    icon: "🧹",
    test: (input) => {
      const threats = [];
      if (/<script/i.test(input)) threats.push("XSS script tag detected");
      if (/javascript:/i.test(input)) threats.push("JS protocol injection");
      if (/on\w+\s*=/i.test(input)) threats.push("Event handler injection");
      if (/\bDROP\b|\bDELETE\b|\bINSERT\b|\bUPDATE\b/i.test(input)) threats.push("SQL keyword detected");
      if (/\.\.\//g.test(input)) threats.push("Path traversal attempt");
      if (input.length > 10000) threats.push("Input exceeds safe length (10k chars)");
      return { pass: threats.length === 0, threats };
    },
  },
  promptInjection: {
    label: "Prompt Injection Guard",
    icon: "💉",
    test: (input) => {
      const threats = [];
      const patterns = [
        [/ignore (previous|above|all) instructions/i, "Instruction override attempt"],
        [/you are now|pretend to be|act as if you are/i, "Persona hijack attempt"],
        [/system prompt|jailbreak|DAN mode/i, "System prompt extraction"],
        [/repeat after me|say exactly/i, "Forced output injection"],
        [/\[INST\]|\[\/INST\]|<\|im_start\|>/i, "LLM token injection"],
      ];
      patterns.forEach(([re, msg]) => { if (re.test(input)) threats.push(msg); });
      return { pass: threats.length === 0, threats };
    },
  },
  apiKeyExposure: {
    label: "API Key Exposure",
    icon: "🔑",
    test: (input) => {
      const threats = [];
      if (/sk-[a-zA-Z0-9]{20,}/i.test(input)) threats.push("Anthropic API key pattern found");
      if (/api[_-]?key\s*[:=]\s*['"]\S+['"]/i.test(input)) threats.push("API key assignment detected");
      if (/bearer\s+[a-zA-Z0-9\-._~+/]+=*/i.test(input)) threats.push("Bearer token in input");
      if (/ghp_[a-zA-Z0-9]{36}/i.test(input)) threats.push("GitHub token pattern found");
      return { pass: threats.length === 0, threats };
    },
  },
  piiDetection: {
    label: "PII Detection",
    icon: "👤",
    test: (input) => {
      const threats = [];
      if (/\b\d{3}-\d{2}-\d{4}\b/.test(input)) threats.push("Social Security Number pattern");
      if (/\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/.test(input)) threats.push("Credit card number pattern");
      if (/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(input)) threats.push("Email address detected (review needed)");
      if (/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/.test(input)) threats.push("Phone number detected");
      return { pass: threats.length === 0, threats, severity: "warn" };
    },
  },
  outputLength: {
    label: "Response Size Guard",
    icon: "📏",
    test: (_, output) => {
      const threats = [];
      if (output && output.length > 8000) threats.push("Response exceeds 8k chars — review for data exfiltration");
      if (output && (output.match(/sk-/g) || []).length > 0) threats.push("API key pattern in output");
      return { pass: threats.length === 0, threats };
    },
  },
  rateLimitCheck: {
    label: "Rate Limit Compliance",
    icon: "⏱️",
    test: (_, __, meta) => {
      const threats = [];
      if (meta?.callsLastMinute > 10) threats.push(`High call rate: ${meta.callsLastMinute} calls/min`);
      if (meta?.consecutiveErrors > 3) threats.push(`${meta.consecutiveErrors} consecutive errors`);
      return { pass: threats.length === 0, threats };
    },
  },
  nodePermissions: {
    label: "Node Permission Scope",
    icon: "🔐",
    test: (_, __, meta) => {
      const threats = [];
      if (!meta?.nodeId) threats.push("No node ID bound to request");
      if (meta?.systemPromptModified) threats.push("System prompt was modified at runtime");
      return { pass: threats.length === 0, threats };
    },
  },
  contentPolicy: {
    label: "Content Policy Filter",
    icon: "🛡️",
    test: (input) => {
      const threats = [];
      const blocked = [/\bhow to (make|build) (bomb|weapon|malware)/i, /\bhack into\b/i, /child.{0,10}(explicit|abuse)/i];
      blocked.forEach((re) => { if (re.test(input)) threats.push("Policy violation: blocked content pattern"); });
      return { pass: threats.length === 0, threats };
    },
  },
};

function runSecurityScan(input = "", output = "", meta = {}) {
  const results = {};
  let totalPassed = 0;
  let totalFailed = 0;
  Object.entries(SECURITY_CHECKS).forEach(([key, check]) => {
    const result = check.test(input, output, meta);
    results[key] = { ...check, ...result };
    if (result.pass) totalPassed++; else totalFailed++;
  });
  return { results, totalPassed, totalFailed, score: Math.round((totalPassed / Object.keys(SECURITY_CHECKS).length) * 100) };
}

// ─────────────────────────────────────────────
// LUMEN NODE DEFINITIONS (formerly Agents)
// ─────────────────────────────────────────────
const NODES = [
  { id: 1, icon: "📧", name: "Email Triage Node", category: "Communication", color: "#00FFB2",
    problem: "Drowning in unread emails with no idea what needs urgent attention.",
    solution: "Scores urgency 1–5, categorizes each email, and drafts a reply for top priority.",
    sampleInput: `From: CEO <ceo@company.com> — "Need the Q3 report ASAP before board meeting tomorrow 9am"\nFrom: Newsletter <no-reply@medium.com> — "Top 10 AI articles this week"\nFrom: Client <sarah@bigcorp.com> — "Invoice #1042 is 2 weeks overdue, please advise"\nFrom: HR <hr@company.com> — "Reminder: submit timesheets by Friday"\nFrom: Dev Team <dev@company.com> — "Production server is DOWN — all hands needed NOW"`,
    systemPrompt: `You are an expert Email Triage Node in the LUMEN system. Analyze the provided emails and:\n1. Score each email urgency 1-5 (5=critical)\n2. Categorize: [CRITICAL / ACTION / REPLY / INFO / IGNORE]\n3. Sort by urgency\n4. Draft a professional reply for the #1 most urgent email\n\nFormat your response with clear sections using emojis and structured output.` },
  { id: 2, icon: "📝", name: "Meeting Notes Node", category: "Productivity", color: "#FFD700",
    problem: "Raw meeting transcripts are messy, long, and nobody reads them.",
    solution: "Transforms notes into summary, key decisions, action items, and follow-up email.",
    sampleInput: `Team sync - March 22\nJohn: the landing page redesign - design said maybe 2 weeks?\nSarah: I think 3 weeks realistically, we need dev time too\nJohn: ok 3 weeks. Finance approved $15k for the project\nMark: I'll own vendor selection by end of week\nSarah: I'll send the design brief today\nJohn: who's doing the A/B test?\nMark: I can but need the brief first\nJohn: let's sync again next Friday`,
    systemPrompt: `You are a Meeting Notes Node in the LUMEN system. Transform raw notes into:\n## 📋 MEETING SUMMARY\n## ✅ KEY DECISIONS\n## 🎯 ACTION ITEMS (owner + deadline)\n## 📅 NEXT STEPS\n## 📨 FOLLOW-UP EMAIL DRAFT` },
  { id: 3, icon: "🐛", name: "Bug Triage Node", category: "Engineering", color: "#FF6B6B",
    problem: "Bug reports come in with no context, wrong severity, and no suggested fix.",
    solution: "Classifies severity, identifies root cause, estimates effort, generates structured ticket.",
    sampleInput: `Bug: Users can't log in since this morning. White screen on mobile. Deployed new auth update last night at 11pm. ~30% of users affected. Revenue impacted. Chrome works fine, Safari is broken.`,
    systemPrompt: `You are a senior engineering Bug Triage Node in the LUMEN system. Produce:\n## 🔴 SEVERITY LEVEL: [P0/P1/P2/P3]\n## 🔍 ROOT CAUSE HYPOTHESIS\n## 📱 AFFECTED SCOPE\n## 🔬 REPRODUCTION STEPS\n## ⚡ IMMEDIATE MITIGATION\n## 🛠️ SUGGESTED FIX\n## ⏱️ EFFORT ESTIMATE\n## 📋 STRUCTURED TICKET` },
  { id: 4, icon: "📱", name: "Social Content Node", category: "Marketing", color: "#A78BFA",
    problem: "Creating platform-specific social content is time-consuming and inconsistent.",
    solution: "One brief → optimized posts for Twitter/X, LinkedIn, and Instagram.",
    sampleInput: `Product: FlowDesk - AI-powered project management that auto-assigns tasks based on workload and skills. Reduced overhead by 40% in beta. Price: $29/month. Target: startup founders and small team leads.`,
    systemPrompt: `You are a Social Media Content Node in the LUMEN system. Create:\n## 🐦 TWITTER/X POST (max 280 chars)\n## 💼 LINKEDIN POST (professional, 150-200 words)\n## 📸 INSTAGRAM CAPTION (emotional, 5+ hashtags)\n## 📧 EMAIL SUBJECT LINE\n## 🎯 KEY MESSAGE PILLARS` },
  { id: 5, icon: "🔍", name: "Code Review Node", category: "Engineering", color: "#34D399",
    problem: "Code reviews are slow, inconsistent, and miss security/performance issues.",
    solution: "Reviews for bugs, security vulnerabilities, performance issues with line-specific feedback.",
    sampleInput: `def get_user(user_id):\n    import sqlite3\n    conn = sqlite3.connect('users.db')\n    cursor = conn.cursor()\n    query = "SELECT * FROM users WHERE id = " + user_id\n    cursor.execute(query)\n    return cursor.fetchall()\n\ndef process_payment(amount, card):\n    print("Card: " + card)\n    # TODO: add validation\n    return True`,
    systemPrompt: `You are a senior Code Review Node in the LUMEN system. Produce:\n## 🚨 CRITICAL ISSUES\n## ⚠️ SECURITY VULNERABILITIES\n## 🐌 PERFORMANCE ISSUES\n## 🎨 CODE QUALITY\n## ✅ WHAT'S GOOD\n## 🔧 REFACTORED CODE\n## 📊 OVERALL SCORE: X/10` },
  { id: 6, icon: "💬", name: "Feedback Intel Node", category: "Product", color: "#F97316",
    problem: "Hundreds of customer reviews go unread and decisions are made without real data.",
    solution: "Extracts themes, sentiment, NPS signals, and prioritized product improvements.",
    sampleInput: `Review 1 (3⭐): "Mobile app crashes on export. Desktop is fine."\nReview 2 (5⭐): "Saves me 2 hours a day. AI suggestions are spot on."\nReview 3 (1⭐): "Terrible support. Waited 5 days on a billing issue."\nReview 4 (4⭐): "Powerful but steep learning curve. Need better onboarding."\nReview 5 (5⭐): "Slack + Notion integrations are amazing. Game changer."`,
    systemPrompt: `You are a Feedback Intelligence Node in the LUMEN system. Produce:\n## 📊 SENTIMENT BREAKDOWN\n## 🏆 TOP PRAISED FEATURES\n## 🚑 TOP PAIN POINTS\n## 💡 PRODUCT IMPROVEMENT PRIORITIES\n## 📈 ESTIMATED NPS SCORE\n## 🗺️ RECOMMENDED ROADMAP CHANGES` },
  { id: 7, icon: "🤝", name: "Sales Intel Node", category: "Sales", color: "#06B6D4",
    problem: "Sales reps go into calls unprepared, missing key info about the prospect.",
    solution: "Generates a battle card: profile, pain points, talking points, objection handlers.",
    sampleInput: `Prospect: Acme Corp, E-commerce, ~500 employees\nProduct: FlowDesk AI project management ($29/mo per seat)\nMeeting: First discovery call, 30 min\nContact: VP of Operations, joined 6 months ago\nContext: Recently expanded dev team from 5 to 20 engineers`,
    systemPrompt: `You are a Sales Intelligence Node in the LUMEN system. Create a pre-call battle card:\n## 🏢 PROSPECT PROFILE\n## 😤 LIKELY PAIN POINTS\n## 💰 BUSINESS CASE\n## 🎯 OPENING HOOK\n## ❓ DISCOVERY QUESTIONS\n## 🛡️ OBJECTION HANDLERS\n## ✅ MEETING SUCCESS CRITERIA` },
  { id: 8, icon: "📄", name: "Contract Clarity Node", category: "Legal", color: "#EC4899",
    problem: "Nobody reads contracts because of dense legal language and hidden risks.",
    solution: "Translates clauses into plain English, flags risks, shows what you're agreeing to.",
    sampleInput: `CLAUSE 7.3: Licensor reserves the right to terminate immediately if Licensee materially breaches any provision and fails to cure within 30 days of written notice, or becomes insolvent.\n\nCLAUSE 12.1: Licensee grants Licensor a perpetual, irrevocable, worldwide, royalty-free license to use any feedback or improvements provided.\n\nCLAUSE 15.2: IN NO EVENT SHALL LICENSOR BE LIABLE FOR ANY INDIRECT OR CONSEQUENTIAL DAMAGES.`,
    systemPrompt: `You are a Contract Clarity Node in the LUMEN system. For each clause:\n## 📌 PLAIN ENGLISH SUMMARY\n## 🚦 RISK LEVEL: [GREEN/YELLOW/RED]\n## ⚠️ WHAT YOU'RE ACTUALLY AGREEING TO\n## 💡 NEGOTIATION TIP\n\nEnd with:\n## 📊 OVERALL RISK SCORE\n## 🎯 TOP 3 THINGS TO NEGOTIATE` },
  { id: 9, icon: "📊", name: "Data Narrative Node", category: "Analytics", color: "#84CC16",
    problem: "Raw metrics sit in dashboards with no narrative — leaders don't know what to do.",
    solution: "Transforms numbers into a story with insights, anomalies, and recommended actions.",
    sampleInput: `Weekly SaaS Metrics:\n- New signups: 234 (↓18% vs last week)\n- Trial-to-paid conversion: 12.3% (↑2.1%)\n- MRR: $48,200 (↑3% vs last month)\n- Churn rate: 4.2% (↑1.8% — highest in 6 months)\n- Support tickets: 312 (↑45%)\n- NPS score: 32 (↓8 points vs last quarter)\n- Page load time: 4.2s (was 1.8s last week)`,
    systemPrompt: `You are a Data Narrative Node in the LUMEN system. Transform metrics into:\n## 📖 THE STORY (executive summary)\n## 🚨 CRITICAL SIGNALS\n## 📈 BRIGHT SPOTS\n## 🔗 CONNECTED DOTS\n## 🔍 ROOT CAUSE HYPOTHESES\n## 🎯 RECOMMENDED ACTIONS\n## 📅 WHAT TO WATCH NEXT WEEK` },
  { id: 10, icon: "🎓", name: "Learning Path Node", category: "Education", color: "#F59E0B",
    problem: "People want to learn new skills but don't know where to start.",
    solution: "Generates a personalized 30-day plan with resources, milestones, and daily prompts.",
    sampleInput: `Goal: Learn ML well enough to deploy a model at work\nLevel: Python dev (3 years), comfortable with numpy/pandas, zero ML knowledge\nTime: 1 hour/day, weekdays only\nStyle: Hands-on projects preferred, but need enough theory\nDeadline: Work project in 6 weeks`,
    systemPrompt: `You are a Learning Path Node in the LUMEN system. Create:\n## 🎯 GOAL ANALYSIS & REALITY CHECK\n## 📊 SKILL GAP MAP\n## 🗓️ 30-DAY ROADMAP (week-by-week)\n## 📚 CURATED RESOURCES\n## 💻 HANDS-ON PROJECTS\n## ⚡ DAILY PRACTICE PROMPTS\n## 🏁 MILESTONES & SUCCESS METRICS\n## ⚠️ COMMON PITFALLS` },
];

// ─────────────────────────────────────────────
// LUMEN — MAIN COMPONENT
// ─────────────────────────────────────────────
export default function Lumen() {
  const [view, setView] = useState("hub");
  const [selectedNode, setSelectedNode] = useState(null);
  const [running, setRunning] = useState(false);
  const [output, setOutput] = useState("");
  const [customInput, setCustomInput] = useState("");
  const [activeTab, setActiveTab] = useState("input");
  const [completedNodes, setCompletedNodes] = useState(new Set());
  const [securityLog, setSecurityLog] = useState([]);
  const [callMeta, setCallMeta] = useState({ callsLastMinute: 0, consecutiveErrors: 0 });
  const callTimestamps = useRef([]);

  const selectNode = (node) => {
    setSelectedNode(node);
    setCustomInput(node.sampleInput);
    setOutput("");
    setActiveTab("input");
    setView("node");
  };

  const runNode = async () => {
    if (!selectedNode || running) return;

    const pre = runSecurityScan(customInput, "", {
      nodeId: selectedNode.id,
      systemPromptModified: false,
      callsLastMinute: callTimestamps.current.filter(t => Date.now() - t < 60000).length,
      consecutiveErrors: callMeta.consecutiveErrors,
    });

    const logEntry = {
      id: Date.now(),
      nodeId: selectedNode.id,
      nodeName: selectedNode.name,
      timestamp: new Date().toISOString(),
      phase: "pre-call",
      score: pre.score,
      results: pre.results,
      passed: pre.totalPassed,
      failed: pre.totalFailed,
      inputSnippet: customInput.slice(0, 80) + "...",
    };

    if (pre.totalFailed > 0) {
      const critical = Object.values(pre.results).filter(r => !r.pass && r.threats.length);
      const criticalKeys = critical.map(r => r.label).join(", ");
      if (pre.results.promptInjection && !pre.results.promptInjection.pass) {
        setSecurityLog(prev => [{ ...logEntry, blocked: true }, ...prev]);
        setOutput(`🚫 BLOCKED BY LUMEN SECURITY\n\nFailed checks: ${criticalKeys}\n\nThreats detected:\n${critical.flatMap(r => r.threats).map(t => "  • " + t).join("\n")}\n\nRequest was not forwarded to the AI model.`);
        setActiveTab("output");
        return;
      }
    }

    setSecurityLog(prev => [logEntry, ...prev]);
    setRunning(true);
    setOutput("");
    setActiveTab("output");
    callTimestamps.current.push(Date.now());

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: selectedNode.systemPrompt,
          messages: [{ role: "user", content: customInput }],
        }),
      });
      const data = await response.json();
      const text = data.content?.map(b => b.text || "").join("") || "No response.";

      const post = runSecurityScan(customInput, text, { nodeId: selectedNode.id });
      setSecurityLog(prev => [{
        id: Date.now() + 1,
        nodeId: selectedNode.id,
        nodeName: selectedNode.name,
        timestamp: new Date().toISOString(),
        phase: "post-call",
        score: post.score,
        results: post.results,
        passed: post.totalPassed,
        failed: post.totalFailed,
      }, ...prev]);

      setOutput(text);
      setCallMeta(m => ({ ...m, consecutiveErrors: 0 }));
      setCompletedNodes(prev => new Set([...prev, selectedNode.id]));
    } catch (err) {
      setOutput(`⚠️ Error: ${err.message}`);
      setCallMeta(m => ({ ...m, consecutiveErrors: m.consecutiveErrors + 1 }));
    } finally {
      setRunning(false);
    }
  };

  const S = {
    bg: "#06060F",
    surface: "#0c0c1c",
    border: "#16163a",
    text: "#d0d0e8",
    muted: "#3a3a5a",
    font: "'Space Mono', monospace",
    fontDisplay: "'Syne', sans-serif",
    accent: "#7C6EFF",
  };

  const securityScore = securityLog.length
    ? Math.round(securityLog.reduce((a, l) => a + l.score, 0) / securityLog.length)
    : 100;

  return (
    <div style={{ fontFamily: S.font, background: S.bg, minHeight: "100vh", color: S.text }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #2a2a50; border-radius: 2px; }
        .lumen-card { transition: all 0.18s ease; cursor: pointer; }
        .lumen-card:hover { transform: translateY(-3px); box-shadow: 0 8px 32px rgba(124,110,255,0.12); }
        .lumen-btn { transition: all 0.15s ease; cursor: pointer; border: none; outline: none; }
        .lumen-btn:hover:not(:disabled) { filter: brightness(1.15); transform: translateY(-1px); }
        .lumen-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .pulse { animation: lumen-pulse 1.4s ease-in-out infinite; }
        @keyframes lumen-pulse { 0%,100%{opacity:1} 50%{opacity:0.2} }
        .fadein { animation: lumen-fade 0.3s ease; }
        @keyframes lumen-fade { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }
        textarea { resize: vertical; }
        .nav-item { transition: all 0.15s; cursor: pointer; border: none; outline: none; }
        .lumen-glow { box-shadow: 0 0 24px rgba(124,110,255,0.15); }
      `}</style>

      {/* ── TOP NAV ── */}
      <nav style={{
        borderBottom: `1px solid ${S.border}`,
        padding: "14px 28px",
        display: "flex",
        alignItems: "center",
        gap: 20,
        background: S.surface,
        position: "sticky",
        top: 0,
        zIndex: 200,
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginRight: 12 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 8,
            background: "linear-gradient(135deg, #7C6EFF, #00FFB2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, fontWeight: 900, color: "#000",
            fontFamily: S.fontDisplay,
          }}>L</div>
          <div>
            <div style={{ fontFamily: S.fontDisplay, fontWeight: 800, fontSize: 19, color: "#fff", letterSpacing: "-0.5px", lineHeight: 1 }}>LUMEN</div>
            <div style={{ fontSize: 9, color: S.muted, letterSpacing: "2.5px" }}>AI NODE PLATFORM</div>
          </div>
        </div>

        {[
          { key: "hub", label: "◈  Nodes" },
          { key: "admin", label: `🛡  Security ${securityLog.length ? `(${securityLog.length})` : ""}` },
        ].map(({ key, label }) => (
          <button key={key} className="nav-item"
            onClick={() => { setView(key); if (key === "hub") setSelectedNode(null); }}
            style={{
              padding: "6px 16px", borderRadius: 6, fontSize: 11, fontFamily: S.font,
              letterSpacing: "0.5px",
              background: view === key ? "#1c1c3a" : "transparent",
              color: view === key ? "#fff" : S.muted,
              border: `1px solid ${view === key ? S.accent + "60" : "transparent"}`,
            }}>
            {label}
          </button>
        ))}

        <div style={{ marginLeft: "auto", display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ fontSize: 11, color: S.muted, fontFamily: S.font }}>
            {completedNodes.size}<span style={{ color: S.muted }}>/{NODES.length} executed</span>
          </div>
          <div style={{
            padding: "4px 12px", borderRadius: 20, fontSize: 11, fontFamily: S.font,
            background: securityScore >= 80 ? "#00FFB210" : securityScore >= 60 ? "#FFD70010" : "#FF6B6B10",
            color: securityScore >= 80 ? "#00FFB2" : securityScore >= 60 ? "#FFD700" : "#FF6B6B",
            border: "1px solid currentColor",
          }}>
            SEC {securityScore}%
          </div>
        </div>
      </nav>

      {/* ── HUB VIEW ── */}
      {view === "hub" && (
        <div className="fadein" style={{ padding: "40px 28px", maxWidth: 1120, margin: "0 auto" }}>
          <div style={{ marginBottom: 48, textAlign: "center" }}>
            <div style={{ fontFamily: S.fontDisplay, fontWeight: 800, fontSize: 40, color: "#fff", letterSpacing: "-1px", marginBottom: 10 }}>
              10 Execution Nodes
            </div>
            <div style={{ fontSize: 13, color: S.muted }}>
              Live AI automation · Security-validated on every call · Powered by Claude Sonnet
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(310px, 1fr))", gap: 16 }}>
            {NODES.map(node => (
              <div key={node.id} className="lumen-card"
                style={{
                  background: S.surface,
                  border: `1px solid ${S.border}`,
                  borderRadius: 14,
                  padding: 22,
                }}
                onClick={() => selectNode(node)}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 10,
                    background: node.color + "14",
                    border: `1px solid ${node.color}28`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 20, flexShrink: 0,
                  }}>{node.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: S.fontDisplay, fontWeight: 700, fontSize: 14, color: "#eee" }}>{node.name}</div>
                    <div style={{ fontSize: 9, color: node.color, letterSpacing: "2px", marginTop: 1 }}>{node.category.toUpperCase()}</div>
                  </div>
                  {completedNodes.has(node.id) && (
                    <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#00FFB215", border: "1px solid #00FFB240", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#00FFB2" }}>✓</div>
                  )}
                </div>
                <div style={{ fontSize: 12, color: "#FF6B6B70", marginBottom: 3 }}>
                  Problem: <span style={{ color: "#888" }}>{node.problem}</span>
                </div>
                <div style={{ fontSize: 12, color: "#00FFB270" }}>
                  Output: <span style={{ color: "#888" }}>{node.solution}</span>
                </div>
                <div style={{ marginTop: 16, paddingTop: 12, borderTop: `1px solid ${S.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontSize: 9, color: S.muted, letterSpacing: "1px" }}>NODE #{String(node.id).padStart(2, "0")}</div>
                  <span style={{ fontSize: 11, color: node.color }}>Execute →</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── NODE RUNNER ── */}
      {view === "node" && selectedNode && (
        <div className="fadein" style={{ maxWidth: 920, margin: "0 auto", padding: "28px 24px" }}>
          <button className="lumen-btn"
            onClick={() => { setView("hub"); setSelectedNode(null); setOutput(""); }}
            style={{ fontSize: 11, color: S.muted, background: "transparent", marginBottom: 22, letterSpacing: "1px" }}>
            ← BACK TO NODES
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24, padding: 22, background: S.surface, border: `1px solid ${selectedNode.color}25`, borderRadius: 14 }} className="lumen-glow">
            <div style={{ width: 54, height: 54, borderRadius: 12, background: selectedNode.color + "12", border: `1px solid ${selectedNode.color}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0 }}>{selectedNode.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: S.fontDisplay, fontWeight: 800, fontSize: 22, color: "#fff" }}>{selectedNode.name}</div>
              <div style={{ fontSize: 12, color: S.muted, marginTop: 3 }}>{selectedNode.solution}</div>
            </div>
            <button className="lumen-btn" onClick={runNode} disabled={running}
              style={{
                background: running ? S.surface : `linear-gradient(135deg, ${selectedNode.color}, ${selectedNode.color}bb)`,
                color: running ? S.muted : "#000",
                fontFamily: S.font, fontWeight: 700, fontSize: 12,
                padding: "12px 24px", borderRadius: 9, letterSpacing: "1px", flexShrink: 0,
                border: running ? `1px solid ${S.border}` : "none",
              }}>
              {running ? <span className="pulse">◉ EXECUTING…</span> : "▶ EXECUTE NODE"}
            </button>
          </div>

          <div style={{ display: "flex", gap: 4, marginBottom: 18 }}>
            {["input", "output"].map(t => (
              <button key={t} className="lumen-btn"
                onClick={() => setActiveTab(t)}
                style={{
                  padding: "8px 20px", fontSize: 11, fontFamily: S.font, letterSpacing: "1px", borderRadius: 6,
                  background: activeTab === t ? "#1c1c3a" : "transparent",
                  color: activeTab === t ? selectedNode.color : S.muted,
                  border: `1px solid ${activeTab === t ? S.accent + "40" : "transparent"}`,
                }}>
                {t === "input" ? "INPUT" : "OUTPUT"}
                {t === "output" && output && <span style={{ marginLeft: 6, color: "#00FFB2", fontSize: 10 }}>●</span>}
              </button>
            ))}
          </div>

          {activeTab === "input" && (
            <div className="fadein">
              <div style={{ fontSize: 10, color: S.muted, letterSpacing: "2px", marginBottom: 8 }}>SAMPLE INPUT — EDITABLE</div>
              <textarea value={customInput} onChange={e => setCustomInput(e.target.value)}
                style={{ width: "100%", minHeight: 260, background: S.surface, border: `1px solid ${selectedNode.color}25`, borderRadius: 10, padding: 18, color: "#ccc", fontFamily: S.font, fontSize: 12, lineHeight: 1.75, outline: "none" }} />
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
                <button className="lumen-btn" onClick={runNode} disabled={running}
                  style={{ background: `linear-gradient(135deg, ${selectedNode.color}, ${selectedNode.color}bb)`, color: "#000", fontFamily: S.font, fontWeight: 700, fontSize: 12, padding: "12px 30px", borderRadius: 9 }}>
                  {running ? <span className="pulse">◉ EXECUTING…</span> : "▶ EXECUTE NODE"}
                </button>
              </div>
            </div>
          )}

          {activeTab === "output" && (
            <div className="fadein">
              {running && (
                <div style={{ padding: 28, background: S.surface, border: `1px solid ${selectedNode.color}18`, borderRadius: 10, display: "flex", alignItems: "center", gap: 12 }}>
                  <div className="pulse" style={{ width: 10, height: 10, borderRadius: "50%", background: selectedNode.color, boxShadow: `0 0 10px ${selectedNode.color}` }} />
                  <span style={{ color: selectedNode.color, fontSize: 12 }}>LUMEN node processing…</span>
                </div>
              )}
              {output && !running && (
                <div style={{ background: S.surface, border: `1px solid ${selectedNode.color}18`, borderRadius: 10, padding: 22 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#00FFB2", boxShadow: "0 0 6px #00FFB2" }} />
                    <span style={{ fontSize: 9, color: "#00FFB2", letterSpacing: "2px" }}>LUMEN OUTPUT — {selectedNode.name.toUpperCase()}</span>
                  </div>
                  <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.8, color: "#ccc", fontFamily: S.font }}>
                    {output.split("\n").map((line, i) => (
                      <div key={i} style={{
                        color: line.startsWith("##") ? selectedNode.color : "#bbb",
                        fontFamily: line.startsWith("##") ? S.fontDisplay : S.font,
                        fontWeight: line.startsWith("##") ? 700 : 400,
                        fontSize: line.startsWith("##") ? 14 : 12,
                        marginTop: line.startsWith("##") ? 18 : 0,
                        marginBottom: line.startsWith("##") ? 4 : 0,
                      }}>{line || <br />}</div>
                    ))}
                  </div>
                </div>
              )}
              {!output && !running && (
                <div style={{ padding: 70, textAlign: "center", color: S.muted, fontSize: 13 }}>Execute the node to see output here</div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── SECURITY ADMIN ── */}
      {view === "admin" && (
        <div className="fadein" style={{ maxWidth: 1120, margin: "0 auto", padding: "32px 24px" }}>
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontFamily: S.fontDisplay, fontWeight: 800, fontSize: 28, color: "#fff" }}>🛡️ Security Admin Console</div>
            <div style={{ fontSize: 12, color: S.muted, marginTop: 4 }}>Dual-phase validation on every LUMEN node execution</div>
          </div>

          {/* Stat cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 28 }}>
            {[
              { label: "Security Score", value: securityScore + "%", color: securityScore >= 80 ? "#00FFB2" : "#FFD700", sub: "avg across all scans" },
              { label: "Total Scans", value: securityLog.length, color: "#7C6EFF", sub: "pre + post call" },
              { label: "Checks Per Scan", value: Object.keys(SECURITY_CHECKS).length, color: "#06B6D4", sub: "security rules" },
              { label: "Nodes Validated", value: `${new Set(securityLog.map(l => l.nodeId)).size}/10`, color: "#F97316", sub: "unique nodes" },
            ].map((c, i) => (
              <div key={i} style={{ background: S.surface, border: `1px solid ${c.color}25`, borderRadius: 12, padding: 18 }}>
                <div style={{ fontSize: 10, color: S.muted, letterSpacing: "1.5px", marginBottom: 8 }}>{c.label.toUpperCase()}</div>
                <div style={{ fontFamily: S.fontDisplay, fontWeight: 800, fontSize: 32, color: c.color, lineHeight: 1 }}>{c.value}</div>
                <div style={{ fontSize: 10, color: S.muted, marginTop: 6 }}>{c.sub}</div>
              </div>
            ))}
          </div>

          {/* Check suite */}
          <div style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 14, padding: 22, marginBottom: 24 }}>
            <div style={{ fontFamily: S.fontDisplay, fontWeight: 700, fontSize: 16, color: "#fff", marginBottom: 18 }}>Security Check Suite</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
              {Object.entries(SECURITY_CHECKS).map(([key, check]) => {
                const lastResult = securityLog.find(l => l.results?.[key]);
                const result = lastResult?.results?.[key];
                const status = !result ? "pending" : result.pass ? "pass" : "fail";
                return (
                  <div key={key} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 16px", background: "#09091a", borderRadius: 9, border: `1px solid ${status === "pass" ? "#00FFB218" : status === "fail" ? "#FF6B6B18" : S.border}` }}>
                    <span style={{ fontSize: 18 }}>{check.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, color: "#ddd" }}>{check.label}</div>
                      {result && !result.pass && result.threats.length > 0 && (
                        <div style={{ fontSize: 10, color: "#FF6B6B", marginTop: 2 }}>{result.threats.join(" · ")}</div>
                      )}
                    </div>
                    <div style={{
                      fontSize: 9, padding: "3px 10px", borderRadius: 10, letterSpacing: "1.5px",
                      background: status === "pass" ? "#00FFB212" : status === "fail" ? "#FF6B6B12" : "#ffffff06",
                      color: status === "pass" ? "#00FFB2" : status === "fail" ? "#FF6B6B" : S.muted,
                    }}>
                      {status === "pending" ? "PENDING" : status === "pass" ? "✓ PASS" : "✗ FAIL"}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Audit log */}
          <div style={{ background: S.surface, border: `1px solid ${S.border}`, borderRadius: 14, padding: 22 }}>
            <div style={{ fontFamily: S.fontDisplay, fontWeight: 700, fontSize: 16, color: "#fff", marginBottom: 18 }}>
              Audit Log
              {securityLog.length === 0 && <span style={{ fontSize: 11, color: S.muted, fontFamily: S.font, fontWeight: 400, marginLeft: 10 }}>— Execute any node to begin logging</span>}
            </div>
            {securityLog.length === 0 ? (
              <div style={{ padding: 50, textAlign: "center", color: S.muted, fontSize: 13 }}>No scans yet. Execute a node to generate security logs.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {securityLog.map(log => (
                  <div key={log.id} style={{ padding: "13px 18px", background: "#09091a", borderRadius: 9, border: `1px solid ${log.score === 100 ? "#00FFB218" : log.score >= 75 ? "#FFD70018" : "#FF6B6B18"}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 14 }}>{NODES.find(n => n.id === log.nodeId)?.icon}</span>
                      <span style={{ fontSize: 12, color: "#ddd", fontWeight: 700 }}>{log.nodeName}</span>
                      <span style={{ fontSize: 9, color: S.muted, padding: "2px 8px", background: "#ffffff06", borderRadius: 8, letterSpacing: "1px" }}>{log.phase.toUpperCase()}</span>
                      <span style={{ fontSize: 10, color: S.muted }}>{new Date(log.timestamp).toLocaleTimeString()}</span>
                      {log.blocked && <span style={{ fontSize: 9, color: "#FF6B6B", padding: "2px 8px", background: "#FF6B6B12", borderRadius: 8, letterSpacing: "1px" }}>BLOCKED</span>}
                      <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
                        <span style={{ fontSize: 11, color: "#00FFB2" }}>✓ {log.passed}</span>
                        {log.failed > 0 && <span style={{ fontSize: 11, color: "#FF6B6B" }}>✗ {log.failed}</span>}
                        <span style={{
                          fontSize: 11, padding: "3px 12px", borderRadius: 10, fontWeight: 700,
                          background: log.score === 100 ? "#00FFB212" : log.score >= 75 ? "#FFD70012" : "#FF6B6B12",
                          color: log.score === 100 ? "#00FFB2" : log.score >= 75 ? "#FFD700" : "#FF6B6B",
                        }}>{log.score}%</span>
                      </div>
                    </div>
                    {log.inputSnippet && <div style={{ fontSize: 10, color: S.muted, marginTop: 6, fontStyle: "italic" }}>↳ {log.inputSnippet}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
