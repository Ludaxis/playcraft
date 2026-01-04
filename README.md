# Joyixir

The magic potion for building apps. Create full-stack applications with AI using natural language.

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 9+
- Supabase CLI (for local development)

### Installation

```bash
# Clone the repository
git clone https://github.com/mohammadreza87/joyixir.git
cd joyixir

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
joyixir/
├── apps/
│   ├── web/      # Main Joyixir application
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
supabase functions deploy generate-joyixir
```

## License

MIT
