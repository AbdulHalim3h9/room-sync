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
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { db } from "@/firebase";
import { collection, getDocs, setDoc, doc, deleteDoc } from "firebase/firestore";

export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [phoneNumbers, setPhoneNumbers] = useState([]);
  const [newPhone, setNewPhone] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCallDialogOpen, setIsCallDialogOpen] = useState(false);

  // Fetch phone numbers from Firebase
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

  useEffect(() => {
    fetchPhoneNumbers();
  }, []);

  // Handle navigation
  const handleNavigate = (path) => {
    navigate(path);
  };

  // Open Call Dialog if multiple numbers exist, else call immediately
  const handleCallKhala = () => {
    if (phoneNumbers.length === 0) {
      alert("No phone numbers available. Please add one.");
    } else if (phoneNumbers.length === 1) {
      window.location.href = `tel:${phoneNumbers[0].number}`;
    } else {
      setIsCallDialogOpen(true);
    }
  };

  // Call a selected number
  const handleCallNumber = (number) => {
    window.location.href = `tel:${number}`;
    setIsCallDialogOpen(false);
  };

  // Add a new phone number
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

  // Delete a phone number
  const handleDeletePhone = async (phoneId) => {
    try {
      await deleteDoc(doc(db, "phones", phoneId));
      setPhoneNumbers(phoneNumbers.filter((phone) => phone.id !== phoneId));
    } catch (error) {
      console.error("Error deleting phone number:", error);
    }
  };

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
  ];

  return (
    <Sidebar className="fixed z-[999]">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>RoomSync</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton asChild>
                    <button
                      onClick={() => handleNavigate(item.path)}
                      className={`flex items-center my-0 py-6 rounded-md ${
                        location.pathname === item.path
                          ? "bg-gray-200"
                          : "bg-gray-50 hover:bg-gray-100"
                      }`}
                    >
                      {item.icon}
                      <span className="text-lg">{item.label}</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              {/* Call Khala Button */}
              <SidebarMenuItem key="call-khala">
                <SidebarMenuButton asChild>
                  <div className="flex items-center justify-between w-full">
                    <button
                      onClick={handleCallKhala}
                      className="flex items-center my-0 py-6 rounded-md bg-gray-50 hover:bg-gray-100 flex-grow"
                    >
                      <PhoneOutgoing className="mr-2 h-4 w-4" />
                      <span className="text-lg ms-2">Call Khala</span>
                    </button>

                    {/* Edit Phone Numbers Dialog */}
                    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Manage Phone Numbers</DialogTitle>
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

                    {/* Call Dialog */}
                    <Dialog open={isCallDialogOpen} onOpenChange={setIsCallDialogOpen}>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Select a Number to Call</DialogTitle>
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
      </SidebarContent>
    </Sidebar>
  );
}

export default AppSidebar;



// "use client";

// import { useState, useEffect } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import {
//   UsersRound,
//   ShoppingBasket,
//   Banknote,
//   UserRoundPen,
//   HandHelping,
//   PhoneOutgoing,
//   Pencil,
//   Trash2,
//   LogIn,
// } from "lucide-react";
// import {
//   Sidebar,
//   SidebarContent,
//   SidebarGroup,
//   SidebarGroupContent,
//   SidebarGroupLabel,
//   SidebarMenu,
//   SidebarMenuButton,
//   SidebarMenuItem,
// } from "@/components/ui/sidebar";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { db } from "@/firebase";
// import { collection, getDocs, setDoc, doc, deleteDoc } from "firebase/firestore";

// export function AppSidebar() {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [phoneNumbers, setPhoneNumbers] = useState([]);
//   const [newPhone, setNewPhone] = useState("");
//   const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
//   const [selectedRole, setSelectedRole] = useState(null);
  
//   // Fetch phone numbers from Firebase
//   useEffect(() => {
//     const fetchPhoneNumbers = async () => {
//       try {
//         const phonesCollection = collection(db, "phones");
//         const snapshot = await getDocs(phonesCollection);
//         const phones = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
//         setPhoneNumbers(phones);
//       } catch (error) {
//         console.error("Error fetching phone numbers:", error);
//       }
//     };
//     fetchPhoneNumbers();
//   }, []);

//   const handleNavigate = (path) => navigate(path);

//   const menuItems = [
//     { label: "Add Grocery Spendings", path: "/add-grocery-spendings", icon: <ShoppingBasket className="mr-2 h-4 w-4" /> },
//     { label: "Add Meal Fund", path: "/add-meal-fund", icon: <HandHelping className="mr-2 h-4 w-4" /> },
//     { label: "Set Payables", path: "/set-payables", icon: <Banknote className="mr-2 h-4 w-4" /> },
//     { label: "Set Daily Meal Count", path: "/set-daily-meal-count", icon: <UserRoundPen className="mr-2 h-4 w-4" /> },
//     { label: "Manage Members", path: "/members", icon: <UsersRound className="mr-2 h-4 w-4" /> },
//   ];

//   return (
//     <Sidebar className="fixed z-[999]">
//       <SidebarContent>
//         {/* Login Button */}
//         <div className="flex justify-end p-4">
//           <Dialog open={isLoginDialogOpen} onOpenChange={setIsLoginDialogOpen}>
//             <DialogTrigger asChild>
//               <Button variant="outline" size="sm">
//                 <LogIn className="h-4 w-4 mr-2" /> Login
//               </Button>
//             </DialogTrigger>
//             <DialogContent>
//               <DialogHeader>
//                 <DialogTitle>Login</DialogTitle>
//               </DialogHeader>
//               {selectedRole ? (
//                 <div className="space-y-4">
//                   <p className="text-lg font-medium">Logging in as {selectedRole}</p>
//                   <Input placeholder="Email" type="email" />
//                   <Input placeholder="Password" type="password" />
//                   <Button className="w-full">Login</Button>
//                   <Button variant="outline" className="w-full" onClick={() => setSelectedRole(null)}>
//                     Back
//                   </Button>
//                 </div>
//               ) : (
//                 <div className="flex flex-col space-y-4">
//                   <Button className="w-full" onClick={() => setSelectedRole("Manager")}>
//                     Login as Manager
//                   </Button>
//                   <Button className="w-full" onClick={() => setSelectedRole("Admin")}>
//                     Login as Admin
//                   </Button>
//                 </div>
//               )}
//             </DialogContent>
//           </Dialog>
//         </div>

//         <SidebarGroup>
//           <SidebarGroupLabel>RoomSync</SidebarGroupLabel>
//           <SidebarGroupContent>
//             <SidebarMenu>
//               {menuItems.map((item) => (
//                 <SidebarMenuItem key={item.path}>
//                   <SidebarMenuButton asChild>
//                     <button
//                       onClick={() => handleNavigate(item.path)}
//                       className={`flex items-center my-0 py-6 rounded-md ${
//                         location.pathname === item.path ? "bg-gray-200" : "bg-gray-50 hover:bg-gray-100"
//                       }`}
//                     >
//                       {item.icon}
//                       <span className="text-lg">{item.label}</span>
//                     </button>
//                   </SidebarMenuButton>
//                 </SidebarMenuItem>
//               ))}
//             </SidebarMenu>
//           </SidebarGroupContent>
//         </SidebarGroup>
//       </SidebarContent>
//     </Sidebar>
//   );
// }

// export default AppSidebar;
