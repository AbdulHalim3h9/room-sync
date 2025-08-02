'use client';

import React, { useContext, useEffect } from 'react';
import FloatingCarryforwardButton from './FloatingCarryforwardButton';
import FloatingPaymentButton from './FloatingPaymentButton';
import FloatingDuesButton from './FloatingDuesButton';
import { useMiscSettings } from '@/contexts/MiscSettingsContext';
import { useFloatingButtons } from '@/contexts/FloatingButtonsContext';

const FloatingButtons = () => {
  const { settings } = useMiscSettings();
  const { updateButtonVisibility } = useFloatingButtons();
  const prevSettingsRef = React.useRef();

  // Update button visibility only when settings actually change
  React.useEffect(() => {
    if (!settings?.floatingButtons || settings.loading) return;
    
    // Check if settings have actually changed
    if (JSON.stringify(prevSettingsRef.current) !== JSON.stringify(settings.floatingButtons)) {
      updateButtonVisibility('carryforward', settings.floatingButtons.carryforward);
      updateButtonVisibility('due', settings.floatingButtons.due);
      updateButtonVisibility('bills', settings.floatingButtons.bills);
      
      // Store current settings for next comparison
      prevSettingsRef.current = { ...settings.floatingButtons };
    }
  }, [settings, updateButtonVisibility]);

  // Don't render anything if settings are still loading
  if (settings.loading || !settings?.floatingButtons) return null;

  return (
    <div className="fixed left-4 bottom-1/2 transform translate-y-1/2 z-[100] flex flex-col gap-3">
      {settings.floatingButtons.carryforward && <FloatingCarryforwardButton />}
      {settings.floatingButtons.due && <FloatingDuesButton />}
      {settings.floatingButtons.bills && <FloatingPaymentButton />}
    </div>
  );
};

export default FloatingButtons;