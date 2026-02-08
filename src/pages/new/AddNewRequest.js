import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import Select from "react-select";
import { CheckCircle2, X, GripVertical, MessageSquare } from "lucide-react";
import { getSocket } from "../Socket";
import "react-quill/dist/quill.snow.css";
import ReactQuill from "react-quill";

const AddNewRequest = ({
  onClose,
  refId,
  after,
  userIdDefined,
  clientName,
  parentQuote,
  cloneData,
}) => {
  const [quoteHeading, setQuoteHeading] = useState("");
  const [services, setServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [suggestedTags, setSuggestedTags] = useState([]);
  const [servicePlanLock, setServicePlanLock] = useState(null);

  const [selectedTags, setSelectedTags] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [users, setUsers] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedPlans, setSelectedPlans] = useState([]);
  const [recommendedPlan, setRecommendedPlan] = useState("");
  const [selectedSubjectArea, setSelectedSubjectArea] = useState("");
  const [otherSubjectArea, setOtherSubjectArea] = useState("");
  const [client_academic_level, setClient_academic_level] = useState("");
  const [results_section, setResults_section] = useState("");
  const [timeline, setTimeline] = useState("normal");
  const [timelineDays, setTimelineDays] = useState("");
  const [linkedQuotePresent, setLinkedQuotePresent] = useState(false);
  const [linkedQuoteId, setLinkedQuoteId] = useState("");
  const [isfeasability, setIsFeasability] = useState(0);
  const [selectedUser, setSelectedUser] = useState("");
  const [expiryDate, setExpiryDate] = useState(
    new Date().toISOString().split("T")[0],
  ); // Default to current date
  const [files, setFiles] = useState([{ id: Date.now(), file: null }]);

  const [demoStatus, setDemoStatus] = useState(false);
  const [demodone, setDemodone] = useState("no");
  const [demoId, setDemoId] = useState("");
  const [demoDuration, setDemoDuration] = useState("");
  const [demoDate, setDemoDate] = useState("");

  const [internalCommentsOpen, setInternalCommentsOpen] = useState(false);
  const [internalComments, setInternalComments] = useState("");

  const [submitting, setSubmitting] = useState(false);

  const socket = getSocket();

  const bRemarks = `1. All our work will be done through an online platform "Rapid Collaborate" that ensures easy collaboration between the Consultant and the scholar. Through the platform, you can access the timeline, ask queries, request further revisions, etc.
2. The provided quote pertains to the Rapid Collaborate Basic Plan.
3. As per the Rapid Collaborate subscription plan; following the completion of the work, the revision policy permits up to one revision per milestone at no extra cost.

This quote and service scope shall serve as the definitive and conclusive list of deliverables from our end. Any prior communications, whether via email, WhatsApp, phone call, Zoom, or any other medium, as well as any previously sent or discussed service scopes, are hereby rendered null and void.`;

  const sRemarks = `1. All our work will be done through an online platform "Rapid Collaborate" that ensures easy collaboration between the Consultant and the scholar. Through the platform, you can access the timeline, ask queries, request further revisions, etc.
2. The provided quote pertains to the Rapid Collaborate Standard Plan.
3. As per the Rapid Collaborate subscription plan; following the completion of the work, the revision policy permits up to three revisions per milestone at no extra cost.

This quote and service scope shall serve as the definitive and conclusive list of deliverables from our end. Any prior communications, whether via email, WhatsApp, phone call, Zoom, or any other medium, as well as any previously sent or discussed service scopes, are hereby rendered null and void.`;

  const aRemarks = `1. All our work will be done through an online platform "Rapid Collaborate" that ensures easy collaboration between the Consultant and the scholar. Through the platform, you can access the timeline, ask queries, request further revisions, etc.
2. The provided quote pertains to the Rapid Collaborate Advanced Plan.
3. As per the Rapid Collaborate subscription plan; following the completion of the work, the revision policy permits up to five revisions per milestone at no extra cost.

This quote and service scope shall serve as the definitive and conclusive list of deliverables from our end. Any prior communications, whether via email, WhatsApp, phone call, Zoom, or any other medium, as well as any previously sent or discussed service scopes, are hereby rendered null and void.`;

  const [planDetails, setPlanDetails] = useState({
    Basic: {
      price: "",
      currency: "INR",
      otherCurrency: "",
      noOfWords: "",
      milestones: "",
      milestoneData: [],
      remarks: "",
      tandc: bRemarks,
    },
    Standard: {
      price: "",
      currency: "INR",
      otherCurrency: "",
      noOfWords: "",
      milestones: "",
      milestoneData: [],
      remarks: "",
      tandc: sRemarks,
    },
    Advanced: {
      price: "",
      currency: "INR",
      otherCurrency: "",
      noOfWords: "",
      milestones: "",
      milestoneData: [],
      remarks: "",
      tandc: aRemarks,
    },
  });

  const userData = localStorage.getItem("user");
  const LoopUserData = localStorage.getItem("loopuser");

  const userObject = JSON.parse(userData);
  const loopUserObject = JSON.parse(LoopUserData);

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

  const fetchCurrencies = async () => {
    try {
      const response = await fetch(
        "https://loopback-skci.onrender.com/api/scope/getCurrencies",
      );
      const data = await response.json();
      if (data.status) {
        setCurrencies(data.data || []); // Set fetched currencies
      } else {
        toast.error("Failed to fetch currencies");
      }
    } catch (error) {
      console.error("Error fetching currencies:", error);
      toast.error("Error fetching currencies");
    }
  };

  const fetchServices = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user")); // Parse user object from localStorage
      const category = user?.category; // Retrieve the category

      if (!category) {
        toast.error("Category is not available in localStorage");
        return;
      }

      const response = await fetch(
        "https://loopback-skci.onrender.com/api/scope/getAllServices",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ category }), // Send category in the request body
        },
      );

      const data = await response.json();

      if (data.status) {
        setServices(data.data || []); // Set fetched services
      } else {
        toast.error("Failed to fetch services");
      }
    } catch (error) {
      console.error("Error fetching services:", error);
      toast.error("Error fetching services");
    }
  };

  const fetchUsers = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("loopuser")); // Parse user object from localStorage
      const user_id = user?.id; // Retrieve the category

      if (!user_id) {
        toast.error("User is not available in localStorage");
        return;
      }

      const response = await fetch(
        "https://loopback-skci.onrender.com/api/scope/getAllUsers",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ user_id }), // Send category in the request body
        },
      );

      const data = await response.json();

      if (data.status) {
        setUsers(data.data || []); // Set fetched services
      } else {
        toast.error("Failed to fetch users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Error fetching users");
    }
  };
  const fetchTags = async () => {
    try {
      const response = await fetch(
        "https://loopback-skci.onrender.com/api/scope/getTags",
      );
      const data = await response.json();
      if (data.status) setTags(data.data || []);
    } catch (error) {
      toast.error("Failed to fetch tags.");
    }
  };

  const checkDemoStatus = async () => {
    try {
      const response = await fetch(
        "https://loopback-skci.onrender.com/api/scope/checkDemoDoneStatus",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ref_id: refId }), // Send category in the request body
        },
      );
      const data = await response.json();
      if (data.status && data.data.length > 0) {
        const firstDemo = data.data[0];

        setDemoStatus(true);
        setDemodone("yes");
        setDemoId(firstDemo.demo_id || "");
        setDemoDuration(firstDemo.demo_duration || ""); // ✅ default to empty string if null
        setDemoDate(firstDemo.demo_date || "");
      } else {
        // toast.error('Failed to check status');
      }
    } catch (error) {
      console.error("Error checking status:", error);
      toast.error("Error checking status");
    }
  };

  useEffect(() => {
    fetchServices();
    fetchCurrencies();
    fetchUsers();
    fetchTags();
    checkDemoStatus();
  }, []);

  useEffect(() => {
    if (cloneData) {
      const quoteData = cloneData;
      setQuoteHeading(quoteData.quote_heading || "");
      setSelectedSubjectArea(quoteData.subject_area || "");
      setOtherSubjectArea(quoteData.other_subject_area || "");
      setClient_academic_level(quoteData.client_academic_level || "");
      setResults_section(quoteData.results_section || "");
      setTimeline(quoteData.timeline || "normal");
      setTimelineDays(quoteData.timeline_days || "");
      setLinkedQuotePresent(quoteData.linked_quote_id ? true : false);
      setLinkedQuoteId(quoteData.linked_quote_id || "");
      setIsFeasability(quoteData.isfeasability || 0);
      setSelectedUser(quoteData.feasability_user_id || "");

      // Set demo status
      setDemodone(quoteData.demodone || "no");
      setDemoId(quoteData.demo_id || "");
      setDemoDuration(quoteData.demo_duration || "");
      setDemoDate(quoteData.demo_date || "");

      if (quoteData.service_id) {
        // Check if it's already an array or a comma-separated string
        const serviceIds = Array.isArray(quoteData.service_id)
          ? quoteData.service_id
          : String(quoteData.service_id)
              .split(",")
              .map((id) => parseInt(id.trim()));
        setSelectedServices(serviceIds);
      }

      if (quoteData.tags) {
        const tagIds = Array.isArray(quoteData.tags)
          ? quoteData.tags
          : String(quoteData.tags)
              .split(",")
              .map((id) => parseInt(id.trim()));
        setSelectedTags(tagIds);
      }

      if (quoteData.selected_plans) {
        const plans = Array.isArray(quoteData.selected_plans)
          ? quoteData.selected_plans
          : String(quoteData.selected_plans)
              .split(",")
              .map((p) => p.trim());
        setSelectedPlans(plans);
      }

      setRecommendedPlan(quoteData.recommended_plan || "");

      if (quoteData.basic_info) {
        try {
          const basicInfo =
            typeof quoteData.basic_info === "string"
              ? JSON.parse(quoteData.basic_info)
              : quoteData.basic_info;
          // Ensure milestone data has percentage field
          const milestoneData = (basicInfo.milestoneData || []).map((ms) => ({
            ...ms,
            percentage: ms.percentage || "",
          }));
          setPlanDetails((prev) => ({
            ...prev,
            Basic: {
              price: basicInfo.price || "",
              currency: basicInfo.currency || "INR",
              otherCurrency: basicInfo.otherCurrency || "",
              milestones: basicInfo.milestones || "",
              milestoneData: milestoneData,
              remarks: basicInfo.remarks || bRemarks,
              tandc: basicInfo.tandc || "",
            },
          }));
        } catch (e) {
          console.error("Error parsing basic_info:", e);
        }
      }

      if (quoteData.standard_info) {
        try {
          const standardInfo =
            typeof quoteData.standard_info === "string"
              ? JSON.parse(quoteData.standard_info)
              : quoteData.standard_info;
          // Ensure milestone data has percentage field
          const milestoneData = (standardInfo.milestoneData || []).map(
            (ms) => ({
              ...ms,
              percentage: ms.percentage || "",
            }),
          );
          setPlanDetails((prev) => ({
            ...prev,
            Standard: {
              price: standardInfo.price || "",
              currency: standardInfo.currency || "INR",
              otherCurrency: standardInfo.otherCurrency || "",
              milestones: standardInfo.milestones || "",
              milestoneData: milestoneData,
              remarks: standardInfo.remarks || sRemarks,
              tandc: standardInfo.tandc || "",
            },
          }));
        } catch (e) {
          console.error("Error parsing standard_info:", e);
        }
      }

      if (quoteData.advanced_info) {
        try {
          const advancedInfo =
            typeof quoteData.advanced_info === "string"
              ? JSON.parse(quoteData.advanced_info)
              : quoteData.advanced_info;
          // Ensure milestone data has percentage field
          const milestoneData = (advancedInfo.milestoneData || []).map(
            (ms) => ({
              ...ms,
              percentage: ms.percentage || "",
            }),
          );
          setPlanDetails((prev) => ({
            ...prev,
            Advanced: {
              price: advancedInfo.price || "",
              currency: advancedInfo.currency || "INR",
              otherCurrency: advancedInfo.otherCurrency || "",
              milestones: advancedInfo.milestones || "",
              milestoneData: milestoneData,
              remarks: advancedInfo.remarks || aRemarks,
              tandc: advancedInfo.tandc || "",
            },
          }));
        } catch (e) {
          console.error("Error parsing advanced_info:", e);
        }
      }
    }
  }, [cloneData]);

  const plans = ["Basic", "Standard", "Advanced"];

  const serviceOptions = services.map((srv) => ({
    value: srv.id,
    label: srv.name,
    suggested_tags: srv.tag_names,
    selectedPlans: srv.selectedPlans,
  }));

  const handleServiceChange = (val) => {
    if (!val) {
      setSelectedServices([]);
      setSuggestedTags([]);
      setServicePlanLock(null);
      return;
    }

    // Extract tags from the selected service
    const tags = val.suggested_tags
      ? val.suggested_tags.split(",").map((t) => t.trim())
      : [];

    // Determine allowed plans from service, if any
    const allowedPlans =
      val.selectedPlans && String(val.selectedPlans).trim() !== ""
        ? String(val.selectedPlans)
            .split(",")
            .map((p) => p.trim())
            .filter(Boolean)
        : null;

    // Update states
    setSelectedServices([val.value]);
    setSuggestedTags(tags);
    setServicePlanLock(allowedPlans);

    if (allowedPlans && allowedPlans.length > 0) {
      // Enforce only allowed plans are selected
      setSelectedPlans(allowedPlans);
      if (!allowedPlans.includes(recommendedPlan)) {
        setRecommendedPlan("");
      }
    } else {
      // Unlock if no constraint from service
      setServicePlanLock(null);
    }
  };

  const tagOptions = tags.map((tag) => ({
    value: tag.id,
    label: tag.tag_name,
  }));

  const handlePlanToggle = (plan) => {
    if (selectedPlans.includes(plan)) {
      setSelectedPlans(selectedPlans.filter((p) => p !== plan));
      if (recommendedPlan === plan) setRecommendedPlan("");
    } else {
      setSelectedPlans([...selectedPlans, plan]);
    }
  };

  const handleMilestoneChange = (plan, index, field, value) => {
    if (field === "name") {
      const newMilestones = [...planDetails[plan].milestoneData];
      newMilestones[index] = { ...newMilestones[index], name: value };
      setPlanDetails({
        ...planDetails,
        [plan]: { ...planDetails[plan], milestoneData: newMilestones },
      });
    }
  };

  const handlePercentageChange = (plan, index, value) => {
    if (!/^\d*\.?\d*$/.test(value)) return;

    const percentage = parseFloat(value) || 0;

    // Calculate current total percentage excluding this milestone
    const currentTotal = planDetails[plan].milestoneData.reduce(
      (sum, ms, idx) => {
        if (idx === index) return sum;
        return sum + (parseFloat(ms.percentage) || 0);
      },
      0,
    );

    if (currentTotal + percentage > 100) {
      toast.error("Total percentage cannot exceed 100%");
      return;
    }

    const totalPrice = parseFloat(planDetails[plan].price) || 0;
    const calculatedPrice = Math.round((totalPrice * percentage) / 100);

    const newMilestones = [...planDetails[plan].milestoneData];
    newMilestones[index] = {
      ...newMilestones[index],
      percentage: value,
      price: calculatedPrice,
    };

    setPlanDetails({
      ...planDetails,
      [plan]: { ...planDetails[plan], milestoneData: newMilestones },
    });
  };

  const handleMilestoneCountChange = (plan, count) => {
    const price = parseFloat(planDetails[plan].price) || 0;

    if (price <= 0) {
      toast.error("Pls enter total price");
      return;
    }
    if (count <= 0) return;

    // Do NOT auto-distribute price - create milestones with empty percentages for manual entry
    const existingMilestones = planDetails[plan].milestoneData || [];
    const newData = Array.from({ length: count }, (_, i) => {
      const existingMilestone = existingMilestones[i];
      return {
        name: existingMilestone?.name || `Milestone ${i + 1}`,
        percentage: existingMilestone?.percentage || "",
        price: existingMilestone?.price || "",
        parametersData: existingMilestone?.parametersData || [
          { parameters: "", no_of_words: "", time_frame: "" },
        ],
      };
    });

    setPlanDetails({
      ...planDetails,
      [plan]: {
        ...planDetails[plan],
        milestones: count,
        milestoneData: newData,
      },
    });
  };

  const handleTotalPriceChange = (plan, value) => {
    if (!/^\d*$/.test(value)) return;
    setPlanDetails((prev) => {
      const prevPlan = prev[plan];
      let newMilestoneData = [...prevPlan.milestoneData];

      // Recalculate milestone prices based on existing percentages
      if (value && newMilestoneData.length > 0) {
        const totalPrice = parseFloat(value);
        newMilestoneData = newMilestoneData.map((ms) => {
          const percentage = parseFloat(ms.percentage) || 0;
          const calculatedPrice = Math.round((totalPrice * percentage) / 100);
          return {
            ...ms,
            price: percentage > 0 ? calculatedPrice : ms.price || "",
          };
        });
      }

      return {
        ...prev,
        [plan]: { ...prevPlan, price: value, milestoneData: newMilestoneData },
      };
    });
  };

  const handleAddParameter = (plan, milestoneIndex) => {
    setPlanDetails((prev) => {
      // deep clone plan data
      const updated = { ...prev };
      const planCopy = { ...updated[plan] };
      const milestoneDataCopy = [...planCopy.milestoneData];
      const msCopy = { ...milestoneDataCopy[milestoneIndex] };

      // ensure parametersData exists and copy it
      msCopy.parametersData = msCopy.parametersData
        ? [...msCopy.parametersData]
        : [];

      // add new parameter row
      msCopy.parametersData.push({
        parameters: "",
        no_of_words: "",
        time_frame: "",
      });

      // replace updated milestone
      milestoneDataCopy[milestoneIndex] = msCopy;
      planCopy.milestoneData = milestoneDataCopy;
      updated[plan] = planCopy;

      return updated;
    });
  };

  const handleRemoveParameter = (plan, milestoneIndex, paramIndex) => {
    setPlanDetails((prev) => {
      const updated = { ...prev };
      const ms = updated[plan].milestoneData[milestoneIndex];
      if (ms?.parametersData) {
        ms.parametersData = ms.parametersData.filter(
          (_, i) => i !== paramIndex,
        );
      }
      return { ...updated };
    });
  };

  const handleParameterChange = (
    plan,
    milestoneIndex,
    paramIndex,
    field,
    value,
  ) => {
    setPlanDetails((prev) => {
      const updated = { ...prev };
      const ms = updated[plan].milestoneData[milestoneIndex];
      if (!ms.parametersData) ms.parametersData = [];
      ms.parametersData[paramIndex][field] = value;
      return { ...updated };
    });
  };

  const dragItem = useRef(null);
  const dragOverItem = useRef(null);

  const handleSortParameter = (plan, milestoneIndex) => {
    // duplicate items
    let _planDetails = { ...planDetails };
    let _milestoneData = [..._planDetails[plan].milestoneData];
    let _parametersData = [..._milestoneData[milestoneIndex].parametersData];

    // remove and save the dragged item content
    const draggedItemContent = _parametersData.splice(dragItem.current, 1)[0];

    // switch the position
    _parametersData.splice(dragOverItem.current, 0, draggedItemContent);

    // update the actual array
    _milestoneData[milestoneIndex].parametersData = _parametersData;
    _planDetails[plan].milestoneData = _milestoneData;

    setPlanDetails(_planDetails);

    // reset the refs
    dragItem.current = null;
    dragOverItem.current = null;
  };

  const handleFileChange = (id, event) => {
    const updatedFiles = files.map((item) =>
      item.id === id ? { ...item, file: event.target.files[0] } : item,
    );
    setFiles(updatedFiles);
  };

  const handleAddFileInput = () => {
    setFiles([...files, { id: Date.now(), file: null }]);
  };

  const handleRemoveFileInput = (id) => {
    setFiles(files.filter((item) => item.id !== id));
  };

  const isEmpty = (value) => !String(value ?? "").trim();

  const handleSubmit = async () => {
    // Validate top-level fields
    if (isEmpty(quoteHeading)) {
      toast.error("Quote Heading is required");
      return;
    }
    if (!Array.isArray(selectedServices) || selectedServices.length === 0) {
      toast.error("Select at least one Service");
      return;
    }

    if (selectedSubjectArea == "") {
      toast.error("Select a Subject Area");
      return;
    }
    if (isEmpty(client_academic_level)) {
      toast.error("Select a Client's Academic Level");
      return;
    }
    if (isEmpty(results_section)) {
      toast.error("Select a Results Section");
      return;
    }
    if (isEmpty(timeline)) {
      toast.error("Select a Timeline");
      return;
    }
    if (timeline == "urgent" && isEmpty(timelineDays)) {
      toast.error("Select a Timeline Days");
      return;
    }
    if (isEmpty(linkedQuotePresent)) {
      toast.error("Select a Linked Quote Present");
      return;
    }
    if (linkedQuotePresent && isEmpty(linkedQuoteId)) {
      toast.error("Enter a Linked Quote ID");
      return;
    }
    if (selectedTags.length === 0) {
      toast.error("Select a Tag");
      return;
    }
    if (selectedSubjectArea == "Other" && isEmpty(otherSubjectArea)) {
      toast.error("Enter a Other Subject Area");
      return;
    }

    if (selectedPlans.length === 0) {
      toast.error("Select at least one Plan");
      return;
    }
    if (isEmpty(recommendedPlan) || !selectedPlans.includes(recommendedPlan)) {
      toast.error("Select a Recommended Plan from the chosen plans");
      return;
    }

    if (isfeasability == 1 && isEmpty(selectedUser)) {
      toast.error("Select a Feasibility User");
      return;
    }

    // Validate each selected plan and its visible fields
    for (const plan of selectedPlans) {
      const details = planDetails[plan];

      if (
        isEmpty(details.price) ||
        isNaN(Number(details.price)) ||
        Number(details.price) <= 0
      ) {
        toast.error(`Enter a valid Total Price for ${plan}`);
        return;
      }
      if (isEmpty(details.currency)) {
        toast.error(`Currency is required for ${plan}`);
        return;
      }
      if (details.currency === "Other" && isEmpty(details.otherCurrency)) {
        toast.error(`Other Currency name is required for ${plan}`);
        return;
      }
      if (!details.milestones || Number(details.milestones) <= 0) {
        toast.error(`Select number of milestones for ${plan}`);
        return;
      }
      if (!details.tandc || isEmpty(details.tandc)) {
        toast.error(`Please enter terms and conditions for ${plan}`);
        return;
      }
      if (
        !Array.isArray(details.milestoneData) ||
        details.milestoneData.length !== Number(details.milestones)
      ) {
        toast.error(`Milestone list is incomplete for ${plan}`);
        return;
      }

      // Validate total percentage equals 100%
      const totalPercentage = details.milestoneData.reduce(
        (sum, ms) => sum + (parseFloat(ms.percentage) || 0),
        0,
      );

      if (Math.abs(totalPercentage - 100) > 0.01) {
        toast.error(
          `Total percentage for ${plan} must be exactly 100%. Current: ${totalPercentage.toFixed(1)}%`,
        );
        return;
      }

      for (let i = 0; i < details.milestoneData.length; i++) {
        const ms = details.milestoneData[i];
        const msLabel = `${plan} - Milestone ${i + 1}`;

        if (isEmpty(ms.name)) {
          toast.error(`Milestone name required for ${msLabel}`);
          return;
        }
        if (
          isEmpty(ms.percentage) ||
          isNaN(Number(ms.percentage)) ||
          Number(ms.percentage) <= 0
        ) {
          toast.error(`Enter a valid percentage for ${msLabel}`);
          return;
        }
        if (
          ms.price === "" ||
          isNaN(Number(ms.price)) ||
          Number(ms.price) < 0
        ) {
          toast.error(`Invalid calculated price for ${msLabel}`);
          return;
        }
        if (
          !Array.isArray(ms.parametersData) ||
          ms.parametersData.length === 0
        ) {
          toast.error(`Add at least one parameter row for ${msLabel}`);
          return;
        }
        for (let j = 0; j < ms.parametersData.length; j++) {
          const row = ms.parametersData[j];
          if (isEmpty(row.parameters)) {
            toast.error(`Parameters is required for ${msLabel} (row ${j + 1})`);
            return;
          }
          if (isEmpty(row.no_of_words)) {
            toast.error(
              `No of Words is required for ${msLabel} (row ${j + 1})`,
            );
            return;
          }
          if (isEmpty(row.time_frame)) {
            toast.error(`Time Frame is required for ${msLabel} (row ${j + 1})`);
            return;
          }
        }
      }
    }

    if (internalCommentsOpen && internalComments.length == 0) {
      toast.error("Enter internal comments");
      return;
    }

    const payload = {
      ref_id: refId,
      user_id:
        userIdDefined && userIdDefined != null && userIdDefined != ""
          ? userIdDefined
          : loopUserObject.id,
      user_name:
        loopUserObject.fld_first_name + " " + loopUserObject.fld_last_name,
      category: userObject.category,
      demo_done: demodone,
      demo_id: demoId,
      demo_duration: demoDuration,
      demo_date: demoDate,
      quoteHeading,
      selectedServices: [...selectedServices],
      selectedTags: [...selectedTags],
      selectedSubjectArea,
      otherSubjectArea: selectedSubjectArea === "Other" ? otherSubjectArea : "",
      client_academic_level,
      results_section,
      timeline,
      timelineDays: timeline === "urgent" ? timelineDays : "",
      linkedQuotePresent: Boolean(linkedQuotePresent),
      linkedQuoteId: linkedQuotePresent ? linkedQuoteId : "",
      isfeasability,
      selectedUser: isfeasability == 1 ? selectedUser : "",
      selectedPlans: [...selectedPlans],
      recommendedPlan,
      plans: selectedPlans.map((p) => ({
        plan: p,
        ...planDetails[p],
        currency:
          planDetails[p].currency === "Other"
            ? planDetails[p].otherCurrency
            : planDetails[p].currency,
      })),
    };
    const formData = new FormData();
    formData.append("ref_id", refId);
    formData.append("client_name", clientName);
    formData.append(
      "user_id",
      userIdDefined && userIdDefined != null && userIdDefined != ""
        ? userIdDefined
        : loopUserObject.id,
    );
    formData.append(
      "user_name",
      loopUserObject.fld_first_name + " " + loopUserObject.fld_last_name,
    );
    formData.append("category", userObject.category);
    formData.append("demo_done", demodone);
    formData.append("demo_id", demoId);
    formData.append("demo_duration", demoDuration);
    formData.append("demo_date", demoDate);
    formData.append("quoteHeading", quoteHeading);
    formData.append("service_name", selectedServices);
    formData.append("tags", selectedTags);
    formData.append("subject_area", selectedSubjectArea);
    formData.append(
      "other_subject_area",
      selectedSubjectArea === "Other" ? otherSubjectArea : "",
    );
    formData.append("client_academic_level", client_academic_level);
    formData.append("results_section", results_section);
    formData.append("timeline", timeline);
    formData.append("timeline_days", timeline === "urgent" ? timelineDays : "");
    formData.append("linkedQuotePresent", Boolean(linkedQuotePresent));
    formData.append("linkedQuoteId", linkedQuotePresent ? linkedQuoteId : "");
    formData.append("isfeasability", isfeasability);
    formData.append("feasability_user", isfeasability == 1 ? selectedUser : "");
    formData.append("expiry_date", expiryDate);
    formData.append("selectedPlans", selectedPlans);
    formData.append("recommendedPlan", recommendedPlan);
    formData.append("internal_comments", internalComments);
    const plansArray = selectedPlans.map((p) => ({
      plan: p,
      ...planDetails[p],
      currency:
        planDetails[p].currency === "Other"
          ? planDetails[p].otherCurrency
          : planDetails[p].currency,
    }));
    formData.append("plans", JSON.stringify(plansArray));

    files.forEach((item, index) => {
      if (item.file) {
        formData.append(`quote_upload_file[]`, item.file);
      }
    });

    // Final output
    // eslint-disable-next-line no-console
    const formDataObj = {};
    formData.forEach((value, key) => {
      formDataObj[key] = value;
    });
    // console.log("FormData object:", formDataObj);
    // return;
    try {
      setSubmitting(true);
      const response = await fetch(
        "https://loopback-skci.onrender.com/api/scope/submitRequestQuoteApiActionNewVersion/",
        {
          method: "POST",
          body: formData,
        },
      );

      const data = await response.json();
      if (data.status) {
        toast.success("Quote request submitted successfully");
        socket.emit("newRequest", data.quote_details);

        after();
        onClose();
      } else {
        toast.error(data.message || "Failed to submit quote request");
      }
    } catch (error) {
      console.error("Error submitting quote request:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed right-0 h-full w-1/2 bg-white shadow-lg z-50 overflow-y-auto"
      style={{ top: "-20px" }}
    >
      <div className="flex items-center justify-between bg-blue-100 text-white px-6 py-3 sticky top-0 z-1">
        {/* Tabs */}
        <div className="flex items-center space-x-4">
          <h2
            className={`tab-btn-n-set flex items-center cursor-pointer px-2 py-1 rounded-lg transition-colors ${
              isfeasability == 1
                ? "bg-white text-blue-700 shadow-md"
                : "bg-blue-600 hover:bg-blue-500 text-gray-200"
            }`}
            onClick={() => setIsFeasability(1)}
          >
            Ask For Feasibility Check{" "}
            {isfeasability == 1 && (
              <CheckCircle2 size={18} className="ml-2 text-green-700" />
            )}
          </h2>

          <h2
            className={`tab-btn-n-set flex items-center cursor-pointer px-2 py-1 rounded-lg transition-colors ${
              isfeasability == 0
                ? "bg-white text-blue-700 shadow-md"
                : "bg-blue-600 hover:bg-blue-500 text-gray-200"
            }`}
            onClick={() => setIsFeasability(0)}
          >
            Ask For Scope{" "}
            {isfeasability == 0 && (
              <CheckCircle2 size={18} className="ml-2 text-green-700" />
            )}
          </h2>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="text-white hover:text-red-500 transition-colors p-1 rounded-full bg-red-600 hover:bg-red-500"
        >
          <X size={18} />
        </button>
      </div>
      <div className="bg-white p-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Quote Heading */}
        <div className="col-span-2 ">
          <label className="block font-medium f-12">Quote Heading</label>
          <input
            type="text"
            value={quoteHeading}
            onChange={(e) => {
              const value = e.target.value;
              const wordCount = value.trim()
                ? value.trim().split(/\s+/).length
                : 0;
              if (wordCount <= 200) {
                setQuoteHeading(value);
              }
            }}
            className="mt-1 block w-full border-gray-300 rounded px-2 py-2 text-gray-700 border text-[12px]"
            placeholder="Enter heading (max 200 words)"
          />
          <div className="text-[10px] text-gray-500 mt-1">
            {quoteHeading.trim() ? quoteHeading.trim().split(/\s+/).length : 0}{" "}
            / 200 words
          </div>
        </div>

        {/* Services Multi Select */}
        <div className="col-span-2 ">
          <label className="block font-medium f-12">Select Services</label>
          <Select
            options={serviceOptions}
            value={
              serviceOptions.find((opt) => opt.value === selectedServices[0]) ||
              null
            }
            onChange={handleServiceChange}
            className="w-full"
            classNamePrefix="select"
            placeholder="Select a service"
            noOptionsMessage={() => "No services"}
          />

          {suggestedTags.length > 0 && (
            <div className="mt-2 text-[11px] text-gray-500">
              <strong>Suggested Tags:</strong>{" "}
              <div className="flex flex-wrap gap-1 mt-1">
                {suggestedTags.map((tag, i) => {
                  // Find the tag object from tags array
                  const tagObj = tags.find((t) => t.tag_name === tag);
                  const isSelected = tagObj && selectedTags.includes(tagObj.id);

                  return (
                    <span
                      key={i}
                      onClick={() => {
                        if (tagObj) {
                          if (isSelected) {
                            // Remove from selected tags
                            setSelectedTags((prev) =>
                              prev.filter((id) => id !== tagObj.id),
                            );
                          } else {
                            // Add to selected tags
                            setSelectedTags((prev) => [...prev, tagObj.id]);
                          }
                        }
                      }}
                      className={`inline-block px-2 py-1 rounded-full text-xs cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-blue-100 hover:text-blue-700"
                      }`}
                    >
                      #{tag}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* subject area */}

        <div className="">
          <label
            htmlFor="subject_area"
            className="block font-medium text-gray-700 f-12"
          >
            Subject Area
          </label>
          <select
            id="subject_area"
            value={selectedSubjectArea}
            onChange={(e) => setSelectedSubjectArea(e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded px-2 py-2 text-gray-700 border text-[12px]"
          >
            <option value="">Select Subject Area</option>

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
            <option value="Civil Litigation Law">Civil Litigation Law</option>
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
            <option value="Health and Safety Law">Health and Safety Law</option>
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
            <option value="International Studies">International Studies</option>
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
            <option value="Occupational therapy">Occupational therapy</option>
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
            <option value="Public Administration">Public Administration</option>
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
        {selectedSubjectArea == "Other" && (
          <div className="">
            <input
              type="text"
              id="other_subject_area"
              value={otherSubjectArea}
              onChange={(e) => setOtherSubjectArea(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm form-control form-control-sm"
              placeholder="Enter Other Subject Area"
            />
          </div>
        )}

        {/* client's academic level and results section */}

        <div className="">
          <label
            htmlFor="client_academic_level"
            className="block font-medium text-gray-700 f-12"
          >
            Client's Academic level
          </label>
          <select
            id="client_academic_level"
            value={client_academic_level}
            onChange={(e) => setClient_academic_level(e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded px-2 py-2 text-gray-700 border text-[12px]"
          >
            <option value="">Select academic level</option>
            <option value="PhD">PhD</option>
            <option value="Bachelors">Bachelors</option>
            <option value="Masters">Masters</option>
            <option value="Post Doctoral">Post Doctoral</option>
            <option value="Author">Author</option>
          </select>
        </div>
        <div className="">
          <label
            htmlFor="results_section"
            className="block f-12 font-medium text-gray-700"
          >
            Results Section
          </label>
          <select
            id="results_section"
            value={results_section}
            onChange={(e) => setResults_section(e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded px-2 py-2 text-gray-700 border text-[12px]"
          >
            <option value="">Select results section</option>
            <option value="Client will provide">Client will provide</option>
            <option value="We need to work">We need to work</option>
            <option value="Partially client will provide">
              Partially client will provide
            </option>
            <option value="Theoretical Work">Theoretical Work</option>
          </select>
        </div>

        {/* timeline */}

        <div className="">
          <label
            htmlFor="timeline"
            className="block f-12 font-medium text-gray-700"
          >
            Timeline
          </label>
          <select
            id="timeline"
            value={timeline}
            onChange={(e) => {
              setTimeline(e.target.value);
              if (e.target.value !== "Urgent") {
                setTimelineDays("");
              }
            }}
            className="mt-1 block w-full border-gray-300 rounded px-2 py-2 text-gray-700 border text-[12px]"
          >
            <option value="normal">Normal</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        {timeline === "urgent" && (
          <div className="">
            <label
              htmlFor="timelineDays"
              className="block f-12 font-medium text-gray-700"
            >
              Timeline Days
            </label>
            <select
              id="timelineDays"
              value={timelineDays}
              onChange={(e) => setTimelineDays(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded px-2 py-2 text-gray-700 border text-[12px]"
            >
              <option value="">Select days</option>
              {Array.from({ length: 90 }, (_, i) => i + 1).map((day) => (
                <option key={day} value={day}>
                  {day} {day === 1 ? "day" : "days"}
                </option>
              ))}
            </select>
          </div>
        )}
        {/* linked quote present */}
        <div className="">
          <label
            htmlFor="linkedQuotePresent"
            className="block f-12 font-medium text-gray-700"
          >
            Any linked quote ID?
          </label>
          <select
            id="linkedQuotePresent"
            value={linkedQuotePresent ? "yes" : "no"}
            onChange={(e) => setLinkedQuotePresent(e.target.value === "yes")}
            className="mt-1 block w-full border-gray-300 rounded px-2 py-2 text-gray-700 border text-[12px]"
          >
            <option value="no">No</option>
            <option value="yes">Yes</option>
          </select>
        </div>

        {linkedQuotePresent && (
          <div className="">
            <label
              htmlFor="linkedQuoteId"
              className="block f-12 font-medium text-gray-700"
            >
              Enter Scope ID
            </label>
            <input
              type="text"
              id="linkedQuoteId"
              value={linkedQuoteId}
              onChange={(e) => setLinkedQuoteId(e.target.value)}
              placeholder="Enter Scope ID"
              className="mt-1 block w-full border-gray-300 rounded px-2 py-2 text-gray-700 border text-[12px]"
            />
          </div>
        )}

        <div className="">
          {/* Tags */}
          <label className="block font-medium f-12">Tags</label>

          <Select
            isMulti
            options={tagOptions}
            value={tagOptions.filter((opt) => selectedTags.includes(opt.value))}
            onChange={(vals) =>
              setSelectedTags((vals || []).map((v) => v.value))
            }
            className="w-full"
            classNamePrefix="select"
            placeholder="Select tags"
            noOptionsMessage={() => "No tags"}
          />
        </div>
        {!demoStatus && (
          <div className=" flex w-full mt-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="demodone"
                checked={demoStatus}
                onChange={(e) => setDemodone(e.target.checked ? "yes" : "no")}
                className="h-4 f-12 w-4 border-gray-300 rounded"
              />
              <label
                htmlFor="demodone"
                className="ml-2 f-12 font-medium text-gray-700"
              >
                Demo Done
              </label>
            </div>
            <div
              className="ml-5 f-12 "
              style={{ display: demodone == "yes" ? "block" : "none" }}
            >
              <input
                type="text"
                id="demo_id"
                value={demoId}
                onChange={(e) => setDemoId(e.target.value)}
                className="mt-1 block w-full px-2 py-1 border-gray-300 rounded shadow-sm form-control f-12 form-control-sm"
                placeholder="Enter Demo ID"
              />
            </div>
          </div>
        )}

        {isfeasability == 1 && (
          <div className={`w-full`}>
            <label className="block f-12 font-medium text-gray-700">
              Select Feasibility User to Assign
            </label>
            <select
              name="user"
              id="user"
              className="form-select f-12 select2 w-72 py-1 px-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 form-control"
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
            >
              <option value="">Select User</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.fld_first_name + " " + user.fld_last_name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className={`w-full`}>
          <label className="block f-12 font-medium text-gray-700">
            Expiry Date
          </label>
          <input
            type="date"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
            className="form-control f-12 w-72 py-1 px-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Plans Selection */}
        <div className="col-span-2">
          <label className="block font-medium f-12">Select Plans</label>
          <div className="flex gap-4">
            {plans.map((plan) => {
              const isLocked =
                Array.isArray(servicePlanLock) && servicePlanLock.length > 0;
              const isAllowed = !isLocked || servicePlanLock.includes(plan);
              return (
                <label key={plan} className="flex items-center gap-2 f-12">
                  <input
                    type="checkbox"
                    checked={selectedPlans.includes(plan)}
                    onChange={() => handlePlanToggle(plan)}
                    disabled={isLocked && !isAllowed}
                  />
                  {plan}
                </label>
              );
            })}
          </div>
        </div>

        {/* Recommended Plan */}
        <div className="col-span-2">
          <label className="block font-medium f-12">Recommended Plan</label>
          <div className="flex gap-4">
            {plans.map((plan) => {
              const isLocked =
                Array.isArray(servicePlanLock) && servicePlanLock.length > 0;
              const isAllowed = !isLocked || servicePlanLock.includes(plan);
              return (
                <label key={plan} className="flex items-center gap-2 f-12">
                  <input
                    type="radio"
                    name="recommendedPlan"
                    value={plan}
                    disabled={
                      !selectedPlans.includes(plan) || (isLocked && !isAllowed)
                    }
                    checked={recommendedPlan === plan}
                    onChange={(e) => setRecommendedPlan(e.target.value)}
                  />
                  {plan}
                </label>
              );
            })}
          </div>
        </div>

        {/* Plan Details */}
        {selectedPlans.map((plan) => (
          <div
            key={plan}
            className={`border rounded-lg p-3 relative col-span-2 ${plan == "Basic" ? "bg-blue-50" : plan == "Standard" ? "bg-gray-50" : "bg-yellow-50"}`}
          >
            {recommendedPlan == plan && (
              <div className="absolute -top-3 right-0">
                <span className="f-11 text-white bg-blue-500 px-2 py-1 rounded">
                  Recommended
                </span>
              </div>
            )}
            <h3 className="text-lg font-semibold mb-3">{plan} Plan</h3>

            <div className="flex gap-4 mb-3">
              {/* Currency */}
              <div className="">
                <label className="block font-medium f-12">Currency</label>
                <select
                  value={planDetails[plan].currency}
                  onChange={(e) =>
                    setPlanDetails({
                      ...planDetails,
                      [plan]: {
                        ...planDetails[plan],
                        currency: e.target.value,
                      },
                    })
                  }
                  className="mt-1 block w-full border-gray-300 rounded px-2 py-2 text-gray-700 border text-[12px]"
                >
                  {currencies.map((cur) => (
                    <option key={cur.name} value={cur.name}>
                      {cur.name}
                    </option>
                  ))}
                  <option value="Other">Other</option>
                </select>
              </div>

              {planDetails[plan].currency === "Other" && (
                <div className=" ">
                  <label className="block font-medium f-12">
                    Other Currency Name
                  </label>
                  <input
                    type="text"
                    value={planDetails[plan].otherCurrency}
                    onChange={(e) =>
                      setPlanDetails({
                        ...planDetails,
                        [plan]: {
                          ...planDetails[plan],
                          otherCurrency: e.target.value,
                        },
                      })
                    }
                    className="mt-1 block w-full border-gray-300 rounded px-2 py-2 text-gray-700 border text-[12px]"
                    placeholder="Currency name"
                  />
                </div>
              )}

              {/* Price */}
              <div className="">
                <label className="block font-medium f-12">
                  Total Price ({plan})
                </label>
                <input
                  type="text"
                  value={planDetails[plan].price}
                  onChange={(e) => handleTotalPriceChange(plan, e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded px-2 py-2 text-gray-700 border text-[12px]"
                  placeholder="Enter price"
                />
              </div>

              {/* No of Words */}
              <div className="">
                <label className="block font-medium f-12">
                  No of Words ({plan})
                </label>
                <input
                  type="text"
                  value={planDetails[plan].noOfWords}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^\d*$/.test(value)) {
                      setPlanDetails({
                        ...planDetails,
                        [plan]: { ...planDetails[plan], noOfWords: value },
                      });
                    }
                  }}
                  onPaste={(e) => {
                    const paste = e.clipboardData.getData("text");
                    if (/^\d*$/.test(paste)) {
                      setPlanDetails({
                        ...planDetails,
                        [plan]: { ...planDetails[plan], noOfWords: paste },
                      });
                    } else {
                      e.preventDefault();
                    }
                  }}
                  className="mt-1 block w-full border-gray-300 rounded px-2 py-2 text-gray-700 border text-[12px]"
                  placeholder="Enter no of words"
                />
              </div>

              {/* Milestones */}
              <div className="">
                <label className="block font-medium f-12">
                  No of Milestones {plan}
                </label>
                <select
                  value={planDetails[plan].milestones}
                  onChange={(e) =>
                    handleMilestoneCountChange(plan, parseInt(e.target.value))
                  }
                  className="mt-1 block w-full border-gray-300 rounded px-2 py-2 text-gray-700 border text-[12px]"
                >
                  <option value="">select no of milestones</option>
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                    <option key={num} value={num}>
                      {num}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Milestone List */}
            {planDetails[plan].milestoneData.map((ms, idx) => {
              // Calculate current total percentage
              const totalPercentage = planDetails[plan].milestoneData.reduce(
                (sum, m) => sum + (parseFloat(m.percentage) || 0),
                0,
              );

              return (
                <div key={idx} className="border p-3 rounded mb-3 bg-white">
                  <div className="flex gap-2 mb-2">
                    <textarea
                      placeholder={`Milestone Name ${idx + 1}`}
                      value={ms.name}
                      rows={1}
                      onChange={(e) => {
                        const words = e.target.value.trim().split(/\s+/);

                        if (words.length <= 20) {
                          handleMilestoneChange(
                            plan,
                            idx,
                            "name",
                            e.target.value,
                          );
                        } else {
                          toast.error("Milestone name cannot exceed 20 words");
                        }
                      }}
                      className="flex-1 border rounded px-2 py-1 f-12 resize-y min-h-[30px]"
                      style={{ overflow: "hidden" }}
                    />
                    <input
                      type="text"
                      placeholder="% (0-100)"
                      value={ms.percentage}
                      onChange={(e) =>
                        handlePercentageChange(plan, idx, e.target.value)
                      }
                      className="w-24 border rounded px-2 py-1 f-12 text-center"
                    />
                    <input
                      type="text"
                      placeholder="Price"
                      value={ms.price}
                      readOnly
                      className="w-32 border rounded px-2 py-1 f-12 bg-gray-100 cursor-not-allowed"
                      title="Price is auto-calculated based on percentage"
                    />
                  </div>
                  {totalPercentage > 100 && (
                    <div className="text-red-500 f-11 mb-2">
                      Warning: Total percentage is {totalPercentage.toFixed(1)}
                      %. Cannot exceed 100%.
                    </div>
                  )}

                  {/* Parameters */}
                  <div className="space-y-2">
                    {ms.parametersData?.map((param, pIdx) => (
                      <div
                        key={pIdx}
                        className="flex gap-2 items-center"
                        draggable
                        onDragStart={(e) => (dragItem.current = pIdx)}
                        onDragEnter={(e) => (dragOverItem.current = pIdx)}
                        onDragEnd={() => handleSortParameter(plan, idx)}
                        onDragOver={(e) => e.preventDefault()}
                      >
                        <div className="cursor-move text-gray-400 hover:text-gray-600">
                          <GripVertical size={16} />
                        </div>
                        <textarea
                          placeholder="Parameters"
                          value={param.parameters}
                          rows={1}
                          onChange={(e) =>
                            handleParameterChange(
                              plan,
                              idx,
                              pIdx,
                              "parameters",
                              e.target.value,
                            )
                          }
                          className="flex-1 border rounded px-2 py-1 f-12 resize-y min-h-[30px]"
                          style={{ overflow: "hidden" }}
                        />
                        <input
                          type="text"
                          placeholder="No of Words"
                          value={param.no_of_words}
                          onChange={(e) =>
                            handleParameterChange(
                              plan,
                              idx,
                              pIdx,
                              "no_of_words",
                              e.target.value,
                            )
                          }
                          className="w-32 border rounded px-2 py-1 f-12"
                        />
                        <input
                          type="text"
                          placeholder="Time Frame"
                          value={param.time_frame}
                          onChange={(e) =>
                            handleParameterChange(
                              plan,
                              idx,
                              pIdx,
                              "time_frame",
                              e.target.value,
                            )
                          }
                          className="w-32 border rounded px-2 py-1 f-12"
                        />
                        {pIdx > 0 && (
                          <button
                            type="button"
                            onClick={() =>
                              handleRemoveParameter(plan, idx, pIdx)
                            }
                            className="px-2 py-1 bg-red-500 text-white rounded f-12"
                          >
                            -
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => handleAddParameter(plan, idx)}
                      className=" f-11 px-2 py-1 bg-green-500 text-white rounded"
                    >
                      + Add Parameter
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Remarks */}
            {/* <div className="mt-3">
                            <label className="block font-medium f-12">{plan} Additional Remarks</label>
                            <textarea
                                value={planDetails[plan].remarks}
                                readOnly={true}
                                // onChange={(e) =>
                                //     setPlanDetails({
                                //         ...planDetails,
                                //         [plan]: { ...planDetails[plan], remarks: e.target.value },
                                //     })
                                // }
                                className="mt-1 block w-full border-gray-300 rounded px-2 py-2 text-gray-700 border text-[12px]"
                                rows={5}
                                placeholder="Enter remarks"
                            />
                        </div> */}

            {/* Terms and Conditions */}
            <div className="mt-3">
              <label className="block font-medium f-12">
                {plan} Terms and conditions
              </label>
              <ReactQuill
                theme="snow"
                value={planDetails[plan].tandc}
                onChange={(value) =>
                  setPlanDetails({
                    ...planDetails,
                    [plan]: { ...planDetails[plan], tandc: value },
                  })
                }
                className="mt-1 rounded border border-gray-300 bg-gray-50 f-12"
                modules={modules}
              />
            </div>
          </div>
        ))}

        {parentQuote && (
          <div className="w-full">
            <label className="block f-12 font-medium text-gray-700">
              Upload Files
            </label>
            {files.map((item, index) => (
              <div key={item.id} className="flex items-center mt-1 space-x-2">
                <input
                  type="file"
                  onChange={(e) => handleFileChange(item.id, e)}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:border file:border-gray-300 file:rounded file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveFileInput(item.id)}
                    className="px-2 py-1 bg-red-500 text-white rounded white-space-nowrap f-14"
                  >
                    - Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddFileInput}
              className="mt-2 px-2 py-1 bg-green-500 text-white rounded f-14"
            >
              + Add
            </button>
          </div>
        )}
        <div className="col-span-2 mt-4 pt-4 border-t border-gray-100">
          <div
            className="flex items-center cursor-pointer select-none group w-fit"
            onClick={() => setInternalCommentsOpen(!internalCommentsOpen)}
          >
            <div
              className={`p-1.5 rounded-lg mr-3 transition-all duration-200 ${internalCommentsOpen ? "bg-blue-100 text-blue-600 shadow-sm" : "bg-gray-100 text-gray-400 group-hover:bg-gray-200 group-hover:text-gray-600"}`}
            >
              <MessageSquare size={16} />
            </div>
            <span
              className={`f-13 font-medium transition-colors ${internalCommentsOpen ? "text-blue-700" : "text-gray-600 group-hover:text-gray-800"}`}
            >
              Internal Comments
            </span>
            <div
              className={`ml-3 w-8 h-4 rounded-full relative transition-colors duration-200 ${internalCommentsOpen ? "bg-blue-500" : "bg-gray-300"}`}
            >
              <div
                className="absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all duration-200"
                style={{ left: internalCommentsOpen ? "18px" : "2px" }}
              />
            </div>
          </div>

          {internalCommentsOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3"
            >
              <textarea
                value={internalComments}
                onChange={(e) => setInternalComments(e.target.value)}
                className="block w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-700 text-[13px] focus:ring-4 focus:ring-blue-50 focus:border-blue-400 outline-none transition-all resize-none shadow-sm"
                rows={4}
                placeholder="Type internal notes here..."
              />
            </motion.div>
          )}
        </div>

        <div className="col-span-2 text-right">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="px-2 py-1 bg-blue-600 text-white rounded f-12"
          >
            {submitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default AddNewRequest;
