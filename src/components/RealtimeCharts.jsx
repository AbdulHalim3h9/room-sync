import React, { useMemo } from 'react';
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
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { format, formatDistance } from "date-fns";
import { Clock, DollarSign, Utensils, ShoppingBag, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import StatusCard from "./dashboard/status-card";

// Predefined list of 30 contrasting colors
const CONSISTENT_COLORS = [
  "#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf",
  "#aec7e8", "#ffbb78", "#98df8a", "#ff9896", "#c5b0d5", "#c49c94", "#f7b6d2", "#c7c7c7", "#dbdb8d", "#9edae5",
  "#393b79", "#ad494a", "#5254a3", "#6b6ecf", "#637939", "#8c6d31", "#843c39", "#7b4173", "#5698c4", "#e6550d"
];

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

const PieTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background p-4 border rounded-lg shadow-lg">
        <p className="font-bold mb-2">{payload[0].name}</p>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: payload[0].payload.fill }}></span>
          <span>{payload[0].value.toFixed(2)}%</span>
        </div>
      </div>
    );
  }
  return null;
};

// Assign colors to data based on index
const assignConsistentColors = (data) => {
  return data.map((entry, index) => ({
    ...entry,
    fill: CONSISTENT_COLORS[index % CONSISTENT_COLORS.length]
  }));
};

// Custom label rendering with dynamic positioning for mobile
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name, viewBox }) => {
  const RADIAN = Math.PI / 180;
  const isMobile = window.innerWidth < 640;
  const outerRadiusAdjusted = isMobile ? outerRadius * 0.8 : outerRadius;
  const labelRadius = isMobile ? outerRadiusAdjusted * 1.8 : outerRadius * 1.4;
  const fontSize = isMobile ? 9 : 12;
  const rectWidth = isMobile ? 60 : 80;
  const rectHeight = isMobile ? 18 : 24;

  const x = cx + labelRadius * Math.cos(-midAngle * RADIAN);
  const y = cy + labelRadius * Math.sin(-midAngle * RADIAN);

  // Get container dimensions
  const containerRect = document.querySelector('.recharts-responsive-container')?.getBoundingClientRect();
  const containerWidth = containerRect?.width || 0;
  const containerLeft = containerRect?.left || 0;

  // Clamp x to stay within container
  const padding = 10;
  const minX = containerLeft + padding + rectWidth / 2;
  const maxX = containerLeft + containerWidth - padding - rectWidth / 2;
  const clampedX = Math.min(Math.max(x, minX), maxX);

  // Adjust y to avoid overlap (simple vertical offset based on angle)
  const verticalOffset = midAngle > 180 ? -rectHeight * 0.6 : rectHeight * 0.6;
  const adjustedY = y + (isMobile ? verticalOffset : 0);

  const textAnchor = clampedX > cx ? 'start' : 'end';
  const nameStr = name.length > 10 ? `${name.substring(0, 10)}...` : name;
  const percentStr = `${(percent * 100).toFixed(1)}%`;

  // Leader line points
  const outerPointX = cx + outerRadiusAdjusted * Math.cos(-midAngle * RADIAN);
  const outerPointY = cy + outerRadiusAdjusted * Math.sin(-midAngle * RADIAN);
  const labelX = clampedX + (clampedX > cx ? 10 : -10);
  const labelY = adjustedY;

  return (
    <g>
      {/* Leader Line */}
      <path
        d={`M ${outerPointX} ${outerPointY} L ${clampedX} ${adjustedY} L ${labelX} ${adjustedY}`}
        stroke="#666"
        strokeWidth={isMobile ? 1 : 1.5}
        fill="none"
      />
      {/* Label Background */}
      <rect
        x={textAnchor === 'start' ? labelX : labelX - rectWidth}
        y={adjustedY - rectHeight / 2}
        width={rectWidth}
        height={rectHeight}
        rx={4}
        fill="white"
        opacity={0.85}
        stroke="#666"
        strokeWidth={0.5}
      />
      {/* Label Text */}
      <text
        x={labelX + (textAnchor === 'start' ? 5 : -5)}
        y={adjustedY}
        fill="#333"
        textAnchor={textAnchor}
        dominantBaseline="central"
        fontSize={fontSize}
        fontWeight="bold"
      >
        {`${nameStr}: ${percentStr}`}
      </text>
    </g>
  );
};

export default function RealtimeCharts({
  realtimeData,
  pieContributionData,
  pieConsumptionData,
  dueMembers,
  mealRate,
}) {
  const hasPieData = pieContributionData.some(item => item.value > 0) || pieConsumptionData.some(item => item.value > 0);
  const enhancedContributionData = useMemo(() => assignConsistentColors(pieContributionData), [pieContributionData]);
  const enhancedConsumptionData = useMemo(() => assignConsistentColors(pieConsumptionData), [pieConsumptionData]);

  return (
    <div className="space-y-6">
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
                {/* Contribution Pie Chart */}
                <div className="min-h-[350px] flex flex-col items-center">
                  <h3 className="text-sm font-medium mb-2">জমা (%)</h3>
                  <div className="w-full h-[350px] relative">
                    <ResponsiveContainer width="100%" height={350}>
                      <PieChart margin={{ top: 80, right: 80, left: 80, bottom: 80 }}>
                        <Pie
                          data={enhancedContributionData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={30}
                          outerRadius={window.innerWidth < 640 ? 60 : 80}
                          paddingAngle={2}
                          isAnimationActive={true}
                          label={renderCustomizedLabel}
                          labelLine={false}
                        >
                          {enhancedContributionData.map((entry, index) => (
                            <Cell
                              key={`contribution-${entry.name}-${index}`}
                              fill={entry.fill}
                            />
                          ))}
                        </Pie>
                        <Tooltip content={<PieTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                {/* Consumption Pie Chart */}
                <div className="min-h-[350px] flex flex-col items-center">
                  <h3 className="text-sm font-medium mb-2">খরচ হয়েছে (%)</h3>
                  <div className="w-full h-[350px] relative">
                    <ResponsiveContainer width="100%" height={350}>
                      <PieChart margin={{ top: 80, right: 80, left: 80, bottom: 80 }}>
                        <Pie
                          data={enhancedConsumptionData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={30}
                          outerRadius={window.innerWidth < 640 ? 60 : 80}
                          paddingAngle={2}
                          isAnimationActive={true}
                          label={renderCustomizedLabel}
                          labelLine={false}
                        >
                          {enhancedConsumptionData.map((entry, index) => (
                            <Cell
                              key={`consumption-${entry.name}-${index}`}
                              fill={entry.fill}
                            />
                          ))}
                        </Pie>
                        <Tooltip content={<PieTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                {/* Color Legend */}
                <div className="col-span-1 md:col-span-2 mt-4">
                  <div className="bg-white p-4 rounded-lg border shadow-sm">
                    <h3 className="text-sm font-medium mb-2">Members</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                      {[...new Set([...enhancedContributionData, ...enhancedConsumptionData].map(item => item.name))].map((name, index) => {
                        const color = CONSISTENT_COLORS[index % CONSISTENT_COLORS.length];
                        return (
                          <div key={`legend-${name}`} className="flex items-center gap-2 text-sm">
                            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></span>
                            <span className="truncate">{name}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
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
    </div>
  );
}