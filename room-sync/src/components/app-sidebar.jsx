import { useNavigate, useLocation } from "react-router-dom"; // Import useNavigate and useLocation
import {
  UsersRound,
  ShoppingBasket,
  Banknote,
  UserRoundPen,
  HandHelping,
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

export function AppSidebar() {
  const navigate = useNavigate(); // Initialize the navigate function
  const location = useLocation(); // Get current location

  // Function to handle navigation on item click
  const handleNavigate = (path) => {
    navigate(path); // Navigate to the specified path
  };

  // Menu items with their paths and icons
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
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
