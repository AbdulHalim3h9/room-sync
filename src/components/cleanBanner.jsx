"use client";

import React, { useState } from "react";
import { X } from "lucide-react";

const AnnouncementBanner = () => {
  const [showBanner, setShowBanner] = useState(true);

  const handleClose = () => {
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <style>
        {`
          .banner {
            background: linear-gradient(135deg, #2563eb, #1e40af);
            color: white;
            padding: 1rem;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 1rem;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          }
          
          .banner-content {
            display: flex;
            align-items: center;
            gap: 1rem;
          }
          
          .banner-close {
            cursor: pointer;
            padding: 0.5rem;
            transition: color 0.2s;
          }
          
          .banner-close:hover {
            color: #93c5fd;
          }
          
          .banner-button {
            background: white;
            color: #1e40af;
            padding: 0.5rem 1rem;
            border-radius: 0.5rem;
            text-decoration: none;
            font-weight: 500;
            transition: all 0.2s;
          }
          
          .banner-button:hover {
            background: #f1f5f9;
            transform: translateY(-1px);
          }
        `}
      </style>
      
      <div className="banner">
        <div className="banner-content">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🚀</span>
            <span>Try our new feature now!</span>
          </div>
          <a href="#" className="banner-button">
            Try Now
          </a>
        </div>
        <button className="banner-close" onClick={handleClose}>
          <X size={20} />
        </button>
      </div>
    </div>
  );
};

export default AnnouncementBanner;
