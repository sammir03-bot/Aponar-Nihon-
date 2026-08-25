#!/usr/bin/env node
import { promises as fs } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import crypto from 'node:crypto';

const root = path.resolve(process.argv[2] || '_site');
const warnings = [];
const errors = [];

async function exists(file) {
  try { await fs.access(file); return true; } catch { return false; }
}

async function walk(dir, out = []) {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) await walk(full, out);
    else out.push(full);
  }
  return out;
}

function countMatches(text, regex) {
  return [...text.matchAll(regex)].length;
}

function duplicateIds(html) {
  const seen = new Set();
  const dupes = new Set();
  for (const match of html.matchAll(/\bid\s*=\s*["']([^"']+)["']/gi)) {
    const id = match[1];
    if (seen.has(id)) dupes.add(id);
    seen.add(id);
  }
  return [...dupes];
}

function sha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

if (!(await exists(root))) {
  console.error(`Build directory not found: ${root}`);
  process.exit(1);
}

const requiredAssets = [
  'assets/css/pro-core.css',
  'assets/js/pro-core.js',
  'assets/data/search-index.json',
];
for (const rel of requiredAssets) {
  if (!(await exists(path.join(root, rel)))) errors.push(`Missing required build asset: ${rel}`);
}

const files = await walk(root);
const htmlFiles = files.filter((file) => file.endsWith('.html'));
let totalBytes = 0;
let htmlBytes = 0;
let imageBytes = 0;
let jsBytes = 0;
let cssBytes = 0;
const manifest = [];

for (const file of files) {
  const stat = await fs.stat(file);
  totalBytes += stat.size;
  const rel = path.relative(root, file).replaceAll(path.sep, '/');
  if (file.endsWith('.html')) htmlBytes += stat.size;
  if (/\.(png|jpe?g|webp|gif|svg)$/i.test(file)) imageBytes += stat.size;
  if (file.endsWith('.js')) jsBytes += stat.size;
  if (file.endsWith('.css')) cssBytes += stat.size;

  if (/\.(html|css|js|json|xml|txt)$/i.test(file) && stat.size <= 2_000_000) {
    const body = await fs.readFile(file);
    manifest.push({ path: rel, bytes: stat.size, sha256: sha256(body) });
  }
}

for (const file of htmlFiles) {
  const rel = path.relative(root, file).replaceAll(path.sep, '/');
  const html = await fs.readFile(file, 'utf8');
  const dupes = duplicateIds(html);
  if (dupes.length) warnings.push(`${rel}: duplicate id(s): ${dupes.slice(0, 8).join(', ')}`);

  const blankLinks = countMatches(html, /target\s*=\s*["']_blank["']/gi);
  const protectedBlankLinks = countMatches(html, /target\s*=\s*["']_blank["'][^>]*rel\s*=\s*["'][^"']*noopener/gi);
  if (blankLinks > protectedBlankLinks) warnings.push(`${rel}: ${blankLinks - protectedBlankLinks} external _blank link(s) may need rel=noopener`);

  const missingAlt = countMatches(html, /<img\b(?![^>]*\balt\s*=)[^>]*>/gi);
  if (missingAlt) warnings.push(`${rel}: ${missingAlt} image(s) missing alt attribute`);
}

const indexPath = path.join(root, 'index.html');
if (!(await exists(indexPath))) {
  errors.push('Missing index.html');
} else {
  const index = await fs.readFile(indexPath, 'utf8');
  const critical = [
    [/<html\b[^>]*\blang\s*=\s*["'][^"']+["']/i, 'index.html is missing html lang'],
    [/<title>[^<]+<\/title>/i, 'index.html is missing title'],
    [/<meta\b[^>]*name\s*=\s*["']viewport["'][^>]*>/i, 'index.html is missing viewport meta'],
    [/<meta\b[^>]*name\s*=\s*["']description["'][^>]*content\s*=\s*["'][^"']+["'][^>]*>/i, 'index.html is missing meta description'],
    [/<link\b[^>]*rel\s*=\s*["']canonical["'][^>]*>/i, 'index.html is missing canonical URL'],
    [/assets\/css\/pro-core\.css/i, 'professional CSS layer was not injected into index.html'],
    [/assets\/js\/pro-core\.js/i, 'professional JS layer was not injected into index.html'],
  ];
  for (const [pattern, message] of critical) if (!pattern.test(index)) errors.push(message);
}

const report = {
  generatedAt: new Date().toISOString(),
  node: process.version,
  pages: htmlFiles.length,
  files: files.length,
  bytes: { total: totalBytes, html: htmlBytes, css: cssBytes, js: jsBytes, images: imageBytes },
  warnings,
  errors,
  manifest,
};

const dataDir = path.join(root, 'assets', 'data');
await fs.mkdir(dataDir, { recursive: true });
await fs.writeFile(path.join(dataDir, 'site-audit.json'), JSON.stringify(report, null, 2) + '\n');

console.log(`Node.js web audit: ${htmlFiles.length} HTML pages, ${files.length} files`);
console.log(`Warnings: ${warnings.length}`);
console.log(`Critical errors: ${errors.length}`);
for (const warning of warnings.slice(0, 20)) console.log(`WARN ${warning}`);
if (warnings.length > 20) console.log(`... ${warnings.length - 20} more warning(s) written to assets/data/site-audit.json`);
if (errors.length) {
  for (const error of errors) console.error(`ERROR ${error}`);
  process.exit(1);
}
