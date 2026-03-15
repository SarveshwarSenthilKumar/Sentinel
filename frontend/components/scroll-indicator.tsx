"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";

interface ScrollIndicatorProps {
  className?: string;
  size?: number;
  onClick?: () => void;
}

export function ScrollIndicator({ 
  className = "", 
  size = 24,
  onClick 
}: ScrollIndicatorProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      // Hide the indicator when user has scrolled down a bit
      const scrolled = window.scrollY > 100;
      setIsVisible(!scrolled);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      // Default behavior: scroll down by one viewport height
      window.scrollBy({
        top: window.innerHeight,
        behavior: "smooth"
      });
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className={`
        fixed bottom-8 left-1/2 transform -translate-x-1/2 
        z-30 cursor-pointer opacity-80 hover:opacity-100
        bg-gray-900/50 backdrop-blur-sm rounded-full p-4 
        transition-all duration-300 hover:scale-110
        shadow-lg
        ${className}
      `}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          handleClick();
        }
      }}
      aria-label="Scroll down"
    >
      <ChevronDown 
        size={size} 
        className="text-white" 
      />
    </div>
  );
}
