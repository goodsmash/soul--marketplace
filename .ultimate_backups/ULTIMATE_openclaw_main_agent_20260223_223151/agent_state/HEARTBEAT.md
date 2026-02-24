# HEARTBEAT.md — Things to Check Periodically

## Daily Checks (2-4 times/day)

### 1. GitHub Repositories
- [ ] Check for new commits in priority repos
- [ ] Look for open issues/PRs
- [ ] Review typing-assistant-standalone for any issues

### 2. Memory Maintenance
- [ ] Review recent memory/YYYY-MM-DD.md files
- [ ] Update MEMORY.md with significant learnings
- [ ] Archive old daily files (older than 30 days)

### 3. Project Status
- [ ] Check PROJECT_STATUS.md for stale items
- [ ] Update priorities based on recent work
- [ ] Look for forgotten tasks

### 4. Self-Improvement
- [ ] Review my SOUL.md — still accurate?
- [ ] Check for patterns in Ryan's requests
- [ ] Identify repetitive tasks to automate

## When to Reach Out to Ryan

### Immediate (within reason)
- Calendar event in < 2 hours
- Important email notification
- System errors or failures
- Security-related findings

### Batch for later
- Project updates (daily digest)
- Memory summaries (weekly)
- New repository discoveries

## What NOT to do

- Don't check during 23:00-08:00 unless urgent
- Don't report routine OKs unless asked
- Don't wake Ryan for non-critical items
- Don't spam with multiple messages

## Heartbeat State

Track last checks in `memory/heartbeat-state.json`:
```json
{
  "lastChecks": {
    "github": "timestamp",
    "memory": "timestamp", 
    "projects": "timestamp",
    "email": "timestamp"
  }
}
```
