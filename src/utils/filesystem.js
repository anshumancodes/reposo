import fs from "fs";
import path from "path";

// Write a UTF-8 text file, creating parent dirs if needed.
export function writeFile(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, "utf8");
}

// Write a pretty-printed JSON file.
export function writeJson(filePath, data) {
  writeFile(filePath, JSON.stringify(data, null, 2) + "\n");
}

// Create a directory (and all parents).
export function mkdirp(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

// Return true if the path already exists.
export function exists(p) {
  return fs.existsSync(p);
}