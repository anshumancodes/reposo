# OpenRepo

A CLI for scaffolding a full-stack TypeScript monorepo.

OpenRepo sets up a clean monorepo with separate applications and shared packages. During setup, you can choose the package manager you want to use.

## Features

- Full-stack TypeScript monorepo
- Web and API applications
- Shared UI package
- Shared common package
- Shared TypeScript configuration
- npm or pnpm
- Interactive project setup

## Structure

```text
my-app/
├── apps/
│   ├── web/
│   └── api/
├── packages/
│   ├── typescript-config/
│   ├── ui/
│   └── common/
├── package.json
└── lockfile
```

### Apps

- `web` - Frontend application
- `api` - Backend application

### Packages

- `typescript-config` - Shared TypeScript configurations
- `ui` - Shared UI components
- `common` - Shared utilities and code

## Usage

Create a new repository:

```bash
npx openrepo my-app
```

Or run the CLI interactively:

```bash
npx openrepo
```

OpenRepo will prompt you to configure the project, including your preferred package manager:

```text
Project name: my-app

Choose a package manager:
> npm
  pnpm
```

After setup:

```bash
cd my-app
```

OpenRepo will generate the appropriate lockfile and workspace configuration for the selected package manager.

## Package Managers

OpenRepo currently supports:

- npm
- pnpm

More package managers may be supported in the future.

## Development

The generated project uses workspaces to manage applications and shared packages in a single repository.

You can add new applications under `apps/` and shared packages under `packages/` as your project grows.

## Contributing

Contributions are welcome.

1. Fork the repository
2. Create a branch for your changes
3. Make your changes
4. Open a pull request

For larger changes, consider opening an issue first to discuss the proposal.

## License

OpenRepo is licensed under the GNU Affero General Public License v3.0. See the [LICENSE](./LICENSE) file for details.
