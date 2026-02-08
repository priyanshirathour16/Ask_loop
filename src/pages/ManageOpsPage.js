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
import { RefreshCcw, Filter, FileQuestion, X, PlusCircle, CheckCircle, PercentCircle, Clock } from 'lucide-react';
import QueryDetailsAdmin from './QueryDetailsAdmin';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import AllFeasPage from './AllFeasPage';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import FeasabilityPage from './FeasabilityPage';
import QueryDetailsTl from './QueryDetailsTl';
import SelectUsers from './SelectUsers';
import TableLoader from '../components/TableLoader';
import StatsModal from './StatsModal';
import toast from 'react-hot-toast';

const ManageOpsPage = ({ onClose }) => {
    const [quotes, setQuotes] = useState([]);
    const [quoteId, setQuoteId] = useState('');
    const [refID, setRefId] = useState('');
    const [keyword, setKeyword] = useState('');
    const [status, setStatus] = useState('');
    const [feasStatus, setFeasStatus] = useState('');
    const [selectedDate, setSelectedDate] = useState(null);
    const [users, setUsers] = useState([]);
    const [services, setServices] = useState([]);
    const [selectedService, setSelectedService] = useState('');
    const [selectedUser, setSelectedUser] = useState('');
    const [selectedTags, setSelectedTags] = useState([]);
    const [ptp, setPtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [tags, setTags] = useState([]);
    const tagsRef = useRef(null);
    const selectUserRef = useRef(null);
    const selectServiceRef = useRef(null);
    const [selectedQuery, setSelectedQuery] = useState('');
    const [selectedQuote, setSelectedQuote] = useState('');
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [isAllFeasOpen, setIsAllFeasOpen] = useState(false);
    const [selectuserDiv, setSelectUserDiv] = useState(false);
    const [quoteIssue, setQuoteIssue] = useState('');

    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const navigate = useNavigate();

    DataTable.use(DT);

    const userData = localStorage.getItem('user');

    const userObject = JSON.parse(userData);
    useEffect(() => {
        if (!userObject || userObject.user_type !== "admin") {
            navigate('/assignquery');
        }
    }, [userObject, navigate]);


    const toggleDetailsPage = () => {
        setIsDetailsOpen(!isDetailsOpen);
    };

    const toggleAllFeasPage = () => {
        setIsAllFeasOpen(!isAllFeasOpen);
    };
    const toggleUsersDiv = () => {
        setSelectUserDiv(!selectuserDiv);
    };

    const handleViewButtonClick = (query) => {
        setSelectedQuery(query);
        setSelectedQuote(query.id)
        setIsDetailsOpen(true);
    };

    useEffect(() => {
        // Initialize select2 for Select Team
        $(selectUserRef.current).select2({
            placeholder: "Select User",
            allowClear: true,
        }).on('change', (e) => {
            setSelectedUser($(e.target).val());
        });


        return () => {
            // Destroy select2 when the component unmounts
            if (selectUserRef.current) {
                $(selectUserRef.current).select2('destroy');
            }
        };
    }, [users]);

    useEffect(() => {
        // Initialize select2 for Select Team
        $(selectServiceRef.current).select2({
            placeholder: "Select Service",
            allowClear: true,
        }).on('change', (e) => {
            setSelectedService($(e.target).val());
        });


        return () => {
            // Destroy select2 when the component unmounts
            if (selectServiceRef.current) {
                $(selectServiceRef.current).select2('destroy');
            }
        };
    }, [services]);

    // Fetch all data on initial render
    useEffect(() => {
        fetchQuotes(false);
        fetchServices();
        fetchUsers();
        fetchTags();

    }, []);
    const loopuserData = localStorage.getItem('loopuser');

    const loopuserObject = JSON.parse(loopuserData);
    const currentTlEmail = loopuserObject.fld_email;

    const fetchQuotes = async (nopayload = false) => {
        setLoading(true);

        // Only use the filters if `nopayload` is false
        const userid = selectedUser;
        const ref_id = refID;
        const quote_id = quoteId;
        const search_keywords = keyword;
        const service_name = selectedService;
        const tags = selectedTags;
        const feasability_status = feasStatus;
        const start_date = startDate;
        const end_date = endDate;
        const assign_users = loopuserObject.tl_users;
        const current_tl = currentTlEmail;
        const quote_issue = quoteIssue;


        // Define the payload conditionally
        let payload = {
            userid: userid ? [userid] : "", ref_id, quote_id, current_tl, search_keywords, status: status ? [status] : null, service_name, ptp, tags, feasability_status, start_date, end_date, assign_users, quote_issue
        };

        if (nopayload) {
            // If nopayload is true, send an empty payload
            payload = { assign_users, current_tl };
        }

        try {
            const response = await fetch(
                'https://loopback-skci.onrender.com/api/scope/listQuotesForOps',
                {
                    method: 'POST', // Use POST method
                    headers: {
                        'Content-Type': 'application/json', // Set content type to JSON
                    },
                    body: JSON.stringify(payload), // Send the payload conditionally
                }
            );

            const data = await response.json(); // Parse the response as JSON
            if (data.status) {
                setQuotes(data.allQuoteData); // Update the quotes state

            } else {
                console.error('Failed to fetch quotes:', data.message);
            }
            fetchStats(true);
        } catch (error) {
            console.error('Error fetching quotes:', error);
        } finally {
            setLoading(false); // Hide loading spinner
        }
    };
    const fetchUsers = async () => {
        try {
            const response = await fetch('https://loopback-skci.onrender.com/api/users/allusers', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            const data = await response.json();
            if (data.status) setUsers(data.data || []);
        } catch (error) {
            console.error('Failed to fetch users.');
        }
    };

    const fetchServices = async () => {

        try {
            const response = await fetch(
                'https://loopback-skci.onrender.com/api/scope/getAllServices',
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
                setServices(data.data);
            } else {
                console.error('Failed to fetch Services:', data.message);
            }
        } catch (error) {
            console.error('Error fetching Services:', error);
        }
    };
    const fetchTags = async () => {
        try {
            const response = await fetch('https://loopback-skci.onrender.com/api/scope/getTags');
            const data = await response.json();
            if (data.status) setTags(data.data || []);
        } catch (error) {

        }
    };

    useEffect(() => {
        // Initialize select2 for Tags
        $(tagsRef.current).select2({
            placeholder: "Select Tags",
            allowClear: true,
            multiple: true,
        }).on('change', (e) => {
            const selectedValues = $(e.target).val();
            setSelectedTags(selectedValues || []);
        });


        $(tagsRef.current).val(selectedTags).trigger('change');


        return () => {
            // Clean up select2 on component unmount
            if (tagsRef.current) {
                $(tagsRef.current).select2('destroy');
            }
        };
    }, [tags]);

    const columns = [
        {
            title: 'Ref Id',
            data: 'ref_id',
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

                return html; // Return the complete HTML with conditions applied
            },
        },
        {
            title: 'Ask For Scope ID',
            data: 'id',
            width: "20x",
            orderable: true,
            className: 'text-center',
        },
        {
            title: 'Client Name',
            data: 'client_name',
            orderable: false,
            className: 'text-center',
            render: function (data, type, row) {
                return data ? data : 'null'; // Check if data exists; if not, return 'null'
            },
        },
        {
            title: 'CRM Name',
            data: 'fld_first_name',
            orderable: false,
            render: (data, type, row) => {
                let name = row.fld_first_name + " " + (row.fld_last_name != null ? row.fld_last_name : "");

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
            title: 'Currency',
            data: 'null',
            orderable: false,
            render: function (data, type, row) {
                if (row.currency == "Other") {
                    return row.other_currency;
                } else {
                    return row.currency;
                }
            },
        },
        {
            title: 'Service',
            data: 'service_name', // actually holds comma-separated service IDs
            orderable: false,
            render: function (data, type, row, meta) {
                if (!data) return '<div style="text-align: left;">N/A</div>';

                const serviceIds = data.split(',').map(id => id.trim());

                const serviceNames = serviceIds.map(id => {
                    const service = services.find(s => String(s.id) === id);
                    return service ? service.name : `Service #${id}`;
                });

                return `<div style="text-align: left;">${serviceNames.join(', ')}</div>`;
            }
        },
        {
            title: 'Quote Status',
            data: 'status', // Replace with actual field name
            orderable: false,
            render: function (data, type, row) {
                if (row.isfeasability == 1 && row.submittedtoadmin == "false") {
                    return '<span class="text-red-600 font-bold">Pending at User</span>';
                } else if (row.ops_approved == "0") {
                    return '<span class="text-red-600 font-bold">Ops Approval Pending</span>';
                } else {
                    if (data == 0) {
                        return '<span class="text-red-600 font-bold">Pending at Admin</span>';
                    } else if (data == 1 && row['discount_price'] !== "" && row['discount_price'] !== null) {
                        return '<span class="text-green-600 font-bold">Discount Submitted</span>';
                    } else if (data == 1) {
                        return '<span class="text-green-600 font-bold">Submitted</span>';
                    } else if (data == 2) {
                        return '<span class="text-yellow-600 font-bold">Discount Requested</span>';
                    }
                }
                return '<span class="text-gray-600">Unknown</span>';
            },
        },
        {
            title: 'Feasibility Status',
            data: 'feasability_status', // Replace with actual field name
            orderable: false,
            render: function (data, type, row) {
                if (row.isfeasability == 1) {
                    if (data == 'Pending') {
                        return '<span class="text-red-600 font-bold">Pending</span>';
                    } else if (data == 'Completed') {
                        return `
                            <div>
                                <span class="text-green-600 font-bold">Completed</span>
                            </div>
                        `;
                    }
                }
                // Return "-" if no feasability_status is present
                return '-';
            },
        },
        {
            title: 'Tags',
            data: 'tag_names',
            orderable: false,
            width: "130px",
            className: "text-sm",
            render: function (data, type, row, meta) {
                if (!data) return '';

                // Access the 'tags' array in your component scope
                const tagIds = data.split(',').map(id => id.trim());

                const tagElements = tagIds.map(id => {
                    const tagObj = tags.find(t => String(t.id) === id); // Match by string
                    const tagName = tagObj ? tagObj.tag_name : `#${id}`; // Fallback to id
                    return `<span class="text-blue-500 inline-block" style="font-size:10px">#${tagName}</span>`;
                });

                return tagElements.join('');
            }
        },

        {
            title: 'Created Date',
            data: 'created_date',
            orderable: false,
            render: (data) => {
                return data ? new Date(data * 1000).toLocaleDateString() : 'N/A';
            },
        },
        {
            title: 'Actions',
            data: null,
            orderable: false,
            render: (data, type, row) => `
        <button class="view-btn vd mx-1 p-1  text-white" style="font-size:10px;border-radius:3px;     white-space: nowrap;" data-id="${row.ref_id}">
            View Details
        </button>
      `,
        },
    ];

    const resetFilters = async () => {
        // Reset filter states
        setRefId('');
        setKeyword('');
        setStatus('');
        setFeasStatus('');
        setQuoteIssue('')
        setStartDate('');
        setEndDate('');
        setSelectedUser('');  // Reset selected user
        setSelectedService('');  // Reset selected service
        setSelectedTags([]);  // Reset selected tags

        // Reset the select elements and trigger change
        $(selectUserRef.current).val(null).trigger('change');
        $(selectServiceRef.current).val(null).trigger('change');
        $(tagsRef.current).val([]).trigger('change');


        try {
            // Fetch quotes after resetting the filters
            await fetchQuotes(true);
        } catch (error) {
            console.error("Error fetching quotes after resetting filters:", error);
        }
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
            const res = await fetch("https://loopback-skci.onrender.com/api/scope/getDailyStatistics", {
                method: "GET",
                headers: {
                    "Content-type": "application/json"
                }
            });
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



    return (
        <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed top-0 right-0 h-full w-full bg-gray-100 shadow-lg z-50 overflow-y-auto "
        >


            {/* Filter Section */}
            <div className=" mb-3 bg-white  rounded ">
                <div className='bg-blue-400 text-white py-3 px-3 mb-3'>
                    <div className='container flex items-center justify-between p-0'>
                        <h2 className="text-xl font-semibold">Approval Requests</h2>
                        <div className='flex items-center justify-between space-x-2'>

                            <button
                                onClick={onClose}
                                className="text-white hover:text-red-500 transition-colors p-1 rounded-full bg-red-600 hover:bg-red-500"
                            >
                                {/* <CircleX size={32} /> */}
                                <X size={15} />
                            </button>
                        </div>
                    </div>
                </div>
                <div className='flex items-end space-x-2 px-3'>
                    <div className="row">
                        <div className="col-2 mb-3">
                            <input
                                type="text"
                                className="form-control form-control-sm"
                                placeholder='Quote ID'
                                value={quoteId}
                                onChange={(e) => setQuoteId(e.target.value)}
                            />
                        </div>
                        <div className="col-2 mb-3">
                            <input
                                type="text"
                                className="form-control form-control-sm"
                                placeholder='Ref ID'
                                value={refID}
                                onChange={(e) => setRefId(e.target.value)}
                            />
                        </div>
                        <div className="col-2 mb-3">
                            <select
                                id="user_id"
                                className=" px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 form-control form-control-sm slt-x-isu "

                                value={selectedUser}
                                ref={selectUserRef}
                            >
                                <option value="">Select User</option>
                                {users.map(user => (
                                    <option key={user.id} value={user.id}>
                                        {user.fld_first_name + " " + user.fld_last_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="col-2 mb-3" style={{ display: (currentTlEmail == "balakumar.v@dissertationindia.net" || currentTlEmail == "rc.tech.3@dissertationindia.net") ? "none" : "" }}>
                            <select
                                id="service_name"
                                className=" px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 form-control form-control-sm"

                                value={selectedService}
                                ref={selectServiceRef}
                            >
                                <option value="">Select Service</option>
                                {services.map(service => (
                                    <option key={service.id} value={service.id}>
                                        {service.name}
                                    </option>
                                ))}
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
                        <div className='col-2' style={{ display: (currentTlEmail == "balakumar.v@dissertationindia.net" || currentTlEmail == "rc.tech.3@dissertationindia.net") ? "none" : "" }}>
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
                        <div className="col-2 mb-3">

                            <select
                                className="form-control form-control-sm"
                                value={quoteIssue}
                                onChange={(e) => setQuoteIssue(e.target.value)}
                            >
                                <option value="">Quote Issue</option>
                                <option value="1">Yes</option>
                            </select>
                        </div>
                        <div className="col flex items-center justify-end">
                            {/* <label>&nbsp;</label> */}
                            <div className='flex'>
                                <button className="bg-gray-200 text-gray-500  hover:bg-gray-300  f-12 btn px-2 py-1 mr-2" onClick={resetFilters}>
                                    <RefreshCcw size={14} />
                                </button>
                                <button className="gree text-white mr-1 flex items-center f-12 btn px-2 py-1" onClick={() => { fetchQuotes(false) }}>
                                    <Filter size={12} /> &nbsp;
                                    Apply
                                </button>

                            </div>


                        </div>
                    </div>


                </div>
            </div>

            {loading ? (
                <TableLoader />
            ) : (
                <div className='bg-white p-4 border-t-2 border-blue-400 rounded'>
                    <div className="table-scrollable">
                        <DataTable
                            data={quotes}
                            columns={columns}
                            options={{
                                pageLength: 50,
                                ordering: false,
                                createdRow: (row, data) => {
                                    $(row).find('.view-btn').on('click', () => handleViewButtonClick(data));
                                },
                            }}
                        />
                    </div>
                </div>
            )}

            <AnimatePresence>


                {isDetailsOpen && (

                    <QueryDetailsTl
                        onClose={toggleDetailsPage}
                        quotationId={selectedQuote}
                        queryId={selectedQuery.ref_id}
                        after={() => { fetchQuotes(false) }}
                        tlType={loopuserObject.tl_type}
                        tagAccess={loopuserObject.scopetagaccess}
                    />

                )}
                {isAllFeasOpen && (
                    <FeasabilityPage onClose={toggleAllFeasPage} after={() => { fetchQuotes(false) }} />
                )}
                {selectuserDiv && (
                    <SelectUsers onClose={toggleUsersDiv} />
                )}

                {statsModalOpen && (
                    <StatsModal
                        onClose={() => setStatsModalOpen(false)}
                        dayData={
                            selectedTabForStats.includes("today") ? stats.today : stats.yesterday
                        }
                        activeTab={
                            selectedTabForStats.includes("submitted") ? "submitted" : "discount"
                        }
                    />
                )}
            </AnimatePresence>

        </motion.div>
    );
};

export default ManageOpsPage;