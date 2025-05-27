'use client';

import React, { useState, useEffect } from 'react';
import { TrendingUp, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { db } from '@/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { format } from 'date-fns';
import CarryforwardSection from "../CarryforwardSection";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

const FloatingCarryforwardButton = () => {
  const [isHighlighted, setIsHighlighted] = useState(false);
  const [animationOffset, setAnimationOffset] = useState({ top: 0, left: 0 });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isVisible, setIsVisible] = useState(true);
  
  // State for data needed by CarryforwardSection
  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  });
  const [members, setMembers] = useState([]);
  const [carryforwardData, setCarryforwardData] = useState([]);
  const [mealCounts, setMealCounts] = useState({ previous: {} });
  const [mealRate, setMealRate] = useState({ previous: 'N/A' });
  const [totalGroceries, setTotalGroceries] = useState({ previous: 0 });
  const [totalMeals, setTotalMeals] = useState({ previous: 0 });

  // Calculate previous month
  const getPreviousMonth = (month) => {
    const [year, monthNum] = month.split("-").map(Number);
    const date = new Date(year, monthNum - 1, 1);
    date.setMonth(date.getMonth() - 1);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  };

  const previousMonth = getPreviousMonth(currentMonth);
  
  // Function to fetch active members for the month
  const fetchMembers = async () => {
    try {
      const membersRef = collection(db, "members");
      const querySnapshot = await getDocs(membersRef);
      const allMembers = querySnapshot.docs.map(doc => ({ memberId: doc.id, ...doc.data() }));
      
      // Filter for active members in the previous month
      const previousMonthDate = new Date(previousMonth + "-01");
      const activeMembers = allMembers.filter((member) => {
        if (!member.activeFrom) return false;
        const activeFromDate = new Date(member.activeFrom + "-01");
        if (activeFromDate > previousMonthDate) return false;
        if (member.archiveFrom) {
          const archiveFromDate = new Date(member.archiveFrom + "-01");
          return previousMonthDate < archiveFromDate;
        }
        return true;
      });
      
      setMembers(activeMembers);
    } catch (error) {
      console.error("Error fetching members:", error);
      setError("Failed to load member data.");
    }
  };
  
  // Function to fetch carryforward data
  const fetchCarryforwardData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch members first
      await fetchMembers();
      
      // Fetch carryforward data
      const carryforwardRef = collection(db, "carryforwards");
      const snapshot = await getDocs(query(carryforwardRef, where("month", "==", previousMonth)));
      
      if (!snapshot.empty) {
        const data = snapshot.docs[0].data();
        setCarryforwardData(data.memberDetails || []);
        setMealCounts({ previous: data.mealCounts || {} });
        setMealRate({ previous: data.mealRate || 'N/A' });
        setTotalGroceries({ previous: data.totalGroceries || 0 });
        setTotalMeals({ previous: data.totalMeals || 0 });
      } else {
        // No data found
        setCarryforwardData([]);
        setMealCounts({ previous: {} });
        setMealRate({ previous: 'N/A' });
        setTotalGroceries({ previous: 0 });
        setTotalMeals({ previous: 0 });
      }
    } catch (error) {
      console.error("Error fetching carryforward data:", error);
      setError("Failed to load carryforward data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle highlight effect every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setIsHighlighted(prev => !prev);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Subtle floating animation
  useEffect(() => {
    const animatePosition = () => {
      const offsets = [
        { top: -2, left: 0 },
        { top: -1, left: 1 },
        { top: 0, left: 2 },
        { top: 1, left: 1 },
        { top: 2, left: 0 },
        { top: 1, left: -1 },
        { top: 0, left: -2 },
        { top: -1, left: -1 }
      ];
      
      let index = 0;
      const interval = setInterval(() => {
        setAnimationOffset(offsets[index]);
        index = (index + 1) % offsets.length;
      }, 500);

      return () => clearInterval(interval);
    };

    animatePosition();
  }, []);

  // Fetch carryforward data when dialog opens
  useEffect(() => {
    if (isDialogOpen) {
      fetchCarryforwardData();
    }
  }, [isDialogOpen, previousMonth]);

  if (!isVisible) return null;

  return (
    <>
      <button
        onClick={() => setIsDialogOpen(true)}
        className={cn(
          'flex items-center justify-center gap-2',
          'px-3 py-2 rounded-full shadow-lg',
          'hover:scale-105 group transition-all duration-300',
          'text-sm font-medium whitespace-nowrap',
          isHighlighted ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white' : 'bg-white text-blue-600',
          isHighlighted ? 'ring-2 ring-blue-300 shadow-xl' : 'ring-1 ring-gray-200'
        )}
        style={{
          transform: `translate(${animationOffset.left}px, ${animationOffset.top}px)`
        }}
      >
        <TrendingUp className="h-4 w-4" />
        <span>Carryforward</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsVisible(false);
          }}
          className="ml-1 p-1 rounded-full hover:bg-gray-100/50 text-current opacity-60 hover:opacity-100"
        >
          <X className="h-3 w-3" />
        </button>
      </button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl overflow-y-auto h-auto md:h-auto landscape:h-[85vh] landscape:max-h-[85vh] sm:landscape:h-[95vh] sm:landscape:max-h-[95vh]">
          <div className="h-full max-h-[85vh] overflow-auto">
            {isLoading ? (
              <div className="space-y-6 p-6">
                {/* Announcement skeleton */}
                <div className="space-y-4">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                {/* Table skeleton */}
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            ) : error ? (
              <div className="text-center text-red-500 p-6">
                <p>{error}</p>
                <Button 
                  onClick={fetchCarryforwardData} 
                  className="mt-4 bg-green-500 hover:bg-green-600 text-white"
                >
                  Try Again
                </Button>
              </div>
            ) : (
              <CarryforwardSection
                members={members}
                month={currentMonth}
                carryforwardData={carryforwardData}
                mealCounts={mealCounts}
                mealRate={mealRate}
                totalGroceries={totalGroceries}
                totalMeals={totalMeals}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FloatingCarryforwardButton;
