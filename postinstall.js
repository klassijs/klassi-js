#!/usr/bin/env node

/**
 * klassi-js Postinstall Script
 * Checks for klassijs-testgenie package (dependencies are installed on-demand when testgenie is run)
 */
const fs = require('fs');
const path = require('path');

function findTestgeniePackage() {
  // Try to find testgenie in .pnpm directory (pnpm v7+)
  // pnpm structure: .pnpm/package@version/node_modules/package/
  try {
    // Start from klassi-js's location and go up to find .pnpm
    let currentDir = __dirname;
    let pnpmDir = null;

    // Search up the directory tree for .pnpm
    for (let i = 0; i < 5; i++) {
      const testPnpmDir = path.join(currentDir, '..', '..', '.pnpm');
      if (fs.existsSync(testPnpmDir)) {
        pnpmDir = testPnpmDir;
        break;
      }
      currentDir = path.join(currentDir, '..');
    }

    if (pnpmDir && fs.existsSync(pnpmDir)) {
      const entries = fs.readdirSync(pnpmDir);

      // Search all entries for testgenie (handles git dependencies like klassijs-testgenie@git+...)
      for (const entry of entries) {
        if (entry.includes('klassijs-testgenie')) {
          const testgeniePath = path.join(pnpmDir, entry, 'node_modules', 'klassijs-testgenie');
          if (fs.existsSync(testgeniePath) && fs.existsSync(path.join(testgeniePath, 'package.json'))) {
            return testgeniePath;
          }
        }
      }
    }
  } catch (error) {
    // Continue to other methods
  }

  // Try standard node_modules locations
  const possiblePaths = [
    path.join(__dirname, 'node_modules', 'klassijs-testgenie'),
    path.join(process.cwd(), 'node_modules', 'klassijs-testgenie'),
    path.join(__dirname, '..', 'klassijs-testgenie'),
  ];

  for (const testPath of possiblePaths) {
    if (fs.existsSync(testPath) && fs.existsSync(path.join(testPath, 'package.json'))) {
      return testPath;
    }
  }

  return null;
}

function installTestgenieDependencies(testgeniePath) {
  // Skip installing testgenie dependencies during postinstall
  // Dependencies will be installed automatically on first run of "pnpm run testgenie"
  console.log('ℹ️  Skipping klassijs-testgenie dependency installation during postinstall');
  console.log('   Dependencies will be installed automatically when you run "pnpm run testgenie" for the first time');
}

// Main execution
try {
  const testgeniePath = findTestgeniePackage();

  if (testgeniePath) {
    installTestgenieDependencies(testgeniePath);
  } else {
    console.log('ℹ️  klassijs-testgenie package not found, skipping dependency installation');
    console.log('   This is normal if testgenie is not installed or will be installed later');
  }
} catch (error) {
  console.warn('⚠️  Warning: Error in klassi-js postinstall script:', error.message);
  // Don't fail the installation if this script has issues
}