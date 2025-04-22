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
  "#1f77b4", // blue
  "#ff7f0e", // orange
  "#2ca02c", // green
  "#d62728", // red
  "#9467bd", // purple
  "#8c564b", // brown
  "#e377c2", // pink
  "#7f7f7f", // gray
  "#bcbd22", // olive
  "#17becf", // teal
  "#aec7e8", // light blue
  "#ffbb78", // light orange
  "#98df8a", // light green
  "#ff9896", // light red
  "#c5b0d5", // light purple
  "#c49c94", // light brown
  "#f7b6d2", // light pink
  "#c7c7c7", // light gray
  "#dbdb8d", // light olive
  "#9edae5", // light teal
  "#393b79", // dark blue
  "#ad494a", // dark red
  "#5254a3", // indigo
  "#6b6ecf", // periwinkle
  "#637939", // dark olive
  "#8c6d31", // gold
  "#843c39", // crimson
  "#7b4173", // dark purple
  "#5698c4", // steel blue
  "#e6550d"  // burnt orange
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
              <span className={`w-3 h-3 rounded-full bg-${entry.dataKey === "given" ? "green" : entry.dataKey === "eaten" ? "yellow" : "blue"}-500`}>
              </span>
              <span>{entry.name}: {entry.value.toFixed(2)} {entry.dataKey === "given" || entry.dataKey === "eaten" ? "tk" : "%"}</span>
            </div>
          ))}
          {(payload.length > 1 && difference !== payload[0].value) && (
            <div className={`flex items-center gap-2 ${difference >= 0 ? "text-green-500" : "text-red-500"}`}>
              <span className={`w-3 h-3 rounded-full ${difference >= 0 ? "bg-green-500" : "bg-red-500"}`}>
              </span>
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

// Helper function to darken a color
const darkenColor = (color, percent) => {
  // Convert hex to RGB first if needed
  let r, g, b;
  if (color.startsWith('#')) {
    const hex = color.substring(1);
    r = parseInt(hex.substring(0, 2), 16);
    g = parseInt(hex.substring(2, 4), 16);
    b = parseInt(hex.substring(4, 6), 16);
  } else if (color.startsWith('rgb')) {
    const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (match) {
      r = parseInt(match[1]);
      g = parseInt(match[2]);
      b = parseInt(match[3]);
    } else {
      return color; // Return original if we can't parse
    }
  } else {
    return color; // Return original if not in expected format
  }
  
  // Darken each component
  r = Math.max(0, Math.floor(r * (1 - percent / 100)));
  g = Math.max(0, Math.floor(g * (1 - percent / 100)));
  b = Math.max(0, Math.floor(b * (1 - percent / 100)));
  
  // Convert back to hex
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

// Calculate text anchor position for labels to avoid edge clipping
const getTextAnchor = (midAngle) => {
  // Angle is in the range of -180 to 180
  if (midAngle > -90 && midAngle < 90) {
    return 'start';
  }
  return 'end';
};

// 3D Pie Slice component with improved label positioning
const Pie3DSlice = ({ cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, value, name, percent, index, total }) => {
  const RADIAN = Math.PI / 180;
  const midAngle = (startAngle + endAngle) / 2;
  
  // Calculate the position for 3D effect
  const depth = 20;
  
  // Calculate position for label with offset to avoid overlap
  // We'll place labels in a way that distributes them more evenly
  const sin = Math.sin(-midAngle * RADIAN);
  const cos = Math.cos(-midAngle * RADIAN);
  
  // Determine distance (radius) of the label based on the angle to avoid overlap
  const isSignificant = percent > 0.03; // Only show labels for significant segments (>3%)
  
  // Calculate positions for the leader line and label
  // We'll use a larger radius for the outer position to place labels further out
  const outerPoint = {
    x: cx + (outerRadius * 1.05) * cos,
    y: cy + (outerRadius * 1.05) * sin
  };
  
  // Points for leader line
  // Leader line should extend radially outward and then horizontally
  const labelRadius = outerRadius * 1.4; // Farther out for label position
  const labelX = cx + labelRadius * cos;
  const labelY = cy + labelRadius * sin;
  
  // Add horizontal extension for better readability
  const extendDirection = cos >= 0 ? 1 : -1; // Extend right or left based on position
  const horizExtension = 20 * extendDirection;
  const finalLabelX = labelX + horizExtension;
  
  // Text alignment based on which side of the pie the label is on
  const textAnchor = getTextAnchor(midAngle);
  
  // Format the percent value
  const percentStr = `${value.toFixed(1)}%`;
  const nameStr = name.length > 12 ? `${name.substring(0, 12)}...` : name;
  
  // For very small slices, only show in tooltip
  if (!isSignificant) {
    return (
      <g>
        {/* 3D Effect - Bottom side */}
        <path 
          d={`M ${cx} ${cy + depth}
              L ${cx + outerRadius * Math.cos(-startAngle * RADIAN)} ${cy + outerRadius * Math.sin(-startAngle * RADIAN) + depth}
              A ${outerRadius} ${outerRadius} 0 ${endAngle - startAngle > 180 ? 1 : 0} 1 ${cx + outerRadius * Math.cos(-endAngle * RADIAN)} ${cy + outerRadius * Math.sin(-endAngle * RADIAN) + depth}
              Z`}
          fill={darkenColor(fill, 30)}
          className="opacity-80"
        />
        
        {/* 3D Effect - Side */}
        <path
          d={`
            M ${cx + outerRadius * Math.cos(-startAngle * RADIAN)} ${cy + outerRadius * Math.sin(-startAngle * RADIAN)}
            L ${cx + outerRadius * Math.cos(-startAngle * RADIAN)} ${cy + outerRadius * Math.sin(-startAngle * RADIAN) + depth}
            A ${outerRadius} ${outerRadius} 0 ${endAngle - startAngle > 180 ? 1 : 0} 1 ${cx + outerRadius * Math.cos(-endAngle * RADIAN)} ${cy + outerRadius * Math.sin(-endAngle * RADIAN) + depth}
            L ${cx + outerRadius * Math.cos(-endAngle * RADIAN)} ${cy + outerRadius * Math.sin(-endAngle * RADIAN)}
          `}
          fill={darkenColor(fill, 15)}
          className="opacity-90"
        />
        
        {/* Top Pie Slice */}
        <path
          d={`
            M ${cx} ${cy}
            L ${cx + outerRadius * Math.cos(-startAngle * RADIAN)} ${cy + outerRadius * Math.sin(-startAngle * RADIAN)}
            A ${outerRadius} ${outerRadius} 0 ${endAngle - startAngle > 180 ? 1 : 0} 1 ${cx + outerRadius * Math.cos(-endAngle * RADIAN)} ${cy + outerRadius * Math.sin(-endAngle * RADIAN)}
            Z
          `}
          fill={fill}
          strokeWidth={1}
          stroke={darkenColor(fill, 10)}
          className="hover:opacity-80 transition-opacity cursor-pointer"
        />
      </g>
    );
  }
  
  return (
    <g>
      {/* 3D Effect - Bottom side */}
      <path 
        d={`M ${cx} ${cy + depth}
            L ${cx + outerRadius * Math.cos(-startAngle * RADIAN)} ${cy + outerRadius * Math.sin(-startAngle * RADIAN) + depth}
            A ${outerRadius} ${outerRadius} 0 ${endAngle - startAngle > 180 ? 1 : 0} 1 ${cx + outerRadius * Math.cos(-endAngle * RADIAN)} ${cy + outerRadius * Math.sin(-endAngle * RADIAN) + depth}
            Z`}
        fill={darkenColor(fill, 30)}
        className="opacity-80"
      />
      
      {/* 3D Effect - Side */}
      <path
        d={`
          M ${cx + outerRadius * Math.cos(-startAngle * RADIAN)} ${cy + outerRadius * Math.sin(-startAngle * RADIAN)}
          L ${cx + outerRadius * Math.cos(-startAngle * RADIAN)} ${cy + outerRadius * Math.sin(-startAngle * RADIAN) + depth}
          A ${outerRadius} ${outerRadius} 0 ${endAngle - startAngle > 180 ? 1 : 0} 1 ${cx + outerRadius * Math.cos(-endAngle * RADIAN)} ${cy + outerRadius * Math.sin(-endAngle * RADIAN) + depth}
          L ${cx + outerRadius * Math.cos(-endAngle * RADIAN)} ${cy + outerRadius * Math.sin(-endAngle * RADIAN)}
        `}
        fill={darkenColor(fill, 15)}
        className="opacity-90"
      />
      
      {/* Top Pie Slice */}
      <path
        d={`
          M ${cx} ${cy}
          L ${cx + outerRadius * Math.cos(-startAngle * RADIAN)} ${cy + outerRadius * Math.sin(-startAngle * RADIAN)}
          A ${outerRadius} ${outerRadius} 0 ${endAngle - startAngle > 180 ? 1 : 0} 1 ${cx + outerRadius * Math.cos(-endAngle * RADIAN)} ${cy + outerRadius * Math.sin(-endAngle * RADIAN)}
          Z
        `}
        fill={fill}
        strokeWidth={1}
        stroke={darkenColor(fill, 10)}
        className="hover:opacity-80 transition-opacity cursor-pointer"
      />
      
      {/* Leader Line: Three-segment line for better visibility */}
      <path
        d={`
          M ${outerPoint.x} ${outerPoint.y}
          L ${labelX} ${labelY}
          L ${finalLabelX} ${labelY}
        `}
        stroke="#666"
        strokeWidth={1.5}
        fill="none"
        className="label-line"
      />
      
      {/* Label Background - ensures text is visible against any background */}
      <rect
        x={textAnchor === 'start' ? finalLabelX : finalLabelX - 70}
        y={labelY - 10}
        width={70}
        height={20}
        rx={3}
        fill="white"
        opacity={0.7}
        stroke="#666"
        strokeWidth={0.5}
      />
      
      {/* Label Text - Name (truncated) + value */}
      <text
        x={finalLabelX + (textAnchor === 'start' ? 5 : -5)}
        y={labelY}
        fill="#333"
        textAnchor={textAnchor}
        dominantBaseline="central"
        fontSize={10}
        fontWeight="bold"
      >
        {nameStr}: {percentStr}
      </text>
    </g>
  );
};

// Assign colors to data based on index
const assignConsistentColors = (data) => {
  return data.map((entry, index) => ({
    ...entry,
    fill: CONSISTENT_COLORS[index % CONSISTENT_COLORS.length] // Use modulo to cycle through colors if more than 30 entries
  }));
};

export default function RealtimeCharts({
  realtimeData,
  pieContributionData,
  pieConsumptionData,
  dueMembers,
  mealRate,
}) {
  const hasPieData = pieContributionData.some(item => item.value > 0) || pieConsumptionData.some(item => item.value > 0);

  // Use consistent colors based on member index
  const enhancedContributionData = useMemo(() => {
    return assignConsistentColors(pieContributionData);
  }, [pieContributionData]);
  
  const enhancedConsumptionData = useMemo(() => {
    return assignConsistentColors(pieConsumptionData);
  }, [pieConsumptionData]);

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
                  <h3 className="text-sm font-medium mb-2">Contribution (%)</h3>
                  <div className="w-full h-[350px] relative">
                    <ResponsiveContainer width="100%" height={350}>
                      <PieChart margin={{ top: 10, right: 30, left: 30, bottom: 30 }}>
                        <Pie
                          data={enhancedContributionData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="45%"
                          innerRadius={30}
                          outerRadius={70}
                          paddingAngle={1}
                          isAnimationActive={true}
                          startAngle={90}
                          endAngle={-270}
                        >
                          {enhancedContributionData.map((entry, index) => (
                            <Cell
                              key={`contribution-${entry.name}-${index}`}
                              fill={entry.fill}
                              shape={(props) => (
                                <Pie3DSlice
                                  {...props}
                                  cx={props.cx}
                                  cy={props.cy}
                                  innerRadius={props.innerRadius}
                                  outerRadius={props.outerRadius}
                                  startAngle={props.startAngle}
                                  endAngle={props.endAngle}
                                  fill={entry.fill}
                                  value={entry.value}
                                  name={entry.name}
                                  percent={entry.value / 100}
                                  index={index}
                                  total={enhancedContributionData.length}
                                />
                              )}
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
                  <h3 className="text-sm font-medium mb-2">Consumption (%)</h3>
                  <div className="w-full h-[350px] relative">
                    <ResponsiveContainer width="100%" height={350}>
                      <PieChart margin={{ top: 10, right: 30, left: 30, bottom: 30 }}>
                        <Pie
                          data={enhancedConsumptionData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="45%"
                          innerRadius={30}
                          outerRadius={70}
                          paddingAngle={1}
                          isAnimationActive={true}
                          startAngle={90}
                          endAngle={-270}
                        >
                          {enhancedConsumptionData.map((entry, index) => (
                            <Cell
                              key={`consumption-${entry.name}-${index}`}
                              fill={entry.fill}
                              shape={(props) => (
                                <Pie3DSlice
                                  {...props}
                                  cx={props.cx}
                                  cy={props.cy}
                                  innerRadius={props.innerRadius}
                                  outerRadius={props.outerRadius}
                                  startAngle={props.startAngle}
                                  endAngle={props.endAngle}
                                  fill={entry.fill}
                                  value={entry.value}
                                  name={entry.name}
                                  percent={entry.value / 100}
                                  index={index}
                                  total={enhancedConsumptionData.length}
                                />
                              )}
                            />
                          ))}
                        </Pie>
                        <Tooltip content={<PieTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                {/* Color Legend - displayed below charts */}
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