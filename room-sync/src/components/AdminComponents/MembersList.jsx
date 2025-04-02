import React, { useState, useEffect } from "react";
import Member from "./Member";
import { db } from "@/firebase"; // Adjust the path to your Firebase config
import { collection, onSnapshot, query } from "firebase/firestore";

const MembersList = () => {
  const [members, setMembers] = useState([]); // State to hold the members data
  const [loading, setLoading] = useState(true); // State to handle loading
  const [error, setError] = useState(""); // State to handle errors

  // Fetch members from Firestore on component mount
  useEffect(() => {
    // Create a query for the "members" collection
    const q = query(collection(db, "members"));

    // Set up a real-time listener
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const membersData = snapshot.docs.map((doc) => ({
          id: doc.id, // Firestore doc ID (matches your 'id' field)
          ...doc.data(), // Spread the document data (fullname, imageUrl, etc.)
        }));
        setMembers(membersData);
        setLoading(false);
      },
      (err) => {
        console.error("Firestore Error:", err.message);
        setError(`Failed to load members: ${err.message}`);
        setLoading(false);
      }
    );

    // Cleanup the listener on unmount
    return () => unsubscribe();
  }, []); // Empty dependency array means this runs once on mount

  return (
    <div>
      <h4 className="text-2xl text-center text-slate-800">
        Manage members ({members.length})
      </h4>
      <div className="max-w-xl mx-auto p-6">
        {loading ? (
          <p className="text-center">Loading members...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : members.length === 0 ? (
          <p className="text-center">No members found.</p>
        ) : (
          <ol className="">
            {members.map((user) => (
              <li key={user.id}>
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