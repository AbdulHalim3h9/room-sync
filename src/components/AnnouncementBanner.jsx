"use client";

import React, { useState, useEffect } from "react";
import { db } from "@/firebase";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { Bell, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Announcements from "./Announcements";

const AnnouncementBanner = () => {
  const [latestAnnouncement, setLatestAnnouncement] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isBlinking, setIsBlinking] = useState(true);

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

  if (!latestAnnouncement) return null;

  const truncateText = (text, maxLength = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <>
      <div 
        className={`mb-4 p-4 rounded-lg border cursor-pointer transition-all ${
          isBlinking 
            ? "bg-purple-50 border-purple-200" 
            : "bg-white border-gray-200"
        }`}
        onClick={() => setIsDialogOpen(true)}
      >
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-full ${isBlinking ? "bg-purple-100 text-purple-600" : "bg-gray-100 text-gray-600"}`}>
            <AlertCircle className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <h3 className="font-medium text-gray-900">Announcement from {latestAnnouncement.author}</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 px-2 text-xs text-purple-600 hover:text-purple-800 hover:bg-purple-50"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDialogOpen(true);
                }}
              >
                View All
              </Button>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {truncateText(latestAnnouncement.content)}
            </p>
          </div>
        </div>
      </div>
      
      <Announcements 
        isOpen={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)} 
      />
    </>
  );
};

export default AnnouncementBanner;
