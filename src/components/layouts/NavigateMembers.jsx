"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { MembersContext } from "@/contexts/MembersContext";
import { MonthContext } from "@/contexts/MonthContext";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const getInitials = (name) => {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const Avatar = ({ name, imageUrl, className }) => {
  const avatarContent = imageUrl ? (
    <img
      className={cn("w-full h-full object-cover rounded-2xl", className)}
      src={imageUrl}
      alt={name}
    />
  ) : (
    <div
      className={cn(
        "w-full h-full flex items-center justify-center rounded-2xl",
        "text-white font-semibold",
        [
          "bg-red-500",
          "bg-blue-500",
          "bg-green-500",
          "bg-yellow-500",
          "bg-purple-500",
          "bg-pink-500",
          "bg-indigo-500",
          "bg-teal-500",
        ][name.charCodeAt(0) % 8],
        className
      )}
    >
      {getInitials(name)}
    </div>
  );

  return (
    <div className="relative w-full h-full">
      {avatarContent}
    </div>
  );
};

const NavigateMembers = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [hoveredMember, setHoveredMember] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { members, loading, error } = React.useContext(MembersContext);
  const { month } = React.useContext(MonthContext);

  const currentMemberId = location.pathname.split("/").pop();

  // Filter active members for the selected month from MonthContext
  const activeMembers = React.useMemo(() => {
    if (!month || !Array.isArray(members)) return [];
    
    return members.filter((member) => {
      // Member must have an activeFrom date
      if (!member.activeFrom) return false;
      
      const activeFromDate = new Date(member.activeFrom + "-01");
      const selectedMonthDate = new Date(month + "-01");
      
      // Check if member was active at the start of the selected month
      if (activeFromDate > selectedMonthDate) return false;
      
      // If member has an archive date, check if they were still active during the selected month
      if (member.archiveFrom) {
        const archiveFromDate = new Date(member.archiveFrom + "-01");
        return selectedMonthDate < archiveFromDate;
      }
      
      // If no archive date, member is still active
      return true;
    });
  }, [members, month]);

  // Log active members for debugging
  React.useEffect(() => {
    console.log('Active members:', activeMembers.map(m => m.memberName));
  }, [activeMembers]);

  const toggleVisibility = () => {
    setIsVisible((prev) => !prev);
  };

  const handleMemberClick = (memberId) => {
    navigate(`/dashboard/${memberId}`);
  };

  const calculateSize = (index) => {
    if (hoveredMember === null) return "w-12 h-12";
    const distance = Math.abs(index - hoveredMember);
    if (distance === 0) return "w-16 h-16";
    if (distance === 1) return "w-14 h-14";
    return "w-12 h-12";
  };


  if (error) {
    return (
      <div className="fixed right-0 top-1/2 -translate-y-1/2 z-50 text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="fixed right-0 top-1/2 -translate-y-1/2 z-50">
      <div className="relative">
        <Button
          className={cn(
            "absolute top-1/2 -translate-y-1/2",
            "transition-all duration-200",
            "opacity-60",
            "hover:scale-110",
            isVisible ? "w-8 h-8 rounded-full right-[6rem]" : "w-12 h-12 rounded-full right-4",
            "flex items-center justify-center p-0"
          )}
          onClick={toggleVisibility}
        >
          {isVisible ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>

        <div
          className={cn(
            "absolute right-2 top-1/2 -translate-y-1/2",
            "flex flex-col gap-3 transition-all duration-300",
            isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
        >
          <div className="rounded-2xl p-4 bg-none">
            <div className="flex flex-col gap-3">
              {activeMembers.map((member, index) => {
                const isSelected = member.memberId === currentMemberId;
                return (
                  <div
                    key={member.memberId}
                    className="relative group"
                    onMouseEnter={() => setHoveredMember(index)}
                    onMouseLeave={() => setHoveredMember(null)}
                  >
                    <Button
                      className={cn(
                        "p-0 overflow-hidden transition-all duration-100",
                        "hover:scale-110",
                        calculateSize(index),
                        "rounded-2xl",
                        isSelected && "ring-2 ring-offset-4 ring-offset-purple-500/30 ring-yellow-500/10"
                      )}
                      variant="ghost"
                      onClick={() => handleMemberClick(member.memberId)}
                    >
                      <div className="relative">
                        <div className="relative">
                          <Avatar
                            name={member.memberName}
                            imageUrl={member.imgSrc}
                            className="rounded-2xl"
                          />
                          {/* Member name display */}
                          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs whitespace-nowrap bg-white px-1 rounded">
                            {member.memberName}
                          </div>
                        </div>
                        {loading && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-2xl">
                            <Loader2 className="w-4 h-4 animate-spin text-white" />
                          </div>
                        )}
                      </div>
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavigateMembers;