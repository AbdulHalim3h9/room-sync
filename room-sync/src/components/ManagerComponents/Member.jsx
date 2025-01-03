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
                  
                  <div className="flex items-center gap-x-2">
                        {isApproved ? (
                              <AssignRoles memberName={user.member_name}/>
                              // <Button variant="secondary" disabled>Verified</Button>
                        ) : (
                              <Button onClick={handleApprove} className="w-32 bg-green-400">Approve</Button>
                        )}
                        <Button className="w-32" variant="destructive">Remove</Button>
                  </div>
            </div>
      );
};

export default Member;