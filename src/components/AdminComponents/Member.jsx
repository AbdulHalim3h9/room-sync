import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp, Mail, Phone, Calendar } from "lucide-react";
import MemberDetails from "./MemberDetails";

const Member = ({ user }) => {
  const [showDetails, setShowDetails] = useState(false);

  const handleViewDetails = () => {
    setShowDetails(!showDetails);
  };

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Member Basic Info */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              className="w-12 h-12 object-cover rounded-full border-2 border-gray-100 shadow-sm"
              src={user.imageUrl || "https://via.placeholder.com/48"}
              alt={user.fullname || "Member"}
              onError={(e) => (e.target.src = "https://via.placeholder.com/48")}
            />
            {user.isActive ? (
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
            ) : (
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-gray-400 rounded-full border-2 border-white" />
            )}
          </div>
          
          <div>
            <h3 className="font-medium text-gray-900">{user.fullname || "Unnamed Member"}</h3>
            <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
              {user.email && (
                <div className="flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  <span>{user.email}</span>
                </div>
              )}
              {user.phone && (
                <div className="flex items-center gap-1 ml-2">
                  <Phone className="h-3 w-3" />
                  <span>{user.phone}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Status and Actions */}
        <div className="flex items-center gap-3">
          {user.activeFrom && (
            <div className="hidden sm:flex items-center gap-1 text-xs text-gray-500">
              <Calendar className="h-3 w-3" />
              <span>Since {user.activeFrom}</span>
            </div>
          )}
          
          <Badge 
            className={cn(
              "px-2 py-0.5 text-xs font-medium",
              user.isActive 
                ? "bg-green-100 text-green-800 hover:bg-green-200" 
                : "bg-gray-100 text-gray-800 hover:bg-gray-200"
            )}
          >
            {user.isActive ? "Active" : "Archived"}
          </Badge>
          
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1 h-8 text-sm border-gray-200"
            onClick={handleViewDetails}
          >
            {showDetails ? (
              <>
                <ChevronUp className="h-3.5 w-3.5" />
                <span>Hide Details</span>
              </>
            ) : (
              <>
                <ChevronDown className="h-3.5 w-3.5" />
                <span>View Details</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Member Details Section */}
      {showDetails && (
        <div className="mt-4 pt-4 border-t border-gray-100 animate-in fade-in-50 duration-300">
          <MemberDetails member={user} />
        </div>
      )}
    </div>
  );
};

export default Member;
