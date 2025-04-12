"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMonth } from "@/App";
import { db } from "@/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { debounce } from "lodash"; // Install lodash if not present: npm install lodash

// Cache to store fetched months
const monthCache = new Map();

export const updateMonthCache = (collection, month) => {
  const cachedMonths = monthCache.get(collection) || [];
  if (!cachedMonths.includes(month)) {
    cachedMonths.push(month);
    monthCache.set(collection, [...new Set(cachedMonths)]);
  }
};

const SingleMonthYearPicker = ({ value, onChange, collections = [] }) => {
  const { month } = useMonth();
  const [monthsWithData, setMonthsWithData] = useState([]);

  // Debounced state update to reduce re-renders
  const debouncedSetMonths = useMemo(
    () =>
      debounce((months) => {
        setMonthsWithData(months);
      }, 100),
    []
  );

  useEffect(() => {
    const cacheKey = collections.sort().join(",");
    if (monthCache.has(cacheKey)) {
      debouncedSetMonths(monthCache.get(cacheKey));
    } else if (collections.length > 0) {
      const initialMonths = collections
        .flatMap((coll) => monthCache.get(coll) || [])
        .filter(Boolean);
      debouncedSetMonths([...new Set(initialMonths)]);
    }

    const unsubscribes = collections.map((coll) =>
      onSnapshot(
        collection(db, coll),
        (snapshot) => {
          const months = [];
          snapshot.forEach((doc) => {
            if (coll === "expenses" || coll === "contributionConsumption") {
              const data = doc.data();
              if (data.month) {
                months.push(data.month);
              } else if (data.date) {
                const date = new Date(data.date);
                if (!isNaN(date.getTime())) {
                  const year = date.getFullYear();
                  const monthNum = String(date.getMonth() + 1).padStart(2, "0");
                  months.push(`${year}-${monthNum}`);
                }
              }
            } else {
              months.push(doc.id);
            }
          });

          monthCache.set(coll, [...new Set(months)]);
          const allMonths = collections
            .flatMap((c) => monthCache.get(c) || [])
            .filter(Boolean);
          const uniqueMonths = [...new Set(allMonths)];
          debouncedSetMonths(uniqueMonths);
          monthCache.set(cacheKey, uniqueMonths);
        },
        (error) => {
          console.error(`Error listening to ${coll}:`, error);
          debouncedSetMonths([]);
        }
      )
    );

    return () => {
      unsubscribes.forEach((unsub) => unsub());
      debouncedSetMonths.cancel(); // Cleanup debounce
    };
  }, [collections, debouncedSetMonths]);

  const currentDate = new Date();
  const options = useMemo(() => {
    const opts = [];
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthName = date.toLocaleString("en-US", { month: "long" });
      const year = date.getFullYear().toString();
      const formattedMonth = String(date.getMonth() + 1).padStart(2, "0");
      opts.push({
        label: `${monthName} ${year}`,
        value: `${year}-${formattedMonth}`,
      });
    }
    return opts;
  }, []);

  const handleChange = (newValue) => {
    if (onChange) {
      onChange(newValue);
    }
  };

  return (
    <div className="w-max">
      <Select value={value || month} onValueChange={handleChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select Month and Year" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <div className="flex items-center">
                  <span>{option.label}</span>
                  {monthsWithData.includes(option.value) && (
                    <span className="ml-2 w-2 h-2 rounded-full bg-green-500" />
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};

export default SingleMonthYearPicker;