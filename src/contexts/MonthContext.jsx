"use client";

import React, { createContext, useState } from "react";

export const MonthContext = createContext();

export const MonthProvider = ({ children }) => {
  const [month, setMonth] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  });

  return (
    <MonthContext.Provider value={{ month, setMonth }}>
      {children}
    </MonthContext.Provider>
  );
};