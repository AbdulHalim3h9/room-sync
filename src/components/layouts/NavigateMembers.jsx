"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { db } from "@/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const getInitials = (name) => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const Avatar = ({ name, imageUrl, className }) => {
  if (imageUrl) {
    return (
      <img
        className={cn("w-full h-full object-cover", className)}
        src={imageUrl}
        alt={name}
      />
    );
  }

  const initials = getInitials(name);
  const colors = [
    'bg-red-500',
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-teal-500',
  ];
  const colorIndex = initials.charCodeAt(0) % colors.length;
  const bgColor = colors[colorIndex];

  return (
    <div className={cn(
      "w-full h-full flex items-center justify-center",
      "text-white font-semibold",
      bgColor,
      className
    )}>
      {initials}
    </div>
  );
};

const NavigateMembers = ({ onMembersFetched }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [members, setMembers] = useState([]);
  const [hoveredMember, setHoveredMember] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Extract memberId from the current URL path
  const currentMemberId = location.pathname.split('/').pop();

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const membersRef = collection(db, "members");
        const q = query(membersRef, where("status", "==", "active"));
        const querySnapshot = await getDocs(q);
        const fetchedMembers = querySnapshot.docs.map((doc) => ({
          memberId: doc.data().uuid || doc.data().id,
          memberName: doc.data().fullname,
          imgSrc: doc.data().imageUrl,
        }));
        setMembers(fetchedMembers);
        if (onMembersFetched) onMembersFetched(fetchedMembers);
      } catch (error) {
        console.error("Error fetching members:", error);
      }
    };

    fetchMembers();
  }, []);

  const toggleVisibility = () => {
    setIsVisible((prev) => !prev);
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

  return (
    <div className="fixed right-0 top-1/2 -translate-y-1/2 z-50">
      <div className="relative">
        <Button
          className={cn(
            "fixed top-1/2 bg-background/80 backdrop-blur-lg border border-border/50 shadow-lg",
            "transform -translate-y-1/2 transition-all duration-300",
            isVisible ? "w-8 rounded-l-full right-[4.5rem]" : "w-12 rounded-full right-4",
            "hover:bg-background/90 hover:shadow-xl"
          )}
          onClick={toggleVisibility}
        >
          {isVisible ? <ChevronRight className="w-6 h-6" /> : <ChevronLeft className="w-6 h-6" />}
        </Button>

        <div
          className={cn(
            "fixed right-2 top-1/2 transform -translate-y-1/2",
            "flex flex-col gap-3 transition-all duration-300",
            isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
        >
          <div className="bg-background/80 backdrop-blur-lg rounded-2xl p-4 border border-border/50 shadow-lg">
            <div className="flex flex-col gap-3">
              {members.map((member, index) => {
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
                        "p-0 overflow-hidden transition-all duration-300",
                        "hover:scale-110 hover:shadow-lg",
                        calculateSize(index),
                        "rounded-2xl border border-border/50",
                        isSelected && "ring-4 ring-primary"
                      )}
                      variant="ghost"
                      onClick={() => handleMemberClick(member.memberId)}
                    >
                      <Avatar
                        name={member.memberName}
                        imageUrl={member.imgSrc}
                        className="rounded-2xl"
                      />
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