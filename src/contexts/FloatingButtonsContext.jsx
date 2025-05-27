'use client';

import React, { createContext, useContext, useState, useRef, useEffect } from 'react';

const FloatingButtonsContext = createContext();

export const FloatingButtonsProvider = ({ children }) => {
  const [buttons, setButtons] = useState([]);
  const buttonRefs = useRef({});

  const registerButton = (id, isVisible = true) => {
    setButtons(prev => {
      if (prev.some(btn => btn.id === id)) {
        return prev.map(btn => 
          btn.id === id ? { ...btn, isVisible } : btn
        );
      }
      return [...prev, { id, isVisible }];
    });
  };

  const updateButtonVisibility = (id, isVisible) => {
    setButtons(prev => 
      prev.map(btn => 
        btn.id === id ? { ...btn, isVisible } : btn
      )
    );
  };

  const getButtonOffset = (id) => {
    const visibleButtons = buttons.filter(btn => btn.isVisible);
    const buttonIndex = visibleButtons.findIndex(btn => btn.id === id);
    
    if (buttonIndex === -1) return 0;
    
    // Calculate total height of buttons below this one
    let offset = 0;
    for (let i = buttonIndex + 1; i < visibleButtons.length; i++) {
      const btnId = visibleButtons[i].id;
      const btnRef = buttonRefs.current[btnId];
      if (btnRef) {
        // Add button height + margin (assuming 1rem = 16px margin)
        offset += btnRef.offsetHeight + 16;
      }
    }
    
    return offset;
  };

  return (
    <FloatingButtonsContext.Provider 
      value={{ 
        registerButton, 
        updateButtonVisibility,
        getButtonOffset,
        buttonRefs
      }}
    >
      {children}
    </FloatingButtonsContext.Provider>
  );
};

export const useFloatingButtons = () => {
  const context = useContext(FloatingButtonsContext);
  if (!context) {
    throw new Error('useFloatingButtons must be used within a FloatingButtonsProvider');
  }
  return context;
};
