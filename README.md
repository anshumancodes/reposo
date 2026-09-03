# reposo

A lightweight CLI for scaffolding a full-stack TypeScript monorepo with sensible defaults.

## Usage

```bash
npx reposo my-app
```

Or with a specific package manager:

```bash
npx reposo my-app -p npm
```

## Generated structure

```text
my-app/
├── apps/
│   ├── web/          — Next.js / Vite / plain TS
│   └── api/          — Express / Fastify / Hono / plain TS
├── packages/
│   ├── ts-config/    — Shared TypeScript base config
│   ├── eslint-config/— Shared ESLint flat config
│   ├── ui/           — Shared UI components
│   └── common/       — Shared utilities
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Options

```text
Usage:
  reposo <project-name> [options]

Options:
  -y, --yes                     Skip prompts and use sensible defaults
  -p, --package-manager <name>  Package manager to use (npm | pnpm)  [default: pnpm]
  -t, --template <name>         Template to use (fullstack)          [default: fullstack]
      --no-install              Skip dependency installation
      --no-git                  Skip git initialization
  -h, --help                    Show this help message
  -v, --version                 Print the version number
```

### Defaults (used with `--yes`)

| Option          | Default  |
|-----------------|----------|
| Package manager | `pnpm`   |
| Web framework   | Next.js  |
| API framework   | Express  |
| Install deps    | yes      |
| Init git        | yes      |

## Interactive setup

Running `reposo my-app` prompts you to configure:

- Package manager (`npm` or `pnpm`)
- Web framework (`Next.js`, `Vite`, or `None`)
- API framework (`Express`, `Fastify`, `Hono`, or `None`)
- Whether to install dependencies
- Whether to initialize git

## Non-interactive

```bash
reposo my-app --yes
```

Uses all defaults above without prompting.

## Workspace protocols

- **pnpm**: uses `workspace:*` for cross-package references
- **npm**: uses `*` for cross-package references, with a root `workspaces` field in `package.json`

## License

AGPL-3.0-only — see [LICENSE](./LICENSE).
