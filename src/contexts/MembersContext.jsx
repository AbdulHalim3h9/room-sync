"use client";

import React, { createContext, useState, useEffect, useCallback } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase";

export const MembersContext = createContext();

export const MembersProvider = ({ children }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      const membersRef = collection(db, "members");
      const querySnapshot = await getDocs(membersRef);
      const membersData = querySnapshot.docs
        .map((doc) => {
          const data = doc.data();
          if (!data.id || !data.fullname) {
            console.warn(`Invalid member data in doc ${doc.id}:`, data);
            return null;
          }
          return {
            memberId: data.id,
            shortname: data.shortname,
            memberName: data.fullname,
            imgSrc: data.imageUrl || "",
            activeFrom: data.activeFrom,
            archiveFrom: data.archiveFrom,
          };
        })
        .filter((member) => member !== null)
        .sort((a, b) => a.memberName.localeCompare(b.memberName));

      setMembers(membersData);
      if (membersData.length === 0) {
        setError("No members found.");
      } else {
        setError(null);
      }
    } catch (err) {
      console.error("Error fetching members:", err);
      setError("Failed to load members.");
      setMembers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  return (
    <MembersContext.Provider value={{ members, loading, error }}>
      {children}
    </MembersContext.Provider>
  );
};