import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import "react-toastify/dist/ReactToastify.css";
import CustomLoader from "../CustomLoader";
import { Chat } from "./Chat";
import AskPtp from "./AskPtp";
import DemoDone from "./DemoDone";
import {
  CheckCircle2,
  Info,
  PlusCircle,
  RefreshCcw,
  ChevronUp,
  ChevronDown,
  ArrowDown,
  ArrowUp,
  Edit,
  Settings2,
  History,
  ArrowLeftRight,
} from "lucide-react";
import SubmitRequestQuote from "./SubmitRequestQuote";
import { AnimatePresence } from "framer-motion";
import EditRequestForm from "./EditRequestForm";
import "react-quill/dist/quill.snow.css";
import ReactQuill from "react-quill";
import TransferForm from "./TransferForm";

const AdminFeasViewDetails = ({
  queryId,
  userType,
  quotationId,
  finalFunction,
}) => {
  const [scopeDetails, setScopeDetails] = useState(null);
  const [assignQuoteInfo, setAssignQuoteInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [priceLoading, setPriceLoading] = useState(false);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [assignLoading, setAssignLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [quotePrice, setQuotePrice] = useState("");
  const [userComments, setUserComments] = useState("");
  const [ConsultantUserData, setConsultantUserData] = useState([]);
  const [quoteAmount, setQuoteAmount] = useState("");
  const [comment, setComment] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [adminComments, setAdminComments] = useState("");
  const userData = localStorage.getItem("user");
  const loopuserData = localStorage.getItem("loopuser");
  const [expandedRowIndex, setExpandedRowIndex] = useState(null);
  const [addNewFormOpen, setAddNewFormOpen] = useState(false);
  const [editFormOpen, setEditFormOpen] = useState(false);
  const [selectedQuoteId, setSelectedQuoteId] = useState("");
  const [selectedRefId, setSelectedRefId] = useState("");
  const [historyData, setHistoryData] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [feasabilityComments, setFeasabilityComments] = useState("");

  const [transferForm, setTransferForm] = useState(false);

  const toggleRow = (index) => {
    setExpandedRowIndex(expandedRowIndex === index ? null : index);
  };

  const userObject = JSON.parse(userData);
  const loopUserObject = JSON.parse(loopuserData);

  const thisUserId = loopUserObject.id;

  const fetchScopeDetails = async () => {
    setLoading(true); // Show loading spinner
    let hasResponse = false;
    try {
      const response = await fetch(
        "https://loopback-skci.onrender.com/api/scope/adminScopeDetails",
        {
          method: "POST", // Use POST method
          headers: {
            "Content-Type": "application/json", // Set content type to JSON
          },
          body: JSON.stringify({ ref_id: queryId, quote_id: quotationId }), // Send the ref_id
        },
      );

      const data = await response.json(); // Parse the response as JSON
      // console.log(data);

      if (data.status) {
        if (data.quoteInfo != null && Array.isArray(data.quoteInfo)) {
          // If quoteInfo is an array, process each entry
          const parsedQuoteInfo = data.quoteInfo.map((quote) => ({
            ...quote,
            relevant_file: quote.relevant_file
              ? JSON.parse(quote.relevant_file)
              : [], // Parse the file data if present
          }));

          setScopeDetails(parsedQuoteInfo); // Set the array of quotes
          setAssignQuoteInfo(data.assignQuoteInfo); // Assuming you also want to set assignQuoteInfo
        } else {
          setScopeDetails(null); // If no quoteInfo, set scopeDetails to null
        }
      } else {
        console.error("Failed to fetch Details:", data.message);
      }
      hasResponse = true;
    } catch (error) {
      console.error("Error fetching details:", error);
    } finally {
      if (hasResponse) {
        setLoading(false); // Hide the loader
      }
    }
  };

  useEffect(() => {
    if (queryId) {
      fetchScopeDetails(); // Fetch the scope details when the component mounts
      fetchFeasibilityHistory(queryId, quotationId);
    }
  }, [queryId]);

  const formatDate = (timestamp) => {
    const date = new Date(timestamp * 1000); // Convert Unix timestamp to Date object
    return date.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
  };

  const getStatusText = (status) => {
    switch (status) {
      case 0:
        return "Pending";
      case 1:
        return "Submitted";
      default:
        return "Unknown";
    }
  };

  const fetchFeasibilityHistory = async (assign_id, quote_id) => {
    const payload = {
      ref_id: assign_id,
      quote_id: quote_id,
    };

    try {
      setHistoryLoading(true);
      const response = await fetch(
        "https://loopback-skci.onrender.com/api/scope/getFeasabilityHistory",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      const data = await response.json();
      if (data.status) {
        setHistoryData(data.historyData);
      }
    } catch (error) {
      console.error("Error fetching feasibility history:", error);
    } finally {
      setHistoryLoading(false);
    }
  };

  const toggleTransferForm = () => setTransferForm((prev) => !prev);

  return (
    <div className=" h-full bg-gray-100 shadow-lg z-50 overflow-y-auto mt-2 rounded w-full">
      <div className="flex items-center justify-between bg-blue-400 text-white py-2 px-3">
        <h2 className="text-xl font-semibold ">Check Feasibility </h2>
        <div className="flex items-center justify-between">
          <RefreshCcw
            size={20}
            onClick={fetchScopeDetails}
            data-tooltip-id="my-tooltip"
            data-tooltip-content="Refresh"
            className="cursor-pointer"
          />
        </div>
      </div>

      {loading ? (
        <CustomLoader /> // A loader component when data is being fetched
      ) : (
        <div className="p-2 f-14">
          {errorMessage && <p className="text-red-600">{errorMessage}</p>}

          {scopeDetails && scopeDetails.length > 0 ? (
            <div className="space-y-6">
              {scopeDetails.map((quote, index) => (
                <div
                  key={index}
                  className="p-4 pb-0 border border-gray-300 rounded-md shadow-md bg-white space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <p>
                      <strong>Ref No.:</strong> {quote.assign_id}
                      {quote.ptp == "Yes" && (
                        <span
                          className="inline-block pl-3 pr-2 py-1 f-10 ml-1"
                          style={{
                            backgroundColor: "#2B9758FF",
                            clipPath:
                              "polygon(25% 0%, 100% 0, 100% 99%, 25% 100%, 0% 50%)",
                            color: "#ffffff",
                            fontSize: "14px",
                            fontWeight: "bold",
                            lineHeight: "1.5",
                          }}
                        >
                          PTP
                        </span>
                      )}
                    </p>
                  </div>
                  {quote.tag_names && (
                    <p>
                      <strong>Tags:</strong>
                      {quote.tag_names.split(",").map((tag, index) => (
                        <span
                          key={index}
                          className="text-blue-500 hover:bg-blue-100 hover:text-blue-600 p-1 rounded-full text-sm font-medium inline-block ml-1"
                        >
                          #{tag.trim()}
                        </span>
                      ))}
                    </p>
                  )}
                  <p>
                    <strong>Currency:</strong>{" "}
                    {quote.currency === "Other"
                      ? quote.other_currency
                      : quote.currency}
                  </p>
                  {quote.service_name && quote.plan && (
                    <>
                      <p>
                        <strong>Service Required:</strong> {quote.service_name}
                      </p>
                      <p>
                        <strong>Plan:</strong> {quote.plan}
                      </p>
                    </>
                  )}
                  <p className="">
                    <strong className="">Comments:</strong>
                  </p>
                  <span dangerouslySetInnerHTML={{ __html: quote.comments }} />
                  <p className="flex ">
                    <strong>Created Date:</strong>{" "}
                    {new Date(quote.created_date * 1000).toLocaleDateString(
                      "en-GB",
                    )}
                  </p>
                  {quote.relevant_file && quote.relevant_file.length > 0 && (
                    <div className="">
                      <strong>Relevant Files:</strong>
                      <div className="space-y-2">
                        {quote.relevant_file.map((file, fileIndex) => (
                          <div key={fileIndex}>
                            <a
                              href={`https://apacvault.com/public/QuotationFolder/${file.file_path}`}
                              download
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500"
                            >
                              {file.filename}
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {quote.ptp != null && (
                    <>
                      <p>
                        <strong>PTP:</strong> {quote.ptp}
                      </p>
                      <p>
                        <strong>PTP Comments:</strong> {quote.ptp_comments}
                      </p>
                    </>
                  )}
                  {quote.demodone != 0 && (
                    <p className="flex items-center">
                      <span className="">
                        <strong>Demo Id:</strong> {quote.demo_id}
                      </span>
                      <span className="badge-success px-2 py-1 f-10 ml-3 rounded-sm text-white-900 font-semibold flex items-center">
                        Demo Completed{" "}
                        <CheckCircle2 size={12} className="ml-2" />
                      </span>
                    </p>
                  )}
                  {quote.demo_duration && (
                    <>
                      <p className="mb-3">
                        {" "}
                        <div>
                          <strong>Demo Duration </strong>{" "}
                        </div>
                        <div className="flex items-center">
                          <div className="line-h-in">{quote.demo_duration}</div>
                        </div>
                      </p>
                    </>
                  )}
                  {quote.quote_status != 0 &&
                    quote.quote_price &&
                    quote.plan && (
                      <>
                        <p>
                          <strong>Quote Price:</strong>{" "}
                          {(() => {
                            const prices = quote.quote_price.split(",");
                            const plans = quote.plan.split(",");
                            return plans.map((plan, index) => (
                              <span
                                key={index}
                                className={
                                  quote.discount_price != null
                                    ? "line-through bg-red-200 p-1 rounded mr-1 f-12"
                                    : ""
                                }
                              >
                                <strong>{plan}</strong>:{" "}
                                {quote.currency === "Other"
                                  ? quote.other_currency
                                  : quote.currency}{" "}
                                {prices[index]}
                                {index < plans.length - 1 && ", "}
                              </span>
                            ));
                          })()}
                        </p>
                        {quote.discount_price && (
                          <p>
                            <strong>Discounted Price:</strong>{" "}
                            {(() => {
                              const prices = quote.discount_price.split(",");
                              const plans = quote.plan.split(",");
                              return plans.map((plan, index) => (
                                <span
                                  key={index}
                                  className="bg-[#FFD700] px-1 py-1 f-12 rounded mr-1"
                                >
                                  <strong>{plan}</strong>:{" "}
                                  {quote.currency === "Other"
                                    ? quote.other_currency
                                    : quote.currency}{" "}
                                  {prices[index]}
                                  {index < plans.length - 1 && ", "}
                                </span>
                              ));
                            })()}
                          </p>
                        )}
                        {quote.user_comments && (
                          <p>
                            <strong>Comments:</strong> {quote.user_comments}
                          </p>
                        )}
                      </>
                    )}
                  <p className="flex items-center">
                    <strong>Quote Status:</strong>{" "}
                    <span
                      className={
                        quote.quote_status == 0
                          ? "badge-danger p-1 f-10 rounded-sm px-2 font-semibold ml-2"
                          : quote.quote_status == 1
                            ? "badge-success p-1 f-10 rounded-sm px-2 font-semibold ml-2"
                            : "text-warning p-1 f-10 rounded-sm px-2 font-semibold ml-2"
                      }
                    >
                      {quote.quote_status == 0 &&
                      quote.submittedtoadmin == "false"
                        ? "Pending at User"
                        : quote.quote_status == 0 &&
                            quote.submittedtoadmin == "true"
                          ? "Pending at Admin"
                          : quote.quote_status == 1
                            ? "Submitted"
                            : quote.quote_status == 2
                              ? "Discount Requested"
                              : "Unknown"}
                    </span>
                  </p>
                  {assignQuoteInfo && assignQuoteInfo !== false && (
                    <p>
                      <strong>Assigned To:</strong> {assignQuoteInfo.name}
                    </p>
                  )}
                  <p className="flex items-center">
                    <strong className="mr-1">Feasibility status is : </strong>
                    <span
                      className={
                        quote.feasability_status == "Pending"
                          ? "badge-danger p-1 f-10 rounded-sm px-2 font-semibold"
                          : "badge-success p-1 f-10 rounded-sm px-2 font-semibold"
                      }
                    >
                      {quote.feasability_status}
                    </span>
                  </p>
                  <p>
                    <strong>Feasibility Comments:</strong>
                    {quote.feasability_status == "Completed" && (
                      <span
                        className="mt-2"
                        dangerouslySetInnerHTML={{
                          __html: quote.feasability_comments,
                        }}
                      />
                    )}
                  </p>

                  {historyData.length > 0 && (
                    <div className="mt-4 space-y-4">
                      <strong className="">Feasibility Check History:</strong>
                      <div className="">
                        {historyData.map((historyItem, index) => (
                          <div key={historyItem.id} className="mb-4">
                            <div className="flex items-start space-x-3">
                              {/* Timeline Icon */}
                              <div className="w-h-2 bg-blue-500 rounded-full mt-1"></div>
                              <div className="flex flex-col">
                                {/* User Details */}
                                <p className="font-semibold text-gray-700">
                                  {historyItem.from_first_name}{" "}
                                  {historyItem.from_last_name}
                                  {historyItem.to_first_name &&
                                    historyItem.to_first_name && (
                                      <span className="text-gray-500 text-xs">
                                        {" "}
                                        to{" "}
                                      </span>
                                    )}
                                  {historyItem.to_first_name}{" "}
                                  {historyItem.to_last_name}
                                </p>
                                <p className="text-gray-500">
                                  {historyItem.created_at}
                                </p>
                                <p className="text-gray-600">
                                  {historyItem.message}
                                </p>
                              </div>
                            </div>
                            {/* Message */}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex justify-center items-center">
              <p className="flex items-center justify-between">
                <Info className="mr-2" /> No Previous Requests
              </p>
            </div>
          )}

          <AnimatePresence></AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default AdminFeasViewDetails;
