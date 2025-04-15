import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase";
import { MembersContext } from "@/contexts/MembersContext"; // Adjust path as needed
import SingleMonthYearPicker from "./SingleMonthYearPicker";
import { debounce } from "lodash";

const CreditChart = () => {
  
    const [month, setMonth] = useState(() => {
      const today = new Date();
      const year = today.getFullYear();
      const monthNum = String(today.getMonth() + 1).padStart(2, "0");
      return `${year}-${monthNum}`;
    });
  const { memberId } = useParams();
  const { members, loading: membersLoading, error: membersError } = React.useContext(MembersContext);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const member = Array.isArray(members)
    ? members.find((m) => m.memberId === memberId)
    : null;

  const handleMonthChange = useCallback(
    debounce((newMonth) => {
      console.log("Selected new month in CreditChart:", newMonth);
      setMonth(newMonth);
    }, 300),
    []
  );

  useEffect(() => {
    const fetchCreditData = async () => {
      console.log("Month:", month, "MemberId:", memberId, "Members:", members);
      if (!month || !memberId || !member || !Array.isArray(members)) {
        console.log("Missing required data, skipping fetch");
        setChartData([
          { name: "Contribution", contributed: 0 },
          { name: "Consumption", consumed: 0 },
        ]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const docId = `${month}-${member.memberName}`;
        const docRef = doc(db, "contributionConsumption", docId);
        const docSnap = await getDoc(docRef);
        console.log("docSnapData", docSnap.data());
        if (docSnap.exists()) {
          const data = docSnap.data();
          setChartData([
            {
              name: "Contribution",
              contributed: data.contribution || 0,
            },
            {
              name: "Consumption",
              consumed: data.consumption || 0,
            },
          ]);
          console.log("Fetched credit data:", data);
        } else {
          setChartData([
            { name: "Contribution", contributed: 0 },
            { name: "Consumption", consumed: 0 },
          ]);
          console.log("No contribution/consumption data found for:", docId);
        }
      } catch (err) {
        console.error("Error fetching credit data:", err);
        setError("Failed to load credit data.");
        setChartData([
          { name: "Contribution", contributed: 0 },
          { name: "Consumption", consumed: 0 },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchCreditData();
  }, [month, memberId, members]);

  useEffect(() => {
    return () => {
      handleMonthChange.cancel();
    };
  }, [handleMonthChange]);

  if (membersLoading) {
    return (
      <div className="text-center text-gray-600">
        Loading members data...
      </div>
    );
  }

  if (membersError) {
    return (
      <div className="text-center text-red-500">
        {membersError}
      </div>
    );
  }

  if (!members || !Array.isArray(members)) {
    return (
      <div className="text-center text-gray-600">
        No members data available.
      </div>
    );
  }

  if (!member) {
    return (
      <div className="text-center text-gray-600">
        Member not found.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-white rounded-full"></div>
            </div>
          </div>
          <div className="text-center space-y-2">
            <p className="text-lg font-medium text-gray-700">Loading credit data</p>
            <p className="text-sm text-gray-500">Please wait while we fetch your information</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  console.log("Chart data:", chartData);
  const contribution = chartData[0]?.contributed || 0;
  const consumption = chartData[1]?.consumed || 0;
  const balance = contribution - consumption;

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <div className="flex items-center space-x-4 mb-4 md:mb-0">
          <img
            className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
            src={member.imgSrc}
            alt={member.memberName}
          />
          <h3 className="text-2xl font-semibold text-gray-800">
            {member.memberName}
          </h3>
        </div>
        <SingleMonthYearPicker
          value={month}
          onChange={(newMonth) => setMonth(newMonth)}
          collections={["contributionConsumption"]}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                tick={{ fill: "#4B5563" }}
                axisLine={{ stroke: "#E5E7EB" }}
              />
              <YAxis
                tick={{ fill: "#4B5563" }}
                axisLine={{ stroke: "#E5E7EB" }}
                tickFormatter={(value) => `${value} tk`}
              />
              <Tooltip
                formatter={(value) => [`${value} tk`, ""]}
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                  border: "1px solid #E5E7EB",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
              />
              <Legend />
              <ReferenceLine y={0} stroke="#E5E7EB" />
              <Bar
                dataKey="contributed"
                fill="#4F46E5"
                radius={[4, 4, 0, 0]}
                name="Contribution"
              />
              <Bar
                dataKey="consumed"
                fill="#10B981"
                radius={[4, 4, 0, 0]}
                name="Consumption"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Contribution</span>
              <span className="text-xl font-semibold text-indigo-600">
                {contribution} tk
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Consumption</span>
              <span className="text-xl font-semibold text-emerald-600">
                {consumption} tk
              </span>
            </div>
            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Balance</span>
                <span
                  className={`text-xl font-semibold ${
                    balance >= 0 ? "text-indigo-600" : "text-red-500"
                  }`}
                >
                  {balance} tk
                </span>
              </div>
              {balance < 0 && (
                <p className="text-sm text-red-500 mt-2">
                  Please add funds to cover the negative balance
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreditChart;