"use client";

import { useNavigate, useLocation } from "react-router-dom";
import * as Sidebar from "@/components/ui/sidebar";
import { useState, useEffect } from "react";
import { AlertCircle } from "lucide-react";
import Cookies from "js-cookie";
import { db } from "@/firebase";
import { collection, getDocs } from "firebase/firestore";
import CallKhalaDialog from "./AppSidebar/CallKhalaDialog.jsx";
import MenuItems from "./AppSidebar/MenuItems.jsx";
import PhoneNumberManager from "./AppSidebar/PhoneNumberManager.jsx";
import UserProfile from "./AppSidebar/UserProfile.jsx";
import { FundIndicator } from "./AppSidebar/FundIndicator";
import Announcements from "./Announcements";

export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [phoneNumbers, setPhoneNumbers] = useState([]);
  const [user, setUser] = useState(null);
  const [activeMembers, setActiveMembers] = useState([]);
  const [isAnnouncementDialogOpen, setIsAnnouncementDialogOpen] = useState(false);
  const [open, setOpen] = useState(false);

  const fetchPhoneNumbers = async () => {
    try {
      const phonesCollection = collection(db, "phones");
      const snapshot = await getDocs(phonesCollection);
      const phones = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setPhoneNumbers(phones);
    } catch (error) {
      // Error handling is delegated to PhoneNumberManager
    }
  };

  const updateUserState = () => {
    const loginData = Cookies.get("userLogin");
    setUser(loginData ? JSON.parse(loginData) : null);
  };

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
      // Error handling is minimal as this is non-critical
    }
  };

  useEffect(() => {
    updateUserState();
    fetchPhoneNumbers();
    fetchActiveMembers();
  }, []);

  const handleNavigate = (path) => {
    navigate(path);
    setOpen(false);
  };

  const isAdmin = user?.role === "Admin";
  const isManager = user?.role === "Manager";
  const isAuthenticated = isAdmin || isManager;
  const canMakeAnnouncement = isAdmin || activeMembers.some(member => 
    member.fullname === user?.name || member.shortname === user?.name
  );

  return (
    <Sidebar.Sidebar className="fixed h-screen w-64 border-r border-gray-200 bg-white flex flex-col">
      <div className="p-4 border-b border-gray-200 flex-shrink-0 bg-white">
        <div className="flex items-center space-x-3">
          <img 
            src="https://i.postimg.cc/4yw0RRtp/room.png" 
            alt="RoomSync Logo" 
            className="w-8 h-8" 
          />
          <div className="min-w-0">
            <h1 className="text-lg font-bold text-gray-900">RoomSync</h1>
            {user && (
              <p className="text-xs font-medium text-gray-500">
                {user.role}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden bg-white">
        <Sidebar.SidebarContent className="flex-1 overflow-y-auto bg-white">
          <Sidebar.SidebarGroup className="h-full bg-white">
            <Sidebar.SidebarGroupContent className="p-0 bg-white">
              <MenuItems
                isAuthenticated={isAuthenticated}
                isAdmin={isAdmin}
                location={location}
                handleNavigate={handleNavigate}
              />
              <PhoneNumberManager
                phoneNumbers={phoneNumbers}
                setPhoneNumbers={setPhoneNumbers}
                fetchPhoneNumbers={fetchPhoneNumbers}
                isAdmin={isAdmin}
              />
              <Sidebar.SidebarMenuItem>
                <Sidebar.SidebarMenuButton asChild>
                  <button
                    onClick={() => {
                      setIsAnnouncementDialogOpen(true);
                      setOpen(false);
                    }}
                    className="flex items-center w-full px-4 py-6 rounded-lg transition-all duration-200 text-gray-700 hover:bg-gray-50 bg-white"
                  >
                    <AlertCircle className="mr-2 h-6 w-6" />
                    <span className="ml-3 font-medium">Make an Announcement</span>
                  </button>
                </Sidebar.SidebarMenuButton>
              </Sidebar.SidebarMenuItem>
              <div className="bg-white">
                <FundIndicator />
              </div>
              
              {/* User Profile and Logout */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <UserProfile user={user} updateUserState={updateUserState} />
              </div>
            </Sidebar.SidebarGroupContent>
          </Sidebar.SidebarGroup>
        </Sidebar.SidebarContent>
      </div>

      <Announcements 
        isOpen={isAnnouncementDialogOpen} 
        onClose={() => setIsAnnouncementDialogOpen(false)} 
      />
    </Sidebar.Sidebar>
  );
}

export default AppSidebar;