import React from 'react';

// Function to format timestamp into relative time (e.g., "yesterday", "2 days ago")
const getRelativeTime = (timestamp) => {
  if (!timestamp) return "Never";

  const now = new Date();
  const date = new Date(timestamp);
  const diffInMs = now - date; // Difference in milliseconds
  const diffInSeconds = Math.floor(diffInMs / 1000); // Difference in seconds
  const diffInMinutes = Math.floor(diffInSeconds / 60); // Difference in minutes
  const diffInHours = Math.floor(diffInMinutes / 60); // Difference in hours
  const diffInDays = Math.floor(diffInHours / 24); // Difference in days

  if (diffInDays === 0) {
    // Today
    if (diffInHours === 0) {
      if (diffInMinutes <= 1) return "Just now";
      return `${diffInMinutes} minutes ago`;
    }
    return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
  } else if (diffInDays === 1) {
    return "Yesterday";
  } else if (diffInDays <= 7) {
    return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
  } else {
    // More than a week ago, show the full date
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }
};

const LastUpdated = ({ timestamp, className = "" }) => {
  const relativeTime = getRelativeTime(timestamp);

  return (
    <div className={`bg-gray-50 border-t py-3 text-xs text-gray-500 flex items-center gap-1 justify-end ${className}`}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-3 w-3"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <span>Last updated: {relativeTime}</span>
    </div>
  );
};

export default LastUpdated;