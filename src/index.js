#!/usr/bin/env node

import fs from "fs";
import path from "path";
import readline from "readline";
import { execSync } from "child_process";
import { fileURLToPath } from "url";
import chalk from 'chalk';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function main() {
  console.log(chalk.bold.cyan("\nOpenRepo\n"));

  const projectName =
    process.argv[2] || (await ask("Project name: "));

  const packageManager =
    (await ask("Package manager (npm/pnpm): "))
      .trim()
      .toLowerCase() || "npm";

  if (!["npm", "pnpm"].includes(packageManager)) {
    console.error(chalk.red("Invalid package manager. Choose npm or pnpm."));
    rl.close();
    process.exit(1);
  }

  const projectPath = path.resolve(process.cwd(), projectName);

  if (fs.existsSync(projectPath)) {
    console.error(chalk.red(`Directory "${projectName}" already exists.`));
    rl.close();
    process.exit(1);
  }

  console.log(chalk.green(`\nCreating ${projectName}...\n`));

  createProject(projectPath);

  createRootPackageJson(projectPath, packageManager);

  createApp(projectPath, "web");
  createApp(projectPath, "api");

  createPackage(
    projectPath,
    "ts-config",
    "@repo/ts-config"
  );

  createPackage(
    projectPath,
    "ui",
    "@repo/ui"
  );

  createPackage(
    projectPath,
    "common",
    "@repo/common"
  );

  createTsConfigPackage(projectPath);
  createAppTsConfig(projectPath, "web");
  createAppTsConfig(projectPath, "api");

  installDependencies(projectPath, packageManager);

  console.log(`
Done.

  cd ${projectName}

Start building.
`);

  rl.close();
}

function createProject(projectPath) {
  fs.mkdirSync(path.join(projectPath, "apps"), {
    recursive: true,
  });

  fs.mkdirSync(path.join(projectPath, "packages"), {
    recursive: true,
  });
}

function createRootPackageJson(projectPath, packageManager) {
  const packageJson = {
    name: path.basename(projectPath),
    private: true,
    workspaces: [
      "apps/*",
      "packages/*",
    ],
  };

  // pnpm uses its own workspace configuration.
  if (packageManager === "pnpm") {
    writeFile(
      path.join(projectPath, "pnpm-workspace.yaml"),
      `packages:
  - "apps/*"
  - "packages/*"
`
    );

    delete packageJson.workspaces;
  }

  writeJson(
    path.join(projectPath, "package.json"),
    packageJson
  );
}

function createApp(projectPath, name) {
  const appPath = path.join(
    projectPath,
    "apps",
    name
  );

  fs.mkdirSync(appPath, {
    recursive: true,
  });

  writeJson(
    path.join(appPath, "package.json"),
    {
      name,
      version: "1.0.0",
      private: true,
      dependencies: {
        "@repo/ts-config": "workspace:*",
      },
    }
  );
}

function createPackage(projectPath, directory, name) {
  const packagePath = path.join(
    projectPath,
    "packages",
    directory
  );

  fs.mkdirSync(packagePath, {
    recursive: true,
  });

  writeJson(
    path.join(packagePath, "package.json"),
    {
      name,
      version: "1.0.0",
      private: true,
    }
  );
}

function createTsConfigPackage(projectPath) {
  const packagePath = path.join(
    projectPath,
    "packages",
    "ts-config"
  );

  const baseConfig = {
    compilerOptions: {
      target: "ES2022",
      module: "NodeNext",
      moduleResolution: "NodeNext",
      strict: true,
      esModuleInterop: true,
      skipLibCheck: true,
      forceConsistentCasingInFileNames: true,
    },
  };

  writeJson(
    path.join(packagePath, "base.json"),
    baseConfig
  );

  writeJson(
    path.join(packagePath, "package.json"),
    {
      name: "@repo/ts-config",
      version: "1.0.0",
      private: true,
      exports: {
        "./base.json": "./base.json",
      },
    }
  );
}

function createAppTsConfig(projectPath, appName) {
  const appPath = path.join(
    projectPath,
    "apps",
    appName
  );

  const tsConfig = {
    extends: "@repo/ts-config/base.json",
    compilerOptions: {
      outDir: "dist",
      rootDir: "src",
    },
    include: ["src"],
  };

  writeJson(
    path.join(appPath, "tsconfig.json"),
    tsConfig
  );
}

function installDependencies(projectPath, packageManager) {
  console.log(chalk.yellow("Installing dependencies...\n"));

  if (packageManager === "npm") {
    execSync("npm install", {
      cwd: projectPath,
      stdio: "inherit",
    });
  } else {
    execSync("pnpm install", {
      cwd: projectPath,
      stdio: "inherit",
    });
  }
}

function writeJson(filePath, data) {
  fs.writeFileSync(
    filePath,
    JSON.stringify(data, null, 2) + "\n"
  );
}

function writeFile(filePath, content) {
  fs.writeFileSync(filePath, content);
}

main().catch((error) => {
  console.error(chalk.red(error));
  rl.close();
  process.exit(1);
});