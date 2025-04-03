# @arthurgeron/react-memo-types
> Not yet published   
[![npm version](https://badge.fury.io/js/%40arthurgeron%2Freact-memo-types.svg)](https://badge.fury.io/js/%40arthurgeron%2Freact-memo-types)

**Type-safe React memoization at compile time.**

Prevent unnecessary React re-renders caused by unmemoized props with zero runtime cost. This package provides TypeScript definitions that augment the built-in React types (`useMemo`, `useCallback`, `React.memo`, effect hooks) to enforce proper memoization, helping you catch and fix performance issues *before* they become runtime headaches.

## The Problem

Passing unstable object or function references (those created anew on each render) as props to components wrapped in `React.memo`, or using them in hook dependency arrays (`useEffect`, `useLayoutEffect`, etc.), defeats the purpose of memoization. This leads to unexpected and often hard-to-debug performance bottlenecks caused by excessive re-renders.

While static analysis tools (like ESLint plugins) can help detect some cases, they have limitations, can produce false positives/negatives, and only provide suggestions at lint time.

## The Solution: Compile-Time Guarantees

`@arthurgeron/react-memo-types` leverages TypeScript's [Declaration Merging](https://www.typescriptlang.org/docs/handbook/declaration-merging.html) to modify React's own type definitions *within your project*. It intelligently enforces that non-primitive props passed to `React.memo` components and dependencies used in hooks are stable references, typically achieved by wrapping them in `React.useMemo` or `React.useCallback`.

**This means TypeScript itself becomes your memoization watchdog, providing errors directly in your IDE!**

## Key Benefits

*   ✅ **Compile-Time Safety:** Catch memoization errors *as you type*, directly in your IDE.
*   🚀 **Zero Runtime Overhead:** Purely a type-level enhancement using declaration merging. Adds absolutely nothing to your production bundle size or performance footprint.
*   🧘 **No Code Changes Required:** Simply install, configure `tsconfig.json` (see Setup), and immediately benefit from stricter checks across your project.
*   ✨ **Works Automatically (Even with Libraries!):** Because it patches React's core types, these checks apply to *any* component correctly typed with `React.memo` – **including those imported from third-party libraries** – without any extra configuration.
*   💡 **Instant Feedback:** Get immediate error highlighting and feedback within VS Code and other TypeScript-aware editors, enabling a faster development loop.
*   🤝 **Complements Linters:** Use it alongside ESLint rules for a comprehensive approach. This library provides *compile-time guarantees*, while linters offer suggestions and checks for other patterns.

## Installation

```bash
# Using npm
npm install @arthurgeron/react-memo-types --save-dev

# Using yarn
yarn add @arthurgeron/react-memo-types --dev

# Using bun
bun add @arthurgeron/react-memo-types -d
```

## Setup

Ensure TypeScript picks up the augmented types by including the package in your `tsconfig.json`'s `types` array. If you don't have a `types` array, adding it might be necessary.

```json
// tsconfig.json
{
  "compilerOptions": {
    // ... other options
    "types": [
      "node", // Or your specific environment types ("bun-types", etc.)
      "react",
      "@types/react", // Often included implicitly, but good to be explicit
      "@arthurgeron/react-memo-types" // Add this line!
      // ... potentially others like "jest" or "@testing-library/jest-dom"
    ]
  }
}
```

**That's it!** Restart your TS server/IDE window if needed, and the enhanced type checking will be active.

## Usage Example

Consider this standard memoized component:

```tsx
import React from 'react';
// No direct import needed here if setup via tsconfig.json is correct
// import type {} from '@arthurgeron/react-memo-types'; 

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
  // CORRECT: Props are memoized using React hooks
  const memoizedUserInfo = React.useMemo(() => ({ name: 'Alice', age: 30 }), []);
  const memoizedOnSave = React.useCallback(() => { console.log('Saving Alice...'); }, []);

  // INCORRECT: Props are re-created on every render of Parent
  const regularUserInfo = { name: 'Bob', age: 25 }; // New object reference each time!
  const regularOnSave = () => { console.log('Saving Bob...'); }; // New function reference each time!

  return (
    <div>
      <h2>Memoized Component Examples</h2>

      {/* === OK === */}
      {/* Both props are stable references, MyComponent renders once. */}
      <MyComponent userInfo={memoizedUserInfo} onSave={memoizedOnSave} />

      <hr />

      {/* === TYPE ERROR! === */}
      {/* `regularUserInfo` is not wrapped in useMemo. */}
      {/* Error: Type '{ name: string; age: number; }' is not assignable to type 'Memoized<{ name: string; age: number; }>' */}
      {/* <MyComponent userInfo={regularUserInfo} onSave={memoizedOnSave} /> */}
      
      <hr />

      {/* === TYPE ERROR! === */}
      {/* `regularOnSave` is not wrapped in useCallback. */}
      {/* Error: Type '() => void' is not assignable to type 'Memoized<() => void>' */}
      {/* <MyComponent userInfo={memoizedUserInfo} onSave={regularOnSave} /> */}
    </div>
  );
}
```

With `@arthurgeron/react-memo-types` installed and configured, TypeScript will flag the lines marked with `TYPE ERROR!` directly in your editor.

## How it Works (Under the Hood)

1.  **Declaration Merging:** It uses [TypeScript Declaration Merging](https://www.typescriptlang.org/docs/handbook/declaration-merging.html) to augment the global `react` module definition.
2.  **`Memoized<T>` Marker:** It defines a branded type `Memoized<T>` (internally `T & { readonly __memoized: unique symbol }`).
3.  **Hook Augmentation:** It overrides the type signatures of `React.useMemo` and `React.useCallback` to return `Memoized<T>` instead of just `T`.
4.  **`React.memo` Augmentation:** It modifies the type signature of `React.memo` components to *require* `Memoized<T>` for any non-primitive prop (objects, arrays, functions).
5.  **Dependency Array Augmentation:** Hooks like `useEffect`, `useLayoutEffect`, etc., are updated to correctly accept `Memoized<T>` values within their dependency arrays.

This entire process happens at the type level and is erased during compilation, resulting in **zero runtime impact**.

## Utility for Library Authors (`WithMemoizedProps`)

While the automatic checking works for consumers, if you are *authoring* a component library and want to explicitly signal that your memoized component expects memoized props (perhaps for documentation generation or stricter internal checks), you can use the `WithMemoizedProps<Props>` utility type when exporting:

```tsx
import React from 'react';
// Import the utility type directly from the package
import { WithMemoizedProps } from '@arthurgeron/react-memo-types/utils'; // Assuming utils.d.ts is exported

interface ButtonProps {
  onClick: (e: React.MouseEvent) => void;
  style?: object; // e.g., { color: string }
  label: string;
}

const ButtonImpl = (props: ButtonProps) => {
  console.log(`Rendering Button: ${props.label}`);
  return <button type="button" onClick={props.onClick} style={props.style}>{props.label}</button>;
};

// Export the memoized component with explicitly enforced prop types
// Note: You might need to adjust your build process to expose the utils entrypoint
export const Button = React.memo(ButtonImpl) as React.FC<WithMemoizedProps<ButtonProps>>;
```

Now, users of *your* `Button` component will see the `Memoized<T>` requirement directly on the props in their IDE tooltips, in addition to getting the type errors if they pass non-memoized values.

*(Note: Ensure your package build process exports the `utils` types correctly if you intend for library authors to use `WithMemoizedProps` directly.)*

## Inspiration & Further Reading

This library was heavily inspired by its spiritual predecessor, [`eslint-plugin-react-usememo`](https://github.com/arthurgeron/eslint-plugin-react-usememo). While `@arthurgeron/react-memo-types` focuses on providing **compile-time guarantees** through TypeScript, the ESLint plugin operates at **lint time**.

The documentation for `eslint-plugin-react-usememo` provides excellent, detailed explanations and guidelines on the *principles* of React memoization – including crucial advice on **when *not* to memoize** and the reasoning behind memoizing specific patterns. We highly recommend reading its documentation for a deeper conceptual understanding:

*   **[Main README](https://github.com/arthurgeron/eslint-plugin-react-usememo):** Covers the general purpose and guidelines.
*   **[Rule: `require-usememo`](https://github.com/arthurgeron/eslint-plugin-react-usememo/blob/main/docs/rules/require-usememo.md):** Detailed examples and rationale for memoizing props and hook dependencies.

Understanding these concepts will help you apply memoization effectively, even when relying on the type safety provided by this package.

## Contributing

Contributions are welcome! Please see the contribution guidelines within the `.cursor/rules` directory if you have access to the repository via Cursor, or open an issue/PR on GitHub.

## License

MIT
