// import { Calendar, Home, Inbox, Search, Settings } from "lucide-react"

// import {
//   Sidebar,
//   SidebarContent,
//   SidebarGroup,
//   SidebarGroupContent,
//   SidebarGroupLabel,
//   SidebarMenu,
//   SidebarMenuButton,
//   SidebarMenuItem,
// } from "@/components/ui/sidebar"


// export function AppSidebar() {
//   return (
//     <Sidebar>
//       <SidebarContent>
//         <SidebarGroup>
//           <SidebarGroupLabel>RoomSync</SidebarGroupLabel>
//           <SidebarGroupContent>
//             <SidebarMenu>
//                 <SidebarMenuItem>
//                   <SidebarMenuButton asChild>
//                     Item1
//                   </SidebarMenuButton>
//                 </SidebarMenuItem>
//               {/* {items.map((item) => (
//                 <SidebarMenuItem key={item.title}>
//                   <SidebarMenuButton asChild>
//                     <a href={item.url}>
//                       <item.icon />
//                       <span>{item.title}</span>
//                     </a>
//                   </SidebarMenuButton>
//                 </SidebarMenuItem>
//               ))} */}
//             </SidebarMenu>
//           </SidebarGroupContent>
//         </SidebarGroup>
//       </SidebarContent>
//     </Sidebar>
//   )
// }


import { useNavigate } from "react-router-dom";  // Import useNavigate
import { Calendar, ShoppingBasket, Banknote, UserRoundPen, HandHelping } from "lucide-react";

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
    <Sidebar>
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
                    className="flex items-center"
                  >
                    <ShoppingBasket className="mr-2 h-4 w-4" />
                    <span>Add Grocery Spendings</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <button
                    onClick={() => handleNavigate("/add-meal-fund")}
                    className="flex items-center"
                  >
                    <HandHelping className="mr-2 h-4 w-4" />
                    <span>Add Meal Fund</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <button
                    onClick={() => handleNavigate("/set-payables")}
                    className="flex items-center"
                  >
                    <Banknote className="mr-2 h-4 w-4" />
                    <span>Set Payables</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <button
                    onClick={() => handleNavigate("/set-daily-meal-count")}
                    className="flex items-center"
                  >
                    <UserRoundPen className="mr-2 h-4 w-4" />
                    <span>Set Daily Meal Count</span>
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
