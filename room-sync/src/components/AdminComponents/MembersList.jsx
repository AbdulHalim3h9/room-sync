import React, { useState, useEffect } from "react";
import Member from "./Member";
import { db } from "@/firebase";
import { collection, onSnapshot, query, where } from "firebase/firestore";

const MembersList = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [showArchived, setShowArchived] = useState(false); // Ensure this is defined

  useEffect(() => {
    const q = query(
      collection(db, "members"),
      where("status", showArchived ? "==" : "!=", "archived")
    );
    
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        console.log("Snapshot received, documents found:", snapshot.docs.length);
        const membersData = snapshot.docs.map((doc) => {
          const data = {
            docId: doc.id,
            ...doc.data(),
          };
          console.log(`Member ID: ${doc.id}, Status: ${data.status || "undefined"}`);
          return data;
        });
        console.log("Members data:", membersData);
        setMembers(membersData);
        setLoading(false);
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
  }, [showArchived]); // Dependency on showArchived

  const handleViewArchived = () => {
    setShowArchived(true); // Set to true to show archived members
    setMenuOpen(false);
  };

  const handleViewActive = () => {
    setShowArchived(false); // Set to false to show active members
    setMenuOpen(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-2xl text-center text-slate-800">
          {showArchived ? "Archived Members" : "Manage Members"} ({members.length})
        </h4>
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 me-8 hover:bg-gray-100 rounded-full focus:outline-none"
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
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
              <button
                onClick={showArchived ? handleViewActive : handleViewArchived}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                {showArchived ? "View Active Members" : "View Archived Members"}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-xl mx-auto p-6">
        {loading ? (
          <p className="text-center">Loading members...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : members.length === 0 ? (
          <p className="text-center">No {showArchived ? "archived" : "active"} members found.</p>
        ) : (
          <ol className="">
            {members.map((user) => (
              <li key={user.docId}>
                <Member user={user} />
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
};

export default MembersList;