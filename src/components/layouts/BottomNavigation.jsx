import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { FileText, CreditCard, ShoppingBag } from "lucide-react";

const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed z-[40] bottom-0 left-0 w-full bg-white/90 backdrop-blur-lg border-t shadow-lg">
      <div className="flex justify-around items-center h-16 max-w-screen-lg mx-auto px-4">
        <Button
          variant="ghost"
          className={cn(
            "flex flex-col items-center justify-center gap-1 h-full w-full rounded-none relative transition-all",
            isActive('/creditconsumed') 
              ? "text-blue-600 bg-blue-50/50" 
              : "text-gray-500 hover:text-blue-500 hover:bg-blue-50/30"
          )}
          onClick={() => navigate('/creditconsumed')}
        >
          <div className={cn(
            "absolute bottom-0 h-[3px] w-10 rounded-t-full transition-all duration-300",
            isActive('/creditconsumed') ? "bg-blue-500" : "bg-transparent"
          )}></div>
          <FileText className={cn(
            "h-5 w-5 transition-all",
            isActive('/creditconsumed') && "text-blue-600"
          )} />
          <span className={cn(
            "text-xs font-medium transition-all",
            isActive('/creditconsumed') ? "text-blue-600" : "text-gray-500"
          )}>Credit/Consumed</span>
        </Button>

        <Button
          variant="ghost"
          className={cn(
            "flex flex-col items-center justify-center gap-1 h-full w-full rounded-none relative transition-all",
            isActive('/payables') 
              ? "text-blue-600 bg-blue-50/50" 
              : "text-gray-500 hover:text-blue-500 hover:bg-blue-50/30"
          )}
          onClick={() => navigate('/payables')}
        >
          <div className={cn(
            "absolute bottom-0 h-[3px] w-10 rounded-t-full transition-all duration-300",
            isActive('/payables') ? "bg-blue-500" : "bg-transparent"
          )}></div>
          <CreditCard className={cn(
            "h-5 w-5 transition-all",
            isActive('/payables') && "text-blue-600"
          )} />
          <span className={cn(
            "text-xs font-medium transition-all",
            isActive('/payables') ? "text-blue-600" : "text-gray-500"
          )}>Payables</span>
        </Button>

        <Button
          variant="ghost"
          className={cn(
            "flex flex-col items-center justify-center gap-1 h-full w-full rounded-none relative transition-all",
            isActive('/groceries_spendings') 
              ? "text-blue-600 bg-blue-50/50" 
              : "text-gray-500 hover:text-blue-500 hover:bg-blue-50/30"
          )}
          onClick={() => navigate('/groceries_spendings')}
        >
          <div className={cn(
            "absolute bottom-0 h-[3px] w-10 rounded-t-full transition-all duration-300",
            isActive('/groceries_spendings') ? "bg-blue-500" : "bg-transparent"
          )}></div>
          <ShoppingBag className={cn(
            "h-5 w-5 transition-all",
            isActive('/groceries_spendings') && "text-blue-600"
          )} />
          <span className={cn(
            "text-xs font-medium transition-all",
            isActive('/groceries_spendings') ? "text-blue-600" : "text-gray-500"
          )}>Groceries</span>
        </Button>
      </div>
    </nav>
  );
};

export default BottomNavigation;
