// import React, { useEffect, useState } from "react";
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
// } from "recharts";
// import SingleMonthYearPicker from "./SingleMonthYearPicker";
// import overviewData from "@/overviewData.json";  // Importing overviewData directly
// import { useMonth } from "@/App"; // Assuming you're using the context like in your Payables component

// const CustomizedDot = (props) => {
//   const { cx, cy, value, payload } = props;
//   const difference = payload.given - payload.eaten;
//   if (difference > 0) {
//     return (
//       <svg
//         x={cx - 10}
//         y={cy - 10}
//         width={20}
//         height={20}
//         fill="green"
//         viewBox="0 0 1024 1024"
//       >
//         <path d="M512 1009.984c-274.912 0-497.76-222.848-497.76-497.76s222.848-497.76 497.76-497.76c274.912 0 497.76 222.848 497.76 497.76s-222.848 497.76-497.76 497.76zM340.768 295.936c-39.488 0-71.52 32.8-71.52 73.248s32.032 73.248 71.52 73.248c39.488 0 71.52-32.8 71.52-73.248s-32.032-73.248-71.52-73.248zM686.176 296.704c-39.488 0-71.52 32.8-71.52 73.248s32.032 73.248 71.52 73.248c39.488 0 71.52-32.8 71.52-73.248s-32.032-73.248-71.52-73.248zM772.928 555.392c-18.752-8.864-40.928-0.576-49.632 18.528-40.224 88.576-120.256 143.552-208.832 143.552-85.952 0-164.864-52.64-205.952-137.376-9.184-18.912-31.648-26.592-50.08-17.28-18.464 9.408-21.216 21.472-15.936 32.64 52.8 111.424 155.232 186.784 269.76 186.784 117.984 0 217.12-70.944 269.76-186.784 8.672-19.136 9.568-31.2-9.12-40.096z" />
//       </svg>
//     );
//   }

//   return (
//     <svg
//       x={cx - 10}
//       y={cy - 10}
//       width={20}
//       height={20}
//       fill="red"
//       viewBox="0 0 1024 1024"
//     >
//       <path d="M517.12 53.248q95.232 0 179.2 36.352t145.92 98.304 98.304 145.92 36.352 179.2-36.352 179.2-98.304 145.92-145.92 98.304-179.2 36.352-179.2-36.352-145.92-98.304-98.304-145.92-36.352-179.2 36.352-179.2 98.304-145.92 145.92-98.304 179.2-36.352zM663.552 261.12q-15.36 0-28.16 6.656t-23.04 18.432-15.872 27.648-5.632 33.28q0 35.84 21.504 61.44t51.2 25.6 51.2-25.6 21.504-61.44q0-17.408-5.632-33.28t-15.872-27.648-23.04-18.432-28.16-6.656zM373.76 261.12q-29.696 0-50.688 25.088t-20.992 60.928 20.992 61.44 50.688 25.6 50.176-25.6 20.48-61.44-20.48-60.928-50.176-25.088zM520.192 602.112q-51.2 0-97.28 9.728t-82.944 27.648-62.464 41.472-35.84 51.2q-1.024 1.024-1.024 2.048-1.024 3.072-1.024 8.704t2.56 11.776 7.168 11.264 12.8 6.144q25.6-27.648 62.464-50.176 31.744-19.456 79.36-35.328t114.176-15.872q67.584 0 116.736 15.872t81.92 35.328q37.888 22.528 63.488 50.176 17.408-5.12 19.968-18.944t0.512-18.944-3.072-7.168-1.024-3.072q-26.624-55.296-100.352-88.576t-176.128-33.28z" />
//     </svg>
//   );
// };

// export default function Overview() {
//   const { month, setMonth } = useMonth(); // Use the context to manage the month state
//   const [data, setData] = useState([]);

//   useEffect(() => {
//     console.log(month);
//     // Filter the data based on the selected month
//     const selectedMonthData = overviewData[month]?.['overview-members'] || [];
//     setData(selectedMonthData);
//   }, [month]);

//   // Handle date change from SingleMonthYearPicker
//   const handleDateChange = (newMonth) => {
//     setMonth(newMonth); // Set the new month in the context
//   };

//   const dueMembers = data.filter((item) => item.given - item.eaten <= 0);

//   return (
//     <div className="w-full">
//       <h1 className="text-xl text-center mt-0 mb-20 md:mb-20">Summary</h1>
//       <div className="flex justify-end mr-4 md:mr-8 mb-10">
//         <SingleMonthYearPicker onChange={handleDateChange} />
//       </div>
//       <div className="flex justify-center items-center mt-5 w-full h-[40vh]">
//         <LineChart
//           width={window.innerWidth * 0.9}
//           height={window.innerHeight * 0.5}
//           data={data}
//           margin={{
//             top: 5,
//             right: 20,
//             left: 20,
//             bottom: 5,
//           }}
//         >
//           <CartesianGrid strokeDasharray="3 3" />
//           <XAxis dataKey="name" angle={90} textAnchor="start" />
//           <YAxis />
//           <Tooltip />
//           <Legend
//             wrapperStyle={{
//               position: "relative",
//               marginTop: "2vh",
//             }}
//           />
//           <Line
//             type="monotone"
//             dataKey="given"
//             stroke="#00ff00"
//             dot={<CustomizedDot />}
//           />
//           <Line type="monotone" dataKey="eaten" stroke="#ffd700" />
//         </LineChart>
//       </div>
//       <h2 className="relative w-[80vw] md:w-[50vw] lg:w-[30vw] mx-auto my-20 text-md text-slate-600 text-center">
//         <span className="text-italic text-red-500 text-start">
//           {dueMembers.map((item) => item.name).join(", ")} <br />
//         </span>
//         need to contribute money to the meal fund.
//       </h2>
//     </div>
//   );
// }
