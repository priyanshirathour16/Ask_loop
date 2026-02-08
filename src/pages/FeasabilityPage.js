import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CustomLoader from '../CustomLoader'; // Assuming you have this loader component
import DataTable from 'datatables.net-react';
import DT from 'datatables.net-dt';
import $ from 'jquery';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCcw, X } from 'lucide-react';
import QueryDetails from './QueryDetails';
import FeasabilityQueryDetails from './FeasabilityQueryDetails';
import { getSocket } from './Socket';
import { io } from "socket.io-client";
import UserTableLoading from '../components/UserTableLoading';
import { useNavigate } from 'react-router-dom';
const socket = getSocket();

const FeasabilityPage = ({ onClose, after, sharelinkrefid, sharelinkquoteid }) => {
    const [quoteSummary, setQuoteSummary] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pendingCount, setPendingCount] = useState(0);
    const [selectedQuery, setSelectedQuery] = useState('');
    const [selectedQuote, setSelectedQuote] = useState('');
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const navigate = useNavigate();

    const userData = localStorage.getItem('loopuser');

    const userObject = JSON.parse(userData);

    // Fetch data from the API
    const fetchQuoteSummary = async () => {
        setLoading(true); // Show loading spinner
        let hasResponse = false;

        try {
            const response = await fetch(
                'https://loopback-skci.onrender.com/api/scope/getAllFeasabilityAssignedToUser',
                {
                    method: 'POST', // Use POST method
                    headers: {
                        'Content-Type': 'application/json', // Set content type to JSON
                    },
                    body: JSON.stringify({ user_id: userObject.id, }),
                }
            );

            const data = await response.json(); // Parse the response as JSON
            // console.log(data)
            if (data.status) {
                setQuoteSummary(data.data); // Update the quotes state
                setPendingCount(data.pending_count ? data.pending_count : 0);
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
    const fetchQuoteSummaryForSocket = async () => {

        try {
            const response = await fetch(
                'https://loopback-skci.onrender.com/api/scope/getAllFeasabilityAssignedToUser',
                {
                    method: 'POST', // Use POST method
                    headers: {
                        'Content-Type': 'application/json', // Set content type to JSON
                    },
                    body: JSON.stringify({ user_id: userObject.id, }),
                }
            );

            const data = await response.json(); // Parse the response as JSON
            // console.log(data)
            if (data.status) {
                setQuoteSummary(data.data); // Update the quotes state
                setPendingCount(data.pending_count ? data.pending_count : 0);
            } else {
                console.error('Failed to fetch Details:', data.message);
            }

        } catch (error) {
            console.error('Error fetching details:', error);
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
    useEffect(() => {
        if (sharelinkrefid && sharelinkquoteid) {
            setSelectedQuery(sharelinkrefid);
            setSelectedQuote(sharelinkquoteid);
            setIsDetailsOpen(true);
        }
    }, [sharelinkrefid, sharelinkquoteid]);

    const close = () => {
        if (onClose) {
            onClose();
        } else {
            navigate('/assignquery');
        }
        if (after) {
            after();
        }

    }
    // Use DataTable library
    DataTable.use(DT);

    useEffect(() => {
        fetchQuoteSummary();
    }, []);

    useEffect(() => {
        socket.on("updateTable", (data) => {
            // console.log(data);
            const formattedData = {
                ref_id: data.ref_id,
                id: data.id,
                feasability_status: data.feasability_status,
                service_name: data.service_name,
                currency: data.currency,
                other_currency: data.other_currency ?? null,
                demodone: data.demodone,
                tags: data.tag_names,
                status: data.status,
                fld_first_name: data.fld_first_name,
                created_date: data.created_date,

                comments: data.comments,
            };
            if (data.isfeasability == 1 && data.feasability_user == userObject.id) {
                setQuoteSummary((prevQuotes) => [...prevQuotes, formattedData]);
            }



        });


        return () => {
            socket.off("updateTable");
        };

    }, []);

    useEffect(() => {
        socket.on('feasTransferred', (data) => {
            if (data.user_id == userObject.id) {

                fetchQuoteSummaryForSocket();
            }
        });

        return () => {
            socket.off('feasTransferred');  // Clean up on component unmount
        };
    }, []);
    useEffect(() => {
        socket.on('feasabilityDone', (data) => {
            if (data.user_id == userObject.id) {

                fetchQuoteSummaryForSocket();
            }
        });

        return () => {
            socket.off('feasabilityDone');  // Clean up on component unmount
        };
    }, []);

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
            title: 'Raised by',
            data: 'created_by_first_name',
            orderable: false,
            render: function (data, type, row) {
                const fullName = `${row.created_by_first_name} ${row.created_by_last_name}`;

                if (row.isdeleted == 1) {
                    return `<span style="color: red; text-decoration: line-through;">${row.deleted_user_name}</span>`;
                }

                return `<span>${fullName}</span>`;
            },
        },
        {
            title: 'Feasibility Status',
            data: 'feasability_status', // Replace with actual field name
            orderable: false,
            render: function (data, type, row) {
                if (data == 'Pending') {
                    return '<span class="text-red-600 font-bold">Pending</span>';
                } else if (data == 'Completed') {
                    return '<span class="text-green-600 font-bold">Submitted</span>';
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
            <div className='bg-blue-400 text-white py-3 mb-3'>
                <div className='container flex items-center justify-between p-0'>
                    <h2 className="text-xl font-semibold">All Feasibility Request</h2>


                    <button
                        onClick={close}
                        className="text-white hover:text-red-500 transition-colors p-1 rounded-full bg-red-600 hover:bg-red-500"
                    >
                        {/* <CircleX size={32} /> */}
                        <X size={15} />
                    </button>
                </div>
            </div>
            <div className="flex justify-end mb-3 bg-white container py-3 rounded ">

                <div className="flex items-center bg-red-400 text-white px-2 py-1 rounded shadow mr-2">
                    <span className="f-12">Pending:</span>
                    <span className="ml-2 font-bold f-12">{pendingCount}</span>
                </div>
                <button
                    onClick={fetchQuoteSummary}
                    className="flex items-center bg-blue-400 text-white hover:text-blue-600 hover:bg-blue-500 transition-colors px-2 py-1 f-12 rounded shadow"
                >
                    Refresh <RefreshCcw size={15} className="ml-2" />
                </button>
            </div>

            {loading ? (
                <UserTableLoading />
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

                    <FeasabilityQueryDetails
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

export default FeasabilityPage;
