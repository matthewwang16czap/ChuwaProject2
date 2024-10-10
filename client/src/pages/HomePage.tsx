// src/pages/HomePage.tsx

import React, { useState } from 'react';
import reactLogo from '../assets/react.svg';
import viteLogo from '/vite.svg';

const HomePage: React.FC = () => {
  const [count, setCount] = useState(0);

  return (
    <div className="max-w-screen-xl mx-auto p-8 text-center">
      <div className="flex justify-center items-center space-x-8">
        <a
          href="https://vitejs.dev"
          target="_blank"
          rel="noopener noreferrer"
          className="transition-transform duration-300 hover:scale-110"
        >
          <img src={viteLogo} className="h-24 p-6" alt="Vite logo" />
        </a>
        <a
          href="https://react.dev"
          target="_blank"
          rel="noopener noreferrer"
          className="transition-transform duration-300 hover:scale-110 animate-spin-slow"
        >
          <img src={reactLogo} className="h-24 p-6" alt="React logo" />
        </a>
      </div>
      <h1 className="text-5xl font-bold my-8 leading-tight">Vite + React</h1>
      <div className="p-8">
        <button
          className="px-4 py-2 text-base font-medium rounded-lg border border-transparent bg-gray-900 text-white cursor-pointer transition-colors duration-250 hover:border-primary focus:outline-none focus:ring-4 focus:ring-blue-300"
          onClick={() => setCount((count) => count + 1)}
        >
          count is {count}
        </button>
        <p className="mt-4">
          Edit <code>src/pages/HomePage.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="mt-8 text-gray-500">
        Click on the Vite and React logos to learn more
      </p>
    </div>
  );
};

export default HomePage;
