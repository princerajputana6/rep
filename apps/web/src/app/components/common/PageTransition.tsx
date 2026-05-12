/**
 * Enhanced Page Transitions Wrapper
 * Smooth animations between page changes
 */

import { ReactNode, useEffect, useState } from 'react';

interface PageTransitionProps {
  children: ReactNode;
  pageKey: string;
}

export function PageTransition({ children, pageKey }: PageTransitionProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation on mount
    setIsVisible(false);
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, [pageKey]);

  return (
    <div
      className={`transition-all duration-300 ${
        isVisible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-4'
      }`}
    >
      {children}
    </div>
  );
}

// Stagger animation for list items
export function StaggerList({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`space-y-4 ${className}`}>
      {React.Children.map(children, (child, index) => (
        <div
          className="opacity-0 animate-in fade-in slide-in-from-left-5"
          style={{
            animationDelay: `${index * 50}ms`,
            animationFillMode: 'forwards',
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}
