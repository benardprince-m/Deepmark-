# DEEPMARK — AGENT ORCHESTRATION SYSTEM

## Overview
Multi-agent coordination system for DeepMark using Builder/Reviewer/Verifier pattern.

## Agent Roles

### BUILDER
- **Type:** Implementation specialist
- **Tools:** terminal, file_editor
- **Purpose:** Implements assigned tasks with production-quality code
- **Constraints:** Inspect existing code first, report exact changes, never claim without evidence

### REVIEWER  
- **Type:** Adversarial specialist  
- **Tools:** code-explorer, terminal
- **Purpose:** Challenge Builder's assumptions, attack security/UX/performance/logic
- **Constraints:** Provide evidence for every finding, don't rewrite

### VERIFIER
- **Type:** Quality assurance
- **Tools:** terminal, browser tools
- **Purpose:** Confirm implementation works via actual tests
- **Constraints:** Never assume, always test, verify against spec

### ORCHESTRATOR
- **Type:** Manager/Coordinator
- **Purpose:** Assign tasks, resolve conflicts, declare completion
- **Constraints:** Never trust blindly, maintain task records

## Task Assignment Format

```
TASK: [task name]
DOMAIN: [stack]
BUILDER: [agent]
REVIEWER: [agent]
VERIFIER: [agent]
CONTEXT: [existing state]
ACCEPTANCE CRITERIA: [list]
REPOSITORY: /workspace/project/Deepmark-/Deepmark-
```

## Completion Gate

```
BUILDER → IMPLEMENTED
    ↓
REVIEWER → REVIEWED (or CONFLICT)
    ↓
VERIFIER → VERIFIED (or FAILED)
    ↓
ORCHESTRATOR → ACCEPTED
```

## Current Task Queue

| # | Task | Priority | Status |
|---|------|----------|--------|
| 1 | RLS Bypass Fix | CRITICAL | ✅ VERIFIED |
| 2 | Analytics Dashboard Fix | CRITICAL | ✅ VERIFIED |
| 3 | Email Verification | HIGH | ⏳ PENDING |
| 4 | Password Reset | HIGH | ⏳ PENDING |
| 5 | Legal Pages | HIGH | ⏳ PENDING |
| 6 | Stripe Billing | HIGH | ⏳ PENDING |
| 7 | JWT httpOnly | HIGH | ⏳ PENDING |
