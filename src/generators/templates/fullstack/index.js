import path from "path";
import { writeFile, writeJson, mkdirp } from "../../../utils/filesystem.js";
import { workspaceDep } from "../../../utils/package-manager.js";

// Web framework meta

const WEB_META = {
  nextjs: {
    label: "Next.js",
    deps: { next: "^15.0.0", react: "^19.0.0", "react-dom": "^19.0.0" },
    devDeps: { "@types/react": "^19.0.0", "@types/react-dom": "^19.0.0" },
    scripts: {
      dev: "next dev",
      build: "next build",
      start: "next start",
    },
  },
  vite: {
    label: "Vite",
    deps: { react: "^19.0.0", "react-dom": "^19.0.0" },
    devDeps: {
      vite: "^6.0.0",
      "@vitejs/plugin-react": "^4.0.0",
      "@types/react": "^19.0.0",
      "@types/react-dom": "^19.0.0",
    },
    scripts: {
      dev: "vite",
      build: "vite build",
      preview: "vite preview",
    },
  },
  none: {
    label: "None",
    deps: {},
    devDeps: {},
    scripts: { dev: "node src/index.js" },
  },
};

// API framework meta

const API_META = {
  express: {
    label: "Express",
    deps: { express: "^4.21.0" },
    devDeps: { "@types/express": "^5.0.0" },
    scripts: {
      dev: "tsx watch src/index.ts",
      build: "tsc",
      start: "node dist/index.js",
    },
    envVars: ["PORT=3001"],
  },
  fastify: {
    label: "Fastify",
    deps: { fastify: "^5.0.0" },
    devDeps: {},
    scripts: {
      dev: "tsx watch src/index.ts",
      build: "tsc",
      start: "node dist/index.js",
    },
    envVars: ["PORT=3001"],
  },
  hono: {
    label: "Hono",
    deps: { hono: "^4.0.0" },
    devDeps: { "@hono/node-server": "^1.0.0" },
    scripts: {
      dev: "tsx watch src/index.ts",
      build: "tsc",
      start: "node dist/index.js",
    },
    envVars: ["PORT=3001"],
  },
  none: {
    label: "None",
    deps: {},
    devDeps: {},
    scripts: { dev: "tsx watch src/index.ts", build: "tsc", start: "node dist/index.js" },
    envVars: [],
  },
};

// Entry-point content helpers

function webIndexContent(web) {
  if (web === "nextjs") {
    return `export default function Home() {
  return (
    <main>
      <h1>Hello from Next.js</h1>
    </main>
  );
}
`;
  }
  if (web === "vite") {
    return `import React from 'react';

export default function App() {
  return (
    <main>
      <h1>Hello from Vite</h1>
    </main>
  );
}
`;
  }
  return `// web placeholder\n`;
}

function apiIndexContent(api) {
  if (api === "express") {
    return `import express from 'express';

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(express.json());

app.get('/', (_req, res) => {
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(\`API listening on http://localhost:\${PORT}\`);
});
`;
  }
  if (api === "fastify") {
    return `import Fastify from 'fastify';

const app = Fastify({ logger: true });
const PORT = Number(process.env.PORT ?? 3001);

app.get('/', async () => ({ ok: true }));

app.listen({ port: PORT }, (err) => {
  if (err) { app.log.error(err); process.exit(1); }
});
`;
  }
  if (api === "hono") {
    return `import { Hono } from 'hono';
import { serve } from '@hono/node-server';

const app = new Hono();
const PORT = Number(process.env.PORT ?? 3001);

app.get('/', (c) => c.json({ ok: true }));

serve({ fetch: app.fetch, port: PORT }, () => {
  console.log(\`API listening on http://localhost:\${PORT}\`);
});
`;
  }
  return `// api placeholder\n`;
}

// Next.js specific files 

function createNextjsFiles(appPath) {
  writeFile(
    path.join(appPath, "next.config.mjs"),
    `/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@repo/ui', '@repo/common'],
};

export default nextConfig;
`
  );
  mkdirp(path.join(appPath, "src", "app"));
  writeFile(
    path.join(appPath, "src", "app", "layout.tsx"),
    `export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
`
  );
  writeFile(
    path.join(appPath, "src", "app", "page.tsx"),
    webIndexContent("nextjs")
  );
}

function createViteFiles(appPath) {
  writeFile(
    path.join(appPath, "vite.config.ts"),
    `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
});
`
  );
  writeFile(
    path.join(appPath, "index.html"),
    `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`
  );
  mkdirp(path.join(appPath, "src"));
  writeFile(
    path.join(appPath, "src", "main.tsx"),
    `import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(<App />);
`
  );
  writeFile(path.join(appPath, "src", "App.tsx"), webIndexContent("vite"));
}

// App generator

export function createWebApp(projectPath, web, packageManager) {
  const appPath = path.join(projectPath, "apps", "web");
  const meta = WEB_META[web];
  const wspDep = workspaceDep(packageManager);

  mkdirp(path.join(appPath, "src"));

  writeJson(path.join(appPath, "package.json"), {
    name: "web",
    version: "1.0.0",
    private: true,
    scripts: meta.scripts,
    dependencies: {
      "@repo/ui": wspDep,
      "@repo/common": wspDep,
      ...meta.deps,
    },
    devDependencies: {
      "@repo/ts-config": wspDep,
      "@repo/eslint-config": wspDep,
      typescript: "^5.7.0",
      tsx: "^4.19.0",
      ...meta.devDeps,
    },
  });

  writeJson(path.join(appPath, "tsconfig.json"), {
    extends: "@repo/ts-config/base.json",
    compilerOptions: {
      outDir: "dist",
      rootDir: "src",
      ...(web === "nextjs" || web === "vite"
        ? { jsx: "react-jsx", lib: ["ES2022", "DOM", "DOM.Iterable"] }
        : {}),
    },
    include: ["src"],
  });

  if (web === "nextjs") {
    createNextjsFiles(appPath);
  } else if (web === "vite") {
    createViteFiles(appPath);
  } else {
    writeFile(path.join(appPath, "src", "index.ts"), webIndexContent("none"));
  }
}

export function createApiApp(projectPath, api, packageManager) {
  const appPath = path.join(projectPath, "apps", "api");
  const meta = API_META[api];
  const wspDep = workspaceDep(packageManager);

  mkdirp(path.join(appPath, "src"));

  writeJson(path.join(appPath, "package.json"), {
    name: "api",
    version: "1.0.0",
    private: true,
    scripts: meta.scripts,
    dependencies: {
      "@repo/common": wspDep,
      ...meta.deps,
    },
    devDependencies: {
      "@repo/ts-config": wspDep,
      "@repo/eslint-config": wspDep,
      typescript: "^5.7.0",
      tsx: "^4.19.0",
      ...meta.devDeps,
    },
  });

  writeJson(path.join(appPath, "tsconfig.json"), {
    extends: "@repo/ts-config/base.json",
    compilerOptions: {
      outDir: "dist",
      rootDir: "src",
    },
    include: ["src"],
  });

  writeFile(path.join(appPath, "src", "index.ts"), apiIndexContent(api));
}

// Shared packages

export function createTsConfigPackage(projectPath) {
  const pkgPath = path.join(projectPath, "packages", "ts-config");
  mkdirp(pkgPath);

  writeJson(path.join(pkgPath, "base.json"), {
    $schema: "https://json.schemastore.org/tsconfig",
    compilerOptions: {
      target: "ES2022",
      module: "NodeNext",
      moduleResolution: "NodeNext",
      strict: true,
      esModuleInterop: true,
      skipLibCheck: true,
      forceConsistentCasingInFileNames: true,
      declaration: true,
      declarationMap: true,
      sourceMap: true,
    },
  });

  writeJson(path.join(pkgPath, "package.json"), {
    name: "@repo/ts-config",
    version: "1.0.0",
    private: true,
    exports: {
      "./base.json": "./base.json",
    },
  });
}

export function createEslintConfigPackage(projectPath) {
  const pkgPath = path.join(projectPath, "packages", "eslint-config");
  mkdirp(pkgPath);

  writeFile(
    path.join(pkgPath, "index.js"),
    `/** @type {import('eslint').Linter.Config[]} */
const config = [
  {
    rules: {
      "no-unused-vars": "warn",
      "no-console": "off",
      eqeqeq: ["error", "always"],
    },
  },
];

export default config;
`
  );

  writeJson(path.join(pkgPath, "package.json"), {
    name: "@repo/eslint-config",
    version: "1.0.0",
    private: true,
    type: "module",
    exports: {
      ".": "./index.js",
    },
    peerDependencies: {
      eslint: ">=9.0.0",
    },
  });
}

export function createUiPackage(projectPath, packageManager) {
  const pkgPath = path.join(projectPath, "packages", "ui");
  const wspDep = workspaceDep(packageManager);
  mkdirp(path.join(pkgPath, "src"));

  writeJson(path.join(pkgPath, "package.json"), {
    name: "@repo/ui",
    version: "1.0.0",
    private: true,
    type: "module",
    main: "./src/index.ts",
    exports: {
      ".": "./src/index.ts",
    },
    devDependencies: {
      "@repo/ts-config": wspDep,
      typescript: "^5.7.0",
    },
  });

  writeJson(path.join(pkgPath, "tsconfig.json"), {
    extends: "@repo/ts-config/base.json",
    compilerOptions: { outDir: "dist", rootDir: "src" },
    include: ["src"],
  });

  writeFile(
    path.join(pkgPath, "src", "index.ts"),
    `// @repo/ui — shared UI components
export * from './button.js';
`
  );

  writeFile(
    path.join(pkgPath, "src", "button.ts"),
    `export type ButtonProps = {
  label: string;
  onClick?: () => void;
};

// Extend with your preferred component library
export function createButton(props: ButtonProps): ButtonProps {
  return props;
}
`
  );
}

export function createCommonPackage(projectPath, packageManager) {
  const pkgPath = path.join(projectPath, "packages", "common");
  const wspDep = workspaceDep(packageManager);
  mkdirp(path.join(pkgPath, "src"));

  writeJson(path.join(pkgPath, "package.json"), {
    name: "@repo/common",
    version: "1.0.0",
    private: true,
    type: "module",
    main: "./src/index.ts",
    exports: {
      ".": "./src/index.ts",
    },
    devDependencies: {
      "@repo/ts-config": wspDep,
      typescript: "^5.7.0",
    },
  });

  writeJson(path.join(pkgPath, "tsconfig.json"), {
    extends: "@repo/ts-config/base.json",
    compilerOptions: { outDir: "dist", rootDir: "src" },
    include: ["src"],
  });

  writeFile(
    path.join(pkgPath, "src", "index.ts"),
    `// @repo/common — shared utilities

export function invariant(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
`
  );
}

//  Root-level files

export function createRootPackageJson(projectPath, projectName, packageManager) {
  const pkg = {
    name: projectName,
    private: true,
    scripts: {
      dev: "echo \"Run apps individually for now\"",
      build: "echo \"Add turbo or nx here to build all apps\"",
    },
  };

  if (packageManager === "npm") {
    pkg.workspaces = ["apps/*", "packages/*"];
  }

  writeJson(path.join(projectPath, "package.json"), pkg);

  if (packageManager === "pnpm") {
    writeFile(
      path.join(projectPath, "pnpm-workspace.yaml"),
      `packages:\n  - "apps/*"\n  - "packages/*"\n`
    );
  }
}

export function createGitignore(projectPath) {
  writeFile(
    path.join(projectPath, ".gitignore"),
    `# Dependencies
node_modules/

# Build output
dist/
build/
.next/
out/

# Environment variables
.env
.env.local
.env.*.local

# Logs
*.log
npm-debug.log*
pnpm-debug.log*

# OS files
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/

# TypeScript
*.tsbuildinfo

# Testing / coverage
coverage/

# Temporary files
.tmp/
.temp/
`
  );
}

export function createEnvExample(projectPath, api) {
  const apiMeta = API_META[api] ?? API_META.none;
  const vars = [...apiMeta.envVars];

  // Only emit if there's something meaningful to show
  if (vars.length === 0) return;

  writeFile(
    path.join(projectPath, ".env.example"),
    `# Environment variable placeholders — copy to .env and fill in values\n\n` +
      vars.map((v) => `${v}`).join("\n") +
      "\n"
  );
}

export function createReadme(projectPath, opts) {
  const { projectName, packageManager, web, api, install } = opts;
  const webLabel = WEB_META[web]?.label ?? web;
  const apiLabel = API_META[api]?.label ?? api;
  const installCmd = packageManager === "pnpm" ? "pnpm install" : "npm install";
  const devCmd = packageManager === "pnpm" ? "pnpm dev" : "npm run dev";

  const installSection = install
    ? ""
    : `## Install dependencies

Dependencies were not installed during scaffolding. Run:

\`\`\`bash
${installCmd}
\`\`\`

`;

  writeFile(
    path.join(projectPath, "README.md"),
    `# ${projectName}

Scaffolded with [reposo](https://github.com/anshumancodes/reposo).

## What was generated

| | |
|---|---|
| Package manager | \`${packageManager}\` |
| Web framework   | ${webLabel} |
| API framework   | ${apiLabel} |

## Structure

\`\`\`text
${projectName}/
├── apps/
│   ├── web/          — ${webLabel} frontend
│   └── api/          — ${apiLabel} backend
├── packages/
│   ├── ts-config/    — Shared TypeScript configuration
│   ├── eslint-config/— Shared ESLint configuration
│   ├── ui/           — Shared UI components
│   └── common/       — Shared utilities
├── package.json
└── .gitignore
\`\`\`

${installSection}## Development

Start the web app:

\`\`\`bash
cd apps/web
${devCmd}
\`\`\`

Start the API:

\`\`\`bash
cd apps/api
${devCmd}
\`\`\`

## Packages

| Package | Purpose |
|---|---|
| \`@repo/ts-config\` | Shared TypeScript base config |
| \`@repo/eslint-config\` | Shared ESLint flat config |
| \`@repo/ui\` | Shared UI components |
| \`@repo/common\` | Shared utilities and helpers |
`
  );
}
