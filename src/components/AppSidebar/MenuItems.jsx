import * as Sidebar from "@/components/ui/sidebar";
import {
  UsersRound,
  ShoppingBasket,
  Banknote,
  UserRoundPen,
  HandHelping,
  Settings as SettingsIcon,
} from "lucide-react";

export function MenuItems({ isAuthenticated, isAdmin, location, handleNavigate }) {
  const menuItems = [
    {
      label: "Misc Settings",
      path: "/misc-settings",
      icon: <SettingsIcon className="mr-2 h-6 w-6 text-purple-600" />,
    },
    {
      label: "বাজার তালিকায় যোগ করুন",
      path: "/add-grocery-spendings",
      icon: <ShoppingBasket className="mr-2 h-6 w-6" />,
    },
    {
      label: "মিলে টাকা যোগ করুন",
      path: "/add-meal-fund",
      icon: <HandHelping className="mr-2 h-6 w-6" />,
    },
    {
      label: "বিল সেট করুন",
      path: "/set-payables",
      icon: <Banknote className="mr-2 h-6 w-6" />,
    },
    {
      label: "মিল কাউন্ট সেট করুন",
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
    <Sidebar.SidebarMenu className="space-y-0">
      {isAuthenticated && menuItems.map((item) => (
        <Sidebar.SidebarMenuItem key={item.path}>
          <Sidebar.SidebarMenuButton asChild>
            <button
              onClick={() => handleNavigate(item.path)}
              className={`flex items-center w-full px-4 py-6 rounded-lg transition-all duration-200 ${
                location.pathname === item.path
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <div>{item.icon}</div>
              <span className="ml-3 font-medium">{item.label}</span>
            </button>
          </Sidebar.SidebarMenuButton>
        </Sidebar.SidebarMenuItem>
      ))}
    </Sidebar.SidebarMenu>
  );
}

export default MenuItems;