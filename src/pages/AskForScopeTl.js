import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import CustomLoader from '../CustomLoader';
import { Chat } from './Chat';
import { ArrowDown, ArrowUp, Paperclip, History, CheckCircle, CheckCircle2, Hash, RefreshCcw, ArrowLeftRight } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import AddTags from './AddTags';
import HistorySideBar from './HistorySideBar';
import FeasHistorySideBar from './FeasHistorySideBar';
import { io } from "socket.io-client";
import MergedHistoryComponent from './MergedHistoryComponent';
import ScopeLoader from './ScopeLoader';
import { getSocket } from './Socket';
import ReactTooltip, { Tooltip } from 'react-tooltip'

const AskForScopeTl = ({ queryId, userType, quotationId }) => {
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
    const [amounts, setAmounts] = useState({});
    const [comment, setComment] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [adminComments, setAdminComments] = useState('');
    const [expandedRowIndex, setExpandedRowIndex] = useState(0);
    const [editFormOpen, setEditFormOpen] = useState(false);
    const [selectedQuoteId, setSelectedQuoteId] = useState('');
    const [historyData, setHistoryData] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [userIdForTag, setUserIdForTag] = useState('');

    const [historyPanelOpen, SetHistoryPanelOpen] = useState(false);
    const [quoteIdForHistory, setQuoteIdForHistory] = useState('');

    const [feasHistoryPanelOpen, SetFeasHistoryPanelOpen] = useState(false);
    const [quoteIdForFeasHistory, setQuoteIdForFeasHistory] = useState('');
    const [refIdForFeasHistory, setRefIdForFeasHistory] = useState('');



    const toggleHistoryDiv = ($id) => {
        setQuoteIdForHistory($id);
        SetHistoryPanelOpen(true);
    }

    const toggleFeasHistoyDiv = (assign_id, quote_id) => {
        setQuoteIdForFeasHistory(quote_id);
        setRefIdForFeasHistory(assign_id);
        SetFeasHistoryPanelOpen((prev) => !prev);

    }

    const toggleRow = (index) => {
        setExpandedRowIndex(expandedRowIndex === index ? null : index);
    };
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
                    body: JSON.stringify({ ref_id: queryId, user_type: userType, quote_id: quotationId }),
                }
            );

            const data = await response.json(); // Parse the response as JSON
            // console.log(data)
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
                    body: JSON.stringify({ ref_id: queryId, user_type: userType, quote_id: quotationId }),
                }
            );

            const data = await response.json(); // Parse the response as JSON
            // console.log(data)
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
                console.error('Failed to fetch Details:', data.message);
            }

        } catch (error) {
            console.error('Error fetching details:', error);
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

            const response = await fetch('https://instacrm.rapidcollaborate.com/api/updatepricequote', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json', // Set content type to JSON
                },
                body: JSON.stringify(data), // Send the data as JSON
            });

            const responseData = await response.json(); // Parse the response as JSON

            if (response.ok) {
                toast.success('Quote price updated successfully');
            } else {
                toast.error('Failed to update quote price');
            }
        } catch (error) {
            console.error('Error updating price quote:', error);
            toast.error('Error updating quote price');
        } finally {
            // Hide loading spinner
            setPriceLoading(false);
        }
    };

    const toggleEditForm = (id, user_id) => {
        setSelectedQuoteId(id);
        setUserIdForTag(user_id);
        setEditFormOpen((prev) => !prev)
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

    // Set default values for all plans (if not already set) when submitting the form



    const PriceSubmitValidate = async (refId, quoteId) => {

        const basicAmount = document.getElementById('amount_Basic')?.value.trim() || "0";
        const standardAmount = document.getElementById('amount_Standard')?.value.trim() || "0";
        const advancedAmount = document.getElementById('amount_Advanced')?.value.trim() || "0";

        // Prepare the quote_amount as a comma-separated string
        const quoteAmount = [basicAmount, standardAmount, advancedAmount].join(',');



        try {
            // Show loading spinner
            setQuoteLoading(true);

            const response = await fetch('https://loopback-skci.onrender.com/api/scope/submittedtoadminquote', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ref_id: refId,
                    quote_id: quoteId,
                    quote_amount: quoteAmount,
                    comment: comment,
                }), // Send the data as JSON
            });

            const responseData = await response.json(); // Parse the response as JSON

            if (response.ok) {
                toast.success('Quote price updated successfully');

            } else {
                toast.error('Failed to update quote price');
            }
        } catch (error) {
            console.error('Error updating price quote:', error);
            toast.error('Error updating quote price');
        } finally {
            // Hide loading spinner
            setQuoteLoading(false);
        }
    };

    const ValidateAssignTask = async () => {
        if (!selectedUser || !adminComments) {
            toast.error('Please select a user and provide comments');
            return; // Prevent form submission if validation fails
        }
        const data = {
            ref_id: scopeDetails.ref_id,
            quote_id: scopeDetails.id,
            assign_to_userid: selectedUser,
            admin_comments: adminComments,
        };

        try {
            // Show loading spinner
            setAssignLoading(true);

            const response = await fetch('https://instacrm.rapidcollaborate.com/api/submitassignquote', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json', // Set content type to JSON
                },
                body: JSON.stringify(data), // Send the data as JSON
            });

            const responseData = await response.json(); // Parse the response as JSON

            if (response.ok) {
                toast.success('Quote price updated successfully');
            } else {
                toast.error('Failed to update quote price');
            }
        } catch (error) {
            console.error('Error updating price quote:', error);
            toast.error('Error updating quote price');
        } finally {
            // Hide loading spinner
            setAssignLoading(false);
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
                fetchScopeDetailsForSocket();
            }
        });

        return () => {
            socket.off('quoteReceived');  // Clean up on component unmount
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
    const numberToWords = (num) => {
        const toWords = require("number-to-words");
        return toWords.toWords(Number(num));
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


    const handleUserChange = (event) => {
        setSelectedUser(event.target.value); // Update the state with selected user ID
    };

    return (
        <div className=" h-full bg-gray-100 shadow-lg z-50 overflow-y-auto mt-2 rounded w-full">
            <div className="flex items-center justify-between bg-blue-400 text-white py-2 px-3">
                <h2 className="text-xl font-semibold " >Ask For Scope </h2>
                <RefreshCcw size={20}
                    data-tooltip-id="my-tooltip"
                    data-tooltip-content="Refresh"
                    onClick={fetchScopeDetails} className='cursor-pointer' />
            </div>

            {loading ? (
                <ScopeLoader /> // A loader component when data is being fetched
            ) : (
                <div className="bg-white p-6 m-2 shadow rounded-md space-y-4">
                    {errorMessage && <p className="text-red-600">{errorMessage}</p>}

                    {scopeDetails && scopeDetails.length > 0 && (
                        <div>
                            {/* Table Header */}
                            <table className="w-full border-collapse border border-gray-200 f-14">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="border px-4 py-2 text-left">Ref No.</th>
                                        <th className="border px-4 py-2 text-left">Quote Id.</th>
                                        <th className="border px-4 py-2 text-left">Currency</th>
                                        <th className="border px-4 py-2 text-left">Plan</th>
                                        <th className="border px-4 py-2 text-left">Service Name</th>
                                        <th className="border px-4 py-2 text-left">Quote Status</th>
                                        <th className="border px-4 py-2 text-left">Action</th>
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
                                                <td className="border px-4 py-2">
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
                                                                {quote.timeline}
                                                            </span>
                                                        )}

                                                    </p>
                                                </td>
                                                <td className="border px-4 py-2" style={{ fontSize: "11px" }}>{quote.quoteid}</td>
                                                <td className="border px-4 py-2" style={{ fontSize: "11px" }}>{quote.currency}</td>
                                                <td className="border px-4 py-2" style={{ fontSize: "11px" }}>{quote.plan}</td>
                                                <td className="border px-4 py-2" style={{ fontSize: "11px" }}>{quote.service_name || 'N/A'}</td>
                                                <td className="border px-4 py-2" style={{ fontSize: "11px" }}>
                                                    <span
                                                        className={
                                                            quote.quote_status == 0
                                                                ? 'text-red-600' // Pending - Red
                                                                : quote.quote_status == 1
                                                                    ? 'text-green-600' // Submitted - Green
                                                                    : quote.quote_status == 2
                                                                        ? 'text-yellow-600' // Discount Requested - Yellow
                                                                        : 'text-gray-600' // Default - Gray for Unknown
                                                        }
                                                    >
                                                        {
                                                            quote.quote_status == 0 && quote.submittedtoadmin == 'false'
                                                                ? 'Pending at User'
                                                                : quote.quote_status == 0 && quote.submittedtoadmin == 'true'
                                                                    ? 'Pending at Admin'
                                                                    : quote.quote_status == 1 && quote.discount_price != "" && quote.discount_price != null
                                                                        ? "Discount Submitted"
                                                                        : quote.quote_status == 1
                                                                            ? 'Submitted'
                                                                            : quote.quote_status == 2
                                                                                ? 'Discount Requested'
                                                                                : 'Unknown'
                                                        }
                                                    </span>
                                                    {quote.isfeasability == 1 && quote.feasability_status == "Completed" && (
                                                        <><br /><span className='text-green-700 text-sm' style={{ fontSize: "11px" }}>Feasibility Completed</span></>
                                                    )}
                                                    {quote.isfeasability == 1 && quote.feasability_status == "Pending" && (
                                                        <><br /><span className='text-red-700 text-sm font-bold' style={{ fontSize: "11px" }}>Feasibility Pending</span></>
                                                    )}
                                                </td>
                                                <td className=" px-4 py-2 flex items-center">
                                                    {/* Up/Down Arrow Button */}
                                                    <button
                                                        onClick={() => toggleRow(index)}
                                                        className="flex items-center justify-center p-2"
                                                    >
                                                        {expandedRowIndex === index ? <ArrowUp size={20} className='bg-blue-500 p-1 rounded-full text-white' /> : <ArrowDown size={20} className='bg-blue-500 p-1 rounded-full text-white' />}
                                                    </button>


                                                </td>
                                            </tr>
                                            {/* Accordion */}
                                            {expandedRowIndex == index && (
                                                <tr>
                                                    <td colSpan={7} className="border px-4 py-4 bg-gray-50">
                                                        <div className="space-y-4 text-sm">
                                                            <p className='d-flex align-items-center'><strong>Ref No.:</strong>
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
                                                                            lineHeight: '1.5', // Increased line height to make it visually balanced
                                                                        }}
                                                                    >
                                                                        PTP
                                                                    </span>
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

                                                            {quote.service_name && quote.plan && (
                                                                <>
                                                                    <p><strong>Service Required:</strong> {quote.service_name}</p>
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


                                                            <div className='space-y-4'>
                                                                {quote.comments && quote.comments != "" && quote.comments != null && (
                                                                    <p><strong style={{ textDecoration: "underline" }}>Additional Comments:</strong>  <span dangerouslySetInnerHTML={{ __html: quote.comments }} /></p>
                                                                )}

                                                                {quote.final_comments != null && (
                                                                    <div >
                                                                        <p><strong>Final Comments:</strong> {quote.final_comments}</p>
                                                                    </div>
                                                                )}
                                                                <p><strong>Created Date:</strong> {new Date(quote.created_date * 1000).toLocaleDateString('en-GB')}</p>
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


                                                                {quote.ptp != null && (
                                                                    <>
                                                                        <p><strong>PTP:</strong> {quote.ptp}</p>
                                                                        {quote.ptp_amount && quote.ptp_amount != 0 && (
                                                                            <p><strong>PTP Amount:</strong> {quote.ptp_amount}</p>
                                                                        )}
                                                                        {quote.ptp == "Yes" && (
                                                                            <p><strong >PTP Comments:</strong> {quote.ptp_comments}</p>
                                                                        )}
                                                                        {quote.ptp_file != null && (
                                                                            <p><strong>Attached File : </strong><a className='text-blue-500 font-semibold' href={`https://apacvault.com/public/${quote.ptp_file}`} download={quote.ptpfile} target='_blank'>{quote.ptp_file}</a></p>
                                                                        )}
                                                                    </>
                                                                )}
                                                                {quote.demodone != 0 && (
                                                                    <>
                                                                        <p className='flex items-center '>  <p className=''> <strong>Demo Id : </strong> {quote.demo_id}</p> <span className='badge-success px-2 py-0 ml-3 rounded-sm text-white-900 font-semibold flex items-center f-12'>Demo Completed <CheckCircle2 size={12} className='ml-1' /> </span></p>
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

                                                                {assignQuoteInfo && assignQuoteInfo != false && (
                                                                    <>
                                                                        {assignQuoteInfo.status === 0 ? (
                                                                            <>
                                                                                <p><strong>Assigned To:</strong> {assignQuoteInfo.name}</p>
                                                                                <p><strong>Assign Date:</strong> {assignQuoteInfo.assigned_date}</p>
                                                                                <p><strong>Admin Comments:</strong> {assignQuoteInfo.admin_comments}</p>
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <p>Submitted by {assignQuoteInfo.name}</p>
                                                                                <p><strong>Price:</strong> {assignQuoteInfo.currency} {assignQuoteInfo.quote_price}</p>
                                                                                <p><strong>Submitted Date:</strong> {new Date(assignQuoteInfo.user_submitted_date * 1000).toLocaleDateString('en-GB')}
                                                                                    {new Date(assignQuoteInfo.user_submitted_date * 1000).toLocaleTimeString('en-GB', {
                                                                                        hour: '2-digit',
                                                                                        minute: '2-digit',
                                                                                        hour12: true,
                                                                                    })}</p>
                                                                                <p><strong>Assigned Comments:</strong> {assignQuoteInfo.admin_comments}</p>
                                                                                <p><strong>Comments:</strong> {assignQuoteInfo.user_comments != "" ? assignQuoteInfo.user_comments : assignQuoteInfo.admin_comments}</p>
                                                                            </>
                                                                        )
                                                                        }
                                                                        {assignQuoteInfo.status == 1 && (

                                                                            <form name="edit_price_form" id="edit_price_form" className="form-horizontal">
                                                                                <div className="box-body">
                                                                                    <input type="hidden" name="task_id" id="task_id" value={assignQuoteInfo.id} />
                                                                                    <input type="hidden" name="quoteid" id="quoteid" value={assignQuoteInfo.quote_id} />
                                                                                    <div className="form-group">
                                                                                        <label className="col-sm-3 control-label">Quote Price (INR)</label>
                                                                                        <div className="col-sm-12">
                                                                                            <input
                                                                                                type="text"
                                                                                                className="form-control"
                                                                                                id="quote_price"
                                                                                                name="quote_price"
                                                                                                value={quotePrice || assignQuoteInfo?.quote_price || ''}
                                                                                                placeholder="Quote Price"
                                                                                                onChange={(e) => setQuotePrice(e.target.value)}
                                                                                            />
                                                                                        </div>
                                                                                    </div>
                                                                                    <div className="form-group">
                                                                                        <label className="col-sm-3 control-label">Comments</label>
                                                                                        <div className="col-sm-12">
                                                                                            <textarea
                                                                                                className="form-control"
                                                                                                id="user_comments"
                                                                                                name="user_comments"
                                                                                                value={userComments || assignQuoteInfo?.user_comments || assignQuoteInfo?.admin_comments || ''}
                                                                                                onChange={(e) => setUserComments(e.target.value)}
                                                                                            />
                                                                                        </div>
                                                                                    </div>
                                                                                </div>

                                                                                <div className="modal-footer tabb">
                                                                                    <span id="load_btn">
                                                                                        <button
                                                                                            type="button"
                                                                                            className="btn"
                                                                                            onClick={() => updatePriceQuote()}
                                                                                            disabled={priceLoading}
                                                                                        >
                                                                                            Confirm
                                                                                        </button>
                                                                                    </span>
                                                                                </div>
                                                                            </form>
                                                                        )}
                                                                    </>
                                                                )}

                                                                {quote.isfeasability == 1 && (
                                                                    <>


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

                                                                    </>
                                                                )}
                                                            </div>

                                                        </div>
                                                        <Chat quoteId={quote.quoteid} refId={quote.assign_id} status={quote.quote_status} submittedToAdmin={quote.submittedtoadmin} finalFunction={fetchScopeDetails} allDetails={quote} />
                                                        <MergedHistoryComponent quoteId={quote.quoteid} refId={quote.assign_id} />
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
                    <AddTags quoteId={selectedQuoteId} refId={queryId} userId={userIdForTag} onClose={() => { setEditFormOpen(!editFormOpen) }} after={fetchScopeDetails} notification="yes" />
                )}
                {historyPanelOpen && (
                    <HistorySideBar quoteId={quoteIdForHistory} refId={queryId} onClose={() => { SetHistoryPanelOpen(!historyPanelOpen) }} />
                )}

                {feasHistoryPanelOpen && (
                    <FeasHistorySideBar quoteId={quoteIdForFeasHistory} refId={refIdForFeasHistory} onClose={() => { SetFeasHistoryPanelOpen(!feasHistoryPanelOpen) }} />
                )}
            </AnimatePresence>
            <Tooltip id="my-tooltip" />
        </div>
    );
};

export default AskForScopeTl;