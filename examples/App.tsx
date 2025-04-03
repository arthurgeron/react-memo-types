import React, { useState } from 'react';

// Import the types - this ensures TypeScript uses our augmented declarations
// In a real project, this import isn't strictly needed if the types are included
// via tsconfig.json, but explicit import helps ensure clarity in this example.
import type {} from '@arthurgeron/react-memo-types';

// --- Correctly Memoized Child Component ---
interface MemoizedChildProps {
  data: { value: string };
  onClick: () => void;
}

// Wrap with React.memo - our types will now enforce memoized props
const MemoizedChild = React.memo(({ data, onClick }: MemoizedChildProps) => {
  console.log('Rendering MemoizedChild');
  return <button type="button" onClick={onClick}>Child Data: {data.value}</button>;
});

// --- Incorrectly Used Child Component (for comparison) ---
interface RegularChildProps {
  data: { value: string };
  onClick: () => void;
}

// Standard component WITHOUT React.memo
const RegularChild = ({ data, onClick }: RegularChildProps) => {
  console.log('Rendering RegularChild');
  return <button type="button" onClick={onClick}>Regular Child Data: {data.value}</button>;
};


// --- Parent Component ---
function App() {
  const [count, setCount] = useState(0);

  // Correctly memoized values
  const memoizedData = React.useMemo(() => ({ value: 'memoized' }), []);
  const memoizedOnClick = React.useCallback(() => {
    console.log('Memoized click!');
  }, []);

  // Incorrectly defined values (new reference on every render)
  const nonMemoizedData = { value: 'not memoized' }; 
  const nonMemoizedOnClick = () => {
    console.log('Non-memoized click!');
  };

  console.log('Rendering App', count);

  return (
    <div>
      <h1>React Memo Types Example</h1>
      <button type="button" onClick={() => setCount(c => c + 1)}>Re-render App ({count})</button>

      <hr />
      <h2>Correct Usage (Memoized Child)</h2>
      {/* This works because props are correctly memoized */}
      <MemoizedChild data={memoizedData} onClick={memoizedOnClick} />
      
      {/* Uncommenting the lines below should cause TypeScript errors */}
      {/* Error: Type '{ value: string; }' is not assignable to type 'Memoized<{ value: string; }>'. */}
      {/* <MemoizedChild data={nonMemoizedData} onClick={memoizedOnClick} /> */}

      {/* Error: Type '() => void' is not assignable to type 'Memoized<() => void>'. */}
      {/* <MemoizedChild data={memoizedData} onClick={nonMemoizedOnClick} /> */}

      <hr />
      <h2>Incorrect Usage (Regular Child - No Type Errors Here)</h2>
      {/* This works fine type-wise, but RegularChild will re-render unnecessarily */}
      <RegularChild data={nonMemoizedData} onClick={nonMemoizedOnClick} />
      {/* This also works, demonstrating the lack of enforcement without React.memo */}
      <RegularChild data={memoizedData} onClick={memoizedOnClick} />

    </div>
  );
}

export default App; 