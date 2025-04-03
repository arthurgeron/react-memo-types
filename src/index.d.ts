import 'react';

// --- Prerequisite Types (Defined AND Exported outside module augmentation) ---
export type Memoized<T> = T & { readonly __memoized: unique symbol };
type Primitive = string | number | boolean | symbol | null | undefined;
export type RequireMemoizedProps<P extends object> = {
  [K in keyof P]: P[K] extends Primitive | React.ReactElement
    ? P[K]
    : P[K] extends (...args: unknown[]) => unknown
      ? Memoized<P[K]>
      : P[K] extends object
        ? Memoized<P[K]>
        : P[K];
};

// --- Module Augmentation ---
declare module 'react' {

  // --- Types defined/used internally by augmentation ---
  // (These don't need to be exported from the module itself)

  // Helper type to conditionally add Memoized brand
  type MemoizeIfNeeded<T> = T extends Primitive ? T : Memoized<T>;

  // Stricter type for dependency arrays referencing top-level Memoized
  type StrictDependencyList = ReadonlyArray<Primitive | Memoized<object> | Memoized<(...args: unknown[]) => unknown>>; // Using unknown

  // Helper component type referencing top-level RequireMemoizedProps
  type ComponentWithMemoizedProps<T extends ComponentType<object>> =
    T extends FunctionComponent<infer P>
      ? FunctionComponent<RequireMemoizedProps<P>>
    : T extends ComponentClass<infer P, infer S>
      ? ComponentClass<RequireMemoizedProps<P>, S>
      : T extends ComponentType<infer P>
        ? ComponentType<RequireMemoizedProps<P & object>> // Ensure P is object
        : never; // Fallback

  // --- Hook Augmentations (Referencing internal StrictDependencyList/MemoizeIfNeeded) ---
  function useMemo<T>(factory: () => T, deps: StrictDependencyList | undefined): MemoizeIfNeeded<T>;
  function useCallback<T extends (...args: unknown[]) => unknown>(callback: T, deps: StrictDependencyList): Memoized<T>; // Using unknown
  function useEffect(effect: EffectCallback, deps?: StrictDependencyList): void;
  function useLayoutEffect(effect: EffectCallback, deps?: StrictDependencyList): void;
  function useInsertionEffect(effect: EffectCallback, deps?: StrictDependencyList): void;
  function useImperativeHandle<T, R extends T>(ref: Ref<T> | undefined, init: () => R, deps?: StrictDependencyList): void;

  // --- React.memo Augmentation (Referencing internal ComponentWithMemoizedProps and top-level RequireMemoizedProps) ---

  // Augment React.memo signatures to return MemoizedExoticComponent wrapping the *modified* component type
  // Overload 1: FunctionComponent
  function memo<P extends object>(
      Component: FunctionComponent<P>,
      // propsAreEqual MUST now compare RequireMemoizedProps<P>
      propsAreEqual?: (prevProps: Readonly<RequireMemoizedProps<P>>, nextProps: Readonly<RequireMemoizedProps<P>>) => boolean
  ): MemoizedExoticComponent<FunctionComponent<RequireMemoizedProps<P>>>; // Return type wraps RequireMemoizedProps<P>

  // Overload 2: Generic ComponentType (including class components)
  function memo<T extends ComponentType<object>>(
      Component: T,
       // propsAreEqual MUST now compare RequireMemoizedProps<ComponentProps<T>>
      propsAreEqual?: (prevProps: Readonly<RequireMemoizedProps<ComponentProps<T>>>, nextProps: Readonly<RequireMemoizedProps<ComponentProps<T>>>) => boolean
  ): MemoizedExoticComponent<ComponentWithMemoizedProps<T>>; // Return type wraps ComponentWithMemoizedProps<T>

  // Note: We don't override useContext, useReducer, useRef, useState etc.
  // as their core behavior isn't directly tied to dependency arrays in the same way.
} 