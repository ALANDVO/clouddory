#!/usr/bin/env bash
# CloudDory — Open Source Cloud Operations Platform
# One-liner: curl -fsSL https://clouddory.com/install.sh | bash
#
# Built by Alan Vo — alanvo@gmail.com
# https://github.com/ALANDVO/clouddory

set -e

CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'
BOLD='\033[1m'

echo ""
echo -e "${CYAN}${BOLD}  CloudDory Installer${NC}"
echo -e "  Open-source cloud operations platform"
echo -e "  ${CYAN}https://github.com/ALANDVO/clouddory${NC}"
echo ""

# ─── Detect OS ───────────────────────────────────────────────
OS="$(uname -s)"
case "$OS" in
  Linux*)   PLATFORM="linux";;
  Darwin*)  PLATFORM="macos";;
  *)        PLATFORM="unknown";;
esac
echo -e "${CYAN}→${NC} Platform: ${BOLD}$PLATFORM${NC}"

# ─── Check prerequisites ────────────────────────────────────
HAS_DOCKER=false
HAS_NODE=false

if command -v docker &>/dev/null && command -v docker-compose &>/dev/null; then
  HAS_DOCKER=true
  echo -e "  ${GREEN}✓${NC} Docker found"
fi

if command -v node &>/dev/null; then
  NODE_VERSION=$(node -v | sed 's/v//' | cut -d. -f1)
  if [ "$NODE_VERSION" -ge 18 ] 2>/dev/null; then
    HAS_NODE=true
    echo -e "  ${GREEN}✓${NC} Node.js $(node -v)"
  else
    echo -e "  ${YELLOW}!${NC} Node.js $NODE_VERSION found, need 18+"
  fi
fi

if [ "$HAS_DOCKER" = false ] && [ "$HAS_NODE" = false ]; then
  echo -e "${RED}Error: Docker or Node.js 18+ required.${NC}"
  echo "  Install: https://docs.docker.com/get-docker/ or https://nodejs.org/"
  exit 1
fi

# ─── Choose method ───────────────────────────────────────────
if [ "$HAS_DOCKER" = true ]; then
  INSTALL_METHOD="docker"
  echo -e "${CYAN}→${NC} Using Docker Compose"
else
  INSTALL_METHOD="node"
  echo -e "${CYAN}→${NC} Using Node.js"
fi

# ─── Clone ───────────────────────────────────────────────────
INSTALL_DIR="${CLOUDDORY_DIR:-$HOME/clouddory}"

if [ -d "$INSTALL_DIR" ]; then
  echo -e "${YELLOW}→${NC} $INSTALL_DIR exists. Overwrite? (y/N): "
  read -r REPLY
  [ "$REPLY" != "y" ] && [ "$REPLY" != "Y" ] && exit 0
  rm -rf "$INSTALL_DIR"
fi

echo -e "${CYAN}→${NC} Cloning CloudDory..."
git clone --depth 1 https://github.com/ALANDVO/clouddory.git "$INSTALL_DIR" 2>/dev/null
cd "$INSTALL_DIR"
echo -e "  ${GREEN}✓${NC} Cloned to $INSTALL_DIR"

# ─── Generate secrets ────────────────────────────────────────
NEXTAUTH_SECRET=$(openssl rand -base64 32 2>/dev/null || head -c 32 /dev/urandom | base64)
DB_PASSWORD=$(openssl rand -hex 12 2>/dev/null || head -c 12 /dev/urandom | od -An -tx1 | tr -d ' \n')
ADMIN_PASSWORD="CloudDory2026"

# ─── Docker install ──────────────────────────────────────────
if [ "$INSTALL_METHOD" = "docker" ]; then
  echo -e "${CYAN}→${NC} Starting with Docker Compose..."

  cat > .env << EOF
DATABASE_URL="mysql://root:${DB_PASSWORD}@db:3306/clouddory"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="${NEXTAUTH_SECRET}"
ADMIN_EMAILS=""
EOF

  sed -i.bak "s/MYSQL_ROOT_PASSWORD: clouddory/MYSQL_ROOT_PASSWORD: ${DB_PASSWORD}/" docker-compose.yml 2>/dev/null || true
  docker-compose up -d --build 2>&1

  echo ""
  echo -e "${GREEN}${BOLD}✓ CloudDory is running!${NC}"
  echo ""
  echo -e "  Dashboard:  ${CYAN}http://localhost:3000${NC}"
  echo -e "  Register at ${CYAN}http://localhost:3000/register${NC}"
  echo ""
  echo -e "  ${YELLOW}First user to register becomes admin.${NC}"
  exit 0
fi

# ─── Node.js install ─────────────────────────────────────────
cd apps/dashboard

# Symlink prisma from repo root
ln -sf ../../prisma prisma 2>/dev/null || true

# Add swap if low memory (< 2GB free)
FREE_MEM=$(free -m 2>/dev/null | awk '/^Mem:/{print $7}' || echo "4096")
if [ "${FREE_MEM:-4096}" -lt 2000 ]; then
  echo -e "${YELLOW}→${NC} Low memory (${FREE_MEM}MB free). Adding swap..."
  if [ ! -f /swapfile ]; then
    sudo dd if=/dev/zero of=/swapfile bs=1M count=2048 2>/dev/null
    sudo chmod 600 /swapfile && sudo mkswap /swapfile &>/dev/null && sudo swapon /swapfile &>/dev/null
    echo -e "  ${GREEN}✓${NC} 2GB swap added"
  fi
fi

echo -e "${CYAN}→${NC} Installing dependencies..."
npm install 2>&1 | tail -3

# Install autoprefixer if missing
npm ls autoprefixer &>/dev/null || npm install autoprefixer 2>&1 | tail -1

# ─── Database setup ──────────────────────────────────────────
echo -e "${CYAN}→${NC} Setting up database..."
DB_URL=""

if command -v mysql &>/dev/null; then
  # Try root with no password
  if mysql -u root -e "SELECT 1" &>/dev/null 2>&1; then
    mysql -u root -e "CREATE DATABASE IF NOT EXISTS clouddory CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci; CREATE USER IF NOT EXISTS 'clouddory'@'localhost' IDENTIFIED BY '${DB_PASSWORD}'; GRANT ALL ON clouddory.* TO 'clouddory'@'localhost'; FLUSH PRIVILEGES;" 2>/dev/null
    DB_URL="mysql://clouddory:${DB_PASSWORD}@localhost:3306/clouddory"
    echo -e "  ${GREEN}✓${NC} Database created"
  # Try sudo mysql
  elif sudo mysql -e "SELECT 1" &>/dev/null 2>&1; then
    sudo mysql -e "CREATE DATABASE IF NOT EXISTS clouddory CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci; CREATE USER IF NOT EXISTS 'clouddory'@'localhost' IDENTIFIED BY '${DB_PASSWORD}'; GRANT ALL ON clouddory.* TO 'clouddory'@'localhost'; FLUSH PRIVILEGES;" 2>/dev/null
    DB_URL="mysql://clouddory:${DB_PASSWORD}@localhost:3306/clouddory"
    echo -e "  ${GREEN}✓${NC} Database created (sudo)"
  else
    echo -e "  ${YELLOW}!${NC} Cannot connect to MySQL. Edit DATABASE_URL in .env"
    DB_URL="mysql://user:password@localhost:3306/clouddory"
  fi
else
  echo -e "  ${YELLOW}!${NC} MySQL not found. Install MySQL/MariaDB and edit .env"
  DB_URL="mysql://user:password@localhost:3306/clouddory"
fi

# ─── Create .env ─────────────────────────────────────────────
cat > .env << EOF
DATABASE_URL="${DB_URL}"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="${NEXTAUTH_SECRET}"
ADMIN_EMAILS=""
GEMINI_API_KEY=""
EOF

echo -e "  ${GREEN}✓${NC} Created .env"

# ─── Prisma ─────────────────────────────────────────────────
echo -e "${CYAN}→${NC} Setting up database schema..."
npx prisma db push --skip-generate 2>&1 | tail -3
npx prisma generate 2>&1 | tail -3
echo -e "  ${GREEN}✓${NC} Schema ready"

# ─── Create default admin user ───────────────────────────────
echo -e "${CYAN}→${NC} Creating default admin user..."
node -e "
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async () => {
  const hash = await bcrypt.hash('${ADMIN_PASSWORD}', 12);
  await prisma.user.upsert({
    where: { email: 'admin@clouddory.local' },
    create: { email: 'admin@clouddory.local', name: 'Admin', passwordHash: hash },
    update: { passwordHash: hash },
  });
  console.log('  Default admin created');
  await prisma.\$disconnect();
})().catch(e => { console.error('  Could not create admin:', e.message); process.exit(0); });
" 2>&1
echo -e "  ${GREEN}✓${NC} Login: admin@clouddory.local / ${ADMIN_PASSWORD}"

# ─── Build ───────────────────────────────────────────────────
echo ""
echo -e "${CYAN}→${NC} Building CloudDory (this takes 2-5 minutes)..."
npm run build 2>&1 | tail -5

# ─── Start ───────────────────────────────────────────────────
echo ""
echo -e "${CYAN}→${NC} Starting CloudDory..."
npm start -- -p 3000 &
DASHBOARD_PID=$!
sleep 5

echo ""
echo -e "${GREEN}${BOLD}╔══════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}${BOLD}║         CloudDory is running!                ║${NC}"
echo -e "${GREEN}${BOLD}╚══════════════════════════════════════════════╝${NC}"
echo ""
echo -e "  Dashboard:  ${CYAN}http://localhost:3000${NC}"
echo ""
echo -e "  ${BOLD}Default Login:${NC}"
echo -e "  Email:    ${CYAN}admin@clouddory.local${NC}"
echo -e "  Password: ${CYAN}${ADMIN_PASSWORD}${NC}"
echo ""
echo -e "  ${YELLOW}Change the default password after first login!${NC}"
echo ""
echo -e "  ${BOLD}Next steps:${NC}"
echo "  1. Log in and go through onboarding"
echo "  2. Settings → AI Config to add Gemini/OpenAI keys"
echo "  3. Settings → Cloud Accounts to connect AWS/GCP/Azure"
echo ""
echo -e "  Docs:    ${CYAN}https://clouddory.com/resources/docs/${NC}"
echo -e "  GitHub:  ${CYAN}https://github.com/ALANDVO/clouddory${NC}"
echo -e "  Support: ${CYAN}alanvo@gmail.com${NC}"
echo ""
