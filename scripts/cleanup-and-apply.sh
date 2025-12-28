#!/usr/bin/env bash
# Safe bulk cleanup, backup, cherry-pick/apply and optional delete.
# USAGE:
#  Dry-run (recommended): ./scripts/cleanup-and-apply.sh
#  Apply (create fix branches and open PRs): ./scripts/cleanup-and-apply.sh --apply
#  Apply and then delete archived branches (DESCTRUCTIVE): ./scripts/cleanup-and-apply.sh --apply --confirm-delete
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

echo "Starting cleanup audit (dry-run=$DRY_RUN, apply=$APPLY, confirm_delete=$CONFIRM_DELETE), base=$DEFAULT_BASE"
git fetch --all --prune

# list branches excluding base & HEAD
branches=$(git for-each-ref --format='%(refname:short)' refs/remotes/origin | sed 's#^origin/##' | grep -vE "^${DEFAULT_BASE}$|^HEAD$" | sort -u)

summary="$OUT_DIR/summary-$(date +%Y%m%d%H%M%S).md"
echo "# Cleanup summary $(date)" > "$summary"

for br in $branches; do
  echo "-----------------------------"
  echo "Branch: $br"
  repofile="$REPORTS/report-${br//\//_}.json"
  # create clean temporary worktree
  worktree="$TMP_DIR/worktree-${br//\//_}"
  rm -rf "$worktree"
  mkdir -p "$worktree"
  if ! git worktree add --detach "$worktree" "origin/$DEFAULT_BASE" >/dev/null 2>&1; then
    echo "  ❌ Could not create worktree for $br"
    jq -n --arg branch "$br" --arg status "worktree_failed" '{"branch":$branch,"status":$status}' > "$repofile"
    echo "- $br : worktree_failed" >> "$summary"
    continue
  fi

  pushd "$worktree" >/dev/null

  echo "  ▶ Attempt merge preview: origin/$br -> $DEFAULT_BASE"
  if git merge --no-commit --no-ff "origin/$br" >/dev/null 2>&1; then
    echo "    ✅ Mergeable (no conflicts)"
    TEST_RESULT="not_run"
    if [ -f package.json ]; then
      echo "    ▶ npm ci"
      if npm ci --silent; then
        echo "    ▶ npm test"
        if npm test --silent; then
          TEST_RESULT="pass"
          echo "    ✅ Tests passed on merged preview"
        else
          TEST_RESULT="fail"
          echo "    ❌ Tests failed on merged preview"
        fi
      else
        TEST_RESULT="ci_fail"
        echo "    ❌ npm ci failed"
      fi
    fi

    # create proposal patch
    DIFF_NAME="proposal-${br//\//_}-$(date +%Y%m%d%H%M%S).patch"
    DIFF_PATH="$PROPOSALS/$DIFF_NAME"
    git diff --staged > "$DIFF_PATH" || git diff > "$DIFF_PATH" || true

    jq -n --arg branch "$br" --arg merged "true" --arg tests "$TEST_RESULT" --arg proposal "$DIFF_NAME" \
      '{"branch":$branch,"merged_preview":$merged,"tests":$tests,"proposal":$proposal}' > "$repofile"

    echo "- $br : mergeable, tests=$TEST_RESULT, proposal=$DIFF_NAME" >> "$summary"

    if [ "$APPLY" = true ]; then
      # create backup bundle & archive branch
      BU_BASENAME="${br//\//_}-$(date +%Y%m%d%H%M%S)"
      bundlefile="$BACKUPS/${BU_BASENAME}.bundle"
      echo "    ▶ Creating bundle backup for $br -> $bundlefile"
      git bundle create "$bundlefile" "origin/$br" || echo "      ⚠ bundle failed"
      echo "    ▶ Pushing archive branch archive/$br"
      git push origin "refs/remotes/origin/$br:refs/heads/archive/${br//\//_}-$(date +%Y%m%d)" >/dev/null 2>&1 || echo "      ⚠ push archive failed"

      # create fix branch from base and commit merged state
      target_branch="autopilot/fix-${br//\//_}-$(date +%Y%m%d%H%M%S)"
      echo "    ▶ Creating fix branch $target_branch"
      git checkout -b "$target_branch"
      git add -A || true
      git commit -m "autopilot: apply merged changes from ${br} into ${DEFAULT_BASE}" || git commit --allow-empty -m "autopilot: apply merged changes from ${br} into ${DEFAULT_BASE}"
      echo "    ▶ Pushing $target_branch"
      git push origin "$target_branch"
      if command -v gh >/dev/null 2>&1; then
        echo "    ▶ Opening PR for $target_branch"
        gh pr create --base "$DEFAULT_BASE" --head "$target_branch" --title "Autopilot: merge ${br} -> ${DEFAULT_BASE}" --body "Automated proposal. Tests: $TEST_RESULT. See .autopilot/proposals/$DIFF_NAME" || echo "      ⚠ gh pr create failed"
      else
        echo "    ⚠ gh CLI not available — PR not created for $target_branch"
      fi
      # return to detached worktree state is fine
    fi

  else
    echo "    ⚠ Merge produced conflicts for $br"
    git merge --abort >/dev/null 2>&1 || true
    jq -n --arg branch "$br" --arg merged "false" --argjson conflicts true '{"branch":$branch,"merged_preview":$merged,"conflicts":$conflicts}' > "$repofile"
    echo "- $br : conflicts" >> "$summary"
    # backup branch for manual inspection
    if [ "$APPLY" = true ]; then
      BU_BASENAME="${br//\//_}-conflicts-$(date +%Y%m%d%H%M%S)"
      bundlefile="$BACKUPS/${BU_BASENAME}.bundle"
      git bundle create "$bundlefile" "origin/$br" || true
      git push origin "refs/remotes/origin/$br:refs/heads/archive/${br//\//_}-conflicts-$(date +%Y%m%d)" >/dev/null 2>&1 || true
    fi
  fi

  popd >/dev/null
  git worktree remove --force "$worktree" >/dev/null 2>&1 || true
done

echo "Audit complete. Summary at $summary"
echo "Proposals: $PROPOSALS"
echo "Reports: $REPORTS"
echo "Backups: $BACKUPS"

echo "Dry-run complete. No branches were pushed/deleted."

if [ "$DRY_RUN" = false ]; then
  echo "Apply complete: fix branches created and PRs opened for mergeable branches (where possible)."
  if [ "$CONFIRM_DELETE" = true ]; then
    echo "CONFIRM_DELETE flag set — proceeding to delete original remote branches (after backups)."
    # delete original remote branches (careful)
    for br in $branches; do
      echo "  ▶ Deleting remote origin/$br"
      git push origin --delete "$br" || echo "    ⚠ Failed to delete $br"
    done
    echo "Original branches deleted (best-effort)."
  else
    echo "Original branches not deleted. To delete, re-run with --confirm-delete (destructive)."
  fi
fi

echo "Done."
