#!/usr/bin/env node
/**
 * Lightweight s3 report dispatcher for a single project.
 * Reads project's .dataConfigrc.js and invokes framework s3ReportProcessor directly.
 */
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

async function main() {
  const projectDirArg = process.argv[2];
  if (!projectDirArg) {
    console.error('Usage: node runtime/scripts/run-s3-report-for-project.js <projectDir>');
    process.exit(2);
  }

  const projectDir = path.resolve(projectDirArg);
  const dataConfigPath = path.join(projectDir, '.dataConfigrc.js');

  // Preserve previous behavior where project-level env could influence runtime.
  const projectEnvPath = path.join(projectDir, '.env');
  if (fs.existsSync(projectEnvPath)) {
    dotenv.config({ path: projectEnvPath, override: true });
  }

  let dataConfig;
  try {
    ({ dataConfig } = require(dataConfigPath));
  } catch (err) {
    console.error(`❌ Could not load project data config: ${dataConfigPath}`);
    console.error(err?.message || err);
    process.exit(1);
  }

  // Minimal globals expected by legacy runtime modules.
  // Email-only dispatch path: do not initialize remote service integrations.
  global.settings = { remoteService: 'disabled', disableReport: true };
  global.dataconfig = dataConfig;
  global.s3Data = dataConfig.s3Data || {};
  global.emailData = dataConfig.emailData || {};
  global.projectName = process.env.PROJECT_NAME || dataConfig.projectName || path.basename(projectDir);
  global.reportName = process.env.REPORT_NAME || 'Automated Report';
  global.helpers = require('../helpers');
  global.date = global.helpers.currentDate();
  global.dateTime = global.helpers.reportDateTime();
  global.s3Date = false;
  global.DELAY_200ms = 200;
  global.accessibilityReportList = global.accessibilityReportList || [];
  global.browser = global.browser || { pause: async () => Promise.resolve() };

  // Keep project cwd so path/date/env behavior matches prior per-project execution.
  process.chdir(projectDir);

  try {
    // Load after globals are set.
    const processor = require('../s3ReportProcessor');
    await processor.s3Processor(global.projectName);
  } catch (err) {
    console.error(`❌ s3 report dispatch failed for project: ${global.projectName}`);
    console.error(err?.stack || err?.message || err);
    process.exit(1);
  }
}

main();
