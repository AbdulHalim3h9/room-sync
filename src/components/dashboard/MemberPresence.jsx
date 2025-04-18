"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { doc, collection, getDocs, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Building, X } from 'lucide-react';

const MemberPresence = ({ activeMembers }) => {
  const [memberPresence, setMemberPresence] = useState({});
  const [loadingPresence, setLoadingPresence] = useState(true);
  const [showMemberDetails, setShowMemberDetails] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Fetch member presence status
  const fetchMemberPresence = useCallback(async () => {
    setLoadingPresence(true);
    try {
      const presenceRef = collection(db, 'memberPresence');
      const querySnapshot = await getDocs(presenceRef);
      
      const presenceData = {};
      querySnapshot.docs.forEach((doc) => {
        const data = doc.data();
        presenceData[doc.id] = data;
      });
      
      setMemberPresence(presenceData);
    } catch (error) {
      console.error('Error fetching member presence:', error);
    } finally {
      setLoadingPresence(false);
    }
  }, []);
  
  // Toggle member presence status
  const toggleMemberPresence = async (memberId, isPresent) => {
    try {
      const presenceRef = doc(db, 'memberPresence', memberId);
      await setDoc(presenceRef, {
        isPresent,
        lastUpdated: serverTimestamp()
      }, { merge: true });
      
      // Update local state
      setMemberPresence(prev => ({
        ...prev,
        [memberId]: {
          ...prev[memberId],
          isPresent,
          lastUpdated: new Date()
        }
      }));
    } catch (error) {
      console.error('Error updating member presence:', error);
    }
  };

  useEffect(() => {
    fetchMemberPresence();
  }, [fetchMemberPresence]);

  if (isDismissed) {
    return null;
  }

  return (
    <Card className="mb-6 shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 transition-colors duration-300">
        <CardHeader className="py-3 px-4 border-b">
          <div className="flex items-center justify-between">
            {/* Only show title when expanded */}
            <div className="flex items-center gap-2 flex-1">
              <Building className="h-5 w-5 text-emerald-600 shrink-0" />
              
              {/* Compact View - Always Visible */}
              {loadingPresence ? (
                <div className="flex items-center justify-center py-1">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-500"></div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-1">
                  {activeMembers.map((member) => {
                    const presenceData = memberPresence[member.memberId];
                    const statusFound = presenceData !== undefined;
                    const isPresent = statusFound ? presenceData.isPresent : false;
                    
                    return (
                      <div 
                        key={member.memberId}
                        className="relative cursor-pointer hover:scale-110 transition-transform duration-200"
                        onClick={() => toggleMemberPresence(member.memberId, !isPresent)}
                        title={`${member.shortname || member.memberName} is ${statusFound ? (isPresent ? 'in flat' : 'away') : 'unknown'}`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${statusFound ? (isPresent ? 'bg-emerald-100' : 'bg-gray-100') : 'bg-blue-100'} border ${statusFound ? (isPresent ? 'border-emerald-200' : 'border-gray-200') : 'border-blue-200'}`}>
                          {member.imgSrc ? (
                            <img 
                              src={member.imgSrc} 
                              alt={member.memberName} 
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-sm font-semibold">
                              {member.memberName.charAt(0)}
                            </span>
                          )}
                        </div>
                        <span 
                          className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${statusFound ? (isPresent ? 'bg-emerald-500' : 'bg-red-500') : 'bg-blue-500'}`}
                        ></span>
                      </div>
                    );
                  })}
                </div>
              )}
              
              {/* Only show title when expanded */}
              {showMemberDetails && (
                <CardTitle className="text-lg font-medium ml-2">Who's in the Flat?</CardTitle>
              )}
            </div>
            
            <div className="flex items-center gap-1">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowMemberDetails(prev => !prev)}
                className="h-8 w-8 p-0 rounded-full"
              >
                {showMemberDetails ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                )}
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsDismissed(true)}
                className="h-8 w-8 p-0 rounded-full text-gray-500 hover:text-gray-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        {/* Expanded View - Only Visible When Expanded */}
        {showMemberDetails && (
          <CardContent className="pt-4 pb-2 animate-in fade-in-50 duration-300">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {activeMembers.map((member) => {
                const presenceData = memberPresence[member.memberId];
                const statusFound = presenceData !== undefined;
                const isPresent = statusFound ? presenceData.isPresent : false;
                
                return (
                  <div 
                    key={member.memberId}
                    className={`flex items-center justify-between p-3 rounded-lg border ${statusFound ? (isPresent ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50 border-gray-200') : 'bg-blue-50 border-blue-200'} transition-colors duration-200`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`relative w-8 h-8 rounded-full flex items-center justify-center ${statusFound ? (isPresent ? 'bg-emerald-100' : 'bg-gray-100') : 'bg-blue-100'}`}>
                        {member.imgSrc ? (
                          <img 
                            src={member.imgSrc} 
                            alt={member.memberName} 
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-sm font-semibold">
                            {member.memberName.charAt(0)}
                          </span>
                        )}
                        <span 
                          className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${statusFound ? (isPresent ? 'bg-emerald-500' : 'bg-red-500') : 'bg-blue-500'}`}
                        ></span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium truncate max-w-[100px]">
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
            
            <div className="mt-4 px-4 py-2 border-t border-gray-100 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 text-center">
                Toggle the switch to update a member's presence status
              </p>
            </div>
          </CardContent>
        )}
      </div>
    </Card>
  );
};

export default MemberPresence;
