import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { db } from "@/firebase";
import { doc, updateDoc } from "firebase/firestore";

const MemberDetails = ({ member }) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [shortnameInput, setShortnameInput] = useState("");
  const [error, setError] = useState("");

  if (!member) return <p>No member selected.</p>;

  const memberSinceDate = member.memberSince
    ? new Date(member.memberSince.toDate()).toLocaleDateString()
    : "N/A";

  const handleArchive = async () => {
    console.log("Archiving member:", member.id);
    if (shortnameInput.toLowerCase() !== member.shortname.toLowerCase()) {
      setError("Shortname doesn't match. Please try again.");
      return;
    }

    try {
      const memberRef = doc(db, "members", member.docId);
      await updateDoc(memberRef, {
        status: "archived",
        archivedAt: new Date()
      });
      setShowConfirm(false);
      setShortnameInput("");
      setError("");
    } catch (err) {
      setError("Failed to archive member: " + err);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md mt-4">
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

        {!showConfirm ? (
          <Button
            className="bg-red-500 text-white hover:bg-red-600"
            onClick={() => setShowConfirm(true)}
          >
            Archive Member
          </Button>
        ) : (
          <div className="flex flex-col gap-2">
            <p className="text-sm">Please enter member's shortname to confirm:</p>
            <input
              type="text"
              value={shortnameInput}
              onChange={(e) => setShortnameInput(e.target.value)}
              className="border p-2 rounded"
              placeholder="Enter shortname"
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div className="flex gap-2">
              <Button
                className="bg-red-500 text-white hover:bg-red-600"
                onClick={handleArchive}
              >
                Confirm Archive
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowConfirm(false);
                  setShortnameInput("");
                  setError("");
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberDetails;