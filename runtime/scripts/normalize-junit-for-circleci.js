#!/usr/bin/env node
/**
 * CircleCI often only shows failed tests when JUnit <testcase> elements
 * have child elements (e.g. <system-out>). This script strips <system-out>
 * and <system-err> from passed testcases so CircleCI counts them as passed.
 * Skipped testcases (with <skipped>) are left unchanged.
 */
const fs = require('fs');
const path = require('path');

function findXmlFiles(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const st = fs.statSync(full);
    if (st.isDirectory()) findXmlFiles(full, files);
    else if (name.endsWith('.xml')) files.push(full);
  }
  return files;
}

function normalizeXml(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  // For each <testcase> that has no <failure> and no <error>, remove
  // <system-out> and <system-err> so CircleCI treats it as passed.
  const testcaseRe = /(<testcase[^>]*>)([\s\S]*?)(<\/testcase>)/g;
  content = content.replace(testcaseRe, (_, open, inner, close) => {
    if (inner.includes('<failure') || inner.includes('<error')) return open + inner + close;
    const systemOutRe = /<system-out>(?:<!\[CDATA\[[\s\S]*?\]\]>|[\s\S]*?)<\/system-out>/gi;
    const systemErrRe = /<system-err>(?:<!\[CDATA\[[\s\S]*?\]\]>|[\s\S]*?)<\/system-err>/gi;
    const cleaned = inner.replace(systemOutRe, '').replace(systemErrRe, '').trim();
    return open + cleaned + close;
  });
  fs.writeFileSync(filePath, content, 'utf8');
}

const reportsDir = process.argv[2] || path.join(process.cwd(), 'reports');
const files = findXmlFiles(reportsDir);
files.forEach(normalizeXml);
if (files.length) {
  console.log(`Normalized ${files.length} JUnit XML file(s) for CircleCI`);
}
