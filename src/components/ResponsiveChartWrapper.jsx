"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import SingleMonthYearPicker from "./SingleMonthYearPicker";
import { db } from "@/firebase";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import StatusCard from "./dashboard/status-card";
import { MembersContext } from "@/contexts/MembersContext";
import { MonthContext } from "@/contexts/MonthContext";
import AnnouncementBanner from "./AnnouncementBanner";

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

  // Filter active members for the selected month
  const activeMembers = useMemo(() => {
    return members.filter((member) => {
      if (!member.activeFrom) return false;
      const activeFromDate = new Date(member.activeFrom + "-01");
      const selectedMonthDate = new Date(month + "-01");
      if (activeFromDate > selectedMonthDate) return false;
      if (member.archiveFrom) {
        const archiveFromDate = new Date(member.archiveFrom + "-01");
        return selectedMonthDate < archiveFromDate;
      }
      return true;
    });
  }, [members, month]);

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

  const dueMembers = data.filter((item) => item.given - item.eaten <= 0);

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
      <Card className="mb-8 shadow-lg">
        <CardHeader className="pb-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-lg sm:text-xl font-medium text-center sm:text-left">
              Monthly Summary
            </CardTitle>
            <div className="flex justify-center sm:justify-end">
              <SingleMonthYearPicker
                value={month}
                onChange={setMonth}
                collections={["contributionConsumption", "individualMeals"]}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[40vh] w-full">
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
                  stroke="hsl(var(--chart-1))"
                  strokeWidth={2}
                  dot={<CustomizedDot />}
                  name="Contribution"
                  activeDot={{ r: 8 }}
                />
                <Line
                  type="monotone"
                  dataKey="eaten"
                  stroke="hsl(var(--chart-2))"
                  strokeWidth={2}
                  name="Consumption"
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-2">
            <StatusCard dueMembers={dueMembers} mealRate={mealRate} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}