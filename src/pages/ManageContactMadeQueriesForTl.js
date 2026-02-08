import DataTable from 'datatables.net-react';
import DT from 'datatables.net-dt';
import $ from 'jquery';
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import 'daterangepicker/daterangepicker.css'; // Import daterangepicker CSS
import 'daterangepicker'; // Import daterangepicker JS
import moment from 'moment';
import 'select2/dist/css/select2.css';
import 'select2';
import CustomLoader from '../CustomLoader';
import { RefreshCcw, Filter, ListIcon, FileQuestion, UserCircle, UserCheck, X } from 'lucide-react';
import QueryDetails from './QueryDetails';
import { AnimatePresence, motion } from 'framer-motion';
import SummaryPage from './SummaryPage';
import FeasabilityPage from './FeasabilityPage';
import QueryDetailsTl from './QueryDetailsTl';
import ManageTlQuery from './ManageTlQuery';
import FollowingPage from './FollowingPage';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import { getSocket } from './Socket';
import { io } from "socket.io-client";
const socket = getSocket();

const ManageContactMadeQueriesForTl = ({ onClose, loopUserId, instaUserId }) => {
    const [quotes, setQuotes] = useState([]);
    const [websites, setWebsites] = useState([]);
    const [selectedWebsite, setSelectedWebsite] = useState('');
    const [filterDate, setFilterDate] = useState('');
    const [keyword, setKeyword] = useState('');
    const [RefId, setRefId] = useState('');
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState('')
    const [loading, setLoading] = useState(false);
    const selectUserRef = useRef(null);
    const [selectedQuery, setSelectedQuery] = useState('');
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [summaryOpen, setSummaryOpen] = useState(false);
    const [followingOpen, setFollowingOpen] = useState(false);
    const [feasPageOpen, setFeasPageOpen] = useState(false);
    const [tlPageOpen, setTlPageOpen] = useState(false);
    const [pendingFeasRequestCount, setPendingFeasRequestCount] = useState(0)

    const userData = localStorage.getItem('user');

    const userObject = JSON.parse(userData);

    // Access the 'id' field
    const userId = userObject.id;



    DataTable.use(DT);


    const toggleDetailsPage = () => {
        setIsDetailsOpen(!isDetailsOpen);
    };
    const handleViewButtonClick = (query) => {
        setSelectedQuery(query);
        setIsDetailsOpen(true);
    };

    const handleRequestAccessClick = async (data) => {
        try {
            const response = await fetch('https://loopback-skci.onrender.com/api/scope/requestAccessfortransferredquery', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    // Include the data you want to send in the API request
                    assign_id: data.assign_id,
                    user_id: loopUserId,
                    // Add other necessary fields from `data` as required by the API
                }),
            });

            const result = await response.json();

            if (response.ok) {
                // Handle successful response
                toast.success('Request Access Sent Successfully!');
            } else {
                // Handle error response
                toast.error(`Error: ${result.message}`);
            }
        } catch (error) {
            // Handle network errors
            toast.error('There was an error sending the request.');
        } finally {
            fetchQuotes(false);
        }
    };

    const handleSummaryButtonClick = (query) => {
        setSummaryOpen(true);
    };
    const handleFollowingButtonClick = (query) => {
        setFollowingOpen(true);
    };
    const toggleSummaryPage = () => {
        setSummaryOpen(!summaryOpen);
    };
    const toggleFollowingPage = () => {
        setFollowingOpen(!followingOpen);
    };

    const handleFeasButtonClick = (query) => {
        setFeasPageOpen(true);
    };
    const handleTlButtonClick = (query) => {
        setTlPageOpen(true);
    };

    const toggleFeasPage = () => {
        setFeasPageOpen(!feasPageOpen);
    };

    useEffect(() => {
        // Initialize select2 for Select Team
        $(selectUserRef.current).select2({
            placeholder: "Select Website",
            allowClear: true,
        }).on('change', (e) => {
            setSelectedWebsite($(e.target).val());
        });


        return () => {
            // Destroy select2 when the component unmounts
            if (selectUserRef.current) {
                $(selectUserRef.current).select2('destroy');
            }
        };
    }, [websites]);

    // Fetch all data on initial render
    useEffect(() => {
        fetchQuotes(false);
        fetchWebsites();
    }, []);

    const fetchWebsites = async () => {

        try {
            const response = await fetch(
                'https://instacrm.rapidcollaborate.com/api/getallwebsites',
                {
                    method: 'POST', // Use POST method
                    headers: {
                        'Content-Type': 'application/json', // Set content type to JSON
                    },
                    body: JSON.stringify(), // Pass the POST data as JSON
                }
            );

            const data = await response.json(); // Parse the response as JSON
            if (data.status) {
                setWebsites(data.data);
            } else {
                console.error('Failed to fetch Websites:', data.message);
            }
        } catch (error) {
            console.error('Error fetching Websites:', error);
        }
    };

    const fetchQuotes = async (nopayload = false) => {
        setLoading(true);

        let hasResponse = false;
        let payload = { loop_user_id: loopUserId, user_id: instaUserId, search_keywords: keyword, ref_id: RefId, website: selectedWebsite, user_type: userObject.user_type, team_id: userObject.team_id }

        if (nopayload) {
            // If nopayload is true, send an empty payload
            payload = { loop_user_id: loopUserId, user_id: instaUserId, user_type: userObject.user_type, team_id: userObject.team_id };
        }

        try {
            const response = await fetch(
                'https://loopback-skci.onrender.com/api/scope/loadcontactmadequeriesNew',
                {
                    method: 'POST', // Use POST method
                    headers: {
                        'Content-Type': 'application/json', // Set content type to JSON
                    },
                    body: JSON.stringify(payload), // Pass the POST data as JSON
                }
            );

            const data = await response.json(); // Parse the response as JSON
            if (data.status) {
                setQuotes(data.data); // Update the quotes state
                setPendingFeasRequestCount(data.pendingFeasRequestCount ? data.pendingFeasRequestCount : 0)
            } else {
                console.error('Failed to fetch quotes:', data.message);
            }
            hasResponse = true;
        } catch (error) {
            console.error('Error fetching quotes:', error);
        } finally {
            if (hasResponse) {
                setLoading(false); // Hide the loader
            }
        }
    };

    useEffect(() => {

        socket.on("updateTable", (data) => {
            if (data.isfeasability == 1 && data.feasability_user == loopUserId) {
                toast(data.fld_first_name + ' Submitted a request QuoteId ' + data.id + ' for refId ' + data.ref_id, {
                    icon: '💡',
                });
            }

        });

        return () => {
            socket.off("updateTable");
        };

    }, []);

    useEffect(() => {

        socket.on('chatresponse', (data) => {
            let followersArray = [];
            if (data.all_details.followers) {
                followersArray = data.all_details.followers.split(',').map(id => id.trim());
            }

            if (
                data.all_details.user_id == loopUserId ||
                (data.all_details.isfeasability == 1 && data.all_details.feasability_status == "Pending" && data.all_details.feasability_user == loopUserId) ||
                followersArray.includes(loopUserId)
            )
                if (data.user_id != loopUserId) {
                    toast(data.user_name + " Sent a chat for Quote" + data.quote_id, {
                        icon: "💬",
                    })
                }

        });

        return () => {
            socket.off('chatresponse');  // Clean up on component unmount
        };
    }, []);

    useEffect(() => {
        socket.on('quoteReceived', (data) => {
            if (data.user_id == loopUserId) {

                toast(" Admin Submitted price Quote for " + data.quote_id, {
                    icon: "💲",
                });
            }
        });

        return () => {
            socket.off('quoteReceived');  // Clean up on component unmount
        };
    }, []);

    useEffect(() => {
        socket.on('feasTransferred', (data) => {
            if (data.user_id == loopUserId) {

                toast(data.user_name + " Transferred you a Feasibility Check Request for " + data.quote_id, {
                    icon: "❓❗",
                });
            }
        });

        return () => {
            socket.off('feasTransferred');  // Clean up on component unmount
        };
    }, []);

    useEffect(() => {
        socket.on('feasabilityDone', (data) => {
            if (data.user_id == loopUserId) {

                toast(data.user_name + " Completed the Feasibility Check for " + data.quote_id, {
                    icon: "✅",
                });
            }
        });

        return () => {
            socket.off('feasabilityDone');  // Clean up on component unmount
        };
    }, []);

    const columns = [
        {
            title: 'Ref Id',
            data: 'assign_id',
            orderable: false,
        },
        {
            title: 'User Name',
            data: 'user_name',
            orderable: false,
        },
        {
            title: 'Email',
            data: 'email_id',
            orderable: false,
            render: function (data, type, row) {
                return `<div class="flex items-center">${data} ${row.showBellicon == 1 ? ('<i class="fa fa-bell ml-2 text-red-400" aria-hidden="false"></i>') : ""}</div> `;
            }
        },
        {
            title: 'Client Name',
            data: 'name',
            orderable: false,
            render: function (data, type, row) {
                return `<div>${data || "N/A"}</div>`;
            }
        },
        {
            title: 'Contact',
            data: 'phone',
            orderable: false,
        },

        {
            title: 'Website',
            data: 'website_name',
            orderable: false,
        },
        {
            title: 'Actions',
            data: null,
            orderable: false,
            render: (data, type, row) => {
                // Check conditions for buttons
                if (row.transfer_type != 0) {
                    if (row.looppanel_transfer_access == 2) {
                        // Show View Details button
                        return `
                            <button class="view-btn vd mx-1 p-1 text-white bg-green-500" style="font-size:10px;border-radius:3px;white-space: nowrap;" data-id="${row.assign_id}">
                                View Details
                            </button>
                        `;
                    } else if (row.looppanel_transfer_access == 0 || row.looppanel_transfer_access == 3) {
                        // Show Request Access button
                        return `
                            <button class="request-access-btn mx-1 p-1 text-white bg-blue-500" style="font-size:10px;border-radius:3px;white-space: nowrap;" title="Since this query has been transferred, you need to request scope access before requesting a scope." data-id="${row.assign_id}">
                                Request Access
                            </button>
                        `;
                    } else if (row.looppanel_transfer_access == 1) {
                        return `
                            <span class=" p-1 text-white bg-yellow-500" style="font-size:10px;border-radius:3px;white-space: nowrap;" title="Request Status pending." data-id="${row.assign_id}">
                                Request Pending
                            </span>
                        `;
                    }
                } else if (row.transfer_type == 0) {
                    // Show View Details button for transfer_type == 0
                    return `
                        <button class="view-btn vd mx-1 p-1 text-white bg-green-500" style="font-size:10px;border-radius:3px;white-space: nowrap;" data-id="${row.assign_id}">
                            View Details
                        </button>
                    `;
                }
                // Default case
                return '';
            }
        },
    ];

    const resetFilters = () => {
        setKeyword('');
        setRefId('');
        setSelectedWebsite('');
        $(selectUserRef.current).val(null).trigger('change');
        fetchQuotes(true);
    };

    return (
        <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed top-0 right-0 h-full w-full bg-gray-100 shadow-lg z-50 overflow-y-auto "
        >


            {/* Filter Section */}
            <div className="mb-3 bg-white px-3 py-3 rounded aql">
                <div className='flex items-center justify-between mb-5'>
                    <h1 className='text-xl font-bold mb-3'>Query History</h1>
                    <button
                        onClick={onClose}
                        className="text-white hover:text-red-500 transition-colors p-1 rounded-full bg-red-600 hover:bg-red-500"
                    >
                        {/* <CircleX size={32} /> */}
                        <X size={15} />
                    </button>
                </div>
                <div className='flex items-center space-x-2 '>
                    <div className="w-1/6">
                        <input
                            type="text"
                            className="form-control"
                            placeholder='Ref ID'
                            value={RefId}
                            onChange={(e) => setRefId(e.target.value)}
                        />
                    </div>
                    <div className="w-1/4">
                        <input
                            type="text"
                            className="form-control"
                            placeholder='Enter Search Keywords'
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                        />
                    </div>
                    <div className="w-1/4">
                        <select
                            id="user_id"
                            className=" px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 form-control"

                            value={selectedWebsite}
                            ref={selectUserRef}
                        >
                            <option value="">Select Website</option>
                            {websites.map(website => (
                                <option key={website.id} value={website.id}>
                                    {website.website}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="w-1/2 flex justify-content-end space-x-2 items-center">
                        <label>&nbsp;</label>
                        <button className="gree text-white flex items-center" onClick={() => { fetchQuotes(false) }}>
                            <Filter size={12} />
                            Apply
                        </button>
                        <button className="bg-gray-200 flex items-center" onClick={resetFilters}>
                            <RefreshCcw size={12} />
                            Refresh
                        </button>
                        <button className="bg-gray-200 flex items-center" onClick={handleSummaryButtonClick} title='View Summary'>
                            <ListIcon size={12} />
                            Summary
                        </button>
                        <button className="bg-gray-200 flex items-center" onClick={handleFollowingButtonClick} title='View Following Quotations'>
                            <UserCheck size={12} />
                            Following
                        </button>

                        <button className="bg-gray-200 flex items-center relative" onClick={handleFeasButtonClick} title='Feasibility Check'>
                            <FileQuestion size={12} />
                            Feasibility Request
                            <span style={{ top: "-15px", right: "-10px" }} className="absolute inline-flex items-center justify-center px-2 py-1 text-xs font-semibold text-white bg-red-600 rounded-full">
                                {pendingFeasRequestCount}
                            </span>
                        </button>

                    </div>
                </div>
            </div>

            {loading ? (
                <CustomLoader />
            ) : (
                <div className='bg-white p-4 border-t-2 border-blue-400 rounded'>
                    <div className="table-scrollable">
                        <DataTable
                            data={quotes}
                            columns={columns}

                            options={{
                                ordering: false,
                                pageLength: 50,
                                createdRow: (row, data) => {
                                    $(row).find('.view-btn').on('click', () => handleViewButtonClick(data));
                                    $(row).find('.request-access-btn').on('click', () => handleRequestAccessClick(data));
                                },
                            }}
                        />
                    </div>
                </div>
            )}

            <AnimatePresence>


                {isDetailsOpen && (

                    <QueryDetails
                        onClose={toggleDetailsPage}
                        userIdDefined={loopUserId}
                        queryId={selectedQuery.assign_id}
                        after={() => { fetchQuotes(false) }}
                    />

                )}
                {summaryOpen && (

                    <SummaryPage
                        onClose={toggleSummaryPage}
                        after={() => { fetchQuotes(false) }}
                        userIdDefined={loopUserId}
                    />

                )}
                {followingOpen && (
                    <FollowingPage onClose={toggleFollowingPage}
                        after={() => { fetchQuotes(false) }} />
                )}
                {feasPageOpen && (
                    <FeasabilityPage onClose={toggleFeasPage} after={() => { fetchQuotes(false) }} />
                )}
                {tlPageOpen && (
                    <ManageTlQuery onClose={() => { setTlPageOpen(!tlPageOpen) }} />
                )}
            </AnimatePresence>

        </motion.div>
    );
};

export default ManageContactMadeQueriesForTl;