# 🛡️ LUMEN Security Policy

**Project:** LUMEN — Live Unified Machine for Executing Nodes  
**Version:** 1.0.0  
**Last updated:** March 2024

---

## Supported Versions

| Version | Security Support |
|---------|-----------------|
| 1.x     | ✅ Active        |

---

## Security Architecture

LUMEN implements a **dual-phase security model** on every node execution. No request reaches the Claude API without passing through Phase 1 first. Phase 2 validates the response before it is shown to the user.

```
USER INPUT
    │
    ▼
┌─────────────────────────────────┐
│  PHASE 1 — PRE-EXECUTION SCAN  │
│  ✓ Input Sanitization           │
│  ✓ Prompt Injection Guard ──── HARD BLOCK
│  ✓ API Key Exposure             │
│  ✓ PII Detection                │
│  ✓ Rate Limit Compliance        │
│  ✓ Node Permission Scope        │
│  ✓ Content Policy Filter ───── HARD BLOCK
└────────────────┬────────────────┘
                 │ (if passed)
                 ▼
         CLAUDE SONNET API
                 │
                 ▼
┌─────────────────────────────────┐
│  PHASE 2 — POST-EXECUTION SCAN │
│  ✓ Response Size Guard          │
│  ✓ Output Credential Scan       │
└────────────────┬────────────────┘
                 │
                 ▼
            USER OUTPUT
```

---

## Threat Model

| Threat | Detection Method | Response | Severity |
|--------|-----------------|----------|----------|
| Prompt injection | Regex pattern matching | Hard block + log | 🔴 Critical |
| XSS in input | Tag/attribute scanning | Warn + log | 🟠 High |
| SQL injection | Keyword detection | Warn + log | 🟠 High |
| API key leakage (input) | Token pattern matching | Warn + log | 🟠 High |
| API key in output | Post-call scan | Warn + log | 🟠 High |
| PII exposure | Pattern matching | Warn + log | 🟡 Medium |
| Data exfiltration (output) | Response size limit | Warn + log | 🟡 Medium |
| Rate abuse | Client-side timestamp tracking | Warn + log | 🟡 Medium |
| Persona hijack | NLP pattern matching | Hard block + log | 🔴 Critical |
| System prompt extraction | Keyword detection | Hard block + log | 🔴 Critical |
| Policy-violating content | Blocked pattern list | Hard block + log | 🔴 Critical |
| Path traversal | `../` detection | Warn + log | 🟠 High |

---

## Security Check Definitions

### 1. 🧹 Input Sanitization
**What it catches:** XSS script tags, JavaScript protocol URIs, event handler injection, SQL DML keywords, path traversal sequences, and input exceeding 10,000 characters.  
**Action:** Warn and log. Does not hard-block (non-critical for client-side).

### 2. 💉 Prompt Injection Guard *(Hard Block)*
**What it catches:**
- `ignore previous instructions` and variants
- `you are now` / `pretend to be` persona hijacks
- `system prompt`, `jailbreak`, `DAN mode` keywords
- `repeat after me` forced output patterns
- Raw LLM tokens: `[INST]`, `<|im_start|>`, etc.

**Action:** Hard block — request is not forwarded to Claude. Entry logged as BLOCKED.

### 3. 🔑 API Key Exposure
**What it catches:** Anthropic API key patterns (`sk-...`), GitHub tokens (`ghp_...`), Bearer tokens, and `api_key=` assignments in input.  
**Action:** Warn and log.

### 4. 👤 PII Detection
**What it catches:** Social Security Numbers (XXX-XX-XXXX), credit card numbers (16-digit patterns), email addresses, and US phone numbers.  
**Action:** Warn and log. Allows continuation — some use cases legitimately process contact info.

### 5. 📏 Response Size Guard
**What it catches:** Responses exceeding 8,000 characters (possible data exfiltration or model misbehavior), and `sk-` patterns in output.  
**Action:** Warn and log.

### 6. ⏱️ Rate Limit Compliance
**What it catches:** More than 10 API calls in the last 60 seconds, or 3+ consecutive errors (possible abuse loop).  
**Action:** Warn and log.

### 7. 🔐 Node Permission Scope
**What it catches:** Missing node ID in request metadata, and runtime modification of the system prompt.  
**Action:** Warn and log.

### 8. 🛡️ Content Policy Filter *(Hard Block)*
**What it catches:** Patterns matching instructions to build weapons/malware, network intrusion requests, and CSAM-adjacent queries.  
**Action:** Hard block — request is not forwarded to Claude. Entry logged as BLOCKED.

---

## Audit Log

Every execution generates two log entries (pre-call and post-call), each containing:

```json
{
  "id": 1711234567890,
  "nodeId": 3,
  "nodeName": "Bug Triage Node",
  "timestamp": "2024-03-23T10:47:00.000Z",
  "phase": "pre-call",
  "score": 100,
  "passed": 8,
  "failed": 0,
  "blocked": false,
  "inputSnippet": "First 80 chars of input...",
  "results": { ... }
}
```

Logs are stored in session memory and visible in the Security Admin Console.

---

## Known Limitations

| Limitation | Impact | Mitigation |
|-----------|--------|-----------|
| Client-side checks only | Sophisticated users can bypass JS | Add server-side validation for production |
| Regex-based PII detection | May miss novel formats | Use ML-based classifier for production |
| In-memory rate limiter | Resets on page reload | Use server-side rate limiting for production |
| Pattern-based injection detection | May not catch novel jailbreaks | Combine with Claude's built-in safety |

---

## Reporting a Vulnerability

**Do not open a public GitHub issue for security vulnerabilities.**

1. Email: `security@yourdomain.com`
2. Use subject line: `[LUMEN] Security Vulnerability Report`
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact assessment
   - Your suggested fix (optional)

**Response SLA:** We will acknowledge within 24 hours and respond within 72 hours.

Researchers who responsibly disclose valid vulnerabilities will be credited in the changelog.

---

## Responsible Disclosure Policy

LUMEN follows coordinated vulnerability disclosure. We ask that you:

1. Give us reasonable time to fix the issue before public disclosure
2. Do not exploit the vulnerability beyond what is necessary to demonstrate it
3. Do not access or modify user data

In return, we commit to:

1. Timely acknowledgment and response
2. Keeping you informed of our progress
3. Public credit upon fix release (with your permission)
