#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const inputFile = path.join(__dirname, '..', 'cpp', 'assets', 'grammars.dat');
const outputFile = path.join(__dirname, '..', 'cpp', 'EmbeddedGrammars.h');

console.log('Reading grammars.dat...');
const data = fs.readFileSync(inputFile);
const size = data.length;

console.log(`File size: ${size} bytes (${(size / 1024).toFixed(2)} KB)`);

// Generate C++ header with embedded data
let header = `// Auto-generated file - DO NOT EDIT
// Generated from grammars.dat (${(size / 1024).toFixed(2)} KB)

#pragma once
#include <cstddef>
#include <cstdint>

namespace margelo::nitro::libprisma {

// Embedded grammars.dat data
constexpr size_t GRAMMARS_DATA_SIZE = ${size};

alignas(8) constexpr uint8_t GRAMMARS_DATA[] = {
`;

// Write data in chunks of 16 bytes per line
for (let i = 0; i < size; i += 16) {
  header += '  ';
  for (let j = 0; j < 16 && i + j < size; j++) {
    header += `0x${data[i + j].toString(16).padStart(2, '0')}`;
    if (i + j < size - 1) header += ',';
    if (j < 15 && i + j < size - 1) header += ' ';
  }
  header += '\n';
}

header += `};

} // namespace margelo::nitro::libprisma
`;

console.log(`Writing ${outputFile}...`);
fs.writeFileSync(outputFile, header);

console.log('✅ Successfully embedded grammars.dat!');
console.log(`   Output: ${outputFile}`);
