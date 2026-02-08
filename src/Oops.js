import { useEffect, useState } from "react";

const Oops = () => {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 1) {
          window.location.href = "https://www.apacvault.com/login";
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 text-gray-800">
      <h1 className="text-4xl font-bold mb-4">Oops! Missing or Invalid Token.</h1>
      <h6 className="text-4xl font-bold mb-4 text-gray-400">Please Login again to continue.</h6>
      <p className="text-lg">Redirecting to login page in <span className="font-semibold">{countdown}</span> seconds...</p>
    </div>
  );
};

export default Oops;
