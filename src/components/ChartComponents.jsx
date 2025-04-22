import React from "react";
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

// Custom Dot for Line Chart
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

// Custom Tooltip for Line and Bar Charts
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

// Custom Tooltip for Pie Chart
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

// Line Chart Component
export function LineChartComponent({ data }) {
  return (
    <div className="w-full min-h-[400px]">
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={data}
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
  );
}

// Bar Chart Component
export function BarChartComponent({ data }) {
  return (
    <div className="w-full min-h-[400px]">
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={data}
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
  );
}

// Pie Chart Component
export function PieChartComponent({ contributionData, consumptionData, hasData }) {
  return (
    <div className="w-full">
      {hasData ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="min-h-[250px] flex flex-col items-center">
            <h3 className="text-sm font-medium mb-2">Contribution (%)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={contributionData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, value }) => `${name}: ${value}%`}
                  labelLine
                >
                  {contributionData.map((entry, index) => (
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
                  data={consumptionData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, value }) => `${name}: ${value}%`}
                  labelLine
                >
                  {consumptionData.map((entry, index) => (
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
  );
}