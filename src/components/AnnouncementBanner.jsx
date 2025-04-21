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
        console.log("Fetching announcements from Firebase...");
        const q = query(
          collection(db, "announcements"),
          orderBy("timestamp", "desc"),
          limit(5)
        );
        
        const querySnapshot = await getDocs(q);
        console.log("Query snapshot size:", querySnapshot.size);
        
        if (querySnapshot.empty) {
          setError("No announcements found in Firebase");
          setIsLoading(false);
          return;
        }

        const announcementsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        console.log("Fetched announcements:", announcementsData);
        
        // Set announcements and reset index
        setAnnouncements(announcementsData);
        setCurrentIndex(0);
        setIsLoading(false);
        
        // Start announcement rotation if there are announcements
        if (announcementsData.length > 1) {
          const rotationInterval = setInterval(() => {
            setCurrentIndex((prev) => {
              const nextIndex = (prev + 1) % announcementsData.length;
              return nextIndex;
            });
          }, 3000); // Change every 3 seconds

          return () => clearInterval(rotationInterval);
        }
      } catch (error) {
        console.error("Error fetching announcements:", error);
        setError(error.message);
        setIsLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  // Reset index when announcements change
  useEffect(() => {
    if (announcements.length > 0) {
      setCurrentIndex(0);
    }
  }, [announcements]);
  if (!showBanner) return null;

  if (isLoading) {
    return (
      <div className="relative w-full">
        <style>
          {`
            .banner {
              background: linear-gradient(135deg, #ff6b6b, #ff8e8e);
              color: white;
              padding: 1rem;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 4px 15px rgba(255, 107, 107, 0.2);
              animation: pulse 2s infinite;
              border-radius: 8px;
              margin-bottom: 1rem;
            }

            @keyframes pulse {
              0% { transform: scale(1); }
              50% { transform: scale(1.02); }
              100% { transform: scale(1); }
            }
          `}
        </style>
        <div className="banner">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📢</span>
            <span>Loading announcements...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative w-full">
        <style>
          {`
            .banner {
              background: linear-gradient(135deg, #ff6b6b, #ff8e8e);
              color: white;
              padding: 1rem;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 4px 15px rgba(255, 107, 107, 0.2);
              animation: pulse 2s infinite;
              border-radius: 8px;
              margin-bottom: 1rem;
            }

            @keyframes pulse {
              0% { transform: scale(1); }
              50% { transform: scale(1.02); }
              100% { transform: scale(1); }
            }
          `}
        </style>
        <div className="banner">
          <div className="flex items-center gap-2">
            <span className="text-2xl">❌</span>
            <span>Error: {error}</span>
          </div>
        </div>
      </div>
    );
  }

  if (announcements.length === 0) {
    return (
      <div className="relative w-full">
        <style>
          {`
            .banner {
              background: linear-gradient(135deg, #ff6b6b, #ff8e8e);
              color: white;
              padding: 1rem;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 4px 15px rgba(255, 107, 107, 0.2);
              animation: pulse 2s infinite;
              border-radius: 8px;
              margin-bottom: 1rem;
            }

            @keyframes pulse {
              0% { transform: scale(1); }
              50% { transform: scale(1.02); }
              100% { transform: scale(1); }
            }
          `}
        </style>
        <div className="banner">
          <div>
            <span>No announcements available</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      <style>
        {`
          .banner {
            background: linear-gradient(135deg, #ff6b6b, #ff8e8e);
            color: white;
            padding: 1.25rem;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 1.25rem;
            border-radius: 12px;
            margin-bottom: 1.5rem;
            cursor: pointer;
            position: relative;
            overflow: hidden;
            border: 2px solid transparent;
            transition: all 0.3s ease;
          }

          .banner::before {
            content: '';
            position: absolute;
            width: 4px;
            height: 4px;
            background: radial-gradient(circle, white 0%, rgba(255, 255, 255, 0) 70%);
            border-radius: 50%;
            box-shadow: 
              0 0 10px rgba(255, 255, 255, 0.8),
              0 0 20px rgba(255, 255, 255, 0.6),
              0 0 30px rgba(255, 255, 255, 0.4);
            animation: shoot 2s linear infinite;
          }

          .banner::after {
            content: '';
            position: absolute;
            width: 1px;
            height: 100px;
            background: linear-gradient(to bottom, rgba(255, 255, 255, 0.8), transparent);
            transform: rotate(45deg);
            animation: trail 2s linear infinite;
          }

          @keyframes shoot {
            0% {
              top: 0;
              left: 0;
              transform: translate(0, 0);
            }
            25% {
              top: 0;
              left: calc(100% - 4px);
              transform: translate(0, 0);
            }
            50% {
              top: calc(100% - 4px);
              left: calc(100% - 4px);
              transform: translate(0, 0);
            }
            75% {
              top: calc(100% - 4px);
              left: 0;
              transform: translate(0, 0);
            }
            100% {
              top: 0;
              left: 0;
              transform: translate(0, 0);
            }
          }

          @keyframes trail {
            0% {
              top: 0;
              left: 0;
              opacity: 0;
            }
            25% {
              top: 0;
              left: calc(100% - 4px);
              opacity: 1;
            }
            50% {
              top: calc(100% - 4px);
              left: calc(100% - 4px);
              opacity: 0;
            }
            75% {
              top: calc(100% - 4px);
              left: 0;
              opacity: 1;
            }
            100% {
              top: 0;
              left: 0;
              opacity: 0;
            }
          }

          .banner:hover::before {
            animation-duration: 1.5s;
            box-shadow: 
              0 0 15px rgba(255, 255, 255, 0.9),
              0 0 25px rgba(255, 255, 255, 0.7),
              0 0 35px rgba(255, 255, 255, 0.5);
          }

          .banner:hover::after {
            animation-duration: 1.5s;
            height: 150px;
          }

          .banner:hover {
            transform: translateY(-2px);
            border-color: rgba(255, 255, 255, 0.2);
          }

          .banner:hover::before {
            animation-duration: 1.5s;
            box-shadow: 0 0 20px rgba(255, 255, 255, 0.7);
          }

          .banner:hover {
            transform: translateY(-2px);
          }

          .banner:hover::before {
            animation-duration: 2s;
          }

          .banner-content {
            display: flex;
            align-items: center;
            gap: 1rem;
            flex: 1;
          }

          .banner-close {
            cursor: pointer;
            padding: 0.5rem;
            transition: color 0.2s;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.1);
          }

          .banner-close:hover {
            color: rgba(255, 255, 255, 0.8);
            background: rgba(255, 255, 255, 0.2);
          }

          .announcement-text {
            font-weight: 500;
            font-size: 1.1rem;
            animation: fadeIn 0.5s ease-in;
            line-height: 1.4;
          }

          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(5px); }
            to { opacity: 1; transform: translateY(0); }
          }

          .expanded-banner {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 95%;
            max-width: 800px;
            background: linear-gradient(135deg, #ff6b6b, #ff8e8e);
            border-radius: 16px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            padding: 2.5rem;
            z-index: 50;
            color: white;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
          }

          .expanded-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
            border-bottom: 1px solid rgba(255, 255, 255, 0.2);
            padding-bottom: 1.5rem;
          }

          .expanded-close {
            cursor: pointer;
            padding: 0.75rem;
            transition: color 0.2s;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.1);
          }

          .expanded-close:hover {
            color: white;
            background: rgba(255, 255, 255, 0.2);
          }

          .announcements-list {
            max-height: 500px;
            overflow-y: auto;
            padding: 1rem;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 12px;
          }

          .announcement-item {
            padding: 1.5rem;
            border-bottom: 1px solid rgba(255, 255, 255, 0.2);
            transition: all 0.3s ease;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 8px;
          }

          .announcement-item:hover {
            background-color: rgba(255, 255, 255, 0.1);
            transform: translateX(5px);
          }

          .announcement-item:last-child {
            border-bottom: none;
          }

          .announcement-item .text-xl {
            font-size: 1.25rem;
          }

          .announcement-item .font-medium {
            font-size: 1.1rem;
            font-weight: 600;
          }

          .announcement-item .text-sm {
            font-size: 0.9rem;
          }
        `}
      </style>
      
      {isExpanded ? (
        <div className="expanded-banner">
          <div className="expanded-header">
            <h3 className="text-xl font-semibold">Announcements</h3>
            <button className="expanded-close" onClick={handleCloseExpand}>
              <X size={20} />
            </button>
          </div>
          <div className="announcements-list">
            {announcements.map((announcement, index) => (
              <div key={index} className="announcement-item">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">📢</span>
                    <span className="font-medium">{announcement.content}</span>
                    {announcement.author && announcement.author === 'admin' && (
                      <span className="text-sm font-semibold text-pink-300">(Admin)</span>
                    )}
                  </div>
                  {announcement.author && announcement.author !== 'admin' && (
                    <span className="text-sm text-pink-300">- {announcement.author}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div 
          className="banner" 
          onClick={handleExpand}
        >
          <div className="banner-content">
            <div>
              <div className="flex items-center gap-2">
              <span className="text-xl">📢</span>
              <span className="font-medium">{announcements[currentIndex].content}</span>
              {announcements[currentIndex].author && announcements[currentIndex].author === 'admin' && (
                <span className="text-sm font-semibold text-pink-300">(Admin)</span>
              )}
            </div>
            </div>
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