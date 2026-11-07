# Contributing to CloudDory

Thanks for your interest in contributing to CloudDory! We welcome contributions of all kinds.

## Getting Started

1. Fork the repo
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/clouddory.git`
3. Create a branch: `git checkout -b feature/your-feature`
4. Set up the dev environment (see README.md)

## Development

```bash
cd apps/dashboard
npm install
cp ../../.env.example .env
# Edit .env with your local database URL
npx prisma db push
npm run dev
```

The dashboard runs at `http://localhost:3000`.

## What to Work On

- Check [open issues](https://github.com/ALANDVO/clouddory/issues) for bugs and feature requests
- Look for `good first issue` labels
- Check the roadmap in discussions

### Priority Areas

- **Cloud connectors** — GCP and Azure integration (AWS is complete)
- **Agent-based scanning** — CVE scanning on running workloads
- **Email notifications** — Transactional email for alerts and invitations
- **Additional AI providers** — Better support for OpenAI, Anthropic, local models
- **Kubernetes cost tracking** — Container-level cost attribution

## Code Style

- TypeScript strict mode
- Tailwind CSS for styling (follow the navy/cyan dark theme)
- Prisma for all database access
- `'use client'` for interactive components
- API routes use auth checks: `const session = await auth()`

## Pull Request Process

1. Make sure your code builds: `npm run build`
2. Test your changes manually
3. Write a clear PR description explaining what and why
4. Reference any related issues

## Questions?

Email [alanvo@gmail.com](mailto:alanvo@gmail.com) or open a discussion on GitHub.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Alan Vo · [alanvo.net](https://alanvo.net)
