import React from "react";

export function TooltipProvider({ children }) {
  return <>{children}</>;
}

export function Tooltip({ children }) {
  return <div className="relative group inline-block">{children}</div>;
}

export function TooltipTrigger({ children }) {
  return children;
}

export function TooltipContent({ children, className = "" }) {
  return (

    <div
      className={`
        absolute
        z-50
        hidden
        group-hover:block
        bottom-full
        mb-2
        left-1/2
        -translate-x-1/2
        px-2
        py-1
        text-xs
        rounded
        bg-black
        text-white
        shadow-lg
        ${className}
      `}
    >

      {children}

    </div>

  );
}