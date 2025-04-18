"use client";

import React, { useState, useEffect } from "react";
import { db } from "@/firebase";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { Bell, AlertCircle, X, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import Announcements from "./Announcements";

const AnnouncementBanner = () => {
  const [latestAnnouncement, setLatestAnnouncement] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isBlinking, setIsBlinking] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    fetchLatestAnnouncement();
    
    // Set up blinking effect
    const blinkInterval = setInterval(() => {
      setIsBlinking(prev => !prev);
    }, 1000);
    
    return () => clearInterval(blinkInterval);
  }, []);

  const fetchLatestAnnouncement = async () => {
    try {
      const q = query(
        collection(db, "announcements"), 
        orderBy("timestamp", "desc"), 
        limit(1)
      );
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        setLatestAnnouncement({
          id: doc.id,
          ...doc.data()
        });
      }
    } catch (error) {
      console.error("Error fetching latest announcement:", error);
    }
  };

  if (!latestAnnouncement || isDismissed) return null;

  const truncateText = (text, maxLength = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  // Determine if this is an admin announcement for styling
  const isAdminAnnouncement = latestAnnouncement.isAdminAnnouncement;
  
  // Use more intense blinking and colors for admin announcements
  const bgColor = isBlinking 
    ? (isAdminAnnouncement ? "bg-purple-100 border-purple-400" : "bg-purple-50 border-purple-200")
    : (isAdminAnnouncement ? "bg-white border-purple-400" : "bg-white border-gray-200");
  
  const iconBgColor = isBlinking 
    ? (isAdminAnnouncement ? "bg-purple-200 text-purple-800" : "bg-purple-100 text-purple-600")
    : (isAdminAnnouncement ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-600");
  
  return (
    <>
      <div className={`mb-4 rounded-lg border transition-all ${bgColor}`}>
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center gap-2 flex-1">
            <div className={`p-1.5 rounded-full ${iconBgColor}`}>
              <AlertCircle className="h-4 w-4" />
            </div>
            
            <p className={`text-sm ${isAdminAnnouncement ? "text-purple-800 font-medium" : "text-gray-600"} flex-1 cursor-pointer`}
               onClick={() => setIsExpanded(!isExpanded)}
            >
              {truncateText(latestAnnouncement.content, isExpanded ? 1000 : 100)}
            </p>
          </div>
          
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 w-7 p-0 rounded-full"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 w-7 p-0 rounded-full text-gray-500 hover:text-gray-700"
              onClick={() => setIsDismissed(true)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {isExpanded && (
          <div className="px-4 pb-3 pt-0 animate-in fade-in-50 duration-300">
            <div className="flex items-center justify-between border-t pt-2 mt-1">
              <div className="flex items-center gap-2">
                {isAdminAnnouncement && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-800 rounded-full animate-pulse">
                    Admin
                  </span>
                )}
                <span className="text-xs text-gray-500">From: {latestAnnouncement.author}</span>
              </div>
              
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 px-2 text-xs text-purple-600 hover:text-purple-800 hover:bg-purple-50"
                onClick={() => setIsDialogOpen(true)}
              >
                View All
              </Button>
            </div>
          </div>
        )}
      </div>
      
      <Announcements 
        isOpen={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)} 
      />
    </>
  );
};

export default AnnouncementBanner;
