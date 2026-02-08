import React, { createContext, useState, useContext, useEffect } from "react";

const QuoteContext = createContext();

export const useQuoteContext = () => useContext(QuoteContext);

export const QuoteProvider = ({ children }) => {
  const [quotes, setQuotes] = useState([]);
  const [userPendingQuotes, setUserPendingQuotes] = useState([]);
  const [adminPendingQuotes, setAdminPendingQuotes] = useState([]);
  const [users, setUsers] = useState([]);
  const [pendingFeasRequestCount, setPendingFeasRequestCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchQuotes = async (nopayload = false) => {
    setLoading(true);

    const payload = nopayload
      ? {}
      : {
        userid: "", // Add filters as needed
        ref_id: "",
        search_keywords: "",
        status: "",
        service_name: "",
        ptp: "",
        tags: [],
        feasability_status: "",
        start_date: null,
        end_date: null,
      };

    try {
      const response = await fetch("https://loopback-skci.onrender.com/api/scope/listaskforscope", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.status) {
        setQuotes(data.allQuoteData);

        const userPending = data.allQuoteData.filter(
          (quote) => quote.submittedtoadmin === "false"
        );
        const adminPending = data.allQuoteData.filter(
          (quote) => quote.submittedtoadmin === "true" && quote.status == 0
        );

        setUserPendingQuotes(userPending);
        setAdminPendingQuotes(adminPending);
        setUsers(data.users);
        setPendingFeasRequestCount(data.pendingFeasRequestCount);
      } else {
        console.error("Failed to fetch quotes:", data.message);
      }
    } catch (error) {
      console.error("Error fetching quotes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotes(); // Fetch quotes on mount
  }, []);

  return (
    <QuoteContext.Provider
      value={{
        quotes,
        userPendingQuotes,
        adminPendingQuotes,
        users,
        pendingFeasRequestCount,
        loading,
        fetchQuotes,
      }}
    >
      {children}
    </QuoteContext.Provider>
  );
};
