"use client";

import React, { useState, useEffect } from "react";
import Member from "./Member";
import { db } from "@/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { cn } from "@/lib/utils";
import { Users, Archive, Filter, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const MembersList = () => {
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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
              return {
                docId: doc.id,
                ...docData,
                isActive,
              };
            })
            .sort((a, b) => a.fullname?.localeCompare(b.fullname || ""));

          // Filter based on showArchived
          const filtered = membersData.filter((member) =>
            showArchived ? !member.isActive : member.isActive
          );

          setMembers(filtered);
          setFilteredMembers(filtered);
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

    return () => unsubscribe();
  }, [showArchived, currentMonth]);

  // Filter members based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredMembers(members);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const filtered = members.filter((member) =>
      member.fullname?.toLowerCase().includes(query) ||
      member.email?.toLowerCase().includes(query) ||
      member.phone?.toLowerCase().includes(query)
    );

    setFilteredMembers(filtered);
  }, [searchQuery, members]);

  const handleViewArchived = () => {
    setShowArchived(true);
    setMenuOpen(false);
  };

  const handleViewActive = () => {
    setShowArchived(false);
    setMenuOpen(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg border border-gray-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-50 rounded-lg">
            {showArchived ? (
              <Archive className="h-5 w-5 text-blue-600" />
            ) : (
              <Users className="h-5 w-5 text-blue-600" />
            )}
          </div>
          <h2 className="text-xl font-bold text-gray-800">
            {showArchived ? "Archived Members" : "Active Members"}
            <span className="ml-2 text-sm font-medium px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">
              {filteredMembers.length}
            </span>
          </h2>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Search Input */}
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 w-full text-sm bg-gray-50 border-gray-200 focus:bg-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600"
              >
                <span className="sr-only">Clear search</span>
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>

          {/* Filter Button */}
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "flex items-center gap-1.5 h-9 border-gray-200",
              showArchived ? "bg-gray-100 text-gray-800" : "bg-white text-gray-700"
            )}
            onClick={showArchived ? handleViewActive : handleViewArchived}
          >
            <Filter className="h-3.5 w-3.5" />
            <span>{showArchived ? "Show Active" : "Show Archived"}</span>
          </Button>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-gray-100 w-full my-4"></div>

      {/* Content */}
      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center text-gray-500">
          <Loader2 className="h-8 w-8 animate-spin mb-3 text-blue-500" />
          <p>Loading members...</p>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-center text-red-600">
          <p>{error}</p>
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center text-gray-500">
          {searchQuery ? (
            <>
              <p className="mb-2 text-gray-600">No results found for "{searchQuery}"</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSearchQuery("")}
                className="mt-2"
              >
                Clear search
              </Button>
            </>
          ) : (
            <p>No {showArchived ? "archived" : "active"} members found.</p>
          )}
        </div>
      ) : (
        <div className="space-y-3 divide-y divide-gray-100">
          {filteredMembers.map((user) => (
            <div key={user.docId} className="pt-3 first:pt-0">
              <Member user={user} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MembersList;