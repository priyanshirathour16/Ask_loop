import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CustomLoader from '../CustomLoader'; // Assuming you have this loader component
import DataTable from 'datatables.net-react';
import DT from 'datatables.net-dt';
import $ from 'jquery';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCcw, X } from 'lucide-react';
import QueryDetails from './QueryDetails';
import { io } from "socket.io-client";
import { getSocket } from './Socket';
import UserTableLoading from '../components/UserTableLoading';
const socket = getSocket();

const SummaryPage = ({ onClose, after, userIdDefined }) => {
    const [quoteSummary, setQuoteSummary] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pendingCount, setPendingCount] = useState(0);
    const [approvedCount, setApprovedCount] = useState(0);
    const [discountCount, setDiscountCount] = useState(0);
    const [selectedQuery, setSelectedQuery] = useState('');
    const [selectedQuote, setSelectedQuote] = useState('');
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    const userData = localStorage.getItem('loopuser');

    const userObject = JSON.parse(userData);

    // Fetch data from the API
    const fetchQuoteSummary = async () => {
        setLoading(true); // Show loading spinner

        let hasResponse = false;
        try {
            const response = await fetch(
                'https://loopback-skci.onrender.com/api/scope/getQuoteSummary',
                {
                    method: 'POST', // Use POST method
                    headers: {
                        'Content-Type': 'application/json', // Set content type to JSON
                    },
                    body: JSON.stringify({ user_id: (userIdDefined && userIdDefined != null && userIdDefined != "") ? userIdDefined : userObject.id, }),
                }
            );

            const data = await response.json(); // Parse the response as JSON
            // console.log(data)
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

    const toggleDetailsPage = () => {
        setIsDetailsOpen(!isDetailsOpen);
    };

    const handleViewBtnClick = (query) => {
        setSelectedQuery(query.ref_id);
        setSelectedQuote(query.id);
        // console.log(selectedQuery)
        setIsDetailsOpen(true);

    };

    // Use DataTable library
    DataTable.use(DT);

    useEffect(() => {
        fetchQuoteSummary();
    }, []);

    const close = () => {
        onClose();
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
            title: 'Client Name',
            data: 'client_name',
            orderable: false,
            className: 'text-center',
            render: function (data, type, row) {
                return data ? data : 'null'; // Check if data exists; if not, return 'null'
            },
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
            title: 'Created Date',
            data: 'created_date',
            orderable: true,
            render: (data, type, row) => {
                if (data) {
                    const date = new Date(data * 1000);
                    const day = date.getDate().toString().padStart(2, '0'); // Ensures two-digit day
                    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Ensures two-digit month
                    const year = date.getFullYear().toString(); // Gets year
                    const hours = date.getHours().toString().padStart(2, '0'); // Ensures two-digit hours
                    const minutes = date.getMinutes().toString().padStart(2, '0'); // Ensures two-digit minutes
                    const seconds = date.getSeconds().toString().padStart(2, '0'); // Ensures two-digit seconds

                    // Return the formatted date for display
                    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
                }
                return 'N/A';
            },
            // Sort based on the UNIX timestamp for correct ordering
            createdCell: (cell, cellData, rowData, row, col, table) => {
                // This is just in case you want to keep the original timestamp for sorting purposes
                $(cell).attr('data-sort', cellData);
            }
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
    useEffect(() => {
        socket.on('quoteReceived', (data) => {
            if (data.user_id == userObject.id) {
                setQuoteSummary((prev) => {
                    // Update the quote summary with the received data
                    return prev.map((quote) =>
                        quote.id == data.quote_id
                            ? { ...quote, status: 1 }
                            : quote
                    );
                });

            }
        });

        return () => {
            socket.off('quoteReceived');  // Clean up on component unmount
        };
    }, []);



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
                    <h2 className="text-xl font-semibold">All Quote Summary </h2>


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
                    <span className="ml-2 f-12 font-semibold">{pendingCount}</span>
                </div>
                <div className="flex items-center bg-yellow-400 text-white px-2 py-1 rounded shadow mr-2">
                    <span className="f-12">Discount Requested:</span>
                    <span className="ml-2 f-12 font-semibold">{discountCount}</span>
                </div>
                <div className="flex items-center bg-green text-white px-2 py-1 rounded shadow mr-2">
                    <span className="f-12">Submitted:</span>
                    <span className="ml-2 f-12 font-semibold">{approvedCount}</span> {/* Replace 5 with dynamic count */}
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
                                ordering: true, // Enable ordering for columns
                                order: [[7, 'desc']],
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

                    <QueryDetails
                        onClose={toggleDetailsPage}
                        quotationId={selectedQuote}
                        queryId={selectedQuery}
                        after={fetchQuoteSummary}
                        userIdDefined={userIdDefined}
                    />

                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default SummaryPage;