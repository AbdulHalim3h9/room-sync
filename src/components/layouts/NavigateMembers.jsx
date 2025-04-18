"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { MembersContext } from "@/contexts/MembersContext";
import { MonthContext } from "@/contexts/MonthContext";
import { ChevronLeft, ChevronRight, Users, User, UserCheck, UserX } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const getInitials = (name) => {
  if (!name) return "??";
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const Avatar = ({ name, imageUrl, isActive, isSelected, className }) => {
  if (imageUrl) {
    return (
      <div className="relative w-full h-full">
        <img
          className={cn(
            "w-full h-full object-cover", 
            className,
            "border-2",
            isSelected ? "border-blue-500" : "border-transparent"
          )}
          src={imageUrl}
          alt={name}
        />
        {isActive && (
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
        )}
      </div>
    );
  }

  const initials = getInitials(name);
  const colors = [
    "bg-gradient-to-br from-blue-500 to-blue-600",
    "bg-gradient-to-br from-purple-500 to-purple-600",
    "bg-gradient-to-br from-green-500 to-green-600",
    "bg-gradient-to-br from-amber-500 to-amber-600",
    "bg-gradient-to-br from-pink-500 to-pink-600",
    "bg-gradient-to-br from-indigo-500 to-indigo-600",
    "bg-gradient-to-br from-teal-500 to-teal-600",
    "bg-gradient-to-br from-cyan-500 to-cyan-600",
  ];
  const colorIndex = initials.charCodeAt(0) % colors.length;
  const bgColor = colors[colorIndex];

  return (
    <div className="relative w-full h-full">
      <div
        className={cn(
          "w-full h-full flex items-center justify-center",
          "text-white font-semibold shadow-sm",
          "border-2",
          isSelected ? "border-blue-500" : "border-transparent",
          bgColor,
          className
        )}
      >
        {initials}
      </div>
      {isActive && (
        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
      )}
    </div>
  );
};

const NavigateMembers = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [hoveredMember, setHoveredMember] = useState(null);
  const [showAllMembers, setShowAllMembers] = useState(false);
  const [animation, setAnimation] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { members, loading, error } = React.useContext(MembersContext);
  const { month } = React.useContext(MonthContext);

  const currentMemberId = location.pathname.split("/").pop();

  // Filter active members for the selected month
  const activeMembers = members.filter((member) => {
    if (!member.activeFrom) return false;
    const activeFromDate = new Date(member.activeFrom + "-01");
    const selectedMonthDate = new Date(month + "-01");
    if (activeFromDate > selectedMonthDate) return false;
    if (member.archiveFrom) {
      const archiveFromDate = new Date(member.archiveFrom + "-01");
      return selectedMonthDate < archiveFromDate;
    }
    return true;
  });
  
  // Filter inactive members for the selected month
  const inactiveMembers = members.filter((member) => {
    if (!member.activeFrom) return false;
    if (!member.archiveFrom) return false;
    
    const archiveFromDate = new Date(member.archiveFrom + "-01");
    const selectedMonthDate = new Date(month + "-01");
    
    return selectedMonthDate >= archiveFromDate;
  });
  
  // Determine which members to display
  const displayMembers = showAllMembers 
    ? [...activeMembers, ...inactiveMembers] 
    : activeMembers;

  // Add animation effect when component mounts
  useEffect(() => {
    setAnimation(true);
    const timer = setTimeout(() => setAnimation(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const toggleVisibility = () => {
    setIsVisible((prev) => !prev);
  };

  const toggleShowAllMembers = () => {
    setShowAllMembers((prev) => !prev);
  };

  const handleMemberClick = (memberId) => {
    navigate(`/creditconsumed/${memberId}`);
  };

  const calculateSize = (index) => {
    if (hoveredMember === null) return "w-12 h-12";
    const distance = Math.abs(index - hoveredMember);
    if (distance === 0) return "w-16 h-16";
    if (distance === 1) return "w-14 h-14";
    return "w-12 h-12";
  };
  
  const isMemberActive = (member) => {
    if (!member.activeFrom) return false;
    const activeFromDate = new Date(member.activeFrom + "-01");
    const selectedMonthDate = new Date(month + "-01");
    if (activeFromDate > selectedMonthDate) return false;
    if (member.archiveFrom) {
      const archiveFromDate = new Date(member.archiveFrom + "-01");
      return selectedMonthDate < archiveFromDate;
    }
    return true;
  };

  if (loading) {
    return (
      <div className="fixed right-0 top-1/2 -translate-y-1/2 z-50 bg-white/80 backdrop-blur-sm p-3 rounded-l-lg shadow-lg">
        <div className="flex items-center gap-2">
          <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          <span className="text-sm font-medium text-gray-700">Loading members...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed right-0 top-1/2 -translate-y-1/2 z-50 bg-red-50 p-3 rounded-l-lg shadow-lg border-l-4 border-red-500">
        <div className="flex items-center gap-2 text-red-700">
          <UserX className="h-4 w-4" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="fixed right-0 top-1/2 -translate-y-1/2 z-50">
        <div className="relative">
          {/* Toggle Button */}
          <Button
            className={cn(
              "absolute top-1/2 -translate-y-1/2",
              "transition-all duration-300 shadow-md",
              isVisible ? "w-8 h-8 rounded-full right-[4.5rem]" : "w-12 h-12 rounded-full right-4",
              "flex items-center justify-center p-0",
              animation && "animate-pulse"
            )}
            variant={isVisible ? "outline" : "default"}
            onClick={toggleVisibility}
          >
            {isVisible ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>

          {/* Members Panel */}
          <div
            className={cn(
              "absolute right-2 top-1/2 -translate-y-1/2",
              "flex flex-col gap-3 transition-all duration-300",
              isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-16 pointer-events-none"
            )}
          >
            <div className="rounded-2xl p-4 bg-white/95 backdrop-blur-sm shadow-xl border border-gray-100">
              {/* Header */}
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span className="text-xs font-medium text-gray-700">
                    {activeMembers.length} Active
                  </span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0 rounded-full"
                  onClick={toggleShowAllMembers}
                >
                  {showAllMembers ? <UserCheck className="h-3 w-3" /> : <User className="h-3 w-3" />}
                </Button>
              </div>
              
              {/* Members List */}
              <div className="flex flex-col gap-3 max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar">
                {displayMembers.map((member, index) => {
                  const isSelected = member.memberId === currentMemberId;
                  const isActive = isMemberActive(member);
                  return (
                    <Tooltip key={member.memberId}>
                      <TooltipTrigger asChild>
                        <div
                          className="relative group"
                          onMouseEnter={() => setHoveredMember(index)}
                          onMouseLeave={() => setHoveredMember(null)}
                        >
                          <Button
                            className={cn(
                              "p-0 overflow-hidden transition-all duration-300",
                              "hover:scale-110 hover:shadow-lg",
                              calculateSize(index),
                              "rounded-xl",
                              isSelected && "ring-2 ring-blue-500 ring-offset-2",
                              !isActive && "opacity-70 grayscale"
                            )}
                            variant="ghost"
                            onClick={() => handleMemberClick(member.memberId)}
                          >
                            <Avatar
                              name={member.memberName}
                              imageUrl={member.imgSrc}
                              isActive={isActive}
                              isSelected={isSelected}
                              className="rounded-xl"
                            />
                          </Button>
                          
                          {/* Name badge on hover */}
                          <div className={cn(
                            "absolute -left-2 top-1/2 -translate-y-1/2 transform -translate-x-full",
                            "transition-all duration-200 pointer-events-none",
                            hoveredMember === index ? "opacity-100 scale-100" : "opacity-0 scale-95"
                          )}>
                            <Badge variant="secondary" className="shadow-sm whitespace-nowrap px-2 py-1">
                              {member.shortname || member.memberName}
                            </Badge>
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="left" className="bg-gray-800 text-white border-none">
                        <div className="text-xs">
                          <div className="font-medium">{member.memberName}</div>
                          <div className="text-gray-300 text-[10px]">{isActive ? "Active" : "Inactive"}</div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default NavigateMembers;