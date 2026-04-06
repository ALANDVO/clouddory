# CloudDory

The open-source cloud operations platform. FinOps, security, threat intelligence, and automation — all in one.

## What is CloudDory?

CloudDory replaces 5+ tools with one unified platform:
- **FinOps** — Cost explorer, waste scanner, anomaly detection, AiTags
- **Security** — CVE tracking (NVD + CISA KEV), security posture, compliance
- **Threat Intelligence** — IOC management, threat feeds, adversary profiles  
- **Automation** — Playbooks, workflow integrations, automated response
- **DoryAI** — AI assistant powered by Gemini/OpenAI/Anthropic

## Quick Start

### Prerequisites
- Node.js 18+
- MySQL/MariaDB 10.5+
- npm

### Setup

1. Clone the repo
2. Copy `.env.example` to `.env` and fill in your database URL
3. Install dependencies and set up the database:
   ```bash
   cd apps/dashboard
   npm install
   npx prisma db push
   npx prisma generate
   npm run build
   npm start
   ```
4. Open http://localhost:3000 and create your first account
5. The first registered user becomes admin

### Docker (recommended)

```bash
docker-compose up -d
```

### Configure AI

Go to Settings > AI Config to add your API keys:
- Google Gemini (recommended)
- OpenAI
- Anthropic
- OpenRouter

### Connect Cloud Accounts

Settings > Cloud Accounts > Connect AWS/GCP/Azure

## Architecture

- **Dashboard** (`apps/dashboard`) — Main application (Next.js 14)
- **Admin** (`apps/admin`) — Admin panel (Next.js 14)  
- **Landing** (`apps/landing`) — Marketing site (Next.js 14, static export)
- **Database** — MySQL/MariaDB with Prisma ORM

## License

MIT
