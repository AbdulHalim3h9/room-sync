import { useLocation } from 'react-router-dom';
import { SidebarTrigger } from "@/components/ui/sidebar";
import React from 'react';

export function TopBar() {
  const location = useLocation();
  const currentPath = location.pathname;
  const [isVisible, setIsVisible] = React.useState(true);
  const [lastScrollY, setLastScrollY] = React.useState(0);

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
        <div className="flex items-center gap-4">
          <SidebarTrigger className="flex-none shadow-none" />
        </div>
        <h2 className="text-lg font-semibold ml-auto mr-4">RoomSync (beta)</h2>
      </div>
    </header>
  );
}
