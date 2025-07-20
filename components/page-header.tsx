"use client"

import { useState, useEffect, useRef } from "react"

// MarqueeText component for scrolling long text
const MarqueeText = ({ text, className = "" }: { text: string; className?: string }) => {
  const [shouldScroll, setShouldScroll] = useState(false);
  const textRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkScroll = () => {
      if (textRef.current && containerRef.current) {
        const textWidth = textRef.current.scrollWidth;
        const containerWidth = containerRef.current.clientWidth;
        setShouldScroll(textWidth > containerWidth + 10); // Add small buffer
      }
    };

    checkScroll();
    // Re-check on window resize
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [text]);

  // Always show marquee for long text to ensure it works
  const isLongText = text.length > 50; // Threshold for subtitle marquee
  
  // Force marquee for any text longer than 50 characters or if it should scroll
  if (!shouldScroll && !isLongText) {
    return (
      <div ref={containerRef} className={`overflow-hidden ${className}`}>
        <div ref={textRef} className="whitespace-nowrap">
          {text}
        </div>
      </div>
    );
  }

  // Always show marquee with duplicated text
  return (
    <div ref={containerRef} className={`overflow-hidden ${className}`}>
      <div
        ref={textRef}
        className="whitespace-nowrap animate-marquee"
        style={{
          animationDuration: `${Math.max(8, text.length * 0.15)}s`
        }}
      >
        {text}
        <span className="ml-8">{text}</span>
      </div>
    </div>
  );
};

interface PageHeaderProps {
  title: string
  subtitle?: string
}

export function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <div className="bg-indigo-900 text-white py-6 px-8 rounded-lg shadow-md mb-6">
      <h1 className="text-5xl font-bold text-center">{title}</h1>
      {subtitle && (
        <div className="text-center mt-2">
          <MarqueeText 
            text={subtitle}
            className="text-lg"
          />
        </div>
      )}
    </div>
  )
}
