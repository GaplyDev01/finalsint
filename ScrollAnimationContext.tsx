import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ScrollAnimationContextType {
  registerElement: (id: string, element: HTMLElement) => void;
  unregisterElement: (id: string) => void;
  isElementVisible: (id: string) => boolean;
}

const ScrollAnimationContext = createContext<ScrollAnimationContextType>({
  registerElement: () => {},
  unregisterElement: () => {},
  isElementVisible: () => false,
});

interface ScrollAnimationProviderProps {
  children: ReactNode;
}

export const ScrollAnimationProvider: React.FC<ScrollAnimationProviderProps> = ({ children }) => {
  const [elements, setElements] = useState<Record<string, HTMLElement>>({});
  const [visibleElements, setVisibleElements] = useState<Record<string, boolean>>({});

  const registerElement = (id: string, element: HTMLElement) => {
    setElements((prev) => ({ ...prev, [id]: element }));
  };

  const unregisterElement = (id: string) => {
    setElements((prev) => {
      const newElements = { ...prev };
      delete newElements[id];
      return newElements;
    });
    
    setVisibleElements((prev) => {
      const newVisibleElements = { ...prev };
      delete newVisibleElements[id];
      return newVisibleElements;
    });
  };

  const isElementVisible = (id: string) => {
    return visibleElements[id] || false;
  };

  useEffect(() => {
    const handleScroll = () => {
      const updatedVisibility: Record<string, boolean> = {};
      
      Object.entries(elements).forEach(([id, element]) => {
        const rect = element.getBoundingClientRect();
        const isVisible = 
          rect.top <= window.innerHeight * 0.8 && 
          rect.bottom >= window.innerHeight * 0.2;
        
        updatedVisibility[id] = isVisible;
      });
      
      setVisibleElements((prev) => ({
        ...prev,
        ...updatedVisibility,
      }));
    };

    // Initial check
    handleScroll();
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [elements]);

  return (
    <ScrollAnimationContext.Provider value={{ registerElement, unregisterElement, isElementVisible }}>
      {children}
    </ScrollAnimationContext.Provider>
  );
};

export const useScrollAnimation = () => useContext(ScrollAnimationContext);