import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const BottomNavigation = () => {
  const navigate = useNavigate();
  return (
    // <nav className="fixed bottom-0 left-0 w-full bg-transparent backdrop-blur-lg border-t border-gray-300 shadow-md">
    <div className="fixed z-[999] bottom-0 left-0 w-full flex justify-around py-3">
      <Button variant="secondary" className="bg-gradient-to-r from-slate-100 to-gray-500 hover:from-pink-500 hover:to-orange-500 shadow-xl" onClick={() => {navigate('/creditconsumed')}} >Credit/Consumed</Button>
      <Button variant="secondary" onClick={() => {navigate('/payables')}}>Payables</Button>
      <Button variant="secondary" onClick={() => {navigate('/groceryturns')}}>Grocery Turns</Button>
    </div>
    // </nav>
  );
};

export default BottomNavigation;
