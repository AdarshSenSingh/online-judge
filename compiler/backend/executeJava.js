import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create output directory if it doesn't exist
const outputPath = path.join(__dirname, 'outputs');
if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
}

// Update executeJava to support compilation-only mode
export const executeJava = async (filePath, inputPath, compileOnly = false) => {
  const jobId = path.basename(filePath).split(".")[0];
  const classPath = path.dirname(filePath);

  return new Promise((resolve, reject) => {
    // Compile the Java file
    exec(
      `javac "${filePath}" -d "${classPath}"`,
      (error, stdout, stderr) => {
        if (error) {
          reject({ error, stderr });
          return;
        }
        
        // If compileOnly flag is true, resolve after compilation
        if (compileOnly) {
          resolve("Compilation successful");
          return;
        }
        
        // Execute the compiled Java program
        exec(
          `java -cp "${classPath}" ${jobId} < "${inputPath}"`,
          { timeout: 10000 }, // 10 second timeout
          (error, stdout, stderr) => {
            if (error) {
              reject({ error, stderr });
              return;
            }
            resolve(stdout);
          }
        );
      }
    );
  });
};
