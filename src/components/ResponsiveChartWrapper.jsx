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
  AreaChart,
  Area,
  BarChart,
  Bar,
} from "recharts";
import SingleMonthYearPicker from "./SingleMonthYearPicker";
import { db } from "@/firebase";
import { doc, getDoc, collection, getDocs, query, orderBy, limit, setDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import StatusCard from "./dashboard/status-card";
import { MembersContext } from "@/contexts/MembersContext";
import { MonthContext } from "@/contexts/MonthContext";
import AnnouncementBanner from "./AnnouncementBanner";
import { format, formatDistance } from "date-fns";
import { Activity, Clock, DollarSign, Utensils, ShoppingBag, Receipt, BarChart3, Home, MapPin, UserCheck, UserX } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
            : "M517.12 53.248q95.232 0 179.2 36.352t145.92 98.304 98.304 145.92 36.352 179.2-36.352 179.2-98.304 145.92-145.92 98.304-179.2 36.352-179.2-36.352-145.92-98.304-98.304-145.92-36.352-179.2 36.352-179.2 98.304-145.92 145.92-98.304 179.2-36.352zM663.552 261.12q-15.36 0-28.16 6.656t-23.04 18.432-15.872 27.648-5.632 33.28q0 35.84 21.504 61.44t51.2 25.6 51.2-25.6 21.504-61.44q0-17.408-5.632-33.28t-15.872-27.648-23.04-18.432-28.16-6.656zM373.76 261.12q-29.696 0-50.688 25.088t-20.992 60.928 20.992 61.44 50.688 25.6 50.176-25.6 20.48-61.44-20.48-60.928-50.176-25.088zM520.192 602.112q-51.2 0-97.28 9.728t-82.944 27.648-62.464 41.472-35.84 51.2q-1.024 1.024-1.024 2.048-1.024 3.072-1.024 8.704t2.56 11.776 7.168 11.264 12.8 6.144q25.6-27.648 62.464-50.176 31.744-19.456 79.36-35.328t114.176-15.872q67.584 0 116.736 15.872t81.92 35.328q37.888 22.528 63.488 50.176 17.408-5.12 19.968-18.944t0.512-18.944-3.072-7.168-1.024-3.072q-26.624-55.296-100.352-88.576t-176.128-33.28z"
        }
      />
    </svg>
  );
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const difference = payload[0].value - payload[1].value;
    return (
      <div className="bg-background p-4 border rounded-lg shadow-lg">
        <p className="font-bold mb-2">{label}</p>
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-green-500">
            <span className="w-3 h-3 rounded-full bg-green-500"></span>
            <span>Contribution: {payload[0].value} tk</span>
          </div>
          <div className="flex items-center gap-2 text-yellow-500">
            <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
            <span>Consumption: {payload[1].value} tk</span>
          </div>
          <div
            className={`flex items-center gap-2 ${
              difference >= 0 ? "text-green-500" : "text-red-500"
            }`}
          >
            <span
              className={`w-3 h-3 rounded-full ${
                difference >= 0 ? "bg-green-500" : "bg-red-500"
              }`}
            ></span>
            <span>Balance: {difference} tk</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export default function ResponsiveChartWrapper() {
  const { members, loading: membersLoading, error: membersError } = React.useContext(MembersContext);
  const { month, setMonth } = React.useContext(MonthContext);
  const [data, setData] = useState([]);
  const [mealRate, setMealRate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdates, setLastUpdates] = useState({
    mealFund: null,
    mealCount: null,
    grocery: null,
    payables: null
  });
  const [activeTab, setActiveTab] = useState("chart");
  const [showUpdateDetails, setShowUpdateDetails] = useState(false);
  const [latestUpdate, setLatestUpdate] = useState({ type: null, timestamp: null });
  const [memberPresence, setMemberPresence] = useState({});
  const [loadingPresence, setLoadingPresence] = useState(true);
  const [showMemberDetails, setShowMemberDetails] = useState(false);

  // Filter active members for the selected month
  const activeMembers = useMemo(() => {
    if (membersLoading || !members.length) return [];
    
    const selectedMonthDate = new Date(month + "-01");
    
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
  }, [members, month, membersLoading]);
  
  // Fetch member presence status
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

  // Toggle member presence status
  const toggleMemberPresence = async (memberId, isPresent) => {
    try {
      const presenceRef = doc(db, "memberPresence", memberId);
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
      console.error("Error updating member presence:", error);
    }
  };

  // Fetch meal rate from mealSummaries
  useEffect(() => {
    const fetchMealRate = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, "mealSummaries", month);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const { totalSpendings, totalMealsAllMembers } = docSnap.data();
          if (totalSpendings && totalMealsAllMembers && totalMealsAllMembers > 0) {
            const rate = totalSpendings / totalMealsAllMembers;
            setMealRate(rate.toFixed(2));
          } else {
            setMealRate("N/A");
          }
        } else {
          setMealRate("N/A");
        }
      } catch (error) {
        console.error("Error fetching meal summaries:", error);
        setMealRate("Error");
      } finally {
        setLoading(false);
      }
    };

    fetchMealRate();
  }, [month]);

  // Fetch contribution/consumption data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const contribConsumpRef = collection(db, "contributionConsumption");
        const contribSnapshot = await getDocs(contribConsumpRef);

        const contribData = {};
        contribSnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.month === month) {
            contribData[data.member] = {
              contribution: data.contribution || 0,
              consumption: data.consumption || 0,
            };
          }
        });

        const chartData = activeMembers.map((member) => ({
          name: member.shortname,
          given: contribData[member.memberName]?.contribution || 0,
          eaten: contribData[member.memberName]?.consumption || 0,
        }));

        setData(chartData);
      } catch (error) {
        console.error("Error fetching data:", error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    if (activeMembers.length > 0) {
      fetchData();
    }
  }, [month, activeMembers]);
  
  // Fetch last update timestamps for different data types
  useEffect(() => {
    const fetchLastUpdates = async () => {
      try {
        // Fetch last meal fund update
        const mealFundQuery = query(
          collection(db, "mealFund"), 
          orderBy("timestamp", "desc"), 
          limit(1)
        );
        const mealFundSnapshot = await getDocs(mealFundQuery);
        const mealFundTimestamp = !mealFundSnapshot.empty ? mealFundSnapshot.docs[0].data().timestamp : null;
        
        // Fetch last meal count update
        const mealCountQuery = query(
          collection(db, "mealCount"), 
          orderBy("timestamp", "desc"), 
          limit(1)
        );
        const mealCountSnapshot = await getDocs(mealCountQuery);
        const mealCountTimestamp = !mealCountSnapshot.empty ? mealCountSnapshot.docs[0].data().timestamp : null;
        
        // Fetch last grocery update
        const groceryQuery = query(
          collection(db, "expenses"), 
          orderBy("timestamp", "desc"), 
          limit(1)
        );
        const grocerySnapshot = await getDocs(groceryQuery);
        const groceryTimestamp = !grocerySnapshot.empty ? grocerySnapshot.docs[0].data().timestamp : null;
        
        // Fetch last payables update
        const payablesQuery = query(
          collection(db, "payables"), 
          orderBy("timestamp", "desc"), 
          limit(1)
        );
        const payablesSnapshot = await getDocs(payablesQuery);
        const payablesTimestamp = !payablesSnapshot.empty ? payablesSnapshot.docs[0].data().timestamp : null;
        
        const updates = {
          mealFund: mealFundTimestamp,
          mealCount: mealCountTimestamp,
          grocery: groceryTimestamp,
          payables: payablesTimestamp
        };
        
        setLastUpdates(updates);
        
        // Find the most recent update
        let latestType = null;
        let latestTime = null;
        
        const updateTypes = [
          { type: "Meal Fund", timestamp: mealFundTimestamp },
          { type: "Meal Count", timestamp: mealCountTimestamp },
          { type: "Grocery", timestamp: groceryTimestamp },
          { type: "Payables", timestamp: payablesTimestamp }
        ];
        
        updateTypes.forEach(update => {
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

  const dueMembers = data.filter((item) => item.given - item.eaten <= 0);

  // Format timestamp to relative time (e.g., "2 hours ago")
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "Never updated";
    
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return formatDistance(date, new Date(), { addSuffix: true });
    } catch (error) {
      return "Unknown";
    }
  };
  
  // Format timestamp to exact date and time
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

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <AnnouncementBanner />
      
      {/* Member Presence Section - Compact */}
      <Card className="mb-6 shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 transition-colors duration-300">
          <CardHeader className="py-3 px-4 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Home className="h-5 w-5 text-emerald-600" />
                <CardTitle className="text-lg font-medium">Who's in the Apartment?</CardTitle>
              </div>
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
            </div>
            
            {/* Compact View - Always Visible */}
            {loadingPresence ? (
              <div className="flex items-center justify-center py-2 mt-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-500"></div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-1 mt-2">
                {activeMembers.map((member) => {
                  const presenceData = memberPresence[member.memberId];
                  const statusFound = presenceData !== undefined;
                  const isPresent = statusFound ? presenceData.isPresent : false;
                  
                  return (
                    <div 
                      key={member.memberId}
                      className="relative cursor-pointer hover:scale-110 transition-transform duration-200"
                      onClick={() => toggleMemberPresence(member.memberId, !isPresent)}
                      title={`${member.shortname || member.memberName} is ${statusFound ? (isPresent ? 'at home' : 'away') : 'unknown'}`}
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
                            {statusFound ? (isPresent ? 'At Home' : 'Away') : 'Status not found'}
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
      
      {/* Last Update Notification */}
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
                  onClick={() => setShowUpdateDetails(prev => !prev)}
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
      
      {/* Main Dashboard Card */}
      <Card className="mb-8 shadow-lg overflow-hidden border-0 bg-gradient-to-br from-white to-gray-50">
        <CardHeader className="pb-2 border-b bg-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg sm:text-xl font-medium text-center sm:text-left">
                Monthly Summary
              </CardTitle>
              <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 border-blue-200">
                {month}
              </Badge>
            </div>
            <div className="flex justify-center sm:justify-end">
              <SingleMonthYearPicker
                value={month}
                onChange={setMonth}
                collections={["contributionConsumption", "individualMeals"]}
              />
            </div>
          </div>
        </CardHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="px-6 pt-4 border-b">
            <TabsList className="grid w-full grid-cols-3 h-10">
              <TabsTrigger value="chart" className="text-sm">
                Line Chart
              </TabsTrigger>
              <TabsTrigger value="area" className="text-sm">
                Area Chart
              </TabsTrigger>
              <TabsTrigger value="bar" className="text-sm">
                Bar Chart
              </TabsTrigger>
            </TabsList>
          </div>
          
          <CardContent className="pt-6">
            <TabsContent value="chart" className="mt-0">
              <div className="h-[45vh] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={data}
                    margin={{
                      top: 20,
                      right: 10,
                      left: 10,
                      bottom: 80,
                    }}
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
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(var(--border))"
                      opacity={0.3}
                    />
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
                      wrapperStyle={{
                        paddingTop: "20px",
                      }}
                      formatter={(value) => (
                        <span className="text-sm font-medium">{value}</span>
                      )}
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
            
            <TabsContent value="area" className="mt-0">
              <div className="h-[45vh] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={data}
                    margin={{
                      top: 20,
                      right: 10,
                      left: 10,
                      bottom: 80,
                    }}
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
                    <Area
                      type="monotone"
                      dataKey="given"
                      stroke="#3b82f6"
                      fillOpacity={1}
                      fill="url(#colorGiven)"
                      name="Contribution"
                    />
                    <Area
                      type="monotone"
                      dataKey="eaten"
                      stroke="#f59e0b"
                      fillOpacity={1}
                      fill="url(#colorEaten)"
                      name="Consumption"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
            
            <TabsContent value="bar" className="mt-0">
              <div className="h-[45vh] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data}
                    margin={{
                      top: 20,
                      right: 10,
                      left: 10,
                      bottom: 80,
                    }}
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
          
            <div className="mt-6 grid grid-cols-1 gap-2">
              <StatusCard dueMembers={dueMembers} mealRate={mealRate} />
            </div>
          </CardContent>
        </Tabs>
        
        <CardFooter className="bg-gray-50 border-t py-3 text-xs text-gray-500 flex justify-between">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>Last updated: {formatTimestamp(lastUpdates.mealFund)}</span>
          </div>
          <span>Meal Rate: {mealRate || "N/A"} tk</span>
        </CardFooter>
      </Card>
    </div>
  );
}