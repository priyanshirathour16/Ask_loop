import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import CustomLoader from '../CustomLoader';
import { Chat } from './Chat';
import AskPtp from './AskPtp';
import DemoDone from './DemoDone';
import { CheckCircle2, Info, PlusCircle, RefreshCcw, ChevronUp, ChevronDown, ArrowDown, ArrowUp, Edit, Settings2, History, Hash, FileDownIcon, Paperclip, UserRoundPlus, Share, Share2, CheckCircle, XCircle } from 'lucide-react';
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

const AskForScopeTransfer = ({ queryId, userType, quotationId, userIdDefined, clientName }) => {
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
    const [expandedRowIndex, setExpandedRowIndex] = useState(null);
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

    const toggleHistoryDiv = ($id) => {
        setQuoteIdForHistory($id);
        SetHistoryPanelOpen(true);
    }

    const toggleRow = (index) => {
        setExpandedRowIndex(expandedRowIndex == index ? null : index);
    };


    const userObject = JSON.parse(userData);
    const loopUserObject = JSON.parse(loopuserData);

    const thisUserId = (userIdDefined && userIdDefined != null && userIdDefined != "") ? userIdDefined : loopUserObject.id


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
    const fetchScopeDetailsForScoket = async () => {
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
        }
    };


    useEffect(() => {
        if (queryId) {
            fetchScopeDetails(); // Fetch the scope details when the component mounts
        }
    }, [queryId]);

    useEffect(() => {
        socket.on('quoteReceived', (data) => {
            if (data.ref_id == queryId) {

                fetchScopeDetailsForScoket();
            }
        });

        return () => {
            socket.off('quoteReceived');  // Clean up on component unmount
        };
    }, []);

    useEffect(() => {
        socket.on('feasabilityDone', (data) => {
            if (data.ref_id == queryId) {

                fetchScopeDetailsForScoket();
            }
        });

        return () => {
            socket.off('feasabilityDone');  // Clean up on component unmount
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

    const submitToAdmin = async (assign_id, quote_id, user_id) => {
        const payload = {
            ref_id: assign_id,
            quote_id: quote_id,
            user_id: user_id,

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
                socket.emit("updateRequest", {
                    quote_id: quote_id,
                    ref_id: assign_id,
                    user_name: loopUserObject.fld_first_name + " " + loopUserObject.fld_last_name
                })
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
        <div className=" h-full bg-gray-100 shadow-lg z-50 overflow-y-auto mt-2 rounded w-full">
            <div className="flex items-center justify-between bg-blue-400 text-white py-2 px-2">
                <h2 className="text-xl font-semibold " >Previous Requests</h2>
                <div className='flex items-center'>

                    <RefreshCcw size={20}
                        data-tooltip-id="my-tooltip"
                        data-tooltip-content="Refresh"
                        onClick={fetchScopeDetails} className='cursor-pointer' />
                </div>
            </div>

            {loading ? (
                <ScopeLoader /> // A loader component when data is being fetched
            ) : (
                <div className="bg-white p-6 m-2 shadow rounded-md space-y-4">
                    {errorMessage && <p className="text-red-600">{errorMessage}</p>}

                    {scopeDetails && scopeDetails.length > 0 ? (
                        <div>
                            {/* Table Header */}
                            <table className="w-full border-collapse border border-gray-200 f-14">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="border px-2 py-2 text-left">Ref No.</th>
                                        <th className="border px-2 py-2 text-left">Quote Id.</th>
                                        <th className="border px-2 py-2 text-left">User Name</th>
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
                                                <td className="border px-2 py-2 ">
                                                    <p className='flex items-center'>
                                                        {quote.assign_id}
                                                        {quote.ptp == "Yes" && (
                                                            <span
                                                                className="inline-block pl-3 pr-2 py-1 f-10 ml-1" // Increased padding for more space
                                                                style={{
                                                                    backgroundColor: '#2B9758FF', // Green color for PTP
                                                                    clipPath: 'polygon(25% 0%, 100% 0, 100% 99%, 25% 100%, 0% 50%)',
                                                                    color: '#ffffff',
                                                                    fontSize: '14px', // Increased font size for better visibility
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
                                                        {quote.timeline && (
                                                            <span
                                                                className={`${quote.timeline == 'normal' ? 'text-red-600 bg-red-100' : 'text-blue-600 bg-blue-100'} rounded-full text-sm ml-2 px-1 py-0.5`}
                                                                style={{
                                                                    fontSize: "11px",
                                                                }}
                                                                data-tooltip-id={quote.timeline == 'normal' ? '' : 'my-tooltip'}
                                                                data-tooltip-content={quote.timeline_days + " days"}
                                                            >
                                                                {quote.timeline}
                                                            </span>
                                                        )}

                                                    </p>
                                                </td>
                                                <td className="border px-2 py-2" style={{ fontSize: "11px" }}>{quote.quoteid}</td>
                                                <td className="border px-2 py-2" style={{ fontSize: "11px" }}>{quote.fld_first_name + " " + quote.fld_last_name}</td>
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

                                                <td className=" px-2 py-2 flex items-center" style={{ fontSize: "11px" }}>
                                                    {/* Up/Down Arrow Button */}
                                                    <button
                                                        onClick={() => toggleRow(index)}
                                                        className="flex items-center justify-center p-2"
                                                    >
                                                        {expandedRowIndex == index ? <ArrowUp size={20} className='bg-blue-500 p-1 rounded-full text-white' /> : <ArrowDown size={20} className='bg-blue-500 p-1 rounded-full text-white' />}
                                                    </button>


                                                </td>
                                            </tr>
                                            {/* Accordion */}
                                            {expandedRowIndex == index && (

                                                <tr>
                                                    <td colSpan={7} className="border px-4 py-4 bg-gray-50">
                                                        <div className="space-y-4 text-sm">
                                                            <p className='d-flex align-items-center'>
                                                                <strong>Ref No:</strong> {quote.assign_id}
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
                                                                    <span className="text-gray-600 bg-gray-200 rounded-full text-sm ml-2" style={{ fontSize: "11px", padding: "1px 6px" }}>Edited</span>
                                                                )}
                                                            </p>

                                                            {quote.tag_names && (
                                                                <p>
                                                                    <strong>Tags:</strong>
                                                                    {quote.tag_names.split(',').map((tag, index) => (
                                                                        <span
                                                                            key={index}
                                                                            className="text-blue-500 p-1 rounded-full text-sm font-medium inline-block ml-1"
                                                                        >
                                                                            #{tag.trim()}
                                                                        </span>
                                                                    ))}
                                                                </p>
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
                                                                                    href={`https://apacvault.com/public/${quote.ptp_file}`}
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
                                                                    <p><strong>Service Required:</strong> {quote.service_name}</p>
                                                                    {quote.old_plan && (
                                                                        <p className='text-gray-500'><strong>Old Plan:</strong> {quote.old_plan}</p>
                                                                    )}
                                                                    <p><strong>Plan:</strong> {quote.plan}</p>
                                                                </>
                                                            )}
                                                            {quote.subject_area && (
                                                                <>
                                                                    <p><strong>Subject Area:</strong> {quote.subject_area}</p>
                                                                    {quote.subject_area == "Other" && (
                                                                        <p className='text-gray-500'><strong>Other Subject Area name:</strong> {quote.other_subject_area}</p>
                                                                    )}
                                                                </>
                                                            )}


                                                            {quote.plan_comments && quote.plan_comments !== "" && quote.plan_comments !== null && (
                                                                <>
                                                                    <div>
                                                                        <p className="mb-2">
                                                                            <strong style={{ textDecoration: "underline" }}>Plan Description:</strong>
                                                                        </p>
                                                                        <div
                                                                            className="row"
                                                                            style={{
                                                                                wordWrap: "break-word", // Ensures text wraps within the container
                                                                                overflowWrap: "break-word", // Handles long unbreakable words
                                                                                wordBreak: "break-word", // Forces breaking of long words
                                                                            }}
                                                                        >
                                                                            {quote.plan_comments && typeof quote.plan_comments === "string" && quote.plan && (
                                                                                Object.entries(JSON.parse(quote.plan_comments))
                                                                                    .filter(([plan]) => quote.plan.split(',').includes(plan)) // Filter based on the updated plan list
                                                                                    .map(([plan, comment], index) => (
                                                                                        <div key={index} className="col-md-4 mb-3">
                                                                                            <p>
                                                                                                <strong>{plan}:</strong>
                                                                                            </p>
                                                                                            <div dangerouslySetInnerHTML={{ __html: comment }} />
                                                                                        </div>
                                                                                    ))
                                                                            )}
                                                                        </div>
                                                                    </div>

                                                                    {quote.word_counts && quote.word_counts != null && (
                                                                        <div>
                                                                            <p className="mb-2"><strong style={{ textDecoration: "underline" }}>Word Count:</strong></p>
                                                                            <div className="row" style={{
                                                                                wordWrap: "break-word",
                                                                                overflowWrap: "break-word",
                                                                                wordBreak: "break-word",
                                                                            }}>
                                                                                {quote.word_counts && typeof quote.word_counts === "string" && quote.plan && (
                                                                                    Object.entries(JSON.parse(quote.word_counts))
                                                                                        .filter(([plan]) => quote.plan.split(',').includes(plan)) // Filter based on the updated plan list
                                                                                        .map(([plan, wordcount], index) => (
                                                                                            <div key={index} className="col-md-4 mb-3">
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
                                                                                                    {plan}: <span style={{ color: "#28a745" }}>{wordcount} words</span>
                                                                                                    <br />
                                                                                                    <span style={{ color: "gray" }}>{numberToWords(wordcount)} words</span>
                                                                                                </p>
                                                                                            </div>
                                                                                        ))
                                                                                )}

                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </>
                                                            )}


                                                            {quote.comments && quote.comments != "" && quote.comments != null && (
                                                                <p><strong style={{ textDecoration: "underline" }}>Description:</strong>  <span dangerouslySetInnerHTML={{ __html: quote.comments }} /></p>
                                                            )}
                                                            {quote.final_comments != null && (
                                                                <div>
                                                                    <p><strong>Final Comments:</strong> {quote.final_comments}</p>
                                                                </div>
                                                            )}

                                                            {quote.relevant_file && quote.relevant_file.length > 0 && (
                                                                <div>
                                                                    <strong>Relevant Files:</strong>
                                                                    <div className="space-y-2 mt-2">
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
                                                                    <p className='flex items-center '><p className='mr-3'> <strong>Demo Id : </strong> {quote.demo_id}</p><span className='badge-success px-2 py-0 ml-3 rounded-sm text-white-900 font-semibold flex items-center f-12'>Demo Completed <CheckCircle2 size={15} className='ml-2' /> </span> </p>
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
                                                            {quote.quote_status != 0 && quote.quote_price && quote.plan && (
                                                                <>
                                                                    {quote.old_plan && (
                                                                        <p className='text-gray-600'>
                                                                            <strong>Quote Price For Old Plan:</strong>{' '}
                                                                            {(() => {
                                                                                const prices = quote.quote_price.split(','); // Split quote_price into an array
                                                                                const plans = quote.old_plan.split(','); // Split plan into an array
                                                                                return plans.map((plan, index) => (
                                                                                    <span key={index} className="line-through bg-gray-200 p-1 mx-1 rounded border border-gray-500 f-12 mb-2 d-inline-block">
                                                                                        <strong>{plan} </strong>: {quote.currency == "Other" ? quote.other_currency : quote.currency} {prices[index] ? prices[index] : 0}
                                                                                        {index < plans.length - 1 && ', '}
                                                                                        {quote.mp_price === plan && " (MP Price)"}
                                                                                    </span>
                                                                                ));
                                                                            })()}
                                                                        </p>

                                                                    )}
                                                                    {quote.quote_status != 2 && (
                                                                        <p>
                                                                            <strong>Quote Price:</strong>{' '}
                                                                            {(() => {
                                                                                const prices = quote.quote_price.split(','); // Split quote_price into an array
                                                                                const plans = quote.plan.split(','); // Split plan into an array
                                                                                return plans.map((plan, index) => (
                                                                                    <span key={index} className={`${quote.discount_price != null ? "line-through bg-red-200 p-1 rounded mr-1 f-12" : ""}`}>
                                                                                        <strong>{plan} </strong>: {quote.currency == "Other" ? quote.other_currency : quote.currency} {prices[index] ? prices[index] : 0}
                                                                                        {index < plans.length - 1 && ', '}
                                                                                        {quote.mp_price === plan && " (MP Price)"}
                                                                                    </span>
                                                                                ));
                                                                            })()}
                                                                        </p>
                                                                    )}

                                                                    {quote.discount_price && (
                                                                        <p>
                                                                            <strong>Discounted Price:</strong>{' '}
                                                                            {(() => {
                                                                                const prices = quote.discount_price.split(','); // Split quote_price into an array
                                                                                const plans = quote.plan.split(','); // Split plan into an array
                                                                                return plans.map((plan, index) => (
                                                                                    <span key={index} className='silver px-1 py-1 f-12 rounded mr-1'>
                                                                                        <strong>{plan} </strong>: {quote.currency == "Other" ? quote.other_currency : quote.currency} {prices[index] ?? 0}
                                                                                        {index < plans.length - 1 && ', '}
                                                                                        {quote.mp_price === plan && " (MP Price)"}
                                                                                    </span>
                                                                                ));
                                                                            })()}
                                                                        </p>
                                                                    )}
                                                                    {quote.final_price && (
                                                                        <p >
                                                                            <strong>Final Price:</strong>{' '}
                                                                            {(() => {
                                                                                const prices = quote.final_price.split(','); // Split quote_price into an array
                                                                                const plans = quote.plan.split(','); // Split plan into an array
                                                                                return plans.map((plan, index) => (
                                                                                    <span key={index} className=' px-1 py-2 rounded mr-1 gold'>
                                                                                        <strong>{plan} </strong>: {quote.currency == "Other" ? quote.other_currency : quote.currency} {prices[index]}
                                                                                        {index < plans.length - 1 && ', '}
                                                                                        {quote.mp_price === plan && " (MP Price)"}
                                                                                    </span>
                                                                                ));
                                                                            })()}
                                                                        </p>
                                                                    )}
                                                                    {quote.user_comments && (
                                                                        <p><strong style={{ textDecoration: "underline" }}>Admin Comments:</strong> {quote.user_comments}</p>
                                                                    )}
                                                                </>
                                                            )}


                                                            {assignQuoteInfo && assignQuoteInfo != false && (
                                                                <p><strong>Assigned To:</strong> {assignQuoteInfo.name}</p>
                                                            )}

                                                            <div className='flex items-start space-x-1'>
                                                                {quote.quote_status == 1 && quote.submittedtoadmin == "true" && quote.user_id == thisUserId && (
                                                                    <AskPtp scopeDetails={quote} quoteId={quote.quoteid} after={fetchScopeDetails} plans={quote.plan} />
                                                                )}
                                                                {quote.user_id == thisUserId && quote.submittedtoadmin == "true" && quote.demodone != 1 && (
                                                                    <DemoDone scopeDetails={quote} quoteId={quote.quoteid} after={fetchScopeDetails} />
                                                                )}
                                                            </div>

                                                            {quote.isfeasability == 1 && (
                                                                <>
                                                                    <div className='flex items-center'>
                                                                        <>

                                                                            {quote.feasability_status == "Completed" && quote.submittedtoadmin == "false" && (
                                                                                <button
                                                                                    onClick={() => {
                                                                                        submitToAdmin(quote.assign_id, quote.quoteid, quote.user_id);
                                                                                    }}
                                                                                    className="bg-green-100 text-green-700 p-1 rounded border border-green-900 ml-5 hover:bg-green-200"
                                                                                    title='Submit request to admin for Ask For Scope'
                                                                                >
                                                                                    Request Quote
                                                                                </button>
                                                                            )}
                                                                        </>

                                                                    </div>

                                                                    {quote.feasability_status == "Completed" && (
                                                                        <>
                                                                            <p style={{ textDecoration: "italic" }} className='italic'>
                                                                                Feasibility Comments:
                                                                                <span
                                                                                    className='mt-2'
                                                                                    dangerouslySetInnerHTML={{ __html: quote.feasability_comments }}
                                                                                />
                                                                            </p>
                                                                            {quote.feas_file_name && (
                                                                                <p className='flex items-center'>Feasibility Attachment : <a href={"https://apacvault.com/public/feasabilityFiles/" + quote.feas_file_name} target='_blank' className='text-blue-600 flex items-center'><Paperclip size={20} /> View File</a></p>
                                                                            )}
                                                                        </>
                                                                    )}
                                                                    {historyLoading && <CustomLoader />}
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
                                                                                                <p className=" font-semibold text-gray-700">
                                                                                                    {historyItem.from_first_name} {historyItem.from_last_name}
                                                                                                    {historyItem.to_first_name && historyItem.to_first_name && (<span className="text-gray-500 text-xs"> to </span>)}

                                                                                                    {historyItem.to_first_name} {historyItem.to_last_name}
                                                                                                </p>
                                                                                                <p className=" text-gray-500">{historyItem.created_at}</p>
                                                                                                {/* Message */}
                                                                                                <p className="text-gray-600">{historyItem.message}</p>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </>)}

                                                        </div>
                                                        <Chat quoteId={quote.quoteid} refId={quote.assign_id} status={quote.quote_status} submittedToAdmin={quote.submittedtoadmin} finalFunction={fetchScopeDetails} finalfunctionforsocket={fetchScopeDetailsForScoket} allDetails={quote} />
                                                        <MergedHistoryComponent quoteId={quote.quoteid} refId={quote.assign_id} />
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
                            <SubmitRequestQuote refId={queryId} onClose={toggleAddNewForm} after={fetchScopeDetails} userIdDefined={userIdDefined} clientName={clientName} />
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

                </div>
            )}

        </div>
    );
};

export default AskForScopeTransfer;