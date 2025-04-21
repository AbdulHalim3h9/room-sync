"use client";

import React, { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { db } from "@/firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp, query, orderBy } from "firebase/firestore";
import { Trash2, AlertCircle } from "lucide-react";
import Cookies from "js-cookie";
import { format } from "date-fns";

const Announcements = ({ isOpen, onClose }) => {
  const [announcements, setAnnouncements] = useState([]);
  const [newAnnouncement, setNewAnnouncement] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState(null);
  const [activeMembers, setActiveMembers] = useState([]);

  useEffect(() => {
    const loginData = Cookies.get("userLogin");
    setUser(loginData ? JSON.parse(loginData) : null);
    fetchAnnouncements();
    fetchActiveMembers();
  }, []);

  const fetchActiveMembers = async () => {
    try {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const currentMonth = `${year}-${month}`;

      const membersRef = collection(db, "members");
      const querySnapshot = await getDocs(membersRef);
      
      const members = querySnapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((member) => {
          if (!member.activeFrom) return false;
          const activeFromDate = new Date(member.activeFrom + "-01");
          const currentMonthDate = new Date(currentMonth + "-01");
          
          if (activeFromDate > currentMonthDate) return false;
          
          if (member.archiveFrom) {
            const archiveFromDate = new Date(member.archiveFrom + "-01");
            return currentMonthDate < archiveFromDate;
          }
          
          return true;
        });
      
      setActiveMembers(members);
    } catch (error) {
      console.error("Error fetching active members:", error);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const q = query(collection(db, "announcements"), orderBy("timestamp", "desc"));
      const querySnapshot = await getDocs(q);
      const announcementsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAnnouncements(announcementsData);
    } catch (error) {
      console.error("Error fetching announcements:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newAnnouncement.trim()) return;
    
    setIsSubmitting(true);
    try {
      const announcementData = {
        content: newAnnouncement,
        author: user?.name || "Anonymous",
        timestamp: serverTimestamp(),
        isAdminAnnouncement: user?.role === "Admin"
      };
      
      await addDoc(collection(db, "announcements"), announcementData);
      setNewAnnouncement("");
      fetchAnnouncements();
    } catch (error) {
      console.error("Error adding announcement:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "announcements", id));
      setAnnouncements(announcements.filter((announcement) => announcement.id !== id));
    } catch (error) {
      console.error("Error deleting announcement:", error);
    }
  };

  const isAdmin = user?.role === "Admin";
  const canMakeAnnouncement = isAdmin || activeMembers.some(member => 
    member.fullname === user?.name || member.shortname === user?.name
  );

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "Just now";
    
    const date = timestamp.toDate();
    return format(date, "MMM d, yyyy 'at' h:mm a");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] sm:max-w-md">
        <style>
          {`
            .dialog-content {
              max-height: 50vh;
              @media (max-width: 640px) {
                max-height: 33vh;
              }
            }

            .announcement-card {
              padding: 0.75rem;
              margin-bottom: 0.5rem;
            }

            .announcement-text {
              margin-top: 0.5rem;
            }
          `}
        </style>
        <DialogHeader className="pb-2">
          <DialogTitle className="text-lg sm:text-xl font-semibold">Announcements</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Important messages for all members
          </DialogDescription>
        </DialogHeader>
        
        <div className="dialog-content max-h-[40vh] sm:max-h-[50vh] overflow-y-auto py-2 px-1 border-t border-b border-gray-200">
          {announcements.length === 0 ? (
            <div className="text-center py-4">
              <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No announcements yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {announcements.map((announcement) => (
                <div 
                  key={announcement.id} 
                  className={`announcement-card rounded-lg border ${announcement.isAdminAnnouncement 
                    ? "bg-purple-50 border-purple-300" 
                    : "bg-gray-50 border-gray-100"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1">
                        <p className="text-xs sm:text-sm font-medium text-gray-700">{announcement.author}</p>
                        {announcement.isAdminAnnouncement && (
                          <span className="px-1.5 py-0.5 text-[10px] sm:text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                            Admin
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5">
                        {formatTimestamp(announcement.timestamp)}
                      </p>
                    </div>
                    {isAdmin && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDelete(announcement.id)}
                        className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                  <p className={`announcement-text text-sm sm:text-base whitespace-pre-wrap ${announcement.isAdminAnnouncement 
                    ? "text-purple-900 font-medium" 
                    : "text-gray-800"
                  }`}>{announcement.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {canMakeAnnouncement && (
          <form onSubmit={handleSubmit} className="mt-3">
            <Textarea
              value={newAnnouncement}
              onChange={(e) => setNewAnnouncement(e.target.value)}
              placeholder="Write your announcement here..."
              className="min-h-[80px] sm:min-h-[100px] resize-none text-sm"
              required
            />
            <DialogFooter className="mt-3">
              <Button 
                type="submit" 
                disabled={isSubmitting || !newAnnouncement.trim()}
                className={`w-full text-sm ${isAdmin ? "bg-purple-600 hover:bg-purple-700" : ""}`}
              >
                {isSubmitting ? "Posting..." : isAdmin ? "Post Admin Announcement" : "Post Announcement"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default Announcements;