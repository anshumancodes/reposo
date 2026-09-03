#!/usr/bin/env node

import fs from "fs";
import path from "path";
import readline from "readline";
import { execSync } from "child_process";

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
  console.log("OpenRepo\n");

  const projectName =
    process.argv[2] || (await ask("Project name: "));

  const packageManager =
    (await ask("Package manager (npm/pnpm): ")).trim().toLowerCase() || "npm";

  if (!["npm", "pnpm"].includes(packageManager)) {
    console.error("Invalid package manager. Choose npm or pnpm.");
    rl.close();
    process.exit(1);
  }

  const projectPath = path.resolve(process.cwd(), projectName);

  if (fs.existsSync(projectPath)) {
    console.error(`Directory "${projectName}" already exists.`);
    rl.close();
    process.exit(1);
  }

  console.log(`\nCreating ${projectName}...\n`);

  createProject(projectPath);

  const packageJson = {
    name: projectName,
    private: true,
    workspaces: ["apps/*", "packages/*"],
  };

  writeJson(
    path.join(projectPath, "package.json"),
    packageJson
  );

  createWorkspace(projectPath, "apps/web", "web");
  createWorkspace(projectPath, "apps/api", "api");

  createPackage(
    projectPath,
    "packages/typescript-config",
    "@repo/typescript-config"
  );

  createPackage(
    projectPath,
    "packages/ui",
    "@repo/ui"
  );

  createPackage(
    projectPath,
    "packages/common",
    "@repo/common"
  );

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

  console.log(`
Done.

  cd ${projectName}
  ${packageManager} install
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

function createWorkspace(projectPath, directory, name) {
  const workspacePath = path.join(projectPath, directory);

  fs.mkdirSync(workspacePath, {
    recursive: true,
  });

  writeJson(path.join(workspacePath, "package.json"), {
    name,
    version: "1.0.0",
    private: true,
  });
}

function createPackage(projectPath, directory, name) {
  const packagePath = path.join(projectPath, directory);

  fs.mkdirSync(packagePath, {
    recursive: true,
  });

  writeJson(path.join(packagePath, "package.json"), {
    name,
    version: "1.0.0",
    private: true,
  });
}

function writeJson(filePath, data) {
  fs.writeFileSync(
    filePath,
    JSON.stringify(data, null, 2) + "\n"
  );
}

main().catch((error) => {
  console.error(error);
  rl.close();
  process.exit(1);
});