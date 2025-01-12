import React from "react";
import Member from "./Member";
import { members } from "@/members";

const ManageMembers = () => {
  return (
    <div>
      <h4 className="text-2xl text-center text-slate-800">Manage members ({members.length})</h4>
      <div className="max-w-xl mx-auto p-6">
        <ol className="">
          {members.map((user) => (
            <li key={user.id}>
              <Member user={user} />
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
};

export default ManageMembers;
