import { execSync } from "child_process";
import chalk from "chalk";

// Returns true if git is available on PATH.

export function gitAvailable() {
  try {
    execSync("git --version", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

// Initialize a git repository at `projectPath`.
// Returns false (with a warning) if git isn't available.

export function initGit(projectPath) {
  if (!gitAvailable()) {
    console.warn(
      chalk.yellow("  ⚠  git not found — skipping git initialization."),
    );
    return false;
  }

  execSync("git init", { cwd: projectPath, stdio: "ignore" });
  execSync("git add -A", { cwd: projectPath, stdio: "ignore" });

  try {
    execSync('git commit -m "Initial commit (reposo)"', {
      cwd: projectPath,
      stdio: "ignore",
    });
  } catch {
    // Commit may fail if no global git config is set – that's fine.
  }

  return true;
}
