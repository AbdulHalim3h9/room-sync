import React, { useState, useEffect } from "react";
import Overview from "./Overview"; // Import your chart component

const ResponsiveChartWrapper = () => {
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Set the initial state

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        // height: "100vh",
        // width: "100vw",
        height: isSmallScreen ? "100vh" : "100vw",
        width: isSmallScreen ? "100vw" : "100vh",
        transform: isSmallScreen ? "rotate(90deg)" : "rotate(0deg)",
        transformOrigin: "center",
        // overflow: "hidden",
      }}
    >
      <Overview />
    </div>
  );
};

export default ResponsiveChartWrapper;
