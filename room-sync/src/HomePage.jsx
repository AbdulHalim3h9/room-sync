// HomePage.js
import React from "react";
import logOut from "./SignOut";

const HomePage = () => {
  const handleSignOut = () => {
    logOut(); // Call signOut function
  };

  return (
    <div>
      <h1>Welcome to the Home Page</h1>
      <button onClick={handleSignOut}>Sign Out</button>
    </div>
  );
};

export default HomePage;
