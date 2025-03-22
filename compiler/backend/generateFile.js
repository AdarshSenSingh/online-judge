import fs from 'fs';
import path from 'path';
import { v4 as uuid } from 'uuid';
import { fileURLToPath } from 'url';

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create directories if they don't exist
const dirCodes = path.join(__dirname, 'codes');
if (!fs.existsSync(dirCodes)) {
    fs.mkdirSync(dirCodes, { recursive: true });
}

const generateFile = async (language, code) => {
    const jobID = uuid();
    let filename;
    
    // For Java, we need to ensure the class name is Main
    if (language === 'java') {
        filename = `Main.java`;
    } else if (language === 'python') {
        filename = `${jobID}.py`;
    } else {
        filename = `${jobID}.cpp`;
    }
    
    const filePath = path.join(dirCodes, filename);
    await fs.promises.writeFile(filePath, code);
    return filePath;
};

export { generateFile };
