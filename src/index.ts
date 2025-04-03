// This file primarily exists to satisfy the bundler and module resolution.
// The actual types are provided via src/index.d.ts and src/utils.d.ts

// Re-export utility types if needed, though typically users will rely on the global augmentation.
export type { WithMemoizedProps } from './utils.d';

// It might be useful to export the Memoized type directly for some edge cases,
// although direct usage should be rare.
export type { Memoized } from './index.d';

// Add a simple placeholder export to ensure the file is not empty
// and to indicate the package is loaded.
export const REACT_MEMO_TYPES_LOADED = true; 