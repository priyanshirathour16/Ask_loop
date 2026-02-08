import React from "react";
import "./QueryLoader.css"; // Ensure you style as described below

const ScopeLoader = () => {
  return (
    <div className="query-loader row px-2 max-w-6xl flex justify-center mx-auto">
      

      {/* Right: Plain white col-md-9 */}
      <div className="col-md-12 plain-white">
        {[...Array(10)].map((_, index) => (
          <div key={index} className="skeleton skeleton-bar"></div>
        ))}
      </div>
    </div>
  );
};

export default ScopeLoader;
