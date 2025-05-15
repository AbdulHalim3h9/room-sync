"use client";

import { useNavigate, useLocation } from "react-router-dom";
import {
  UsersRound,
  ShoppingBasket,
  Banknote,
  UserRoundPen,
  HandHelping,
  PhoneOutgoing,
  Pencil,
  Trash2,
  Home,
  LogOut,
  AlertCircle,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { db } from "@/firebase";
import { collection, getDocs, setDoc, doc, deleteDoc } from "firebase/firestore";
import LoginDialog from "./LoginDialog";
import Cookies from "js-cookie";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Announcements from "./Announcements";

export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [phoneNumbers, setPhoneNumbers] = useState([]);
  const [newPhone, setNewPhone] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCallDialogOpen, setIsCallDialogOpen] = useState(false);
  const [isAnnouncementDialogOpen, setIsAnnouncementDialogOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [activeMembers, setActiveMembers] = useState([]);

  const fetchPhoneNumbers = async () => {
    try {
      const phonesCollection = collection(db, "phones");
      const snapshot = await getDocs(phonesCollection);
      const phones = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setPhoneNumbers(phones);
    } catch (error) {
      console.error("Error fetching phone numbers:", error);
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
      console.error("Error fetching active members:", error);
    }
  };

  useEffect(() => {
    updateUserState();
    fetchPhoneNumbers();
    fetchActiveMembers();
  }, []);

  const { setOpen } = useSidebar();

  const handleNavigate = (path) => {
    navigate(path);
    setOpen(false); // Close the sidebar when navigating
  };

  const handleCallKhala = () => {
    if (phoneNumbers.length === 0) {
      alert("No phone numbers available. Please add one.");
    } else if (phoneNumbers.length === 1) {
      window.location.href = `tel:${phoneNumbers[0].number}`;
    } else {
      setIsCallDialogOpen(true);
    }
  };

  const handleCallNumber = (number) => {
    window.location.href = `tel:${number}`;
    setIsCallDialogOpen(false);
  };

  const handleAddPhone = async () => {
    if (!newPhone.trim()) return;
    try {
      const phoneDocRef = doc(db, "phones", newPhone);
      await setDoc(phoneDocRef, { number: newPhone });
      setPhoneNumbers([...phoneNumbers, { id: newPhone, number: newPhone }]);
      setNewPhone("");
      fetchPhoneNumbers();
    } catch (error) {
      console.error("Error adding phone number:", error);
    }
  };

  const handleDeletePhone = async (phoneId) => {
    try {
      await deleteDoc(doc(db, "phones", phoneId));
      setPhoneNumbers(phoneNumbers.filter((phone) => phone.id !== phoneId));
    } catch (error) {
      console.error("Error deleting phone number:", error);
    }
  };

  const isAdmin = user?.role === "Admin";
  const isManager = user?.role === "Manager";
  const isAuthenticated = isAdmin || isManager;
  const canMakeAnnouncement = isAdmin || activeMembers.some(member => 
    member.fullname === user?.name || member.shortname === user?.name
  );

  const menuItems = [
    {
      label: "Add Grocery Spendings",
      path: "/add-grocery-spendings",
      icon: <ShoppingBasket className="mr-2 h-6 w-6" />,
    },
    {
      label: "Add Meal Fund",
      path: "/add-meal-fund",
      icon: <HandHelping className="mr-2 h-6 w-6" />,
    },
    {
      label: "Set Payables",
      path: "/set-payables",
      icon: <Banknote className="mr-2 h-6 w-6" />,
    },
    {
      label: "Set Daily Meal Count",
      path: "/set-daily-meal-count",
      icon: <UserRoundPen className="mr-2 h-6 w-6" />,
    },
    {
      label: "Manage Members",
      path: "/members",
      icon: <UsersRound className="mr-2 h-6 w-6" />,
    },
    ...(isAdmin ? [{
      label: "Register Member",
      path: "/register-member",
      icon: <UsersRound className="mr-2 h-6 w-6" />,
    }] : []),
  ];

  return (
    <Sidebar className="h-screen w-64 border-r border-gray-200 bg-white">
      <SidebarContent className="flex flex-col h-full bg-white">
        {/* Brand Section */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center">
              <img src="https://i.postimg.cc/4yw0RRtp/room.png"></img>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">RoomSync</h1>
              {user && (
                <p className="text-sm text-gray-500">{user.role}</p>
              )}
            </div>
          </div>
        </div>

        <SidebarGroup className="flex-1">
          <SidebarGroupContent className="p-0">
            <SidebarMenu className="space-y-0">
              {/* Menu items for authenticated users */}
              {isAuthenticated && menuItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton asChild>
                    <button
                      onClick={() => handleNavigate(item.path)}
                      className={`flex items-center w-full px-4 py-6 rounded-lg transition-all duration-200 ${
                        location.pathname === item.path
                          ? "bg-blue-50 text-blue-600"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <div>
                        {item.icon}
                      </div>
                      <span className="ml-3 font-medium">{item.label}</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              {/* Make an Announcement - available to everyone */}
              <SidebarMenuItem key="announce">
                <SidebarMenuButton asChild>
                  <button
                    onClick={() => {
                      setIsAnnouncementDialogOpen(true);
                      setOpen(false); // Close the sidebar
                    }}
                    className={`flex items-center w-full px-4 py-6 rounded-lg transition-all duration-200 text-gray-700 hover:bg-gray-50`}
                  >
                    <div>
                      <AlertCircle className="mr-2 h-6 w-6" />
                    </div>
                    <span className="ml-3 font-medium">Make an Announcement</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Call Khala - available to everyone */}
              <SidebarMenuItem key="call-khala">
                <SidebarMenuButton asChild>
                  <div className="flex items-center justify-between w-full">
                    <button
                      onClick={() => {
                        handleCallKhala();
                        setOpen(false); // Close the sidebar
                      }}
                      className="flex items-center w-full px-2 py-6 rounded-lg transition-all duration-200 text-gray-700 hover:bg-gray-50"
                    >
                        <PhoneOutgoing className="mr-2 h-6 w-6" />
                      <span className="ml-5 font-medium">Call Khala</span>
                    </button>

                    {isAdmin && (
                      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="hover:bg-gray-100 rounded-full w-8 h-8 p-0">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md bg-white border-gray-200 shadow-xl rounded-2xl p-0 overflow-hidden mx-4 sm:mx-0">
                          <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 p-5 sm:p-6 text-white">
                            <DialogHeader className="items-start text-left space-y-2">
                              <div className="bg-indigo-500 rounded-full p-2 inline-flex mb-1 shadow-md">
                                <Pencil className="h-5 w-5 text-white" />
                              </div>
                              <DialogTitle className="text-xl font-bold text-white">Manage Phone Numbers</DialogTitle>
                              <DialogDescription className="text-indigo-100 text-sm">
                                Add, view, or remove phone numbers that can be used to call Khala.
                              </DialogDescription>
                            </DialogHeader>
                          </div>
                          
                          <div className="p-5 sm:p-6">
                            <div className="space-y-4">
                              <div className="flex flex-col sm:flex-row gap-2 sm:space-x-2">
                                <Input
                                  value={newPhone}
                                  onChange={(e) => setNewPhone(e.target.value)}
                                  placeholder="Enter phone number"
                                  className="flex-1 rounded-lg border-gray-200 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 text-sm h-10"
                                />
                                <Button 
                                  onClick={handleAddPhone}
                                  className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg h-10 px-4 transition-colors"
                                >
                                  Add Number
                                </Button>
                              </div>
                              
                              <div className="mt-4 border border-gray-100 rounded-xl overflow-hidden divide-y divide-gray-100 bg-white shadow-sm">
                                {phoneNumbers.length > 0 ? (
                                  phoneNumbers.map((phone, idx) => (
                                    <div key={phone.id} className="flex justify-between items-center p-3 hover:bg-gray-50 transition-colors">
                                      <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-medium text-indigo-600">
                                          {idx + 1}
                                        </div>
                                        <span className="text-gray-800 font-medium">{phone.number}</span>
                                      </div>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDeletePhone(phone.id)}
                                        className="text-red-500 hover:text-red-600 hover:bg-red-50 rounded-full w-8 h-8 p-0"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  ))
                                ) : (
                                  <div className="py-8 text-center text-gray-500">
                                    <p className="text-sm">No phone numbers added yet</p>
                                    <p className="text-xs text-gray-400 mt-1">Add a number using the form above</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}

                    <Dialog open={isCallDialogOpen} onOpenChange={setIsCallDialogOpen}>
                      <DialogContent className="max-w-sm bg-gradient-to-b from-blue-50 to-white border-blue-100 shadow-2xl rounded-2xl p-0 overflow-hidden mx-0 ">
                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-5 sm:p-6 text-white">
                          <DialogHeader className="items-center text-center space-y-2">
                            <div className="bg-blue-500 rounded-full p-2 sm:p-3 inline-flex mx-auto mb-2 shadow-lg">
                              <PhoneOutgoing className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                            </div>
                            <DialogTitle className="text-lg sm:text-xl font-bold text-white">Call Khala</DialogTitle>
                            <DialogDescription className="text-blue-100 max-w-xs mx-auto text-xs sm:text-sm">
                              Select which Number you would like to use for this call
                            </DialogDescription>
                          </DialogHeader>
                        </div>
                        
                        <div className="p-4 sm:p-6">
                          <div className="space-y-2 sm:space-y-3 max-h-[240px] overflow-y-auto pr-1">
                            {phoneNumbers.map((phone, idx) => (
                              <button
                                key={phone.id}
                                className="w-full flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl transition-all hover:bg-blue-50 border border-gray-100 hover:border-blue-200 hover:shadow-md group"
                                onClick={() => handleCallNumber(phone.number)}
                              >
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center shadow-sm group-hover:shadow transition-all">
                                  <span className="text-blue-700 font-semibold text-sm sm:text-base">SIM{idx + 1}</span>
                                </div>
                                <div className="flex-1 text-left">
                                  <p className="text-gray-900 font-medium text-base sm:text-lg truncate">{phone.number}</p>
                                  <p className="text-gray-500 text-xs sm:text-sm">SIM {idx + 1} • Tap to call</p>
                                </div>
                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <PhoneOutgoing className="h-4 w-4 sm:h-5 sm:w-5" />
                                </div>
                              </button>
                            ))}
                            
                            {phoneNumbers.length === 0 && (
                              <div className="text-center py-6 sm:py-8 px-4">
                                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                                  <PhoneOutgoing className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400" />
                                </div>
                                <p className="text-gray-500 font-medium text-sm sm:text-base">No phone numbers available</p>
                                <p className="text-gray-400 text-xs sm:text-sm mt-1">Please add a phone number first</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        {/* User Profile Section */}
        <div className="p-4 border-t border-gray-200">
          {user ? (
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarImage src={user.photoURL} />
                <AvatarFallback>{user.name?.[0] || 'U'}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => {
                Cookies.remove("userLogin");
                updateUserState();
              }}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <LoginDialog onAuthChange={updateUserState} />
          )}
        </div>
      </SidebarContent>
      
      {/* Announcements Dialog */}
      <Announcements 
        isOpen={isAnnouncementDialogOpen} 
        onClose={() => setIsAnnouncementDialogOpen(false)} 
      />
    </Sidebar>
  );
}

export default AppSidebar;  