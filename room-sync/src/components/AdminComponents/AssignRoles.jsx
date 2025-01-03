import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

const ROLE_VALUES = {
  MEMBER: "Member",
  MANAGER: "Manager",
};

const AssignRoles = ({ memberName }) => {
  const [role, setRole] = useState(ROLE_VALUES.MEMBER);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);

  const handleRoleChange = () => {
    setRole(selectedRole);
    setShowConfirm(false);
  };

  const handleDropdownClick = (value) => {
    if (value !== role) {
      setSelectedRole(value);
      setShowConfirm(true);
    }
  };

  return (
    <div className="relative">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="secondary"
            id="roles"
            className={`flex items-center gap-2 w-32 rounded ${
              role === "Manager" ? "bg-yellow-300 text-black hover:bg-yellow-400" : ""
            }`}
          >
            {role}
            <ChevronDown className="w-5 h-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => handleDropdownClick("Manager")}>
            Manager
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleDropdownClick("Member")}>
            Member
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {showConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
          <div className="bg-white shadow-lg rounded-lg p-4 w-64">
            <p className="text-sm text-gray-700">
              Are you sure you want to change the role to <span className="font-semibold">{selectedRole}</span> for {memberName}?
            </p>
            <div className="flex justify-end gap-2 mt-4">
              <Button
                variant="ghost"
                className="text-gray-600"
                onClick={() => setShowConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                className="bg-blue-500 hover:bg-blue-600 text-white"
                onClick={handleRoleChange}
              >
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignRoles;
