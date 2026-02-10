import {
  CheckCircle,
  CheckCircle2,
  ClockAlert,
  Expand,
  Link,
  Minimize2,
  Paperclip,
  Pen,
  TvMinimalPlay,
  X,
  XCircle,
} from "lucide-react";
import React, { useState } from "react";
import AskPtp from "../AskPtp";
import academic from "../../academic.svg";
import experiment from "../../poll.svg";
import DemoDone from "../DemoDone";
import CallRecordingPending from "../CallRecordingPending";
import MergedHistoryComponentNew from "../MergedHistoryComponentNew";
import AdminDetailsEditModal from "./AdminDetailsEditModal";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";
import { getSocket } from "../Socket";
import DemoDoneAlready from "../DemoDoneAlready";
import AlreadyQuoteGiven from "../AlreadyQuoteGiven";
import RcKitStatus from "./RcKitStatus";
import AskForScopeAdmin from "../AskForScopeAdmin";
const DetailsComponent = ({
  quote,
  fullScreenTab,
  handlefullScreenBtnClick,
  thisUserId,
  fetchScopeDetails,
  submitToAdmin,
  tags,
  queryInfo,
  tlType,
  planColClass,
  after,
  canApprove = false,
  canEdit = false,
}) => {
  // console.log(queryInfo)
  const socket = getSocket();

  const LoopUserData = localStorage.getItem("loopuser");
  const loopUserObject = JSON.parse(LoopUserData);

  const [alreadyGiven, setAlreadyGiven] = useState(false);

  // helpers for plans rendering
  const parsePlanJson = (jsonString) => {
    if (!jsonString || typeof jsonString !== "string") return null;
    try {
      return JSON.parse(jsonString);
    } catch (err) {
      return null;
    }
  };

  // normalize relevant_file to an array (handles JSON string or array)
  const getRelevantFiles = (input) => {
    if (!input) return [];
    if (Array.isArray(input)) return input;
    if (typeof input === "string") {
      try {
        const parsed = JSON.parse(input);
        return Array.isArray(parsed) ? parsed : [];
      } catch (err) {
        return [];
      }
    }
    return [];
  };

  const selectedPlans = (quote.selected_plans || "")
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
  const recommendedPlan = quote.recommended_plan || null;

  const basicInfo = parsePlanJson(quote.basic_info);
  const standardInfo = parsePlanJson(quote.standard_info);
  const advancedInfo = parsePlanJson(quote.advanced_info);

  const [selectedForEdit, setSelectedForEdit] = useState(null);
  const [editing, setEditing] = useState(false);

  console.log("selectedPlans", standardInfo, basicInfo, advancedInfo, quote);

  const renderPlanCard = (label, info, isRecommended) => {
    console.log("info ", info);
    if (!info) return null;
    const hasMilestones =
      Array.isArray(info.milestoneData) && info.milestoneData.length > 0;
    return (
      <div
        className={`mb-2 p-2 relative border rounded ${label == "Basic" ? "bg-blue-50" : label == "Standard" ? "bg-gray-50" : "bg-yellow-50"}`}
      >
        {isRecommended ? (
          <span className="badge badge-success f-10 absolute -top-2 left-0">
            Recommended
          </span>
        ) : null}
        {canEdit && (
          <div
            className="flex items-center absolute -top-2 right-0 bg-black text-white p-1 rounded-full cursor-pointer group"
            onClick={() => {
              const rawInfo =
                label === "Basic"
                  ? quote.basic_info
                  : label === "Standard"
                    ? quote.standard_info
                    : quote.advanced_info;
              setSelectedForEdit({
                label,
                info,
                infoRaw: rawInfo,
                assign_id: quote.assign_id,
                quote_id: quote.quote_id || quote.quoteid,
              });
              setEditing(true);
            }}
          >
            <Pen size={16} />
            <span
              className="
                                max-w-0 overflow-hidden 
                                group-hover:max-w-xs 
                                group-hover:pl-2
                                group-hover:text-white
                                transition-all duration-300 ease-in-out
                            "
            >
              edit
            </span>
          </div>
        )}
        <div className="flex items-center justify-between mb-1">
          <strong className="text-md">{label}</strong>
        </div>

        {/* First Part: Main Content - Scrollable */}
        <div className="f-11 text-gray-700 space-y-2 max-h-48 overflow-y-auto border-b pb-2">
          {info.price != null ? (
            <p>
              <strong>Total Price:</strong> {info.currency} {info.price}{" "}
            </p>
          ) : null}
          {info.milestones != null ? (
            <p>
              <strong>No. of Milestones:</strong> {info.milestones}
            </p>
          ) : null}
          {(info.noOfWords != null || info.no_of_words != null) &&
          (info.noOfWords !== "" || info.no_of_words !== "") ? (
            <p>
              <strong>No. of Words:</strong>{" "}
              {info.noOfWords || info.no_of_words}
            </p>
          ) : null}
          {hasMilestones ? (
            <div className="mt-1 space-y-1">
              <strong>Milestone Details:</strong>
              <div className="mt-1 space-y-1">
                {info.milestoneData.map((milestone, idx) => (
                  <div key={idx} className="p-2 bg-white rounded border">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">
                        Name : {milestone.name}
                      </span>
                      <span className="ml-2">
                        Price :{" "}
                        {milestone.price != null ? (
                          <span className="ml-2">
                            {info.currency} {milestone.price}
                          </span>
                        ) : null}
                      </span>
                    </div>
                    {Array.isArray(milestone.parametersData) &&
                    milestone.parametersData.length > 0 ? (
                      <div className="mt-2 space-y-2">
                        {milestone.parametersData.map((param, pIdx) => (
                          <div
                            key={pIdx}
                            className="p-2 bg-gray-50 rounded border f-11"
                          >
                            <div className="mb-1">
                              <strong>Parameter:</strong>{" "}
                              <span className="text-gray-700">
                                {param.parameters || "-"}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-3">
                              <div>
                                <strong>No. of Words:</strong>{" "}
                                <span className="text-gray-700">
                                  {param.no_of_words || "-"}
                                </span>
                              </div>
                              <div>
                                <strong>Time Frame:</strong>{" "}
                                <span className="text-gray-700">
                                  {param.time_frame || "-"}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        {/* Second Part: Remarks & Terms - Scrollable */}
        {(info.remarks || info.tandc) && (
          <div className="f-11 text-gray-700 space-y-2 max-h-48 overflow-y-auto p-1 mt-2">
            {info.remarks ? (
              <div className="p-2 bg-blue-50 rounded border border-blue-200">
                <strong>Remarks for {label}:</strong>
                <p className="mt-1 text-gray-700">{info.remarks}</p>
              </div>
            ) : null}
            {info.tandc ? (
              <div className="p-2 rounded border border-amber-200">
                <strong>Terms and Conditions for {label}:</strong>
                <div
                  className="prose prose-sm mt-1 text-gray-700"
                  dangerouslySetInnerHTML={{ __html: info.tandc }}
                />
              </div>
            ) : null}
          </div>
        )}

        {canEdit && (
          <div
            className="flex items-center absolute -bottom-2 right-0 bg-black text-white p-1 rounded-full cursor-pointer group"
            onClick={() => {
              const rawInfo =
                label === "Basic"
                  ? quote.basic_info
                  : label === "Standard"
                    ? quote.standard_info
                    : quote.advanced_info;
              console.log({
                assign_id: quote.assign_id,
                quote_id: quote.quote_id || quote.quoteid,
                infoLabel: label,
                infoRaw: rawInfo,
                infoParsed: info,
              });
              setSelectedForEdit({
                label,
                info,
                infoRaw: rawInfo,
                assign_id: quote.assign_id,
                quote_id: quote.quote_id || quote.quoteid,
              });
              setEditing(true);
            }}
          >
            <Pen size={16} />
            <span
              className="
                                max-w-0 overflow-hidden 
                                group-hover:max-w-xs 
                                group-hover:pl-2
                                group-hover:text-white
                                transition-all duration-300 ease-in-out
                            "
            >
              edit
            </span>
          </div>
        )}
      </div>
    );
  };

  const handleSave = async (payload) => {
    try {
      const response = await fetch(
        "https://loopback-skci.onrender.com/api/scope/updatePlanInfoById",
        {
          method: "POST",
          body: JSON.stringify(payload),
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      const data = await response.json();
      if (data.status) {
        toast.success("Details updated successfully!");
        setEditing(false);
        after();
      } else {
        toast.error("Failed to update details!");
      }
    } catch (error) {
      console.log("Error saving payload:", error);
    } finally {
      setEditing(false);
    }
  };

  const handleApprove = async () => {
    try {
      const response = await fetch(
        "https://loopback-skci.onrender.com/api/scope/approveRequestQuoteApiActionNewVersion",
        {
          method: "POST",
          body: JSON.stringify({
            ref_id: quote.assign_id,
            quote_id: quote.quoteid,
            user_id: thisUserId,
            alreadyGiven,
          }),
          headers: {
            "Content-type": "application/json",
          },
        },
      );
      const data = await response.json();
      if (data.status) {
        setShowConfirmation(false);
        after();
        socket.emit("quoteSubmitted", {
          quote_id: quote.quoteid,
          ref_id: quote.assign_id,
          user_id: thisUserId,
          alreadyGiven,
        });
      } else {
        toast.error("Failed to approve quote!");
      }
    } catch (error) {
      console.log("Error approving quote:", error);
    } finally {
      setShowConfirmation(false);
    }
  };

  const handleOpsApprove = async () => {
    try {
      const response = await fetch(
        "https://loopback-skci.onrender.com/api/scope/approveOpsRequestQuoteApiActionNewVersion",
        {
          method: "POST",
          body: JSON.stringify({
            ref_id: quote.assign_id,
            quote_id: quote.quoteid,
            user_id: thisUserId,
            alreadyGiven,
          }),
          headers: {
            "Content-type": "application/json",
          },
        },
      );
      const data = await response.json();
      if (data.status) {
        setShowOpsConfirmation(false);
        if (after) {
          after();
        } else {
        }
        socket.emit("quoteSubmitted", {
          quote_id: quote.quoteid,
          ref_id: quote.assign_id,
          user_id: thisUserId,
          alreadyGiven,
        });
      } else {
        toast.error("Failed to approve quote!");
      }
    } catch (error) {
      console.log("Error approving quote:", error);
    } finally {
      setShowOpsConfirmation(false);
    }
  };

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showOpsConfirmation, setShowOpsConfirmation] = useState(false);

  const [linkedQuoteId, setLinkedQuoteId] = useState(null);
  const [linkedRefId, setLinkedRefId] = useState(null);
  const [linkedQuoteLoading, setLinkedQuoteLoading] = useState(false);

  const fetchLinkedRefId = async (quoteId) => {
    try {
      const response = await fetch(
        "https://loopback-skci.onrender.com/api/scope/getRefId",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ scope_id: quoteId }),
        },
      );
      const data = await response.json();
      if (data.status) {
        setLinkedRefId(data.data.ref_id);
        setLinkedQuoteId(quoteId);
      } else {
        toast.error(data.message || "Failed to fetch ref id");
      }
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div className={`  pl-0`}>
      <div className="py-2 px-2 flex items-center justify-between bg-blue-100">
        <h3 className="flex items-center">
          <strong>Scope Details</strong>

          {quote.linked_quote_id && (
            <button
              onClick={() => {
                fetchLinkedRefId(quote.linked_quote_id);
              }}
              className="ml-2 flex items-center bg-yellow-100 px-2 py-0.5 rounded"
            >
              <Link size={15} className="text-yellow-600 rounded-full mr-1" />{" "}
              {quote.linked_quote_id}
            </button>
          )}
          {canApprove &&
            quote.quote_status == 0 &&
            quote.submittedtoadmin == "true" && (
              <button className="ml-2 flex items-center ">
                {showConfirmation ? (
                  <div className="flex items-center space-x-2">
                    <span
                      onClick={() => {
                        handleApprove();
                      }}
                      className="bg-green-100 px-2 py-0.5 rounded border-1 border-green-700 hover:bg-green-200"
                    >
                      Are you sure Confirm ?
                    </span>
                    <span
                      onClick={() => {
                        setShowConfirmation(false);
                      }}
                      className="bg-red-100 px-2 py-0.5 rounded border-1 border-red-700 hover:bg-red-200"
                    >
                      No
                    </span>
                  </div>
                ) : (
                  <div
                    onClick={() => {
                      setShowConfirmation(true);
                    }}
                    className="flex items-center space-x-2 bg-green-100 px-2 py-0.5 rounded border-1 border-green-700 hover:bg-green-200"
                  >
                    <CheckCircle
                      size={15}
                      className="text-green-600 rounded-full mr-1"
                    />{" "}
                    Approve
                  </div>
                )}
              </button>
            )}

          {loopUserObject?.can_approve_quote == 1 &&
            quote.ops_approved == 0 &&
            quote.submittedtoadmin == "true" && (
              <button className="ml-2 flex items-center ">
                {showOpsConfirmation ? (
                  <div className="flex items-center space-x-2">
                    <span
                      onClick={() => {
                        handleOpsApprove();
                      }}
                      className="bg-green-100 px-2 py-0.5 rounded border-1 border-green-700 hover:bg-green-200"
                    >
                      Are you sure Confirm ?
                    </span>
                    <span
                      onClick={() => {
                        setShowOpsConfirmation(false);
                      }}
                      className="bg-red-100 px-2 py-0.5 rounded border-1 border-red-700 hover:bg-red-200"
                    >
                      No
                    </span>
                  </div>
                ) : (
                  <div
                    onClick={() => {
                      setShowOpsConfirmation(true);
                    }}
                    className="flex items-center space-x-2 bg-green-100 px-2 py-0.5 rounded border-1 border-green-700 hover:bg-green-200"
                  >
                    <CheckCircle
                      size={15}
                      className="text-green-600 rounded-full mr-1"
                    />{" "}
                    Approve
                  </div>
                )}
              </button>
            )}
        </h3>
        <button className="">
          {fullScreenTab == "scope" ? (
            <Minimize2
              size={23}
              onClick={() => {
                handlefullScreenBtnClick(null);
              }}
              className="btn btn-sm btn-danger flex items-center p-1"
            />
          ) : (
            <Expand
              size={20}
              onClick={() => {
                handlefullScreenBtnClick("scope");
              }}
              className="btn btn-sm btn-light flex items-center p-1"
            />
          )}
        </button>
      </div>
      {(loopUserObject?.id == 1 || loopUserObject?.scopeadmin == 1) &&
        loopUserObject?.fld_admin_type == "SUPERADMIN" && (
          <AlreadyQuoteGiven
            email_id={queryInfo?.email_id}
            website_id={queryInfo?.website_id}
            setAlreadyGiven={setAlreadyGiven}
          />
        )}

      {queryInfo && queryInfo?.email_id && (
        <RcKitStatus email={queryInfo?.email_id} />
      )}
      {quote.timeline && quote.timeline == "urgent" && (
        <div
          className={`text-red-600 bg-red-100 flex items-center border-red-500 border-1 w-full text-sm px-1 py-0.5 ${quote.demodone == "0" ? "mb-0.5" : "mb-0"}`}
          style={{
            fontSize: "11px",
          }}
        >
          <ClockAlert size={16} className="mr-1" />
          Timeline: {"   "}
          <span className="font-semibold ml-1">
            {quote.timeline.charAt(0).toUpperCase() + quote.timeline.slice(1)}

            {quote.timeline == "urgent" &&
              quote.timeline_days &&
              ` - ${quote.timeline_days} days`}
          </span>
        </div>
      )}
      {quote.demodone && quote.demodone == "0" && (
        <div
          className={`text-red-600 bg-red-100 flex items-center border-red-500 border-1 w-full text-sm px-1 py-0.5`}
          style={{
            fontSize: "11px",
          }}
        >
          <TvMinimalPlay size={16} className="mr-1" />
          <span className="font-semibold ml-1">Demo Pending</span>
        </div>
      )}

      <div className="bg-white">
        <div className="overscroll-modal">
          <div className="space-y-2 px-0">
            <div className="row">
              {/* Ref No Section */}
              <div className="col-md-12">
                <p className=" mb-3">
                  <div>
                    <strong>Ref No </strong>{" "}
                  </div>
                  <div className="flex items-center">
                    <div className="line-h-in">{quote.assign_id}</div>

                    {quote.ptp === "Yes" && (
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
                    {quote.edited == 1 && (
                      <span
                        className="ml-2 badge badge-secondary"
                        style={{
                          fontSize: "10px",
                        }}
                      >
                        Edited
                      </span>
                    )}
                    {quote.is_discounted == 1 && (
                      <span
                        className="text-green-600 bg-green-100 rounded-full text-sm ml-2"
                        style={{
                          fontSize: "11px",
                          padding: "1px 6px",
                        }}
                      >
                        Discounted
                      </span>
                    )}

                    {quote.timeline && (
                      <span
                        className={`${quote.timeline == "normal" ? "text-red-600 bg-red-100" : "text-blue-600 bg-blue-100"} rounded-full text-sm ml-2 px-1 py-0.5`}
                        style={{
                          fontSize: "11px",
                        }}
                      >
                        {quote.timeline.charAt(0).toUpperCase() +
                          quote.timeline.slice(1)}

                        {quote.timeline == "urgent" &&
                          quote.timeline_days &&
                          ` - ${quote.timeline_days} days`}
                      </span>
                    )}
                  </div>
                </p>

                <p className=" mb-3">
                  <div>
                    <strong>Website Name</strong>{" "}
                  </div>
                  <div className="line-h-in">
                    {queryInfo?.website_name || "No website name"}
                  </div>
                </p>

                {quote.quote_heading && (
                  <p className="mb-3">
                    <div>
                      <strong>Quote Heading</strong>{" "}
                    </div>
                    {quote.quote_heading}
                  </p>
                )}

                {quote.tags && (
                  <div className="flex items-end mb-3 justify-between">
                    <div>
                      <div>
                        <strong>Tags</strong>
                      </div>
                      {quote.tags
                        .split(",")
                        .map((tagId) => {
                          const tag = tags.find((t) => t.id == tagId.trim());
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

                {quote.ptp != null && (
                  <div className="bg-white mb-3 rounded-lg p-3 border border-gray-300">
                    <h3 className="text-md font-semibold mb-2 text-gray-700">
                      PTP Details
                    </h3>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p className="flex items-center gap-1">
                        <strong>PTP:</strong>
                        {quote.ptp === "Yes" ? (
                          <CheckCircle className="text-green-500 w-4 h-4" />
                        ) : (
                          <XCircle className="text-red-500 w-4 h-4" />
                        )}
                      </p>
                      {quote.ptp === "Yes" &&
                        quote.ptp_amount &&
                        quote.ptp_amount != 0 && (
                          <p>
                            <strong>PTP Amount:</strong> {quote.ptp_amount}
                          </p>
                        )}
                      {quote.ptp_comments !== "" && (
                        <p>
                          <strong>PTP Comments:</strong> {quote.ptp_comments}
                        </p>
                      )}
                      {quote.ptp_file != null && (
                        <p className="flex items-center gap-1">
                          <strong>Attached File:</strong>
                          <Paperclip className="text-blue-500 w-4 h-4" />
                          <a
                            className="text-blue-500 font-semibold hover:underline"
                            href={`https://apacvault.com/public/ptpfiles/${quote.ptp_file}`}
                            download={quote.ptpfile}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {quote.ptp_file}
                          </a>
                        </p>
                      )}
                      {quote.ptp_time && (
                        <div className="flex items-center justify-end">
                          <p className="text-gray-500 tenpx">
                            {new Date(quote.ptp_time)
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
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {quote.service_name && (
                  <p className="mb-3">
                    <div>
                      <strong>Service Required</strong>{" "}
                    </div>
                    {quote.service_name}
                  </p>
                )}
                {quote.subject_area && (
                  <>
                    <p className="mb-3">
                      <div>
                        <strong>Subject Area</strong>{" "}
                      </div>
                      {quote.subject_area}
                    </p>
                    {quote.subject_area == "Other" && (
                      <p className="text-gray-500 mb-2">
                        <div>
                          <strong>Other Subject Area name</strong>{" "}
                        </div>
                        {quote.other_subject_area}
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
            {/* generate here */}
            {/* Plans & Pricing */}
            {selectedPlans.length > 0 && (
              <div className="mb-3">
                <div className="mb-2">
                  <strong>Selected Plans</strong>
                  <div className="mt-1">
                    {selectedPlans.map((p, i) => (
                      <span
                        key={i}
                        className="bg-blue-500 text-white rounded px-2 py-1 f-11 mr-1"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                  {recommendedPlan && (
                    <div className="mt-2 flex items-center justify-between">
                      <p className="mb-0">
                        <strong>Recommended Plan:</strong>{" "}
                        <span className="text-blue-600 bg white border-1 border-blue-600 rounded px-2 py-1 f-12 mr-1">
                          {recommendedPlan}
                        </span>
                      </p>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2 px-3 w-full">
                  {selectedPlans.includes("Basic") &&
                    renderPlanCard(
                      "Basic",
                      basicInfo,
                      recommendedPlan === "Basic",
                    )}
                  {selectedPlans.includes("Standard") &&
                    renderPlanCard(
                      "Standard",
                      standardInfo,
                      recommendedPlan === "Standard",
                    )}
                  {selectedPlans.includes("Advanced") &&
                    renderPlanCard(
                      "Advanced",
                      advancedInfo,
                      recommendedPlan === "Advanced",
                    )}
                </div>
              </div>
            )}
            {quote.client_academic_level && quote.results_section && (
              <div className="flex gap-4 mb-3">
                <div className="flex items-center px-1 py-0.5 bg-blue-100 border-l-4 border-blue-500 text-blue-900 shadow-md rounded-lg f-11">
                  <div>
                    <img src={academic} className="h-4 w-4" />
                  </div>
                  <div className="px-2">
                    <h3 className="text-md font-semibold f-12">
                      Academic Level
                    </h3>
                    <p className="f-11">{quote.client_academic_level}</p>
                  </div>
                </div>

                <div className="flex items-center px-1 py-0.5 bg-green-100 border-l-4 border-green-500 text-green-900 shadow-md rounded-lg f-11">
                  <div>
                    <img src={experiment} className="h-4 w-4" />
                  </div>
                  <div className="px-2">
                    <h3 className="text-md font-semibold f-12">
                      Results Section
                    </h3>
                    <p className="f-11">{quote.results_section}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="mb-0 mt-0 row px-2 pb-3 space-y-2">
              {quote.comments &&
                quote.comments != "" &&
                quote.comments != null && (
                  <p className="mb-2">
                    <strong
                      style={{
                        fontSize: "12px",
                      }}
                    >
                      Additional Comments
                    </strong>{" "}
                    <span
                      dangerouslySetInnerHTML={{
                        __html: quote.comments,
                      }}
                    />
                  </p>
                )}
              {quote.final_comments != null && (
                <div>
                  <p>
                    <strong>Final Comments:</strong> {quote.final_comments}
                  </p>
                </div>
              )}

              {getRelevantFiles(quote.relevant_file).length > 0 && (
                <div>
                  <strong>Relevant Files:</strong>
                  <div className="space-y-2 mt-2">
                    {getRelevantFiles(quote.relevant_file).map(
                      (file, fileIndex) => (
                        <div key={fileIndex}>
                          <a
                            href={`https://apacvault.com/public/QuotationFolder/${file.file_path}`}
                            download
                            target="_blank"
                            className="text-blue-500"
                          >
                            {file.filename}
                          </a>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              )}

              {quote.demodone != 0 && (
                <>
                  <p className="mb-3">
                    {" "}
                    <div>
                      <strong>Demo Id </strong>{" "}
                    </div>
                    <div className="flex items-center">
                      <div className="line-h-in">{quote.demo_id}</div>
                      <div className="line-h-in badge badge-success ml-2 flex items-center f-10">
                        Demo Completed{" "}
                        <CheckCircle2 size={13} className="ml-2" />{" "}
                      </div>{" "}
                    </div>
                  </p>
                </>
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
              {quote.demo_date && (
                <>
                  <p className="mb-3">
                    {" "}
                    <div>
                      <strong>Demo Date </strong>{" "}
                    </div>
                    <div className="flex items-center">
                      <div className="line-h-in">
                        {new Date(quote.demo_date).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                    </div>
                  </p>
                </>
              )}

              <div className="">
                {quote.quote_status == 1 &&
                  quote.submittedtoadmin == "true" &&
                  quote.instacrm_status == "4" &&
                  quote.user_id == thisUserId && (
                    <AskPtp
                      scopeDetails={quote}
                      quoteId={quote.quoteid}
                      after={fetchScopeDetails}
                      plans={quote.plan}
                    />
                  )}
                {quote.user_id == thisUserId &&
                  quote.submittedtoadmin == "true" &&
                  quote.demodone != 1 && (
                    <DemoDone
                      scopeDetails={quote}
                      quoteId={quote.quoteid}
                      emailId={queryInfo.email_id}
                      after={fetchScopeDetails}
                    />
                  )}
              </div>
              <div>
                <CallRecordingPending
                  scopeDetails={quote}
                  quoteId={quote.quoteid}
                  after={fetchScopeDetails}
                />
              </div>
              {canApprove && <DemoDoneAlready info={queryInfo} />}

              {quote.isfeasability == 1 && (
                <>
                  <div className="flex items-center">
                    <>
                      {quote.feasability_status == "Completed" &&
                        quote.submittedtoadmin == "false" &&
                        quote.user_id == thisUserId && (
                          <button
                            disabled={tlType && tlType == 2}
                            onClick={() => {
                              submitToAdmin(
                                quote.assign_id,
                                quote.quoteid,
                                quote.user_id,
                                quote.tags,
                              );
                            }}
                            className="btn btn-outline-success btn-sm f-12 px-2 py-1"
                            title="Submit request to admin for Ask For Scope"
                          >
                            Request Quote
                          </button>
                        )}
                    </>
                  </div>
                </>
              )}
              {quote.internal_comments && (
                <div>
                  <h2 className="text-semibold">Internal Comments </h2>
                  <p className="text-gray-800">{quote.internal_comments}</p>
                </div>
              )}
            </div>
          </div>

          <div className="px-0">
            <MergedHistoryComponentNew
              quoteId={quote.quoteid}
              refId={quote.assign_id}
              onlyFetch="quote"
              quote={quote}
            />
          </div>
        </div>
      </div>

      <AnimatePresence>
        {editing && (
          <AdminDetailsEditModal
            info={selectedForEdit}
            onClose={() => {
              setEditing(false);
            }}
            onSave={(payload) => {
              handleSave(payload);
            }}
          />
        )}
        {linkedQuoteId && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed top-0 right-0 h-full w-full bg-gray-100 shadow-lg z-50 overflow-y-auto "
          >
            <div className="flex items-center justify-between bg-blue-400 text-white pnav py-3">
              <h2 className="text-xl font-semibold">Linked Quote Details </h2>
              <div className="d-flex align-items-center ">
                <button
                  onClick={() => {
                    setLinkedQuoteId(null);
                  }}
                  className="text-white hover:text-red-500 transition-colors p-1 rounded-full bg-red-600 hover:bg-red-500"
                >
                  {/* <CircleX size={32} /> */}
                  <X size={15} />
                </button>
              </div>
            </div>
            <AskForScopeAdmin
              queryId={linkedRefId}
              userType={loopUserObject.fld_admin_type}
              quotationId={linkedQuoteId}
              viewAll={true}
              clientEmail={queryInfo.email_id}
              clientWebsite={queryInfo.website_id}
              info={queryInfo}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DetailsComponent;
