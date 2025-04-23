import React, { useRef, useEffect, useState, ReactNode } from 'react';

interface AnimatedElementProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  threshold?: number;
  animation?: 'fade-in' | 'fade-in-up' | 'fade-in-down' | 'scale-in' | 'slide-in';
}

const AnimatedElement: React.FC<AnimatedElementProps> = ({
  children,
  className = '',
  delay = 0,
  threshold = 0.1,
  animation = 'fade-in-up',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentRef = ref.current;
    if (!currentRef) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            setIsVisible(true);
          }, delay);
          observer.unobserve(currentRef);
        }
      },
      {
        threshold,
        rootMargin: '0px 0px -50px 0px',
      }
    );

    observer.observe(currentRef);

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [delay, threshold]);

  return (
    <div
      ref={ref}
      className={`${className} ${animation} ${isVisible ? 'animate-' + animation : 'opacity-0'}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

export default AnimatedElement;