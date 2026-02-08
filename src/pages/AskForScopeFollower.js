import React, { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import CustomLoader from '../CustomLoader';
import { Chat } from './Chat';
import AskPtp from './AskPtp';
import DemoDone from './DemoDone';
import { CheckCircle2, Info, PlusCircle, RefreshCcw, ChevronUp, ChevronDown, ArrowDown, ArrowUp, Edit, Settings2, History, Hash, FileDownIcon, Paperclip, UserRoundPlus, ArrowLeftRight, Eye, EyeClosed, Minimize2, Expand, Pencil, CheckCircle, XCircle, Share2, Copy, Crown } from 'lucide-react';
import SubmitRequestQuote from './SubmitRequestQuote';
import { AnimatePresence } from 'framer-motion';
import EditRequestForm from './EditRequestForm';
import Swal from 'sweetalert2';
import 'sweetalert2/src/sweetalert2.scss'
import HistorySideBar from './HistorySideBar';
import FeasHistorySideBar from './FeasHistorySideBar';
import AddTags from './AddTags';
import AddFollowers from './AddFollowers';
import { io } from "socket.io-client";
import MergedHistoryComponent from './MergedHistoryComponent';
import ScopeLoader from './ScopeLoader';
import { getSocket } from './Socket';
import ReactTooltip, { Tooltip } from 'react-tooltip';
import MergedHistoryComponentNew from "./MergedHistoryComponentNew";
import academic from '../academic.svg';
import experiment from '../poll.svg';
import AttachedFiles from './AttachedFiles';
import DetailsComponent from './new/DetailsComponent';



const AskForScopeFollower = ({ queryId, userType, quotationId, queryInfo }) => {
    const socket = getSocket();
    const [scopeDetails, setScopeDetails] = useState(null);
    const [assignQuoteInfo, setAssignQuoteInfo] = useState(null);
    const [loading, setLoading] = useState(false);
    const [priceLoading, setPriceLoading] = useState(false);
    const [quoteLoading, setQuoteLoading] = useState(false);
    const [assignLoading, setAssignLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [quotePrice, setQuotePrice] = useState('');
    const [userComments, setUserComments] = useState('');
    const [ConsultantUserData, setConsultantUserData] = useState([]);
    const [quoteAmount, setQuoteAmount] = useState('');
    const [comment, setComment] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [adminComments, setAdminComments] = useState('');
    const userData = localStorage.getItem('user');
    const loopuserData = localStorage.getItem('loopuser');
    const [expandedRowIndex, setExpandedRowIndex] = useState(0);
    const [addNewFormOpen, setAddNewFormOpen] = useState(false);
    const [editFormOpen, setEditFormOpen] = useState(false);
    const [hashEditFormOpen, setHashEditFormOpen] = useState(false);
    const [followersFormOpen, setFollowersFormOpen] = useState(false);
    const [selectedQuoteId, setSelectedQuoteId] = useState('');
    const [selectedRefId, setSelectedRefId] = useState('');
    const [historyData, setHistoryData] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);

    const [error, setError] = useState(null);

    const [historyPanelOpen, SetHistoryPanelOpen] = useState(false);
    const [quoteIdForHistory, setQuoteIdForHistory] = useState('');

    const [feasHistoryPanelOpen, SetFeasHistoryPanelOpen] = useState(false);
    const [quoteIdForFeasHistory, setQuoteIdForFeasHistory] = useState('');
    const [refIdForFeasHistory, setRefIdForFeasHistory] = useState('');
    const [userIdForTag, setUserIdForTag] = useState('');

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


    const [scopeTabVisible, setScopeTabVisible] = useState(true);
    const [chatTabVisible, setChatTabVisible] = useState(true);
    const [feasTabVisible, setFeasTabVisible] = useState(false);
    const [fileTabVisible, setFileTabVisible] = useState(true);
    const [fullScreenTab, setFullScreenTab] = useState(null);
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
            setFileTabVisible(!fileTabVisible);
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
        } else {
            return "col-md-3";
        }
    }, [scopeTabVisible, chatTabVisible, feasTabVisible]);

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

    function capitalizeFirstLetter(str) {
        if (typeof str !== 'string') return str;
        return str.charAt(0).toUpperCase() + str.slice(1);
    }





    const toggleHistoryDiv = ($id) => {
        setQuoteIdForHistory($id);
        SetHistoryPanelOpen(true);
    }

    const toggleRow = (index) => {
        setExpandedRowIndex(expandedRowIndex == index ? null : index);
    };


    const userObject = JSON.parse(userData);
    const loopUserObject = JSON.parse(loopuserData);

    const thisUserId = loopUserObject.id


    const fetchScopeDetails = async () => {
        setLoading(true); // Show loading spinner
        let hasResponse = false;
        try {
            const response = await fetch(
                'https://loopback-skci.onrender.com/api/scope/adminScopeDetails',
                {
                    method: 'POST', // Use POST method
                    headers: {
                        'Content-Type': 'application/json', // Set content type to JSON
                    },
                    body: JSON.stringify({ ref_id: queryId, quote_id: quotationId, user_type: userType }), // Send the ref_id
                }
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
                console.error('Failed to fetch Details:', data.message);
            }
            hasResponse = true;
        } catch (error) {
            console.error('Error fetching details:', error);
        } finally {
            if (hasResponse) {
                setLoading(false); // Hide the loader
            }
        }
    };
    const fetchScopeDetailsForSocket = async () => {

        try {
            const response = await fetch(
                'https://loopback-skci.onrender.com/api/scope/adminScopeDetails',
                {
                    method: 'POST', // Use POST method
                    headers: {
                        'Content-Type': 'application/json', // Set content type to JSON
                    },
                    body: JSON.stringify({ ref_id: queryId, quote_id: quotationId, user_type: userType }), // Send the ref_id
                }
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
                console.error('Failed to fetch Details:', data.message);
            }

        } catch (error) {
            console.error('Error fetching details:', error);
        }
    };

    useEffect(() => {
        socket.on('feasabilityDone', (data) => {
            if (data.quote_id == quotationId) {
                fetchScopeDetailsForSocket();
            }
        });

        return () => {
            socket.off('feasabilityDone');  // Clean up on component unmount
        };
    }, []);

    useEffect(() => {
        socket.on('planCommentsEdited', (data) => {
            if (data.ref_id == queryId) {

                fetchScopeDetailsForSocket();
            }
        });

        return () => {
            socket.off('planCommentsEdited');  // Clean up on component unmount
        };
    }, []);


    useEffect(() => {
        if (queryId) {
            fetchScopeDetails(); // Fetch the scope details when the component mounts
            fetchTags();
            fetchUsers();
        }
    }, [queryId]);
    useEffect(() => {
        socket.on('quoteReceived', (data) => {
            if (data.ref_id == queryId) {

                fetchScopeDetailsForSocket();
            }
        });

        return () => {
            socket.off('quoteReceived');  // Clean up on component unmount
        };
    }, []);

    useEffect(() => {
        socket.on('quotePriceUpdated', (data) => {
            if (data.ref_id == queryId) {
                fetchScopeDetailsForSocket();
            }
        });

        return () => {
            socket.off('quotePriceUpdated');  // Clean up on component unmount
        };
    }, []);
    useEffect(() => {
        socket.on('tagsUpdated', (data) => {
            if (data.ref_id == queryId) {
                fetchScopeDetailsForSocket();
            }
        });

        return () => {
            socket.off('tagsUpdated');  // Clean up on component unmount
        };
    }, []);

    useEffect(() => {
        socket.on('followersUpdated', (data) => {
            if (data.ref_id == queryId) {
                fetchScopeDetailsForSocket();
            }
        });

        return () => {
            socket.off('followersUpdated');  // Clean up on component unmount
        };
    }, []);

    useEffect(() => {
        socket.on('feasibilityCommentsUpdated', (data) => {
            if (data.ref_id == queryId) {
                fetchScopeDetailsForSocket();
            }
        });

        return () => {
            socket.off('feasibilityCommentsUpdated');  // Clean up on component unmount
        };
    }, []);

    useEffect(() => {
        socket.on('discountReceived', (data) => {
            if (data.quote_id == quotationId) {
                fetchScopeDetailsForSocket();
            }
        });

        return () => {
            socket.off('discountReceived');  // Clean up on component unmount
        };
    }, []);

    useEffect(() => {
        socket.on('demoDone', (data) => {
            if (data.ref_id == queryId) {
                fetchScopeDetailsForSocket();
            }
        });

        return () => {
            socket.off('demoDone');  // Clean up on component unmount
        };
    }, []);

    const formatDate = (timestamp) => {
        const date = new Date(timestamp * 1000); // Convert Unix timestamp to Date object
        return date.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    };

    const getStatusText = (status) => {
        switch (status) {
            case 0:
                return 'Pending';
            case 1:
                return 'Submitted';
            default:
                return 'Unknown';
        }
    };
    const referenceUrl = `https://instacrm.rapidcollaborate.com/managequote/view-askforscope/${scopeDetails?.ref_id}`;

    const toggleAddNewForm = () => setAddNewFormOpen((prev) => !prev);
    const toggleEditForm = (id) => {
        setSelectedQuoteId(id);
        setEditFormOpen((prev) => !prev)
    };

    const toggleFeasHistoyDiv = (assign_id, quote_id) => {
        setQuoteIdForFeasHistory(quote_id);
        setRefIdForFeasHistory(assign_id);
        SetFeasHistoryPanelOpen((prev) => !prev);

    }






    const confirmSubmit = (assign_id, quote_id, user_id) => {
        Swal.fire({
            title: "Add Latest comments",
            text: "Once submitted, this action cannot be undone!",

            showCancelButton: true, // Show cancel button
            confirmButtonText: 'Submit',
            cancelButtonText: 'Cancel',
            preConfirm: () => {
                // Get the value of the final_comments input
                const finalComments = Swal.getPopup().querySelector('#final_comments').value;
                if (!finalComments) {
                    Swal.showValidationMessage("Please enter your comments.");
                }
                return finalComments; // Return the comments to be used in the submitToAdmin function
            },
            html: `
                <div style="text-align: left; width: 100%;">
                    <label for="final_comments" style="font-weight: bold; font-size: 14px; display: block; margin-bottom: 5px;">Enter Comments:</label>
                    <textarea id="final_comments" class="swal2-input" placeholder="Enter your comments..." style="width: 100%; height: 100px; padding: 10px; font-size: 14px; border-radius: 5px; border: 1px solid #ccc; resize: none;"></textarea>
                </div>
            `,
            focusConfirm: false, // Focus on the textarea (not the confirm button)
        }).then((result) => {
            if (result.isConfirmed) {
                const finalComments = result.value; // Get the entered comments
                submitToAdmin(assign_id, quote_id, user_id, finalComments);
            } else {
                Swal.fire("Submission canceled!");
            }
        });
    };

    const submitToAdmin = async (assign_id, quote_id, user_id, finalComments) => {
        const payload = {
            ref_id: assign_id,
            quote_id: quote_id,
            user_id: user_id,
            final_comments: finalComments // Include the comments in the payload
        };

        try {
            const response = await fetch('https://loopback-skci.onrender.com/api/scope/submitFeasRequestToAdmin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();
            if (data.status) {
                toast.success("The quote has been successfully submitted to the admin.");
                setTimeout(() => {
                    fetchScopeDetails();
                }, 1000);

            } else {
                toast.error(data.message || "Something went wrong.");
            }
        } catch (error) {
            console.error("Error submitting to admin:", error);
            toast.error("An unexpected error occurred. Please try again.");
        }
    };



    const toggleHashEditForm = (id, user_id) => {
        setSelectedQuoteId(id);
        setUserIdForTag(user_id);
        setHashEditFormOpen((prev) => !prev)
    };
    const toggleFollowersForm = (id, user_id) => {
        setSelectedQuoteId(id);
        setUserIdForTag(user_id);
        setFollowersFormOpen((prev) => !prev)
    };
    const numberToWords = (num) => {
        const toWords = require("number-to-words");
        return toWords.toWords(Number(num));
    };

    return (
        <div className=" h-full bg-gray-100 z-50 overflow-y-auto mt-2 rounded w-full">
            <div className="flex items-center justify-between bg-blue-400 text-white py-2 px-3">
                <h2 className="text-sx font-semibold " >Ask For Scope </h2>
                <div className='flex items-center'>

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

                    {scopeDetails && scopeDetails.length > 0 ? (
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
                                            <tr
                                                className="cursor-pointer hover:bg-gray-50"
                                            >
                                                <td className="border px-2 py-2 " style={{ fontSize: "11px" }}>
                                                    <p className='flex items-center line-h-in'>
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
                                                                className="inline-block pl-3 pr-2 py-1 f-11 ml-1" // Increased padding for more space
                                                                style={{
                                                                    backgroundColor: '#2B9758FF', // Green color for PTP
                                                                    clipPath: 'polygon(25% 0%, 100% 0, 100% 99%, 25% 100%, 0% 50%)',
                                                                    color: '#ffffff',
                                                                    fontSize: '11px', // Increased font size for better visibility
                                                                    fontWeight: 'bold',
                                                                    lineHeight: '1.3', // Increased line height to make it visually balanced
                                                                }}
                                                            >
                                                                PTP
                                                            </span>
                                                        )}
                                                        {quote.edited == 1 && (
                                                            <span className="text-gray-600 bg-gray-200 rounded-full text-sm ml-2" style={{ fontSize: "11px", padding: "1px 6px" }}>Edited</span>
                                                        )}
                                                        {quote.ownership_transferred == 1 && (
                                                            <div className="relative group">
                                                                <ArrowLeftRight size={24} className="text-yellow-600 bg-yellow-300 border-2 border-yellow-600 p-1 rounded-full ml-1" data-tooltip-id="my-tooltip" data-tooltip-content={`Ownership transferred from ${quote.old_user_name}`} />

                                                            </div>
                                                        )}
                                                        {quote.timeline && (
                                                            <span
                                                                className={`${quote.timeline == 'normal' ? 'text-red-600 bg-red-100' : 'text-blue-600 bg-blue-100'} rounded-full text-sm ml-2 px-1 py-0.5`}
                                                                style={{
                                                                    fontSize: "11px",
                                                                }}
                                                                data-tooltip-id={quote.timeline == 'normal' ? '' : 'my-tooltip'}
                                                                data-tooltip-content={quote.timeline_days + " days"}
                                                            >
                                                                {quote.timeline.charAt(0).toUpperCase() + quote.timeline.slice(1)}
                                                            </span>
                                                        )}
                                                    </p>
                                                </td>
                                                <td className="border px-2 py-2 " style={{ fontSize: "11px" }}>
                                                    <div className="flex items-center">
                                                        {quote.quoteid}
                                                        <button
                                                            onClick={() => {

                                                                navigator.clipboard
                                                                    .writeText(quote.quoteid)
                                                                    .then(() => {
                                                                        toast.success("QuoteID copied to clipboard!");
                                                                    })
                                                                    .catch((err) => {
                                                                        console.error("Failed to copy QuoteID:", err);
                                                                    });
                                                            }}
                                                            className="flex items-center justify-center btn  btn-sm mr-1"
                                                        >
                                                            <Copy size={14} className="text-blue-600" />
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="border px-2 py-2" style={{ fontSize: "11px" }}>{quote.q_type == "old" ? quote.plan : quote.selected_plans ?? null}</td>
                                                <td className="border px-2 py-2" style={{ fontSize: "11px" }}>{quote.service_name || 'N/A'}</td>
                                                <td className="border px-2 py-2" style={{ fontSize: "11px" }}>
                                                    {quote.isfeasability == 1 ? (
                                                        quote.submittedtoadmin == "false" ? (
                                                            quote.feasability_status == "Pending" ? <span className='text-red-600'>Feasabilty Submitted</span> : <span className='text-green-600'>Feasabilty Completed</span>
                                                        ) : (
                                                            quote.feasability_status == "Completed" && quote.quote_status == "1" ? <span className='text-green-700'>Feasabilty Completed and Admin Submitted</span> : <p><span className='text-green-700'>Feasabilty Completed</span> and <span className='text-red-600'>Admin Pending</span></p>

                                                        )
                                                    ) : (
                                                        <span
                                                            className={
                                                                quote.quote_status == 0
                                                                    ? 'badge-danger p-1 f-10 rounded-sm px-2 font-semibold' // Pending - Red
                                                                    : quote.quote_status == 1
                                                                        ? 'badge-success p-1 f-10 rounded-sm px-2 font-semibold' // Submitted - Green
                                                                        : quote.quote_status == 2
                                                                            ? 'badge-warning p-1 f-10 rounded-sm px-2 font-semibold' // Discount Requested - Yellow
                                                                            : 'badge-secondary p-1 f-10 rounded-sm px-2 font-semibold' // Default - Gray for Unknown
                                                            }
                                                        >
                                                            {
                                                                quote.quote_status == 0 && quote.submittedtoadmin == 'false'
                                                                    ? 'Pending at User'
                                                                    : quote.quote_status == 0 && quote.submittedtoadmin == 'true'
                                                                        ? 'Pending at Admin'
                                                                        : quote.quote_status == 1
                                                                            ? 'Submitted'
                                                                            : quote.quote_status == 2
                                                                                ? 'Discount Requested'
                                                                                : 'Unknown'
                                                            }
                                                        </span>
                                                    )}
                                                </td>

                                                <td className="border px-2 py-2 flex items-center" style={{ fontSize: "11px" }}>
                                                    {/* Up/Down Arrow Button */}
                                                    <button
                                                        onClick={() => toggleRow(index)}
                                                        className="flex items-center justify-center btn btn-primary btn-sm mr-1"
                                                    >
                                                        {expandedRowIndex == index ? <ArrowUp size={14} className='text-white' /> : <ArrowDown size={20} className='text-white' />}
                                                    </button>


                                                </td>
                                            </tr>
                                            {/* Accordion */}
                                            {expandedRowIndex == index && (

                                                <tr>
                                                    <td colSpan={7}>
                                                        <div className="mx-2 mt-2 mb-0 bg-gray-100 px-3 pt-3 pb-0">
                                                            <div className="">
                                                                <button
                                                                    onClick={() => handleTabButtonClick("scope")}
                                                                    className={`px-2 py-1 mr-1 inline-flex items-center f-12 ${scopeTabVisible
                                                                        ? "btn-info focus-outline-none"
                                                                        : "btn-light"
                                                                        } btn btn-sm  focus:outline-none`}
                                                                >
                                                                    Scope Details {scopeTabVisible ? <Eye size={20} className="badge badge-dark ml-2" /> : <EyeClosed size={20} className="badge badge-dark ml-2" />}
                                                                </button>
                                                                <button
                                                                    onClick={() => handleTabButtonClick("chat")}
                                                                    className={`px-2 py-1 mr-1 inline-flex items-center f-12 ${chatTabVisible
                                                                        ? "btn-info focus-outline-none"
                                                                        : "btn-light"
                                                                        } btn btn-sm`}
                                                                >
                                                                    Communication Hub {chatTabVisible ? <Eye size={20} className="badge badge-dark ml-2" /> : <EyeClosed size={20} className="badge badge-dark ml-2" />}
                                                                </button>
                                                                <button
                                                                    disabled={quote.isfeasability == 0}
                                                                    onClick={() => handleTabButtonClick("feas")}
                                                                    className={`px-2 py-1 mr-1 f-12 inline-flex items-center ${feasTabVisible
                                                                        ? "btn-info focus-outline-none"
                                                                        : "btn-light"
                                                                        } btn btn-sm`}
                                                                >
                                                                    Feasibility  {feasTabVisible ? <Eye size={20} className="badge badge-dark ml-2" /> : <EyeClosed size={20} className="badge badge-dark ml-2" />}
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
                                                            </div>
                                                        </div>
                                                        <div className="mx-2 mb-0 bg-gray-100 pt-3 pb-3 pl-0 pr-2 row">
                                                            {scopeTabVisible && (
                                                                <div className={`${fullScreenTab == "scope" ? "custom-modal" : colClass}`}>
                                                                    <div className={`${fullScreenTab == "scope" ? "custom-modal-content" : ""}`}>
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
                                                                                queryInfo={queryInfo}
                                                                                tlType={null}
                                                                                canEdit={false}
                                                                                canApprove={false}
                                                                            />
                                                                        ) : (
                                                                            <div className={`  pl-0`}>
                                                                                <div className="py-2 px-2 flex items-center justify-between bg-blue-100">
                                                                                    <h3 className=""><strong>Scope Details</strong></h3>
                                                                                    <button className="">
                                                                                        {fullScreenTab == "scope" ? (<Minimize2 size={23} onClick={() => { handlefullScreenBtnClick(null) }} className="btn btn-sm btn-danger flex items-center p-1" />) : (<Expand size={20} onClick={() => { handlefullScreenBtnClick("scope") }} className="btn btn-sm btn-light flex items-center p-1" />)}
                                                                                    </button>
                                                                                </div>
                                                                                <div className="bg-white">
                                                                                    <div className="overscroll-modal">
                                                                                        <div className="px-0">
                                                                                            <div className="row">
                                                                                                <div className='col-md-12'>
                                                                                                    <p className='mb-3'>
                                                                                                        <div>
                                                                                                            <strong>Ref No</strong>
                                                                                                        </div>
                                                                                                        {quote.assign_id}
                                                                                                        {quote.ptp === "Yes" && (
                                                                                                            <span
                                                                                                                className="inline-block pl-3 pr-2 py-1 f-10 ml-1" // Increased padding for more space
                                                                                                                style={{
                                                                                                                    backgroundColor: '#2B9758FF', // Green color for PTP
                                                                                                                    clipPath: 'polygon(25% 0%, 100% 0, 100% 99%, 25% 100%, 0% 50%)',
                                                                                                                    color: '#ffffff',
                                                                                                                    fontSize: '14px', // Increased font size for better visibility
                                                                                                                    fontWeight: 'bold',
                                                                                                                    lineHeight: '1.5', // Increased line height to make it visually balanced
                                                                                                                }}
                                                                                                            >
                                                                                                                PTP
                                                                                                            </span>
                                                                                                        )}

                                                                                                        {quote.edited == 1 && (
                                                                                                            <span
                                                                                                                className="edited-badge ml-2"
                                                                                                                style={{
                                                                                                                    fontSize: "11px",
                                                                                                                    padding: "2px 8px",
                                                                                                                    backgroundColor: "#f0f0f0",
                                                                                                                    color: "#666",
                                                                                                                    borderRadius: "5px",
                                                                                                                }}
                                                                                                            >
                                                                                                                Edited
                                                                                                            </span>
                                                                                                        )}
                                                                                                    </p>

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

                                                                                                    {quote.ptp != null && (
                                                                                                        <div className="bg-white mb-3 rounded-lg p-3 border border-gray-300">
                                                                                                            <h3 className="text-md font-semibold mb-2 text-gray-700">PTP Details</h3>
                                                                                                            <div className="space-y-1 text-sm text-gray-600">
                                                                                                                <p className="flex items-center gap-1">
                                                                                                                    <strong>PTP:</strong>
                                                                                                                    {quote.ptp === "Yes" ? (
                                                                                                                        <CheckCircle className="text-green-500 w-4 h-4" />
                                                                                                                    ) : (
                                                                                                                        <XCircle className="text-red-500 w-4 h-4" />
                                                                                                                    )}
                                                                                                                </p>
                                                                                                                {quote.ptp_amount && quote.ptp_amount != 0 && (
                                                                                                                    <p>
                                                                                                                        <strong>PTP Amount:</strong> {quote.ptp_amount}
                                                                                                                    </p>
                                                                                                                )}
                                                                                                                {quote.ptp === "Yes" && quote.ptp_comments !== "" && (
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
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    )}

                                                                                                    {quote.service_name && quote.plan && (
                                                                                                        <>
                                                                                                            <p className='mb-3'><div><strong>Service Required</strong> </div>{quote.service_name}</p>
                                                                                                            {quote.old_plan && (
                                                                                                                <p className='text-gray-500'><div><strong>Old Plan</strong></div> {quote.old_plan}</p>
                                                                                                            )}
                                                                                                            <p className='mb-3'><strong>Plan:</strong> {quote.plan}</p>
                                                                                                        </>
                                                                                                    )}
                                                                                                    {quote.subject_area && (
                                                                                                        <>
                                                                                                            <p className='mb-3'><div><strong>Subject Area</strong></div> {quote.subject_area}</p>
                                                                                                            {quote.subject_area == "Other" && (
                                                                                                                <p className='text-gray-500 mb-3'><strong>Other Subject Area name</strong> {quote.other_subject_area}</p>
                                                                                                            )}
                                                                                                        </>
                                                                                                    )}
                                                                                                </div>
                                                                                            </div>
                                                                                            <div className="row">
                                                                                                <div className="col-md-12">
                                                                                                    <p className=" mb-2">
                                                                                                        <strong>Plan Description</strong>
                                                                                                    </p>
                                                                                                </div>
                                                                                                {quote.plan_comments && typeof quote.plan_comments === "string" && quote.plan && (
                                                                                                    Object.entries(JSON.parse(quote.plan_comments))
                                                                                                        .filter(([plan]) => quote.plan.split(',').includes(plan)) // Filter based on the updated plan list
                                                                                                        .map(([plan, comment], index) => (
                                                                                                            <div key={index} className={planColClass}>
                                                                                                                <div className="border p-2 mb-3">
                                                                                                                    <p>
                                                                                                                        <strong>{plan}</strong>
                                                                                                                    </p>
                                                                                                                    <div dangerouslySetInnerHTML={{ __html: comment }} />

                                                                                                                    {/* Word Count Section */}
                                                                                                                    {quote.word_counts && typeof quote.word_counts === "string" && (
                                                                                                                        Object.entries(JSON.parse(quote.word_counts))
                                                                                                                            .filter(([planWordCount]) => quote.plan.split(',').includes(planWordCount)) // Filter word count based on the plan list
                                                                                                                            .map(([planWordCount, wordcount], wcIndex) => (
                                                                                                                                plan === planWordCount && (
                                                                                                                                    <div key={wcIndex} className=" mt-2">
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
                                                                                                                                            <p className="mb-1 text-black">
                                                                                                                                                <div>Word Count:</div>
                                                                                                                                            </p>
                                                                                                                                            {planWordCount}:{" "}
                                                                                                                                            <span style={{ color: "#28a745" }}>
                                                                                                                                                {wordcount} words
                                                                                                                                            </span>
                                                                                                                                            <br />
                                                                                                                                            <span style={{ color: "gray" }}>
                                                                                                                                                {capitalizeFirstLetter(numberToWords(wordcount))} words
                                                                                                                                            </span>
                                                                                                                                        </p>
                                                                                                                                    </div>
                                                                                                                                )
                                                                                                                            ))
                                                                                                                    )}
                                                                                                                    {plan === "Basic" && quote.basic_edited_time && (
                                                                                                                        <p className="text-gray-500 mt-2 tenpx">
                                                                                                                            {new Date(quote.basic_edited_time).toLocaleDateString('en-US', {
                                                                                                                                day: 'numeric',
                                                                                                                                month: 'short',
                                                                                                                                year: 'numeric',
                                                                                                                                hour: 'numeric',
                                                                                                                                minute: '2-digit',
                                                                                                                                hour12: true
                                                                                                                            }).replace(',', ',')}
                                                                                                                        </p>
                                                                                                                    )}
                                                                                                                    {plan === "Standard" && quote.standard_edited_time && (
                                                                                                                        <p className="text-gray-500 mt-2 tenpx">
                                                                                                                            {new Date(quote.standard_edited_time).toLocaleDateString('en-US', {
                                                                                                                                day: 'numeric',
                                                                                                                                month: 'short',
                                                                                                                                year: 'numeric',
                                                                                                                                hour: 'numeric',
                                                                                                                                minute: '2-digit',
                                                                                                                                hour12: true
                                                                                                                            }).replace(',', ',')}
                                                                                                                        </p>
                                                                                                                    )}
                                                                                                                    {plan === "Advanced" && quote.advanced_edited_time && (
                                                                                                                        <p className="text-gray-500 mt-2 tenpx">
                                                                                                                            {new Date(quote.advanced_edited_time).toLocaleDateString('en-US', {
                                                                                                                                day: 'numeric',
                                                                                                                                month: 'short',
                                                                                                                                year: 'numeric',
                                                                                                                                hour: 'numeric',
                                                                                                                                minute: '2-digit',
                                                                                                                                hour12: true
                                                                                                                            }).replace(',', ',')}
                                                                                                                        </p>
                                                                                                                    )}
                                                                                                                </div>
                                                                                                            </div>
                                                                                                        ))
                                                                                                )}
                                                                                                {quote.client_academic_level && quote.results_section && (
                                                                                                    <div class="flex gap-4 mb-3">
                                                                                                        <div class="flex items-center px-1 py-1 bg-blue-100 border-l-4 border-blue-500 text-blue-900 shadow-md rounded-lg"
                                                                                                            x-show="quote.client_academic_level">
                                                                                                            <div>
                                                                                                                <img src={academic} className='h-5 w-5' />
                                                                                                            </div>
                                                                                                            <div className='px-2'>
                                                                                                                <h3 class="text-md font-semibold">Academic Level</h3>
                                                                                                                <p class="text-sm">{quote.client_academic_level}</p>
                                                                                                            </div>
                                                                                                        </div>

                                                                                                        <div class="flex items-center px-1 py-1 bg-green-100 border-l-4 border-green-500 text-green-900 shadow-md rounded-lg"
                                                                                                            x-show="quote.results_section">
                                                                                                            <div>
                                                                                                                <img src={experiment} className='h-5 w-5' />
                                                                                                            </div>
                                                                                                            <div className='px-2'>
                                                                                                                <h3 class="text-md font-semibold">Results Section</h3>
                                                                                                                <p class="text-sm">{quote.results_section}</p>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                )}
                                                                                                <div className='col-md-12'>
                                                                                                    <div className='mb-0 row px-2 pb-3 space-y-4'>
                                                                                                        {quote.comments && quote.comments != "" && quote.comments != null && (
                                                                                                            <p className='mb-2'><strong style={{}} className='mb-2 d-block'>Additional Comments</strong>  <span dangerouslySetInnerHTML={{ __html: quote.comments }} /></p>
                                                                                                        )}
                                                                                                        {quote.final_comments != null && (
                                                                                                            <div>
                                                                                                                <p className='mb-2'><div><strong>Final Comments</strong></div> {quote.final_comments}</p>
                                                                                                            </div>
                                                                                                        )}


                                                                                                        {quote.relevant_file && quote.relevant_file.length > 0 && (
                                                                                                            <div className='mb-2'>
                                                                                                                <div><strong>Relevant Files</strong></div>
                                                                                                                <div className="space-y-0 mt-2">
                                                                                                                    {quote.relevant_file.map((file, fileIndex) => (
                                                                                                                        <div key={fileIndex}>
                                                                                                                            <a
                                                                                                                                href={`https://apacvault.com/public/QuotationFolder/${file.file_path}`}
                                                                                                                                download
                                                                                                                                target='_blank'
                                                                                                                                className="text-blue-500"
                                                                                                                            >
                                                                                                                                {file.filename}
                                                                                                                            </a>
                                                                                                                        </div>
                                                                                                                    ))}
                                                                                                                </div>
                                                                                                            </div>
                                                                                                        )}

                                                                                                        {quote.demodone != 0 && (
                                                                                                            <>
                                                                                                                <p className='flex items-center '><p className='mr-3'> <div><strong>Demo Id  </strong></div> {quote.demo_id}</p><span className='badge-success px-2 py-0 ml-3 rounded-sm text-white-900 font-semibold flex items-center f-12'>Demo Completed <CheckCircle2 size={15} className='ml-2' /> </span> </p>
                                                                                                            </>
                                                                                                        )}
                                                                                                        {quote.demo_duration && (
                                                                                                            <>
                                                                                                                <p className="mb-3">

                                                                                                                    {" "}
                                                                                                                    <div>
                                                                                                                        <strong>
                                                                                                                            Demo Duration {" "}
                                                                                                                        </strong>{" "}
                                                                                                                    </div>
                                                                                                                    <div className='flex items-center'>
                                                                                                                        <div className='line-h-in'>{quote.demo_duration}</div>

                                                                                                                    </div>
                                                                                                                </p>
                                                                                                            </>
                                                                                                        )}
                                                                                                        {quote.demo_date && (
                                                                                                            <>
                                                                                                                <p className="mb-3">

                                                                                                                    {" "}
                                                                                                                    <div>
                                                                                                                        <strong>
                                                                                                                            Demo Date {" "}
                                                                                                                        </strong>{" "}
                                                                                                                    </div>
                                                                                                                    <div className='flex items-center'>
                                                                                                                        <div className='line-h-in'>
                                                                                                                            {new Date(quote.demo_date).toLocaleDateString('en-GB', {
                                                                                                                                day: '2-digit',
                                                                                                                                month: 'short',
                                                                                                                                year: 'numeric'
                                                                                                                            })}
                                                                                                                        </div>

                                                                                                                    </div>
                                                                                                                </p>
                                                                                                            </>
                                                                                                        )}
                                                                                                        {quote.timeline ? (
                                                                                                            <div className="mb-0  mt-0 row p-1 space-y-1  rounded">
                                                                                                                <p className={`font-medium  ${quote.timeline == "urgent" ? "text-red-500" : "text-blue-500"}`}>Timeline : {quote.timeline.charAt(0).toUpperCase() + quote.timeline.slice(1)}</p>
                                                                                                                {quote.timeline && quote.timeline == 'urgent' && (
                                                                                                                    <span>
                                                                                                                        Timeline Duration : {quote.timeline_days} days
                                                                                                                    </span>
                                                                                                                )}
                                                                                                            </div>
                                                                                                        ) : null}
                                                                                                        {quote.quote_status != 0 && quote.quote_price && quote.plan && (
                                                                                                            <>
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
                                                                                                                                    <strong>Old Plan Price</strong>
                                                                                                                                </td>
                                                                                                                                <td className="border px-1 py-2">
                                                                                                                                    {(() => {
                                                                                                                                        const prices = quote.quote_price.split(",");
                                                                                                                                        const plans = quote.old_plan.split(",");
                                                                                                                                        return plans.map((plan, index) => (
                                                                                                                                            <span key={index} className="line-through bg-gray-100 px-2 py-1 rounded mr-2 text-gray-600">
                                                                                                                                                {plan}: {quote.currency == "Other" ? quote.other_currency : quote.currency} {prices[index] ? prices[index] : 0}
                                                                                                                                                {quote.mp_price === plan && " (MP Price)"}
                                                                                                                                            </span>
                                                                                                                                        ));
                                                                                                                                    })()}
                                                                                                                                </td>
                                                                                                                            </tr>
                                                                                                                        )}

                                                                                                                        {/* Current Quote Price Row */}
                                                                                                                        {quote.quote_status != 2 && (
                                                                                                                            <tr className="border-b">
                                                                                                                                <td className="border px-1 py-2">
                                                                                                                                    <strong>Quote Price</strong>
                                                                                                                                </td>
                                                                                                                                <td className="border px-1 py-2">
                                                                                                                                    {(() => {
                                                                                                                                        const prices = quote.quote_price.split(",");
                                                                                                                                        const plans = quote.plan.split(",");
                                                                                                                                        return plans.map((plan, index) => (
                                                                                                                                            <span
                                                                                                                                                key={index}
                                                                                                                                                className={`${quote.discount_price != null ? 'line-through' : ''} bg-red-100 px-2 py-1 rounded mr-2`}
                                                                                                                                            >
                                                                                                                                                {plan}: {quote.currency == "Other" ? quote.other_currency : quote.currency} {prices[index] ? prices[index] : 0}
                                                                                                                                                {quote.mp_price === plan && " (MP Price)"}
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
                                                                                                                                <td className="border px-1 py-2">
                                                                                                                                    {(() => {
                                                                                                                                        const prices = quote.discount_price.split(",");
                                                                                                                                        const plans = quote.plan.split(",");
                                                                                                                                        return plans.map((plan, index) => (
                                                                                                                                            <span key={index} className="silver px-1 py-1 f-12 rounded mr-1">
                                                                                                                                                {plan}: {quote.currency == "Other" ? quote.other_currency : quote.currency} {prices[index] ?? 0}
                                                                                                                                                {quote.mp_price === plan && " (MP Price)"}
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
                                                                                                                                <td className="border px-1 py-2">
                                                                                                                                    {(() => {
                                                                                                                                        const prices = quote.final_price.split(",");
                                                                                                                                        const plans = quote.plan.split(",");
                                                                                                                                        return plans.map((plan, index) => (
                                                                                                                                            <span key={index} className="gold px-1 py-1 f-12 rounded mr-1">
                                                                                                                                                {plan}: {quote.currency == "Other" ? quote.other_currency : quote.currency} {prices[index]}
                                                                                                                                            </span>
                                                                                                                                        ));
                                                                                                                                    })()}
                                                                                                                                </td>
                                                                                                                            </tr>
                                                                                                                        )}
                                                                                                                    </tbody>
                                                                                                                </table>
                                                                                                                {quote.user_comments && (
                                                                                                                    <p><div><strong style={{ textDecoration: "underline" }}>Admin Comments</strong></div> {quote.user_comments}</p>
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
                                                                                                            </>
                                                                                                        )}


                                                                                                        {assignQuoteInfo && assignQuoteInfo != false && (
                                                                                                            <p><div><strong>Assigned To</strong></div> {assignQuoteInfo.name}</p>
                                                                                                        )}
                                                                                                    </div>




                                                                                                </div>
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
                                                                <div className={`${fullScreenTab == "chat" ? "custom-modal" : colClass} p-0`}>
                                                                    <div className={`${fullScreenTab == "chat" ? "custom-modal-content" : ""}`}>

                                                                        <div className={`p-0 `}>
                                                                            <Chat
                                                                                quoteId={quote.quoteid}
                                                                                refId={quote.assign_id}
                                                                                status={quote.quote_status}
                                                                                submittedToAdmin={quote.submittedtoadmin}
                                                                                finalFunction={fetchScopeDetails}
                                                                                allDetails={quote}
                                                                                finalfunctionforsocket={fetchScopeDetailsForSocket}
                                                                                handlefullScreenBtnClick={handlefullScreenBtnClick}
                                                                                chatTabVisible={chatTabVisible}
                                                                                fullScreenTab={fullScreenTab}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                            {feasTabVisible && quote.isfeasability == 1 && (
                                                                <div className={`${fullScreenTab == "feas" ? "custom-modal" : colClass}`}>
                                                                    <div className={`${fullScreenTab == "feas" ? "custom-modal-content" : ""}`}>
                                                                        <div className={` pr-0`}>
                                                                            <div className="bg-white">
                                                                                <>
                                                                                    {quote.isfeasability == 1 && (
                                                                                        <>
                                                                                            <div className="py-2 px-2 flex items-center justify-between bg-blue-100">
                                                                                                <h3 className=""><strong>Feasibility</strong></h3>
                                                                                                <div className='flex items-center'>
                                                                                                    <button className="">
                                                                                                        {fullScreenTab == "feas" ? (<Minimize2 size={23} onClick={() => { handlefullScreenBtnClick(null) }} className="btn btn-sm btn-light flex items-center p-1" />) : (<Expand size={20} onClick={() => { handlefullScreenBtnClick("feas") }} className="btn btn-sm btn-light flex items-center p-1" />)}
                                                                                                    </button>
                                                                                                </div>
                                                                                            </div>
                                                                                            {quote.feasability_status ==
                                                                                                "Completed" && (
                                                                                                    <>
                                                                                                        <div className='px-3 pt-3 pb-0'>
                                                                                                            <p
                                                                                                                style={{
                                                                                                                    textDecoration: "italic",
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
                                                                                                                <p className="flex items-center f-12 mt-2">
                                                                                                                    Feasibility Attachment : {" "}
                                                                                                                    <a
                                                                                                                        href={
                                                                                                                            "https://apacvault.com/public/feasabilityFiles/" +
                                                                                                                            quote.feas_file_name
                                                                                                                        }
                                                                                                                        target="_blank"
                                                                                                                        className="text-blue-600 flex items-center ml-2"
                                                                                                                    >
                                                                                                                        <Paperclip size={13} /> View File
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
                                                                                        <div className='flex items-center'>

                                                                                            <button className="">
                                                                                                {fullScreenTab == "file" ? (<Minimize2 size={23} onClick={() => { handlefullScreenBtnClick(null) }} className="btn btn-sm btn-light flex items-center p-1" />) : (<Expand size={20} onClick={() => { handlefullScreenBtnClick("file") }} className="btn btn-sm btn-light flex items-center p-1" />)}
                                                                                            </button>
                                                                                        </div>
                                                                                    </div>

                                                                                    <AttachedFiles ref_id={quote.assign_id} relevant_file={quote.relevant_file} quote={quote} queryInfo={queryInfo} />

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
                    ) : (
                        <div className="flex justify-center items-center">
                            <p className='flex items-center justify-between'> <Info className='mr-2' /> No Previous Requests </p>
                        </div>
                    )}
                    <AnimatePresence>
                        {addNewFormOpen && (
                            <SubmitRequestQuote refId={queryId} onClose={toggleAddNewForm} after={fetchScopeDetails} />
                        )}
                        {editFormOpen && (
                            <EditRequestForm quoteId={selectedQuoteId} refId={queryId} onClose={() => { setEditFormOpen(!editFormOpen) }} after={fetchScopeDetails} />
                        )}
                        {historyPanelOpen && (
                            <HistorySideBar quoteId={quoteIdForHistory} refId={queryId} onClose={() => { SetHistoryPanelOpen(!historyPanelOpen) }} />
                        )}
                        {feasHistoryPanelOpen && (
                            <FeasHistorySideBar quoteId={quoteIdForFeasHistory} refId={refIdForFeasHistory} onClose={() => { SetFeasHistoryPanelOpen(!feasHistoryPanelOpen) }} />
                        )}
                        {hashEditFormOpen && (
                            <AddTags quoteId={selectedQuoteId} refId={queryId} userId={userIdForTag} onClose={() => { setHashEditFormOpen(!hashEditFormOpen) }} after={fetchScopeDetails} notification="no" />
                        )}
                        {followersFormOpen && (
                            <AddFollowers quoteId={selectedQuoteId} refId={queryId} onClose={() => { setFollowersFormOpen(!followersFormOpen) }} after={fetchScopeDetails} />
                        )}
                    </AnimatePresence>
                    <Tooltip id="my-tooltip" />

                </div>
            )}

        </div>
    );
};

export default AskForScopeFollower;