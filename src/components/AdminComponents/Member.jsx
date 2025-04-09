import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import MemberDetails from "./MemberDetails"; // Import the details component
import { use } from "react";

const Member = ({ user }) => {
  const [showDetails, setShowDetails] = useState(false); // State to toggle details

  const handleViewDetails = () => {
    setShowDetails(!showDetails); // Toggle visibility
    console.log(user.id); // Log the user object
    console.log("View Details clicked"); // Log the click event
  };

  return (
      <div>
    <div className="my-4 flex gap-4 items-center justify-between">
      <div className="flex gap-x-6 items-center justify-around">
        <img
          className="w-12 h-12 overflow-hidden rounded-full"
          src={user.imageUrl || "https://via.placeholder.com/48"}
          alt={user.fullname}
          onError={(e) => (e.target.src = "https://via.placeholder.com/48")}
        />
        <div className="mr-2.5 text-slate-800">
          <p>
            {user.fullname}
          </p>
        </div>
      </div>

      <div className="relative">
        <Button
          variant="secondary"
          id="view-details"
          className="flex items-center gap-2 w-32 rounded bg-yellow-300 text-black hover:bg-yellow-400"
          onClick={handleViewDetails}
        >
          {showDetails ? "Hide Details" : "View Details"}
        </Button>
      </div>
      </div>

      {/* Show MemberDetails when toggled */}
      {showDetails && <MemberDetails member={user} />}
    </div>
  );
};

export default Member;