'use client';

import React from 'react';
import FloatingCarryforwardButton from './FloatingCarryforwardButton';
import FloatingPaymentButton from './FloatingPaymentButton';
import FloatingDuesButton from './FloatingDuesButton';

const FloatingButtons = () => {
  return (
    <div className="fixed left-4 bottom-1/2 transform translate-y-1/2 z-[100] flex flex-col gap-3">
      <FloatingCarryforwardButton />
      <FloatingPaymentButton />
      <FloatingDuesButton />
    </div>
  );
};

export default FloatingButtons;