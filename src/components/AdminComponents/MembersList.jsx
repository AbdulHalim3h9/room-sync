"use client";

import React, { useState, useEffect } from "react";
import Member from "./Member";
import { db } from "@/firebase";
import { collection, onSnapshot } from "firebase/firestore";

const MembersList = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [showArchived, setShowArchived] = useState(false);

  // Get current month in YYYY-MM format
  const currentMonth = (() => {
    const today = new Date();
    const year = today.getFullYear();
    const monthNum = String(today.getMonth() + 1).padStart(2, "0");
    return `${year}-${monthNum}`;
  })();

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "members"),
      (snapshot) => {
        try {
          console.log("Snapshot received, documents found:", snapshot.docs.length);
          const membersData = snapshot.docs
            .map((doc) => {
              const docData = doc.data();
              const isActive = (() => {
                if (!docData.activeFrom) return false;
                const activeFromDate = new Date(docData.activeFrom + "-01");
                const currentMonthDate = new Date(currentMonth + "-01");
                if (activeFromDate > currentMonthDate) return false;
                if (docData.archiveFrom) {
                  const archiveFromDate = new Date(docData.archiveFrom + "-01");
                  return currentMonthDate < archiveFromDate;
                }
                return true;
              })();
              const member = {
                docId: doc.id,
                ...docData,
                isActive,
              };
              console.log(
                `Member ID: ${doc.id}, Name: ${member.fullname}, ActiveFrom: ${member.activeFrom}, ArchiveFrom: ${member.archiveFrom}, IsActive: ${member.isActive}`
              );
              return member;
            })
            .sort((a, b) => a.fullname.localeCompare(b.fullname));
          // Filter based on showArchived
          const filteredMembers = membersData.filter((member) =>
            showArchived ? !member.isActive : member.isActive
          );
          console.log("Filtered members:", filteredMembers);
          setMembers(filteredMembers);
          setLoading(false);
        } catch (err) {
          console.error("Error processing snapshot:", err);
          setError("Failed to process members data.");
          setLoading(false);
        }
      },
      (err) => {
        console.error("Firestore Error:", err.message);
        setError(`Failed to load members: ${err.message}`);
        setLoading(false);
      }
    );

    return () => {
      console.log("Unsubscribing from snapshot listener");
      unsubscribe();
    };
  }, [showArchived, currentMonth]);

  const handleViewArchived = () => {
    setShowArchived(true);
    setMenuOpen(false);
  };

  const handleViewActive = () => {
    setShowArchived(false);
    setMenuOpen(false);
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h4 className="text-2xl font-bold text-slate-800">
          {showArchived ? "Archived Members" : "Active Members"} ({members.length})
        </h4>
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 hover:bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="More options"
          >
            <svg
              className="w-6 h-6 text-gray-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-[1002]">
              <button
                onClick={showArchived ? handleViewActive : handleViewArchived}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
              >
                {showArchived ? "View Active Members" : "View Archived Members"}
              </button>
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <p className="text-center text-gray-600">Loading members...</p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : members.length === 0 ? (
        <p className="text-center text-gray-600">
          No {showArchived ? "archived" : "active"} members found.
        </p>
      ) : (
        <ol className="space-y-4">
          {members.map((user) => (
            <li key={user.docId}>
              <Member user={user} />
            </li>
          ))}
        </ol>
      )}
    </div>
  );
};

export default MembersList;