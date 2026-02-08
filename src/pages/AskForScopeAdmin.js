import React, { useState, useEffect, useMemo } from "react";
import "./modalStyles.css";
import toast from "react-hot-toast";
import CustomLoader from "../CustomLoader";
import { Chat } from "./Chat";
import "react-tooltip/dist/react-tooltip.css";
import {
  ArrowDown,
  ArrowUp,
  History,
  CheckCircle,
  CheckCircle2,
  Paperclip,
  Hash,
  RefreshCcw,
  PlusCircle,
  Hourglass,
  CirclePause,
  CircleCheck,
  Bell,
  UserRoundPlus,
  Settings2,
  Pencil,
  ArrowLeftRight,
  Eye,
  Expand,
  Minimize2,
  X,
  EyeClosed,
  Pen,
  CircleUserRound,
  XCircle,
  Download,
  BadgeDollarSign,
  Share2,
  Copy,
  MessageCirclePlus,
  MessageCircleX,
  Headset,
  Crown,
  Upload,
  TriangleAlert,
  Link,
  CalendarDays,
  Clock3,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import AddTags from "./AddTags";
import HistorySideBar from "./HistorySideBar";
import FeasHistorySideBar from "./FeasHistorySideBar";
import AllRequestSideBar from "./AllRequestSideBar";
import ClientEmailSideBar from "./ClientEmailSideBar";
import AddFollowers from "./AddFollowers";
import { io } from "socket.io-client";
import EditRequestForm from "./EditRequestForm";
import EditPriceComponent from "./EditPriceComponent";
import EditFeasibilityCommentsComponent from "./EditFeasabilityCommentsComponent";
import CompleteFeasability from "./CompleteFeasability";
import MergedHistoryComponent from "./MergedHistoryComponent";
import ScopeLoader from "./ScopeLoader";
import { getSocket } from "./Socket";
import ReactTooltip, { Tooltip } from "react-tooltip";
import MergedHistoryComponentNew from "./MergedHistoryComponentNew";
import EditCommentsComponent from "./EditCommentsComponent";
import CallRecordingPending from "./CallRecordingPending";
import academic from '../academic.svg';
import experiment from '../poll.svg';
import AttachedFiles from "./AttachedFiles";
import AlreadyQuoteGiven from "./AlreadyQuoteGiven";
import QuoteIssue from "./QuoteIssue";
import DemoDoneAlready from "./DemoDoneAlready";
import DetailsComponent from "./new/DetailsComponent";


const AskForScopeAdmin = ({
  queryId,
  userType,
  quotationId,
  viewAll,
  clientEmail,
  clientWebsite,
  info,
  selectedQuery
}) => {

  const socket = getSocket();
  const [scopeDetails, setScopeDetails] = useState(selectedQuery ? [selectedQuery] : []);
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
  const [totalCount, setTotalCount] = useState("0");
  const [amounts, setAmounts] = useState({});
  const [comment, setComment] = useState("");

  const [linkedQuoteId, setLinkedQuoteId] = useState(null);
  const [linkedRefId, setLinkedRefId] = useState(null);
  const [linkedQuoteLoading, setLinkedQuoteLoading] = useState(false);

  const fetchLinkedRefId = async (quoteId) => {
    try {
      const response = await fetch('https://loopback-skci.onrender.com/api/scope/getRefId', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ scope_id: quoteId })
      });
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
  }

  const [tags, setTags] = useState([]);
  const fetchTags = async () => {
    try {
      const response = await fetch('https://loopback-skci.onrender.com/api/scope/getTags');
      const data = await response.json();
      if (data.status) setTags(data.data || []);
    } catch (error) {

    }
  };
  const [users, setUsers] = useState([]);
  const fetchUsers = async () => {
    try {
      const response = await fetch('https://loopback-skci.onrender.com/api/users/allusers', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      if (data.status) setUsers(data.data || []);
    } catch (error) {
      toast.error('Failed to fetch tags.');
    }
  };

  const [showComments, setShowComments] = useState({
    Basic: false,
    Standard: false,
    Advanced: false,
  });

  const [comments, setComments] = useState({
    Basic: "",
    Standard: "",
    Advanced: "",
  });

  const toggleCommentBox = (plan) => {
    setShowComments((prev) => ({ ...prev, [plan]: !prev[plan] }));
  };


  const [selectedUser, setSelectedUser] = useState(null);
  const [adminComments, setAdminComments] = useState("");
  const [expandedRowIndex, setExpandedRowIndex] = useState(0);
  const [editFormOpen, setEditFormOpen] = useState(false);
  const [editingFormOpen, setEditingFormOpen] = useState(false);
  const [feascommentseditingFormOpen, setFeasCommentsEditingFormOpen] =
    useState(false);
  const [selectedQuoteId, setSelectedQuoteId] = useState("");
  const [selectedRefId, setSelectedRefId] = useState("");
  const [historyData, setHistoryData] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [userIdForTag, setUserIdForTag] = useState("");
  const [isFeasabilityCompleted, setIsFeasabilityCompleted] = useState(null);
  const [refIds, setRefIds] = useState([]);
  const [clientEmailDivOpen, setClientEmailDivOpen] = useState(false);
  const [followersFormOpen, setFollowersFormOpen] = useState(false);
  const [completeFeasabilityDiv, setCompleteFeasabilityDiv] = useState(false);
  const [selectedMP, setSelectedMP] = useState("");

  const [commentEditFormOpen, setCommentEditFormOpen] = useState(false);
  const [commentQuote, setCommentQuote] = useState(null);
  const [commentPlan, setCommentPlan] = useState("");
  const [commentText, setCommentText] = useState("");
  const [commentWordCount, setCommentWordCount] = useState(null);

  const [selectedAllReqRefId, setSelectedAllReqRefId] = useState("");
  const [allRequestDivOpen, setAllRequestDivOpen] = useState(false);

  const [historyPanelOpen, SetHistoryPanelOpen] = useState(false);
  const [quoteIdForHistory, setQuoteIdForHistory] = useState("");

  const [feasHistoryPanelOpen, SetFeasHistoryPanelOpen] = useState(false);
  const [quoteIdForFeasHistory, setQuoteIdForFeasHistory] = useState("");
  const [refIdForFeasHistory, setRefIdForFeasHistory] = useState("");

  const [scopeTabVisible, setScopeTabVisible] = useState(true);
  const [chatTabVisible, setChatTabVisible] = useState(true);
  const [feasTabVisible, setFeasTabVisible] = useState(false);
  const [fileTabVisible, setFileTabVisible] = useState(false);
  const [issueTabVisible, setIssueTabVisible] = useState(false);
  const [fullScreenTab, setFullScreenTab] = useState(null);

  const [showUpload, setShowUpload] = useState(false);

  const changeShowUpload = () => {
    setShowUpload(!showUpload)
  }


  const closeModal = () => {
    setChatTabVisible(false);
  };
  const handleTabButtonClick = (tab) => {
    if (tab == "scope") {
      setScopeTabVisible(true);
      setFullScreenTab(null)
    } else if (tab == "chat") {
      setChatTabVisible(!chatTabVisible);
      setFullScreenTab(null)
    } else if (tab == "feas") {
      setFeasTabVisible(!feasTabVisible);
      setFullScreenTab(null)
    }
    else if (tab == "file") {
      // setIssueTabVisible(false)
      setFileTabVisible(!fileTabVisible);
      setFullScreenTab(null)
    }
    else if (tab == "issue") {
      // setFileTabVisible(false)
      setIssueTabVisible(!issueTabVisible);
      setFullScreenTab(null)
    }
  };

  const handlefullScreenBtnClick = (tab) => {
    if (tab == "scope") {
      setFullScreenTab("scope")
    } else if (tab == "chat") {
      setFullScreenTab("chat")
    } else if (tab == "feas") {
      setFullScreenTab("feas")
    } else if (tab == "file") {
      setFullScreenTab("file")
    } else {
      setFullScreenTab(null)
    }
  }
  const getVisibleTabCount = () => {
    let visibleCount = 0;
    if (scopeTabVisible) visibleCount++;
    if (chatTabVisible) visibleCount++;
    if (feasTabVisible) visibleCount++;
    if (fileTabVisible) visibleCount++;
    if (issueTabVisible) visibleCount++;
    return visibleCount;
  };

  // Determine the colClass based on the number of visible tabs
  const colClass = useMemo(() => {
    const visibleTabs = getVisibleTabCount();
    if (visibleTabs === 1) {
      return "col-md-12";
    } else if (visibleTabs === 2) {
      return "col-md-6";
    } else if (visibleTabs === 3) {
      return "col-md-4";
    } else if (visibleTabs === 4) {
      return "col-md-3";
    } else {
      return "col-md-3";
    }
  }, [scopeTabVisible, chatTabVisible, feasTabVisible, fileTabVisible, issueTabVisible]);

  useEffect(() => {
    socket.on("tagsUpdated", (data) => {
      if (data.ref_id == queryId) {
        fetchScopeDetailsForSocket();
      }
    });

    return () => {
      socket.off("tagsUpdated"); // Clean up on component unmount
    };
  }, []);

  useEffect(() => {
    socket.on("followersUpdated", (data) => {
      if (data.ref_id == queryId) {
        fetchScopeDetailsForSocket();
      }
    });

    return () => {
      socket.off("followersUpdated"); // Clean up on component unmount
    };
  }, []);

  useEffect(() => {
    socket.on("feasibilityCommentsUpdated", (data) => {
      if (data.ref_id == queryId) {
        fetchScopeDetailsForSocket();
      }
    });

    return () => {
      socket.off("feasibilityCommentsUpdated"); // Clean up on component unmount
    };
  }, []);



  const FollowersList = ({ followerIds, users = { users } }) => {
    if (!followerIds || !users || users.length == 0) return null;

    const idArray = followerIds
      .split(",")
      .map((id) => parseInt(id.trim()))
      .filter((id) => !isNaN(id));

    const matchedUsers = idArray
      .map((id) => users.find((user) => user.id == id))
      .filter((user) => user); // remove any not found



    return (
      <div className="flex gap-2 mt-2">
        {matchedUsers.map((user, index) => {
          const fullName = `${user.fld_first_name} ${user.fld_last_name}`.trim();
          const initials = fullName
            .split(" ")
            .map((word) => word.charAt(0))
            .join("")
            .toUpperCase();

          return (
            <div key={user.id}>
              <div
                data-tooltip-id={`tooltip-${user.id}`}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-yellow-500 text-white text-sm cursor-pointer"
              >
                {initials}
              </div>
              <Tooltip id={`tooltip-${user.id}`} place="top" effect="solid">
                {fullName}
              </Tooltip>
            </div>
          );
        })}
      </div>
    );
  };


  const handleMPChange = (plan) => {
    setSelectedMP(selectedMP === plan ? "" : plan); // Toggle selection
  };



  const planColClass = useMemo(() => {
    const visibleTabs = getVisibleTabCount();
    if (visibleTabs === 1) {
      return "col-md-4";
    } else if (visibleTabs === 2) {
      return "col-md-6";
    } else {
      return "col-md-12";
    }
  }, [scopeTabVisible, chatTabVisible, feasTabVisible]);

  const loopuserData = localStorage.getItem("loopuser");
  const loopUserObject = JSON.parse(loopuserData);

  const thisUserId = loopUserObject.id;

  const toggleAllRequestDiv = () => {
    setSelectedAllReqRefId(queryId);
    setAllRequestDivOpen((prev) => !prev);
  };

  const toggleHistoryDiv = ($id) => {
    setQuoteIdForHistory($id);
    SetHistoryPanelOpen(true);
  };
  const toggleClientEmailDiv = () => {
    setClientEmailDivOpen((prev) => !prev);
  };
  const toggleFollowersForm = (id, user_id) => {
    setSelectedQuoteId(id);
    setUserIdForTag(user_id);
    setFollowersFormOpen((prev) => !prev);
  };
  const [quoteFollowers, setQuoteFollowers] = useState(null)
  const toggleCompleteFeasability = (id, ref_id, user_id, followers) => {
    setSelectedQuoteId(id);
    setSelectedRefId(ref_id);
    setSelectedUser(user_id);
    setCompleteFeasabilityDiv((prev) => !prev);
    setQuoteFollowers(followers);
  };

  const toggleFeasHistoyDiv = (assign_id, quote_id) => {
    setQuoteIdForFeasHistory(quote_id);
    setRefIdForFeasHistory(assign_id);
    SetFeasHistoryPanelOpen((prev) => !prev);
  };

  const numberToWords = (num) => {
    const toWords = require("number-to-words");
    return toWords.toWords(Number(num));
  };

  const toggleRow = (index) => {
    setExpandedRowIndex(expandedRowIndex === index ? null : index);
  };
  const fetchScopeDetails = async () => {
    //setLoading(true); // Show loading spinner
    let hasResponse = false;
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
          }),
        }
      );

      const data = await response.json(); // Parse the response as JSON
      // console.log(data);
      if (data.status) {
        if (data.quoteInfo != null && Array.isArray(data.quoteInfo)) {
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
        fetchAllRefIds();
      }
    }
  };
  const fetchQuoteCountAndFeasStatus = async () => {
    try {
      const payload = {
        ref_id: queryId,
      };

      const [countRes, feasRes] = await Promise.all([
        fetch("https://loopback-skci.onrender.com/api/scope/getTotalQuoteCount", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }),
        fetch("https://loopback-skci.onrender.com/api/scope/getFeasibilityStatus", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }),
      ]);

      const countData = await countRes.json();
      const feasData = await feasRes.json();

      if (countData.status) {
        setTotalCount(countData.totalCounter || "0");
      }

      if (feasData.status) {
        setIsFeasabilityCompleted(
          feasData.isFeasabilityCompleted ?? null
        );
      }
    } catch (error) {
      console.error("Error fetching quote count or feasibility status:", error);
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
          }),
        }
      );

      const data = await response.json(); // Parse the response as JSON
      // console.log(data);
      if (data.status) {
        if (data.quoteInfo != null && Array.isArray(data.quoteInfo)) {
          const parsedQuoteInfo = data.quoteInfo.map((quote) => ({
            ...quote,
            relevant_file: quote.relevant_file
              ? JSON.parse(quote.relevant_file)
              : [], // Parse the file data if present
          }));

          setScopeDetails(parsedQuoteInfo); // Set the array of quotes
          setAssignQuoteInfo(data.assignQuoteInfo); // Assuming you also want to set assignQuoteInfo
          setTotalCount(data.totalCounter ? data.totalCounter : "0");
          setIsFeasabilityCompleted(
            data.isFeasabilityCompleted ? data.isFeasabilityCompleted : null
          );
        } else {
          setScopeDetails(null); // If no quoteInfo, set scopeDetails to null
        }
      } else {
        console.error("Failed to fetch Details:", data.message);
      }
    } catch (error) {
      console.error("Error fetching details:", error);
    } finally {
      fetchQuoteCountAndFeasStatus()
    }
  };

  const fetchAllScopeDetails = async () => {
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
          body: JSON.stringify({ ref_id: queryId, user_type: userType }),
        }
      );

      const data = await response.json(); // Parse the response as JSON
      // console.log(data);
      if (data.status) {
        if (data.quoteInfo != null && Array.isArray(data.quoteInfo)) {
          const parsedQuoteInfo = data.quoteInfo.map((quote) => ({
            ...quote,
            relevant_file: quote.relevant_file
              ? JSON.parse(quote.relevant_file)
              : [], // Parse the file data if present
          }));
          setTotalCount(data.totalCounter ? data.totalCounter : "0");

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
      fetchQuoteCountAndFeasStatus()
    }
  };

  const updatePriceQuote = async () => {
    const data = {
      task_id: assignQuoteInfo.id,
      quoteid: assignQuoteInfo.quote_id,
      quote_price: quotePrice,
      user_comments: userComments,
    };

    try {
      // Show loading spinner
      setPriceLoading(true);

      const response = await fetch(
        "https://instacrm.rapidcollaborate.com/api/updatepricequote",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json", // Set content type to JSON
          },
          body: JSON.stringify(data), // Send the data as JSON
        }
      );

      const responseData = await response.json(); // Parse the response as JSON

      if (response.ok) {
        toast.success("Quote price updated successfully");
        setTimeout(() => {
          fetchScopeDetailsForSocket();
        }, 800);
      } else {
        toast.error("Failed to update quote price");
      }
    } catch (error) {
      console.error("Error updating price quote:", error);
    } finally {
      // Hide loading spinner
      setPriceLoading(false);
    }
  };

  const toggleEditForm = (id, user_id) => {
    setSelectedQuoteId(id);
    setUserIdForTag(user_id);
    setEditFormOpen((prev) => !prev);
  };
  const toggleEditingForm = (id) => {
    setSelectedQuoteId(id);
    setEditingFormOpen((prev) => !prev);
  };
  const toggleFeasCommentsEditingForm = (id) => {
    setSelectedQuoteId(id);
    setFeasCommentsEditingFormOpen((prev) => !prev);
  };

  const handleAmountChange = (e, plan) => {
    const value = e.target.value;

    setAmounts((prevAmounts) => {
      return {
        ...prevAmounts,
        [plan]: value, // Update the amount for the specific plan
      };
    });
  };

  const fetchAllRefIds = async () => {
    try {
      const response = await fetch(
        "https://loopback-skci.onrender.com/api/scope/selectallrefids/",
        {
          method: "POST", // Use POST method
          headers: {
            "Content-Type": "application/json", // Set content type to JSON
          },
          body: JSON.stringify({ email: clientEmail }), // Send client email
        }
      );

      const data = await response.json(); // Parse the response as JSON
      // console.log("all refids " + data.ref_ids);

      if (data.status) {
        if (data.ref_ids && Array.isArray(data.ref_ids)) {
          setRefIds(data.ref_ids); // Store ref_ids array in state
        } else {
          setRefIds([]); // If no ref_ids, set an empty array
        }
      } else {
        console.error("Failed to fetch ref_ids:", data.message);
      }
    } catch (error) {
      console.error("Error fetching ref_ids:", error);
    }
  };

  useEffect(() => {
    socket.on("feasabilityDone", (data) => {
      if (data.quote_id == quotationId) {
        fetchScopeDetailsForSocket();
      }
    });

    return () => {
      socket.off("feasabilityDone"); // Clean up on component unmount
    };
  }, []);

  const [alreadyGiven, setAlreadyGiven] = useState(false);

  const PriceSubmitValidate = async (refId, quoteId, plans, userId, ptpCount) => {
    const form = document.getElementById("submitQuoteForm");

    // Define the amount variables
    const basicAmount =
      document.getElementById("amount_Basic")?.value.trim() || "0";
    const standardAmount =
      document.getElementById("amount_Standard")?.value.trim() || "0";
    const advancedAmount =
      document.getElementById("amount_Advanced")?.value.trim() || "0";

    // Create a map for plan amounts
    const planAmountMap = {
      Basic: basicAmount,
      Standard: standardAmount,
      Advanced: advancedAmount,
    };

    // Filter the selected plans and join the corresponding amounts
    const quoteAmount = plans
      .split(",") // Split the comma-separated plans
      .map((plan) => planAmountMap[plan] || "0") // Get corresponding amounts, defaulting to "0"
      .join(",");

    try {
      // Show loading spinner
      setQuoteLoading(true);

      const response = await fetch(
        "https://loopback-skci.onrender.com/api/scope/submittedtoadminquotenew",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ref_id: refId,
            quote_id: quoteId,
            quote_amount: quoteAmount,
            user_id: loopUserObject.id,
            mp_price: selectedMP,
            comment: comments,
            ptp_count: ptpCount,
            alreadyGiven

          }), // Send the data as JSON
        }
      );

      const responseData = await response.json(); // Parse the response as JSON

      if (response.ok) {
        setTimeout(() => {
          fetchScopeDetailsForSocket();
          continueAferInsert(refId, quoteId, ptpCount);
        }, 800);
        form.reset();
        document.getElementById("amount_Basic").value = "0";
        document.getElementById("amount_Standard").value = "0";
        document.getElementById("amount_Advanced").value = "0";
        setComment("");
        socket.emit("quoteSubmitted", {
          quote_id: quoteId,
          ref_id: refId,
          user_id: userId,
        });
      } else {
        toast.error("Failed to update quote price");
      }
    } catch (error) {
      console.error("Error updating price quote:", error);
    } finally {
      // Hide loading spinner
      //setQuoteLoading(false);
    }
  };

  const continueAferInsert = async (refId, quoteId, ptpCount) => {


    try {

      const response = await fetch(
        "https://loopback-skci.onrender.com/api/scope/continueafterinsert",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ref_id: refId,
            quote_id: quoteId,
            user_id: loopUserObject.id,
            isNew: ptpCount == 0,

          }), // Send the data as JSON
        }
      );

      const responseData = await response.json(); // Parse the response as JSON

      if (response.ok) {

        setTimeout(() => {
          fetchScopeDetailsForSocket();
        }, 800);
      } else {
        console.error("Failed to update quote price");
      }
    } catch (error) {
      console.error("Error updating price quote:", error);
    } finally {
      // Hide loading spinner
      //setQuoteLoading(false);
    }
  };



  useEffect(() => {
    if (queryId) {
      fetchScopeDetails(); // Fetch the scope details when the component mounts
      fetchQuoteCountAndFeasStatus();
      fetchTags();
      fetchUsers();
    }
  }, [queryId]);

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


  function capitalizeFirstLetter(str) {
    if (typeof str !== "string") return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  const handleEditClick = (quote, plan, comment) => {
    //console.log("Quote Ref ID:", quote.assign_id);
    //console.log("Quote ID:", quote.quoteid);
    //console.log("Plan:", plan);
    //console.log("Comment:", comment);

    const planComments =
      typeof quote.plan_comments === "string"
        ? JSON.parse(quote.plan_comments)
        : quote.plan_comments;
    const wordCounts =
      quote.word_counts && typeof quote.word_counts === "string"
        ? JSON.parse(quote.word_counts)
        : quote.word_counts;

    //console.log("Plan Comments for Selected Plan:", planComments[plan]);
    //console.log("Word Count for Selected Plan:", wordCounts ? wordCounts[plan] : null);

    setCommentQuote(quote);
    setCommentPlan(plan);
    setCommentText(planComments[plan]);
    setCommentWordCount(wordCounts ? wordCounts[plan] : null);
    setCommentEditFormOpen(true);
  };

  const referenceUrl = `https://instacrm.rapidcollaborate.com/managequote/view-askforscope/${scopeDetails?.ref_id}`;

  const handleUserChange = (event) => {
    setSelectedUser(event.target.value); // Update the state with selected user ID
  };




  return (
    <div className=" h-full bg-gray-100  z-50 overflow-y-auto mt-2 rounded w-full">
      <div className="flex items-center justify-between bg-blue-400 text-white py-2 px-3">
        <div className="flex items-center space-x-2">
          <h2 className="text-sx font-semibold ">Ask For Scope </h2>
          <div
            className="badge badge-light flex items-center"
            title="Client Name"
          >
            <CircleUserRound size={15} className="mr-2" />
            {info.name ?? "Loading.."}
          </div>
        </div>
        <div className="flex items-center">
          {refIds && refIds.length > 0 && (
            <div
              title="You have new RefIds"
              className="cursor-pointer flex items-center mx-2 px-2 py-1 rounded-full"
              onClick={toggleClientEmailDiv}
            >
              <Bell size={20} className="text-yellocol-md-30" />
            </div>
          )}
          {isFeasabilityCompleted && isFeasabilityCompleted != null && (
            <p
              className={`cursor-help text-xs flex items-center mx-2 px-2 py-1 rounded ${isFeasabilityCompleted.feasability_status === "Pending"
                ? "bg-orange-100 text-orange-500"
                : "bg-green-100 text-green-600"
                }`}
              title={`${isFeasabilityCompleted.feasability_status === "Pending"
                ? "Feasibility is Pending for his RefId"
                : "Feasibility has been completed for this RefId"
                }`}
            >
              Feasibility{" "}
              {isFeasabilityCompleted.feasability_status == "Pending" ? (
                <CirclePause size={18} className="ml-2 text-orange-500" />
              ) : (
                <CircleCheck size={18} className="ml-2 text-green-700" />
              )}
            </p>
          )}
          {viewAll && (
            <button
              onClick={fetchAllScopeDetails}
              className="flex items-center mr-2 rounded px-2 py-1 text-xs btn-light"
            >
              <Hourglass size={10} className="mr-1" /> <div>All </div>
              <span className="px-1 py-0 f-10 rounded-full bg-blue-600 text-white ml-2">
                {totalCount}
              </span>
            </button>
          )}
          <button onClick={fetchScopeDetails}
            data-tooltip-id="my-tooltip"
            data-tooltip-content="Refresh"
            className="btn btn-dark btn-sm">
            <RefreshCcw size={15} className="cursor-pointer" />
          </button>
        </div>
      </div>

      {loading ? (
        <ScopeLoader /> // A loader component when data is being fetched
      ) : (
        <div className="bg-white p-3 space-y-4">
          {errorMessage && <p className="text-red-600">{errorMessage}</p>}

          {scopeDetails && scopeDetails.length > 0 && (
            <div>
              {/* Table Header */}
              <table className="w-full border-collapse border border-gray-200 f-14">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border px-2 py-2 text-left">Ref No.</th>
                    <th className="border px-2 py-2 text-left">Quote Id.</th>
                    <th className="border px-2 py-2 text-left">Plan</th>
                    <th className="border px-2 py-2 text-left">Service Name</th>
                    <th className="border px-2 py-2 text-left">Quote Status</th>
                    <th className="border px-2 py-2 text-left">Action</th>
                  </tr>
                </thead>
                {/* Table Body */}
                <tbody>
                  {scopeDetails.map((quote, index) => (
                    <React.Fragment key={index}>
                      {/* Row */}
                      <tr className="cursor-pointer hover:bg-gray-50">
                        <td
                          className="border px-2 py-2"
                          style={{ fontSize: "11px" }}
                        >
                          <p className="flex items-center">
                            {quote.parent_quote == true && (
                              <Crown color='orange'
                                className="mr-1"
                                size={20}
                                data-tooltip-id="my-tooltip"
                                data-tooltip-content="Parent Quote" // Tooltip for Parent Quote
                              />
                            )}
                            {quote.assign_id}
                            {quote.ptp == "Yes" && (
                              <span
                                className="inline-block pl-3 pr-2 py-1 f-10 ml-1" // Increased padding for more space
                                style={{
                                  backgroundColor: "#2B9758FF", // Green color for PTP
                                  clipPath:
                                    "polygon(25% 0%, 100% 0, 100% 99%, 25% 100%, 0% 50%)",
                                  color: "#ffffff",
                                  fontSize: "14px", // Increased font size for better visibility
                                  fontWeight: "bold",
                                  lineHeight: "1.3", // Increased line height to make it visually balanced
                                }}
                              >
                                PTP
                              </span>
                            )}
                            {quote.edited == 1 && (
                              <span
                                className="text-gray-600 bg-gray-200 rounded-full text-sm ml-2"
                                style={{ fontSize: "11px", padding: "1px 6px" }}
                              >
                                Edited
                              </span>
                            )}
                            {quote.callrecordingpending == 1 && (
                              <span
                                className="text-orange-600 rounded-full text-sm ml-2"
                                data-tooltip-id="my-tooltip"
                                data-tooltip-content="Call recording pending"
                                style={{
                                  fontSize: "11px",
                                  padding: "1px 6px",
                                }}
                              >
                                <Headset size={13} />
                              </span>
                            )}
                            {quote.linked_quote_id && (
                              <div className="relative group">
                                <Link
                                  size={24}
                                  className="text-yellow-600  p-1 rounded-full ml-1"
                                  data-tooltip-id="my-tooltip"
                                  data-tooltip-content={`Linked ScopeId Present`}
                                />
                              </div>
                            )}
                            {quote.ownership_transferred == 1 && (
                              <div className="relative group">
                                <ArrowLeftRight
                                  size={24}
                                  className="text-yellow-600 bg-yellow-300 border-2 border-yellow-600 p-1 rounded-full ml-1"
                                  data-tooltip-id="my-tooltip"
                                  data-tooltip-content={`Ownership transferred from ${quote.old_user_name}`}
                                />
                              </div>
                            )}
                            {quote.timeline && (
                              <span
                                className={`${quote.timeline == 'normal' ? 'text-red-600 bg-red-100' : 'text-blue-600 bg-blue-100'} rounded-full text-sm ml-2 px-1 py-0.5`}
                                style={{
                                  fontSize: "11px",
                                }}
                              >
                                {quote.timeline.charAt(0).toUpperCase() + quote.timeline.slice(1)}

                                {quote.timeline == "urgent" && quote.timeline_days && ` - ${quote.timeline_days} days`}
                              </span>
                            )}


                            {quote.quote_issue == 1 && (
                              <span
                                className={`text-red-600  rounded-full text-sm ml-2 px-1 py-0.5`}
                                style={{
                                  fontSize: "11px",
                                }}
                                data-tooltip-id='my-tooltip'
                                data-tooltip-content='Quote Issue'
                              >
                                <TriangleAlert size={15} />
                              </span>
                            )}
                          </p>
                        </td>
                        <td
                          className="border px-2 py-2 "
                          style={{ fontSize: "11px" }}
                        >
                          <div className="flex items-center">
                            {quote.quoteid}
                            <button
                              onClick={() => {
                                navigator.clipboard
                                  .writeText(quote.quoteid)
                                  .then(() => {
                                    toast.success(
                                      "QuoteID copied to clipboard!"
                                    );
                                  })
                                  .catch((err) => {
                                    console.error(
                                      "Failed to copy QuoteID:",
                                      err
                                    );
                                  });
                              }}
                              className="flex items-center justify-center btn  btn-sm mr-1"
                            >
                              <Copy size={14} className="text-blue-600" />
                            </button>
                          </div>
                        </td>
                        <td
                          className="border px-2 py-2"
                          style={{ fontSize: "11px" }}
                        >
                          {quote.q_type == "old" ? quote.plan : quote.selected_plans ?? null}
                        </td>
                        <td
                          className="border px-2 py-2"
                          style={{ fontSize: "11px" }}
                        >
                          {quote.service_name || "N/A"}
                        </td>
                        <td
                          className="border px-2 py-2"
                          style={{ fontSize: "11px" }}
                        >
                          <span
                            className={
                              quote.quote_status == 0
                                ? "text-red-600" // Pending - Red
                                : quote.quote_status == 1
                                  ? "text-green-600" // Submitted - Green
                                  : quote.quote_status == 2
                                    ? "text-yellow-600" // Discount Requested - Yellow
                                    : "text-gray-600" // Default - Gray for Unknown
                            }
                          >
                            {quote.quote_status == 0 &&
                              quote.submittedtoadmin == "false"
                              ? "Pending at User"
                              : quote.quote_status == 0 &&
                                quote.submittedtoadmin == "true"
                                ? "Pending at Admin"
                                : quote.quote_status == 1 && quote.discount_price != "" && quote.discount_price != null
                                  ? "Discount Submitted"
                                  : quote.quote_status == 1
                                    ? "Submitted"

                                    : quote.quote_status == 2
                                      ? "Discount Requested"
                                      : "Unknown"}
                          </span>
                          {quote.isfeasability == 1 &&
                            quote.feasability_status == "Completed" && (
                              <>
                                <br />
                                <span
                                  className="text-green-700 text-sm mr-1"
                                  style={{ fontSize: "11px" }}
                                >
                                  Feasibility Completed
                                </span>
                              </>
                            )}
                          {quote.isfeasability == 1 &&
                            quote.feasability_status == "Pending" && (
                              <>
                                <br />
                                <span
                                  className="text-red-700 text-sm font-bold mr-1"
                                  style={{ fontSize: "11px" }}
                                >
                                  Feasibility Pending
                                </span>
                              </>
                            )}
                          {quote.isfeasability == 1 &&
                            quote.feasability_status == "Pending" && (
                              <button
                                onClick={() => {
                                  toggleCompleteFeasability(
                                    quote.quoteid,
                                    quote.assign_id,
                                    quote.user_id,
                                    quote.followers
                                  );
                                }}
                                className="bg-green-100 text-green-600 px-2 py-1 rounded"
                                style={{ fontSize: "11px" }}
                              >
                                Give Feasibility
                              </button>
                            )}
                        </td>
                        <td className="border px-2 py-2">
                          {/* Up/Down Arrow Button */}
                          <>
                            <div className="flex items-center">
                              <button
                                onClick={() => toggleRow(index)}
                                className="flex items-center justify-center btn btn-primary btn-sm mr-1"
                                data-tooltip-id="my-tooltip"
                                data-tooltip-content="Toggle Row"
                              >
                                {expandedRowIndex === index ? (
                                  <ArrowUp size={14} className="text-white" />
                                ) : (
                                  <ArrowDown size={14} className="text-white" />
                                )}
                              </button>

                              <button
                                onClick={() => {
                                  toggleEditForm(quote.quoteid, quote.user_id);
                                }}
                                className="flex items-center  btn btn-dark btn-sm mr-1"
                                data-tooltip-id="my-tooltip"
                                data-tooltip-content="Update Tags"
                              >
                                <Hash size={14} className="" />
                              </button>
                              <button
                                onClick={() => {
                                  toggleFollowersForm(
                                    quote.quoteid,
                                    thisUserId
                                  );
                                }}
                                data-tooltip-id="my-tooltip"
                                data-tooltip-content="Update Followers"
                                className="flex items-center  btn btn-info btn-sm mr-1"
                              >
                                <UserRoundPlus size={14} className="" />
                              </button>
                            </div>
                          </>
                        </td>
                      </tr>
                      {/* Accordion */}

                      {expandedRowIndex == index && (
                        <tr>
                          <td colSpan={7}>
                            <div className="mx-2 mt-2 mb-0 bg-gray-100 px-3 pt-3 pb-0 flex items-center justify-between">
                              <div className="">
                                <button
                                  onClick={() => handleTabButtonClick("scope")}
                                  className={`px-2 py-1 mr-1 inline-flex items-center f-12 ${scopeTabVisible
                                    ? "btn-info focus-outline-none"
                                    : "btn-light"
                                    } btn btn-sm  focus:outline-none`}
                                >
                                  Scope Details{" "}
                                  {scopeTabVisible ? (
                                    <Eye
                                      size={20}
                                      className="badge badge-dark ml-2"
                                    />
                                  ) : (
                                    <EyeClosed
                                      size={20}
                                      className="badge badge-dark ml-2"
                                    />
                                  )}
                                </button>
                                <button
                                  onClick={() => handleTabButtonClick("chat")}
                                  className={`px-2 py-1 mr-1 inline-flex items-center f-12 ${chatTabVisible
                                    ? "btn-info focus-outline-none"
                                    : "btn-light"
                                    } btn btn-sm`}
                                >
                                  Communication Hub{" "}
                                  {chatTabVisible ? (
                                    <Eye
                                      size={20}
                                      className="badge badge-dark ml-2"
                                    />
                                  ) : (
                                    <EyeClosed
                                      size={20}
                                      className="badge badge-dark ml-2"
                                    />
                                  )}
                                </button>
                                <button
                                  disabled={quote.isfeasability == 0}
                                  onClick={() => handleTabButtonClick("feas")}
                                  className={`px-2 py-1 mr-1 f-12 inline-flex items-center ${feasTabVisible
                                    ? "btn-info focus-outline-none"
                                    : "btn-light"
                                    } btn btn-sm`}
                                >
                                  Feasibility{" "}
                                  {feasTabVisible ? (
                                    <Eye
                                      size={20}
                                      className="badge badge-dark ml-2"
                                    />
                                  ) : (
                                    <EyeClosed
                                      size={20}
                                      className="badge badge-dark ml-2"
                                    />
                                  )}
                                </button>
                                <button
                                  onClick={() => handleTabButtonClick("file")}
                                  className={`px-2 py-1 mr-1 inline-flex items-center f-12 ${fileTabVisible
                                    ? "btn-info focus-outline-none"
                                    : "btn-light"
                                    } btn btn-sm`}
                                >
                                  Attached Files{" "}
                                  {fileTabVisible ? (
                                    <Eye
                                      size={20}
                                      className="badge badge-dark ml-2"
                                    />
                                  ) : (
                                    <EyeClosed
                                      size={20}
                                      className="badge badge-dark ml-2"
                                    />
                                  )}
                                </button>

                                <button
                                  onClick={() => handleTabButtonClick("issue")}
                                  className={`px-2 py-1 mr-1 inline-flex items-center f-12 ${issueTabVisible
                                    ? "btn-info focus-outline-none"
                                    : "btn-light"
                                    } btn btn-sm`}
                                >
                                  Quote Issue{" "}
                                  {issueTabVisible ? (
                                    <Eye
                                      size={20}
                                      className="badge badge-dark ml-2"
                                    />
                                  ) : (
                                    <EyeClosed
                                      size={20}
                                      className="badge badge-dark ml-2"
                                    />
                                  )}
                                </button>
                              </div>
                              <div>
                                {users.length > 0 && (
                                  <FollowersList followerIds={quote.followers} users={users} />
                                )}

                              </div>
                            </div>
                            <div className="mx-2 mb-0 bg-gray-100 pt-3 pb-3 pl-0 pr-2 row ">
                              {scopeTabVisible && (
                                <div
                                  className={`${fullScreenTab == "scope"
                                    ? "custom-modal"
                                    : colClass
                                    }`}
                                >
                                  <div
                                    className={`${fullScreenTab == "scope"
                                      ? "custom-modal-content"
                                      : ""
                                      }`}
                                  >
                                    {quote.q_type == "new" ? (
                                      <DetailsComponent
                                        quote={quote}
                                        fullScreenTab={fullScreenTab}
                                        handlefullScreenBtnClick={handlefullScreenBtnClick}
                                        colClass={colClass}
                                        thisUserId={thisUserId}
                                        fetchScopeDetails={fetchScopeDetails}
                                        submitToAdmin={null}
                                        tags={tags}
                                        planColClass={planColClass}
                                        capitalizeFirstLetter={capitalizeFirstLetter}
                                        numberToWords={numberToWords}
                                        queryInfo={info}
                                        tlType={null}
                                        canEdit={true}
                                        canApprove={true}
                                        after={
                                          fetchScopeDetailsForSocket
                                        }
                                      />
                                    ) : (
                                      <div className={`  pl-0`}>
                                        <div className="py-2 px-2 flex items-center justify-between bg-blue-100">
                                          <h3 className="flex items-center">
                                            <strong>Scope Details</strong>

                                            {quote.linked_quote_id && (
                                              <button
                                                onClick={() => { fetchLinkedRefId(quote.linked_quote_id) }}
                                                className="ml-2 flex items-center bg-yellow-100 px-2 py-0.5 rounded">
                                                <Link
                                                  size={15}
                                                  className="text-yellow-600 rounded-full mr-1"
                                                /> {quote.linked_quote_id}
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
                                                  handlefullScreenBtnClick(
                                                    "scope"
                                                  );
                                                }}
                                                className="btn btn-sm btn-light flex items-center p-1"
                                              />
                                            )}
                                          </button>
                                        </div>
                                        <div className="bg-white">
                                          <div className="overscroll-modal">
                                            <div className="space-y-2 px-0">
                                              <div className="row">
                                                {/* Ref No Section */}
                                                <div className="col-md-12">
                                                  <p className="mb-3">
                                                    <div>
                                                      <strong className="mr-2">
                                                        Ref No
                                                      </strong>
                                                    </div>
                                                    <div className="d-flex align-items-center">
                                                      <div>{quote.assign_id}</div>
                                                      <div>
                                                        {quote.ptp === "Yes" && (
                                                          <span
                                                            className="ptp-badge badge badge-success ml-2"
                                                            style={{
                                                              backgroundColor:
                                                                "#2B9758FF", // Green for PTP
                                                              color: "#fff",
                                                              fontSize: "11px", // Adjusted for better visibility
                                                              fontWeight: "bold",
                                                            }}
                                                          >
                                                            PTP
                                                          </span>
                                                        )}
                                                      </div>
                                                    </div>
                                                    {quote.edited === 1 && (
                                                      <span
                                                        className="edited-badge ml-2"
                                                        style={{
                                                          fontSize: "11px",
                                                          padding: "2px 8px",
                                                          backgroundColor:
                                                            "#f0f0f0",
                                                          color: "#666",
                                                          borderRadius: "5px",
                                                        }}
                                                      >
                                                        Edited
                                                      </span>
                                                    )}
                                                  </p>
                                                </div>

                                                {/* Tags Section */}
                                                {quote.tags && (
                                                  <div className="flex items-end mb-3 justify-between">
                                                    <div>
                                                      <div><strong>Tags</strong></div>
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
                                                        {new Date(quote.tags_updated_time).toLocaleDateString("en-US", {
                                                          day: "numeric",
                                                          month: "short",
                                                          year: "numeric",
                                                          hour: "numeric",
                                                          minute: "2-digit",
                                                          hour12: true,
                                                        }).replace(",", ",")}
                                                      </p>
                                                    )}
                                                  </div>
                                                )}
                                                {/* Service Required & Plan Section */}
                                                {quote.service_name &&
                                                  quote.plan && (
                                                    <>
                                                      <div className="col-md-12 mb-3">
                                                        <p>
                                                          <div>
                                                            <strong>
                                                              Service Required
                                                            </strong>{" "}
                                                          </div>
                                                          {quote.service_name}
                                                        </p>
                                                      </div>

                                                      {quote.old_plan && (
                                                        <div className="col-md-12 mb-3">
                                                          <p className="text-muted">
                                                            <div>
                                                              <strong>
                                                                Old Plan
                                                              </strong>{" "}
                                                            </div>
                                                            {quote.old_plan}
                                                          </p>
                                                        </div>
                                                      )}

                                                      <div className="col-md-12 mb-3">
                                                        <p>
                                                          <div>
                                                            <strong>Plan</strong>{" "}
                                                          </div>
                                                          {quote.plan}
                                                        </p>
                                                      </div>
                                                    </>
                                                  )}

                                                {/* Subject Area Section */}
                                                <div className="col-md-12 mb-3">
                                                  {quote.subject_area && (
                                                    <>
                                                      <p>
                                                        <div>
                                                          <strong>
                                                            Subject Area
                                                          </strong>{" "}
                                                        </div>
                                                        {quote.subject_area}
                                                      </p>
                                                      {quote.subject_area ===
                                                        "Other" && (
                                                          <p className="text-muted">
                                                            <div>
                                                              <strong>
                                                                Other Subject Area
                                                              </strong>{" "}
                                                            </div>
                                                            {
                                                              quote.other_subject_area
                                                            }
                                                          </p>
                                                        )}
                                                    </>
                                                  )}
                                                </div>
                                              </div>
                                              <div className="row mt-0">
                                                <div className="col-md-12">
                                                  <p className="mb-2">
                                                    <strong>Plan Description</strong>
                                                  </p>
                                                </div>
                                                {quote.plan_comments &&
                                                  typeof quote.plan_comments === "string" &&
                                                  (() => {
                                                    const planComments = JSON.parse(quote.plan_comments);
                                                    const availablePlans = quote.plan.split(",");

                                                    // Define the order we want
                                                    const orderedPlans = ["Basic", "Standard", "Advanced"].filter(plan =>
                                                      availablePlans.includes(plan)
                                                    );

                                                    return orderedPlans.map((plan, index) => {
                                                      const comment = planComments[plan];
                                                      if (!comment) return null;

                                                      return (
                                                        <div key={index} className={planColClass}>
                                                          <div className="border p-2 mb-3">
                                                            <p className="flex items-center mb-1 justify-content-between">
                                                              <strong>{plan}</strong>{" "}
                                                              <button
                                                                className="btn btn-warning btn-sm px-1"
                                                                onClick={() => handleEditClick(quote, plan, comment)}
                                                              >
                                                                <Pen size={8} className="text-white" />
                                                              </button>
                                                            </p>
                                                            <div dangerouslySetInnerHTML={{ __html: comment }} />

                                                            {/* Word Count Section */}
                                                            {quote.word_counts &&
                                                              typeof quote.word_counts === "string" &&
                                                              (() => {
                                                                const wordCounts = JSON.parse(quote.word_counts);
                                                                const wordCount = wordCounts[plan];

                                                                if (wordCount) {
                                                                  return (
                                                                    <div className="mt-2">
                                                                      <p
                                                                        style={{
                                                                          fontWeight: "bold",
                                                                          color: "#007bff",
                                                                          backgroundColor: "#f0f8ff",
                                                                          padding: "5px",
                                                                          borderRadius: "5px",
                                                                          border: "1px solid #40BD5DFF",
                                                                          fontSize: "11px",
                                                                        }}
                                                                      >
                                                                        <p className="text-black">
                                                                          <div>Word Count:</div>
                                                                        </p>
                                                                        {plan}:{" "}
                                                                        <span style={{ color: "#28a745" }}>
                                                                          {wordCount} words
                                                                        </span>
                                                                        <br />
                                                                        <span style={{ color: "gray" }}>
                                                                          {capitalizeFirstLetter(numberToWords(wordCount))} words
                                                                        </span>
                                                                      </p>
                                                                    </div>
                                                                  );
                                                                }
                                                                return null;
                                                              })()}

                                                            {/* Timestamp section */}
                                                            {plan === "Basic" && quote.basic_edited_time && (
                                                              <p className="text-gray-500 mt-2 tenpx">
                                                                {new Date(quote.basic_edited_time)
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
                                                            {plan === "Standard" && quote.standard_edited_time && (
                                                              <p className="text-gray-500 mt-2 tenpx">
                                                                {new Date(quote.standard_edited_time)
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
                                                            {plan === "Advanced" && quote.advanced_edited_time && (
                                                              <p className="text-gray-500 mt-2 tenpx">
                                                                {new Date(quote.advanced_edited_time)
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
                                                        </div>
                                                      );
                                                    });
                                                  })()}
                                              </div>
                                              {quote.client_academic_level && quote.results_section && (
                                                <div class="flex gap-4 mb-3">
                                                  <div class="flex items-center px-1 py-1 bg-blue-100 border-l-2 border-blue-500 text-blue-900 shadow-md rounded-lg"
                                                    x-show="quote.client_academic_level">

                                                    <div className=''>
                                                      <h3 class="text-md font-semibold flex items-center">
                                                        <div className="pr-1">
                                                          <img src={academic} className='h-4 w-4' />
                                                        </div>
                                                        Academic Level</h3>
                                                      <p class=" elevenpx">{quote.client_academic_level}</p>
                                                    </div>
                                                  </div>

                                                  <div class="flex items-center px-1 py-1 bg-green-100 border-l-4 border-green-500 text-green-900 shadow-md rounded-lg"
                                                    x-show="quote.results_section">

                                                    <div className=''>
                                                      <h3 class="text-md font-semibold flex items-center">
                                                        <div className="pr-1">
                                                          <img src={experiment} className='h-4 w-4' />
                                                        </div>
                                                        Results Section</h3>
                                                      <p class="elevenpx">{quote.results_section}</p>
                                                    </div>
                                                  </div>
                                                </div>
                                              )}
                                              <div className="mb-0 mt-0 space-y-4 ">
                                                {quote.comments &&
                                                  quote.comments != "" &&
                                                  quote.comments != null && (
                                                    <p>
                                                      <strong style={{}}>
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
                                                      <strong>
                                                        Final Comments:
                                                      </strong>{" "}
                                                      {quote.final_comments}
                                                    </p>
                                                  </div>
                                                )}
                                                {quote.relevant_file && (
                                                  (() => {
                                                    let files = [];
                                                    try {
                                                      // Attempt to parse if it's a string
                                                      files = typeof quote.relevant_file === "string"
                                                        ? JSON.parse(quote.relevant_file)
                                                        : quote.relevant_file;
                                                    } catch (error) {
                                                      console.error("Failed to parse relevant_file:", error);
                                                      files = [];
                                                    }

                                                    if (files.length === 0) return null;

                                                    return (
                                                      <div>
                                                        <strong>Relevant Files:</strong>
                                                        <div className="space-y-2 mt-2">
                                                          {files.map((file, fileIndex) => (
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
                                                    );
                                                  })()
                                                )}

                                                {/* Demo Info Section */}
                                                <div className="flex gap-4 flex-wrap">
                                                  {quote.demodone != 0 && (
                                                    <div className="flex items-center px-2 py-1 bg-green-50 border-l-4 border-green-500 text-green-900 shadow-sm rounded-lg">
                                                      <div>
                                                        <h3 className="text-sm font-semibold flex items-center f-12">
                                                          <CheckCircle2 size={16} className="text-green-700 mr-2" />
                                                          Demo Confirmed
                                                        </h3>
                                                        <p className="f-12 mt-0.5">
                                                          <strong>ID:</strong> {quote.demo_id}
                                                        </p>
                                                      </div>
                                                    </div>
                                                  )}

                                                  {quote.demo_duration && (
                                                    <div className="flex items-center px-3 py-1 bg-blue-50 border-l-4 border-blue-400 text-blue-900 shadow-sm rounded-lg">
                                                      <div>
                                                        <h3 className="text-sm font-semibold flex items-center f-12">
                                                          <Clock3 size={16} className="text-blue-600 mr-2" />
                                                          Demo Duration
                                                        </h3>
                                                        <p className="f-12 mt-0.5">{quote.demo_duration}</p>
                                                      </div>
                                                    </div>
                                                  )}

                                                  {quote.demo_date && (
                                                    <div className="flex items-center px-3 py-1 bg-amber-50 border-l-4 border-amber-400 text-amber-900 shadow-sm rounded-lg">
                                                      <div>
                                                        <h3 className="text-sm font-semibold flex items-center f-12">
                                                          <CalendarDays size={16} className="text-amber-600 mr-2" />
                                                          Demo Date
                                                        </h3>
                                                        <p className="f-12 mt-0.5">
                                                          {new Date(quote.demo_date).toLocaleDateString("en-GB", {
                                                            day: "2-digit",
                                                            month: "short",
                                                            year: "numeric",
                                                          })}
                                                        </p>
                                                      </div>
                                                    </div>
                                                  )}
                                                </div>
                                                <DemoDoneAlready info={info} />
                                                {
                                                  quote.quote_price &&
                                                  quote.plan && (
                                                    <div className="my-2 rounded border p-2">
                                                      <table className="w-full border-collapse " style={{ fontSize: "12px" }}>
                                                        <thead>
                                                          <tr className="bg-gray-50">
                                                            <th className="border px-3 py-2 text-left">Plan Type</th>
                                                            <th className="border px-3 py-2 text-left">Price Details</th>
                                                          </tr>
                                                        </thead>
                                                        <tbody>
                                                          {/* Old Plan Price Row */}
                                                          {quote.old_plan && quote.plan != quote.old_plan && (
                                                            <tr className="border-b">
                                                              <td className="border px-1 py-2">
                                                                <strong>Initial Plan Price</strong>
                                                              </td>
                                                              <td className={`border px-1 py-2 flex flex-col space-y-1`}

                                                              >
                                                                {(() => {
                                                                  const prices = quote.quote_price.split(",");
                                                                  const plans = quote.old_plan.split(",");
                                                                  return plans.map((plan, index) => (
                                                                    <span key={index} className=" bg-gray-100 px-2 py-1 rounded mr-2 text-gray-600"
                                                                      style={{ textAlign: colClass == 'col-md-4' ? 'left' : 'center', width: colClass == 'col-md-4' ? '90%' : '' }}
                                                                    >
                                                                      <p className="line-through">
                                                                        {plan}: {quote.currency == "Other" ? quote.other_currency : quote.currency} {prices[index] ? prices[index] : 0}
                                                                        {quote.mp_price === plan && " (MP Price)"}
                                                                      </p>
                                                                      {quote.new_comments && (() => {
                                                                        let parsedComments;
                                                                        try {
                                                                          parsedComments = JSON.parse(quote.new_comments); // Parse JSON string to object
                                                                        } catch (error) {
                                                                          console.error("Invalid JSON format:", error);
                                                                          return null;
                                                                        }

                                                                        return Object.entries(parsedComments)
                                                                          .filter(([_, value]) => value.trim() !== "") // Remove empty values
                                                                          .map(([key, value]) => (
                                                                            key == plan ? (
                                                                              <p key={key} className="text-black text-sm" style={{ fontSize: "11px", textDecoration: "none !important" }}>
                                                                                {value}
                                                                              </p>
                                                                            ) : null

                                                                          ));
                                                                      })()}
                                                                    </span>
                                                                  ));
                                                                })()}
                                                              </td>

                                                            </tr>
                                                          )}

                                                          {quote.plan && quote.quote_status == 2 && !quote.discount_price && (!quote.old_plan || (quote.plan == quote.old_plan)) && (
                                                            <tr className="border-b">
                                                              <td className="border px-1 py-2">
                                                                <strong>Plan Price</strong>
                                                              </td>
                                                              <td className={`border px-1 py-2 flex flex-col space-y-1`}

                                                              >
                                                                {(() => {
                                                                  const prices = quote.quote_price.split(",");
                                                                  const plans = quote.old_plan.split(",");
                                                                  return plans.map((plan, index) => (
                                                                    <span key={index} className=" bg-gray-100 px-2 py-1 rounded mr-2 text-gray-600"
                                                                      style={{ textAlign: colClass == 'col-md-4' ? 'left' : 'center', width: colClass == 'col-md-4' ? '90%' : '' }}
                                                                    >
                                                                      <p className="line-through">
                                                                        {plan}: {quote.currency == "Other" ? quote.other_currency : quote.currency} {prices[index] ? prices[index] : 0}
                                                                        {quote.mp_price === plan && " (MP Price)"}
                                                                      </p>
                                                                      {quote.new_comments && (() => {
                                                                        let parsedComments;
                                                                        try {
                                                                          parsedComments = JSON.parse(quote.new_comments); // Parse JSON string to object
                                                                        } catch (error) {
                                                                          console.error("Invalid JSON format:", error);
                                                                          return null;
                                                                        }

                                                                        return Object.entries(parsedComments)
                                                                          .filter(([_, value]) => value.trim() !== "") // Remove empty values
                                                                          .map(([key, value]) => (
                                                                            key == plan ? (
                                                                              <p key={key} className="text-black text-sm" style={{ fontSize: "11px", textDecoration: "none !important" }}>
                                                                                {value}
                                                                              </p>
                                                                            ) : null

                                                                          ));
                                                                      })()}
                                                                    </span>
                                                                  ));
                                                                })()}

                                                              </td>

                                                            </tr>
                                                          )}

                                                          {/* Current Quote Price Row */}
                                                          {quote.quote_status != 2 && !quote.discount_price && (
                                                            <tr className="border-b">
                                                              <td className="border px-1 py-2">
                                                                <strong>Quote Price </strong>
                                                              </td>
                                                              <td className={`border px-1 py-2 flex flex-col space-y-1`}

                                                              >
                                                                {(() => {
                                                                  const prices = quote.quote_price.split(",");
                                                                  const plans = quote.plan.split(",");
                                                                  return plans.map((plan, index) => (
                                                                    <span
                                                                      key={index}
                                                                      className={`${quote.discount_price != null ? '' : ''} ruby px-1 py-1 f-12 rounded mr-1`}
                                                                      style={{ textAlign: colClass == 'col-md-4' ? 'left' : '', width: colClass == 'col-md-4' ? '90%' : '' }}
                                                                    >
                                                                      <p className={`${quote.discount_price != null ? 'line-through' : ''}}`}>
                                                                        {plan}: {quote.currency == "Other" ? quote.other_currency : quote.currency} {prices[index] ? prices[index] : 0}
                                                                        {quote.mp_price === plan && " (MP Price)"}
                                                                      </p>
                                                                      {quote.new_comments && (() => {
                                                                        let parsedComments;
                                                                        try {
                                                                          parsedComments = JSON.parse(quote.new_comments); // Parse JSON string to object
                                                                        } catch (error) {
                                                                          console.error("Invalid JSON format:", error);
                                                                          return null;
                                                                        }

                                                                        return Object.entries(parsedComments)
                                                                          .filter(([_, value]) => value.trim() !== "") // Remove empty values
                                                                          .map(([key, value]) => (
                                                                            key == plan ? (
                                                                              <p key={key} className="text-black text-sm" style={{ fontSize: "11px", textDecoration: "none !important" }}>
                                                                                {value}
                                                                              </p>
                                                                            ) : null

                                                                          ));
                                                                      })()}
                                                                    </span>
                                                                  ));
                                                                })()}
                                                              </td>

                                                            </tr>
                                                          )}

                                                          {/* Discounted Price Row */}
                                                          {quote.discount_price && (
                                                            <tr className="border-b">
                                                              <td className="border px-1 py-2">
                                                                <strong>Discounted Price</strong>
                                                              </td>
                                                              <td className={`border px-1 py-2 flex flex-col space-y-1`}

                                                              >
                                                                {(() => {
                                                                  const prices = quote.discount_price.split(",");
                                                                  const plans = quote.plan.split(",");
                                                                  return plans.map((plan, index) => (
                                                                    <span key={index} className="silver px-1 py-1 f-12 rounded mr-1"
                                                                      style={{ textAlign: colClass == 'col-md-4' ? 'left' : '', width: colClass == 'col-md-4' ? '90%' : '' }}
                                                                    >
                                                                      {plan}: {quote.currency == "Other" ? quote.other_currency : quote.currency} {prices[index] ?? 0}
                                                                      {quote.mp_price === plan && " (MP Price)"}

                                                                      {quote.new_comments && (() => {
                                                                        let parsedComments;
                                                                        try {
                                                                          parsedComments = JSON.parse(quote.new_comments); // Parse JSON string to object
                                                                        } catch (error) {
                                                                          console.error("Invalid JSON format:", error);
                                                                          return null;
                                                                        }

                                                                        return Object.entries(parsedComments)
                                                                          .filter(([_, value]) => value.trim() !== "") // Remove empty values
                                                                          .map(([key, value]) => (
                                                                            key == plan ? (
                                                                              <p key={key} className="text-black text-sm" style={{ fontSize: "11px", textDecoration: "none !important" }}>
                                                                                {value}
                                                                              </p>
                                                                            ) : null

                                                                          ));
                                                                      })()}
                                                                    </span>
                                                                  ));
                                                                })()}
                                                              </td>


                                                            </tr>
                                                          )}

                                                          {/* Final Price Row */}
                                                          {quote.final_price && (
                                                            <tr>
                                                              <td className="border px-1 py-2">
                                                                <strong>Final Price</strong>
                                                              </td>
                                                              <td className={`border px-1 py-2 flex flex-col space-y-1`}

                                                              >
                                                                {(() => {
                                                                  const prices = quote.final_price.split(",");
                                                                  const plans = quote.plan.split(",");
                                                                  return plans.map((plan, index) => (
                                                                    <span key={index} className="gold px-1 py-1 f-12 rounded mr-1"
                                                                      style={{ textAlign: colClass == 'col-md-4' ? 'left' : '', width: colClass == 'col-md-4' ? '90%' : '' }}
                                                                    >
                                                                      {plan}: {quote.currency == "Other" ? quote.other_currency : quote.currency} {prices[index]}
                                                                      {quote.new_comments && (() => {
                                                                        let parsedComments;
                                                                        try {
                                                                          parsedComments = JSON.parse(quote.new_comments); // Parse JSON string to object
                                                                        } catch (error) {
                                                                          console.error("Invalid JSON format:", error);
                                                                          return null;
                                                                        }

                                                                        return Object.entries(parsedComments)
                                                                          .filter(([_, value]) => value.trim() !== "") // Remove empty values
                                                                          .map(([key, value]) => (
                                                                            key == plan ? (
                                                                              <p key={key} className="text-black text-sm" style={{ fontSize: "11px", textDecoration: "none !important" }}>
                                                                                {value}
                                                                              </p>
                                                                            ) : null

                                                                          ));
                                                                      })()}
                                                                    </span>
                                                                  ));
                                                                })()}
                                                              </td>
                                                            </tr>
                                                          )}
                                                        </tbody>
                                                      </table>

                                                      {/* Edit Button and Comments Section */}
                                                      <div className="mt-3">
                                                        <div className="flex items-center mb-2">
                                                          <span className="font-weight-bold">Edit Quote Price</span>
                                                          {quote.quote_status == 1 && loopUserObject.id != "206" && (
                                                            <button
                                                              onClick={() => toggleEditingForm(quote)}
                                                              className="btn btn-warning btn-sm px-1 text-white ml-2"
                                                            >
                                                              <Pencil size={8} className="text-white" />
                                                            </button>
                                                          )}
                                                        </div>

                                                        {quote.user_comments && (
                                                          <p className="text-gray-600 text-sm">
                                                            <strong>Admin Comments:</strong> {quote.user_comments}
                                                          </p>
                                                        )}
                                                        {quote.new_comments && (() => {
                                                          let parsedComments;
                                                          try {
                                                            parsedComments = JSON.parse(quote.new_comments); // Parse JSON string to object
                                                          } catch (error) {
                                                            console.error("Invalid JSON format:", error);
                                                            return null; // Return nothing if parsing fails
                                                          }

                                                          return Object.entries(parsedComments)
                                                            .filter(([_, value]) => value.trim() !== "") // Remove empty values
                                                            .map(([key, value]) => (
                                                              <p key={key} className="text-black text-sm" style={{ fontSize: "11px" }}>
                                                                <span>Comments for {key}:</span> {value}
                                                              </p>
                                                            ));
                                                        })()}

                                                        {quote.quote_time && (
                                                          <p className="text-gray-500 text-xs text-right mt-2">
                                                            {new Date(quote.quote_time).toLocaleDateString("en-US", {
                                                              day: "numeric",
                                                              month: "short",
                                                              year: "numeric",
                                                              hour: "numeric",
                                                              minute: "2-digit",
                                                              hour12: true,
                                                            }).replace(",", ",")}
                                                          </p>
                                                        )}
                                                      </div>
                                                    </div>
                                                  )}
                                                {assignQuoteInfo &&
                                                  assignQuoteInfo != false && (
                                                    <p>
                                                      <strong>
                                                        Assigned To:
                                                      </strong>{" "}
                                                      {assignQuoteInfo.name}
                                                    </p>
                                                  )}

                                                {assignQuoteInfo &&
                                                  assignQuoteInfo != false && (
                                                    <>
                                                      {assignQuoteInfo.status ===
                                                        0 ? (
                                                        <>
                                                          <p>
                                                            <strong>
                                                              Assigned To:
                                                            </strong>{" "}
                                                            {assignQuoteInfo.name}
                                                          </p>
                                                          <p>
                                                            <strong>
                                                              Assign Date:
                                                            </strong>{" "}
                                                            {
                                                              assignQuoteInfo.assigned_date
                                                            }
                                                          </p>
                                                          <p>
                                                            <strong>
                                                              Admin Comments:
                                                            </strong>{" "}
                                                            {
                                                              assignQuoteInfo.admin_comments
                                                            }
                                                          </p>
                                                        </>
                                                      ) : (
                                                        <>
                                                          <p>
                                                            Submitted by{" "}
                                                            {assignQuoteInfo.name}
                                                          </p>
                                                          <p>
                                                            <strong>
                                                              Price:
                                                            </strong>{" "}
                                                            {
                                                              assignQuoteInfo.currency
                                                            }{" "}
                                                            {
                                                              assignQuoteInfo.quote_price
                                                            }
                                                          </p>
                                                          <p>
                                                            <strong>
                                                              Submitted Date:
                                                            </strong>{" "}
                                                            {new Date(
                                                              assignQuoteInfo.user_submitted_date *
                                                              1000
                                                            ).toLocaleDateString(
                                                              "en-GB"
                                                            )}
                                                            {new Date(
                                                              assignQuoteInfo.user_submitted_date *
                                                              1000
                                                            ).toLocaleTimeString(
                                                              "en-GB",
                                                              {
                                                                hour: "2-digit",
                                                                minute: "2-digit",
                                                                hour12: true,
                                                              }
                                                            )}
                                                          </p>
                                                          <p>
                                                            <strong>
                                                              Assigned Comments:
                                                            </strong>{" "}
                                                            {
                                                              assignQuoteInfo.admin_comments
                                                            }
                                                          </p>
                                                          <p>
                                                            <strong>
                                                              Comments:
                                                            </strong>{" "}
                                                            {assignQuoteInfo.user_comments !=
                                                              ""
                                                              ? assignQuoteInfo.user_comments
                                                              : assignQuoteInfo.admin_comments}
                                                          </p>
                                                        </>
                                                      )}
                                                      {assignQuoteInfo.status ==
                                                        1 && (
                                                          <form
                                                            name="edit_price_form"
                                                            id="edit_price_form"
                                                            className="form-horizontal"
                                                          >
                                                            <div className="box-body">
                                                              <input
                                                                type="hidden"
                                                                name="task_id"
                                                                id="task_id"
                                                                value={
                                                                  assignQuoteInfo.id
                                                                }
                                                              />
                                                              <input
                                                                type="hidden"
                                                                name="quoteid"
                                                                id="quoteid"
                                                                value={
                                                                  assignQuoteInfo.quote_id
                                                                }
                                                              />
                                                              <div className="form-group">
                                                                <label className="col-sm-12 control-label">
                                                                  Quote Price (INR)
                                                                </label>
                                                                <div className="col-sm-12">
                                                                  <input
                                                                    type="text"
                                                                    className="form-control"
                                                                    id="quote_price"
                                                                    name="quote_price"
                                                                    value={
                                                                      quotePrice ||
                                                                      assignQuoteInfo?.quote_price ||
                                                                      ""
                                                                    }
                                                                    placeholder="Quote Price"
                                                                    onChange={(e) =>
                                                                      setQuotePrice(
                                                                        e.target
                                                                          .value
                                                                      )
                                                                    }
                                                                  />
                                                                </div>
                                                              </div>
                                                              <div className="form-group">
                                                                <label className="col-sm-3 control-label">
                                                                  Comments
                                                                </label>
                                                                <div className="col-sm-12">
                                                                  <textarea
                                                                    className="form-control"
                                                                    id="user_comments"
                                                                    name="user_comments"
                                                                    value={
                                                                      userComments ||
                                                                      assignQuoteInfo?.user_comments ||
                                                                      assignQuoteInfo?.admin_comments ||
                                                                      ""
                                                                    }
                                                                    onChange={(e) =>
                                                                      setUserComments(
                                                                        e.target
                                                                          .value
                                                                      )
                                                                    }
                                                                  />
                                                                </div>
                                                              </div>
                                                            </div>

                                                            <div className="modal-footer tabb">
                                                              <span id="load_btn">
                                                                <button
                                                                  type="button"
                                                                  className="btn"
                                                                  onClick={() =>
                                                                    updatePriceQuote()
                                                                  }
                                                                  disabled={
                                                                    priceLoading
                                                                  }
                                                                >
                                                                  Confirm
                                                                </button>
                                                              </span>
                                                            </div>
                                                          </form>
                                                        )}
                                                    </>
                                                  )}
                                              </div>

                                              {quote.quote_issue == 1 ? (
                                                <div className="mb-0 mx-0 mt-0 p-1 space-y-4 bg-red-100 rounded">
                                                  <p className="text-red-500 font-medium">Quote Issue !</p>
                                                  {quote.issue_comments && quote.issue_comments != '' && (
                                                    <span>
                                                      {quote.issue_comments}
                                                    </span>
                                                  )}
                                                </div>
                                              ) : null}

                                              <div>

                                                <CallRecordingPending
                                                  scopeDetails={quote}
                                                  quoteId={quote.quoteid}
                                                  after={
                                                    fetchScopeDetailsForSocket
                                                  }
                                                />


                                              </div>
                                              {quote.ptp != null && (
                                                <div className="">
                                                  <div className="ptp-get-amt mb-3">
                                                    <div className="d-flex justify-between align-items-start mb-2">
                                                      <p className="text-sm">
                                                        <strong>
                                                          PTP Details
                                                        </strong>
                                                      </p>
                                                      <div>
                                                        {quote.ptp === "Yes" &&
                                                          quote.ptp_amount &&
                                                          quote.ptp_amount !=
                                                          0 && (
                                                            <p className="bg-white flex items-center justify-center text-green-600 p-1 rounded">
                                                              <BadgeDollarSign
                                                                size={10}
                                                                className="mr-1"
                                                              />
                                                              <strong className="mr-1">
                                                                PTP Amount :
                                                              </strong>{" "}
                                                              <strong>
                                                                {quote.ptp_amount}
                                                              </strong>
                                                            </p>
                                                          )}
                                                      </div>
                                                    </div>
                                                    <div className="space-y-1 text-gray-600">
                                                      {quote.ptp_comments !==
                                                        "" && (
                                                          <p>
                                                            <strong>
                                                              PTP Comments :
                                                            </strong>{" "}
                                                            {quote.ptp_comments}
                                                          </p>
                                                        )}
                                                      {quote.ptp_file != null && (
                                                        <p className="flex items-center gap-1">
                                                          <strong>
                                                            Attached File :
                                                          </strong>
                                                          <Download className="text-blue-500 w-4 h-4" />
                                                          <a
                                                            className="text-blue-500 font-semibold hover:underline"
                                                            href={`https://apacvault.com/public/ptpfiles/${quote.ptp_file}`}
                                                            download={
                                                              quote.ptpfile
                                                            }
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
                                                            {new Date(
                                                              quote.ptp_time
                                                            )
                                                              .toLocaleDateString(
                                                                "en-US",
                                                                {
                                                                  day: "numeric",
                                                                  month: "short",
                                                                  year: "numeric",
                                                                  hour: "numeric",
                                                                  minute:
                                                                    "2-digit",
                                                                  hour12: true,
                                                                }
                                                              )
                                                              .replace(",", ",")}
                                                          </p>
                                                        </div>
                                                      )}
                                                    </div>
                                                  </div>
                                                </div>
                                              )}
                                              <div className="row mt-0 mx-1">
                                                {quote.quote_status != 1 &&
                                                  quote.submittedtoadmin ==
                                                  "true" &&
                                                  loopUserObject.id != "206" && (
                                                    <>
                                                      <div className="nav-tabs-custom tabb p-3 shadow-0">
                                                        <ul className="nav border-none nav-tabs pb-2 p-0">
                                                          <li className="btn btn-primary btn-sm border-0 f-12">
                                                            Submit Price {info.website_name && (" - " + info.website_name)}
                                                          </li>

                                                          <AlreadyQuoteGiven email_id={clientEmail} website_id={clientWebsite} setAlreadyGiven={setAlreadyGiven} />

                                                        </ul>

                                                        <div className="tab-content p-0 mt-2">
                                                          <div className="tab-pane active" id="tab_2">
                                                            <form
                                                              method="post"
                                                              name="submitQuoteForm"
                                                              id="submitQuoteForm"
                                                              className="form-horizontal"
                                                              onKeyDown={(e) => {
                                                                if (e.ctrlKey && e.key === "Enter") {
                                                                  e.preventDefault(); // prevent accidental form submission
                                                                  PriceSubmitValidate(
                                                                    quote.assign_id,
                                                                    quote.quoteid,
                                                                    quote.plan,
                                                                    quote.user_id,
                                                                    quote.ptp_count ?? 0
                                                                  );
                                                                }
                                                              }}
                                                            >
                                                              <input
                                                                type="hidden"
                                                                name="ref_id"
                                                                value={
                                                                  quote.assign_id
                                                                }
                                                              />
                                                              <input
                                                                type="hidden"
                                                                name="quote_id"
                                                                value={
                                                                  quote.quoteid
                                                                }
                                                              />

                                                              <div className="box-body p-0 f-12">
                                                                <table className="w-full border-collapse">
                                                                  <thead>
                                                                    <tr>
                                                                      <th className="border px-2 py-2 w-1/6">Plan</th>
                                                                      <th className="border px-2 py-2 w-2/6">Amount</th>
                                                                      <th className="border px-2 py-2 w-auto">Comment</th>
                                                                    </tr>
                                                                  </thead>
                                                                  <tbody>
                                                                    {["Basic", "Standard", "Advanced"].map((plan, index) => (
                                                                      <tr key={index}>
                                                                        <td className="border px-2 py-2 w-1/4" style={{ fontSize: "10px" }}>
                                                                          <label htmlFor={`amount_${plan}`} className="mb-0">
                                                                            {plan} ({quote.currency === "Other" ? quote.other_currency : quote.currency})

                                                                            {(() => {
                                                                              let parsedComments = null;
                                                                              if (quote.new_comments) {
                                                                                try {
                                                                                  parsedComments = JSON.parse(quote.new_comments);
                                                                                } catch (error) {
                                                                                  console.error("Invalid JSON format:", error);
                                                                                }
                                                                              }

                                                                              return (
                                                                                <i
                                                                                  class="fa fa-info bg-gray-500 px-1 py-0.5 rounded-full text-white ml-1"
                                                                                  style={{ fontSize: "8px" }}
                                                                                  data-tooltip-id="my-tooltip" data-tooltip-content={parsedComments?.[plan] || ""}
                                                                                ></i>
                                                                              );
                                                                            })()}
                                                                          </label>


                                                                        </td>
                                                                        <td className="border px-1 py-2 ">
                                                                          <div className="flex items-start">
                                                                            <input
                                                                              type="text"
                                                                              name={`amount_${plan}`}
                                                                              id={`amount_${plan}`}
                                                                              className="form-control form-control-sm"
                                                                              value={
                                                                                amounts[plan] ||
                                                                                (quote.quote_status == 2 && quote.plan === plan
                                                                                  ? quote.quote_price.split(",")[quote.old_plan ? quote.old_plan.split(",").indexOf(plan) : quote.plan.split(",").indexOf(plan)]
                                                                                  : "")
                                                                              }

                                                                              required={quote.plan && quote.plan.split(",").includes(plan)}
                                                                              disabled={!quote.plan || !quote.plan.split(",").includes(plan)}
                                                                              onChange={(e) => handleAmountChange(e, plan)}
                                                                            />
                                                                            <div className="error" id={`amountError_${plan}`}></div>

                                                                            <input
                                                                              type="checkbox"
                                                                              className="nh-1 nw-1 mx-1"
                                                                              id={`mp_${plan}`}
                                                                              name={`mp_${plan}`}
                                                                              checked={selectedMP === plan}
                                                                              onChange={() => handleMPChange(plan)}
                                                                              disabled={!quote.plan || !quote.plan.split(",").includes(plan)}
                                                                            />
                                                                            <label for={`mp_${plan}`} style={{ fontSize: "8px" }}>MP</label>


                                                                          </div>
                                                                        </td>

                                                                        <td className="border px-4 py-2 text-center w-auto ">
                                                                          <div className="flex items-center">

                                                                            <button
                                                                              type="button"
                                                                              className={`btn  px-1 py-1 flex items-center justify-between ${showComments[plan] ? "btn-danger" : "btn-info"}`}
                                                                              style={{ fontSize: "10px" }}
                                                                              disabled={!quote.plan || !quote.plan.split(",").includes(plan)}
                                                                              onClick={() => toggleCommentBox(plan)}
                                                                            >
                                                                              {showComments[plan] ? <MessageCircleX size={18} /> : <MessageCirclePlus size={18} className="" />}
                                                                            </button>

                                                                            <div className="ml-0.5">
                                                                              {["Basic", "Standard", "Advanced"].map(
                                                                                (p) =>
                                                                                  showComments[p] && p == plan && (
                                                                                    <div key={p} className="mt-1">
                                                                                      <textarea
                                                                                        name={`comment_${p}`}
                                                                                        id={`comment_${p}`}
                                                                                        placeholder={`Comments for ${p}`}
                                                                                        className="form-control form-control-sm w-full"
                                                                                        value={comments[p]}
                                                                                        onChange={(e) =>
                                                                                          setComments({ ...comments, [p]: e.target.value })
                                                                                        }
                                                                                      ></textarea>
                                                                                      <div className="error" id={`commentError_${p}`}></div>
                                                                                    </div>
                                                                                  )
                                                                              )}
                                                                            </div>
                                                                          </div>
                                                                        </td>
                                                                      </tr>
                                                                    ))}
                                                                  </tbody>
                                                                </table>




                                                                <div className="mt-4 text-right">
                                                                  <input
                                                                    type="button"
                                                                    name="priceSubmitted"
                                                                    className="btn btn-success btn-sm f-12"
                                                                    value={quoteLoading ? "Submitting" : "Submit"}
                                                                    onClick={() => PriceSubmitValidate(
                                                                      quote.assign_id,
                                                                      quote.quoteid,
                                                                      quote.plan,
                                                                      quote.user_id,
                                                                      quote.ptp_count ?? 0
                                                                    )}
                                                                    disabled={quoteLoading}
                                                                  />
                                                                </div>
                                                              </div>
                                                            </form>
                                                          </div>
                                                        </div>
                                                      </div>
                                                    </>
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
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                              {chatTabVisible && (
                                <div
                                  className={`${fullScreenTab == "chat"
                                    ? "custom-modal"
                                    : colClass
                                    } p-0`}
                                >
                                  <div
                                    className={`${fullScreenTab == "chat"
                                      ? "custom-modal-content"
                                      : ""
                                      } `}
                                  >
                                    <div className={`p-0 `}>
                                      <Chat
                                        quoteId={quote.quoteid}
                                        refId={quote.assign_id}
                                        status={quote.quote_status}
                                        submittedToAdmin={
                                          quote.submittedtoadmin
                                        }
                                        finalFunction={fetchScopeDetails}
                                        allDetails={quote}
                                        finalfunctionforsocket={
                                          fetchScopeDetailsForSocket
                                        }
                                        handlefullScreenBtnClick={
                                          handlefullScreenBtnClick
                                        }
                                        chatTabVisible={chatTabVisible}
                                        fullScreenTab={fullScreenTab}
                                      />
                                    </div>
                                  </div>
                                </div>
                              )}

                              {feasTabVisible && quote.isfeasability == 1 && (
                                <div
                                  className={`${fullScreenTab == "feas"
                                    ? "custom-modal"
                                    : colClass
                                    }`}
                                >
                                  <div
                                    className={`${fullScreenTab == "feas"
                                      ? "custom-modal-content"
                                      : ""
                                      } `}
                                  >
                                    <div className={` pr-0`}>
                                      <div className="bg-white">
                                        <>
                                          {quote.isfeasability == 1 && (
                                            <>
                                              <div className="py-2 px-2 flex items-center justify-between bg-blue-100">
                                                <h3 className="">
                                                  <strong>Feasibility</strong>
                                                </h3>
                                                <div className="flex items-center">
                                                  {quote.feasability_status ==
                                                    "Completed" && (
                                                      <>
                                                        {loopUserObject.id !=
                                                          "206" && (
                                                            <button
                                                              onClick={() => {
                                                                toggleFeasCommentsEditingForm(
                                                                  quote
                                                                );
                                                              }}
                                                              className="btn btn-sm btn-primary flex items-center p-1 mr-2"
                                                            >
                                                              <Pencil
                                                                className=""
                                                                size={12}
                                                              />
                                                            </button>
                                                          )}
                                                      </>
                                                    )}
                                                  <button className="">
                                                    {fullScreenTab == "feas" ? (
                                                      <Minimize2
                                                        size={23}
                                                        onClick={() => {
                                                          handlefullScreenBtnClick(
                                                            null
                                                          );
                                                        }}
                                                        className="btn btn-sm btn-light flex items-center p-1"
                                                      />
                                                    ) : (
                                                      <Expand
                                                        size={20}
                                                        onClick={() => {
                                                          handlefullScreenBtnClick(
                                                            "feas"
                                                          );
                                                        }}
                                                        className="btn btn-sm btn-light flex items-center p-1"
                                                      />
                                                    )}
                                                  </button>
                                                </div>
                                              </div>

                                              {quote.feasability_status ==
                                                "Completed" && (
                                                  <>
                                                    <div className="px-3 pt-3 pb-0">
                                                      <p
                                                        style={{
                                                          textDecoration:
                                                            "italic",
                                                        }}
                                                        className="italic px-0 f-12"
                                                      >
                                                        <strong>
                                                          Feasibility Comments:
                                                        </strong>

                                                        <span
                                                          className="mt-2"
                                                          dangerouslySetInnerHTML={{
                                                            __html:
                                                              quote.feasability_comments,
                                                          }}
                                                        />
                                                      </p>
                                                      {quote.feas_file_name && (
                                                        <p className="flex items-center">
                                                          Feasibility Attachment :{" "}
                                                          <a
                                                            href={
                                                              "https://apacvault.com/public/feasabilityFiles/" +
                                                              quote.feas_file_name
                                                            }
                                                            target="_blank"
                                                            className="text-blue-600 flex items-center ml-2"
                                                          >
                                                            <Paperclip
                                                              size={13}
                                                            />{" "}
                                                            View File
                                                          </a>
                                                        </p>
                                                      )}
                                                    </div>
                                                  </>
                                                )}
                                            </>
                                          )}
                                          <div className="p-3">
                                            <MergedHistoryComponentNew
                                              quoteId={quote.quoteid}
                                              refId={quote.assign_id}
                                              onlyFetch="feasibility"
                                              quote={quote}
                                            />
                                          </div>
                                        </>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                              {fileTabVisible && (
                                <div
                                  className={`${fullScreenTab == "file"
                                    ? "custom-modal"
                                    : colClass
                                    }`}
                                >
                                  <div
                                    className={`${fullScreenTab == "file"
                                      ? "custom-modal-content"
                                      : ""
                                      }`}
                                  >
                                    <div className={` pr-0`}>
                                      <div className="bg-white">
                                        <>
                                          <div className="py-2 px-2 flex items-center justify-between bg-blue-100">
                                            <h3 className=""><strong>Attached Files</strong></h3>
                                            <div className='flex items-center n-gap-3'>
                                              {!showUpload && (
                                                <button
                                                  onClick={() => setShowUpload(true)}
                                                  className="btn btn-info btn-sm f-11 flex items-center px-2 n-py-1"
                                                >
                                                  <Upload className="mr-1" size={10} /> Attach more file
                                                </button>
                                              )}
                                              <button className="">
                                                {fullScreenTab == "file" ? (<Minimize2 size={23} onClick={() => { handlefullScreenBtnClick(null) }} className="btn btn-sm btn-light flex items-center p-1" />) : (<Expand size={20} onClick={() => { handlefullScreenBtnClick("file") }} className="btn btn-sm btn-light flex items-center p-1" />)}
                                              </button>
                                            </div>
                                          </div>

                                          <AttachedFiles ref_id={quote.assign_id} relevant_file={quote.relevant_file} quote={quote}
                                            showUpload={showUpload}
                                            setShowUpload={changeShowUpload}
                                            queryInfo={info}
                                          />

                                        </>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {issueTabVisible && (
                                <div
                                  className={`${fullScreenTab == "issue"
                                    ? "custom-modal"
                                    : colClass
                                    }`}
                                >
                                  <div
                                    className={`${fullScreenTab == "issue"
                                      ? "custom-modal-content"
                                      : ""
                                      }`}
                                  >
                                    <div className={` pr-0`}>
                                      <div className="bg-white">
                                        <>
                                          <div className="py-2 px-2 flex items-center justify-between bg-blue-100">
                                            <h3 className=""><strong>Quote Issue</strong></h3>
                                            <div className='flex items-center n-gap-3'>

                                            </div>
                                          </div>
                                          <div className="px-2 py-2 bg-white">

                                            <QuoteIssue
                                              scopeDetails={quote}
                                              quoteId={quote.quoteid}
                                              after={
                                                fetchScopeDetailsForSocket
                                              }
                                            />



                                          </div>

                                        </>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <AnimatePresence>
        {editFormOpen && (
          <AddTags
            quoteId={selectedQuoteId}
            refId={queryId}
            userId={userIdForTag}
            onClose={() => {
              setEditFormOpen(!editFormOpen);
            }}
            after={fetchScopeDetails}
            notification="yes"
          />
        )}
        {historyPanelOpen && (
          <HistorySideBar
            quoteId={quoteIdForHistory}
            refId={queryId}
            onClose={() => {
              SetHistoryPanelOpen(!historyPanelOpen);
            }}
          />
        )}

        {feasHistoryPanelOpen && (
          <FeasHistorySideBar
            quoteId={quoteIdForFeasHistory}
            refId={refIdForFeasHistory}
            onClose={() => {
              SetFeasHistoryPanelOpen(!feasHistoryPanelOpen);
            }}
          />
        )}
        {allRequestDivOpen && (
          <AllRequestSideBar
            refId={queryId}
            onClose={() => {
              setAllRequestDivOpen(!allRequestDivOpen);
            }}
          />
        )}
        {clientEmailDivOpen && (
          <ClientEmailSideBar
            refIds={refIds}
            onClose={() => {
              setClientEmailDivOpen(!clientEmailDivOpen);
            }}
          />
        )}
        {followersFormOpen && (
          <AddFollowers
            quoteId={selectedQuoteId}
            refId={queryId}
            onClose={() => {
              setFollowersFormOpen(!followersFormOpen);
            }}
            after={fetchScopeDetails}
          />
        )}
        {editingFormOpen && (
          <EditPriceComponent
            quote={selectedQuoteId}
            PriceSubmitValidate={PriceSubmitValidate}
            refId={queryId}
            onClose={() => {
              setEditingFormOpen(!editingFormOpen);
            }}
            after={fetchScopeDetailsForSocket}
          />
        )}
        {feascommentseditingFormOpen && (
          <EditFeasibilityCommentsComponent
            quote={selectedQuoteId}
            onClose={() => {
              setFeasCommentsEditingFormOpen(!feascommentseditingFormOpen);
            }}
            after={fetchScopeDetailsForSocket}
          />
        )}
        {completeFeasabilityDiv && (
          <CompleteFeasability
            onClose={() => {
              setCompleteFeasabilityDiv(!completeFeasabilityDiv);
            }}
            quoteId={selectedQuoteId}
            refId={selectedRefId}
            userId={selectedUser}
            after={fetchScopeDetailsForSocket}
            quoteFollowers={quoteFollowers}
          />
        )}

        {commentEditFormOpen && (
          <EditCommentsComponent
            quote={commentQuote}
            plan={commentPlan}
            comment={commentText}
            wordCount={commentWordCount}
            onClose={() => {
              setCommentEditFormOpen(false);
            }}
            after={fetchScopeDetailsForSocket}
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
                  onClick={() => { setLinkedQuoteId(null) }}
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
              viewAll={viewAll}
              clientEmail={info.email_id}
              clientWebsite={info.website_id}
              info={info}
            />
          </motion.div>
        )}
      </AnimatePresence>
      <Tooltip id="my-tooltip" />
    </div>
  );
};

export default AskForScopeAdmin;
