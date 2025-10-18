import React from 'react';
import { Loader2 } from 'lucide-react';

const Button = ({ children, loading, className = "", ...props }) => (
  <button
    {...props}
    disabled={loading || props.disabled}
    className={`bg-[#7B3F00] text-[#FFD700] px-4 py-2 rounded transition-colors duration-300 hover:bg-[#7B3F00] hover:text-[#FFD700] font-semibold shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD700] ${
      loading ? "opacity-60 cursor-not-allowed" : ""
    } ${className}`}
  >
    {loading ? (
      <span className="flex items-center justify-center">
        <Loader2 className="animate-spin h-5 w-5 mr-2" />
        Loading...
      </span>
    ) : children}
  </button>
);

export default Button;
