---
description: Guidelines for using Bun in this project
globs: ["package.json", "bun.lockb", "**/*.ts", "**/*.tsx"]
alwaysApply: true
---
# Bun Guidelines

## Overview
Bun is used as the runtime, package manager, bundler (via integration, although we use RSPack directly), and test runner for this project.

## Package Management
- **Use `bun install`:** For installing dependencies.
- **Use `bun add <pkg>`:** For adding new dependencies.
- **Use `bun add -d <pkg>`:** For adding new dev dependencies.
- **Use `bun remove <pkg>`:** For removing dependencies.
- **Lockfile:** Commit the `bun.lockb` file to ensure reproducible builds.

## Running Scripts
- Use `bun run <script_name>` to execute scripts defined in `package.json`.
- For simple TS/JS files, you can run them directly: `bun run ./path/to/script.ts`.

## Testing
- Tests are written using Bun's built-in test runner (`bun test`).
- Place test files in a `test` directory or alongside the code they test (e.g., `*.test.ts`).
- Refer to the Bun documentation for test APIs: [https://bun.sh/docs/test/writing](https://bun.sh/docs/test/writing)

## Key Files
- `package.json`: Project metadata and scripts.
- `bun.lockb`: Lockfile for dependencies.
- `tsconfig.json`: TypeScript configuration, respected by Bun.

## Best Practices
- Leverage Bun's speed for development tasks (installing, running scripts, testing).
- Keep dependencies updated using `bun update`. 