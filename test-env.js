require('dotenv').config();
console.log('Checking DATABASE_URL...');
if (process.env.DATABASE_URL) {
    console.log('Success: DATABASE_URL is found.');
    // Do not log the full secret, just the prefix to verify it's the right one
    console.log('Value starts with:', process.env.DATABASE_URL.substring(0, 15));
} else {
    console.log('Error: DATABASE_URL is undefined.');
}
