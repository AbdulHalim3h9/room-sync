import { useLocation } from 'react-router-dom';
import { SidebarTrigger } from "@/components/ui/sidebar";
import React, { useContext } from 'react';
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import SingleMonthYearPicker from "@/components/SingleMonthYearPicker";
import { MonthContext } from "@/contexts/MonthContext";

export function TopBar() {
  const location = useLocation();
  const currentPath = location.pathname;
  const [isVisible, setIsVisible] = React.useState(true);
  const [lastScrollY, setLastScrollY] = React.useState(0);
  const { month, setMonth } = useContext(MonthContext);

  // Determine which collections to show hasData for based on current path
  const getCollectionsForPath = () => {
    if (currentPath.includes('/meal')) return ['individualMeals'];
    if (currentPath.includes('/bills') || currentPath.includes('/payables')) return ['bills'];
    if (currentPath.includes('/grocery')) return ['expenses'];
    if (currentPath === '/' || currentPath.startsWith('/dashboard')) return ['contributionConsumption', 'individualMeals'];
    return [];
  };

  React.useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Hide when scrolling down
      if (currentScrollY > lastScrollY) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      // Update last scroll position
      setLastScrollY(currentScrollY);
    };

    // Add scroll event listener
    window.addEventListener('scroll', handleScroll);
    
    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY]);

  return (
    <header
      className={`fixed top-0 w-full backdrop-blur-sm bg-white/80 border-b border-gray-200/50 transition-all duration-300 z-50
        ${isVisible ? 'translate-y-0' : '-translate-y-full'}
        ${isVisible ? 'opacity-100' : 'opacity-0'}`}
    >
      <div className="flex h-16 items-center px-6">
        <div className="flex items-center gap-4 w-full">
          <SidebarTrigger className="flex-none shadow-none" />
          <h2 className="text-lg font-medium text-gray-900">RoomSync (beta)</h2>
          
          <div className="ml-auto flex items-center">
            <SingleMonthYearPicker 
              value={month}
              onChange={setMonth}
              collections={getCollectionsForPath()}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
