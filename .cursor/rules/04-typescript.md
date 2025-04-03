---
description: TypeScript Best Practices for react-memo-types
globs: ["**/*.ts", "**/*.tsx", "tsconfig.json"]
alwaysApply: true
---
# TypeScript Best Practices

## Goal
Leverage TypeScript to provide compile-time safety for React memoization patterns.

## Declaration Augmentation
- The core mechanism is augmenting the `react` module (`declare module 'react' { ... }`) in `src/index.d.ts`.
- Be cautious when overriding existing React types. Ensure the new signatures are compatible or clearly enhance the original intent (e.g., adding `Memoized<T>`).
- Use `eslint-disable-next-line @typescript-eslint/no-explicit-any` sparingly and only when strictly necessary for compatibility with original generic signatures or complex conditional types.
- Prefer `unknown` over `any` where possible (e.g., in `MemoizedDependencyList`).

## Type Definitions (`.d.ts`)
- Keep `.d.ts` files focused solely on type information.
- Use JSDoc comments to explain complex types or the reasoning behind specific definitions.
- Export types clearly (e.g., `Memoized`, `WithMemoizedProps`).

## `tsconfig.json`
- **`strict: true`** is enabled for maximum type safety.
- **`declaration: true`** and **`declarationDir`** are crucial for generating the output `.d.ts` files for the library.
- **`moduleResolution: "bundler"`** aligns with modern tooling like Bun and RSPack.
- **`types`** array includes `@types/react` and `bun-types`.
- Ensure `include` and `exclude` correctly target the source files.

## Coding Style
- Follow standard TypeScript conventions.
- Use clear and descriptive names for types and interfaces.
- Leverage utility types (`ReadonlyArray`, `Partial`, `Pick`, etc.) where appropriate.

## Example Project (`examples/`)
- Use the example project (`examples/App.tsx`) to test type changes.
- Ensure the example clearly demonstrates both correct usage (no type errors) and incorrect usage (triggering the expected type errors).
- Add comments in the example code explaining *why* certain patterns cause errors according to the defined types. 