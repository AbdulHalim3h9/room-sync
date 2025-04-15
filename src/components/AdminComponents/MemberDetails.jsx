"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { db } from "@/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import ActiveMemberMonthYearPicker from "@/components/ActiveMemberMonthYearPicker";

const MemberDetails = ({ member }) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [shortnameInput, setShortnameInput] = useState("");
  const [archiveFrom, setArchiveFrom] = useState("");
  const [error, setError] = useState("");
  const { toast } = useToast();

  if (!member) return <p className="text-gray-500 text-center">No member selected.</p>;

  const memberSinceDate = member.activeFrom
    ? new Date(member.activeFrom.split("-")[0], member.activeFrom.split("-")[1] - 1).toLocaleString("en-US", { month: "long", year: "numeric" })
    : "N/A";

  const handleArchive = async () => {
    if (shortnameInput.toLowerCase() !== member.shortname.toLowerCase()) {
      setError("Shortname doesn't match. Please try again.");
      return;
    }

    if (!archiveFrom) {
      setError("Please select an archive month.");
      return;
    }

    try {
      const memberRef = doc(db, "members", member.docId || member.id);
      await updateDoc(memberRef, {
        status: "archived",
        archiveFrom,
      });
      toast({
        title: "Member Archived",
        description: `${member.fullname} will be archived from ${archiveFrom}.`,
      });
      setShowConfirm(false);
      setShortnameInput("");
      setArchiveFrom("");
      setError("");
    } catch (err) {
      console.error("Error archiving member:", err);
      setError("Failed to archive member.");
      toast({
        title: "Error",
        description: "Failed to archive member.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md mt-4">
      <div className="flex flex-col gap-4">
        {member.imageUrl && (
          <img
            src={member.imageUrl}
            alt={`${member.fullname}'s profile`}
            className="w-24 h-24 rounded-full mx-auto"
            onError={(e) => (e.target.src = "https://via.placeholder.com/150")}
          />
        )}
        <p><strong>Member ID:</strong> {member.id}</p>
        <p><strong>Full Name:</strong> {member.fullname}</p>
        <p><strong>Short Name:</strong> {member.shortname}</p>
        <p><strong>Resident Type:</strong> {member.resident}</p>
        <p><strong>Phone Number:</strong> {member.phone || "N/A"}</p>
        <p><strong>Member Since:</strong> {memberSinceDate}</p>
        <p><strong>Status:</strong> {member.status}</p>
        {member.archiveFrom && (
          <p><strong>Archived From:</strong> {new Date(member.archiveFrom.split("-")[0], member.archiveFrom.split("-")[1] - 1).toLocaleString("en-US", { month: "long", year: "numeric" })}</p>
        )}

        {member.status !== "archived" && !showConfirm ? (
          <Button
            className="bg-red-500 text-white hover:bg-red-600"
            onClick={() => setShowConfirm(true)}
          >
            Archive Member
          </Button>
        ) : member.status !== "archived" ? (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-gray-600">Please confirm archiving {member.fullname}:</p>
            <div>
              <Label>Archive From</Label>
              <ActiveMemberMonthYearPicker
                value={archiveFrom}
                onChange={setArchiveFrom}
              />
            </div>
            <div>
              <Label>Confirm Shortname</Label>
              <Input
                type="text"
                value={shortnameInput}
                onChange={(e) => setShortnameInput(e.target.value)}
                placeholder="Enter shortname"
                className="border p-2 rounded"
              />
            </div>
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
                  setArchiveFrom("");
                  setError("");
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default MemberDetails;