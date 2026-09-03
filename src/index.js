#!/usr/bin/env node

import chalk from "chalk";
import { parseCliArgs, printHelp, printVersion } from "./cli/args.js";
import { runPrompts, buildDefaultOptions } from "./cli/prompts.js";
import { generateProject } from "./generators/project.js";
import { devCommand, installCommand } from "./utils/package-manager.js";

async function main() {
  const flags = parseCliArgs(process.argv);

  if (flags.help) {
    printHelp();
    process.exit(0);
  }

  if (flags.version) {
    printVersion();
    process.exit(0);
  }

  console.log(chalk.bold.cyan("\n  reposo\n"));

  //  Resolve options
  let opts;

  if (flags.yes) {
    // --yes: require project name to be supplied on the command line
    if (!flags.projectName) {
      console.error(
        chalk.red("Error: project name is required when using --yes.\n"),
      );
      console.error(chalk.dim("  reposo <project-name> --yes\n"));
      process.exit(1);
    }
    opts = buildDefaultOptions(flags);
  } else {
    opts = await runPrompts(flags);
  }

  //  Validate project name is non-empty
  if (!opts.projectName || opts.projectName.trim() === "") {
    console.error(chalk.red("Error: project name cannot be empty."));
    process.exit(1);
  }

  console.log(
    chalk.dim(`\n  template        ${opts.template}`) +
      chalk.dim(`\n  package manager ${opts.packageManager}`) +
      chalk.dim(`\n  web             ${opts.web}`) +
      chalk.dim(`\n  api             ${opts.api}`) +
      "\n",
  );

  //  Scaffold
  try {
    await generateProject(opts);
  } catch (err) {
    console.error(chalk.red(`\nError: ${err.message}`));
    process.exit(1);
  }

  //  Done
  const devCmd = devCommand(opts.packageManager);
  const installCmd = installCommand(opts.packageManager);
  const noInstallNote = opts.install
    ? ""
    : `\n  ${chalk.dim("Dependencies were not installed. Run:")}` +
      `\n  ${chalk.cyan(installCmd)}\n`;

  console.log(`
${chalk.bold("Done.")}
${noInstallNote}
  ${chalk.dim("cd")} ${chalk.cyan(opts.projectName)}
  ${chalk.cyan(devCmd)}
`);
}

main().catch((err) => {
  console.error(chalk.red(`\nUnexpected error: ${err.message}`));
  process.exit(1);
});
