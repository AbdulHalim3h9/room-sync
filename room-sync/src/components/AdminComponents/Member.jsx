import React, { useState } from 'react';
import { Button } from "@/components/ui/button";

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
                  <div className="flex items-center">
                        {isApproved ? (
                              <Button variant="secondary" disabled>Verified</Button>
                        ) : (
                              <Button onClick={handleApprove} className="bg-green-400">Approve</Button>
                        )}
                        <Button variant="destructive" className="ml-2.5">Remove</Button>
                  </div>
            </div>
      );
};

export default Member;