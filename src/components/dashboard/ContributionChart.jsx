"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { db } from '@/firebase';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, AreaChart, Area, BarChart, Bar 
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Custom dot component for line chart
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

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const difference = data.given - data.eaten;
    const isPositive = difference > 0;

    return (
      <div className="bg-white p-3 rounded-lg shadow-md border border-gray-200">
        <p className="text-sm font-medium text-gray-700">{label}</p>
        <div className="mt-2 space-y-1">
          <p className="text-xs flex items-center">
            <span className="w-3 h-3 rounded-full bg-blue-500 inline-block mr-2"></span>
            <span className="text-gray-600">Given: </span>
            <span className="ml-1 font-medium">৳{data.given}</span>
          </p>
          <p className="text-xs flex items-center">
            <span className="w-3 h-3 rounded-full bg-red-500 inline-block mr-2"></span>
            <span className="text-gray-600">Eaten: </span>
            <span className="ml-1 font-medium">৳{data.eaten}</span>
          </p>
          <div className="border-t border-gray-100 my-1 pt-1">
            <p className="text-xs flex items-center">
              <span className={`w-3 h-3 rounded-full ${isPositive ? "bg-green-500" : "bg-amber-500"} inline-block mr-2`}></span>
              <span className="text-gray-600">Difference: </span>
              <span className={`ml-1 font-medium ${isPositive ? "text-green-600" : "text-amber-600"}`}>
                {isPositive ? "+" : ""}৳{difference}
              </span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

const ContributionChart = ({ month, activeMembers }) => {
  const [data, setData] = useState([]);
  const [mealRate, setMealRate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("chart");

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
  const fetchData = useCallback(async () => {
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

      const chartData = activeMembers.map((member) => {
        const memberData = contribData[member.memberName] || { contribution: 0, consumption: 0 };
        return {
          name: member.shortname || member.memberName,
          given: memberData.contribution,
          eaten: memberData.consumption,
        };
      });

      setData(chartData);
    } catch (error) {
      console.error("Error fetching contribution/consumption data:", error);
    } finally {
      setLoading(false);
    }
  }, [month, activeMembers]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <Card className="mb-8 shadow-lg overflow-hidden border-0 bg-gradient-to-br from-white to-gray-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-8 shadow-lg overflow-hidden border-0 bg-gradient-to-br from-white to-gray-50">
      <CardHeader className="border-b bg-gradient-to-r from-indigo-50 to-blue-50 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-indigo-600" />
              <CardTitle className="text-lg font-medium text-gray-800">Contribution vs Consumption</CardTitle>
            </div>
            <CardDescription className="text-gray-600 mt-1">
              Meal rate: <Badge variant="outline" className="ml-1 font-medium text-indigo-600 bg-indigo-50">৳{mealRate} per meal</Badge>
            </CardDescription>
          </div>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
            <TabsList className="bg-white border border-gray-200 p-1 h-9">
              <TabsTrigger value="chart" className="text-xs h-7 px-3 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700">
                Line
              </TabsTrigger>
              <TabsTrigger value="area" className="text-xs h-7 px-3 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700">
                Area
              </TabsTrigger>
              <TabsTrigger value="bar" className="text-xs h-7 px-3 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700">
                Bar
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="h-[350px] w-full">
          <TabsContent value="chart" className="h-full mt-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="given"
                  stroke="hsl(var(--chart-2))"
                  strokeWidth={2}
                  activeDot={{ r: 8 }}
                  name="Given (৳)"
                  dot={<CustomizedDot />}
                />
                <Line
                  type="monotone"
                  dataKey="eaten"
                  stroke="hsl(var(--chart-1))"
                  strokeWidth={2}
                  name="Eaten (৳)"
                />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>
          <TabsContent value="area" className="h-full mt-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="given"
                  stackId="1"
                  stroke="hsl(var(--chart-2))"
                  fill="hsl(var(--chart-2-light))"
                  name="Given (৳)"
                />
                <Area
                  type="monotone"
                  dataKey="eaten"
                  stackId="2"
                  stroke="hsl(var(--chart-1))"
                  fill="hsl(var(--chart-1-light))"
                  name="Eaten (৳)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </TabsContent>
          <TabsContent value="bar" className="h-full mt-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar
                  dataKey="given"
                  fill="hsl(var(--chart-2))"
                  name="Given (৳)"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="eaten"
                  fill="hsl(var(--chart-1))"
                  name="Eaten (৳)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
        </div>
      </CardContent>
      <CardFooter className="border-t bg-gray-50 py-3 px-6">
        <p className="text-xs text-gray-500">
          This chart shows the contribution (given) vs consumption (eaten) for each active member for {month}.
        </p>
      </CardFooter>
    </Card>
  );
};

export default ContributionChart;
