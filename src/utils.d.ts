import type { Memoized } from './index.d';
import type React from 'react';

/**
 * Utility type for library authors to mark component props as requiring memoization.
 * It iterates over the props and wraps object and function types with Memoized<T>,
 * excluding primitive types and React elements.
 *
 * @template Props The original props type of the component.
 */
export type WithMemoizedProps<Props extends object> = {
  [K in keyof Props]: Props[K] extends 
    | string 
    | number 
    | boolean 
    | symbol 
    | null 
    | undefined 
    | React.ReactElement // Exclude React elements (JSX)
    ? Props[K] 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    : Props[K] extends (...args: any[]) => any 
      ? Memoized<Props[K]> 
      : Props[K] extends object 
        ? Memoized<Props[K]> 
        : Props[K];
}; 