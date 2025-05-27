"use client";

import React, { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import TabSwitcherMealChart from "./layouts/TabSwitcherMealChart";
import ResponsiveChartWrapper from "./ResponsiveChartWrapper";
import { MembersContext } from "@/contexts/MembersContext";
import { MonthProvider } from "@/contexts/MonthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { detectDevice } from "@/utils/deviceDetection";
import { storeDeviceInfo, storeUniqueDeviceInfo } from "@/utils/deviceTracking";

const Dashboard = () => {
  const { members, loading, error } = React.useContext(MembersContext);

  // Detect and store device info on component mount
  useEffect(() => {
    const deviceInfo = detectDevice();
    
    // Store regular device info
    storeDeviceInfo(deviceInfo);
    
    // Store unique device info
    storeUniqueDeviceInfo(deviceInfo).then(result => {
      if (result.isNew) {
        console.log('New unique device detected and stored');
      } else {
        console.log('Existing device detected and usage count updated');
      }
    });

    // Log device info
    console.log('Detailed Device Information:', {
      'Is Mobile': deviceInfo.isMobile,
      'Is Tablet': deviceInfo.isTablet,
      'Is Desktop': deviceInfo.isDesktop,
      'Is Android': deviceInfo.isAndroid,
      'Is iOS': deviceInfo.isIOS,
      'Device Model': deviceInfo.deviceModel,
      'OS Version': deviceInfo.osVersion,
      'Screen Width': `${deviceInfo.screenWidth}px`,
      'Screen Height': `${deviceInfo.screenHeight}px`,
      'User Agent': deviceInfo.userAgent
    });
  }, []);

  if (loading) {
    return (
      <div className="fixed right-0 top-1/2 -translate-y-1/2 z-50">
        <div className="relative">
          {/* Toggle Button Skeleton */}
          <Skeleton
            className={cn(
              "absolute top-1/2 -translate-y-1/2",
              "w-8 h-8 rounded-full right-[6rem]"
            )}
          />
  
          {/* Members Navigation Skeleton */}
          <div className={cn(
            "absolute right-2 top-1/2 -translate-y-1/2",
            "flex flex-col gap-3",
            "rounded-2xl p-4"
          )}>
            {[...Array(5)].map((_, index) => (
              <div key={index} className="relative group">
                <Skeleton
                  className={cn(
                    "rounded-2xl",
                    "transition-all duration-100",
                    index === 0 ? "w-16 h-16" : 
                    index === 1 ? "w-14 h-14" : "w-12 h-12"
                  )}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  return (
    <MonthProvider>
      <div>
        <Routes>
          <Route path="/" element={<ResponsiveChartWrapper />} />
          <Route
            path=":memberId"
            element={<TabSwitcherMealChart members={members} />}
          />
        </Routes>
      </div>
    </MonthProvider>
  );
};

export default Dashboard;  