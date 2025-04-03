# Investigation Summary

## Project Goal

The primary objective of the this library was to leverage TypeScript's declaration merging and module augmentation capabilities to provide **compile-time safety** for React memoization patterns. Specifically, the goals were to:

1.  Ensure values returned by `React.useMemo` and `React.useCallback` were distinctly typed (using a branded `Memoized<T>` type).
2.  Modify the type signature of `React.memo` so that components wrapped with it would trigger TypeScript errors if non-primitive props (objects, functions) passed via JSX were not wrapped in `Memoized<T>`.
3.  Modify the type signatures of React hooks with dependency arrays (`useEffect`, `useLayoutEffect`, `useCallback`, `useMemo`, etc.) to trigger TypeScript errors if non-primitive dependencies were not wrapped in `Memoized<T>`.

## Core Concepts Implemented

*   **`Memoized<T>`:** A branded type (`T & { readonly __memoized: unique symbol }`) was created to mark values explicitly memoized via hooks.
*   **`RequireMemoizedProps<P>`:** A conditional type was developed to map an original props type `P` to a new type where non-primitive properties are required to be `Memoized<T>`.
*   **`StrictDependencyList`:** A specific array type (`ReadonlyArray<Primitive | Memoized<object> | Memoized<Function>>`) was defined for use in hook dependency arrays.
*   **Module Augmentation (`declare module 'react'`)**: This TypeScript feature was used within `src/index.d.ts` to attempt overriding the signatures of relevant React APIs.

## Investigation Steps & Findings

Extensive testing and debugging were performed, including:

*   Multiple augmentation strategies for `React.memo` and hooks.
*   Using different build tools (`tsc`, `Bun.build` + `oxc-transform`).
*   Testing within the main project and a separate standard React+TS example project (`examples/react-barebones`).
*   Using different package managers (`bun`, `npm`) for the example project.
*   Verifying generated declaration files (`dist/index.d.ts`).
*   Using explicit type annotations to isolate type checking behavior.
*   Performing "smoke tests" by introducing intentionally breaking changes in the augmentations.

### Successes

*   The augmentation for `React.useMemo` and `React.useCallback` to return `Memoized<T>` (or `T` for primitives) was successful and correctly reflected in type checking.
*   The core utility types (`Memoized<T>`, `RequireMemoizedProps<P>`, `StrictDependencyList`) were defined correctly and functioned as expected when used in explicit type annotations.

### Challenges & Failures

The primary goals of enforcing types for `React.memo` props in JSX and for hook dependencies encountered significant, persistent roadblocks:

1.  **`React.memo` Prop Enforcement Failure:** Despite numerous attempts to augment the `React.memo` signature (e.g., by modifying the return type's generic `MemoizedExoticComponent<ComponentWithModifiedProps>`), TypeScript consistently failed to enforce the `RequireMemoizedProps` constraint during JSX type checking (`<MyMemoizedComponent {...props} />`).
    *   **Root Cause:** Type inference. The type checker appears to resolve the expected props based on the component type *before* memoization (`ChildProps`), ignoring the augmented return type of `React.memo` during JSX validation.
    *   **Evidence:** Explicitly typing the component variable (`const TypedComp: FC<RequireMemoizedProps<P>> = React.memo(Comp)`) *did* correctly trigger errors in JSX, proving the limitation lies in inferring the augmented type from `React.memo` itself. The "smoke test" (changing `memo` return type to `string`) resulted in *no* downstream errors, confirming the augmentation was ignored by the inference/checking process.

2.  **Hook Dependency Enforcement Issues:** While some success was achieved in triggering errors for incorrect hook dependencies (requiring dependencies to be explicitly used within the hook body to satisfy `eslint-plugin-react-hooks/exhaustive-deps`), baseline `tsc` checks frequently failed to report expected errors even with the `StrictDependencyList` augmentation in place. This suggests a similar inference or type-checking weakness as seen with `React.memo`.

3.  **Build Tooling Eliminated:** Switching between `tsc`, `oxc-transform`, `bun`, and `npm` did not change the outcome, confirming the issue lies within TypeScript's handling of the augmentation, not the build tooling.

## Conclusion

Based on the evidence gathered through extensive testing, we conclude that using `declare module 'react'` to automatically enforce memoization requirements for **`React.memo` props via JSX type checking** and reliably for **hook dependency arrays** is **currently infeasible**.

While the augmentations can be defined correctly and appear valid syntactically, limitations in TypeScript's type inference for Higher-Order Components like `React.memo` and potentially in dependency array validation prevent these augmentations from being effectively applied at the point of code usage analysis (`tsc`).

## Remaining Library Value

Despite the inability to achieve full automatic enforcement, the library still provides value by:

*   Successfully augmenting `useMemo` and `useCallback` to return the branded `Memoized<T>` type.
*   Providing clear type definitions (`Memoized<T>`, `RequireMemoizedProps<P>`) that developers can use for **opt-in checking** via explicit type annotations on variables, function parameters, or component definitions.

## Next Steps

The recommended path forward is to:

1.  **Simplify the library:** Remove the non-functional augmentations for `React.memo`, `useEffect`, `useLayoutEffect`, `useInsertionEffect`, and `useImperativeHandle` from `src/index.d.ts`.
2.  **Update Documentation:** Clearly state the library's capabilities (typing `useMemo`/`useCallback` returns) and its limitations (no automatic enforcement for `memo` props or hook deps). Provide examples of how to use the exported types for opt-in checking.
3.  **Retain Build Script:** Keep the `build.ts` using `Bun.build` + `oxc-transform` as it correctly generates the necessary declaration files for the remaining working parts.
