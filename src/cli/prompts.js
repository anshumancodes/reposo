import prompts from "prompts";
import chalk from "chalk";
import { DEFAULTS, VALID_PACKAGE_MANAGERS } from "./args.js";

//  Ask the user all interactive questions and merge results with any
//  flags already resolved from the CLI.

//  @param {object} cliFlags  - Parsed flags from args.js
//  @returns {object}         - Complete, validated options object

export async function runPrompts(cliFlags) {
  // Ensure Ctrl+C exits cleanly instead of printing an ugly error
  const onCancel = () => {
    console.log(chalk.yellow("\nCancelled."));
    process.exit(0);
  };

  const questions = [];

  if (!cliFlags.projectName) {
    questions.push({
      type: "text",
      name: "projectName",
      message: "Project name:",
      validate: (v) =>
        v.trim().length > 0 ? true : "Project name is required.",
    });
  }

  if (!cliFlags.packageManager) {
    questions.push({
      type: "select",
      name: "packageManager",
      message: "Package manager:",
      choices: VALID_PACKAGE_MANAGERS.map((pm) => ({ title: pm, value: pm })),
      initial: VALID_PACKAGE_MANAGERS.indexOf(DEFAULTS.packageManager),
    });
  }

  questions.push(
    {
      type: "select",
      name: "web",
      message: "Web framework:",
      choices: [
        { title: "Next.js", value: "nextjs" },
        { title: "Vite", value: "vite" },
        { title: "None", value: "none" },
      ],
      initial: 0,
    },
    {
      type: "select",
      name: "api",
      message: "API framework:",
      choices: [
        { title: "Express", value: "express" },
        { title: "Fastify", value: "fastify" },
        { title: "Hono", value: "hono" },
        { title: "None", value: "none" },
      ],
      initial: 0,
    },
    {
      type: "confirm",
      name: "install",
      message: "Install dependencies?",
      initial: true,
    },
    {
      type: "confirm",
      name: "git",
      message: "Initialize git?",
      initial: true,
    },
  );

  const answers = await prompts(questions, { onCancel });

  return resolveOptions(cliFlags, answers);
}

// Build the final options object used throughout the generator by merging
// CLI flags (highest priority) with prompt answers and defaults.

function resolveOptions(cliFlags, answers) {
  const projectName = cliFlags.projectName ?? answers.projectName;
  const packageManager =
    cliFlags.packageManager ??
    answers.packageManager ??
    DEFAULTS.packageManager;

  // --no-install / --no-git override interactive answers
  const install = cliFlags.noInstall
    ? false
    : (answers.install ?? DEFAULTS.install);
  const git = cliFlags.noGit ? false : (answers.git ?? DEFAULTS.git);

  return {
    projectName: projectName.trim(),
    packageManager,
    template: cliFlags.template,
    web: answers.web ?? DEFAULTS.web,
    api: answers.api ?? DEFAULTS.api,
    install,
    git,
  };
}

// Build options directly from defaults + CLI flags without prompting.
// Used when --yes is passed.

export function buildDefaultOptions(cliFlags) {
  return {
    projectName: cliFlags.projectName,
    packageManager: cliFlags.packageManager ?? DEFAULTS.packageManager,
    template: cliFlags.template,
    web: DEFAULTS.web,
    api: DEFAULTS.api,
    install: cliFlags.noInstall ? false : DEFAULTS.install,
    git: cliFlags.noGit ? false : DEFAULTS.git,
  };
}
