'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const FloatingPaymentButton = () => {
  const navigate = useNavigate();
  const [isHighlighted, setIsHighlighted] = useState(false);
  const [animationOffset, setAnimationOffset] = useState({ top: 0, left: 0 });
  const [isVisible, setIsVisible] = useState(true);
  const buttonRef = useRef(null);

  // Toggle highlight effect every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setIsHighlighted(prev => !prev);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Subtle floating animation
  useEffect(() => {
    const animatePosition = () => {
      const offsets = [
        { top: -2, left: 0 },
        { top: -1, left: 1 },
        { top: 0, left: 2 },
        { top: 1, left: 1 },
        { top: 2, left: 0 },
        { top: 1, left: -1 },
        { top: 0, left: -2 },
        { top: -1, left: -1 }
      ];
      
      let index = 0;
      const interval = setInterval(() => {
        setAnimationOffset(offsets[index]);
        index = (index + 1) % offsets.length;
      }, 500);

      return () => clearInterval(interval);
    };

    animatePosition();
  }, []);

  if (!isVisible) return null;

  return (
    <button
      ref={buttonRef}
      onClick={() => navigate('/payables')}
      className={cn(
        'flex items-center justify-center gap-2',
        'px-3 py-2 rounded-full shadow-lg',
        'hover:scale-105 group transition-all duration-300',
        'text-sm font-medium whitespace-nowrap',
        isHighlighted ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' : 'bg-white text-green-600',
        isHighlighted ? 'ring-2 ring-green-300 shadow-xl' : 'ring-1 ring-gray-200'
      )}
      style={{
        transform: `translate(${animationOffset.left}px, ${animationOffset.top}px)`
      }}
    >
      <CreditCard className="h-4 w-4" />
      <span>মাসিক বিল</span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsVisible(false);
        }}
        className="ml-1 p-1 rounded-full hover:bg-gray-100/50 text-current opacity-60 hover:opacity-100"
      >
        <X className="h-3 w-3" />
      </button>
    </button>
  );
};

export default FloatingPaymentButton;