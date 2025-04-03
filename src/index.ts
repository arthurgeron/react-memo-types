// This file can be empty for a types-only library
// or contain minimal placeholder exports if required by tooling.

// export {}; // Example placeholder

// This file primarily exists to satisfy the bundler and module resolution.
// The actual types are provided via src/index.d.ts and src/utils.d.ts

// Re-export utility types if needed, though typically users will rely on the global augmentation.
export type { WithMemoizedProps } from './utils.d';

// Re-export the core types from the declaration file
// This ensures they are part of the module's public API

export type { Memoized, RequireMemoizedProps } from './index.d';

// We don't need to export anything runtime related, 
// as this library is purely for type augmentation.

// Add a simple placeholder export to ensure the file is not empty
// and to indicate the package is loaded.
export const REACT_MEMO_TYPES_LOADED = true;

// Placeholder export to ensure this file is treated as a module
// and tsc has an entry point to compile.
// export {}; // Removed redundant empty export 