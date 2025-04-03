# Type-Safe React Memoization 

## Overview

This document outlines a proposal for implementing a type-safe approach to React memoization using TypeScript's type system. The approach aims to solve the limitations of static analysis by leveraging TypeScript to enforce proper memoization patterns at compile time.

## Background

The current `eslint-plugin-react-usememo` uses static analysis to detect cases where values passed as props or used in hook dependencies should be memoized. However, this approach has limitations:

1. Static analysis cannot always determine if a value needs memoization
2. It's difficult to detect when values are used in hooks without extensive configuration
3. False positives can occur when analyzing complex code patterns

## Proposed Solution

Create a TypeScript declaration package that augments React's built-in types to enforce memoization patterns at compile time, without requiring users to change their code.

### Core Concept

Introduce a `Memoized<T>` type that marks values returned from `useMemo` and `useCallback`. Components wrapped in `React.memo` would expect props of type `Memoized<T>` for non-primitive values.

```typescript
// Type marker for memoized values
type Memoized<T> = T & { readonly __memoized: unique symbol };
```

### Implementation Details

1. **Augment React's built-in types**:

```typescript
declare module 'react' {
  // Override useMemo to return Memoized types
  function useMemo<T>(factory: () => T, deps: DependencyList): Memoized<T>;
  
  // Override useCallback to return Memoized functions
  function useCallback<T extends (...args: any[]) => any>(
    callback: T, 
    deps: DependencyList
  ): Memoized<T>;
  
  // Enhance memo to require Memoized props for non-primitive types
  function memo<P extends object>(
    Component: ComponentType<P>
  ): ComponentType<{
    [K in keyof P]: P[K] extends object | ((...args: any[]) => any) 
      ? Memoized<P[K]> 
      : P[K]
  }>;
  
  // Type-safe hooks that expect memoized dependencies
  function useEffect(
    effect: EffectCallback,
    deps?: ReadonlyArray<string | number | boolean | symbol | null | undefined | Memoized<any>>
  ): void;
  
  function useLayoutEffect(
    effect: EffectCallback,
    deps?: ReadonlyArray<string | number | boolean | symbol | null | undefined | Memoized<any>>
  ): void;
  
  // Same for other hooks with dependencies
}
```

2. **Add utility types for third-party libraries**:

```typescript
// Utility for library authors to mark component props as requiring memoization
export type WithMemoizedProps<Props extends object> = {
  [K in keyof Props]: Props[K] extends object | ((...args: any[]) => any) 
    ? Memoized<Props[K]> 
    : Props[K]
};
```

## Benefits

1. **Compile-time checking**: TypeScript will catch memoization issues during development
2. **Zero code changes**: Works with existing React code
3. **IDE integration**: Immediate feedback in editor
4. **Precision**: The type system tracks exactly which values are memoized
5. **Framework agnostic**: Works with any React-based library
6. **No runtime overhead**: Just TypeScript types

## Implementation Plan

1. Create a lightweight package with TypeScript declarations:
   - `@arthurgeron/react-memo-types`

2. Package structure:
   ```
   @arthurgeron/react-memo-types/
   ├── package.json
   ├── index.d.ts        (main type definitions)
   ├── third-party.d.ts  (utilities for third-party libraries)
   ├── tsconfig.json     (TypeScript configuration)
   └── README.md         (documentation)
   ```

3. Simple installation process:
   ```bash
   npm install @arthurgeron/react-memo-types --save-dev
   ```

4. Setup in tsconfig.json:
   ```json
   {
     "compilerOptions": {
       "types": ["@arthurgeron/react-memo-types"]
     }
   }
   ```

## Usage Examples

### Basic Usage

```tsx
function Component() {
  // Automatically typed as Memoized<{value: string}>
  const data = React.useMemo(() => ({ value: 'hello' }), []);
  
  // Automatically typed as Memoized<() => void>
  const handleClick = React.useCallback(() => {}, []);
  
  // Regular object is NOT memoized
  const regularData = { foo: 'bar' };
  
  // MemoComponent expects memoized props
  const MemoComponent = React.memo(({ data, onClick }) => {
    return <div onClick={onClick}>{data.value}</div>;
  });
  
  // This works - props are memoized
  return <MemoComponent data={data} onClick={handleClick} />;
  
  // This would cause a type error:
  // Type '{ foo: string; }' is not assignable to type 'Memoized<{ foo: string; }>'
  // return <MemoComponent data={regularData} onClick={handleClick} />;
}
```

### Third-Party Library Integration

```tsx
// Library authors can use the WithMemoizedProps utility
import { WithMemoizedProps } from '@arthurgeron/react-memo-types';

// Regular component props
interface ButtonProps {
  onClick: (e: React.MouseEvent) => void;
  style?: object;
}

// Create the component
const Button = (props: ButtonProps) => { /* implementation */ };

// Export it wrapped in memo
export default React.memo(Button) as React.ComponentType<WithMemoizedProps<ButtonProps>>;
```

## Relationship with eslint-plugin-react-usememo

This type-based approach would complement the existing ESLint plugin:

1. **Type-safe approach**: For TypeScript projects that want compile-time checking
2. **ESLint plugin**: For JavaScript projects or additional runtime checks

Teams could choose to use either approach or both together for maximum safety.

## Future Enhancements

1. Add more granular control over which props require memoization
2. Provide ESLint integration to catch issues at both compile time and runtime
3. Create example projects demonstrating integration with popular frameworks
4. Add support for class components and legacy patterns

## Conclusion

By leveraging TypeScript's type system, we can provide a more precise and developer-friendly way to enforce proper memoization patterns in React applications, without requiring users to change their code. This approach addresses the limitations of static analysis while offering a better developer experience with immediate feedback in the IDE. 