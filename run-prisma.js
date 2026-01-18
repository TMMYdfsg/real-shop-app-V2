const { execSync } = require('child_process');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const args = process.argv.slice(2);
const command = `npx prisma ${args.join(' ')}`;

console.log(`Running: ${command}`);
console.log(`DATABASE_URL length: ${process.env.DATABASE_URL ? process.env.DATABASE_URL.length : 'undefined'}`);

try {
    execSync(command, {
        stdio: 'inherit',
        env: { ...process.env } // Explicitly pass the merged environment
    });
} catch (error) {
    console.error('Command failed:', error.message);
    process.exit(1);
}
