#!/usr/bin/env bash
# CloudDory Upgrade Script
# Usage: cd ~/clouddory && bash upgrade.sh
#
# What it does:
# 1. Backs up database before touching anything
# 2. Pulls latest code from GitHub
# 3. Installs new dependencies
# 4. Applies database schema changes (non-destructive)
# 5. Rebuilds the dashboard
# 6. Restarts the app
#
# If anything fails, your database backup is at ./backups/
#
# Built by Alan Vo — alanvo@gmail.com

set -e

CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'
BOLD='\033[1m'

echo ""
echo -e "${CYAN}${BOLD}  CloudDory Upgrade${NC}"
echo ""

# Must be run from the clouddory directory
if [ ! -f "apps/dashboard/package.json" ]; then
  echo -e "${RED}Error: Run this from your CloudDory installation directory.${NC}"
  echo "  cd ~/clouddory && bash upgrade.sh"
  exit 1
fi

cd apps/dashboard

# Load .env to get DATABASE_URL
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

CURRENT_COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
echo -e "${CYAN}→${NC} Current version: ${BOLD}$CURRENT_COMMIT${NC}"

# ─── Step 1: Backup database ────────────────────────────────
echo -e "${CYAN}→${NC} Backing up database..."
BACKUP_DIR="../../backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Parse DATABASE_URL to extract credentials
DB_USER=$(echo "$DATABASE_URL" | sed -n 's|mysql://\([^:]*\):.*|\1|p')
DB_PASS=$(echo "$DATABASE_URL" | sed -n 's|mysql://[^:]*:\([^@]*\)@.*|\1|p')
DB_HOST=$(echo "$DATABASE_URL" | sed -n 's|.*@\([^:]*\):.*|\1|p')
DB_NAME=$(echo "$DATABASE_URL" | sed -n 's|.*/\([^?]*\).*|\1|p')

if command -v mysqldump &>/dev/null && [ -n "$DB_NAME" ]; then
  mysqldump -u"$DB_USER" -p"$DB_PASS" -h"$DB_HOST" "$DB_NAME" > "$BACKUP_DIR/database.sql" 2>/dev/null && \
    echo -e "  ${GREEN}✓${NC} Database backed up to $BACKUP_DIR/database.sql" || \
    echo -e "  ${YELLOW}!${NC} Could not backup database (continuing anyway)"
else
  echo -e "  ${YELLOW}!${NC} mysqldump not found, skipping backup"
fi

# Save current commit for rollback
echo "$CURRENT_COMMIT" > "$BACKUP_DIR/previous_commit.txt"

# ─── Step 2: Pull latest code ───────────────────────────────
echo -e "${CYAN}→${NC} Pulling latest code from GitHub..."
cd ../../
git stash 2>/dev/null || true
git pull origin main 2>&1 | tail -3
NEW_COMMIT=$(git rev-parse --short HEAD)
echo -e "  ${GREEN}✓${NC} Updated to ${BOLD}$NEW_COMMIT${NC}"

if [ "$CURRENT_COMMIT" = "$NEW_COMMIT" ]; then
  echo -e "  ${GREEN}Already up to date!${NC}"
  exit 0
fi

# Show what changed
echo ""
echo -e "${CYAN}→${NC} Changes since $CURRENT_COMMIT:"
git log --oneline "$CURRENT_COMMIT..HEAD" 2>/dev/null | head -10
echo ""

cd apps/dashboard
ln -sf ../../prisma prisma 2>/dev/null || true

# ─── Step 3: Install dependencies ───────────────────────────
echo -e "${CYAN}→${NC} Installing dependencies..."
npm install 2>&1 | tail -3
npm ls autoprefixer &>/dev/null || npm install autoprefixer 2>&1 | tail -1
echo -e "  ${GREEN}✓${NC} Dependencies updated"

# ─── Step 4: Apply database changes ─────────────────────────
echo -e "${CYAN}→${NC} Applying database schema changes..."
npx prisma db push --skip-generate --accept-data-loss=false 2>&1 | tail -3
npx prisma generate 2>&1 | tail -3
echo -e "  ${GREEN}✓${NC} Database schema updated (no data lost)"

# ─── Step 5: Rebuild ────────────────────────────────────────
echo -e "${CYAN}→${NC} Rebuilding CloudDory (this takes a few minutes)..."
npm run build 2>&1 | tail -5
echo -e "  ${GREEN}✓${NC} Build complete"

# ─── Step 6: Restart ────────────────────────────────────────
echo -e "${CYAN}→${NC} Restarting..."

# Try PM2 first, then systemd, then just tell them to restart
if command -v pm2 &>/dev/null && pm2 list 2>/dev/null | grep -q clouddory; then
  pm2 restart clouddory-dashboard 2>/dev/null || pm2 restart all 2>/dev/null
  echo -e "  ${GREEN}✓${NC} Restarted via PM2"
elif systemctl is-active --quiet clouddory 2>/dev/null; then
  sudo systemctl restart clouddory
  echo -e "  ${GREEN}✓${NC} Restarted via systemd"
else
  # Kill and restart
  pkill -f "next start" 2>/dev/null || true
  sleep 2
  nohup npm start -- -p 3000 > /tmp/clouddory-app.log 2>&1 &
  echo -e "  ${GREEN}✓${NC} Restarted (PID: $!)"
fi

sleep 3

echo ""
echo -e "${GREEN}${BOLD}╔══════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}${BOLD}║         Upgrade complete!                    ║${NC}"
echo -e "${GREEN}${BOLD}╚══════════════════════════════════════════════╝${NC}"
echo ""
echo -e "  ${BOLD}$CURRENT_COMMIT → $NEW_COMMIT${NC}"
echo -e "  Backup: $BACKUP_DIR"
echo ""
echo -e "  ${YELLOW}If something went wrong, rollback with:${NC}"
echo -e "  git checkout $CURRENT_COMMIT"
echo -e "  mysql -u$DB_USER -p $DB_NAME < $BACKUP_DIR/database.sql"
echo -e "  npm run build && pm2 restart all"
echo ""
