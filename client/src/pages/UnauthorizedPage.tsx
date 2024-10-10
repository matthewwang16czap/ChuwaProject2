// src/pages/UnauthorizedPage.tsx

import React from 'react';

const UnauthorizedPage: React.FC = () => {
  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded shadow text-center">
      <h1 className="text-3xl font-bold mb-4">Unauthorized</h1>
      <p className="text-lg">
        You do not have permission to view this page.
      </p>
    </div>
  );
};

export default UnauthorizedPage;
