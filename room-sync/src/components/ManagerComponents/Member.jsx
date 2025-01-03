import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import AssignRoles from '../AdminComponents/AssignRoles';

const Member = ({ user }) => {
      const [isApproved, setIsApproved] = useState(false);

      const handleApprove = () => {
            setIsApproved(true);
      };

      return (
            <div className="my-4 flex items-center justify-between">
                  <div className="mr-2.5 text-slate-800">
                        <p>{user.member_name}</p>
                  </div>
                  <AssignRoles/>
                  <div className="flex flex-col items-center gap-x-2">
                        {isApproved ? (
                              <Button variant="secondary" disabled>Verified</Button>
                        ) : (
                              <Button onClick={handleApprove} className="bg-green-400">Approve</Button>
                        )}
                        <Button variant="destructive">Remove</Button>
                  </div>
            </div>
      );
};

export default Member;