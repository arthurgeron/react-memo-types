---
description: Guidelines for using RSPack in this project
globs: ["rspack.config.js", "package.json"]
alwaysApply: true
---
# RSPack Guidelines

## Overview
RSPack is used for bundling the TypeScript declaration files and a minimal JavaScript entry point into a distributable format (`dist` directory).

## Configuration
- The main configuration file is `rspack.config.js`.
- Key settings include:
    - `entry`: `src/index.ts` (the minimal TS file that re-exports types).
    - `output`: Configured for UMD format in the `dist` directory.
    - `module.rules`: Uses `builtin:swc-loader` for efficient TypeScript processing.
    - `externals`: `react` is marked as external to avoid bundling it.
    - `mode`: Set to `production` for optimized output.
    - `devtool`: `source-map` for debugging purposes.
- Type checking for the config file is enabled via JSDoc (`/** @type {import('@rspack/cli').Configuration} */`).

## Building
- Run `bun run build` to execute the RSPack build process.
- This generates:
    - `dist/index.js`: The bundled JavaScript entry point.
    - `dist/index.js.map`: The source map.
    - `dist/index.d.ts`: The main declaration file (copied/generated based on tsconfig).
    - `dist/utils.d.ts`: The utility declaration file (copied/generated based on tsconfig).

## Development Server
- The `bun run dev` script uses `rspack dev`, but this is less relevant for a types-only library. The primary focus is the `build` script.

## Best Practices
- Keep the RSPack configuration focused on producing the correct library output (UMD format, externalizing React).
- Rely on `tsconfig.json` (`declaration: true`, `declarationDir`) for generating the `.d.ts` files, RSPack mainly bundles the JS and ensures the structure.
- Refer to RSPack documentation for configuration options: [https://rspack.dev/guide/](https://rspack.dev/guide/) 