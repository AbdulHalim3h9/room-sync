"use client";

import React, { useState, useEffect, useCallback, useContext } from "react";
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
import { MembersContext } from "@/contexts/MembersContext";
import { MonthContext } from "@/contexts/MonthContext";
import { debounce } from "lodash";

const CreditChart = () => {
  const { memberId } = useParams();
  const { members, loading: membersLoading, error: membersError } = useContext(MembersContext);
  const { month } = useContext(MonthContext);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const member = Array.isArray(members)
    ? members.find((m) => m.memberId === memberId)
    : null;

  const fetchCreditData = useCallback(async () => {
    if (!month || !memberId || !member || !Array.isArray(members)) {
      setChartData([
        { name: "Contribution", contributed: 0 },
        { name: "Consumption", consumed: 0 },
      ]);
      setLoading(false);
      return;
    }

    // Verify member is active for the selected month
    const activeFromDate = new Date(member.activeFrom + "-01");
    const selectedMonthDate = new Date(month + "-01");
    if (activeFromDate > selectedMonthDate) {
      setChartData([
        { name: "Contribution", contributed: 0 },
        { name: "Consumption", consumed: 0 },
      ]);
      setError(`Member not active in ${month}.`);
      setLoading(false);
      return;
    }
    if (member.archiveFrom) {
      const archiveFromDate = new Date(member.archiveFrom + "-01");
      if (selectedMonthDate >= archiveFromDate) {
        setChartData([
          { name: "Contribution", contributed: 0 },
          { name: "Consumption", consumed: 0 },
        ]);
        setError(`Member archived in ${month}.`);
        setLoading(false);
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      const docId = `${month}-${member.memberName}`;
      const docRef = doc(db, "contributionConsumption", docId);
      const docSnap = await getDoc(docRef);
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
      } else {
        setChartData([
          { name: "Contribution", contributed: 0 },
          { name: "Consumption", consumed: 0 },
        ]);
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
  }, [month, memberId, member, members]);

  useEffect(() => {
    console.log("chartdata" + chartData[1]?.consumed);
    fetchCreditData();
  }, [fetchCreditData]);

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

  // Format number to 2 decimal places with ceiling
  const formatCurrency = (value) => {
    // Use Math.ceil to round up to nearest 2 decimal places
    const roundedValue = Math.ceil(value * 100) / 100;
    // Format to exactly 2 decimal places
    return roundedValue.toFixed(2);
  };

  const contribution = chartData[0]?.contributed || 0;
  const consumption = chartData[1]?.consumed || 0;
  const balance = contribution - consumption;

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg">
      <div className="flex flex-col items-center justify-center w-full mb-8">
        <div className="flex flex-col items-center w-full max-w-md">
          <div className="mb-4">
            <img
              className="w-28 h-28 rounded-full object-cover border-2 border-gray-200"
              src={member?.imgSrc || "/images/placeholder.jpg"}
              alt={member?.memberName || 'Member'}
            />
          </div>
          <h3 className="text-2xl font-semibold text-gray-800 text-center">
            {member?.memberName || 'Member'}
          </h3>
        </div>
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
                formatter={(value) => [`${formatCurrency(value)} tk`, ""]}
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
                {formatCurrency(contribution)} tk
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Consumption</span>
              <span className="text-xl font-semibold text-emerald-600">
                {formatCurrency(consumption)} tk
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
                  {formatCurrency(balance)} tk
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