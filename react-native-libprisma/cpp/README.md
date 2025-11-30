# Generating EmbeddedGrammars.h

The `cpp/EmbeddedGrammars.h` file is a generated file that embeds the Prism.js grammar data directly into the C++ code. This file is **not** committed to the repository due to its large size (3.6MB, 38k+ lines).

## How to Generate

Run the embed-grammars script before building:

```bash
# From the package root
node scripts/embed-grammars.js
```

This will:
1. Read `cpp/assets/grammars.dat`
2. Convert it to a C++ header file
3. Output to `cpp/EmbeddedGrammars.h`

## Build Process

The build process should automatically generate this file:

### iOS
Add a pre-build script phase in Xcode that runs:
```bash
node "${PODS_TARGET_SRCROOT}/scripts/embed-grammars.js"
```

### Android
The CMakeLists.txt includes a custom command to generate the file before compilation.

## Why Not Commit?

- **Size**: 3.6MB is too large for version control
- **Generated**: Can be recreated from `grammars.dat`
- **Build Time**: Generated at build time as needed
- **Updates**: Changes to grammars only need to update the .dat file

## Manual Generation

If the build process doesn't auto-generate:

```bash
cd react-native-libprisma
yarn install
node scripts/embed-grammars.js
```

The file will be created at `cpp/EmbeddedGrammars.h`.
