# PlayCraft

Craft amazing games with AI. Create browser games using natural language.

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 9+
- Supabase CLI (for local development)

### Installation

```bash
# Clone the repository
git clone https://github.com/mohammadreza87/playcraft.git
cd playcraft

# Install dependencies
pnpm install

# Copy environment variables
cp apps/web/.env.example apps/web/.env
# Edit .env with your Supabase credentials

# Start development server
pnpm dev
```

### Project Structure

```
playcraft/
├── apps/
│   ├── web/      # Main PlayCraft application
│   └── docs/     # VitePress documentation
└── supabase/     # Supabase functions and migrations
```

### Scripts

- `pnpm dev` - Start the web app
- `pnpm dev:docs` - Start the documentation site
- `pnpm build` - Build the web app
- `pnpm test` - Run tests
- `pnpm lint` - Run linter

## Supabase Setup

This project uses Supabase for backend services. To deploy functions:

```bash
supabase functions deploy generate-playcraft
```

## License

MIT
