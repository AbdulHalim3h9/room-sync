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
import SingleMonthYearPicker from "./SingleMonthYearPicker";
import { db } from "@/firebase";
import { doc, getDoc, collection, getDocs, query, orderBy, limit, setDoc, serverTimestamp } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import StatusCard from "./dashboard/status-card";
import { MembersContext } from "@/contexts/MembersContext";
import { MonthContext } from "@/contexts/MonthContext";
import { format, formatDistance } from "date-fns";
import { Activity, Clock, DollarSign, Utensils, ShoppingBag, Receipt, BarChart3, Home } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CarryforwardTable from "./CarryforwardTable";

const CustomizedDot = (props) => {
  const { cx, cy, value, payload } = props;
  const difference = payload.given - payload.eaten;
  const color = difference > 0 ? "hsl(var(--chart-2))" : "hsl(var(--chart-1))";

  return (
    <svg
      x={cx - 10}
      y={cy - 10}
      width={20}
      height={20}
      fill={color}
      viewBox="0 0 1024 1024"
      className="transition-transform hover:scale-125"
    >
      <path
        d={
          difference > 0
            ? "M512 1009.984c-274.912 0-497.76-222.848-497.76-497.76s222.848-497.76 497.76-497.76c274.912 0 497.76 222.848 497.76 497.76s-222.848 497.76-497.76 497.76zM340.768 295.936c-39.488 0-71.52 32.8-71.52 73.248s32.032 73.248 71.52 73.248c39.488 0 71.52-32.8 71.52-73.248s-32.032-73.248-71.52-73.248zM686.176 296.704c-39.488 0-71.52 32.8-71.52 73.248s32.032 73.248 71.52 73.248c39.488 0 71.52-32.8 71.52-73.248s-32.032-73.248-71.52-73.248zM772.928 555.392c-18.752-8.864-40.928-0.576-49.632 18.528-40.224 88.576-120.256 143.552-208.832 143.552-85.952 0-164.864-52.64-205.952-137.376-9.184-18.912-31.648-26.592-50.08-17.28-18.464 9.408-21.216 21.472-15.936 32.64 52.8 111.424 155.232 186.784 269.76 186.784 117.984 0 217.12-70.944 269.76-186.784 8.672-19.136 9.568-31.2-9.12-40.096z"
            : "M517.12 53.248q95.232 0 179.2 36.352t145.92 98.304 98.304 145.92 36.352 179.2-36.352 179.2-98.304 145.92-145.92 98.304-179.2 36.352-179.2-36.352-145.92-98.304-98.304-145.92-36.352-179.2 36.352-179.2 98.304-145.92 145.92-98.304 179.2-36.352zM663.552 261.12q-15.36 0-28.16 6.656t-23.04 18.432-15.872 27.648-5.632 33.28q0 35.84 21.504 61.44t51.2 25.6 51.2-25.6 21.504-61.44q0-17.408-5.632-33.28t-15.872-27.648-23.04-18.432-28.16-6.656zM373.76 261.12q-29.696 0-50.688 25.088t-20.992 60.928 20.992 61.44 50.688 25.6 50.176-25.6 20.48-61.44-20.48-60.928-50.176-25.088zM520.192 602.112q-51.2 0-97.28 9.728t-82.944 27.648-62.464 41.472-35.84 51.2q-1.024 1.024-1.024 2.048q-1.024 3.072-1.024 8.704t2.56 11.776 7.168 11.264 12.8 6.144q25.6-27.648 62.464-50.176 31.744-19.456 79.36-35.328t114.176-15.872q67.584 0 116.736 15.872t81.92 35.328q37.888 22.528 63.488 50.176 17.408-5.12 19.968-18.944t0.512-18.944-3.072-7.168-1.024-3.072q-26.624-55.296-100.352-88.576t-176.128-33.28z"
        }
      />
    </svg>
  );
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const difference = payload[0].value - payload[1]?.value || payload[0].value;
    return (
      <div className="bg-background p-4 border rounded-lg shadow-lg">
        <p className="font-bold mb-2">{label}</p>
        <div className="space-y-1">
          {payload.map((entry, index) => (
            <div key={index} className={`flex items-center gap-2 ${entry.dataKey === "given" ? "text-green-500" : entry.dataKey === "eaten" ? "text-yellow-500" : "text-blue-500"}`}>
              <span className={`w-3 h-3 rounded-full bg-${entry.dataKey === "given" ? "green" : entry.dataKey === "eaten" ? "yellow" : "blue"}-500`}></span>
              <span>{entry.name}: {entry.value.toFixed(2)} {entry.dataKey === "given" || entry.dataKey === "eaten" ? "tk" : "%"}</span>
            </div>
          ))}
          {(payload.length > 1 && difference !== payload[0].value) && (
            <div className={`flex items-center gap-2 ${difference >= 0 ? "text-green-500" : "text-red-500"}`}>
              <span className={`w-3 h-3 rounded-full ${difference >= 0 ? "bg-green-500" : "bg-red-500"}`}></span>
              <span>Balance: {difference.toFixed(2)} tk</span>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
};

const PieTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background p-4 border rounded-lg shadow-lg">
        <p className="font-bold mb-2">{label}</p>
        <div className="flex items-center gap-2 text-blue-500">
          <span className="w-3 h-3 rounded-full bg-blue-500"></span>
          <span>{payload[0].name}: {payload[0].value.toFixed(2)}%</span>
        </div>
      </div>
    );
  }
  return null;
};

// Function to generate random contrasting colors
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

// Generate colors for members
const generateMemberColors = (members) => {
  const colors = {};
  members.forEach(member => {
    colors[member.memberName] = generateContrastingColor();
  });
  return colors;
};

export default function ResponsiveChartWrapper() {
  const { members, loading: membersLoading, error: membersError } = React.useContext(MembersContext);
  const memberColors = useMemo(() => generateMemberColors(members), [members]);
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
  const [activeTab, setActiveTab] = useState("realtime");
  const [showUpdateDetails, setShowUpdateDetails] = useState(false);
  const [latestUpdate, setLatestUpdate] = useState({ type: null, timestamp: null });
  const [memberPresence, setMemberPresence] = useState({});
  const [loadingPresence, setLoadingPresence] = useState(true);
  const [showMemberDetails, setShowMemberDetails] = useState(false);

  // Calculate previous month
  const getPreviousMonth = (month) => {
    const [year, monthNum] = month.split("-").map(Number);
    const date = new Date(year, monthNum - 1, 1);
    date.setMonth(date.getMonth() - 1);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  };

  const previousMonth = getPreviousMonth(month);

  // Format month for display
  const formatMonthDisplay = (monthStr) => {
    const [year, monthNum] = monthStr.split("-").map(Number);
    return format(new Date(year, monthNum - 1, 1), "MMMM yyyy");
  };

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
        presenceData[doc.id] = data;
      });
      
      setMemberPresence(presenceData);
    } catch (error) {
      console.error("Error fetching member presence:", error);
    } finally {
      setLoadingPresence(false);
    }
  }, []);

  useEffect(() => {
    fetchMemberPresence();
  }, [fetchMemberPresence]);

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

        // Generate a color map for consistent colors across both pie charts
        const pieColorMap = {};
        realtimeChartData.forEach((item) => {
          pieColorMap[item.name] = generateContrastingColor();
        });

        // Pie chart data for contributions
        const contributionPieData = realtimeChartData.map((item) => ({
          name: item.name,
          value: totalContribution > 0 ? parseFloat((item.given / totalContribution * 100).toFixed(2)) : 0,
          color: pieColorMap[item.name],
        }));

        // Pie chart data for consumption
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

        const updateTypes = [
          { type: "Meal Fund", timestamp: mealFundTimestamp },
          { type: "Meal Count", timestamp: mealCountTimestamp },
          { type: "Grocery", timestamp: groceryTimestamp },
          { type: "Payables", timestamp: payablesTimestamp },
        ];

        let latestType = null;
        let latestTime = null;

        updateTypes.forEach((update) => {
          if (!update.timestamp) return;
          const updateTime = update.timestamp.toDate ? update.timestamp.toDate() : new Date(update.timestamp);
          if (!latestTime || updateTime > latestTime) {
            latestType = update.type;
            latestTime = updateTime;
          }
        });

        if (latestType && latestTime) {
          setLatestUpdate({ type: latestType, timestamp: latestTime });
        }
      } catch (error) {
        console.error("Error fetching last updates:", error);
      }
    };

    fetchLastUpdates();
  }, []);

  const dueMembers = realtimeData.filter((item) => item.given - item.eaten <= 0);

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "Never updated";
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return formatDistance(date, new Date(), { addSuffix: true });
    } catch (error) {
      return "Unknown";
    }
  };

  const formatExactTimestamp = (timestamp) => {
    if (!timestamp) return "Never updated";
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return format(date, "MMM d, yyyy 'at' h:mm a");
    } catch (error) {
      return "Unknown";
    }
  };

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

  const hasPieData = pieContributionData.some(item => item.value > 0) || pieConsumptionData.some(item => item.value > 0);

  return (
    <div className="container mx-auto px-6 pt-4 pb-6 max-w-7xl">
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm py-3 -mx-6 px-6 mb-4 border-b">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg sm:text-xl font-medium">
              Summary
            </CardTitle>
          </div>
          <div className="flex justify-center sm:justify-end">
            <SingleMonthYearPicker
              value={month}
              onChange={setMonth}
              collections={["contributionConsumption", "individualMeals"]}
            />
          </div>
        </div>
      </div>

      <Card className="mb-6 shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 transition-colors duration-300">
          <CardHeader className="py-2 px-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Home className="h-5 w-5 text-emerald-600" />
                {loadingPresence ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-500"></div>
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    {activeMembersCurrent.map((member) => {
                      const presenceData = memberPresence[member.memberId];
                      const statusFound = presenceData !== undefined;
                      const isPresent = statusFound ? presenceData.isPresent : false;

                      return (
                        <div
                          key={member.memberId}
                          className="relative cursor-pointer hover:scale-110 transition-transform duration-200"
                          onClick={() => toggleMemberPresence(member.memberId, !isPresent)}
                          title={`${member.shortname || member.memberName} is ${statusFound ? (isPresent ? 'in apartment' : 'away') : 'unknown'}`}
                        >
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center ${statusFound ? (isPresent ? 'bg-emerald-100' : 'bg-gray-100') : 'bg-blue-100'} border ${statusFound ? (isPresent ? 'border-emerald-200' : 'border-gray-200') : 'border-blue-200'}`}>
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
                          <span
                            className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${statusFound ? (isPresent ? 'bg-emerald-500' : 'bg-red-500') : 'bg-blue-500'}`}
                          ></span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMemberDetails((prev) => !prev)}
                className="h-7 w-7 p-0 rounded-full"
              >
                {showMemberDetails ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                )}
              </Button>
            </div>
          </CardHeader>
          {showMemberDetails && (
            <CardContent className="pt-3 pb-2 animate-in fade-in-50 duration-300">
              <CardTitle className="text-lg font-medium mb-3">Who's in the Apartment?</CardTitle>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                {activeMembersCurrent.map((member) => {
                  const presenceData = memberPresence[member.memberId];
                  const statusFound = presenceData !== undefined;
                  const isPresent = statusFound ? presenceData.isPresent : false;

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
                            {statusFound ? (isPresent ? 'In Apartment' : 'Away') : 'Status not found'}
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

      {latestUpdate.type && (
        <Card className="mb-6 shadow-lg overflow-hidden">
          <div className={`bg-gradient-to-r ${showUpdateDetails ? "from-blue-50 to-indigo-50" : "from-blue-100 to-indigo-100"} transition-colors duration-300`}>
            <CardHeader className="pb-2 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-lg font-medium">Latest Update</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowUpdateDetails((prev) => !prev)}
                  className="h-8 px-3 text-xs font-medium"
                >
                  {showUpdateDetails ? "Hide Details" : "Show Details"}
                </Button>
              </div>
              <CardDescription>
                <span className="font-medium">{latestUpdate.type}</span> was updated {formatTimestamp(latestUpdate.timestamp)}
              </CardDescription>
            </CardHeader>
            {showUpdateDetails && (
              <CardContent className="pt-4 animate-in fade-in-50 duration-300">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-100 flex items-start gap-3">
                    <div className="p-2 bg-blue-100 text-blue-700 rounded-full">
                      <DollarSign className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-700">Meal Fund</h3>
                      <p className="text-xs text-gray-500">{formatTimestamp(lastUpdates.mealFund)}</p>
                      <p className="text-xs text-blue-600 mt-1">{formatExactTimestamp(lastUpdates.mealFund)}</p>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-purple-100 flex items-start gap-3">
                    <div className="p-2 bg-purple-100 text-purple-700 rounded-full">
                      <Utensils className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-700">Meal Count</h3>
                      <p className="text-xs text-gray-500">{formatTimestamp(lastUpdates.mealCount)}</p>
                      <p className="text-xs text-purple-600 mt-1">{formatExactTimestamp(lastUpdates.mealCount)}</p>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-green-100 flex items-start gap-3">
                    <div className="p-2 bg-green-100 text-green-700 rounded-full">
                      <ShoppingBag className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-700">Grocery</h3>
                      <p className="text-xs text-gray-500">{formatTimestamp(lastUpdates.grocery)}</p>
                      <p className="text-xs text-green-600 mt-1">{formatExactTimestamp(lastUpdates.grocery)}</p>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-amber-100 flex items-start gap-3">
                    <div className="p-2 bg-amber-100 text-amber-700 rounded-full">
                      <Receipt className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-700">Payables</h3>
                      <p className="text-xs text-gray-500">{formatTimestamp(lastUpdates.payables)}</p>
                      <p className="text-xs text-amber-600 mt-1">{formatExactTimestamp(lastUpdates.payables)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            )}
          </div>
        </Card>
      )}

      <Card className="mb-8 shadow-lg overflow-hidden border-0 bg-gradient-to-br from-white to-gray-50">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="px-6 pt-4 border-b">
            <TabsList className="grid w-full grid-cols-2 h-10">
              <TabsTrigger value="realtime" className="text-sm">
                Realtime Summary
              </TabsTrigger>
              <TabsTrigger value="carryforward" className="text-sm">
                Carryforward
              </TabsTrigger>
            </TabsList>
          </div>

          <CardContent className="p-4">
            <TabsContent value="realtime" className="mt-0">
              <Tabs defaultValue="chart" className="w-full">
                <TabsList className="grid w-full grid-cols-3 h-10 mb-4">
                  <TabsTrigger value="chart" className="text-sm">Line Chart</TabsTrigger>
                  <TabsTrigger value="bar" className="text-sm">Bar Chart</TabsTrigger>
                  <TabsTrigger value="pie" className="text-sm">Pie Chart</TabsTrigger>
                </TabsList>
                <TabsContent value="chart" className="mt-0">
                  <div className="w-full min-h-[400px]">
                    <ResponsiveContainer width="100%" height={400}>
                      <LineChart
                        data={realtimeData}
                        margin={{ top: 20, right: 10, left: 10, bottom: 80 }}
                      >
                        <defs>
                          <linearGradient id="colorGiven" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorEaten" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                        <XAxis
                          dataKey="name"
                          angle={-45}
                          textAnchor="end"
                          height={80}
                          tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }}
                          tickMargin={30}
                          interval={0}
                        />
                        <YAxis
                          tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }}
                          tickFormatter={(value) => `${value} tk`}
                          width={60}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                          wrapperStyle={{ paddingTop: "20px" }}
                          formatter={(value) => <span className="text-sm font-medium">{value}</span>}
                        />
                        <Line
                          type="monotone"
                          dataKey="given"
                          stroke="#3b82f6"
                          strokeWidth={2}
                          dot={<CustomizedDot />}
                          name="Contribution"
                          activeDot={{ r: 8 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="eaten"
                          stroke="#f59e0b"
                          strokeWidth={2}
                          name="Consumption"
                          activeDot={{ r: 8 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </TabsContent>
                <TabsContent value="bar" className="mt-0">
                  <div className="w-full min-h-[400px]">
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart
                        data={realtimeData}
                        margin={{ top: 20, right: 10, left: 10, bottom: 80 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f1" />
                        <XAxis
                          dataKey="name"
                          angle={-45}
                          textAnchor="end"
                          height={80}
                          tick={{ fill: "#333", fontSize: 12 }}
                          tickMargin={30}
                          interval={0}
                        />
                        <YAxis
                          tick={{ fill: "#333", fontSize: 12 }}
                          tickFormatter={(value) => `${value} tk`}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Bar
                          dataKey="given"
                          name="Contribution"
                          fill="#3b82f6"
                          radius={[4, 4, 0, 0]}
                        />
                        <Bar
                          dataKey="eaten"
                          name="Consumption"
                          fill="#f59e0b"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </TabsContent>
                <TabsContent value="pie" className="mt-0">
                  <div className="w-full">
                    {hasPieData ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="min-h-[250px] flex flex-col items-center">
                          <h3 className="text-sm font-medium mb-2">Contribution (%)</h3>
                          <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                              <Pie
                                data={pieContributionData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                label={({ name, value }) => `${name}: ${value}%`}
                                labelLine
                              >
                                {pieContributionData.map((entry, index) => (
                                  <Cell
                                    key={`contribution-${entry.name}-${index}`}
                                    fill={entry.color}
                                  />
                                ))}
                              </Pie>
                              <Tooltip content={<PieTooltip />} />
                              <Legend
                                wrapperStyle={{ paddingTop: "10px" }}
                                formatter={(value) => <span className="text-sm font-medium">{value}</span>}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="min-h-[250px] flex flex-col items-center">
                          <h3 className="text-sm font-medium mb-2">Consumption (%)</h3>
                          <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                              <Pie
                                data={pieConsumptionData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                label={({ name, value }) => `${name}: ${value}%`}
                                labelLine
                              >
                                {pieConsumptionData.map((entry, index) => (
                                  <Cell
                                    key={`consumption-${entry.name}-${index}`}
                                    fill={entry.color}
                                  />
                                ))}
                              </Pie>
                              <Tooltip content={<PieTooltip />} />
                              <Legend
                                wrapperStyle={{ paddingTop: "10px" }}
                                formatter={(value) => <span className="text-sm font-medium">{value}</span>}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center min-h-[200px] text-gray-500">
                        No contribution or consumption data available for this month
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
              <div className="mt-4">
                <StatusCard dueMembers={dueMembers} mealRate={mealRate.current} />
              </div>
            </TabsContent>

            <TabsContent value="carryforward" className="mt-0">
              <CarryforwardTable
                members={activeMembersPrevious}
                month={month}
                carryforwardData={carryforwardData}
                mealCounts={mealCounts}
                mealRate={mealRate}
                totalGroceries={totalGroceries}
                totalMeals={totalMeals}
              />
            </TabsContent>
          </CardContent>
          <CardFooter className="bg-gray-50 border-t py-3 text-xs text-gray-500">
            <div className="flex items-center gap-1 ml-auto">
              <Clock className="h-3 w-3" />
              <span>Last updated: {formatTimestamp(lastUpdates.mealFund)}</span>
            </div>
          </CardFooter>
        </Tabs>
      </Card>
    </div>
  );
}