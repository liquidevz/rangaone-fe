"use client";

import React from "react";

interface MotionProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  transition?: { duration: number };
}

export const motion = {
  div: React.forwardRef<HTMLDivElement, MotionProps>((props, ref) => {
    const { children, className, style, transition, ...rest } = props;
    return (
      <div
        ref={ref}
        className={className}
        style={{
          ...style,
          transition: transition ? `all ${transition.duration}s ease` : undefined,
        }}
        {...rest}
      >
        {children}
      </div>
    );
  }),
};

export const AnimatePresence: React.FC<{ children: React.ReactNode; initial?: boolean }> = ({ 
  children, 
  initial = true 
}) => {
  return <>{children}</>;
}; 