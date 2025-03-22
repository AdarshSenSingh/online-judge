import fs from 'fs';
import path from 'path';
import { v4 as uuid } from 'uuid';
import { fileURLToPath } from 'url';

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create directories if they don't exist
const dirInputs = path.join(__dirname, 'inputs');
if (!fs.existsSync(dirInputs)) {
    fs.mkdirSync(dirInputs, { recursive: true });
}

const generateInputFile = async (input) => {
    const jobID = uuid();
    const filename = `${jobID}.txt`;
    
    const filePath = path.join(dirInputs, filename);
    await fs.promises.writeFile(filePath, input || '');
    return filePath;
};

export { generateInputFile };
