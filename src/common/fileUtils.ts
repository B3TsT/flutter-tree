import * as fs from "fs";
import * as path from "path";

export function getFilesAndDirectories(parentPath: string) {
  return fs.readdirSync(parentPath, { withFileTypes: true });
}

export function isDirectory(item: fs.Dirent) {
  return item.isDirectory();
}

export function isFile(item: fs.Dirent) {
  return !item.isDirectory();
}

export function getBasename(fullPath: string) {
  return path.basename(fullPath);
}

export function joinPaths(parentPath: string, childPath: string) {
  return path.join(parentPath, childPath);
}
