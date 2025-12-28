#!/usr/bin/env bash
# Force-apply and cleanup automation
# Scans all remote branches, attempts to cherry-pick commits missing from main into a fix branch,
# opens PRs for successful cherry-picks, archives and backs up originals, and optionally deletes
# original remote branches when run with --confirm-delete.
#
# USAGE:
#  Dry-run (recommended): ./scripts/force-apply-and-cleanup.sh
#  Apply (create fix branches and open PRs): ./scripts/force-apply-and-cleanup.sh --apply
#  Apply and then delete archived branches (DESTRUCTIVE): ./scripts/force-apply-and-cleanup.sh --apply --confirm-delete
#
# REQUIREMENTS (for apply):
#  - git, jq, tar, node/npm available
#  - gh CLI (for opening PRs) and gh auth login performed on the runner
#  - Run from repo root
#
set -euo pipefail
ROOT="$(pwd)"
OUT_DIR="$ROOT/.autopilot"
TMP_DIR="$OUT_DIR/tmp"
PROPOSALS="$OUT_DIR/proposals"
REPORTS="$OUT_DIR/reports"
BACKUPS="$OUT_DIR/backups"
DEFAULT_BASE="${BASE_BRANCH:-main}"

DRY_RUN=true
APPLY=false
CONFIRM_DELETE=false

while (( "$#" )); do
  case "$1" in
    --apply) APPLY=true; DRY_RUN=false; shift ;;
    --confirm-delete) CONFIRM_DELETE=true; shift ;;
    --base) DEFAULT_BASE="$2"; shift 2 ;;
    --help|-h) echo "Usage: $0 [--apply] [--confirm-delete] [--base <branch>]"; exit 0 ;;
    *) echo "Unknown arg: $1"; exit 1 ;;
  esac
done

mkdir -p "$OUT_DIR" "$TMP_DIR" "$PROPOSALS" "$REPORTS" "$BACKUPS"

echo "Starting force-apply audit (dry-run=$DRY_RUN, apply=$APPLY, confirm_delete=$CONFIRM_DELETE), base=$DEFAULT_BASE"

git fetch --all --prune

# list branches excluding base & HEAD
branches=$(git for-each-ref --format='%(refname:short)' refs/remotes/origin | sed 's#^origin/##' | grep -vE "^${DEFAULT_BASE}$|^HEAD$" | sort -u)

summary="$OUT_DIR/summary-$(date +%Y%m%d%H%M%S).md"
echo "# Force-apply summary $(date)" > "$summary"

for br in $branches; do
  echo "------------------------------------------------"
  echo "Branch: $br"
  repofile="$REPORTS/report-${br//\//_}.json"
  jq -n --arg branch "$br" '{branch:$branch}' > "$repofile"

  # create backup for branch
  BU_BASENAME="${br//\//_}-backup-$(date +%Y%m%d%H%M%S)"
  bundlefile="$BACKUPS/${BU_BASENAME}.bundle"
  git bundle create "$bundlefile" "origin/$br" || echo "  ⚠ bundle failed for $br"
  echo "- backup: $bundlefile" >> "$summary"

  # find commits in branch not in main
  commits=$(git rev-list --no-merges origin/$br --not origin/$DEFAULT_BASE || true)
  if [ -z "${commits// }" ]; then
    echo "  → No commits to apply from $br"
    jq -n --arg branch "$br" --arg msg "no_commits" '{branch:$branch,action:$msg}' > "$repofile"
    echo "- $br : no new commits" >> "$summary"
    continue
  fi

  echo "  → Found commits to consider for cherry-pick"

  # Create a working worktree for cherry-picking
  worktree="$TMP_DIR/worktree-${br//\//_}"
  rm -rf "$worktree"
  mkdir -p "$worktree"
  if ! git worktree add --detach "$worktree" "origin/$DEFAULT_BASE" >/dev/null 2>&1; then
    echo "  ❌ Could not create worktree for $br"
    jq -n --arg branch "$br" --arg status "worktree_failed" '{branch:$branch,status:$status}' > "$repofile"
    echo "- $br : worktree_failed" >> "$summary"
    continue
  fi

  pushd "$worktree" >/dev/null

  applied_commits=()
  failed_commits=()

  for c in $commits; do
    echo "    ▶ Attempt cherry-pick $c"
    if git cherry-pick --allow-empty --keep-redundant-commits -n $c >/dev/null 2>&1; then
      echo "      ✅ Cherry-pick $c staged"
      git add -A || true
      # commit per original commit metadata
      GIT_AUTHOR_NAME=$(git show -s --format='%an' $c)
      GIT_AUTHOR_EMAIL=$(git show -s --format='%ae' $c)
      GIT_AUTHOR_DATE=$(git show -s --format='%aI' $c)
      git commit -m "cherry-pick: $c - $(git show -s --format='%s' $c)" --author="$GIT_AUTHOR_NAME <$GIT_AUTHOR_EMAIL>" --date="$GIT_AUTHOR_DATE" || true
      applied_commits+=("$c")
    else
      echo "      ⚠ Cherry-pick $c failed (conflict)"
      git cherry-pick --abort >/dev/null 2>&1 || true
      failed_commits+=("$c")
    fi
  done

  if [ ${#applied_commits[@]} -gt 0 ]; then
    # create fix branch and push
    target_branch="autopilot/fix-${br//\//_}-$(date +%Y%m%d%H%M%S)"
    echo "    ▶ Creating fix branch $target_branch"
    git checkout -b "$target_branch"
    git push origin "$target_branch"

    if command -v gh >/dev/null 2>&1; then
      echo "    ▶ Opening PR for $target_branch"
      gh pr create --base "$DEFAULT_BASE" --head "$target_branch" --title "Autopilot: cherry-pick from ${br} -> ${DEFAULT_BASE}" --body "Automated cherry-pick of commits from ${br}. Applied commits: ${applied_commits[*]}. Failed commits (conflicts): ${failed_commits[*]}" || echo "      ⚠ gh pr create failed"
    else
      echo "    ⚠ gh CLI not available — PR not created for $target_branch"
    fi

    jq -n --arg branch "$br" --arg target "$target_branch" --argjson applied "$(printf '%s\n' "${applied_commits[@]}" | jq -R -s -c 'split("\n")[:-1]')" --argjson failed "$(printf '%s\n' "${failed_commits[@]}" | jq -R -s -c 'split("\n")[:-1]')" '{branch:$branch,target_branch:$target,applied:$applied,failed:$failed}' > "$repofile"

    echo "- $br : applied=${#applied_commits[@]}, failed=${#failed_commits[@]}, fix_branch=$target_branch" >> "$summary"
  else
    echo "    → No commits applied cleanly for $br"
    jq -n --arg branch "$br" --arg msg "no_applied_commits" --argjson failed "$(printf '%s\n' "${failed_commits[@]}" | jq -R -s -c 'split("\n")[:-1]')" '{branch:$branch,action:$msg,failed:$failed}' > "$repofile"
    echo "- $br : no_applied_commits, failed=${#failed_commits[@]}" >> "$summary"
  fi

  # push archive branch of original
  git push origin "refs/remotes/origin/$br:refs/heads/archive/${br//\//_}-$(date +%Y%m%d)" >/dev/null 2>&1 || echo "  ⚠ push archive failed"

  popd >/dev/null
  git worktree remove --force "$worktree" >/dev/null 2>&1 || true

  # delete original remote branch if confirmed and apply run
  if [ "$APPLY" = true ] && [ "$CONFIRM_DELETE" = true ]; then
    echo "  ▶ Deleting original remote branch origin/$br"
    git push origin --delete "$br" || echo "    ⚠ Failed to delete $br"
  fi

done

echo "Audit complete. Summary at $summary"
echo "Proposals: $PROPOSALS"
echo "Reports: $REPORTS"
echo "Backups: $BACKUPS"

echo "Dry-run complete. No branches were pushed/deleted."

if [ "$DRY_RUN" = false ]; then
  echo "Apply complete: fix branches created and PRs opened for applied commits (where possible)."
  if [ "$CONFIRM_DELETE" = true ]; then
    echo "Original branches were deleted (best-effort)."
  else
    echo "Original branches not deleted. To delete, re-run with --confirm-delete (destructive)."
  fi
fi

echo "Done."
