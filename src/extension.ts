import * as vscode from "vscode";
import { createWebviewContent } from "./presentation/htmlUtils";
import { SymbolType } from "./common/enums";
import * as fs from "fs";
import {
  getFilesAndDirectories,
  isDirectory,
  isFile,
  getBasename,
  joinPaths,
} from "./common/fileUtils";

export function activate(context: vscode.ExtensionContext) {
  // Register command to open the panel
  let disposable = vscode.commands.registerCommand(
    "flutter-tree.openPanel",
    async () => {
      // Get the root path of the workspace
      const rootPath = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
      if (!rootPath) {
        vscode.window.showErrorMessage("No workspace opened.");
        return;
      }

      // Get a list of subdirectories in the root path
      const subdirectories = fs
        .readdirSync(rootPath, { withFileTypes: true })
        .filter((dirent) => dirent.isDirectory())
        .map((dirent) => dirent.name);

      if (subdirectories.length === 0) {
        vscode.window.showInformationMessage("No subdirectories found.");
        return;
      }

      // Show QuickPick to choose a subdirectory
      const selectedDirectory = await vscode.window.showQuickPick(
        subdirectories,
        {
          placeHolder: "Select a subdirectory",
        }
      );

      if (!selectedDirectory) {
        vscode.window.showInformationMessage("No subdirectory selected.");
        return;
      }

      // Generate HTML content for the selected directory
      const selectedPath = joinPaths(rootPath, selectedDirectory);
      let htmlContent = "<ul>";
      htmlContent += generateHTMLForDirectory(selectedPath);
      htmlContent += "</ul>";

      // Create and show panel
      const panel = vscode.window.createWebviewPanel(
        "flutterTree",
        "Flutter Tree",
        vscode.ViewColumn.Beside,
        {
          enableScripts: true,
        }
      );

      // Set HTML content for panel
      panel.webview.html = createWebviewContent(htmlContent);
    }
  );

  context.subscriptions.push(disposable);
}

// Generate HTML content for the directory structure
function generateHTMLForDirectory(parentPath: string): string {
  let htmlContent = "";
  const filesAndDirs = getFilesAndDirectories(parentPath);
  const subdirectories = filesAndDirs.filter(isDirectory);
  const files = filesAndDirs.filter(isFile);
  const hasSubdirectories = subdirectories.length > 0;
  const hasFiles = files.length > 0;
  const symbol = getSymbol(parentPath, hasSubdirectories, hasFiles);

  htmlContent += `<li>${symbol} ${getBasename(parentPath)}</li>`;
  if (hasSubdirectories || hasFiles) {
    htmlContent += "<ul>";
    subdirectories.forEach((subdirectory) => {
      const fullPath = joinPaths(parentPath, subdirectory.name);
      htmlContent += generateHTMLForDirectory(fullPath);
    });
    files.forEach((file) => {
      const fullPath = joinPaths(parentPath, file.name);
      const fileComment = getFileComment(fullPath);
      htmlContent += `<li>${SymbolType.File} ${file.name}${
        fileComment ? `<br>- ${fileComment}` : ""
      }</li>`;
    });
    htmlContent += "</ul>";
  }
  return htmlContent;
}

// Get the comment from the file
function getFileComment(filePath: string): string | undefined {
  try {
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const lines = fileContent.split("\n");
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith("// *")) {
        return trimmedLine.replaceAll("// *", "");
      }
      if (!trimmedLine.endsWith("//")) {
        break;
      }
    }
  } catch (error) {
    console.error(`Error reading file ${filePath}: ${error}`);
  }
  return undefined;
}

// Get the symbol for the directory
function getSymbol(
  parentPath: string,
  hasSubdirectories: boolean,
  hasFiles: boolean
): SymbolType {
  if (parentPath === vscode.workspace.workspaceFolders?.[0].uri.fsPath) {
    return SymbolType.Directory;
  } else if (hasSubdirectories && hasFiles) {
    return SymbolType.DirectoryWithSubdirectories;
  } else if (hasSubdirectories) {
    return SymbolType.Directory;
  } else if (hasFiles) {
    return SymbolType.File;
  } else {
    return SymbolType.EmptyDirectory;
  }
}
