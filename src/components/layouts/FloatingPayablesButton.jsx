'use client';

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard } from 'lucide-react';

const FloatingPayablesButton = () => {
  const navigate = useNavigate();
  const [isHighlighted, setIsHighlighted] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    const interval = setInterval(() => {
      setIsHighlighted(prev => !prev);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const animatePosition = () => {
      const positions = [
        { top: -4, left: 0 },
        { top: 0, left: 4 },
        { top: 4, left: 0 },
        { top: 0, left: -4 }
      ];
      
      let index = 0;
      const interval = setInterval(() => {
        setPosition(positions[index]);
        index = (index + 1) % positions.length;
      }, 1000);

      return () => clearInterval(interval);
    };

    animatePosition();
  }, []);

  return (
    <button
      onClick={() => navigate('/payables')}
      className={`fixed z-50 transform transition-all duration-300 
        ${isHighlighted ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}
        ${isHighlighted ? 'ring-2 ring-blue-300' : 'ring-1 ring-gray-200'}
        hover:bg-blue-100 hover:text-blue-700 hover:ring-2 hover:ring-blue-300
        h-10 px-4 rounded-full shadow-lg flex items-center gap-2`}
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`
      }}
    >
      <CreditCard className="h-4 w-4 text-gray-600" />
      Payables
    </button>
  );
};

export default FloatingPayablesButton;
