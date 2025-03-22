import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import os from 'os';

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create output directory if it doesn't exist
const outputPath = path.join(__dirname, 'outputs');
if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
}

// Update executePython to support syntax check mode
export const executePython = async (filePath, inputPath, syntaxCheckOnly = false) => {
  return new Promise((resolve, reject) => {
    if (syntaxCheckOnly) {
      // Just check syntax without running
      exec(
        `python -m py_compile "${filePath}"`,
        (error, stdout, stderr) => {
          if (error) {
            reject({ error, stderr });
            return;
          }
          resolve("Syntax check passed");
        }
      );
      return;
    }
    
    // Execute the Python script
    exec(
      `python "${filePath}" < "${inputPath}"`,
      { timeout: 10000 }, // 10 second timeout
      (error, stdout, stderr) => {
        if (error) {
          reject({ error, stderr });
          return;
        }
        resolve(stdout);
      }
    );
  });
};
