"use client";

import React, { useState, useEffect } from "react";
import { X, Bell, ChevronRight, Calendar, User } from "lucide-react";
import { db } from "@/firebase";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";

const AnnouncementBanner = () => {
  const [showBanner, setShowBanner] = useState(true);
  const [announcements, setAnnouncements] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleClose = (e) => {
    e.stopPropagation();
    setShowBanner(false);
  };

  const handleExpand = () => {
    setIsExpanded(true);
  };

  const handleCloseExpand = (e) => {
    e.stopPropagation();
    setIsExpanded(false);
  };

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const q = query(
          collection(db, "announcements"),
          orderBy("timestamp", "desc"),
          limit(5)
        );
        
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          setError("No announcements found");
          setIsLoading(false);
          return;
        }

        const announcementsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setAnnouncements(announcementsData);
        setCurrentIndex(0);
        setIsLoading(false);
        
        if (announcementsData.length > 1) {
          const rotationInterval = setInterval(() => {
            setCurrentIndex((prev) => 
              (prev + 1) % announcementsData.length
            );
          }, 5000); // Increased to 5 seconds for better readability

          return () => clearInterval(rotationInterval);
        }
      } catch (error) {
        setError(error.message);
        setIsLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  useEffect(() => {
    if (announcements.length > 0) {
      setCurrentIndex(0);
    }
  }, [announcements]);

  // Don't show anything if there are no announcements and we're not loading
  if (announcements.length === 0 && !isLoading) return null;
  
  // Don't show if user has closed the banner
  if (!showBanner) return null;

  const renderDots = () => {
    if (announcements.length <= 1) return null;
    
    return (
      <div className="flex space-x-1 items-center">
        {announcements.map((_, index) => (
          <div 
            key={index} 
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentIndex ? "bg-white scale-110" : "bg-white bg-opacity-40"
            }`}
          />
        ))}
      </div>
    );
  };

  // Format date for display if announcement has timestamp
  const formatDate = (timestamp) => {
    if (!timestamp) return null;
    
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric'
      });
    } catch (e) {
      return null;
    }
  };

  if (isLoading) {
    return (
      <div className="relative w-full px-4">
        <div className="banner-loader">
          <div className="flex items-center gap-3">
            <div className="animate-pulse rounded-full bg-white bg-opacity-40 p-2">
              <Bell size={16} className="text-white" />
            </div>
            <span className="text-base">Loading announcements...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative w-full px-4">
        <div className="banner-error">
          <div className="flex items-center gap-3">
            <span className="text-xl">❌</span>
            <span className="text-base">Error: {error}</span>
          </div>
        </div>
      </div>
    );
  }

  if (announcements.length === 0) {
    return (
      <div className="relative w-full px-4">
        <div className="banner-empty">
          <span className="text-base">No announcements available</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full px-4">
      <style jsx global>{`
        @keyframes gradientShift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes slideIn {
          from { opacity: 0; transform: translate(-50%, -45%); }
          to { opacity: 1; transform: translate(-50%, -50%); }
        }

        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(255, 107, 107, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(255, 107, 107, 0); }
          100% { box-shadow: 0 0 0 0 rgba(255, 107, 107, 0); }
        }

        .banner, .banner-loader, .banner-error, .banner-empty {
          background: linear-gradient(135deg, #ff6b6b, #ff8e8e, #ff7eb3, #ff6b6b);
          background-size: 300% 300%;
          animation: gradientShift 15s ease infinite;
          color: white;
          padding: 1rem 1.25rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-radius: 12px;
          margin: 1rem auto;
          width: 95%;
          min-width: 90%;
          box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.3);
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .banner::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.5), transparent);
        }

        .banner:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 20px rgba(255, 107, 107, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.3);
        }

        .banner-content {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex: 1;
        }

        .icon-container {
          background-color: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          padding: 0.5rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .announcement-text {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
          line-height: 1.5;
          margin: 0 0.5rem;
          font-weight: 500;
          text-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);
        }

        .banner-close {
          cursor: pointer;
          padding: 0.4rem;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.15);
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(2px);
        }

        .banner-close:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: rotate(90deg);
        }

        /* Enhanced Expanded Banner (Popup) */
        .expanded-banner {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 90%;
          max-width: 600px;
          background: linear-gradient(135deg, #ff517b, #ff6b6b);
          border-radius: 16px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1) inset;
          padding: 0;
          z-index: 1000;
          color: white;
          animation: slideIn 0.3s ease-out;
          overflow: hidden;
        }

        .expanded-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 2rem;
          background: rgba(0, 0, 0, 0.15);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .expanded-title {
          font-size: 1.25rem;
          font-weight: 600;
          display: flex;
          align-items: center;
        }

        .expanded-close {
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .expanded-close:hover {
          background: rgba(255, 255, 255, 0.25);
          transform: rotate(90deg);
        }

        .announcements-list {
          max-height: 60vh;
          overflow-y: auto;
          padding: 1.5rem;
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
        }

        .announcements-list::-webkit-scrollbar {
          width: 6px;
        }

        .announcements-list::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }

        .announcements-list::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 10px;
        }

        /* Improved Announcement Item with Better Contrast */
        .announcement-item {
          padding: 1.25rem;
          margin-bottom: 1rem;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.9);
          color: #333;
          transition: all 0.2s;
          box-shadow: 0 3px 8px rgba(0, 0, 0, 0.05);
          border-left: 4px solid #ff517b;
        }

        .announcement-item:hover {
          transform: translateX(3px);
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        }

        .announcement-item:last-child {
          margin-bottom: 0;
        }

        .announcement-content {
          font-weight: 500;
          line-height: 1.5;
          color: #222;
        }

        .announcement-meta {
          display: flex;
          align-items: center;
          margin-top: 0.75rem;
          padding-top: 0.75rem;
          border-top: 1px solid rgba(0, 0, 0, 0.07);
          color: #666;
          font-size: 0.8rem;
        }

        .admin-badge {
          background: #ff517b;
          color: white;
          border-radius: 12px;
          padding: 3px 10px;
          font-size: 0.7rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          box-shadow: 0 2px 5px rgba(255, 81, 123, 0.3);
          display: inline-flex;
          align-items: center;
        }

        .date-badge {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          color: #666;
          font-size: 0.8rem;
          margin-left: auto;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(5px);
          z-index: 999;
          animation: fadeIn 0.25s ease-out;
        }

        .dot-indicator {
          position: absolute;
          bottom: 6px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 4px;
        }

        /* Empty state styling */
        .empty-announcements {
          text-align: center;
          padding: 3rem 2rem;
        }

        .empty-icon {
          background: rgba(255, 255, 255, 0.1);
          width: 60px;
          height: 60px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
        }
      `}</style>

      {isExpanded && (
        <div className="modal-overlay" onClick={handleCloseExpand}></div>
      )}

      {isExpanded ? (
        <div className="expanded-banner">
          <div className="expanded-header">
            <div className="expanded-title">
              <Bell className="mr-2" size={20} /> Announcements
            </div>
            <button className="expanded-close" onClick={handleCloseExpand}>
              <X size={20} />
            </button>
          </div>
          
          <div className="announcements-list">
            {announcements.length > 0 ? (
              announcements.map((announcement, index) => (
                <div key={index} className="announcement-item">
                  <div className="announcement-content">
                    {announcement.content}
                  </div>
                  
                  <div className="announcement-meta">
                    {announcement.author && (
                      <div className="flex items-center">
                        {announcement.author === 'admin' ? (
                          <span className="admin-badge">
                            <User size={12} className="mr-1" /> Admin
                          </span>
                        ) : (
                          <span className="flex items-center text-gray-600">
                            <User size={14} className="mr-1" /> {announcement.author}
                          </span>
                        )}
                      </div>
                    )}
                    
                    {announcement.timestamp && (
                      <div className="date-badge">
                        <Calendar size={14} />
                        <span>{formatDate(announcement.timestamp)}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-announcements">
                <div className="empty-icon">
                  <Bell size={24} />
                </div>
                <p>No announcements to display</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="banner" onClick={handleExpand}>
          <div className="banner-content">
            <div className="icon-container">
              <Bell size={16} />
            </div>
            <div className="flex-1">
              <span className="announcement-text">
                {announcements[currentIndex].content}
              </span>
              
              <div className="flex mt-1 items-center">
                {announcements[currentIndex].author && (
                  <span className="text-xs font-medium text-pink-100">
                    {announcements[currentIndex].author === 'admin' ? (
                      <span className="admin-badge">
                        <User size={10} className="mr-1" /> Admin
                      </span>
                    ) : (
                      <>— {announcements[currentIndex].author}</>
                    )}
                  </span>
                )}
                {announcements.length > 1 && (
                  <div className="ml-auto flex items-center">
                    <span className="text-xs mr-2 opacity-70">{currentIndex + 1}/{announcements.length}</span>
                    {renderDots()}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center">
              <button className="banner-close ml-2" onClick={handleClose}>
                <X size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnnouncementBanner;