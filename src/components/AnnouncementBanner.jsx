"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { db } from "@/firebase";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";

const AnnouncementBanner = () => {
  const [showBanner, setShowBanner] = useState(true);
  const [announcements, setAnnouncements] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleClose = () => {
    setShowBanner(false);
  };

  const handleExpand = () => {
    setIsExpanded(true);
  };

  const handleCloseExpand = () => {
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
          }, 3000);

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

  if (!showBanner) return null;

  if (isLoading) {
    return (
      <div className="relative w-full px-4">
        <style>
          {`
            .banner {
              background: linear-gradient(135deg, #ff6b6b, #ff8e8e);
              color: white;
              padding: 1rem 1.5rem;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 4px 15px rgba(255, 107, 107, 0.2);
              border-radius: 8px;
              margin: 1rem auto;
              max-width: 1200px;
            }
          `}
        </style>
        <div className="banner">
          <div className="flex items-center gap-3">
            <span className="text-xl">📢</span>
            <span className="text-base">Loading announcements...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative w-full px-4">
        <style>
          {`
            .banner {
              background: linear-gradient(135deg, #ff6b6b, #ff8e8e);
              color: white;
              padding: 1rem 1.5rem;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 4px 15px rgba(255, 107, 107, 0.2);
              border-radius: 8px;
              margin: 1rem auto;
              max-width: 1200px;
            }
          `}
        </style>
        <div className="banner">
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
        <style>
          {`
            .banner {
              background: linear-gradient(135deg, #ff6b6b, #ff8e8e);
              color: white;
              padding: 1rem 1.5rem;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 4px 15px rgba(255, 107, 107, 0.2);
              border-radius: 8px;
              margin: 1rem auto;
              max-width: 1200px;
            }
          `}
        </style>
        <div className="banner">
          <span className="text-base">No announcements available</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full px-4">
      <style>
        {`
          .banner {
            background: linear-gradient(135deg, #ff6b6b, #ff8e8e);
            color: white;
            padding: 0.75rem 1rem;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 1rem;
            border-radius: 8px;
            margin: 0.5rem;
            max-width: 92vw;
            width: 100%;
            cursor: pointer;
            position: relative;
            transition: transform 0.3s ease;
            max-height: 3.5rem;
            overflow: hidden;
          }

          .banner:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(255, 107, 107, 0.3);
          }

          .banner-content {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            flex: 1;
          }

          .announcement-text {
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
            text-overflow: ellipsis;
            line-height: 1.2;
            margin: 0 0.5rem;
          }

          .banner-close {
            cursor: pointer;
            padding: 0.5rem;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.1);
            transition: background 0.2s;
          }

          .banner-close:hover {
            background: rgba(255, 255, 255, 0.2);
          }

          .announcement-text {
            font-weight: 500;
            font-size: 1rem;
            line-height: 1.5;
          }

          .expanded-banner {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 90%;
            max-width: 800px;
            background: linear-gradient(135deg, #ff6b6b, #ff8e8e);
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            padding: 2rem;
            z-index: 1000;
            color: white;
          }

          .expanded-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
            padding-bottom: 1rem;
            border-bottom: 1px solid rgba(255, 255, 255, 0.2);
          }

          .expanded-close {
            cursor: pointer;
            padding: 0.5rem;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.1);
            transition: background 0.2s;
          }

          .expanded-close:hover {
            background: rgba(255, 255, 255, 0.2);
          }

          .announcements-list {
            max-height: 400px;
            overflow-y: auto;
            padding: 0.5rem;
          }

          .announcement-item {
            padding: 1rem;
            margin-bottom: 0.5rem;
            border-radius: 8px;
            background: rgba(255, 255, 255, 0.05);
            transition: transform 0.2s;
          }

          .announcement-item:hover {
            transform: translateX(3px);
            background: rgba(255, 255, 255, 0.1);
          }

          .announcement-item:last-child {
            margin-bottom: 0;
          }
        `}
      </style>

      {isExpanded ? (
        <div className="expanded-banner">
          <div className="expanded-header">
            <h3 className="text-lg font-semibold">Announcements</h3>
            <button className="expanded-close" onClick={handleCloseExpand}>
              <X size={20} />
            </button>
          </div>
          <div className="announcements-list">
            {announcements.map((announcement, index) => (
              <div key={index} className="announcement-item">
                <div className="flex items-center gap-2">
                  <span className="text-lg">📢</span>
                  <span className="text-sm font-medium">{announcement.content}</span>
                  {announcement.author && announcement.author === 'admin' && (
                    <span className="text-xs font-semibold text-pink-300">(Admin)</span>
                  )}
                </div>
                {announcement.author && announcement.author !== 'admin' && (
                  <span className="text-xs text-pink-300 ml-7">— {announcement.author}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="banner" onClick={handleExpand}>
          <div className="banner-content">
            <span className="text-lg">📢</span>
            <span className="announcement-text">
              {announcements[currentIndex].content}
              {announcements[currentIndex].author && announcements[currentIndex].author === 'admin' && (
                <span className="text-xs font-semibold text-pink-300 ml-2">(Admin)</span>
              )}
            </span>
          </div>
          <button className="banner-close" onClick={handleClose}>
            <X size={20} />
          </button>
        </div>
      )}
    </div>
  );
};

export default AnnouncementBanner;