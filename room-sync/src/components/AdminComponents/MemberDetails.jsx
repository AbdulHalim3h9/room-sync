import React from "react";
import { Button } from "@/components/ui/button";

const MemberDetails = ({ member }) => {
  if (!member) return <p>No member selected.</p>;

  // Convert Firestore timestamp to readable date (if memberSince exists)
  const memberSinceDate = member.memberSince
    ? new Date(member.memberSince.toDate()).toLocaleDateString()
    : "N/A";

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md mt-4">
      <h2 className="text-xl font-bold mb-4">Member Details</h2>
      <div className="flex flex-col gap-4">
        {member.imageUrl && (
          <img
            src={member.imageUrl}
            alt="Profile"
            className="w-24 h-24 rounded-full mx-auto"
            onError={(e) => (e.target.src = "https://via.placeholder.com/150")}
          />
        )}
        <p><strong>Member ID:</strong> {member.id}</p>
        <p><strong>Full Name:</strong> {member.fullname}</p>
        <p><strong>Short Name:</strong> {member.shortname}</p>
        <p><strong>Resident Type:</strong> {member.resident}</p>
        <p><strong>Phone Number:</strong> {member.phone}</p>
        <p><strong>Member Since:</strong> {memberSinceDate}</p>
        <p><strong>Status:</strong> {member.status}</p>
        <Button className="bg-red-500 text-white hover:bg-red-600">
          Archive Member
        </Button>
      </div>
    </div>
  );
};

export default MemberDetails;