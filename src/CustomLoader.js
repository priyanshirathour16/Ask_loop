import React, { useState, useEffect } from 'react';
import ScaleLoader from 'react-spinners/ScaleLoader';
import loader from './loader.gif';
import { InfinitySpin } from 'react-loader-spinner';
const CustomLoader = ({width}) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate data fetching
    const timer = setTimeout(() => setLoading(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex items-center justify-center">
      {loading && (
        // <ScaleLoader
        //   color="#3498db" // Customize color
        //   size={25}       // Customize size
        //   speedMultiplier={2} // Customize speed
        // />
        // <img src={loader} />
        <InfinitySpin
        visible={true}
        width={width && width != "" ? width : "200"}
        color="#f36730"
        ariaLabel="infinity-spin-loading"
        
        />
      )}
    </div>
  );
};

export default CustomLoader;
