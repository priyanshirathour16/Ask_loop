import React, { useState, useEffect } from "react";
import { Toaster } from "react-hot-toast";
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
  BotOff,
  Share2,
  Headset,
} from "lucide-react";
import SubmitRequestQuote from "./SubmitRequestQuote";
import { AnimatePresence } from "framer-motion";
import EditRequestForm from "./EditRequestForm";
import "react-quill/dist/quill.snow.css";
import ReactQuill from "react-quill";
import TransferForm from "./TransferForm";
import { io } from "socket.io-client";
import ScopeLoader from "./ScopeLoader";
import { getSocket } from "./Socket";
import CallRecordingPending from "./CallRecordingPending";
import academic from "../academic.svg";
import experiment from "../poll.svg";

const FeasabilityUpdate = ({
  queryId,
  userType,
  quotationId,
  finalFunction,
}) => {
  const socket = getSocket();
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
  const [selectedFile, setSelectedFile] = useState(null);

  const [tags, setTags] = useState([]);
  const fetchTags = async () => {
    try {
      const response = await fetch(
        "https://loopback-skci.onrender.com/api/scope/getTags",
      );
      const data = await response.json();
      if (data.status) setTags(data.data || []);
    } catch (error) {}
  };

  const modules = {
    toolbar: [
      [{ header: [1, 2, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ color: [] }, { background: [] }], // Text color & highlight
      [{ list: "ordered" }, { list: "bullet" }],
      ["blockquote", "code-block"],
      ["clean"],
    ],
  };

  const [transferForm, setTransferForm] = useState(false);

  const toggleRow = (index) => {
    setExpandedRowIndex(expandedRowIndex === index ? null : index);
  };

  const userObject = JSON.parse(userData);
  const loopUserObject = JSON.parse(loopuserData);

  const thisUserId = loopUserObject.id;

  const numberToWords = (num) => {
    const toWords = require("number-to-words");
    return toWords.toWords(Number(num));
  };

  const fetchScopeDetails = async () => {
    setLoading(true); // Show loading spinner

    try {
      const response = await fetch(
        "https://loopback-skci.onrender.com/api/scope/adminScopeDetails",
        {
          method: "POST", // Use POST method
          headers: {
            "Content-Type": "application/json", // Set content type to JSON
          },
          body: JSON.stringify({
            ref_id: queryId,
            user_type: userType,
            quote_id: quotationId,
          }), // Send the ref_id
        },
      );

      const data = await response.json(); // Parse the response as JSON

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
    } catch (error) {
      console.error("Error fetching details:", error);
    } finally {
      setLoading(false); // Hide loading spinner
    }
  };

  const fetchScopeDetailsForSocket = async () => {
    try {
      const response = await fetch(
        "https://loopback-skci.onrender.com/api/scope/adminScopeDetails",
        {
          method: "POST", // Use POST method
          headers: {
            "Content-Type": "application/json", // Set content type to JSON
          },
          body: JSON.stringify({
            ref_id: queryId,
            user_type: userType,
            quote_id: quotationId,
          }), // Send the ref_id
        },
      );

      const data = await response.json(); // Parse the response as JSON

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
    } catch (error) {
      console.error("Error fetching details:", error);
    }
  };

  useEffect(() => {
    const savedComments = localStorage.getItem(
      `feasabilityComments_${quotationId}`,
    );
    if (savedComments) {
      setFeasabilityComments(savedComments); // Set the comment state for this specific quotationId
    }
  }, [quotationId]); // Re-run when the `quotationId` changes

  const handleCommentsChange = (value) => {
    setFeasabilityComments(value);
    localStorage.setItem(`feasabilityComments_${quotationId}`, value);
  };

  const checkAccessType = () => {
    // if(scopeDetails.isfeasability == 1 && scopeDetails[0].feasability_user != thisUserId){
    //     toast.error("You dont have access for this");
    // }
    // console.log("scopedetails is" + scopeDetails);
  };

  useEffect(() => {
    if (queryId) {
      fetchScopeDetails(); // Fetch the scope details when the component mounts
      fetchTags();
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

  useEffect(() => {
    socket.on("discountReceived", (data) => {
      if (data.quote_id == quotationId) {
        fetchScopeDetailsForSocket();
      }
    });

    return () => {
      socket.off("discountReceived"); // Clean up on component unmount
    };
  }, []);

  useEffect(() => {
    socket.on("demoDone", (data) => {
      if (data.ref_id == queryId) {
        fetchScopeDetailsForSocket();
      }
    });
    return () => {
      socket.off("demoDone"); // Clean up on component unmount
    };
  }, []);

  const toggleTransferForm = () => setTransferForm((prev) => !prev);

  return (
    <div className=" h-full bg-gray-100 shadow-lg z-50 overflow-y-auto mt-2 rounded w-full">
      <div className="flex items-center justify-between bg-blue-400 text-white py-2 px-3">
        <h2 className="text-xl font-semibold ">Check Feasibility </h2>
        <div className="flex items-center justify-between">
          <RefreshCcw
            size={20}
            onClick={fetchScopeDetails}
            className="cursor-pointer"
          />
        </div>
      </div>

      {loading ? (
        <ScopeLoader /> // A loader component when data is being fetched
      ) : (
        <div className="bg-white p-6 m-2 shadow rounded-md space-y-4 f-14">
          {errorMessage && <p className="text-red-600">{errorMessage}</p>}

          {scopeDetails && scopeDetails.length > 0 ? (
            <div className="space-y-6">
              {scopeDetails.map((quote, index) => (
                <div
                  key={index}
                  className="p-4 border border-gray-300 rounded-md shadow-md bg-white space-y-4"
                >
                  {quote.isfeasability == 1 &&
                  (quote.feasability_user == thisUserId ||
                    loopUserObject.feasibility_access == 1) ? (
                    <>
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
                          {quote.callrecordingpending == 1 && (
                            <span
                              className="text-orange-600 rounded-full text-sm ml-2"
                              style={{
                                fontSize: "11px",
                                padding: "1px 6px",
                              }}
                            >
                              <Headset size={13} />
                            </span>
                          )}
                          {quote.timeline && (
                            <span
                              className={`${quote.timeline == "normal" ? "text-red-600 bg-red-100" : "text-blue-600 bg-blue-100"} rounded-full text-sm ml-2 px-1 py-0.5`}
                              style={{
                                fontSize: "11px",
                              }}
                              data-tooltip-id={
                                quote.timeline == "normal" ? "" : "my-tooltip"
                              }
                              data-tooltip-content={
                                quote.timeline_days + " days"
                              }
                            >
                              {quote.timeline.charAt(0).toUpperCase() +
                                quote.timeline.slice(1)}
                            </span>
                          )}
                        </p>
                        {quote.feasability_status == "Pending" && (
                          <button
                            onClick={toggleTransferForm}
                            className="flex items-center mr-3  px-2 py-1 btn btn-outline-success f-14"
                          >
                            <ArrowLeftRight size={15} className="mr-1" />{" "}
                            Transfer
                          </button>
                        )}
                      </div>
                      {quote.tags && (
                        <div className="flex items-end mb-3 justify-between">
                          <div>
                            <div>
                              <strong>Tags</strong>
                            </div>
                            {quote.tags
                              .split(",")
                              .map((tagId) => {
                                const tag = tags.find(
                                  (t) => t.id == tagId.trim(),
                                );
                                return tag ? tag.tag_name : null;
                              })
                              .filter(Boolean)
                              .map((tagName, index) => (
                                <span
                                  key={index}
                                  className="badge badge-primary f-10 mr-1"
                                >
                                  # {tagName}
                                </span>
                              ))}
                          </div>
                          {quote.tags_updated_time && (
                            <p className="text-gray-500 tenpx whitespace-nowrap">
                              {new Date(quote.tags_updated_time)
                                .toLocaleDateString("en-US", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                  hour: "numeric",
                                  minute: "2-digit",
                                  hour12: true,
                                })
                                .replace(",", ",")}
                            </p>
                          )}
                        </div>
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
                            <strong>Service Required:</strong>{" "}
                            {quote.service_name}
                          </p>
                          <p>
                            <strong>Plan:</strong> {quote.plan}
                          </p>
                        </>
                      )}
                      {quote.subject_area && (
                        <>
                          <p>
                            <strong>Subject Area:</strong> {quote.subject_area}
                          </p>
                          {quote.subject_area == "Other" && (
                            <p className="text-gray-500">
                              <strong>Other Subject Area name:</strong>{" "}
                              {quote.other_subject_area}
                            </p>
                          )}
                        </>
                      )}

                      {/* Plan Details Section */}
                      {(quote.basic_info ||
                        quote.standard_info ||
                        quote.advanced_info) && (
                        <div className="mb-4">
                          <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b border-gray-200 pb-2">
                            📋 Plan Details
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                            {/* Basic Plan */}
                            {quote.basic_info &&
                              (() => {
                                try {
                                  const basicInfo = JSON.parse(
                                    quote.basic_info,
                                  );
                                  return (
                                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-3 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                                      <div className="flex items-center justify-between mb-2">
                                        <h4 className="text-sm font-bold text-blue-800 flex items-center">
                                          <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                                          Basic Plan
                                        </h4>
                                        <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                                          {basicInfo.noOfWords} words
                                        </span>
                                      </div>

                                      {basicInfo.milestoneData &&
                                        basicInfo.milestoneData.length > 0 && (
                                          <div className="space-y-2">
                                            <p className="text-xs font-semibold text-gray-700 flex items-center">
                                              <span className="w-1 h-1 bg-gray-500 rounded-full mr-1"></span>
                                              {basicInfo.milestones} Milestones
                                            </p>
                                            <div className="max-h-32 overflow-y-auto space-y-1.5">
                                              {basicInfo.milestoneData.map(
                                                (milestone, idx) => (
                                                  <div
                                                    key={idx}
                                                    className="bg-white rounded-lg p-2 border border-blue-100"
                                                  >
                                                    <p className="text-xs font-medium text-gray-800 mb-1 line-clamp-2">
                                                      {milestone.name}
                                                    </p>
                                                    {milestone.parametersData &&
                                                      milestone.parametersData.map(
                                                        (param, pIdx) => (
                                                          <div
                                                            key={pIdx}
                                                            className="text-xs text-gray-600 ml-1"
                                                          >
                                                            {param.parameters && (
                                                              <p className="mb-1 text-gray-700 line-clamp-2">
                                                                <span className="font-medium">
                                                                  📝
                                                                </span>{" "}
                                                                {
                                                                  param.parameters
                                                                }
                                                              </p>
                                                            )}
                                                            <div className="flex gap-3 text-xs">
                                                              {param.no_of_words && (
                                                                <span className="bg-blue-50 px-1.5 py-0.5 rounded text-blue-700">
                                                                  📊{" "}
                                                                  {
                                                                    param.no_of_words
                                                                  }
                                                                  w
                                                                </span>
                                                              )}
                                                              {param.time_frame && (
                                                                <span className="bg-green-50 px-1.5 py-0.5 rounded text-green-700">
                                                                  ⏱️{" "}
                                                                  {
                                                                    param.time_frame
                                                                  }
                                                                  d
                                                                </span>
                                                              )}
                                                            </div>
                                                          </div>
                                                        ),
                                                      )}
                                                  </div>
                                                ),
                                              )}
                                            </div>
                                          </div>
                                        )}

                                      {basicInfo.tandc && (
                                        <div className="mt-2 pt-2 border-t border-blue-200">
                                          <p className="text-xs font-medium text-gray-700 mb-1">
                                            Terms & Conditions:
                                          </p>
                                          <div className="text-xs text-gray-600 bg-white p-2 rounded border max-h-20 overflow-y-auto">
                                            <div
                                              dangerouslySetInnerHTML={{
                                                __html: basicInfo.tandc,
                                              }}
                                            />
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  );
                                } catch (e) {
                                  return null;
                                }
                              })()}

                            {/* Standard Plan */}
                            {quote.standard_info &&
                              (() => {
                                try {
                                  const standardInfo = JSON.parse(
                                    quote.standard_info,
                                  );
                                  return (
                                    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-xl p-3 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                                      <div className="flex items-center justify-between mb-2">
                                        <h4 className="text-sm font-bold text-emerald-800 flex items-center">
                                          <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
                                          Standard Plan
                                        </h4>
                                        <span className="bg-emerald-600 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                                          {standardInfo.noOfWords} words
                                        </span>
                                      </div>

                                      {standardInfo.milestoneData &&
                                        standardInfo.milestoneData.length >
                                          0 && (
                                          <div className="space-y-2">
                                            <p className="text-xs font-semibold text-gray-700 flex items-center">
                                              <span className="w-1 h-1 bg-gray-500 rounded-full mr-1"></span>
                                              {standardInfo.milestones}{" "}
                                              Milestones
                                            </p>
                                            <div className="max-h-32 overflow-y-auto space-y-1.5">
                                              {standardInfo.milestoneData.map(
                                                (milestone, idx) => (
                                                  <div
                                                    key={idx}
                                                    className="bg-white rounded-lg p-2 border border-emerald-100"
                                                  >
                                                    <p className="text-xs font-medium text-gray-800 mb-1 line-clamp-2">
                                                      {milestone.name}
                                                    </p>
                                                    {milestone.parametersData &&
                                                      milestone.parametersData.map(
                                                        (param, pIdx) => (
                                                          <div
                                                            key={pIdx}
                                                            className="text-xs text-gray-600 ml-1"
                                                          >
                                                            {param.parameters && (
                                                              <p className="mb-1 text-gray-700 line-clamp-2">
                                                                <span className="font-medium">
                                                                  📝
                                                                </span>{" "}
                                                                {
                                                                  param.parameters
                                                                }
                                                              </p>
                                                            )}
                                                            <div className="flex gap-3 text-xs">
                                                              {param.no_of_words && (
                                                                <span className="bg-emerald-50 px-1.5 py-0.5 rounded text-emerald-700">
                                                                  📊{" "}
                                                                  {
                                                                    param.no_of_words
                                                                  }
                                                                  w
                                                                </span>
                                                              )}
                                                              {param.time_frame && (
                                                                <span className="bg-green-50 px-1.5 py-0.5 rounded text-green-700">
                                                                  ⏱️{" "}
                                                                  {
                                                                    param.time_frame
                                                                  }
                                                                  d
                                                                </span>
                                                              )}
                                                            </div>
                                                          </div>
                                                        ),
                                                      )}
                                                  </div>
                                                ),
                                              )}
                                            </div>
                                          </div>
                                        )}

                                      {standardInfo.tandc && (
                                        <div className="mt-2 pt-2 border-t border-emerald-200">
                                          <p className="text-xs font-medium text-gray-700 mb-1">
                                            Terms & Conditions:
                                          </p>
                                          <div className="text-xs text-gray-600 bg-white p-2 rounded border max-h-20 overflow-y-auto">
                                            <div
                                              dangerouslySetInnerHTML={{
                                                __html: standardInfo.tandc,
                                              }}
                                            />
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  );
                                } catch (e) {
                                  return null;
                                }
                              })()}

                            {/* Advanced Plan */}
                            {quote.advanced_info &&
                              (() => {
                                try {
                                  const advancedInfo = JSON.parse(
                                    quote.advanced_info,
                                  );
                                  return (
                                    <div className="bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 rounded-xl p-3 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                                      <div className="flex items-center justify-between mb-2">
                                        <h4 className="text-sm font-bold text-amber-800 flex items-center">
                                          <span className="w-2 h-2 bg-amber-500 rounded-full mr-2"></span>
                                          Advanced Plan
                                        </h4>
                                        <span className="bg-amber-600 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                                          {advancedInfo.noOfWords} words
                                        </span>
                                      </div>

                                      {advancedInfo.milestoneData &&
                                        advancedInfo.milestoneData.length >
                                          0 && (
                                          <div className="space-y-2">
                                            <p className="text-xs font-semibold text-gray-700 flex items-center">
                                              <span className="w-1 h-1 bg-gray-500 rounded-full mr-1"></span>
                                              {advancedInfo.milestones}{" "}
                                              Milestones
                                            </p>
                                            <div className="max-h-32 overflow-y-auto space-y-1.5">
                                              {advancedInfo.milestoneData.map(
                                                (milestone, idx) => (
                                                  <div
                                                    key={idx}
                                                    className="bg-white rounded-lg p-2 border border-amber-100"
                                                  >
                                                    <p className="text-xs font-medium text-gray-800 mb-1 line-clamp-2">
                                                      {milestone.name}
                                                    </p>
                                                    {milestone.parametersData &&
                                                      milestone.parametersData.map(
                                                        (param, pIdx) => (
                                                          <div
                                                            key={pIdx}
                                                            className="text-xs text-gray-600 ml-1"
                                                          >
                                                            {param.parameters && (
                                                              <p className="mb-1 text-gray-700 line-clamp-2">
                                                                <span className="font-medium">
                                                                  📝
                                                                </span>{" "}
                                                                {
                                                                  param.parameters
                                                                }
                                                              </p>
                                                            )}
                                                            <div className="flex gap-3 text-xs">
                                                              {param.no_of_words && (
                                                                <span className="bg-amber-50 px-1.5 py-0.5 rounded text-amber-700">
                                                                  📊{" "}
                                                                  {
                                                                    param.no_of_words
                                                                  }
                                                                  w
                                                                </span>
                                                              )}
                                                              {param.time_frame && (
                                                                <span className="bg-green-50 px-1.5 py-0.5 rounded text-green-700">
                                                                  ⏱️{" "}
                                                                  {
                                                                    param.time_frame
                                                                  }
                                                                  d
                                                                </span>
                                                              )}
                                                            </div>
                                                          </div>
                                                        ),
                                                      )}
                                                  </div>
                                                ),
                                              )}
                                            </div>
                                          </div>
                                        )}

                                      {advancedInfo.tandc && (
                                        <div className="mt-2 pt-2 border-t border-amber-200">
                                          <p className="text-xs font-medium text-gray-700 mb-1">
                                            Terms & Conditions:
                                          </p>
                                          <div className="text-xs text-gray-600 bg-white p-2 rounded border max-h-20 overflow-y-auto">
                                            <div
                                              dangerouslySetInnerHTML={{
                                                __html: advancedInfo.tandc,
                                              }}
                                            />
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  );
                                } catch (e) {
                                  return null;
                                }
                              })()}
                          </div>
                        </div>
                      )}
                      {quote.plan_comments &&
                        quote.plan_comments !== "" &&
                        quote.plan_comments !== null && (
                          <>
                            <div>
                              <p className="mb-2">
                                <strong style={{ textDecoration: "underline" }}>
                                  Plan Description:
                                </strong>
                              </p>
                              <div
                                className="row"
                                style={{
                                  wordWrap: "break-word", // Ensures text wraps within the container
                                  overflowWrap: "break-word", // Handles long unbreakable words
                                  wordBreak: "break-word", // Forces breaking of long words
                                }}
                              >
                                {quote.plan_comments &&
                                  typeof quote.plan_comments === "string" &&
                                  quote.plan &&
                                  Object.entries(
                                    JSON.parse(quote.plan_comments),
                                  )
                                    .filter(([plan]) =>
                                      quote.plan.split(",").includes(plan),
                                    ) // Filter based on the updated plan list
                                    .map(([plan, comment], index) => (
                                      <div
                                        key={index}
                                        className="col-md-4 mb-3"
                                      >
                                        <p>
                                          <strong>{plan}:</strong>
                                        </p>
                                        <div
                                          dangerouslySetInnerHTML={{
                                            __html: comment,
                                          }}
                                        />
                                      </div>
                                    ))}
                              </div>
                            </div>

                            {quote.word_counts && quote.word_counts != null && (
                              <div>
                                <p className="mb-2">
                                  <strong
                                    style={{ textDecoration: "underline" }}
                                  >
                                    Word Count:
                                  </strong>
                                </p>
                                <div
                                  className="row"
                                  style={{
                                    wordWrap: "break-word",
                                    overflowWrap: "break-word",
                                    wordBreak: "break-word",
                                  }}
                                >
                                  {quote.word_counts &&
                                    typeof quote.word_counts === "string" &&
                                    quote.plan &&
                                    Object.entries(
                                      JSON.parse(quote.word_counts),
                                    )
                                      .filter(([plan]) =>
                                        quote.plan.split(",").includes(plan),
                                      ) // Filter based on the updated plan list
                                      .map(([plan, wordcount], index) => (
                                        <div
                                          key={index}
                                          className="col-md-4 mb-3"
                                        >
                                          <p
                                            style={{
                                              fontWeight: "bold",
                                              color: "#007bff",
                                              backgroundColor: "#f0f8ff", // Background color for word count text
                                              padding: "5px", // Padding around the word count text
                                              borderRadius: "5px", // Rounded corners for the background
                                              border: "1px solid #40BD5DFF",
                                            }}
                                          >
                                            {plan}:{" "}
                                            <span style={{ color: "#28a745" }}>
                                              {wordcount} words
                                            </span>
                                            <br />
                                            <span style={{ color: "gray" }}>
                                              {numberToWords(wordcount)} words
                                            </span>
                                          </p>
                                        </div>
                                      ))}
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      {quote.client_academic_level && quote.results_section && (
                        <div class="flex gap-4 mb-3">
                          <div
                            class="flex items-center px-1 py-1 bg-blue-100 border-l-4 border-blue-500 text-blue-900 shadow-md rounded-lg"
                            x-show="quote.client_academic_level"
                          >
                            <div>
                              <img src={academic} className="h-5 w-5" />
                            </div>
                            <div className="px-2">
                              <h3 class="text-md font-semibold">
                                Academic Level
                              </h3>
                              <p class="text-sm">
                                {quote.client_academic_level}
                              </p>
                            </div>
                          </div>

                          <div
                            class="flex items-center px-1 py-1 bg-green-100 border-l-4 border-green-500 text-green-900 shadow-md rounded-lg"
                            x-show="quote.results_section"
                          >
                            <div>
                              <img src={experiment} className="h-5 w-5" />
                            </div>
                            <div className="px-2">
                              <h3 class="text-md font-semibold">
                                Results Section
                              </h3>
                              <p class="text-sm">{quote.results_section}</p>
                            </div>
                          </div>
                        </div>
                      )}
                      <p>
                        <strong>Comments:</strong>{" "}
                        <span
                          dangerouslySetInnerHTML={{ __html: quote.comments }}
                        />
                      </p>
                      {quote.internal_comments && (
                        <p>
                          <strong>Internal Comments:</strong>{" "}
                          <span
                            dangerouslySetInnerHTML={{
                              __html: quote.internal_comments,
                            }}
                          />
                        </p>
                      )}
                      <p>
                        <strong>Created Date:</strong>{" "}
                        {new Date(quote.created_date * 1000).toLocaleDateString(
                          "en-GB",
                        )}
                      </p>
                      {quote.relevant_file &&
                        quote.relevant_file.length > 0 && (
                          <div>
                            <strong>Relevant Files:</strong>
                            <div className="space-y-2 mt-2">
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
                            <CheckCircle2 size={15} className="ml-2" />
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
                              <div className="line-h-in">
                                {quote.demo_duration}
                              </div>
                            </div>
                          </p>
                        </>
                      )}
                      {quote.demo_date && (
                        <>
                          <p className="mb-3">
                            {" "}
                            <div>
                              <strong>Demo Date </strong>{" "}
                            </div>
                            <div className="flex items-center">
                              <div className="line-h-in">
                                {new Date(quote.demo_date).toLocaleDateString(
                                  "en-GB",
                                  {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  },
                                )}
                              </div>
                            </div>
                          </p>
                        </>
                      )}
                      <div>
                        <CallRecordingPending
                          scopeDetails={quote}
                          quoteId={quote.quoteid}
                          after={fetchScopeDetailsForSocket}
                        />
                      </div>
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
                                  const prices =
                                    quote.discount_price.split(",");
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
                      <p>
                        <strong>Quote Status:</strong>{" "}
                        <span
                          className={
                            quote.quote_status == 0
                              ? "badge-danger p-1 f-10 rounded font-semibold"
                              : quote.quote_status == 1
                                ? "badge-success p-1 f-10 rounded font-semibold"
                                : "badge-warning p-1 f-10 rounded font-semibold"
                          }
                        >
                          {quote.quote_status == 0
                            ? "Pending"
                            : quote.quote_status == 1
                              ? "Submitted"
                              : "Discount Requested"}
                        </span>
                      </p>
                      {assignQuoteInfo && assignQuoteInfo !== false && (
                        <p>
                          <strong>Assigned To:</strong> {assignQuoteInfo.name}
                        </p>
                      )}
                      <p>
                        <strong>Feasibility status is : </strong>{" "}
                        <strong
                          className={
                            quote.feasability_status == "Pending"
                              ? "badge-danger p-1 f-10 rounded"
                              : "badge-success p-1 f-10 rounded"
                          }
                        >
                          {quote.feasability_status}
                        </strong>
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
                      {quote.feasability_status == "Pending" && (
                        <div className="space-y-4">
                          <form
                            onSubmit={async (e) => {
                              e.preventDefault();

                              const formData = new FormData();
                              formData.append("ref_id", queryId);
                              formData.append("quote_id", quotationId);
                              formData.append(
                                "feasability_comments",
                                feasabilityComments,
                              );
                              formData.append("user_id", loopUserObject.id);
                              formData.append("ref_user_id", quote.user_id);
                              formData.append("followers", quote.followers);

                              if (selectedFile) {
                                formData.append("file", selectedFile); // Append the file if selected
                              }
                              try {
                                const response = await fetch(
                                  "https://loopback-skci.onrender.com/api/scope/completeFeasabilityNew",
                                  {
                                    method: "POST",
                                    body: formData, // Use FormData for file upload
                                  },
                                );

                                const result = await response.json();
                                if (result.status) {
                                  toast.success(
                                    "Feasibility completed successfully!",
                                  );
                                  finalFunction();
                                  socket.emit("feasabilityCompleted", {
                                    ref_id: queryId,
                                    quote_id: quotationId,
                                    user_id: quote.user_id,
                                    user_name:
                                      loopUserObject.fld_first_name +
                                      " " +
                                      loopUserObject.fld_last_name,
                                  });
                                } else {
                                  toast.error(
                                    result.message ||
                                      "Failed to complete feasibility.",
                                  );
                                }
                              } catch (error) {
                                toast.error(
                                  "An error occurred while completing feasibility.",
                                );
                                console.error(error);
                              }
                            }}
                          >
                            <label
                              htmlFor="feasabilityComments"
                              className="block text-sm font-medium text-gray-700"
                            >
                              Feasibility Comments
                            </label>
                            <ReactQuill
                              value={feasabilityComments}
                              onChange={handleCommentsChange}
                              className="mt-1"
                              theme="snow"
                              placeholder="Add your comments here"
                              modules={modules}
                            />
                            <div className="mt-4">
                              <label
                                htmlFor="fileUpload"
                                className="block text-sm font-medium text-gray-700"
                              >
                                Attach File (Optional)
                              </label>
                              <div className="relative mt-1">
                                <input
                                  type="file"
                                  id="fileUpload"
                                  onChange={(e) =>
                                    setSelectedFile(e.target.files[0])
                                  }
                                  className="block w-full text-sm text-gray-500 border border-gray-300 rounded-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 p-2"
                                />
                              </div>
                              {selectedFile && (
                                <div className="mt-2 flex items-center justify-between bg-gray-100 p-2 rounded-md border border-gray-300">
                                  <span className="text-sm text-gray-600 truncate">
                                    {selectedFile.name}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => setSelectedFile(null)}
                                    className="text-sm text-red-600 hover:underline focus:outline-none"
                                  >
                                    Remove
                                  </button>
                                </div>
                              )}
                            </div>

                            <div className="flex items-center justify-end">
                              <button
                                type="submit"
                                className="bg-green-500 mt-2 text-white px-2 py-1 rounded-md hover:bg-green-600 focus:outline-none f-14"
                              >
                                Mark as Complete
                              </button>
                            </div>
                          </form>
                          <Chat
                            quoteId={quotationId}
                            refId={queryId}
                            status={quote.quote_status}
                            submittedToAdmin={quote.submittedtoadmin}
                            finalFunction={fetchScopeDetails}
                            allDetails={quote}
                          />
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center p-1 rounded bg-red-100 text-red-700">
                      Umm..Looks like you dont have access for this request.
                      <BotOff className="ml-3" />
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

          <AnimatePresence>
            {transferForm && (
              <TransferForm
                refId={queryId}
                quotationId={quotationId}
                onClose={() => {
                  setTransferForm(!transferForm);
                }}
                finalFunction={finalFunction}
              />
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default FeasabilityUpdate;
