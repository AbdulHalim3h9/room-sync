'use client';

import React, { useEffect } from 'react';
import { useFloatingButtons } from '@/contexts/FloatingButtonsContext';
import { useMiscSettings } from '@/contexts/MiscSettingsContext';
import FloatingCarryforwardButton from './FloatingCarryforwardButton';
import FloatingPaymentButton from './FloatingPaymentButton';
import FloatingDuesButton from './FloatingDuesButton';

const FloatingButtons = () => {
  const { registerButton } = useFloatingButtons();
  const { settings } = useMiscSettings();

  // Register all buttons with their initial visibility
  useEffect(() => {
    if (!settings?.floatingButtons) return;
    
    registerButton('carryforward', settings.floatingButtons.carryforward ?? true);
    registerButton('due', settings.floatingButtons.due ?? true);
    registerButton('bills', settings.floatingButtons.bills ?? true);
  }, [registerButton, settings?.floatingButtons]);

  return (
    <div className="fixed left-4 bottom-1/2 transform translate-y-1/2 z-[100] flex flex-col gap-3">
      <FloatingCarryforwardButton />
      <FloatingDuesButton />
      <FloatingPaymentButton />
    </div>
  );
};

export default FloatingButtons;