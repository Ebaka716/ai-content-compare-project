import React from 'react';

const Header = () => {
  return (
    <div className="text-center p-4 bg-white shadow-md z-10">
      <h1 className="text-gray-800 tracking-[var(--fidelity-header-letter-spacing)] text-2xl font-normal m-0 mb-1">
        Content Format Preview
      </h1>
      <p className="text-gray-600 m-0 text-sm">
        Create and preview your content in different formats
      </p>
    </div>
  );
};

export default Header; 