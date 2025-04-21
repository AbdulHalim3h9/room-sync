import { useLocation } from 'react-router-dom';
import { SidebarTrigger } from "@/components/ui/sidebar";

const routeTitles = {
  '/': 'Dashboard',
  '/members': 'Members',
  '/meal-count': 'Meal Count',
  '/settings': 'Settings',
  '/profile': 'Profile'
};

export function TopBar() {
  const location = useLocation();
  const currentPath = location.pathname;
  
  const getPageTitle = () => {
    if (currentPath.includes('/members/')) {
      return 'Member Details';
    }
    return routeTitles[currentPath] || 'Room Sync';
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white">
      <div className="flex h-16 items-center px-4">
        <div className="flex items-center gap-3">
          <SidebarTrigger className="flex-none shadow-none" />
          <h2 className="text-lg font-semibold">{getPageTitle()}</h2>
        </div>
      </div>
    </header>
  );
}
