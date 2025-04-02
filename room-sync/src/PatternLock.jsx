import React, { useState } from "react";
import PatternLock from "react-pattern-lock";

const PatternAuth = ({ onPatternSubmit }) => {
  const [pattern, setPattern] = useState([]);

  const handlePatternChange = (newPattern) => {
    setPattern(newPattern);
  };

  const handlePatternSubmit = () => {
    if (onPatternSubmit) {
      onPatternSubmit(pattern);
    }
  };

  return (
    <div>
      <PatternLock
        width={300}
        height={300}
        onChange={handlePatternChange}
        onSubmit={handlePatternSubmit}
        path={pattern}
        onFinish={handlePatternSubmit}
      />
      <button onClick={handlePatternSubmit}>Submit Pattern</button>
    </div>
  );
};

export default PatternAuth;
