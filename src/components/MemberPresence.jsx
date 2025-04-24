import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Home, UserPlus } from "lucide-react";
import { db } from "@/firebase";
import { collection, getDocs, doc, setDoc, serverTimestamp } from "firebase/firestore";

export default function MemberPresence({ activeMembers, memberPresence, setMemberPresence, loadingPresence, setLoadingPresence, toggleMemberPresence }) {
  const [showMemberDetails, setShowMemberDetails] = useState(false);

  // Fetch and create member presence data
  const fetchMemberPresence = useCallback(async () => {
    setLoadingPresence(true);
    try {
      const presenceRef = collection(db, "memberPresence");
      const querySnapshot = await getDocs(presenceRef);

      const presenceData = {};
      querySnapshot.docs.forEach((doc) => {
        presenceData[doc.id] = doc.data();
      });

      // Check for missing members and create default records
      for (const member of activeMembers) {
        if (!presenceData[member.memberId]) {
          const defaultPresence = {
            isPresent: false,
            lastUpdated: serverTimestamp(),
          };
          await setDoc(doc(db, "memberPresence", member.memberId), defaultPresence);
          presenceData[member.memberId] = defaultPresence;
        }
      }

      setMemberPresence(presenceData);
    } catch (error) {
      console.error("Error fetching/creating member presence:", error);
    } finally {
      setLoadingPresence(false);
    }
  }, [activeMembers, setMemberPresence, setLoadingPresence]);

  useEffect(() => {
    if (activeMembers.length > 0) {
      fetchMemberPresence();
    } else {
      setMemberPresence({});
      setLoadingPresence(false);
    }
  }, [activeMembers, fetchMemberPresence]);

  // Toggle expanded view
  const toggleExpandedView = () => {
    setShowMemberDetails((prev) => !prev);
  };

  // Filter present members for non-expanded view
  const presentMembers = activeMembers.filter(member => 
    memberPresence[member.memberId]?.isPresent === true
  );

  // Count of present members
  const presentCount = presentMembers.length;
  const totalCount = activeMembers.length;

  return (
    <Card className="mb-6 shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 transition-colors duration-300">
        <CardHeader className="py-2 px-3">
          <div
            className="cursor-pointer"
            onClick={toggleExpandedView}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Home className="h-5 w-5 text-emerald-600 mr-2" />
                {!loadingPresence && presentCount > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {presentMembers.map((member) => (
                      <div
                        key={member.memberId}
                        className="relative"
                        title={`${member.shortname || member.memberName} is in flat`}
                      >
                        <div className="w-7 h-7 rounded-full flex items-center justify-center bg-emerald-100 border border-emerald-200">
                          {member.imgSrc ? (
                            <img
                              src={member.imgSrc}
                              alt={member.memberName}
                              className="w-7 h-7 rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-xs font-semibold">
                              {member.memberName.charAt(0)}
                            </span>
                          )}
                        </div>
                        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white bg-emerald-500"></span>
                      </div>
                    ))}
                  </div>
                )}
                
                {!loadingPresence && presentCount === 0 && (
                  <div className="flex items-center gap-1">
                    <UserPlus className="h-4 w-4 text-gray-400" />
                    <span className="text-xs text-gray-500">No members currently in flat</span>
                  </div>
                )}
                
                {loadingPresence && (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-500"></div>
                  </div>
                )}
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 rounded-full bg-white/50 hover:bg-white/70 transition-colors ml-2 flex-shrink-0"
              >
                {showMemberDetails ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m18 15-6-6-6 6"/>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m6 9 6 6 6-6"/>
                  </svg>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        
        {showMemberDetails && (
          <CardContent className="pt-3 pb-2 animate-in fade-in-50 duration-300">
            <CardTitle className="text-lg font-medium mb-3">ফ্ল্যাটে এই মুহূর্তে আছে</CardTitle>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
              {activeMembers.map((member) => {
                const presenceData = memberPresence[member.memberId] || {};
                const statusFound = presenceData !== undefined;
                const isPresent = presenceData.isPresent ?? false;

                return (
                  <div
                    key={member.memberId}
                    className={`flex items-center justify-between p-2 rounded-lg border ${statusFound ? (isPresent ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50 border-gray-200') : 'bg-blue-50 border-blue-200'} transition-colors duration-200`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`relative w-7 h-7 rounded-full flex items-center justify-center ${statusFound ? (isPresent ? 'bg-emerald-100' : 'bg-gray-100') : 'bg-blue-100'}`}>
                        {member.imgSrc ? (
                          <img
                            src={member.imgSrc}
                            alt={member.memberName}
                            className="w-7 h-7 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-xs font-semibold">
                            {member.memberName.charAt(0)}
                          </span>
                        )}
                        <span
                          className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${statusFound ? (isPresent ? 'bg-emerald-500' : 'bg-red-500') : 'bg-blue-500'}`}
                        ></span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium truncate max-w-[90px]">
                          {member.shortname || member.memberName}
                        </span>
                        <span className="text-xs text-gray-500">
                          {statusFound ? (isPresent ? 'In Flat' : 'Away') : 'Status not found'}
                        </span>
                      </div>
                    </div>
                    <Switch
                      checked={isPresent}
                      onCheckedChange={(checked) => toggleMemberPresence(member.memberId, checked)}
                      className={`${statusFound ? (isPresent ? 'data-[state=checked]:bg-emerald-500' : '') : 'data-[state=checked]:bg-blue-500'}`}
                    />
                  </div>
                );
              })}
            </div>
            <div className="mt-3 px-3 py-1 border-t border-gray-100 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 text-center">
                Toggle the switch to update a member's presence status
              </p>
            </div>
          </CardContent>
        )}
      </div>
    </Card>
  );
}