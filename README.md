# @arthurgeron/react-memo-types (Proof of Concept - Not Functional)

**⚠️ Important Note:** This repository serves as a **Proof of Concept** and is **not fully functional** due to limitations in TypeScript's declaration merging capabilities for modifying complex generic signatures like those used in `React.memo`. The core idea of enforcing memoization via type augmentation was later refined and proposed directly to React's official types in [DefinitelyTyped PR #72416](https://github.com/DefinitelyTyped/DefinitelyTyped/pull/72416). This package **has not been and will not be published**.

**Type-safe React memoization at compile time (Conceptual).**

This package *demonstrates* the concept of using TypeScript definitions to augment built-in React types (`useMemo`, `useCallback`, `React.memo`, effect hooks) to enforce proper memoization conceptually. The goal was to catch and fix performance issues *before* they become runtime headaches.

## The Problem (Addressed in the PR)

Passing unstable object or function references (those created anew on each render) as props to components wrapped in `React.memo`, or using them in hook dependency arrays (`useEffect`, `useLayoutEffect`, etc.), defeats the purpose of memoization. This leads to unexpected and often hard-to-debug performance bottlenecks caused by excessive re-renders.

While static analysis tools (like ESLint plugins) can help detect some cases, they have limitations, can produce false positives/negatives, and only provide suggestions at lint time.

## The Proposed Solution (in DefinitelyTyped PR)

The ultimate goal, explored in [DefinitelyTyped PR #72416](https://github.com/DefinitelyTyped/DefinitelyTyped/pull/72416), is to leverage TypeScript's type system directly within React's canonical types to modify `React.memo`, `useMemo`, `useCallback`, and hook dependency arrays. This would enforce that non-primitive props and dependencies are stable references, typically achieved by wrapping them in `React.useMemo` or `React.useCallback`.

**The aim is to make TypeScript itself the memoization watchdog, providing errors directly in your IDE.**

## Why This Package Isn't Fully Functional

While augmenting the return types of `useMemo` and `useCallback` using declaration merging works (as demonstrated partially here), reliably augmenting the *input* prop types for a generically typed higher-order component like `React.memo` proved problematic with TypeScript's declaration merging at the time of creation. The necessary modifications to enforce `Memoized<T>` on props within the generic `React.memo` signature were not effectively applied through external augmentation alone.

This limitation led to proposing the changes directly to the upstream `@types/react` package (see the PR linked above) for a robust and integrated solution.

## Conceptual Benefits (Demonstrated by the Idea)

*   ✅ **Compile-Time Safety:** The *concept* aims to catch memoization errors *as you type*.
*   🚀 **Zero Runtime Overhead:** The *concept* is purely type-level.
*   🧘 **Minimal Code Changes (Ideally):** The *goal* was simple setup.
*   ✨ **Automatic Checks (Ideally):** The *goal* was to patch React's core types.
*   💡 **Instant Feedback:** The *concept* leverages IDE integration.
*   🤝 **Complements Linters:** The *concept* works alongside linters.

## Installation & Setup

**(Not Applicable - This package is not published or functional)**

You cannot install this package. Please refer to the [DefinitelyTyped PR #72416](https://github.com/DefinitelyTyped/DefinitelyTyped/pull/72416) for the proposed implementation within React's official types.

## Usage Example (Conceptual)

The following example illustrates *how the types would ideally work* if the augmentation were fully successful. The type errors shown are what the DefinitelyTyped PR aims to achieve.

```tsx
import React from 'react';
// Note: No import needed from this package, the goal was tsconfig integration

// --- This part works via augmentation ---
type Memoized<T> = T & { readonly __memoized: unique symbol };
declare module 'react' {
  function useMemo<T>(factory: () => T, deps: React.DependencyList | undefined): Memoized<T>;
  function useCallback<T extends (...args: any[]) => any>(callback: T, deps: React.DependencyList): Memoized<T>;
}
// --- End working part ---

interface MyComponentProps {
  userInfo: { name: string; age: number }; // An object prop
  onSave: () => void; // A function prop
}

// Standard React.memo usage
const MyComponent = React.memo(({ userInfo, onSave }: MyComponentProps) => {
  console.log('Rendering MyComponent - Should happen infrequently!');
  return (
    <div>
      <p>User: {userInfo.name} ({userInfo.age})</p>
      <button type="button" onClick={onSave}>Save User</button>
    </div>
  );
});

function Parent() {
  // CORRECT: Props are memoized using React hooks (returns Memoized<T>)
  const memoizedUserInfo = React.useMemo(() => ({ name: 'Alice', age: 30 }), []);
  const memoizedOnSave = React.useCallback(() => { console.log('Saving Alice...'); }, []);

  // INCORRECT: Props are re-created on every render of Parent
  const regularUserInfo = { name: 'Bob', age: 25 }; // New object reference each time!
  const regularOnSave = () => { console.log('Saving Bob...'); }; // New function reference each time!

  return (
    <div>
      <h2>Conceptual Memoized Component Examples</h2>

      {/* === OK (Conceptually) === */}
      {/* Both props are Memoized<T>, MyComponent renders once. */}
      <MyComponent userInfo={memoizedUserInfo} onSave={memoizedOnSave} />

      <hr />

      {/* === TYPE ERROR! (Conceptual Goal) === */}
      {/* `regularUserInfo` is not Memoized<T>. This error *does not* occur */}
      {/* correctly with this package due to augmentation limits, but *would* */}
      {/* occur with the proposed canonical type changes. */}
      {/* Hypothetical Error: Type '{ name: string; age: number; }' is not assignable to type 'Memoized<{ name: string; age: number; }>' */}
      {/* <MyComponent userInfo={regularUserInfo} onSave={memoizedOnSave} /> */}

      <hr />

      {/* === TYPE ERROR! (Conceptual Goal) === */}
      {/* `regularOnSave` is not Memoized<T>. Similar limitation as above. */}
      {/* Hypothetical Error: Type '() => void' is not assignable to type 'Memoized<() => void>' */}
      {/* <MyComponent userInfo={memoizedUserInfo} onSave={regularOnSave} /> */}
    </div>
  );
}
```

## How it Works (Conceptual & Limitations)

1.  **Declaration Merging:** It *attempts* to use [TypeScript Declaration Merging](https://www.typescriptlang.org/docs/handbook/declaration-merging.html) to augment the global `react` module definition.
2.  **`Memoized<T>` Marker:** It defines a branded type `Memoized<T>` (internally `T & { readonly __memoized: unique symbol }`).
3.  **Hook Augmentation (Successful Part):** It successfully overrides the type signatures of `React.useMemo` and `React.useCallback` to return `Memoized<T>`.
4.  **`React.memo` Augmentation (Unsuccessful Part):** It *attempts* to modify the type signature of `React.memo` components to *require* `Memoized<T>` for non-primitive props. However, due to the complexity of `React.memo`'s generic signature, external declaration merging fails to enforce this constraint reliably.
5.  **Dependency Array Augmentation (Partially Successful):** Hooks like `useEffect` *can* be updated to accept `Memoized<T>` values, but the full enforcement relies on the upstream changes proposed in the PR.

This entire process *should* happen at the type level and be erased during compilation, resulting in **zero runtime impact**.

## Utility for Library Authors (`WithMemoizedProps`)

**(Not Applicable - Functionality relies on successful `React.memo` augmentation)**

The `WithMemoizedProps<Props>` utility type provided in `utils.d.ts` was intended for library authors but is ineffective without the core `React.memo` augmentation working correctly.

## Inspiration & The Path Forward

This repository was created as an initial exploration based on the ideas from [`eslint-plugin-react-usememo`](https://github.com/arthurgeron/eslint-plugin-react-usememo). Discovering the limitations of declaration merging for `React.memo` led to the creation of the [DefinitelyTyped PR #72416](https://github.com/DefinitelyTyped/DefinitelyTyped/pull/72416), which proposes integrating these stricter checks directly into React's official type definitions. That PR represents the viable path forward for this concept.

We highly recommend reading the documentation for `eslint-plugin-react-usememo` for a deeper conceptual understanding of React memoization principles:

*   **[Main README](https://github.com/arthurgeron/eslint-plugin-react-usememo):** Covers the general purpose and guidelines.
*   **[Rule: `require-usememo`](https://github.com/arthurgeron/eslint-plugin-react-usememo/blob/main/docs/rules/require-usememo.md):** Detailed examples and rationale.

Understanding these concepts is crucial for effective memoization.

## Contributing

Contributions to *this specific repository* are unlikely given its status as a non-functional PoC. Please direct efforts and feedback towards the [DefinitelyTyped PR #72416](https://github.com/DefinitelyTyped/DefinitelyTyped/pull/72416).

## License

MIT
