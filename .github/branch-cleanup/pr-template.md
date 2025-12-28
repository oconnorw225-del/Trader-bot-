# PR Template for Branch Consolidation

This template is used when creating pull requests for consolidating feature branches into main.

## Title Format
```
[{branch-name}] -> main: {description}
```

Where:
- `{branch-name}` is the full branch name (e.g., `copilot/fix-api-key-management`)
- `{description}` is a brief description derived from the branch name and top commit message

## Body Template

```markdown
## Purpose
{Brief description of what this branch was created for}

## Changes
This PR merges the `{branch-name}` branch into `main`.

### Files Changed
{Summary of key files changed - auto-populated by script}

### Tests
{Tests run - auto-populated if tests exist}

### Conflicts
{Conflict status - auto-populated by script}

## Checklist
- [ ] Code follows project standards
- [ ] Tests pass (if applicable)
- [ ] No merge conflicts (or conflicts have been resolved)
- [ ] Branch can be safely deleted after merge

## Related
Part of branch consolidation effort tracked in #151

---
*This PR was created as part of the automated branch consolidation process.*
```

## Labels
- `enhancement`
- `cleanup`
- `high-priority`

## Base Branch
- Always `main`
