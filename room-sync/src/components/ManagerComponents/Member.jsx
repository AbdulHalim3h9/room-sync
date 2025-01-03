import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import AssignRoles from "../AdminComponents/AssignRoles";

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

      <div className="flex flex-row items-center justify-around gap-2">
        {isApproved ? (
          <AssignRoles memberName={user.member_name} />
        ) : (
          // <Button variant="secondary" disabled>Verified</Button>
          <Button onClick={handleApprove} className="w-32 bg-green-400">
            Approve
          </Button>
        )}
        <Button className="w-32" variant="destructive">
          Remove
        </Button>
      </div>
    </div>
  );
};

export default Member;
