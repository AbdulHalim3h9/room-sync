import { useNavigate } from "react-router-dom";  // Import useNavigate
import { UsersRound, ShoppingBasket, Banknote, UserRoundPen, HandHelping } from "lucide-react";

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
  const navigate = useNavigate();  // Initialize the navigate function

  // Function to handle navigation on item click
  const handleNavigate = (path) => {
    // console.log(path);
    navigate(`${path}`);  // Navigate to the specified path
  };

  return (
    <Sidebar className="fixed z-[999]">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>RoomSync</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* Replace Link with buttons or divs that use navigate */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <button
                    onClick={() => handleNavigate("/add-grocery-spendings")}
                    className="flex items-center py-6"
                  >
                    <ShoppingBasket className="mr-2 h-4 w-4" />
                    <span className="text-lg">Add Grocery Spendings</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <button
                    onClick={() => handleNavigate("/add-meal-fund")}
                    className="flex items-center py-6"
                  >
                    <HandHelping className="mr-2 h-4 w-4" />
                    <span className="text-lg">Add Meal Fund</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <button
                    onClick={() => handleNavigate("/set-payables")}
                    className="flex items-center py-6"
                  >
                    <Banknote className="mr-2 h-4 w-4" />
                    <span className="text-lg">Set Payables</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <button
                    onClick={() => handleNavigate("/set-daily-meal-count")}
                    className="flex items-center py-6"
                  >
                    <UserRoundPen className="mr-2 h-4 w-4" />
                    <span className="text-lg">Set Daily Meal Count</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <button
                    onClick={() => handleNavigate("/members")}
                    className="flex items-center py-6 py-6"
                  >
                    <UsersRound className="mr-2 h-4 w-4" />
                    <span className="text-lg">Manage Members</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>

            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
