import 'react';

// Type marker for memoized values
export type Memoized<T> = T & { readonly __memoized: unique symbol };

declare module 'react' {
  // Re-declare DependencyList to include Memoized<any>
  // We use unknown here for better type safety than any
  type MemoizedDependencyList = ReadonlyArray<string | number | boolean | symbol | null | undefined | Memoized<unknown>>;

  // Override useMemo to return Memoized types
  function useMemo<T>(factory: () => T, deps: MemoizedDependencyList | undefined): Memoized<T>;

  // Override useCallback to return Memoized functions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function useCallback<T extends (...args: any[]) => any>(
    callback: T,
    deps: MemoizedDependencyList | undefined
  ): Memoized<T>;

  // Enhance memo to require Memoized props for non-primitive types
  // We use a conditional type to check if P[K] is a function or an object that isn't ReactElement
  // ReactElements (JSX) are typically stable if their props are stable, so we don't force memoization on them.
  function memo<P extends object>(
    Component: ComponentType<P>,
    propsAreEqual?: (prevProps: Readonly<P>, nextProps: Readonly<P>) => boolean
  ): MemoizedExoticComponent<ComponentType<P>> & {
    readonly type: ComponentType<P>;
    // This is the core enhancement: map props to require Memoized<T> for objects/functions
    // We explicitly exclude ReactElement to avoid unnecessary memoization requirements for JSX children/props.
    // We also exclude primitive types and null/undefined.
    propTypes?: { 
      [K in keyof P]: P[K] extends 
        | string 
        | number 
        | boolean 
        | symbol 
        | null 
        | undefined 
        | ReactElement 
        ? P[K] 
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        : P[K] extends (...args: any[]) => any 
          ? Memoized<P[K]> 
          : P[K] extends object 
            ? Memoized<P[K]> 
            : P[K]; 
    }
  };

  // Type-safe hooks that expect potentially memoized dependencies
  function useEffect(
    effect: EffectCallback,
    deps?: MemoizedDependencyList | undefined
  ): void;

  function useLayoutEffect(
    effect: EffectCallback,
    deps?: MemoizedDependencyList | undefined
  ): void;

  function useImperativeHandle<T, R extends T>(
    ref: Ref<T> | undefined,
    init: () => R,
    deps?: MemoizedDependencyList | undefined
  ): void;

  // Note: We don't override useContext, useReducer, useRef, useState etc.
  // as their core behavior isn't directly tied to dependency arrays in the same way.
} 