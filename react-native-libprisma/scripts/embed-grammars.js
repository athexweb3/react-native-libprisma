#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const inputFile = path.join(__dirname, '..', 'cpp', 'assets', 'grammars.dat');
const outputFile = path.join(__dirname, '..', 'src', 'grammars.ts');

const zlib = require('zlib');

console.log('Reading grammars.dat...');
const data = fs.readFileSync(inputFile);
const size = data.length;

console.log(`Original size: ${size} bytes (${(size / 1024).toFixed(2)} KB)`);

// Compress with Gzip
const compressed = zlib.gzipSync(data);
const compressedSize = compressed.length;
console.log(`Compressed size: ${compressedSize} bytes (${(compressedSize / 1024).toFixed(2)} KB)`);

// Convert to base64
const base64 = compressed.toString('base64');

// Generate TypeScript file
const content = `// Auto-generated file - DO NOT EDIT
// Generated from grammars.dat
// Original size: ${(size / 1024).toFixed(2)} KB
// Compressed size: ${(compressedSize / 1024).toFixed(2)} KB

export const GRAMMARS_DATA = "${base64}";
`;

console.log(`Writing ${outputFile}...`);
fs.writeFileSync(outputFile, content);

console.log('✅ Successfully embedded grammars.dat as TypeScript!');
console.log(`   Output: ${outputFile}`);
