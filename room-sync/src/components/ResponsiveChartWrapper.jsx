import React, { useState, useEffect } from "react";
import Overview from "./Overview"; // Import your chart component

const ResponsiveChartWrapper = () => {

  return (
    <div
      // style={{
      //   display: "flex",
      //   justifyContent: "center",
      //   alignItems: "center",
      //   // height: "100vh",
      //   // width: "100vw",
      //   height: isSmallScreen ? "100vw" : "100vh",
      //   width: isSmallScreen ? "100vh" : "100vw",
      //   transform: isSmallScreen ? "rotate(90deg)" : "rotate(0deg)",
      //   transformOrigin: "center",
      //   // overflow: "hidden",
      // }}
    >
      <Overview />
    </div>
  );
};

export default ResponsiveChartWrapper;
