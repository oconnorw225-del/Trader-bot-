# Copilot PR Review - Quick Reference

## When Copilot WILL Review ✅

- **Code Changes**: Additions or modifications to `.js`, `.jsx`, `.ts`, `.py`, etc.
- **New Features**: Adding new functionality with code
- **Bug Fixes**: Fixing issues in existing code
- **Refactoring**: Changing code structure while preserving behavior
- **Mixed PRs**: PRs with both additions and deletions

## When Copilot WON'T Review ❌

- **Deletion-Only PRs**: Only removing files, no code to analyze
  - _Solution_: Automated workflow will add helpful comment
  - _Action_: Use reviewer checklist for verification
  
- **Documentation-Only**: Only `.md`, `.txt` changes
  - _Why_: Copilot focuses on code logic, not prose
  
- **Config-Only**: Only `.json`, `.yml`, `.yaml` changes
  - _Why_: Limited code logic to review

## What to Do for Deletion PRs

### As a Contributor
1. ✅ Fill out PR template completely
2. ✅ Mark as "File deletion / Cleanup" type
3. ✅ List all deleted files and reasons
4. ✅ Expect automated comment (not an error!)
5. ✅ Proceed with normal review process

### As a Reviewer
1. ✅ Read automated comment
2. ✅ Use provided checklist:
   - [ ] Verify deletions are intentional
   - [ ] Check no broken references
   - [ ] Confirm tests still pass
   - [ ] Ensure docs are updated
3. ✅ Approve if everything looks good

## Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| "Couldn't review" on deletion PR | Expected behavior | Read auto-comment, use checklist |
| No comment on deletion PR | Workflow not triggered | Check Actions tab, verify workflow exists |
| Duplicate comments | Workflow issue | Report bug, should auto-update |
| "Couldn't review" on code PR | All files excluded/ignored | Check `.gitignore`, file types |

## Quick Links

📚 **Full Documentation**: [docs/COPILOT_REVIEW_GUIDE.md](COPILOT_REVIEW_GUIDE.md)  
🧪 **Testing Guide**: [docs/DELETION_PR_TESTING.md](DELETION_PR_TESTING.md)  
📋 **Implementation Summary**: [docs/COPILOT_FIX_SUMMARY.md](COPILOT_FIX_SUMMARY.md)  
🔧 **Workflow File**: [.github/workflows/deletion-pr-handler.yml](../.github/workflows/deletion-pr-handler.yml)  
📝 **PR Template**: [.github/pull_request_template.md](../.github/pull_request_template.md)

## Key Points

💡 **Remember**:
- Deletion-only PRs can't be reviewed by Copilot (no code to analyze)
- This is **expected behavior**, not an error
- Automated workflow will explain and provide guidance
- Manual review is still important for all PRs
- Normal PRs with code changes work as usual

🎯 **Goal**: Clear communication and better contributor experience!

---

_Last Updated: November 19, 2025_
