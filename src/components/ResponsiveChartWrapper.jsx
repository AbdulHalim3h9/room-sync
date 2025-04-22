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
import { doc, getDoc, collection, getDocs, query, orderBy, limit, setDoc, serverTimestamp } from "firebase/firestore";
import { MembersContext } from "@/contexts/MembersContext";
import { MonthContext } from "@/contexts/MonthContext";
import Header from "./Header";
import MemberPresence from "./MemberPresence";
import LatestUpdate from "./LatestUpdate";
import ChartTabs from "./ChartTabs";
import { Skeleton } from "@/components/ui/skeleton";

export default function ResponsiveChartWrapper() {
  const { members, loading: membersLoading, error: membersError } = React.useContext(MembersContext);
  const { month, setMonth } = React.useContext(MonthContext);
  const [realtimeData, setRealtimeData] = useState([]);
  const [carryforwardData, setCarryforwardData] = useState([]);
  const [pieContributionData, setPieContributionData] = useState([]);
  const [pieConsumptionData, setPieConsumptionData] = useState([]);
  const [mealRate, setMealRate] = useState({ current: null, previous: null });
  const [mealCounts, setMealCounts] = useState({ current: {}, previous: {} });
  const [totalGroceries, setTotalGroceries] = useState({ current: null, previous: null });
  const [totalMeals, setTotalMeals] = useState({ current: null, previous: null });
  const [loading, setLoading] = useState(true);
  const [lastUpdates, setLastUpdates] = useState({
    mealFund: null,
    mealCount: null,
    grocery: null,
    payables: null,
  });
  const [memberPresence, setMemberPresence] = useState({});
  const [loadingPresence, setLoadingPresence] = useState(true);

  // Calculate previous month
  const getPreviousMonth = (month) => {
    const [year, monthNum] = month.split("-").map(Number);
    const date = new Date(year, monthNum - 1, 1);
    date.setMonth(date.getMonth() - 1);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  };

  const previousMonth = getPreviousMonth(month);

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
  const activeMembersPrevious = useMemo(() => getActiveMembers(previousMonth), [previousMonth, getActiveMembers]);

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

  // Fetch meal rate and totals
  useEffect(() => {
    const fetchMealRate = async () => {
      setLoading(true);
      try {
        const currentDocRef = doc(db, "mealSummaries", month);
        const currentDocSnap = await getDoc(currentDocRef);

        if (currentDocSnap.exists()) {
          const { totalSpendings, totalMealsAllMembers } = currentDocSnap.data();
          setTotalGroceries((prev) => ({ ...prev, current: totalSpendings || 0 }));
          setTotalMeals((prev) => ({ ...prev, current: totalMealsAllMembers || 0 }));
          if (totalSpendings && totalMealsAllMembers && totalMealsAllMembers > 0) {
            const rate = totalSpendings / totalMealsAllMembers;
            setMealRate((prev) => ({ ...prev, current: rate.toFixed(2) }));
          } else {
            setMealRate((prev) => ({ ...prev, current: "N/A" }));
          }
        } else {
          setMealRate((prev) => ({ ...prev, current: "N/A" }));
          setTotalGroceries((prev) => ({ ...prev, current: 0 }));
          setTotalMeals((prev) => ({ ...prev, current: 0 }));
        }

        const previousDocRef = doc(db, "mealSummaries", previousMonth);
        const previousDocSnap = await getDoc(previousDocRef);

        if (previousDocSnap.exists()) {
          const { totalSpendings, totalMealsAllMembers } = previousDocSnap.data();
          setTotalGroceries((prev) => ({ ...prev, previous: totalSpendings || 0 }));
          setTotalMeals((prev) => ({ ...prev, previous: totalMealsAllMembers || 0 }));
          if (totalSpendings && totalMealsAllMembers && totalMealsAllMembers > 0) {
            const rate = totalSpendings / totalMealsAllMembers;
            setMealRate((prev) => ({ ...prev, previous: rate.toFixed(2) }));
          } else {
            setMealRate((prev) => ({ ...prev, previous: "N/A" }));
            setTotalGroceries((prev) => ({ ...prev, previous: 0 }));
            setTotalMeals((prev) => ({ ...prev, previous: 0 }));
          }
        } else {
          setMealRate((prev) => ({ ...prev, previous: "N/A" }));
          setTotalGroceries((prev) => ({ ...prev, previous: 0 }));
          setTotalMeals((prev) => ({ ...prev, previous: 0 }));
        }
      } catch (error) {
        console.error("Error fetching meal summaries:", error);
        setMealRate({ current: "Error", previous: "Error" });
        setTotalGroceries({ current: null, previous: null });
        setTotalMeals({ current: null, previous: null });
      } finally {
        setLoading(false);
      }
    };

    fetchMealRate();
  }, [month, previousMonth]);

  // Fetch contribution/consumption and meal count data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const contribConsumpRef = collection(db, "contributionConsumption");
        const contribSnapshot = await getDocs(contribConsumpRef);

        const currentContribData = {};
        const previousContribData = {};
        contribSnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.month === month) {
            currentContribData[data.member] = {
              contribution: data.contribution || 0,
              consumption: data.consumption || 0,
            };
          } else if (data.month === previousMonth) {
            previousContribData[data.member] = {
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

        const previousMealsDocRef = doc(db, "individualMeals", previousMonth);
        const previousMealsDocSnap = await getDoc(previousMealsDocRef);
        const previousMealCountData = {};

        if (previousMealsDocSnap.exists()) {
          const data = previousMealsDocSnap.data().mealCounts || {};
          Object.entries(data).forEach(([memberId, meals]) => {
            const totalEntry = meals.find((meal) => meal.startsWith("Total"));
            if (totalEntry) {
              const totalCount = parseInt(totalEntry.split(" ")[1]) || 0;
              const memberName = memberIdToName[memberId];
              if (memberName) {
                previousMealCountData[memberName] = totalCount;
              }
            }
          });
        }

        const realtimeChartData = activeMembersCurrent.map((member) => ({
          name: member.shortname || member.memberName,
          given: currentContribData[member.memberName]?.contribution || 0,
          eaten: currentContribData[member.memberName]?.consumption || 0,
        }));

        const carryforwardChartData = activeMembersPrevious.map((member) => ({
          name: member.shortname || member.memberName,
          given: previousContribData[member.memberName]?.contribution || 0,
          eaten: previousContribData[member.memberName]?.consumption || 0,
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

        setRealtimeData(realtimeChartData);
        setCarryforwardData(carryforwardChartData);
        setPieContributionData(contributionPieData);
        setPieConsumptionData(consumptionPieData);
        setMealCounts({
          current: currentMealCountData,
          previous: previousMealCountData,
        });
      } catch (error) {
        console.error("Error fetching data:", error);
        setRealtimeData([]);
        setCarryforwardData([]);
        setPieContributionData([]);
        setPieConsumptionData([]);
        setMealCounts({ current: {}, previous: {} });
      } finally {
        setLoading(false);
      }
    };

    if (activeMembersCurrent.length > 0 || activeMembersPrevious.length > 0) {
      fetchData();
    } else {
      setRealtimeData([]);
      setCarryforwardData([]);
      setPieContributionData([]);
      setPieConsumptionData([]);
      setMealCounts({ current: {}, previous: {} });
      setLoading(false);
    }
  }, [month, previousMonth, activeMembersCurrent, activeMembersPrevious, memberIdToName]);

  // Fetch last update timestamps
  useEffect(() => {
    const fetchLastUpdates = async () => {
      try {
        const mealFundQuery = query(collection(db, "mealFund"), orderBy("timestamp", "desc"), limit(1));
        const mealFundSnapshot = await getDocs(mealFundQuery);
        const mealFundTimestamp = !mealFundSnapshot.empty ? mealFundSnapshot.docs[0].data().timestamp : null;

        const mealCountQuery = query(collection(db, "mealCount"), orderBy("timestamp", "desc"), limit(1));
        const mealCountSnapshot = await getDocs(mealCountQuery);
        const mealCountTimestamp = !mealCountSnapshot.empty ? mealCountSnapshot.docs[0].data().timestamp : null;

        const groceryQuery = query(collection(db, "expenses"), orderBy("timestamp", "desc"), limit(1));
        const grocerySnapshot = await getDocs(groceryQuery);
        const groceryTimestamp = !grocerySnapshot.empty ? grocerySnapshot.docs[0].data().timestamp : null;

        const payablesQuery = query(collection(db, "payables"), orderBy("timestamp", "desc"), limit(1));
        const payablesSnapshot = await getDocs(payablesQuery);
        const payablesTimestamp = !payablesSnapshot.empty ? payablesSnapshot.docs[0].data().timestamp : null;

        const updates = {
          mealFund: mealFundTimestamp,
          mealCount: mealCountTimestamp,
          grocery: groceryTimestamp,
          payables: payablesTimestamp,
        };

        setLastUpdates(updates);
      } catch (error) {
        console.error("Error fetching last updates:", error);
      }
    };
    fetchLastUpdates();
  }, []);

  const dueMembers = realtimeData.filter((item) => item.given - item.eaten <= 0);

  if (loading || membersLoading) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <Skeleton className="h-8 w-48 mx-auto mb-8" />
        <div className="flex justify-end mb-8">
          <Skeleton className="h-10 w-48" />
        </div>
        <Skeleton className="h-[40vh] w-full mb-8" />
        <Skeleton className="h-24 w-full" />
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
      <Header month={month} setMonth={setMonth} />
      <LatestUpdate lastUpdates={lastUpdates} />
      <ChartTabs
        realtimeData={realtimeData}
        carryforwardData={carryforwardData}
        pieContributionData={pieContributionData}
        pieConsumptionData={pieConsumptionData}
        dueMembers={dueMembers}
        mealRate={mealRate}
        mealCounts={mealCounts}
        totalGroceries={totalGroceries}
        totalMeals={totalMeals}
        activeMembersPrevious={activeMembersPrevious}
        month={month}
        lastUpdates={lastUpdates}
      />
    </div>
  );
}

// Helper function for generating contrasting colors
const generateContrastingColor = () => {
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
};