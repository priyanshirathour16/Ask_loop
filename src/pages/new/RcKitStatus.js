import { useEffect, useState } from "react";

export default function RcKitStatus({ email }) {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!email) return;

    const fetchStatus = async () => {
      setLoading(true);
      setError("");
      setStatus(null);

      try {
        const response = await fetch(
          "https://rapidcollaborate.com/rc-stationery-kit-panel/order/getOrderStatus",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email }),
          }
        );

        const result = await response.json();

        if (result.status && result.data?.length > 0) {
          setStatus(result.data[0].fld_order_status);
        } else {
          setError(result.message || "No order status found");
        }
      } catch (err) {
        setError("Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, [email]);

  if (!email) return null;
  if (!status) return null;
  if (error) return null;
  if(loading) return null;

  return (
    <div className="px-4 py-1 f-12 flex space-x-2 items-center border  bg-white ">
      <h3 className="flex items-center text-sm font-semibold ">
        <img src="/stationery.svg" className="h-7 mr-2" />
       RC Stationery Kit Status : </h3>

      {status && (
          <span className="font-medium text-green-600">{status}</span>
      
      )}
    </div>
  );
}
