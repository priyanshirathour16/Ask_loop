import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import CustomLoader from '../CustomLoader'; // Assuming you have this loader component
import DataTable from 'datatables.net-react';
import DT from 'datatables.net-dt';
import $ from 'jquery';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCcw, X, Filter } from 'lucide-react';
import QueryDetails from './QueryDetails';
import FeasabilityQueryDetails from './FeasabilityQueryDetails';
import AdminFeasViewDetails from './AdminFeasViewDetails';
import AdminFeasQueryDetails from './AdminFeasQueryDetails';
import UserTableLoading from '../components/UserTableLoading';


const AllFeasPage = ({ onClose }) => {
    const [quoteSummary, setQuoteSummary] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pendingCount, setPendingCount] = useState(0);
    const [approvedCount, setApprovedCount] = useState(0);
    const [selectedQuery, setSelectedQuery] = useState('');
    const [selectedQuote, setSelectedQuote] = useState('');
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState('');
    const [selectedAssignUser, setSelectedAssignUser] = useState('');
    const [users, setUsers] = useState([]);
    const [status, setStatus] = useState('');
    const selectUserRef = useRef(null);

    const selectAssignRef = useRef(null);

    const userData = localStorage.getItem('loopuser');

    const userObject = JSON.parse(userData);

    // Fetch data from the API
    const fetchQuoteSummary = async () => {
        setLoading(true); // Show loading spinner
        let hasResponse = false;

        try {
            const response = await fetch(
                'https://loopback-skci.onrender.com/api/scope/getAllFeasabilityForAdmin',
                {
                    method: 'POST', // Use POST method
                    headers: {
                        'Content-Type': 'application/json', // Set content type to JSON
                    },
                    body: JSON.stringify({ user_id: selectedUser, assign_user: selectedAssignUser, feas_status: status }),
                }
            );

            const data = await response.json(); // Parse the response as JSON
            // console.log(data)
            if (data.status) {
                setQuoteSummary(data.data); // Update the quotes state
                setPendingCount(data.pending_count);
                setApprovedCount(data.approved_count);
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

    const toggleDetailsPage = () => {
        setIsDetailsOpen(!isDetailsOpen);
    };

    const handleViewBtnClick = (query) => {
        setSelectedQuery(query.ref_id);
        setSelectedQuote(query.id);
        setIsDetailsOpen(true);

    };

    const finalFunction = () => {
        setIsDetailsOpen(false);
        fetchQuoteSummary();
    }

    // Use DataTable library
    DataTable.use(DT);

    const fetchUsers = async () => {

        try {
            const response = await fetch(
                'https://loopback-skci.onrender.com/api/scope/getAllUsersForAdmin',
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
                setUsers(data.data);
            } else {
                console.error('Failed to fetch Services:', data.message);
            }
        } catch (error) {
            console.error('Error fetching Services:', error);
        }
    };

    useEffect(() => {
        fetchQuoteSummary();
        fetchUsers();
    }, []);

    const refresh = () => {
        setSelectedUser('');
        setSelectedAssignUser('');
        $(selectUserRef.current).val('').trigger('change');
        $(selectAssignRef.current).val('').trigger('change');
        setStatus('');
        fetchQuoteSummary();
    }

    useEffect(() => {
        // Initialize select2 for Select Team
        $(selectUserRef.current).select2({
            placeholder: "Select Created User",
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
        $(selectAssignRef.current).select2({
            placeholder: "Select Assign User",
            allowClear: true,
        }).on('change', (e) => {
            setSelectedAssignUser($(e.target).val());
        });


        return () => {
            // Destroy select2 when the component unmounts
            if (selectAssignRef.current) {
                $(selectAssignRef.current).select2('destroy');
            }
        };
    }, [users]);

    const columns = [
        {
            title: 'Ref Id',
            data: 'ref_id', // Replace with actual field name
            orderable: false,
        },
        {
            title: 'Ask For Scope Id',
            data: 'id', // Replace with actual field name
            orderable: false,
            className: 'text-center',
        },
        {
            title: 'Created By',
            data: 'null', // Replace with actual field name
            orderable: false,
            className: 'text-center',
            render: function (data, type, row) {

                return `<span class="text-gray-600">${row.created_by_first_name + " " + row.created_by_last_name}</span>`;
            },
        },
        {
            title: 'Assigned To',
            data: 'null', // Replace with actual field name
            orderable: false,
            className: 'text-center',
            render: function (data, type, row) {

                return `<span class="text-gray-600">${row.assigned_to_first_name + " " + row.assigned_to_last_name}</span>`;
            },
        },
        {
            title: 'Feasibility Status',
            data: 'feasability_status', // Replace with actual field name
            orderable: false,
            render: function (data, type, row) {
                if (data == 'Pending') {
                    return '<span class="text-red-600 font-bold">Feasibility Pending</span>';
                } else if (data == 'Completed') {
                    return '<span class="text-green-600 font-bold">Feasibility Completed</span>';
                }
                return '<span class="text-gray-600">Unknown</span>';
            },
        },

        {
            title: 'Service',
            data: 'service_name', // Replace with actual field name
            orderable: false,
        },
        {
            title: 'Currency',
            data: 'currency', // Replace with actual field name
            render: function (data, type, row) {
                if (data == "Other") {
                    return row.other_currency;
                } else {
                    return row.currency;
                }
            },
        },
        {
            title: 'RC Demo',
            data: 'demodone', // Replace with actual field name
            orderable: false,
            render: function (data, type, row) {
                if (data == 1) {
                    return '<span class="text-green-600 font-bold">Done</span>';
                } else if (data == 0) {
                    return '<span class="text-red-600 font-bold">Pending</span>';
                }
                return '<span>Unknown</span>';
            },
        },
        {
            title: 'Actions',
            data: null,
            orderable: false,
            render: (data, type, row) => `
        <button class="view-btn vd mx-1 p-1  text-white" style="font-size:10px;border-radius:3px;" data-id="${row.ref_id}">
          View Details
        </button>`,
        },
    ];



    return (
        <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed top-0 right-0 h-full w-full bg-gray-100 shadow-lg z-50 overflow-y-auto "
        >
            <div className='flex items-center justify-between bg-blue-400 text-white mb-3 py-3'>
                <div className='container flex items-center justify-between p-0'>
                    <h2 className="text-xl font-semibold">All Feasibility Request</h2>


                    <button
                        onClick={onClose}
                        className="text-white hover:text-red-500 transition-colors p-1 rounded-full bg-red-600 hover:bg-red-500"
                    >
                        {/* <CircleX size={32} /> */}
                        <X size={15} />
                    </button>
                </div>
            </div>
            <div className=" mb-3 bg-white container py-3 rounded ">
                <h1 className='text-xl font-bold mb-3'>All Feasibility List</h1>
                <div className='flex items-center space-x-2 aql'>

                    <div className="w-1/2">
                        <select
                            id="user_id"
                            className=" px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 form-control slt-x-isu "

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
                    <div className="w-1/2">
                        <select
                            id="assignuser_id"
                            className=" px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 form-control slt-x-isu "

                            value={selectedAssignUser}
                            ref={selectAssignRef}
                        >
                            <option value="">Select User</option>
                            {users.map(user => (
                                <option key={user.id} value={user.id}>
                                    {user.fld_first_name + " " + user.fld_last_name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="w-1/2 ss">

                        <select
                            className="form-control"
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                        >
                            <option value="">Select Status</option>
                            <option value="Pending">Feasibility Pending</option>
                            <option value="Completed">Feasibility Completed</option>
                        </select>
                    </div>
                    <div className="w-1/2 flex justify-content-end space-x-2 items-center">
                        <button className="gree text-white flex items-center" onClick={fetchQuoteSummary}>
                            <Filter size={12} /> &nbsp;
                            Apply
                        </button>

                        <button
                            onClick={refresh}
                            data-tooltip-id="my-tooltip"
                            data-tooltip-content="Refresh"
                            className="flex items-center bg-blue-400 text-white  hover:text-blue-600 hover:bg-blue-500 transition-colors px-2 py-1 f-12 rounded shadow"
                        >
                            Refresh <RefreshCcw size={15} className="ml-2" />
                        </button>
                    </div>
                </div>
            </div>

            {loading ? (
                <UserTableLoading />
            ) : (
                <div className='bg-white p-4 border-t-2 border-blue-400 rounded container '>
                    <div className="table-scrollable">
                        <DataTable
                            data={quoteSummary}
                            columns={columns}
                            options={{
                                pageLength: 50,
                                ordering: false,
                                createdRow: (row, data) => {
                                    $(row).find('.view-btn').on('click', () => handleViewBtnClick(data));
                                },
                            }}
                        />
                    </div>
                </div>
            )}
            <AnimatePresence>


                {isDetailsOpen && (

                    <AdminFeasQueryDetails
                        onClose={toggleDetailsPage}
                        quotationId={selectedQuote}
                        queryId={selectedQuery}
                        finalFunction={finalFunction}
                    />

                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default AllFeasPage;
