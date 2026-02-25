import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Common Chrome/Edge localStorage paths on Windows
const possiblePaths = [
    path.join(process.env.LOCALAPPDATA || '', 'Google', 'Chrome', 'User Data', 'Default', 'Local Storage', 'leveldb'),
    path.join(process.env.LOCALAPPDATA || '', 'Microsoft', 'Edge', 'User Data', 'Default', 'Local Storage', 'leveldb'),
    path.join(process.env.APPDATA || '', 'Google', 'Chrome', 'User Data', 'Default', 'Local Storage', 'leveldb'),
];

console.log('🔍 Searching for localStorage data...\n');
console.log('Possible paths:');
possiblePaths.forEach(p => console.log(`  - ${p}`));

// Try to find and read localStorage
for (const basePath of possiblePaths) {
    if (fs.existsSync(basePath)) {
        console.log(`\n✅ Found: ${basePath}`);
        try {
            const files = fs.readdirSync(basePath);
            console.log(`Files: ${files.length}`);

            // Look for .log or .ldb files that might contain our data
            const dataFiles = files.filter(f => f.endsWith('.log') || f.endsWith('.ldb'));

            for (const file of dataFiles) {
                const filePath = path.join(basePath, file);
                const content = fs.readFileSync(filePath, 'utf8');

                // Search for "programs" or "Helkropp"
                if (content.includes('programs') || content.includes('Helkropp')) {
                    console.log(`\n📄 Found relevant data in: ${file}`);

                    // Try to extract JSON
                    const programsMatch = content.match(/"programs".*?\[(.*?)\]/s);
                    if (programsMatch) {
                        console.log('Found programs data!');
                        console.log(programsMatch[0].substring(0, 500));
                    }
                }
            }
        } catch (err) {
            console.log(`Error reading: ${err.message}`);
        }
    }
}

console.log('\n\n⚠️  If no data was found, please manually provide your programs.');
console.log('You can find them in the BulkBro app under "Programmer" section.');
