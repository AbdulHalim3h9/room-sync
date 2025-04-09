import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";

const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed z-[40] bottom-0 left-0 w-full bg-background/80 backdrop-blur-lg border-t">
      <div className="flex justify-around items-center h-16 px-4">
        <Button
          variant="ghost"
          className={`flex flex-col items-center gap-1 h-full w-full rounded-none ${
            isActive('/creditconsumed') ? 'text-primary' : 'text-muted-foreground'
          }`}
          onClick={() => navigate('/creditconsumed')}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
          >
            <path d="M20 7h-3a2 2 0 0 1-2-2V2"></path>
            <path d="M9 2v3a2 2 0 0 1-2 2H4"></path>
            <path d="M3 7v13a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7"></path>
            <path d="M12 12v3"></path>
            <path d="M12 8v.01"></path>
          </svg>
          <span className="text-xs">Credit/Consumed</span>
        </Button>

        <Button
          variant="ghost"
          className={`flex flex-col items-center gap-1 h-full w-full rounded-none ${
            isActive('/payables') ? 'text-primary' : 'text-muted-foreground'
          }`}
          onClick={() => navigate('/payables')}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
          >
            <rect width="20" height="14" x="2" y="5" rx="2"></rect>
            <line x1="2" y1="10" x2="22" y2="10"></line>
          </svg>
          <span className="text-xs">Payables</span>
        </Button>

        <Button
          variant="ghost"
          className={`flex flex-col items-center gap-1 h-full w-full rounded-none ${
            isActive('/groceries_spendings') ? 'text-primary' : 'text-muted-foreground'
          }`}
          onClick={() => navigate('/groceries_spendings')}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
          >
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path>
            <path d="M3 6h18"></path>
            <path d="M16 10a4 4 0 0 1-8 0"></path>
          </svg>
          <span className="text-xs">Groceries</span>
        </Button>
      </div>
    </nav>
  );
};

export default BottomNavigation;
