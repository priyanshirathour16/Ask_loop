import DataTable from "datatables.net-react";
import DT from "datatables.net-dt";
import $ from "jquery";
import React, { useState, useEffect, useRef } from "react";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";
import axios from "axios";
import "daterangepicker/daterangepicker.css"; // Import daterangepicker CSS
import "daterangepicker"; // Import daterangepicker JS
import moment from "moment";
import "select2/dist/css/select2.css";
import "select2";
import CustomLoader from "../CustomLoader";
import {
  FileSpreadsheet,
  Pencil,
  CheckCircle,
  XCircle,
  Check,
  RefreshCcw,
  Filter,
  FileQuestion,
  ArrowBigLeft,
  MoveLeft,
  ArrowLeftRight,
  FilterIcon,
  Users,
  X,
  PercentCircle,
  Clock,
} from "lucide-react";
import QueryDetailsAdmin from "./QueryDetailsAdmin";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import AllFeasPage from "./AllFeasPage";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import FeasabilityPage from "./FeasabilityPage";
import * as XLSX from "xlsx";
import { io } from "socket.io-client";
import { getSocket } from "./Socket";
import TransferRequestsPage from "./TransferRequestsPage";
import TableLoader from "../components/TableLoader";
import UsersRequestCount from "./UsersRequestCount";
import Xls from "./Xls";
import AlreadyGivenList from "./AlreadyGivenList";
import { Tooltip } from "react-tooltip";
import StatsModal from "./StatsModal";
const socket = getSocket();

const ManageQuery = ({ sharelinkrefid, sharelinkquoteid }) => {
  const [quotes, setQuotes] = useState([]);
  const [userPendingQuotes, setUserPendingQuotes] = useState([]);
  const [adminPendingQuotes, setAdminPendingQuotes] = useState([]);
  const [refID, setRefId] = useState("");
  const [scopeId, setScopeId] = useState("");
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState([]);
  const [feasStatus, setFeasStatus] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [users, setUsers] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState([]);
  const [selectedSubjectArea, setSelectedSubjectArea] = useState([]);
  const [selectedUser, setSelectedUser] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [ptp, setPtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [tags, setTags] = useState([]);
  const tagsRef = useRef(null);
  const selectUserRef = useRef(null);
  const selectServiceRef = useRef(null);
  const selectSubjectRef = useRef(null);
  const selectStatusRef = useRef(null);
  const [selectedQuery, setSelectedQuery] = useState("");
  const [selectedQuote, setSelectedQuote] = useState("");
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isAllFeasOpen, setIsAllFeasOpen] = useState(false);
  const [pendingFeasRequestCount, setPendingFeasRequestCount] = useState(0);
  const [pendingTransRequestCount, setPendingTransRequestCount] = useState(0);
  const [startDate, setStartDate] = useState(null);
  const [TransferPageVisible, setTransferPageVisible] = useState(false);
  const [endDate, setEndDate] = useState(null);
  const [callOption, setCallOption] = useState("");
  const [quoteIssue, setQuoteIssue] = useState("");
  const [alreadyGiven, setAlreadyGiven] = useState("");
  const [activeTab, setActiveTab] = useState("pendingAdmin");
  const [selectedRows, setSelectedRows] = useState([]);
  const [filterSummary, setFilterSummary] = useState("");
  const [showFilterDiv, setShowFilterDiv] = useState(true);

  const navigate = useNavigate();

  DataTable.use(DT);

  const userData = localStorage.getItem("user");

  const userObject = JSON.parse(userData);

  const loopUserData = localStorage.getItem("loopuser");

  const loopUserObject = JSON.parse(loopUserData);

  useEffect(() => {
    const isAuthorizedUser =
      userObject &&
      (userObject.email_id == "accounts@redmarkediting.com" ||
        userObject.id == "366");

    const isScopeAdmin = loopUserObject && loopUserObject.scopeadmin == 1;

    if (!isAuthorizedUser && !isScopeAdmin) {
      navigate("/assignquery");
    }
  }, [userObject, loopUserObject, navigate]);

  const loggedInUserToken = localStorage.getItem("loggedInToken");

  const [file, setFile] = useState(null);
  const [uploadedFileInfo, setUploadedFileInfo] = useState(null);
  const [error, setError] = useState("");
  const [fileContent, setFileContent] = useState([]);
  const [showUpload, setShowUpload] = useState(false);

  const getTrimmedFilename = (filename, maxLength = 40) => {
    if (!filename || filename.length <= maxLength) return filename;
    const start = filename.slice(0, 20);
    const end = filename.slice(-15);
    return `${start}...${end}`;
  };

  const [statsLoading, setStatsLoading] = useState(null);
  const [stats, setStats] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [statsModalOpen, setStatsModalOpen] = useState(false);
  const [selectedTabForStats, setSelectedTabForStats] = useState(null);
  // Function to fetch stats
  const fetchStats = async (load = true) => {
    try {
      setStatsLoading(load);
      const res = await fetch(
        "https://loopback-skci.onrender.com/api/scope/getDailyStatistics",
        {
          method: "GET",
          headers: {
            "Content-type": "application/json",
          },
        },
      );
      const data = await res.json();
      if (data.status) {
        // Convert array → object for easier access
        const statsObj = data.data.reduce((acc, cur) => {
          acc[cur.day] = cur;
          return acc;
        }, {});
        setStats(statsObj);
        setLastUpdated(new Date().toLocaleTimeString());
      }
    } catch (e) {
      console.error("Error fetching stats:", e);
    } finally {
      setStatsLoading(false);
    }
  };

  // Call fetchStats once when component mounts
  useEffect(() => {
    fetchStats();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch(
        "https://loopback-skci.onrender.com/api/users/allusers",
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        },
      );
      const data = await response.json();
      if (data.status) setUsers(data.data || []);
    } catch (error) {
      toast.error("Failed to fetch tags.");
    }
  };

  useEffect(() => {
    fetchAndDisplayFile();
    fetchUsers();
  }, []);

  const fetchAndDisplayFile = async () => {
    try {
      const res = await fetch(
        "https://loopback-skci.onrender.com/api/scope/getXlsFileApiAction",
      );
      const data = await res.json();

      if (data.status && data.file) {
        const fileName = data.file;
        setUploadedFileInfo(fileName);

        const fileUrl = `https://apacvault.com/public/QuotationFolder/${fileName}`;
        const fileRes = await fetch(fileUrl);
        const blob = await fileRes.blob();
        const arrayBuffer = await blob.arrayBuffer();

        const workbook = XLSX.read(arrayBuffer, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[firstSheetName];
        const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        const filteredData = rawData
          .filter((row, index) => {
            return index > 0 && row.length === 2 && row[0] !== "Ref. No.";
          })
          .map((row) => ({
            refNo: row[0],
            status: row[1],
          }));

        setFileContent(filteredData);
        // console.log("Filtered Data:", filteredData);
      }
    } catch (err) {
      console.error("Failed to fetch or read the XLSX file:", err);
    }
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected && selected.name.endsWith(".xlsx")) {
      setFile(selected);
      setError("");
    } else {
      setError("Please upload a valid .xlsx file");
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("No file selected");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(
        "https://loopback-skci.onrender.com/api/scope/uploadQuoteXlsFileApiAction",
        {
          method: "POST",
          body: formData,
        },
      );

      const data = await res.json();

      if (data.status) {
        // console.log("Upload response:", data);
        setUploadedFileInfo(data.file);
        setError("");
        fetchAndDisplayFile();
        setFile(null);
        setShowUpload(false);
      } else {
        toast.error(data.message || "Upload failed");
      }
    } catch (err) {
      toast.error("Error uploading file");
      console.error(err);
    }
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };
  const handleSelectAll = (isChecked) => {
    if (isChecked) {
      // Select all rows across all pages
      setSelectedRows(quotes.map((row) => row.id)); // Select all row IDs
      $(".row-checkbox").prop("checked", true); // Check all row checkboxes
    } else {
      // Deselect all rows across all pages
      setSelectedRows([]); // Deselect all rows
      $(".row-checkbox").prop("checked", false); // Uncheck all row checkboxes
    }
  };

  const handleRowSelect = (rowId, isChecked) => {
    setSelectedRows(
      (prevSelected) =>
        isChecked
          ? [...prevSelected, rowId] // Add row ID if checked
          : prevSelected.filter((id) => id != rowId), // Remove row ID if unchecked
    );
  };

  const handleExport = () => {
    // Define the custom headers and map the data
    const headers = [
      "Ref ID",
      "Ask For Scope Id",
      "Client Name",
      "CRM Name",
      "Currrency",
      "Comments",
      "Service",
      "Quote Status",
      "Feasibility Status",
      "Created On",
    ]; // Define your custom table headings
    const filteredData = quotes
      .filter((row) => selectedRows.includes(row.id))
      .map((row) => ({
        RefID: row.ref_id,
        AskForScopeID: row.id, // Example field
        ClientName: row.client_name,
        CRMName: row.fld_first_name + " " + row.fld_last_name,
        Currency: row.currency,
        Comments: row.comments,
        Service: row.service_name,
        QuoteStatus: row.status == 0 ? "Pending" : "Submitted",
        FeasibilityStatus: row.isfeasability == 1 ? row.feasability_status : "",
        CreatedOn: new Date(row.created_date * 1000).toLocaleString(), // Adjust field names based on your data
      }));

    // Add the headers as the first row
    const worksheetData = [headers, ...filteredData.map(Object.values)];

    // Create worksheet and workbook
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Quotes");

    // Export the file
    XLSX.writeFile(workbook, "Exported_Data.xlsx");
  };

  const toggleDetailsPage = () => {
    setIsDetailsOpen(!isDetailsOpen);
  };

  const toggleAllFeasPage = () => {
    setIsAllFeasOpen(!isAllFeasOpen);
  };
  const toggleTransferRequests = () => {
    setTransferPageVisible(!TransferPageVisible);
  };

  const handleViewButtonClick = (query) => {
    setSelectedQuery(query);
    setSelectedQuote(query.id);
    setIsDetailsOpen(true);
  };
  useEffect(() => {
    if (sharelinkrefid && sharelinkquoteid) {
      setSelectedQuery({ ref_id: sharelinkrefid });
      setSelectedQuote(sharelinkquoteid);
      setIsDetailsOpen(true);
    }
  }, [sharelinkrefid, sharelinkquoteid]);

  const fetchTags = async () => {
    try {
      const response = await fetch(
        "https://loopback-skci.onrender.com/api/scope/getTags",
      );
      const data = await response.json();
      if (data.status) setTags(data.data || []);
    } catch (error) {}
  };

  useEffect(() => {
    // Initialize select2 for Tags
    $(tagsRef.current)
      .select2({
        placeholder: "Select Tags",
        allowClear: true,
        multiple: true,
      })
      .on("change", (e) => {
        const selectedValues = $(e.target).val();
        setSelectedTags(selectedValues || []);
      });

    $(tagsRef.current).val(selectedTags).trigger("change");

    return () => {
      // Clean up select2 on component unmount
      if (tagsRef.current) {
        $(tagsRef.current).select2("destroy");
      }
    };
  }, [tags]);

  useEffect(() => {
    // Initialize select2 for Select Team
    $(selectUserRef.current)
      .select2({
        placeholder: "Select Users",
        multiple: true,
        allowClear: true,
      })
      .on("change", (e) => {
        setSelectedUser($(e.target).val());
      });

    return () => {
      // Destroy select2 when the component unmounts
      if (selectUserRef.current) {
        $(selectUserRef.current).select2("destroy");
      }
    };
  }, [users]);

  useEffect(() => {
    $(selectServiceRef.current)
      .select2({
        multiple: true,
        placeholder: "Select Service",
        allowClear: true,
      })
      .on("change", (e) => {
        const rawValues = $(e.target).val() || [];

        const sanitized = rawValues.filter((v) => v && v.trim() != "");

        setSelectedService((prev) => {
          const merged = [...new Set([...prev, ...sanitized])]; // unique values only
          return merged;
        });
      });

    return () => {
      if (selectServiceRef.current) {
        $(selectServiceRef.current).select2("destroy");
      }
    };
  }, [services]);

  useEffect(() => {
    const $select = $(selectSubjectRef.current);

    $select.select2({
      placeholder: "Select SubjectArea",
      allowClear: true,
      multiple: true,
      width: "100%",
    });

    $select.on("change", () => {
      const values = $select.val() || [];
      const sanitized = values.filter((v) => v && v.trim() != "");
      setSelectedSubjectArea(sanitized); // ✅ sets array
    });

    return () => {
      $select.off("change");
      $select.select2("destroy");
    };
  }, []);

  useEffect(() => {
    const $select = $(selectStatusRef.current);

    $select.select2({
      placeholder: "Select Quote Status",
      allowClear: true,
      multiple: true,
      width: "100%",
    });

    $select.on("change", () => {
      const values = $select.val() || [];
      const sanitized = values.filter((v) => v && v.trim() != "");
      setStatus(sanitized); // ✅ sets array
    });

    return () => {
      $select.off("change");
      $select.select2("destroy");
    };
  }, []);

  // Fetch all data on initial render
  useEffect(() => {
    //fetchQuotes(false);
    fetchServices();
    fetchTags();
    fetchFeasibilityRequestCount();
    fetchTransferReqCount();
  }, []);

  const fetchQuotes = async (nopayload = false) => {
    setLoading(true);

    const userid = selectedUser;
    const ref_id = refID;
    const scope_id = scopeId;
    const search_keywords = keyword;
    const service_name = selectedService;
    const subject_area = selectedSubjectArea;
    const feasability_status = feasStatus;
    const start_date = startDate;
    const end_date = endDate;
    const callrecordingpending = callOption;
    const quote_issue = quoteIssue;

    let payload = {
      userid,
      ref_id,
      scope_id,
      subject_area,
      search_keywords,
      status,
      service_name,
      ptp,
      tags: selectedTags,
      feasability_status,
      start_date,
      end_date,
      callrecordingpending,
      quote_issue,
      alreadyGiven,
    };

    if (nopayload) {
      payload = {};
    }

    try {
      const response = await fetch(
        "https://loopback-skci.onrender.com/api/scope/listAskForScope",
        {
          method: "POST", // Use POST method
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      const data = await response.json();
      if (data.status) {
        if (
          quotes.length != 0 &&
          JSON.stringify(data.allQuoteData) !== JSON.stringify(quotes)
        ) {
          setQuotes(data.allQuoteData);

          const userPending = data.allQuoteData.filter(
            (quote) => quote.submittedtoadmin === "false",
          );
          const adminPending = data.allQuoteData.filter(
            (quote) => quote.submittedtoadmin === "true" && quote.status == 0,
          );

          setUserPendingQuotes(userPending);

          setAdminPendingQuotes(adminPending);
          setFilterSummary("");
          let summary = "Showing results for : ";
          const appliedFilters = [];

          if (refID) appliedFilters.push(`Ref ID: ${refID}`);
          if (scope_id) appliedFilters.push(`Scope ID: ${scope_id}`);
          if (ptp && ptp == "Yes") appliedFilters.push(`PTP: YES`);
          if (callOption && callOption == "1")
            appliedFilters.push(`Call Recording Pending`);
          if (quoteIssue && quoteIssue == "1")
            appliedFilters.push(`Quote Issue`);
          if (alreadyGiven && alreadyGiven == "1")
            appliedFilters.push(`Quote on other website`);
          if (userid && userid.length > 0) {
            const userNames = userid
              .map((id) => {
                const user = users.find(
                  (u) => u.id.toString() === id.toString(),
                );
                return user
                  ? user.fld_first_name + " " + user.fld_last_name
                  : "N/A";
              })
              .join(", ");
            appliedFilters.push(`Users: ${userNames}`);
          }

          if (service_name && service_name.length > 0) {
            const serviceNames = service_name
              .map((id) => {
                const service = services.find(
                  (s) => s.id.toString() === id.toString(),
                );
                return service ? service.name : "N/A";
              })
              .join(", ");
            appliedFilters.push(`Services: ${serviceNames}`);
          }

          if (selectedTags && selectedTags.length > 0) {
            const tagNames = selectedTags
              .map((id) => {
                const tag = tags.find((t) => t.id.toString() == id.toString());
                return tag ? tag.tag_name : "N/A";
              })
              .join(", ");
            appliedFilters.push(`Tags: ${tagNames}`);
          }
          if (subject_area && subject_area.length > 0)
            appliedFilters.push(`Subject: ${subject_area}`);
          if (status && status.length > 0) {
            const statusLabels = {
              PendingAtUser: "Pending at User",
              PendingAtAdmin: "Pending at Admin",
              1: "Submitted",
              2: "Discount Requested",
              3: "Discount Submitted",
            };

            const displayStatuses = status.map(
              (s) => statusLabels[s] ?? "Pending",
            );
            appliedFilters.push(`Status: ${displayStatuses.join(", ")}`);
          }

          if (feasability_status)
            appliedFilters.push(`Feasibility: ${feasability_status}`);
          if (start_date && end_date)
            appliedFilters.push(
              `Date: ${start_date.toLocaleDateString()} - ${end_date.toLocaleDateString()}`,
            );

          setFilterSummary(
            appliedFilters.length > 0
              ? summary + appliedFilters.join(", ")
              : "Showing all results",
          );
        } else if (quotes.length == 0) {
          setQuotes(data.allQuoteData);
          const userPending = data.allQuoteData.filter(
            (quote) => quote.submittedtoadmin === "false",
          );
          const adminPending = data.allQuoteData.filter(
            (quote) => quote.submittedtoadmin === "true" && quote.status == 0,
          );

          setUserPendingQuotes(userPending);

          setAdminPendingQuotes(adminPending);
        }
        resetFiltersWithoutApiCall();
        fetchStats(false);
      } else {
        console.error("Failed to fetch quotes:", data.message);
        toast.error(data.message || "Failed to fetch quotes");
      }
    } catch (error) {
      console.error("Error fetching quotes:", error);
    } finally {
      setLoading(false);
    }
  };
  const fetchQuotesTwo = async (nopayload = false) => {
    const userid = selectedUser;
    const ref_id = refID;
    const search_keywords = keyword;
    const service_name = selectedService;
    const tags = selectedTags;
    const feasability_status = feasStatus;
    const start_date = startDate;
    const end_date = endDate;

    let payload = {
      userid,
      ref_id,
      search_keywords,
      status,
      service_name,
      ptp,
      tags,
      feasability_status,
      start_date,
      end_date,
    };

    if (nopayload) {
      payload = {};
    }

    try {
      const response = await fetch(
        "https://loopback-skci.onrender.com/api/scope/listAskForScope",
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
        if (
          quotes.length != 0 &&
          JSON.stringify(data.allQuoteData) !== JSON.stringify(quotes)
        ) {
          setQuotes(data.allQuoteData);

          const userPending = data.allQuoteData.filter(
            (quote) => quote.submittedtoadmin === "false",
          );
          const adminPending = data.allQuoteData.filter(
            (quote) => quote.submittedtoadmin === "true" && quote.status == 0,
          );

          setUserPendingQuotes(userPending);

          setAdminPendingQuotes(adminPending);
        } else if (quotes.length == 0) {
          setQuotes(data.allQuoteData);
          const userPending = data.allQuoteData.filter(
            (quote) => quote.submittedtoadmin === "false",
          );
          const adminPending = data.allQuoteData.filter(
            (quote) => quote.submittedtoadmin === "true" && quote.status == 0,
          );

          setUserPendingQuotes(userPending);

          setAdminPendingQuotes(adminPending);
        }
        setPendingFeasRequestCount(data.pendingFeasRequestCount);
      } else {
        console.error("Failed to fetch quotes:", data.message);
      }
    } catch (error) {
      console.error("Error fetching quotes:", error);
    }
  };

  const fetchTransferReqCount = async () => {
    try {
      const response = await fetch(
        "https://loopback-skci.onrender.com/api/scope/getalltransferrequests",
        {
          method: "POST", // Use POST method
          headers: {
            "Content-Type": "application/json", // Set content type to JSON
          },
          body: JSON.stringify({
            user_id: loopUserObject.id,
          }), // Pass the POST data as JSON
        },
      );

      const data = await response.json(); // Parse the response as JSON
      if (data.status) {
        setPendingTransRequestCount(data.data ? data.data.length : 0);
      } else {
        console.error("Failed to fetch following task count:", data.message);
      }
    } catch (error) {
      console.error("Error fetching following task count:", error);
    }
  };

  const fetchFeasibilityRequestCount = async () => {
    try {
      const response = await fetch(
        "https://loopback-skci.onrender.com/api/scope/getFeasibilityRequestCount",
        {
          method: "POST", // Use POST method
          headers: {
            "Content-Type": "application/json", // Set content type to JSON
          },
          body: JSON.stringify({
            user_id: loopUserObject.id,
          }), // Pass the POST data as JSON
        },
      );

      const data = await response.json(); // Parse the response as JSON
      if (data.status) {
        setPendingFeasRequestCount(
          data.feasibility_count ? data.feasibility_count : 0,
        );
      } else {
        console.error(
          "Failed to fetch feasibility request task count:",
          data.message,
        );
      }
    } catch (error) {
      console.error("Error fetching feasibility request task count:", error);
    }
  };

  useEffect(() => {
    fetchQuotes();

    socket.on("updateTable", (data) => {
      // console.log("Received updateTable event with data:", data);
      const formattedData = {
        ref_id: data.ref_id,
        id: data.id,
        service_name: data.service_name,
        currency: data.currency,
        other_currency: data.other_currency ?? null,
        user_name: `${data.fld_first_name} ${data.fld_last_name}`,
        tags: data.tag_names,
        status: data.status,
        fld_first_name: data.fld_first_name,
        created_date: data.created_date,
        feasibility_status: data.feasability_status,
        comments: data.comments,
      };

      setQuotes((prevQuotes) => [...prevQuotes, formattedData]);
      if (data.submittedtoadmin == "true") {
        setAdminPendingQuotes((prevQuotes) => [...prevQuotes, formattedData]);
      } else if (data.submittedtoadmin == "true") {
        setUserPendingQuotes((prevQuotes) => [...prevQuotes, formattedData]);
      }
      if (data.isfeasability == 0) {
        toast(
          data.fld_first_name +
            " Submitted a request Quote " +
            data.id +
            " for refId " +
            data.ref_id,
          {
            icon: "💡",
          },
        );
      } else if (data.isfeasability == 1) {
        toast(
          data.fld_first_name +
            " Created Feasibility request Quote " +
            data.id +
            " for refId " +
            data.ref_id,
          {
            icon: "❓❗",
          },
        );
      }
    });

    return () => {
      socket.off("updateTable");
    };
  }, []);
  useEffect(() => {
    socket.on("chatresponse", (data) => {
      if (data.user_id != loopUserObject.id) {
        toast(data.user_name + " Sent a chat for Quote " + data.quote_id, {
          icon: "💬",
        });
      }
    });

    return () => {
      socket.off("chatresponse"); // Clean up on component unmount
    };
  }, []);

  useEffect(() => {
    socket.on("updateQuery", (data) => {
      toast(
        data.user_name +
          " Submitted a request Quote " +
          data.quote_id +
          " for refId " +
          data.ref_id,
        {
          icon: "💡",
        },
      );
      setQuotes((prev) => {
        return prev.map((quote) =>
          quote.id == data.quote_id
            ? { ...quote, submittedtoadmin: "true" }
            : quote,
        );
      });
      setAdminPendingQuotes((prev) => {
        return prev.map((quote) =>
          quote.id == data.quote_id
            ? { ...quote, submittedtoadmin: "true" }
            : quote,
        );
      });
      setUserPendingQuotes((prev) =>
        prev.filter((quote) => quote.id != data.quote_id),
      );
    });

    return () => {
      socket.off("updateQuery"); // Clean up on component unmount
    };
  }, []);

  useEffect(() => {
    socket.on("quoteReceived", (data) => {
      setQuotes((prev) => {
        return prev.map((quote) =>
          quote.id == data.quote_id ? { ...quote, status: 1 } : quote,
        );
      });
      setAdminPendingQuotes((prev) => {
        return prev.map((quote) =>
          quote.id == data.quote_id ? { ...quote, status: 1 } : quote,
        );
      });
    });

    return () => {
      socket.off("quoteReceived"); // Clean up on component unmount
    };
  }, []);

  useEffect(() => {
    socket.on("discountReceived", (data) => {
      toast(data.user_name + " Requested discount for Quote " + data.quote_id, {
        icon: "💯",
      });
      setQuotes((prev) =>
        prev.map((quote) =>
          quote.id == data.quote_id ? { ...quote, status: 2 } : quote,
        ),
      );
    });

    return () => {
      socket.off("discountReceived"); // Clean up on component unmount
    };
  }, []);

  const fetchServices = async () => {
    try {
      const response = await fetch(
        "https://loopback-skci.onrender.com/api/scope/getAllServices",
        {
          method: "POST", // Use POST method
          headers: {
            "Content-Type": "application/json", // Set content type to JSON
          },
          body: JSON.stringify(), // Pass the POST data as JSON
        },
      );

      const data = await response.json(); // Parse the response as JSON
      if (data.status) {
        setServices(data.data);
      } else {
        console.error("Failed to fetch Services:", data.message);
      }
    } catch (error) {
      console.error("Error fetching Services:", error);
    }
  };

  const columns = [
    {
      title: `
                <input 
                    type="checkbox" 
                    class="select-all-checkbox" 
                />
            `,
      data: null,
      orderable: false,
      render: () => `
                <input 
                    type="checkbox" 
                    class="row-checkbox" 
                />
            `,
    },
    {
      title: "Ref Id",
      data: "ref_id",
      width: "110px",
      orderable: false,
      render: function (data, type, row) {
        let html = `${data}`;

        if (row.ptp === "Yes") {
          html += `
                        <span 
                            style="
                                padding: 2px 4px; 
                                background-color: #2B9758FF; 
                                color: #ffffff; 
                                font-size: 11px; 
                                font-weight: bold; 
                                line-height: 1.2;
                                z-index: 1 !important;
                            ">
                            PTP
                        </span>
                    `;
        }
        if (row.already_given == "1") {
          html += `
                        <span 
                        data-tooltip-id="my-tooltip"
                        data-tooltip-content="Quote on Other Website"
                            style="
                                padding: 2px 4px; 
                                color: #2B9758FF;
                                font-size: 11px; 
                                font-weight: bold; 
                                line-height: 1.2;
                                z-index: 1 !important;
                            ">
                            <i class="fa fa-check-circle text-green-600" aria-hidden="true"></i>
                        </span>
                    `;
        }
        if (row.callrecordingpending == 1) {
          html += `
                        <span 
                            style="
                                padding: 2px 4px;
                                color: #E69500FF; 
                                font-size: 11px; 
                                font-weight: bold; 
                                line-height: 1.2;
                                z-index: 1 !important;
                            ">
                            <i class="fa fa-headphones" aria-hidden="true"></i>
                        </span>
                    `;
        }

        if (row.quote_issue == 1) {
          html += `
                        <span 
                            style="
                                padding: 2px 4px;
                                color: #E60000FF; 
                                font-size: 11px; 
                                font-weight: bold; 
                                line-height: 1.2;
                                z-index: 1 !important;
                                data-tooltip-id='my-tooltip'
                                data-tooltip-content='Quote Issue'>
                            <i class="fa fa-exclamation-triangle" aria-hidden="true"></i>
                        </span>
                    `;
        }

        if (row.edited == 1) {
          html += `
                        <span 
                            style="
                                padding: 1px 6px; 
                                background-color: #D1D5DB; 
                                color: #4B5563; 
                                font-size: 11px; 
                                border-radius: 9999px; 
                                margin-left: 8px;
                            ">
                            Edited
                        </span>
                    `;
        }

        return html; // Return the complete HTML with conditions applied
      },
    },
    {
      title: "Ask For Scope ID",
      data: "id",
      width: "20x",
      orderable: false,
      className: "text-center",
    },
    {
      title: "Client Name",
      data: "client_name",
      orderable: false,
      className: "text-center",
      render: function (data, type, row) {
        return data ? data : "null"; // Check if data exists; if not, return 'null'
      },
    },
    {
      title: "CRM Name",
      data: "fld_first_name",
      orderable: false,
      render: (data, type, row) => {
        let name =
          row.fld_first_name +
          " " +
          (row.fld_last_name != null ? row.fld_last_name : "");

        // Check if the user is deleted
        if (row.isdeleted == 1) {
          return `<div style="text-align: left; color: red; text-decoration: line-through;" title="This user was deleted">
                                ${row.deleted_user_name}
                            </div>`;
        }

        // If the user is not deleted, just return the normal name
        return `<div style="text-align: left;">${name}</div>`;
      },
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
    // {
    //     title: 'Comments',
    //     data: 'comments',
    //     orderable: false,
    //     render: (data) => {
    //         // Check if the data is not empty and its length is greater than 50 characters
    //         const truncatedData = (data && data.length > 40) ? data.substring(0, 40) + '...' : (data || 'N/A');
    //         return `<div style="text-align: left;">${truncatedData}</div>`;
    //     },
    // },
    {
      title: "Service",
      data: "service_name", // actually holds comma-separated service IDs
      orderable: false,
      render: function (data, type, row, meta) {
        if (!data) return '<div style="text-align: left;">N/A</div>';

        const serviceIds = data.split(",").map((id) => id.trim());

        const serviceNames = serviceIds.map((id) => {
          const service = services.find((s) => String(s.id) === id);
          return service ? service.name : `Service #${id}`;
        });

        return `<div style="text-align: left;">${serviceNames.join(", ")}</div>`;
      },
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
        } else if (row.ops_approved == "0") {
          return '<span class="text-red-600 font-bold">Ops Approval Pending</span>';
        } else {
          if (data == 0) {
            return '<span class="text-red-600 font-bold">Pending at Admin</span>';
          } else if (data == 1 && row["discount_submitted"] == 1) {
            return '<span class="text-green-600 font-bold">Discount Submitted</span>';
          } else if (data == 1 && row["discount_submitted"] == 0) {
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
    // {
    //     title: 'Instacrm Status',
    //     data: null,
    //     orderable: false,
    //     render: function (data, type, row) {
    //         const match = fileContent.find(
    //             (item) => String(item.refNo) === String(row.ref_id)
    //         );

    //         if (match) {
    //             const status = match.status;
    //             if (status === 'Quoted') {
    //                 return '<span class="text-blue-600 font-bold">Quoted</span>';
    //             } else if (status === 'Converted') {
    //                 return '<span class="text-green-600 font-bold">Converted</span>';
    //             } else {
    //                 return `<span class="text-gray-600">${status}</span>`;
    //             }
    //         }

    //         return '<span class="text-gray-400 italic">Not Found</span>';
    //     }
    // },
    {
      title: "Tags",
      data: "tag_names",
      orderable: false,
      width: "130px",
      className: "text-sm",
      render: function (data, type, row, meta) {
        if (!data) return "";

        // Access the 'tags' array in your component scope
        const tagIds = data.split(",").map((id) => id.trim());

        const tagElements = tagIds.map((id) => {
          const tagObj = tags.find((t) => String(t.id) === id); // Match by string
          const tagName = tagObj ? tagObj.tag_name : `#${id}`; // Fallback to id
          return `<span class="text-blue-500 inline-block" style="font-size:10px">#${tagName}</span>`;
        });

        return tagElements.join("");
      },
    },

    {
      title: "Created Date",
      data: "created_date",
      orderable: true,
      render: (data, type, row) => {
        if (data) {
          const date = new Date(data * 1000);
          const day = date.getDate().toString().padStart(2, "0"); // Ensures two-digit day
          const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Ensures two-digit month
          const year = date.getFullYear().toString(); // Gets year
          const hours = date.getHours().toString().padStart(2, "0"); // Ensures two-digit hours
          const minutes = date.getMinutes().toString().padStart(2, "0"); // Ensures two-digit minutes
          const seconds = date.getSeconds().toString().padStart(2, "0"); // Ensures two-digit seconds

          // Return the formatted date for display
          return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
        }
        return "N/A";
      },
      // Sort based on the UNIX timestamp for correct ordering
      createdCell: (cell, cellData, rowData, row, col, table) => {
        // This is just in case you want to keep the original timestamp for sorting purposes
        $(cell).attr("data-sort", cellData);
      },
    },

    {
      title: "Actions",
      data: null,
      orderable: false,
      render: (data, type, row) => {
        const isDisabled = row?.ops_approved == "0";

        return `
      <button
        class="${isDisabled ? "vd mx-1 p-1 text-white" : "view-btn vd mx-1 p-1 text-white"}"
        style="font-size:10px;border-radius:3px;white-space:nowrap;"
        data-id="${row.ref_id}"
        ${isDisabled ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ""}
      >
        View Details
      </button>
    `;
      },
    },
  ];

  const resetFilters = async () => {
    // Reset filter states
    setRefId("");
    setScopeId("");
    setKeyword("");
    setCallOption("");
    setQuoteIssue("");
    setAlreadyGiven("");
    setPtp("");
    setStatus([]);
    setFeasStatus("");
    setStartDate("");
    setEndDate("");
    setSelectedUser([]); // Reset selected user
    setSelectedService([]); // Reset selected service
    setSelectedSubjectArea("");
    setSelectedTags([]); // Reset selected tags

    // Reset the select elements and trigger change
    $(selectUserRef.current).val(null).trigger("change");
    $(selectServiceRef.current).val(null).trigger("change");
    $(selectSubjectRef.current).val(null).trigger("change");
    $(selectStatusRef.current).val(null).trigger("change");
    $(tagsRef.current).val([]).trigger("change");
    setFilterSummary("");

    try {
      // Fetch quotes after resetting the filters
      await fetchQuotes(true);
    } catch (error) {
      console.error("Error fetching quotes after resetting filters:", error);
    }
  };

  const resetFiltersWithoutApiCall = async () => {
    // Reset filter states
    setRefId("");
    setScopeId("");
    setCallOption("");
    setQuoteIssue("");
    setAlreadyGiven("");
    setPtp("");
    setKeyword("");
    setStatus([]);
    setFeasStatus("");
    setStartDate("");
    setEndDate("");
    setSelectedUser([]); // Reset selected user
    setSelectedService([]); // Reset selected service
    setSelectedSubjectArea("");
    setSelectedTags([]); // Reset selected tags

    // Reset the select elements and trigger change
    $(selectUserRef.current).val(null).trigger("change");
    $(selectServiceRef.current).val(null).trigger("change");
    $(selectSubjectRef.current).val(null).trigger("change");
    $(selectStatusRef.current).val(null).trigger("change");
    $(tagsRef.current).val([]).trigger("change");
  };

  const [usersRequestDivOpen, setUsersRequestDivOpen] = useState(false);

  return (
    <div className="container bg-gray-100 w-full">
      <div className="flex items-center bg-gray-100 justify-between mb-3">
        <div className="p-2 flex items-center justify-between bg-white ">
          <div className="flex items-center justify-end space-x-1">
            <FileSpreadsheet size={18} className="text-green-600" />
            {uploadedFileInfo ? (
              <span
                className="text-gray-800 font-medium f-14"
                data-tooltip-id="my-tooltip"
                data-tooltip-content={uploadedFileInfo}
              >
                {getTrimmedFilename(uploadedFileInfo)}
              </span>
            ) : (
              <span className="text-gray-500 italic f-14">
                No file uploaded
              </span>
            )}
            <button
              className="btn btn-warning btn-sm ml-2"
              data-tooltip-id="my-tooltip"
              data-tooltip-content="Edit"
              onClick={() => setShowUpload(true)}
            >
              <Pencil size={11} />
            </button>
          </div>

          {showUpload && (
            <div className=" ">
              <div className="flex justify-end items-center gap-2">
                <h2 className="text-md font-semibold text-gray-800 f-14">
                  Upload XLSX File
                </h2>
                <label className="relative cursor-pointer bg-gray-100 hover:bg-gray-200 rounded-md px-3 py-1 text-sm text-gray-700 shadow-inner transition mb-0">
                  Choose File
                  <input
                    type="file"
                    accept=".xlsx"
                    onChange={handleFileChange}
                    className="absolute left-0 top-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </label>

                <button
                  onClick={handleUpload}
                  data-tooltip-id="my-tooltip"
                  data-tooltip-content="Upload"
                  className="btn btn-success btn-sm"
                >
                  <Check size={13} />
                </button>
                <button
                  data-tooltip-id="my-tooltip"
                  data-tooltip-place="top"
                  data-tooltip-content="Cancel & Close"
                  className="btn btn-danger btn-sm"
                  onClick={() => setShowUpload(false)}
                >
                  <XCircle size={13} />
                </button>
              </div>
              {file && (
                <p className="mt-2 text-sm text-gray-600 truncate">
                  Selected: <span className="font-medium">{file.name}</span>
                </p>
              )}
            </div>
          )}
        </div>
        <div className="bg-white f-12 p-2">
          {stats ? (
            <div className="gap-1 text-gray-900 flex">
              {/* TODAY */}
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <p
                    className="flex items-center bg-gray-100 p-1 cursor-pointer"
                    onClick={() => {
                      setSelectedTabForStats("submitted_today");
                      setStatsModalOpen(true);
                    }}
                    data-tooltip-id="my-tooltip"
                    data-tooltip-content="Quote Submitted Today"
                  >
                    <CheckCircle size={15} className="text-green-700 mr-2" />{" "}
                    <span className="font-semibold"> Today:</span>
                    <span className="ml-2">{stats.today?.submitted ?? 0}</span>
                  </p>
                </div>
              </div>

              {/* YESTERDAY */}
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <p
                    className="flex items-center bg-gray-100 p-1 cursor-pointer"
                    onClick={() => {
                      setSelectedTabForStats("submitted_yesterday");
                      setStatsModalOpen(true);
                    }}
                    data-tooltip-id="my-tooltip"
                    data-tooltip-content="Quote Submitted Yesterday"
                  >
                    <CheckCircle size={15} className="text-green-700 mr-2" />{" "}
                    <span className="font-semibold"> Yesterday:</span>
                    <span className="ml-2">
                      {stats.yesterday?.submitted ?? 0}
                    </span>
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between">
                {/* <p className="f-11 text-gray-500 flex items-center">
                                    <Clock size={15} className="text-red-600 mr-1" /> Last Updated: {lastUpdated}
                                </p> */}
                <button
                  onClick={() => {
                    fetchStats(true);
                  }}
                  className="px-2 py-1 text-blue-600 rounded-lg"
                >
                  <RefreshCcw
                    size={15}
                    className={`${statsLoading ? "animate-spin" : ""}`}
                  />
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">Loading...</p>
          )}
        </div>
      </div>

      {/* Filter Section */}
      <div className=" mb-3 bg-white px-3 py-3 rounded ">
        <div className="flex justify-between mb-1">
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold">All Quote List</h1>
            <button
              onClick={() => setShowFilterDiv(!showFilterDiv)}
              className="btn btn-primary btn-sm"
            >
              <FilterIcon size={15} />
            </button>
          </div>
          <div className="flex">
            {(loopUserObject.id == "206" || loopUserObject.scopeadmin == 1) && (
              <button
                className="bg-gray-200 flex items-center relative mr-3 p-1 rounded"
                onClick={() => {
                  navigate("/assignquery");
                }}
              >
                <MoveLeft size={20} className="mr-2" />
                Queries
              </button>
            )}
            {(loopUserObject.id == "206" || loopUserObject.id == 1) && (
              <button
                className="bg-gray-200 flex items-center relative mr-3 p-1 rounded elevenpx"
                onClick={() => {
                  setUsersRequestDivOpen(true);
                }}
              >
                <Users size={18} className="mr-2" />
                Users Request Count
              </button>
            )}
            <button
              onClick={handleExport}
              className="bg-blue-400 text-white text-sm mr-2  px-2 py-1 rounded hover:bg-blue-500"
            >
              Export as XLS
            </button>

            <button
              className="bg-gray-200 text-gray-500 hover:bg-gray-300  f-12 btn px-2 py-1 flex items-center relative"
              onClick={toggleAllFeasPage}
            >
              <FileQuestion size={15} className="mr-1" />
              Feasibility Request
              <span
                style={{ top: "-15px", right: "-10px" }}
                className="absolute inline-flex items-center justify-center px-2 py-1 text-xs font-semibold text-white bg-red-600 rounded-full"
              >
                {pendingFeasRequestCount}
              </span>
            </button>
            <button
              className="ml-2 bg-gray-200 text-gray-500 hover:bg-gray-300  f-12 btn px-2 py-1 flex items-center relative"
              onClick={toggleTransferRequests}
            >
              <ArrowLeftRight size={15} className="mr-1" />
              Transfer Requests
              <span
                style={{ top: "-15px", right: "-10px" }}
                className="absolute inline-flex items-center justify-center px-2 py-1 text-xs font-semibold text-white bg-red-600 rounded-full"
              >
                {pendingTransRequestCount}
              </span>
            </button>
          </div>
        </div>
        <div
          className={`${showFilterDiv ? "hidden" : "flex"} flex-col items-end space-x-2 border py-3 mt-3 px-3 bg-light`}
        >
          <div className="row">
            <div className="col-2 mb-3">
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Ref ID"
                value={refID}
                onChange={(e) => setRefId(e.target.value)}
              />
            </div>
            <div className="col-2 mb-3">
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Scope ID"
                value={scopeId}
                onChange={(e) => setScopeId(e.target.value)}
              />
            </div>
            <div className="col-2 mb-3">
              <select
                id="user_id"
                className=" px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 form-control form-control-sm slt-x-isu "
                multiple
                value={selectedUser}
                ref={selectUserRef}
              >
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.fld_first_name + " " + user.fld_last_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-2 mb-3">
              <select
                id="service_name"
                className=" px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 form-control form-control-sm"
                multiple
                value={selectedService}
                ref={selectServiceRef}
              >
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-2 mb-3">
              <select
                id="subject_area"
                className="form-control form-control-sm"
                multiple
                value={selectedSubjectArea}
                ref={selectSubjectRef}
                //onChange={(e) => setSelectedSubjectArea(e.target.value)}
              >
                <option value="Accounting">Accounting</option>
                <option value="Accounts Law">Accounts Law</option>
                <option value="Agency Law">Agency Law</option>
                <option value="Alternative Dispute Resolution (ADR)/Mediation">
                  Alternative Dispute Resolution (ADR)/Mediation
                </option>
                <option value="Anthropology">Anthropology</option>
                <option value="Archaeology">Archaeology</option>
                <option value="Architecture">Architecture</option>
                <option value="Art">Art</option>
                <option value="Biology">Biology</option>
                <option value="Business">Business</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Children &amp; Young People">
                  Children &amp; Young People
                </option>
                <option value="Civil Litigation Law">
                  Civil Litigation Law
                </option>
                <option value="Commercial Law">Commercial Law</option>
                <option value="Commercial Property Law">
                  Commercial Property Law
                </option>
                <option value="Communications">Communications</option>
                <option value="Company/business/partnership Law">
                  Company/business/partnership Law
                </option>
                <option value="Comparative Law">Comparative Law</option>
                <option value="Competition Law">Competition Law</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Constitutional/administrative Law">
                  Constitutional/administrative Law
                </option>
                <option value="Construction">Construction</option>
                <option value="Consumer Law">Consumer Law</option>
                <option value="Contract Law">Contract Law</option>
                <option value="Corporate Finance">Corporate Finance</option>
                <option value="Counselling">Counselling</option>
                <option value="Criminal Law">Criminal Law</option>
                <option value="Criminal Litigation">Criminal Litigation</option>
                <option value="Criminology">Criminology</option>
                <option value="Cultural Studies">Cultural Studies</option>
                <option value="Cybernetics">Cybernetics</option>
                <option value="Design">Design</option>
                <option value="Dental">Dental</option>
                <option value="Drama">Drama</option>
                <option value="Economics">Economics</option>
                <option value="EEconometrics">EEconometrics</option>
                <option value="Education">Education</option>
                <option value="Employment">Employment</option>
                <option value="Employment Law">Employment Law</option>
                <option value="Engineering">Engineering</option>
                <option value="English Language">English Language</option>
                <option value="English Literature">English Literature</option>
                <option value="Environment">Environment</option>
                <option value="Environment Law">Environment Law</option>
                <option value="Environmental Sciences">
                  Environmental Sciences
                </option>
                <option value="Equity Law">Equity Law</option>
                <option value="Estate Management">Estate Management</option>
                <option value="European Law">European Law</option>
                <option value="European Studies">European Studies</option>
                <option value="Eviews">Eviews</option>
                <option value="Family Law">Family Law</option>
                <option value="Fashion">Fashion</option>
                <option value="Film Studies">Film Studies</option>
                <option value="Finance">Finance</option>
                <option value="Finance Law">Finance Law</option>
                <option value="Food and Nutrition">Food and Nutrition</option>
                <option value="Forensic Science">Forensic Science</option>
                <option value="French">French</option>
                <option value="General Law">General Law</option>
                <option value="Geography">Geography</option>
                <option value="Geology">Geology</option>
                <option value="German">German</option>
                <option value="Health">Health</option>
                <option value="Health &amp; Social Care">
                  Health &amp; Social Care
                </option>
                <option value="Health and Safety">Health and Safety</option>
                <option value="Health and Safety Law">
                  Health and Safety Law
                </option>
                <option value="History">History</option>
                <option value="Holistic/alternative therapy">
                  Holistic/alternative therapy
                </option>
                <option value="Housing">Housing</option>
                <option value="Housing Law">Housing Law</option>
                <option value="Human Resource Management">
                  Human Resource Management
                </option>
                <option value="Human Rights">Human Rights</option>
                <option value="HR">HR</option>
                <option value="Immigration/refugee Law">
                  Immigration/refugee Law
                </option>
                <option value="Information - Media &amp; Technology Law">
                  Information - Media &amp; Technology Law
                </option>
                <option value="Information Systems">Information Systems</option>
                <option value="Information Technology">
                  Information Technology
                </option>
                <option value="IT">IT</option>
                <option value="Intellectual Property Law">
                  Intellectual Property Law
                </option>
                <option value="International Business">
                  International Business
                </option>
                <option value="International Commerical Law">
                  International Commerical Law
                </option>
                <option value="International Law">International Law</option>
                <option value="International political economy">
                  International political economy
                </option>
                <option value="International Relations">
                  International Relations
                </option>
                <option value="International Studies">
                  International Studies
                </option>
                <option value="Jurisprudence">Jurisprudence</option>
                <option value="Land/property Law">Land/property Law</option>
                <option value="Landlord &amp; Tenant Law">
                  Landlord &amp; Tenant Law
                </option>
                <option value="Law of Evidence">Law of Evidence</option>
                <option value="Life Sciences">Life Sciences</option>
                <option value="Linguistics">Linguistics</option>
                <option value="Logistics">Logistics</option>
                <option value="Management">Management</option>
                <option value="Maritime Law">Maritime Law</option>
                <option value="Marketing">Marketing</option>
                <option value="Maths">Maths</option>
                <option value="Media">Media</option>
                <option value="Medical Law">Medical Law</option>
                <option value="Medical Technology">Medical Technology</option>
                <option value="Medicine">Medicine</option>
                <option value="Mental Health">Mental Health</option>
                <option value="Mental Health Law">Mental Health Law</option>
                <option value="Methodology">Methodology</option>
                <option value="Music">Music</option>
                <option value="Negligence Law">Negligence Law</option>
                <option value="Nursing">Nursing</option>
                <option value="Occupational therapy">
                  Occupational therapy
                </option>
                <option value="Operations">Operations</option>
                <option value="Pharmacology">Pharmacology</option>
                <option value="Philosophy">Philosophy</option>
                <option value="Photography">Photography</option>
                <option value="Physical Education">Physical Education</option>
                <option value="Physics">Physics</option>
                <option value="Planning/environmental Law">
                  Planning/environmental Law
                </option>
                <option value="Politics">Politics</option>
                <option value="Project Management">Project Management</option>
                <option value="Professional Conduct Law">
                  Professional Conduct Law
                </option>
                <option value="Psychology">Psychology</option>
                <option value="Psychotherapy">Psychotherapy</option>
                <option value="Public Administration">
                  Public Administration
                </option>
                <option value="Public Health">Public Health</option>
                <option value="Public Law">Public Law</option>
                <option value="Quantity Surveying">Quantity Surveying</option>
                <option value="Real Estate">Real Estate</option>
                <option value="Restitution Law">Restitution Law</option>
                <option value="Shipping Law">Shipping Law</option>
                <option value="Sports">Sports</option>
                <option value="Social Policy">Social Policy</option>
                <option value="Social Work">Social Work</option>
                <option value="Social Work Law">Social Work Law</option>
                <option value="Sociology">Sociology</option>
                <option value="Spanish">Spanish</option>
                <option value="Sports Law">Sports Law</option>
                <option value="Sports Science">Sports Science</option>
                <option value="SPSS">SPSS</option>
                <option value="Statistics">Statistics</option>
                <option value="Succession Law">Succession Law</option>
                <option value="Supply">Supply Chain</option>
                <option value="Tax Law">Tax Law</option>
                <option value="Teacher Training">Teacher Training</option>
                <option value="Theatre Studies">Theatre Studies</option>
                <option value="Theology &amp; Religion">
                  Theology &amp; Religion
                </option>
                <option value="Tort Law">Tort Law</option>
                <option value="Tourism">Tourism</option>
                <option value="Town &amp; Country Planning">
                  Town &amp; Country Planning
                </option>
                <option value="Translation">Translation</option>
                <option value="Trusts Law">Trusts Law</option>
                <option value="Wills/probate Law">Wills/probate Law</option>
                <option value="Economics (Social Sciences)">
                  Economics (Social Sciences)
                </option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="col-2 mb-3">
              <select
                className="form-control form-control-sm"
                value={ptp}
                onChange={(e) => setPtp(e.target.value)}
              >
                <option value="">Select PTP</option>
                <option value="Yes">Yes</option>
              </select>
            </div>
            <div className="col-2 mb-3">
              <select
                className="form-control form-control-sm"
                value={status}
                ref={selectStatusRef}
                //onChange={(e) => setStatus(e.target.value)}
              >
                <option value="PendingAtUser">Pending at User</option>
                <option value="PendingAtAdmin">Pending at Admin</option>
                <option value="1">Submitted</option>
                <option value="2">Discount Requested</option>
                <option value="3">Discount Submitted</option>
              </select>
            </div>
            <div className="col-2 mb-3">
              <select
                className="form-control form-control-sm"
                value={feasStatus}
                onChange={(e) => setFeasStatus(e.target.value)}
              >
                <option value="">Feasibility Status</option>
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
            <div className="col-2">
              <DatePicker
                className="form-control form-control-sm"
                selected={startDate}
                onChange={(dates) => {
                  const [start, end] = dates;
                  setStartDate(start);
                  setEndDate(end);
                }}
                placeholderText="Select Date Range"
                dateFormat="yyyy/MM/dd"
                selectsRange
                startDate={startDate}
                endDate={endDate}
                maxDate={new Date()} // Optional: Restrict to past dates
              />
            </div>
            <div className="col-2">
              <select
                name="tags"
                id="tags"
                className="form-control form-control-sm select2-hidden-accessible slt-tag-inp"
                multiple
                value={selectedTags}
                ref={tagsRef}
              >
                <option value="">Select Tags</option>
                {tags.map((tag) => (
                  <option key={tag.id} value={tag.id}>
                    {tag.tag_name}
                  </option>
                ))}
              </select>
            </div>
            <div className=" mb-3" style={{ width: "140px" }}>
              <select
                className="form-control form-control-sm"
                value={callOption}
                onChange={(e) => setCallOption(e.target.value)}
              >
                <option value="">Call Recording</option>
                <option value="1">Pending</option>
              </select>
            </div>
            <div className=" mb-3" style={{ width: "140px" }}>
              <select
                className="form-control form-control-sm"
                value={quoteIssue}
                onChange={(e) => setQuoteIssue(e.target.value)}
              >
                <option value="">Quote Issue</option>
                <option value="1">Yes</option>
              </select>
            </div>
            <div className=" mb-3" style={{ width: "140px" }}>
              <select
                className="form-control form-control-sm"
                value={alreadyGiven}
                onChange={(e) => setAlreadyGiven(e.target.value)}
              >
                <option value="">Quote on Other Website</option>
                <option value="1">Yes</option>
              </select>
            </div>
          </div>

          <div className="w-full flex items-center justify-between">
            <button
              className=" text-blue-600 flex items-center  hover:underline  f-12 btn px-2 py-1 mr-2"
              onClick={resetFilters}
            >
              <RefreshCcw size={14} /> &nbsp; Reset Filters
            </button>
            <button
              className="gree text-white mr-1 flex items-center f-12 btn px-2 py-1"
              onClick={() => {
                fetchQuotes(false);
              }}
            >
              <Filter size={12} /> &nbsp; Apply
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <TableLoader />
      ) : (
        <div className="bg-white p-4 border-t-2 border-blue-400 rounded">
          {filterSummary && (
            <p className="text-gray-600 text-sm mb-3 font-semibold flex items-center">
              {filterSummary}
              {filterSummary != "Showing all results" && (
                <button
                  className=" bg-red-600 text-white flex items-center  f-12  ml-2"
                  onClick={resetFilters}
                >
                  <X size={14} />
                </button>
              )}
            </p>
          )}

          {/* Tab Buttons */}
          <div className="mb-4">
            <div className="flex space-x-4">
              <button
                onClick={() => handleTabClick("all")}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 ease-in-out ${
                  activeTab === "all"
                    ? "bg-blue-500 text-white border border-blue-600"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-blue-50"
                }`}
              >
                All Quotes
              </button>
              <button
                onClick={() => handleTabClick("pendingUser")}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 ease-in-out ${
                  activeTab === "pendingUser"
                    ? "bg-blue-500 text-white border border-blue-600"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-blue-50"
                }`}
              >
                Pending at User
              </button>
              <button
                onClick={() => handleTabClick("pendingAdmin")}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 ease-in-out ${
                  activeTab === "pendingAdmin"
                    ? "bg-blue-500 text-white border border-blue-600"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-blue-50"
                }`}
              >
                Pending at Admin
              </button>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === "all" && (
            <div className="table-scrollable">
              <DataTable
                data={quotes}
                columns={columns}
                options={{
                  pageLength: 50,
                  ordering: true,
                  order: [[11, "desc"]],

                  createdRow: (row, data) => {
                    // Attach event listener for the "View Details" button
                    $(row)
                      .find(".view-btn")
                      .on("click", () => handleViewButtonClick(data));

                    // Handle row-specific checkbox events
                    $(row)
                      .find(".row-checkbox")
                      .on("change", (e) => {
                        const isChecked = e.target.checked;
                        handleRowSelect(data.id, isChecked);
                      });
                  },
                  initComplete: () => {
                    // Attach event listener for "Select All" checkbox
                    $(".select-all-checkbox").on("change", (e) => {
                      const isChecked = e.target.checked;
                      handleSelectAll(isChecked);
                    });
                  },
                }}
              />
            </div>
          )}
          {activeTab === "pendingUser" && (
            <div className="table-scrollable">
              <DataTable
                data={userPendingQuotes}
                columns={columns}
                options={{
                  pageLength: 50,
                  ordering: true,
                  createdRow: (row, data) => {
                    $(row)
                      .find(".view-btn")
                      .on("click", () => handleViewButtonClick(data));
                  },
                }}
              />
            </div>
          )}
          {activeTab === "pendingAdmin" && (
            <div className="table-scrollable">
              <DataTable
                data={adminPendingQuotes}
                columns={columns}
                options={{
                  pageLength: 50,
                  ordering: true,
                  createdRow: (row, data) => {
                    $(row)
                      .find(".view-btn")
                      .on("click", () => handleViewButtonClick(data));
                  },
                }}
              />
            </div>
          )}
        </div>
      )}

      <AnimatePresence>
        {isDetailsOpen && (
          <QueryDetailsAdmin
            onClose={toggleDetailsPage}
            quotationId={selectedQuote}
            queryId={selectedQuery.ref_id}
            selectedQuery={selectedQuery}
            after={() => {
              fetchQuotes(false);
            }}
          />
        )}
        {isAllFeasOpen && (
          <FeasabilityPage
            onClose={toggleAllFeasPage}
            after={() => {
              fetchQuotes(false);
            }}
          />
        )}
        {TransferPageVisible && (
          <TransferRequestsPage
            onClose={() => {
              setTransferPageVisible(!TransferPageVisible);
            }}
          />
        )}
        {usersRequestDivOpen && (
          <UsersRequestCount
            users={users}
            onClose={() => {
              setUsersRequestDivOpen(!usersRequestDivOpen);
            }}
          />
        )}
        {statsModalOpen && (
          <StatsModal
            onClose={() => setStatsModalOpen(false)}
            dayData={
              selectedTabForStats.includes("today")
                ? stats.today
                : stats.yesterday
            }
            activeTab={
              selectedTabForStats.includes("submitted")
                ? "submitted"
                : "discount"
            }
          />
        )}
      </AnimatePresence>
      <Tooltip id="my-tooltip" />
    </div>
  );
};

export default ManageQuery;
