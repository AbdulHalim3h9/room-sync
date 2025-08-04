"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { db } from "@/firebase";
import { doc, getDoc, collection, getDocs, setDoc, serverTimestamp } from "firebase/firestore";
import { MembersContext } from "@/contexts/MembersContext";
import { MonthContext } from "@/contexts/MonthContext";
import Header from "./Header";
import MemberPresence from "./MemberPresence";
import ChartTabs from "./ChartTabs";
import { Skeleton } from "@/components/ui/skeleton";
import LastUpdated from "./LastUpdated";

export default function ResponsiveChartWrapper() {
  const { members, loading: membersLoading, error: membersError } = React.useContext(MembersContext);
  const { month, setMonth } = React.useContext(MonthContext);
  const [realtimeData, setRealtimeData] = useState([]);
  const [pieContributionData, setPieContributionData] = useState([]);
  const [pieConsumptionData, setPieConsumptionData] = useState([]);
  const [mealRate, setMealRate] = useState({ current: null });
  const [lastUpdated, setLastUpdated] = useState(null);
  const [loading, setLoading] = useState(true);
  const [memberPresence, setMemberPresence] = useState({});
  const [loadingPresence, setLoadingPresence] = useState(true);

  // Filter active members
  const getActiveMembers = useCallback((targetMonth) => {
    if (membersLoading || !members.length) return [];
    
    const selectedMonthDate = new Date(targetMonth + "-01");
    
    return members.filter((member) => {
      if (!member.activeFrom) return false;
      
      const activeFromDate = new Date(member.activeFrom + "-01");
      if (activeFromDate > selectedMonthDate) return false;
      
      if (member.archiveFrom) {
        const archiveFromDate = new Date(member.archiveFrom + "-01");
        return selectedMonthDate < archiveFromDate;
      }
      
      return true;
    });
  }, [members, membersLoading]);

  const activeMembersCurrent = useMemo(() => getActiveMembers(month), [month, getActiveMembers]);

  // Map memberId to memberName
  const memberIdToName = useMemo(() => {
    const map = {};
    members.forEach((member) => {
      map[member.memberId] = member.memberName;
    });
    return map;
  }, [members]);

  // Fetch member presence
  const fetchMemberPresence = useCallback(async () => {
    setLoadingPresence(true);
    try {
      const presenceRef = collection(db, "memberPresence");
      const querySnapshot = await getDocs(presenceRef);
      
      const presenceData = {};
      querySnapshot.docs.forEach((doc) => {
        const data = doc.data();
        if (data.memberId && memberIdToName[data.memberId]) {
          presenceData[data.memberId] = {
            isPresent: data.isPresent,
            lastUpdated: data.lastUpdated,
          };
        }
      });
      setMemberPresence(presenceData);
    } catch (error) {
      console.error("Error fetching member presence:", error);
    } finally {
      setLoadingPresence(false);
    }
  }, [memberIdToName]);

  useEffect(() => {
    fetchMemberPresence();
  }, [fetchMemberPresence, members, activeMembersCurrent]);

  // Toggle member presence
  const toggleMemberPresence = async (memberId, isPresent) => {
    try {
      const presenceRef = doc(db, "memberPresence", memberId);
      await setDoc(presenceRef, {
        isPresent,
        lastUpdated: serverTimestamp(),
      }, { merge: true });
      
      setMemberPresence((prev) => ({
        ...prev,
        [memberId]: {
          ...prev[memberId],
          isPresent,
          lastUpdated: new Date(),
        },
      }));
    } catch (error) {
      console.error("Error updating member presence:", error);
    }
  };

  // Fetch meal rate, totals, and lastUpdated timestamp
  useEffect(() => {
    const fetchMealRate = async () => {
      setLoading(true);
      try {
        const currentDocRef = doc(db, "mealSummaries", month);
        const currentDocSnap = await getDoc(currentDocRef);

        if (currentDocSnap.exists()) {
          const data = currentDocSnap.data();
          const { totalSpendings, totalMealsAllMembers } = data;
          setMealRate((prev) => ({ ...prev, current: totalSpendings && totalMealsAllMembers && totalMealsAllMembers > 0 ? (totalSpendings / totalMealsAllMembers).toFixed(2) : "N/A" }));
          setLastUpdated(data.lastUpdated || null); // Fetch lastUpdated timestamp
        } else {
          setMealRate((prev) => ({ ...prev, current: "N/A" }));
          setLastUpdated(null);
        }
      } catch (error) {
        console.error("Error fetching meal summaries:", error);
        setMealRate({ current: "Error" });
        setLastUpdated(null);
      } finally {
        setLoading(false);
      }
    };

    fetchMealRate();
  }, [month]);

  // Function to generate contrasting colors
  const generateContrastingColor = () => {
    try {
      const hue = Math.floor(Math.random() * 360);
      const saturation = Math.floor(Math.random() * 20 + 70);
      const lightness = Math.floor(Math.random() * 20 + 40);

      const hslToRgb = (h, s, l) => {
        s /= 100;
        l /= 100;
        const k = n => (n + h / 30) % 12;
        const a = s * Math.min(l, 1 - l);
        const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
        return `rgb(${Math.round(f(0) * 255)}, ${Math.round(f(8) * 255)}, ${Math.round(f(4) * 255)})`;
      };

      return hslToRgb(hue, saturation, lightness);
    } catch (error) {
      console.error('Error in generateContrastingColor:', error);
      // Fallback to a default color if there's an error
      return 'rgb(100, 100, 100)';
    }
  };

  // Fetch contribution/consumption and meal count data
  useEffect(() => {
    const fetchData = async () => {
      console.log('Starting to fetch data for month:', month);
      setLoading(true);
      try {
        const contribConsumpRef = collection(db, "contributionConsumption");
        const contribSnapshot = await getDocs(contribConsumpRef);

        const currentContribData = {};
        contribSnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.month === month) {
            currentContribData[data.member] = {
              contribution: data.contribution || 0,
              consumption: data.consumption || 0,
            };
          }
        });

        const currentMealsDocRef = doc(db, "individualMeals", month);
        const currentMealsDocSnap = await getDoc(currentMealsDocRef);
        const currentMealCountData = {};

        if (currentMealsDocSnap.exists()) {
          const data = currentMealsDocSnap.data().mealCounts || {};
          Object.entries(data).forEach(([memberId, meals]) => {
            const totalEntry = meals.find((meal) => meal.startsWith("Total"));
            if (totalEntry) {
              const totalCount = parseInt(totalEntry.split(" ")[1]) || 0;
              const memberName = memberIdToName[memberId];
              if (memberName) {
                currentMealCountData[memberName] = totalCount;
              }
            }
          });
        }

        const realtimeChartData = activeMembersCurrent.map((member) => ({
          name: member.shortname || member.memberName,
          given: currentContribData[member.memberName]?.contribution || 0,
          eaten: currentContribData[member.memberName]?.consumption || 0,
        }));

        const totalContribution = realtimeChartData.reduce((sum, item) => sum + item.given, 0);
        const totalConsumption = realtimeChartData.reduce((sum, item) => sum + item.eaten, 0);

        const pieColorMap = {};
        realtimeChartData.forEach((item) => {
          pieColorMap[item.name] = generateContrastingColor();
        });

        const contributionPieData = realtimeChartData.map((item) => ({
          name: item.name,
          value: totalContribution > 0 ? parseFloat((item.given / totalContribution * 100).toFixed(2)) : 0,
          color: pieColorMap[item.name],
        }));

        const consumptionPieData = realtimeChartData.map((item) => ({
          name: item.name,
          value: totalConsumption > 0 ? parseFloat((item.eaten / totalConsumption * 100).toFixed(2)) : 0,
          color: pieColorMap[item.name],
        }));

        console.log('Fetched data:', {
          realtimeChartData,
          contributionPieData,
          consumptionPieData
        });
        
        setRealtimeData(realtimeChartData);
        setPieContributionData(contributionPieData);
        setPieConsumptionData(consumptionPieData);
      } catch (error) {
        console.error("Error fetching data:", error);
        setRealtimeData([]);
        setPieContributionData([]);
        setPieConsumptionData([]);
      } finally {
        setLoading(false);
      }
    };

    if (activeMembersCurrent.length > 0) {
      fetchData();
    } else {
      setRealtimeData([]);
      setPieContributionData([]);
      setPieConsumptionData([]);
      setLoading(false);
    }
  }, [month, activeMembersCurrent, memberIdToName]);

  const dueMembers = realtimeData.filter((item) => item.given - item.eaten <= 0);

  if (loading || membersLoading) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading chart data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (membersError) {
    return (
      <div className="container mx-auto p-6 max-w-7xl text-center text-red-500">
        {membersError}
      </div>
    );
  }



  console.log('Rendering ResponsiveChartWrapper with state:', {
    loading,
    membersLoading,
    realtimeData,
    pieContributionData,
    pieConsumptionData,
    activeMembersCurrent
  });

  return (
    <div className="container mx-auto px-6 pt-4 pb-6 max-w-7xl">
      <MemberPresence
        activeMembers={activeMembersCurrent}
        memberPresence={memberPresence}
        setMemberPresence={setMemberPresence}
        loadingPresence={loadingPresence}
        setLoadingPresence={setLoadingPresence}
        toggleMemberPresence={toggleMemberPresence}
      />
      <Header />
      <ChartTabs
        realtimeData={realtimeData}
        pieContributionData={pieContributionData}
        pieConsumptionData={pieConsumptionData}
        dueMembers={dueMembers}
        mealRate={mealRate}
        lastUpdated={lastUpdated}
      />
    </div>
  );
}