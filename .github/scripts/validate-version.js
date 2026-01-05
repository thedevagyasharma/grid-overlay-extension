const fs = require('fs');
const path = require('path');

// Get tag version from command line argument
const tagVersion = process.argv[2];

if (!tagVersion) {
  console.error('Error: No version provided');
  console.error('Usage: node validate-version.js <version>');
  process.exit(1);
}

// Read manifest.json
const manifestPath = path.join(process.cwd(), 'manifest.json');

if (!fs.existsSync(manifestPath)) {
  console.error('Error: manifest.json not found');
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const manifestVersion = manifest.version;

if (!manifestVersion) {
  console.error('Error: No version field in manifest.json');
  process.exit(1);
}

// Compare versions
if (tagVersion !== manifestVersion) {
  console.error('Version mismatch!');
  console.error(`  Git tag version:  ${tagVersion}`);
  console.error(`  Manifest version: ${manifestVersion}`);
  console.error('');
  console.error('Please ensure the git tag matches the version in manifest.json');
  process.exit(1);
}

console.log(`Version validation passed: ${manifestVersion}`);
process.exit(0);
