import React from "react";
import { PieChart, Pie, ResponsiveContainer, Tooltip, Cell } from "recharts";

// Data with multicolor values
const data01 = [
  { name: "Group A", value: 400, fill: "#8884d8" },
  { name: "Group B", value: 300, fill: "#83a6ed" },
  { name: "Group C", value: 300, fill: "#8dd1e1" },
  { name: "Group D", value: 200, fill: "#82ca9d" },
  { name: "Group E", value: 278, fill: "#a4de6c" },
  { name: "Group F", value: 189, fill: "#d0ed57" },
];

const PieContribution = () => {
  return (
    <div style={{ width: "100%", height: "200px" }}> {/* Wrapper div with fixed height */}
      <ResponsiveContainer>
        <PieChart>
          <Pie
            dataKey="value"
            data={data01}
            cx="50%"
            cy="50%"
            innerRadius={15}
            outerRadius={30}
            label
          >
            {/* Add colors dynamically */}
            {data01.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart> 
        <PieChart>
          <Pie
            dataKey="value"
            data={data01}
            cx="50%"
            cy="50%"
            innerRadius={20}
            outerRadius={40}
            label
          >
            {/* Add colors dynamically */}
            {data01.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PieContribution;
