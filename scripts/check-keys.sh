#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# Elite Tenancy — Pre-commit secret scanner
#
# Blocks commits that accidentally include:
#   • Stripe live secret keys    (sk_live_...)
#   • Stripe test secret keys    (sk_test_...)   — should use rk_ restricted keys
#   • Generic high-entropy tokens in source files
#
# Install as a pre-commit hook:
#   cp scripts/check-keys.sh .git/hooks/pre-commit
#   chmod +x .git/hooks/pre-commit
#
# Or use with Husky (package.json → "pre-commit": "bash scripts/check-keys.sh")
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No colour

FOUND=0

echo "🔍 Scanning staged files for secrets..."

# Get list of staged files (excluding deleted files)
STAGED=$(git diff --cached --name-only --diff-filter=ACM 2>/dev/null || true)

if [ -z "$STAGED" ]; then
  echo "  No staged files."
  exit 0
fi

for file in $STAGED; do
  # Skip binary files, lock files, and this script itself
  case "$file" in
    *.lock|*.png|*.jpg|*.jpeg|*.gif|*.svg|*.ico|*.woff*|*.ttf|*.eot|*.mp4|*.pdf|check-keys.sh|scripts/check-keys.sh)
      continue ;;
  esac

  # Skip files that don't exist (deleted in working tree but staged as modify)
  [ -f "$file" ] || continue

  # ── Stripe live secret key ────────────────────────────────────────────────
  if grep -qE 'sk_live_[a-zA-Z0-9]{20,}' "$file" 2>/dev/null; then
    echo -e "${RED}❌ BLOCKED: Stripe LIVE secret key found in $file${NC}"
    echo "   Use a restricted key (rk_live_...) with least-privilege permissions."
    FOUND=1
  fi

  # ── Stripe test secret key ────────────────────────────────────────────────
  if grep -qE 'sk_test_[a-zA-Z0-9]{20,}' "$file" 2>/dev/null; then
    echo -e "${YELLOW}⚠️  WARNING: Stripe TEST secret key found in $file${NC}"
    echo "   Commit blocked. Switch to a restricted key (rk_test_...) for testing."
    FOUND=1
  fi

  # ── Generic high-entropy secrets (DATABASE_URL with password, etc.) ───────
  # Matches patterns like: postgres://user:password@host or mysql://...
  if grep -qE '(postgres|mysql|mongodb|redis)://[^:]+:[^@]{8,}@' "$file" 2>/dev/null; then
    echo -e "${RED}❌ BLOCKED: Database connection string with credentials found in $file${NC}"
    echo "   Move this to an environment variable and use .env files (gitignored)."
    FOUND=1
  fi

  # ── AWS keys ─────────────────────────────────────────────────────────────
  if grep -qE 'AKIA[0-9A-Z]{16}' "$file" 2>/dev/null; then
    echo -e "${RED}❌ BLOCKED: AWS Access Key ID found in $file${NC}"
    FOUND=1
  fi

done

if [ "$FOUND" -eq 1 ]; then
  echo ""
  echo -e "${RED}Commit rejected. Remove secrets before committing.${NC}"
  echo "Tip: Add the file to .gitignore or use 'git rm --cached <file>' to unstage it."
  exit 1
fi

echo "✅ No secrets found. Proceeding with commit."
exit 0
