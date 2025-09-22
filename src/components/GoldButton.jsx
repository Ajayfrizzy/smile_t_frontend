import React from 'react';

const GoldButton = ({ children, loading, className = "", ...props }) => (
  <button
    {...props}
    disabled={loading || props.disabled}
    className={`bg-[#FFD700] text-[#7B3F00] px-4 py-2 rounded transition-colors duration-300 hover:bg-[#7B3F00] hover:text-[#FFD700] font-semibold shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7B3F00] ${
      loading ? "opacity-60 cursor-not-allowed" : ""
    } ${className}`}
  >
    {loading ? "Loading..." : children}
  </button>
);

export default GoldButton;
