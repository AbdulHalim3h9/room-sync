import React from "react";
import { useParams } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ReferenceLine,
} from "recharts";


export default function CreditChart({ data }) {
  const { member_id } = useParams();
  const member = data.find((m) => m.member_id === parseInt(member_id));

  // Preparing member-specific chart data
  const chartData = [
    {
      name: "Contribution",
      contributed: member.contribution.contributed,
      due: member.contribution.due,
    },
    {
      name: "Consumption",
      consumed: member.consumption.consumed,
    },
  ];

  return (
    <>
      {/* chart here */}
      <div className="my-12">
        <div className="flex flex-col items-center justify-center m-5">
          <img
            className="w-24 h-24 overflow-hidden rounded-full"
            src={member.img_src}
            alt={member.member_name}
          />
          <h3 className="text-center text-2xl text-slate-600 my-5">
            {member.member_name}
          </h3>
        </div>
        <div className="flex items-center flex-col md:flex-row">
          <BarChart
            width={350}
            height={350}
            data={chartData}
            stackOffset="sign"
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
            className="mx-8"
          >
            <XAxis dataKey="name" />
            <YAxis
              type="number"
              domain={["auto", "auto"]}
              tickFormatter={(value) => `${value} tk`}
            />
            <Tooltip />
            <Legend />
            <ReferenceLine y={0} stroke="#000" />
            <Bar dataKey="contributed" fill="#8884d8" stackId="stack" />
            <Bar dataKey="due" fill="#ff7f7f" stackId="stack" />
            <Bar dataKey="consumed" fill="#82ca9d" stackId="stack" />
          </BarChart>
          <div className="text-md text-slate-600 m-5">
            <h4>{member.contribution.contributed} contribution this month</h4>{" "}
            <br />
            <h4>
              {member.consumption.consumed} worth of consumption this month
            </h4>
          </div>
        </div>
      </div>
    </>

    // <div className="my-12">
    //   <div className="flex flex-col items-center justify-center m-5">
    //     <img
    //       className="w-24 h-24 overflow-hidden rounded-full"
    //       src={member.img_src}
    //       alt={member.member_name}
    //     />
    //     <h3 className="text-center text-2xl text-slate-600 my-5">
    //       {member.member_name}
    //     </h3>
    //   </div>
    //   <div className="flex items-center flex-col md:flex-row">
    //   <BarChart
    //     width={350}
    //     height={350}
    //     data={chartData}
    //     stackOffset="sign"
    //     margin={{
    //       top: 5,
    //       right: 30,
    //       left: 20,
    //       bottom: 5,
    //     }}
    //     className="mx-8"
    //   >
    //     <XAxis dataKey="name" />
    //     <YAxis
    //       type="number"
    //       domain={["auto", "auto"]}
    //       tickFormatter={(value) => `${value} tk`}
    //     />
    //     <Tooltip />
    //     <Legend />
    //     <ReferenceLine y={0} stroke="#000" />
    //     <Bar dataKey="contributed" fill="#8884d8" stackId="stack" />
    //     <Bar dataKey="due" fill="#ff7f7f" stackId="stack" />
    //     <Bar dataKey="consumed" fill="#82ca9d" stackId="stack" />
    //   </BarChart>
    //   <div className="text-md text-slate-600 m-5">
    //     <h4>{member.contribution.contributed} contribution this month</h4> <br />
    //     <h4>{member.consumption.consumed} worth of consumption this month</h4>
    //   </div>
    //   </div>
    // </div>
  );
}
