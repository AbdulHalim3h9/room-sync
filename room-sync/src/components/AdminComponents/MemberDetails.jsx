import React from "react";
import { Button } from "@/components/ui/button";

const MemberDetails = () => {
//   if (!member) return <p>No member selected.</p>;

      const member = {
      id: "12345",
      fullname: "John Doe",
      shortname: "JD",
      resident: "Resident",
      phone: "+1234567890",
      since: "2022-01-01",
      image: "https://via.placeholder.com/150",
      }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Member Details</h2>
      <div className="flex flex-col gap-4">
        {member.image && (
          <img
            src={member.image}
            alt="Profile"
            className="w-24 h-24 rounded-full mx-auto"
          />
        )}
        <p><strong>Member ID:</strong> {member.id}</p>
        <p><strong>Full Name:</strong> {member.fullname}</p>
        <p><strong>Short Name:</strong> {member.shortname}</p>
        <p><strong>Resident Type:</strong> {member.resident}</p>
        <p><strong>Phone Number:</strong> {member.phone}</p>
        <p><strong>Member Since:</strong> {member.since}</p>
        <Button className="bg-red-500 text-white hover:bg-red-600">
          Archive Member
        </Button>
      </div>
    </div>
  );
};

export default MemberDetails;
