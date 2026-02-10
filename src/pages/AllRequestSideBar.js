import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";

import CustomLoader from "../CustomLoader";
import DataTable from "datatables.net-react";
import DT from "datatables.net-dt";
import $ from "jquery";
import QueryDetailsAdmin from "./QueryDetailsAdmin";
import { AnimatePresence } from "framer-motion";

const AllRequestSideBar = ({ refId, onClose }) => {
  const [quoteHistoryData, setQuoteHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuery, setSelectedQuery] = useState("");
  const [selectedQuote, setSelectedQuote] = useState("");
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  DataTable.use(DT);

  // Fetch Quote History Data
  const fetchAllRefRequest = async () => {
    try {
      const response = await fetch(
        "https://loopback-skci.onrender.com/api/scope/listaskforscope",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ref_id: refId }),
        },
      );

      if (response.ok) {
        const data = await response.json();
        if (data.status) {
          setQuoteHistoryData(data.allQuoteData);
        } else {
          console.error("No history data found.");
        }
      } else {
        console.error("Failed to fetch history:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching quote history:", error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "Ask For Scope ID",
      data: "id",
      width: "20x",
      orderable: true,
      className: "text-center",
      render: function (data, type, row) {
        // Handle cases where id might be null/undefined
        return data || row.ref_id || "N/A";
      },
    },
    {
      title: "CRM Name",
      data: "fld_first_name",
      orderable: false,
      render: (data, type, row) =>
        `<div style="text-align: left;">${row.fld_first_name + " " + (row.fld_last_name != null ? row.fld_last_name : "")}</div>`,
    },
    {
      title: "Currency",
      data: "null",
      orderable: false,
      render: function (data, type, row) {
        if (row.currency == "Other") {
          return row.other_currency;
        } else {
          return row.currency;
        }
      },
    },
    {
      title: "Comments",
      data: "comments",
      orderable: false,
      render: (data) => {
        // Check if the data is not empty and its length is greater than 50 characters
        const truncatedData =
          data && data.length > 40
            ? data.substring(0, 40) + "..."
            : data || "N/A";
        return `<div style="text-align: left;">${truncatedData}</div>`;
      },
    },
    {
      title: "Service",
      data: "service_name",
      orderable: false,
      render: (data) => `<div style="text-align: left;">${data || "N/A"}</div>`,
    },
    {
      title: "Quote Status",
      data: "status", // Replace with actual field name
      orderable: false,
      render: function (data, type, row) {
        if (row.isfeasability == 1 && row.submittedtoadmin == "false") {
          return '<span class="text-red-600 font-bold">Pending at User</span>';
        } else if (row.changestatus == 1 && row.submittedtoadmin == "false") {
          return '<span class="text-red-600 font-bold">Pending at User</span>';
        } else {
          if (data == 0) {
            return '<span class="text-red-600 font-bold">Pending at Admin</span>';
          } else if (data == 1) {
            return '<span class="text-green-600 font-bold">Submitted</span>';
          } else if (data == 2) {
            return '<span class="text-yellow-600 font-bold">Discount Requested</span>';
          }
        }
        return '<span class="text-gray-600">Unknown</span>';
      },
    },
    {
      title: "Feasibility Status",
      data: "feasability_status", // Replace with actual field name
      orderable: false,
      render: function (data, type, row) {
        if (row.isfeasability == 1) {
          if (data == "Pending") {
            return '<span class="text-red-600 font-bold">Pending</span>';
          } else if (data == "Completed") {
            return `
                            <div>
                                <span class="text-green-600 font-bold">Completed</span>
                            </div>
                        `;
          }
        }
        // Return "-" if no feasability_status is present
        return "-";
      },
    },
    {
      title: "Created Date",
      data: "created_date",
      orderable: false,
      render: (data) => {
        if (data) {
          const date = new Date(data * 1000);
          const day = date.getDate().toString().padStart(2, "0"); // Ensures two-digit day
          const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Ensures two-digit month
          const year = date.getFullYear().toString(); // Gets last two digits of the year
          return `${day}/${month}/${year}`;
        }
        return "N/A";
      },
    },
    {
      title: "Actions",
      data: null,
      orderable: false,
      render: (data, type, row) => `
        <button class="view-btn vd mx-1 p-1  text-white" style="font-size:10px;border-radius:3px;     white-space: nowrap;" data-id="${row.ref_id}">
            View Details
        </button>
      `,
    },
  ];

  useEffect(() => {
    fetchAllRefRequest();
  }, [refId]);

  const toggleDetailsPage = () => {
    setIsDetailsOpen(!isDetailsOpen);
  };

  const handleViewButtonClick = (query) => {
    setSelectedQuery(query);
    setSelectedQuote(query.id);
    setIsDetailsOpen(true);
  };

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: "0" }}
      exit={{ x: "100%" }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed right-0 top-0 h-full w-2/3 bg-gray-100 shadow-lg z-50 overflow-y-auto mt-0"
    >
      <div className="flex items-center justify-between bg-blue-400 text-white p-3">
        <h2 className="text-xl font-semibold">All Requests for {refId}</h2>

        <button
          onClick={onClose}
          className="text-white  hover:text-red-500 transition-colors p-1 rounded-full bg-red-600 hover:bg-red-500"
        >
          {/* <CircleX size={32} /> */}
          <X size={15} />
        </button>
      </div>

      {/* History Content */}
      <div className="p-3 space-y-4">
        {loading ? (
          <CustomLoader />
        ) : quoteHistoryData.length > 0 ? (
          <DataTable
            data={quoteHistoryData}
            columns={columns}
            options={{
              pageLength: 50,
              ordering: false,
              createdRow: (row, data) => {
                $(row)
                  .find(".view-btn")
                  .on("click", () => handleViewButtonClick(data));
              },
            }}
          />
        ) : (
          <p className="text-center text-gray-600">No history available.</p>
        )}
      </div>
      <AnimatePresence>
        {isDetailsOpen && (
          <QueryDetailsAdmin
            onClose={toggleDetailsPage}
            quotationId={selectedQuote}
            queryId={selectedQuery.ref_id}
            viewAll={false}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AllRequestSideBar;
