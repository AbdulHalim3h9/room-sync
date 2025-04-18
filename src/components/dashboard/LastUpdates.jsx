"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Activity, DollarSign, Utensils, ShoppingBag, Receipt } from 'lucide-react';
import { format, formatDistance } from 'date-fns';

const LastUpdates = () => {
  const [lastUpdates, setLastUpdates] = useState({
    mealFund: null,
    mealCount: null,
    grocery: null,
    payables: null
  });
  const [showUpdateDetails, setShowUpdateDetails] = useState(false);
  const [latestUpdate, setLatestUpdate] = useState({ type: null, timestamp: null });
  const [loading, setLoading] = useState(true);

  // Format timestamp for display
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "Never updated";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return formatDistance(date, new Date(), { addSuffix: true });
  };

  // Format exact timestamp
  const formatExactTimestamp = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return format(date, "MMM d, yyyy 'at' h:mm a");
  };

  // Fetch last update timestamps for different data types
  const fetchLastUpdates = useCallback(async () => {
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLastUpdates();
  }, [fetchLastUpdates]);

  if (loading) {
    return (
      <Card className="mb-6 shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </Card>
    );
  }

  if (!latestUpdate.type) {
    return null;
  }

  return (
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
  );
};

export default LastUpdates;
