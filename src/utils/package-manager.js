// Returns the workspace dependency string for a shared package.
// pnpm supports the `workspace:*` protocol; npm uses `*`.

export function workspaceDep(packageManager) {
  return packageManager === "pnpm" ? "workspace:*" : "*";
}

//  Returns the install command for the given package manager.

export function installCommand(packageManager) {
  return packageManager === "pnpm" ? "pnpm install" : "npm install";
}

// Returns the dev-run command for the given package manager.

export function devCommand(packageManager) {
  return packageManager === "pnpm" ? "pnpm dev" : "npm run dev";
}
