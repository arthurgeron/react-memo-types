import React, { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

// Import the package by name - TypeScript should resolve this via node_modules
// due to the `file:` dependency we added.
// Explicitly importing the types might be necessary if global augmentation doesn't apply automatically
// import type { Memoized, RequireMemoizedProps } from '@arthurgeron/react-memo-types';
// We rely on the global augmentation for now.

// --- Test Component ---
interface ChildProps {
  data: { value: string };
  config: { setting: boolean };
  onClick: () => void;
}

const MemoizedChild = React.memo(({ data, config, onClick }: ChildProps) => {
  console.log('Rendering MemoizedChild', data.value, config.setting);
  return <button type="button" onClick={onClick}>Child Data: {data.value}</button>;
});

// --- App Component ---
function App() {
  const [count, setCount] = useState(0)

  // Correctly memoized values
  const memoizedData = React.useMemo(() => ({ value: 'memoized data' }), []);
  const memoizedConfig = React.useMemo(() => ({ setting: true }), []);
  const memoizedOnClick = React.useCallback(() => {
    console.log('Memoized click!');
  }, []);

  // Incorrectly defined values (new reference on every render)
  const nonMemoizedData = { value: 'non-memoized data' }; 
  const nonMemoizedConfig = { setting: false }; 
  const nonMemoizedOnClick = () => {
    console.log('Non-memoized click!');
  };

  console.log('Rendering App', count);

  // --- Hook Dependency Tests ---

  // Correct: Primitive and Memoized dependencies
  // eslint-disable-next-line react-hooks/exhaustive-deps -- Testing type validity, not hook logic
  React.useEffect(() => {
    console.log('Effect with primitive and memoized deps', count, memoizedData);
    // Use the callback to satisfy exhaustive-deps for this type-checking example
    if (typeof memoizedOnClick === 'function') {
      console.log('Callback type for check:', typeof memoizedOnClick);
    }
  }, [count, memoizedData, memoizedOnClick]); // Should pass type check

  // Incorrect: Object dependency not memoized
  React.useEffect(() => {
    console.log('Effect with non-memoized config', nonMemoizedConfig);
    JSON.stringify(nonMemoizedConfig); 
  }, [nonMemoizedConfig]); 
  

  // Incorrect: Function dependency not memoized
  React.useEffect(() => {
    console.log('Effect with non-memoized callback');
    nonMemoizedOnClick();
  }, [nonMemoizedOnClick]); 
  

  // Incorrect: Mixed dependencies
  React.useEffect(() => {
    console.log('Effect with mixed deps', memoizedConfig, nonMemoizedData);
  }, [memoizedConfig]);
  

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank" rel="noreferrer">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank" rel="noreferrer">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button type="button" onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>

      <hr />
      <h2>Memoized Child Usage</h2>
      
      {/* Correct Usage: All props memoized */}
      <MemoizedChild 
        data={memoizedData} 
        config={memoizedConfig} 
        onClick={memoizedOnClick} 
      />

      {/* Incorrect Usage: data prop not memoized */}
      {/* TODO: UNCOMMENT TO TEST - Should cause TS error */}
      <MemoizedChild 
        data={nonMemoizedData} 
        config={memoizedConfig} 
        onClick={memoizedOnClick} 
      /> 

      {/* Incorrect Usage: onClick prop not memoized */}
      {/* TODO: UNCOMMENT TO TEST - Should cause TS error */}
      <MemoizedChild 
        data={memoizedData} 
        config={memoizedConfig} 
        onClick={nonMemoizedOnClick} 
      /> 

      {/* Incorrect Usage: multiple props not memoized */}
      {/* TODO: UNCOMMENT TO TEST - Should cause TS error */}
      <MemoizedChild 
        data={nonMemoizedData} 
        config={nonMemoizedConfig} 
        onClick={nonMemoizedOnClick} 
      /> 
    </>
  )
}

export default App
