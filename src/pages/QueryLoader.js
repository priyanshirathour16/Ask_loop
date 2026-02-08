import React from "react";
import "./QueryLoader.css"; // Ensure you style as described below

const QueryLoader = () => {
  return (
    <div className="query-loader row px-2 max-w-6xl flex justify-center mx-auto">
      {/* Left: Skeleton Loader for col-md-3 */}
      <div className="skeleton-container col-md-12">
        {[...Array(18)].map((_, index) => (
          <div key={index} className="skeleton skeleton-line"></div>
        ))}
      </div>
    </div>
  );
};

export default QueryLoader;
