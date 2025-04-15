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

export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [phoneNumbers, setPhoneNumbers] = useState([]);
  const [newPhone, setNewPhone] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCallDialogOpen, setIsCallDialogOpen] = useState(false);
  const [user, setUser] = useState(null);

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

  useEffect(() => {
    updateUserState();
    fetchPhoneNumbers();
  }, []);

  const handleNavigate = (path) => {
    navigate(path);
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

  const menuItems = [
    {
      label: "Add Grocery Spendings",
      path: "/add-grocery-spendings",
      icon: <ShoppingBasket className="mr-2 h-4 w-4" />,
    },
    {
      label: "Add Meal Fund",
      path: "/add-meal-fund",
      icon: <HandHelping className="mr-2 h-4 w-4" />,
    },
    {
      label: "Set Payables",
      path: "/set-payables",
      icon: <Banknote className="mr-2 h-4 w-4" />,
    },
    {
      label: "Set Daily Meal Count",
      path: "/set-daily-meal-count",
      icon: <UserRoundPen className="mr-2 h-4 w-4" />,
    },
    {
      label: "Manage Members",
      path: "/members",
      icon: <UsersRound className="mr-2 h-4 w-4" />,
    },
    ...(isAdmin ? [{
      label: "Register Member",
      path: "/register-member",
      icon: <UsersRound className="mr-2 h-4 w-4" />,
    }] : []),
  ];

  return (
    <Sidebar className="fixed z-[999] w-68 bg-white border-r border-gray-200 shadow-sm [&>div]:bg-white">
      <SidebarContent className="flex flex-col h-full bg-white">
        {/* Brand Section */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center">
              <img src="./room.png"></img>
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
              {isAuthenticated && menuItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton asChild>
                    <button
                      onClick={() => handleNavigate(item.path)}
                      className={`flex items-center w-full px-4 py-3 rounded-lg transition-all duration-200 ${
                        location.pathname === item.path
                          ? "bg-blue-50 text-blue-600"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <div className={`p-2 rounded-md ${
                        location.pathname === item.path
                          ? "bg-blue-100"
                          : "bg-gray-100"
                      }`}>
                        {item.icon}
                      </div>
                      <span className="ml-3 font-medium">{item.label}</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              <SidebarMenuItem key="call-khala">
                <SidebarMenuButton asChild>
                  <div className="flex items-center justify-between w-full">
                    <button
                      onClick={handleCallKhala}
                      className="flex items-center w-full px-2 py-3 rounded-lg transition-all duration-200 text-gray-700 hover:bg-gray-50"
                    >
                      <div className="p-2 rounded-md bg-gray-100">
                        <PhoneOutgoing className="mr-2 h-4 w-4" />
                      </div>
                      <span className="ml-5 font-medium">Call Khala</span>
                    </button>

                    {isAdmin && (
                      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="hover:bg-gray-100">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Manage Phone Numbers</DialogTitle>
                            <DialogDescription>
                              Add, view, or remove phone numbers that can be used to call Khala.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="flex space-x-2">
                              <Input
                                value={newPhone}
                                onChange={(e) => setNewPhone(e.target.value)}
                                placeholder="Enter phone number"
                              />
                              <Button onClick={handleAddPhone}>Add</Button>
                            </div>
                            {phoneNumbers.map((phone) => (
                              <div key={phone.id} className="flex justify-between items-center">
                                <span>{phone.number}</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeletePhone(phone.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}

                    <Dialog open={isCallDialogOpen} onOpenChange={setIsCallDialogOpen}>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Select a Number to Call</DialogTitle>
                          <DialogDescription>
                            Choose a phone number from the list below to initiate a call to Khala.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-2">
                          {phoneNumbers.map((phone) => (
                            <Button
                              key={phone.id}
                              className="w-full"
                              onClick={() => handleCallNumber(phone.number)}
                            >
                              {phone.number}
                            </Button>
                          ))}
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
    </Sidebar>
  );
}

export default AppSidebar;