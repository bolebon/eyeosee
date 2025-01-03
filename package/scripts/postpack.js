// scripts/restorePackageJson.js

const fs = require('fs');

// Restore the original package.json
const packageJson = JSON.parse(fs.readFileSync('./package.json.bak').toString());

// Write back the original package.json
fs.writeFileSync('./package.json', JSON.stringify(packageJson, null, 2));

// Remove the backup file
fs.unlinkSync('./package.json.bak');