#!/usr/bin/env node
/**
 * OAF Testgenie Runner Script
 * Finds and runs klassijs-testgenie from the project
 */
const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Load environment variables from project root .env file
 * @returns {object} Environment variables object
 */
function loadProjectEnv() {
  const projectRoot = process.cwd();
  const envPath = path.join(projectRoot, '.env');

  if (fs.existsSync(envPath)) {
    try {
      const dotenv = require('dotenv');
      const result = dotenv.config({ path: envPath });

      if (result.error) {
        console.warn(`⚠️  Warning: Error loading .env file: ${result.error.message}`);
        return {};
      }

      if (result.parsed) {
        // console.log(`✅ Loaded ${Object.keys(result.parsed).length} environment variables`);
        return result.parsed;
      }
    } catch (error) {
      console.warn(`⚠️  Warning: Could not load .env file: ${error.message}`);
      return {};
    }
  }

  return {};
}

/**
 * Get testgenie package path using require.resolve
 * Falls back to checking common locations if resolve fails
 */
function getTestgeniePath() {
  const projectRoot = process.cwd();

  try {
    const testgeniePath = require.resolve('klassijs-testgenie/package.json');
    return path.dirname(testgeniePath);
  } catch (error) {
    const possiblePaths = [
      path.join(projectRoot, 'node_modules', 'klassijs-testgenie'),
      path.join(projectRoot, 'node_modules', 'OAF', 'node_modules', 'klassijs-testgenie'),
    ];

    for (const testPath of possiblePaths) {
      if (fs.existsSync(testPath) && fs.existsSync(path.join(testPath, 'package.json'))) {
        return testPath;
      }
    }

    return null;
  }
}

function runTestgenie(testgeniePath, projectEnv = {}) {
  const mergedEnv = { ...process.env, ...projectEnv };

  const frontendNodeModules = path.join(testgeniePath, 'frontend', 'node_modules');
  const backendNodeModules = path.join(testgeniePath, 'backend', 'node_modules');

  if (!fs.existsSync(frontendNodeModules) || !fs.existsSync(backendNodeModules)) {
    try {
      execSync('pnpm install', {
        cwd: testgeniePath,
        stdio: 'inherit',
        env: { ...mergedEnv, PNPM_HOME: mergedEnv.PNPM_HOME || '' }
      });
    } catch (error) {
      console.error('❌ Failed to install dependencies:', error.message);
      process.exit(1);
    }
  }

  try {
    const pnpmProcess = spawn('pnpm', ['run', 'dev'], {
      cwd: testgeniePath,
      stdio: 'inherit',
      shell: true,
      env: mergedEnv
    });

    pnpmProcess.on('error', (error) => {
      process.exit(1);
    });

    pnpmProcess.on('exit', (code) => {
      process.exit(code || 0);
    });
  } catch (error) {
    console.error('❌ Failed to run testgenie:', error.message);
    process.exit(1);
  }
}

try {
  const projectEnv = loadProjectEnv();

  const testgeniePath = getTestgeniePath();

  if (testgeniePath) {
    runTestgenie(testgeniePath, projectEnv);
  } else {
    console.error('❌ klassijs-testgenie package not found!');
    process.exit(1);
  }
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
