import { ReactNode } from 'react';

interface ContainerProps {
  children: ReactNode;
  className?: string;
}

/**
 * Centering container used to constrain content to a maximum width.
 * Use this component to wrap page content for a consistent layout.
 */
export default function Container({ children, className = '' }: ContainerProps) {
  return (
    <div className={`max-w-5xl mx-auto px-4 ${className}`}>
      {children}
    </div>
  );
}