import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { membersData } from "@/membersData";
import { ChevronLeft, ChevronRight } from "lucide-react";

const NavigateMembers = () => {
  const [isVisible, setIsVisible] = useState(false); // State to track visibility
  const navigate = useNavigate();

  const toggleVisibility = () => {
    setIsVisible((prev) => !prev);
  };

  const handleButtonClick = (member_id) => {
    navigate(`/creditconsumed/${member_id}`);
  };

  return (
    <div className="relative z-[999]">
      {/* Toggle Button */}
      <Button
        className={`fixed top-1/2 bg-slate-700 opacity-30 transform -translate-y-1/2 h-12 transition-all duration-300 ${
          isVisible ? 'w-8 rounded-l-full bg-slate-300 right-[4.5rem]' : 'w-12 rounded-full right-4'
        } z-20`}
        onClick={toggleVisibility}
      >
        {isVisible ? (
          <ChevronRight className="w-6 h-6" />
        ) : (
          <ChevronLeft className="w-6 h-6" />
        )}
      </Button>

      {/* Members List */}
      <div
        className={`fixed right-2 top-1/2 transform -translate-y-1/2 flex flex-col gap-2 transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {membersData.map((member) => (
          <Button
            className="h-16 w-16 p-2"
            variant="secondary"
            key={member.member_id}
            onClick={() => handleButtonClick(member.member_id)}
          >
            <img
              className="rounded object-cover h-full w-full"
              src={member.img_src}
              alt={member.member_name}
            />
          </Button>
        ))}
      </div>
    </div>
  );
};

export default NavigateMembers;
