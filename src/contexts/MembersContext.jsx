import React, { createContext, useState, useEffect, useMemo } from "react";
import { db } from "@/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

export const MembersContext = createContext();

export const MembersProvider = ({ children }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoading(true);
        setError(null);
        const membersRef = collection(db, "members");
        const q = query(membersRef, where("status", "==", "active"));
        const querySnapshot = await getDocs(q);
        const fetchedMembers = querySnapshot.docs.map((doc) => ({
          memberId: doc.data().id,
          memberName: doc.data().fullname,
          imgSrc: doc.data().imageUrl,
        }));
        console.log("Fetched members in MembersContext:", fetchedMembers);
        setMembers(fetchedMembers);
      } catch (err) {
        console.error("Error fetching members:", err);
        setError("Failed to load members.");
        setMembers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(
    () => ({
      members,
      loading,
      error,
    }),
    [members, loading, error]
  );

  return (
    <MembersContext.Provider value={value}>
      {children}
    </MembersContext.Provider>
  );
};