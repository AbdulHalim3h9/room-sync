"use client";

import React, { useState, useEffect, useRef } from "react";
import { db } from "@/firebase";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { Bell, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Announcements from "./Announcements";

const AnnouncementBanner = () => {
  // CSS for animations
  const animationStyles = `
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-5px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeOut {
      from { opacity: 1; transform: translateY(0); }
      to { opacity: 0; transform: translateY(5px); }
    }
    @keyframes bounce {
      0% { transform: translateY(0) translateX(-50%); }
      100% { transform: translateY(-5px) translateX(-50%); }
    }
    @keyframes pulse {
      0% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.7); }
      70% { box-shadow: 0 0 0 10px rgba(220, 38, 38, 0); }
      100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0); }
    }
    .fadeIn { animation: fadeIn 0.5s forwards; }
    .fadeOut { animation: fadeOut 0.5s forwards; }
    .pulse { animation: pulse 2s infinite; }
  `;

  const [announcements, setAnnouncements] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isWidgetOpen, setIsWidgetOpen] = useState(false);
  const [currentAnnouncementIndex, setCurrentAnnouncementIndex] = useState(0);
  const [messageAnimation, setMessageAnimation] = useState('none');
  const [unreadCount, setUnreadCount] = useState(0);
  const widgetRef = useRef(null);

  useEffect(() => {
    fetchAnnouncements();
    
    // Close widget when clicking outside
    const handleClickOutside = (event) => {
      if (widgetRef.current && !widgetRef.current.contains(event.target)) {
        setIsWidgetOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Rotate through announcements every 3 seconds with animation
  useEffect(() => {
    if (announcements.length <= 1) return;
    
    const rotationInterval = setInterval(() => {
      // First fade out
      setMessageAnimation('fadeOut');
      
      // Change message after fade out
      setTimeout(() => {
        setCurrentAnnouncementIndex((prevIndex) => 
          prevIndex === announcements.length - 1 ? 0 : prevIndex + 1
        );
        // Then fade in
        setMessageAnimation('fadeIn');
      }, 500);
      
      // Reset animation state after fade in
      setTimeout(() => {
        setMessageAnimation('none');
      }, 1000);
      
    }, 3000);
    
    return () => clearInterval(rotationInterval);
  }, [announcements]);

  const fetchAnnouncements = async () => {
    try {
      const q = query(
        collection(db, "announcements"), 
        orderBy("timestamp", "desc"), 
        limit(5)
      );
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const fetchedAnnouncements = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setAnnouncements(fetchedAnnouncements);
        setUnreadCount(fetchedAnnouncements.length);
      }
    } catch (error) {
      console.error("Error fetching announcements:", error);
    }
  };

  const truncateText = (text, maxLength = 60) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const handleWidgetToggle = () => {
    setIsWidgetOpen(!isWidgetOpen);
    if (!isWidgetOpen) {
      setUnreadCount(0); // Mark as read when opening
    }
  };

  const handleViewAll = () => {
    setIsDialogOpen(true);
    setIsWidgetOpen(false);
  };

  const handleDismiss = (e) => {
    e.stopPropagation();
    setUnreadCount(0);
    setAnnouncements([]);
  };

  if (!announcements.length) return null;
  
  const currentAnnouncement = announcements[currentAnnouncementIndex];
  const isAdminAnnouncement = currentAnnouncement?.isAdminAnnouncement;

  return (
    <>
      <style>{animationStyles}</style>
      <div className="fixed top-4 right-4 z-50" ref={widgetRef}>
        {/* Bell Icon with Badge */}
        <div className="relative">
          <Button
            onClick={handleWidgetToggle}
            className="h-10 w-10 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg flex items-center justify-center pulse"
          >
            <Bell className="h-5 w-5" />
          </Button>
          
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 bg-yellow-500 text-white border-2 border-white h-6 min-w-6 flex items-center justify-center p-0 text-xs rounded-full"
            >
              {unreadCount}
            </Badge>
          )}
        </div>
        
        {/* Message Popup */}
        {isWidgetOpen && (
          <div className="absolute top-16 right-0 w-80 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden animate-in fade-in-50 slide-in-from-top-5 duration-300">
            <div className="flex items-center justify-between p-3 bg-red-600 text-white">
              <h3 className="font-medium">Announcements</h3>
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 w-7 p-0 rounded-full text-white hover:bg-red-700"
                  onClick={() => setIsWidgetOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {/* Current Announcement */}
              <div className="p-4 border-b">
                <div className="flex gap-3">
                  <div className={`h-9 w-9 rounded-full flex items-center justify-center ${isAdminAnnouncement ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-800"}`}>
                    {currentAnnouncement?.author?.charAt(0).toUpperCase() || "A"}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium">{currentAnnouncement?.author || "Anonymous"}</p>
                      {isAdminAnnouncement && (
                        <span className="px-1.5 py-0.5 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                          Admin
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 mb-1">
                      {currentAnnouncement?.content}
                    </p>
                    <p className="text-xs text-gray-500">
                      {currentAnnouncement?.timestamp?.toDate ? 
                        new Date(currentAnnouncement.timestamp.toDate()).toLocaleString() : 
                        "Recently"}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Pagination Dots */}
              {announcements.length > 1 && (
                <div className="flex justify-center gap-1 p-2">
                  {announcements.map((_, index) => (
                    <div 
                      key={index} 
                      className={`h-2 w-2 rounded-full ${index === currentAnnouncementIndex ? "bg-red-600" : "bg-gray-300"}`}
                      onClick={() => setCurrentAnnouncementIndex(index)}
                    ></div>
                  ))}
                </div>
              )}
              
              {/* View All Button */}
              <div className="p-3 bg-gray-50 border-t">
                <div className="flex justify-between gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                    onClick={handleViewAll}
                  >
                    View All
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 text-gray-600 border-gray-200 hover:bg-gray-50"
                    onClick={() => {
                      setUnreadCount(0);
                      setAnnouncements([]);
                      setIsWidgetOpen(false);
                    }}
                  >
                    Dismiss All
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Compact floating message preview when widget is closed */}
        {!isWidgetOpen && announcements.length > 0 && (
          <div 
            className="fixed top-4 left-1/2 transform -translate-x-1/2 max-w-xs bg-gradient-to-r from-red-500 to-orange-500 rounded-full shadow-lg border border-red-300 py-1.5 px-3 cursor-pointer flex items-center justify-between"
            onClick={handleWidgetToggle}
            style={{ animation: 'bounce 1s infinite alternate' }}
          >
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="h-6 w-6 rounded-full flex items-center justify-center bg-white text-red-800 flex-shrink-0 border border-red-200">
                {currentAnnouncement?.author?.charAt(0).toUpperCase() || "A"}
              </div>
              <p className={`text-sm text-white font-medium truncate ${messageAnimation === 'fadeIn' ? 'fadeIn' : messageAnimation === 'fadeOut' ? 'fadeOut' : ''}`}>
                {truncateText(currentAnnouncement?.content)}
              </p>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 w-6 p-0 rounded-full text-white hover:bg-red-600/50 ml-2 flex-shrink-0"
              onClick={handleDismiss}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}
        
        <Announcements 
          isOpen={isDialogOpen} 
          onClose={() => setIsDialogOpen(false)} 
        />
      </div>
    </>
  );
};

export default AnnouncementBanner;
