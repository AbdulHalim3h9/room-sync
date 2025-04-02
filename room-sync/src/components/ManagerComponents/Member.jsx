import React, { useState } from "react";
import { Button } from "@/components/ui/button";

const Member = ({ user }) => {
  const [isApproved, setIsApproved] = useState(false);

  const handleApprove = () => {
    setIsApproved(true);
  };

  return (
    <div className="my-4 flex flex-col md:flex-row gap-4 items-center justify-between">
      <div className="flex gap-x-6 items-center justify-around">
        <img
          className="w-12 h-12 overflow-hidden rounded-full"
          src={user.img_src}
          alt={user.member_name}
        />
        <div className="mr-2.5 text-slate-800">
          <p>
            {user.member_name} ({user.member_id})
          </p>
        </div>
      </div>

<div className="relative">
      <Button
        variant="secondary"
        id="view-details"
        className="flex items-center gap-2 w-32 rounded bg-yellow-300 text-black hover:bg-yellow-400"
      >
        View Details
      </Button>
    </div>
    </div>
  );
};

export default Member;
