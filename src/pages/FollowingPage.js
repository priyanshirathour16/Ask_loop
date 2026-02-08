import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CustomLoader from '../CustomLoader'; // Assuming you have this loader component
import DataTable from 'datatables.net-react';
import DT from 'datatables.net-dt';
import $ from 'jquery';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCcw, X } from 'lucide-react';
import QueryDetails from './QueryDetails';
import QueryDetailsFollowing from './QueryDetailsFollowing';
import { getSocket } from "./Socket";
import { useNavigate } from 'react-router-dom';


const FollowingPage = ({ onClose, after, sharelinkrefid, sharelinkquoteid }) => {
    const [quoteSummary, setQuoteSummary] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pendingCount, setPendingCount] = useState(0);
    const [approvedCount, setApprovedCount] = useState(0);
    const [discountCount, setDiscountCount] = useState(0);
    const [selectedQuery, setSelectedQuery] = useState('');
    const [selectedQuote, setSelectedQuote] = useState('');
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const socket = getSocket();
    const userData = localStorage.getItem('loopuser');
    const navigate = useNavigate();

    const userObject = JSON.parse(userData);

    // Fetch data from the API
    const fetchQuoteSummary = async () => {
        setLoading(true); // Show loading spinner

        let hasResponse = false;
        try {
            const response = await fetch(
                'https://loopback-skci.onrender.com/api/scope/getFollowingTasks',
                {
                    method: 'POST', // Use POST method
                    headers: {
                        'Content-Type': 'application/json', // Set content type to JSON
                    },
                    body: JSON.stringify({ user_id: userObject.id, }),
                }
            );

            const data = await response.json(); // Parse the response as JSON
            console.log(data)
            if (data.status) {
                setQuoteSummary(data.data); // Update the quotes state
                setPendingCount(data.pending_count);
                setApprovedCount(data.approved_count);
                setDiscountCount(data.discount_count);
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
    const fetchQuoteSummaryforSocket = async () => {


        let hasResponse = false;
        try {
            const response = await fetch(
                'https://loopback-skci.onrender.com/api/scope/getFollowingTasks',
                {
                    method: 'POST', // Use POST method
                    headers: {
                        'Content-Type': 'application/json', // Set content type to JSON
                    },
                    body: JSON.stringify({ user_id: userObject.id, }),
                }
            );

            const data = await response.json(); // Parse the response as JSON
            console.log(data)
            if (data.status) {
                setQuoteSummary(data.data); // Update the quotes state
                setPendingCount(data.pending_count);
                setApprovedCount(data.approved_count);
                setDiscountCount(data.discount_count);
            } else {
                console.error('Failed to fetch Details:', data.message);
            }
            hasResponse = true;
        } catch (error) {
            console.error('Error fetching details:', error);
        }
    };

    useEffect(() => {
        socket.on('followersUpdated', (data) => {
            fetchQuoteSummaryforSocket();
        });

        return () => {
            socket.off('followersUpdated');  // Clean up on component unmount
        };
    }, []);

    const toggleDetailsPage = () => {
        setIsDetailsOpen(!isDetailsOpen);
    };

    const handleViewBtnClick = (query) => {
        setSelectedQuery(query.ref_id);
        setSelectedQuote(query.id);
        setIsDetailsOpen(true);
    };

    useEffect(() => {
        if (sharelinkrefid && sharelinkquoteid) {
            setSelectedQuery(sharelinkrefid);
            setSelectedQuote(sharelinkquoteid);
            setIsDetailsOpen(true);
        }
    }, [sharelinkrefid, sharelinkquoteid]);

    // Use DataTable library
    DataTable.use(DT);

    useEffect(() => {
        fetchQuoteSummary();
    }, []);

    const close = () => {
        if (onClose) {
            onClose();
        } else {
            navigate('/assignquery');
        }
        if (after) { after() }
    }

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
            title: 'Status',
            data: 'status', // Replace with actual field name
            orderable: false,
            render: function (data, type, row) {
                if (row.isfeasability == 0) {
                    if (data == 0) {
                        return '<span class="text-red-600 font-bold">Pending</span>';
                    } else if (data == 1) {
                        return '<span class="text-green-600 font-bold">Submitted</span>';
                    } else if (data == 2) {
                        return '<span class="text-yellow-600 font-bold">Discount Requested</span>';
                    }
                    return '<span class="text-gray-600">Unknown</span>';
                } else {
                    if (row.feasability_status == 'Pending') {
                        return '<span class="text-red-600 font-bold">Feasibility Submitted</span>';
                    } else {
                        return '<span class="text-green-600 font-bold">Feasibility Completed</span>';
                    }
                }
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
            className="fixed top-0 right-0 h-full w-full bg-gray-100 shadow-lg z-50 overflow-y-auto  "
        >
            <div className='bg-blue-400 text-white py-3 mb-3'>
                <div className='container flex items-center justify-between p-0'>
                    <h2 className="text-xl font-semibold">Following Tasks </h2>


                    <button
                        onClick={close}
                        className="text-white hover:text-red-500 transition-colors p-1 rounded-full bg-red-600 hover:bg-red-500"
                    >

                        <X size={15} />
                    </button>
                </div>
            </div>
            <div className="flex justify-end mb-3 bg-white container py-3 rounded ">


                <button
                    onClick={fetchQuoteSummary}
                    className="flex items-center bg-blue-400 text-white hover:text-blue-600 hover:bg-blue-500 transition-colors px-2 py-1 f-12 rounded shadow"
                >
                    Refresh <RefreshCcw size={15} className="ml-2" />
                </button>
            </div>

            {loading ? (
                <CustomLoader />
            ) : (
                <div className='bg-white p-4 border-t-2 border-blue-400 rounded container'>
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

                    <QueryDetailsFollowing
                        onClose={() => {
                            setIsDetailsOpen(!isDetailsOpen);
                        }}
                        quotationId={selectedQuote}
                        queryId={selectedQuery}
                        after={fetchQuoteSummary}
                    />

                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default FollowingPage;