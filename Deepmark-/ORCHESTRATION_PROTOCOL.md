# DEEPMARK — MULTI-AGENT ORCHESTRATION PROTOCOL
## Version 1.0 | Established: August 5, 2025

---

## 1. ROLES

### ORCHESTRATOR (Me)
- Receives tasks
- Assigns to Builder/Reviewer pairs
- Resolves conflicts
- Validates evidence
- Declares completion

### BUILDER
- Implements assigned tasks
- Inspects existing code first
- Reports exactly what changed
- Never claims without evidence

### REVIEWER  
- Independent adversarial inspection
- Challenges assumptions
- Finds security/UX/performance/logic failures
- Provides evidence for findings

### VERIFIER
- Runs tests, builds, typechecks
- Verifies security boundaries
- Compares against specification

---

## 2. AGENT PAIRS (STACKS)

| Stack | Builder | Reviewer |
|-------|---------|----------|
| **Backend** | code-explorer | code-explorer |
| **Frontend** | code-explorer | code-explorer |
| **AI/ML** | code-explorer | code-explorer |
| **Database** | code-explorer | code-explorer |
| **Security** | code-explorer | code-explorer |
| **Infrastructure** | code-explorer | code-explorer |

---

## 3. COMPLETION GATE

```
IMPLEMENTED → REVIEWED → VERIFIED → ACCEPTED
```

If verification fails:
```
FAILED → Builder Correction → Reviewer → Verifier (repeat)
```

---

## 4. EVIDENCE STANDARD

Every claim requires:
- Exact file/module
- Relevant function/query/policy
- Reproduction steps
- Observed result
- Expected result
- Impact

---

## 5. CURRENT CRITICAL BLOCKERS (Priority Order)

| # | Blocker | Stack | Status |
|---|---------|-------|--------|
| 1 | Delete MANUAL_MIGRATION.sql (RLS bypass) | Security | TODO |
| 2 | Fix Analytics (Math.random() → real data) | Backend | TODO |
| 3 | Add email verification | Backend | TODO |
| 4 | Add password reset | Backend | TODO |
| 5 | Add legal pages (ToS, Privacy) | Frontend | TODO |
| 6 | Integrate Stripe billing | Backend | TODO |
| 7 | Move JWT to httpOnly cookies | Security | TODO |

---

## 6. TASK RECORD FORMAT

For every task completed:

```
TASK: [task name]
DOMAIN: [stack]
BUILDER RESULT: [summary]
REVIEWER FINDINGS: [list]
CONFLICTS: [list or "None"]
VERIFICATION EVIDENCE: [evidence]
FILES CHANGED: [list]
DATABASE IMPACT: [list]
API IMPACT: [list]
SECURITY IMPACT: [list]
REGRESSION STATUS: [pass/fail]
FINAL STATUS: VERIFIED | FAILED | BLOCKED
```

---

## 7. INDEPENDENCE RULE

- Builder → implementation
- Reviewer → independent inspection
- Verifier → independent verification

Never allow one agent's conclusion to become another's assumption.
