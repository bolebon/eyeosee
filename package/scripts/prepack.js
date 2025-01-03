// scripts/removeDevDependencies.js

const fs = require('fs');

const packageJson = JSON.parse(fs.readFileSync('./package.json').toString());

// Backup the original package.json
fs.writeFileSync('./package.json.bak', JSON.stringify(packageJson, null, 2));

// Remove devDependencies
delete packageJson.devDependencies;
delete packageJson.scripts;

// Write the modified package.json
fs.writeFileSync('./package.json', JSON.stringify(packageJson, null, 2));