import React from 'react';

const Button = ({ children, loading, className = "", ...props }) => (
  <button
    {...props}
    disabled={loading || props.disabled}
    className={`bg-[#7B3F00] text-[#FFD700] px-4 py-2 rounded transition-colors duration-300 hover:bg-[#FFD700] hover:text-[#7B3F00] font-semibold shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD700] ${
      loading ? "opacity-60 cursor-not-allowed" : ""
    } ${className}`}
  >
    {loading ? "Loading..." : children}
  </button>
);

export default Button;
