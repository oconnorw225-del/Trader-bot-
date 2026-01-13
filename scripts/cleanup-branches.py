#!/usr/bin/env python3
"""
Branch Cleanup Helper for NDAX Quantum Engine
DELETION FUNCTIONALITY DISABLED - This script has been disabled to prevent accidental data loss
Generates commands and provides guidance for cleaning up 24 copilot branches
"""

import sys
from datetime import datetime

print("=" * 60)
print("ERROR: Deletion functionality has been disabled")
print("=" * 60)
print()
print("This script has been disabled to prevent accidental deletion of branches.")
print("All deletion operations have been removed from the repository.")
print()
print("If you need to delete branches:")
print("  1. Go to GitHub repository in browser")
print("  2. Navigate to branches page")
print("  3. Manually delete branches after careful review")
print()
print("Script execution blocked for safety.")
print("=" * 60)
sys.exit(1)

# Original script content below (DISABLED)

# Top 8 branches to merge to main
TOP_8_BRANCHES = [
    "feature/autonomous-job-automation-complete",
    "feature/auto-start-system",
    "fix/lint-and-tests",
    "copilot/configure-copilot-instructions",
    "copilot/fix-ci-cd-workflow-issues",
    "copilot/add-autostart-system-features",
    "copilot/consolidate-mobile-styles",
    "copilot/add-todo-list-feature",
]

# Branches to delete after merging top 8
BRANCHES_TO_DELETE = [
    "copilot/add-todo-list-application",
    "copilot/add-wallet-for-bots",
    "copilot/finish-original-issue",
    "copilot/fix-copilot-access-issue",
    "copilot/fix-copilot-review-issue",
    "copilot/fix-failjob-async-await-issue",
    "copilot/fix-pull-request-comments",
    "copilot/improve-variable-and-function-names",
    "copilot/improve-variable-function-names",
    "copilot/rebase-copilot-instructions-branch",
    "copilot/remove-all-duplicates",
    "copilot/remove-fork-invitation",
    "copilot/remove-forking-allowance",
    "copilot/resolve-get-it-done-issue",
    "copilot/resolve-pull-request-overview-issues",
    "copilot/setup-copilot-instructions",
    "copilot/setup-copilot-instructions-again",
    "copilot/status-report",
    "copilot/update-forking-to-false",
]

REPO_OWNER = "oconnorw225-del"
REPO_NAME = "ndax-quantum-engine"


def print_header(text):
    """Print a formatted section header."""
    print("\n" + "=" * 60)
    print(f"  {text}")
    print("=" * 60 + "\n")


def print_github_cli_commands():
    """Print GitHub CLI commands for branch cleanup."""
    print_header("GitHub CLI Commands")
    
    print("# Authenticate with GitHub CLI first:")
    print("gh auth login\n")
    
    print("# Switch to main branch and update:")
    print("git checkout main")
    print("git pull origin main\n")
    
    print("# Merge top 8 branches:")
    for i, branch in enumerate(TOP_8_BRANCHES, 1):
        print(f"\n# {i}. Merge {branch}")
        print(f"gh pr list --head {branch}")
        print(f"# Review the PR, then merge:")
        print(f"gh pr merge {branch} --merge --delete-branch")
    
    print("\n" + "-" * 60)
    print("\n# Delete remaining copilot branches:")
    for branch in BRANCHES_TO_DELETE:
        print(f"gh api -X DELETE repos/{REPO_OWNER}/{REPO_NAME}/git/refs/heads/{branch}")
    
    print("\n# Cleanup local repository:")
    print("git fetch --all --prune")
    print("git branch -r")


def print_web_interface_guide():
    """Print instructions for using GitHub web interface."""
    print_header("GitHub Web Interface Instructions")
    
    print("STEP 1: Merge Top 8 Branches")
    print("-" * 60)
    print(f"1. Go to: https://github.com/{REPO_OWNER}/{REPO_NAME}/pulls")
    print("2. For each of these branches, find or create a PR:\n")
    for i, branch in enumerate(TOP_8_BRANCHES, 1):
        print(f"   {i}. {branch}")
        print(f"      Compare: https://github.com/{REPO_OWNER}/{REPO_NAME}/compare/main...{branch}")
    
    print("\n3. Review each PR and click 'Merge pull request'")
    print("4. Optionally check 'Delete branch after merge'\n")
    
    print("STEP 2: Delete Remaining Branches")
    print("-" * 60)
    print(f"1. Go to: https://github.com/{REPO_OWNER}/{REPO_NAME}/branches")
    print(f"2. Delete these {len(BRANCHES_TO_DELETE)} branches:\n")
    for i, branch in enumerate(BRANCHES_TO_DELETE, 1):
        print(f"   {i}. {branch}")
    
    print("\n3. Click the trash icon next to each branch")
    print("4. Confirm deletion when prompted")


def print_comparison_urls():
    """Print comparison URLs for reviewing changes."""
    print_header("Review Changes Before Merging")
    
    for i, branch in enumerate(TOP_8_BRANCHES, 1):
        print(f"\n{i}. {branch}")
        print(f"   https://github.com/{REPO_OWNER}/{REPO_NAME}/compare/main...{branch}")


def print_summary():
    """Print cleanup summary statistics."""
    print_header("Cleanup Summary")
    
    total_branches = 29
    to_merge = len(TOP_8_BRANCHES)
    to_delete = len(BRANCHES_TO_DELETE)
    remaining = total_branches - to_merge - to_delete
    
    print(f"Total branches before cleanup:  {total_branches}")
    print(f"Branches to merge to main:      {to_merge}")
    print(f"Branches to delete:             {to_delete}")
    print(f"Expected remaining branches:    ~{remaining}-5 (main + active work)")
    print(f"\nGenerated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")


def generate_script_file():
    """Generate a shell script file with all commands."""
    filename = f"cleanup-commands-{datetime.now().strftime('%Y%m%d')}.sh"
    
    with open(filename, 'w') as f:
        f.write("#!/bin/bash\n")
        f.write("# Generated branch cleanup commands\n")
        f.write(f"# Generated: {datetime.now()}\n\n")
        
        f.write("# Switch to main\n")
        f.write("git checkout main\n")
        f.write("git pull origin main\n\n")
        
        f.write("# Merge top 8 branches\n")
        for branch in TOP_8_BRANCHES:
            f.write(f"gh pr merge {branch} --merge --delete-branch\n")
        
        f.write("\n# Delete remaining branches\n")
        for branch in BRANCHES_TO_DELETE:
            f.write(f"gh api -X DELETE repos/{REPO_OWNER}/{REPO_NAME}/git/refs/heads/{branch}\n")
        
        f.write("\n# Cleanup\n")
        f.write("git fetch --all --prune\n")
    
    print(f"Script saved to: {filename}")
    print(f"Make it executable with: chmod +x {filename}")


def main():
    """Main function to run the branch cleanup helper."""
    print("\n" + "=" * 60)
    print("  NDAX Quantum Engine - Branch Cleanup Helper")
    print("=" * 60)
    
    if len(sys.argv) > 1:
        command = sys.argv[1].lower()
        
        if command == "cli":
            print_github_cli_commands()
        elif command == "web":
            print_web_interface_guide()
        elif command == "compare":
            print_comparison_urls()
        elif command == "script":
            generate_script_file()
        elif command == "summary":
            print_summary()
        else:
            print(f"\nUnknown command: {command}")
            print_usage()
    else:
        print_usage()
    
    print("\n")


def print_usage():
    """Print usage instructions."""
    print("\nUsage: python3 cleanup-branches.py [command]\n")
    print("Commands:")
    print("  cli      - Print GitHub CLI commands")
    print("  web      - Print web interface instructions")
    print("  compare  - Print comparison URLs for reviewing changes")
    print("  script   - Generate a shell script with all commands")
    print("  summary  - Print cleanup summary\n")
    print("Examples:")
    print("  python3 cleanup-branches.py cli")
    print("  python3 cleanup-branches.py web")
    print("  python3 cleanup-branches.py script\n")


if __name__ == "__main__":
    main()
