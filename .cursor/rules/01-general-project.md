---
description: General Project Guidelines for @arthurgeron/react-memo-types
globs: ["**/*"]
alwaysApply: true
---
# General Project Guidelines

## Overview
This project provides type-safe React memoization via TypeScript declaration augmentation.
The goal is to catch potential re-rendering issues caused by unmemoized props passed to `React.memo` components at compile time.

## Core Concepts
- **`Memoized<T>` Type:** A branded type (`T & { readonly __memoized: unique symbol }`) applied to values returned by `useMemo` and `useCallback` through declaration merging.
- **`React.memo` Augmentation:** The types for `React.memo` are augmented to expect `Memoized<T>` for object and function props.
- **Hook Augmentation:** Hooks like `useEffect`, `useLayoutEffect`, etc., are augmented to accept `Memoized<T>` in their dependency arrays.
- **`WithMemoizedProps<T>` Utility:** A helper type for library authors using `React.memo` to ensure their components enforce memoized props.

## Contribution Guidelines
- **Focus:** Changes should primarily relate to improving the accuracy and usability of the type definitions.
- **Testing:** While this is a types-only package, ensure changes are validated against the example project (`examples/App.tsx`) or add new examples to cover edge cases.
- **Compatibility:** Aim to maintain compatibility with standard React types and common patterns. Avoid overly restrictive types that might cause false positives.
- **Documentation:** Update the README and any relevant rule files if changes affect usage or core concepts.
- **Simplicity:** Keep the type definitions as straightforward as possible while achieving the desired enforcement. 