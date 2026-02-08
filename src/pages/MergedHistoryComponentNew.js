import React, { useState, useEffect } from "react";
import "react-toastify/dist/ReactToastify.css";
import CustomLoader from "../CustomLoader";

const MergedHistoryComponentNew = ({ refId, quoteId, onClose, onlyFetch, quote }) => {
  const [quoteHistoryData, setQuoteHistoryData] = useState([]);
  const [feasibilityHistoryData, setFeasibilityHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch Quote History Data
  const fetchQuoteHistory = async () => {
    try {
      const response = await fetch(
        "https://loopback-skci.onrender.com/api/scope/getquotehistory",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ref_id: refId, quote_id: quoteId }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.status) {
          setQuoteHistoryData(data.historyData);
        }
      }
    } catch (error) {
      console.error("Error fetching quote history:", error);
    }
  };

  // Fetch Feasibility History Data
  const fetchFeasibilityHistory = async () => {
    try {
      const response = await fetch(
        "https://loopback-skci.onrender.com/api/scope/getFeasabilityHistory",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ref_id: refId, quote_id: quoteId }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.status) {
          setFeasibilityHistoryData(data.historyData);
        }
      }
    } catch (error) {
      console.error("Error fetching feasibility history:", error);
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchQuoteHistory(), fetchFeasibilityHistory()]).finally(() =>
      setLoading(false)
    );
  }, [refId, quoteId, quote]);

  return (
    <div className="overflow-y-auto flex flex-col border space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between bg-blue-400 text-white py-2 px-2">
        <h2 className="f-12 font-semibold">{onlyFetch == 'quote' ? "Quote History" : "Feasibility History"}</h2>
      </div>

      {/* Content */}
      <div className="flex lg:space-x-4 w-full mt-0">
        {/* Quote History */}
        {onlyFetch == "quote" ? (
          <div
            className={`${"w-full"
              } bg-white p-2 px-2 rounded shadow-sm space-y-4`}
          >

            {loading ? (
              <CustomLoader />
            ) : quoteHistoryData.length > 0 ? (
              quoteHistoryData.map((item) => (
                <div
                  key={item.id}
                  className=" text-gray-600 mt-1"
                  style={{ fontSize: "12px" }}
                >
                  <p>
                    <strong>
                      {item.isdeleted == 1 ? (
                        <span
                          style={{
                            textDecoration: "line-through",
                            color: "red",
                          }}
                          title="This user was deleted"
                        >
                          {item.deleted_user_name}
                        </span>
                      ) : (
                        item.fld_first_name +
                        (item.fld_last_name ? ` ${item.fld_last_name}` : "")
                      )}
                    </strong>{" "}
                    {item.message}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(item.created_at).toLocaleString("en-US", {
                      weekday: "short",
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-600">No history available.</p>
            )}
          </div>
        ) : loading ? (
          <CustomLoader />
        ) : (
          feasibilityHistoryData.length > 0 && (
            <div className="w-full bg-white p-2 rounded shadow-sm">

              {feasibilityHistoryData.map((item) => (
                <div
                  key={item.id}
                  className=" text-gray-600"
                  style={{ fontSize: "11px" }}
                >
                  <p>
                    <strong>
                      {item.isfromdeleted == 1 ? (
                        <span
                          style={{
                            textDecoration: "line-through",
                            color: "red",
                          }}
                        >
                          {item.deleted_from_user_name}
                        </span>
                      ) : (
                        item.from_first_name + item.from_last_name
                      )}
                    </strong>{" "}
                    {item.to_first_name && item.to_last_name && (
                      <>
                        {" "}
                        to{" "}
                        <strong>
                          {" "}
                          {item.istodeleted == 1 ? (
                            <span
                              style={{
                                textDecoration: "line-through",
                                color: "red",
                              }}
                            >
                              {item.deleted_to_user_name}
                            </span>
                          ) : (
                            item.to_first_name + item.to_last_name
                          )}
                        </strong>
                      </>
                    )}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(item.created_at).toLocaleString("en-US", {
                      weekday: "short", // Mon, Tue, etc.
                      year: "numeric", // Full year (e.g., 2025)
                      month: "short", // Jan, Feb, etc.
                      day: "numeric", // Day of the month
                      hour: "2-digit", // Hours
                      minute: "2-digit", // Minutes
                      hour12: true, // AM/PM format
                    })}
                  </p>

                  <p>{item.message}</p>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default MergedHistoryComponentNew;
