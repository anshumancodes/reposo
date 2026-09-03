import path from "path";
import { execSync } from "child_process";
import chalk from "chalk";
import { exists, mkdirp } from "../utils/filesystem.js";
import { initGit } from "../utils/git.js";
import * as fullstack from "./templates/fullstack/index.js";


  // Scaffold registry — maps template name → scaffold function.
  // Adding a new template requires only a new entry here.

const TEMPLATES = {
  fullstack: scaffoldFullstack,
};


//  Main entry point called from src/index.js after options are resolved.

export async function generateProject(opts) {
  const { projectName, packageManager, template, web, api, install, git } = opts;
  const projectPath = path.resolve(process.cwd(), projectName);

  // Guard against overwriting an existing directory
  if (exists(projectPath)) {
    throw new Error(`Directory "${projectName}" already exists.`);
  }

  const scaffold = TEMPLATES[template];
  if (!scaffold) {
    throw new Error(`Unknown template "${template}". Available: ${Object.keys(TEMPLATES).join(", ")}`);
  }

  // Create top-level dirs 
  mkdirp(path.join(projectPath, "apps"));
  mkdirp(path.join(projectPath, "packages"));
  log("✔ Created project");

  await scaffold(projectPath, opts);

  // Install
  if (install) {
    const cmd = packageManager === "pnpm" ? "pnpm install" : "npm install";
    try {
      execSync(cmd, { cwd: projectPath, stdio: "inherit" });
      log("✔ Installed dependencies");
    } catch {
      console.warn(chalk.yellow(`  ⚠  Dependency installation failed. Run \`${cmd}\` manually.`));
    }
  }

  // Git
  if (git) {
    const ok = initGit(projectPath);
    if (ok) log("✔ Initialized git");
  }

  return projectPath;
}

// Fullstack template 

function scaffoldFullstack(projectPath, opts) {
  const { projectName, packageManager, web, api } = opts;

  // Root files
  fullstack.createRootPackageJson(projectPath, projectName, packageManager);
  fullstack.createGitignore(projectPath);
  fullstack.createEnvExample(projectPath, api);

  // Apps
  fullstack.createWebApp(projectPath, web, packageManager);
  log("✔ Created apps/web");

  fullstack.createApiApp(projectPath, api, packageManager);
  log("✔ Created apps/api");

  // Packages
  fullstack.createTsConfigPackage(projectPath);
  log("✔ Created packages/ts-config");

  fullstack.createEslintConfigPackage(projectPath);
  log("✔ Created packages/eslint-config");

  fullstack.createUiPackage(projectPath, packageManager);
  log("✔ Created packages/ui");

  fullstack.createCommonPackage(projectPath, packageManager);
  log("✔ Created packages/common");

  // README last so it can reference everything
  fullstack.createReadme(projectPath, opts);
}

function log(msg) {
  console.log(chalk.green(msg));
}
