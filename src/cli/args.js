import parseArgs from "minimist";
import { createRequire } from "module";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load version from package.json without a circular dep
const require = createRequire(import.meta.url);
const pkg = require(path.resolve(__dirname, "../../package.json"));

export const VERSION = pkg.version;

export const VALID_PACKAGE_MANAGERS = ["npm", "pnpm"];
export const VALID_TEMPLATES = ["fullstack"];

export const DEFAULTS = {
  packageManager: "pnpm",
  template: "fullstack",
  web: "nextjs",
  api: "express",
  install: true,
  git: true,
};


//  Parse raw process.argv and return a structured options object.
//  Throws a descriptive string if an invalid value is supplied.

export function parseCliArgs(argv) {
  const raw = parseArgs(argv.slice(2), {
    string: ["package-manager", "template"],
    // minimist converts --no-X into X:false, so declare install/git as boolean
    // to ensure they default to true (undefined then true later) when not supplied.
    boolean: ["yes", "install", "git", "help", "version"],
    default: { install: true, git: true },
    alias: {
      y: "yes",
      p: "package-manager",
      t: "template",
      h: "help",
      v: "version",
    },
    "--": false,
  });

  const projectName = raw._[0] ?? null;

  // Validate package manager if explicitly provided
  const pm = raw["package-manager"];
  if (pm && !VALID_PACKAGE_MANAGERS.includes(pm)) {
    throw new Error(
      `Unsupported package manager "${pm}". Choose one of: ${VALID_PACKAGE_MANAGERS.join(", ")}.`
    );
  }

  // Validate template if explicitly provided
  const tpl = raw["template"];
  if (tpl && !VALID_TEMPLATES.includes(tpl)) {
    throw new Error(
      `Unknown template "${tpl}". Available templates: ${VALID_TEMPLATES.join(", ")}.`
    );
  }

  // minimist --no-install → install:false, --no-git then git:false
  return {
    projectName,
    yes: raw.yes ?? false,
    packageManager: pm ?? null, // null means "prompt"
    template: tpl ?? "fullstack",
    noInstall: raw.install === false,
    noGit: raw.git === false,
    help: raw.help ?? false,
    version: raw.version ?? false,
  };
}

export function printHelp() {
  console.log(`
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

Defaults (used with --yes):
  package manager : pnpm
  web framework   : Next.js
  api framework   : Express
  install         : yes
  git             : yes

Examples:
  reposo my-app
  reposo my-app --yes
  reposo my-app -p npm
  reposo my-app --no-install --no-git
`);
}

export function printVersion() {
  console.log(VERSION);
}
