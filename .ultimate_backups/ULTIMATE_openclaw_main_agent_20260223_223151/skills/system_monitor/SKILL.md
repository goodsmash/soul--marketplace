---
name: system_monitor
description: Monitor system health, check resource usage, and alert on issues. Use when the user wants to check CPU, memory, disk usage, system performance, or troubleshoot system issues.
metadata:
  {
    "clawdbot":
      {
        "emoji": "🖥️",
        "homepage": "",
        "requires": { "bins": ["top", "free", "df"] },
      },
  }
---

# System Monitor

Monitor system health and resource usage.

## Features

- CPU usage monitoring
- Memory usage tracking
- Disk space checking
- Performance alerts
- System health reports

## Usage

```bash
# Check system health
./scripts/health_check.sh

# Check specific resource
top -bn1 | head -5
free -h
df -h
```

## Scripts

- `health_check.sh` - Full system health check

## Alerts

The skill will warn on:
- CPU usage > 80%
- Memory usage > 80%
- Disk usage > 80%

## Examples

- "Check my system health"
- "How much memory is being used?"
- "Is my disk almost full?"
- "Why is my computer slow?"
