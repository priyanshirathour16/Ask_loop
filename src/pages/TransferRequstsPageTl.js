import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CustomLoader from '../CustomLoader'; // Assuming you have this loader component
import DataTable from 'datatables.net-react';
import DT from 'datatables.net-dt';
import $ from 'jquery';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCcw, X } from 'lucide-react';
import QueryDetails from './QueryDetails';
import TransferDetailsModal from './TransferDetailsModal';
import UserTableLoading from '../components/UserTableLoading';



const TransferRequestsPageTl = ({ onClose, after, userIdDefined }) => {
    const [quoteSummary, setQuoteSummary] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedQuery, setSelectedQuery] = useState('');
    const [selectedUsername, setSelectedUsername] = useState('');
    const [selectedFromUsername, setSelectedFromUsername] = useState('');
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    const userData = localStorage.getItem('loopuser');

    const userObject = JSON.parse(userData);

    // Fetch data from the API
    const fetchQuoteSummary = async () => {
        setLoading(true); // Show loading spinner

        let hasResponse = false;
        try {
            const response = await fetch(
                'https://loopback-skci.onrender.com/api/scope/getalltransferrequestsfortl',
                {
                    method: 'POST', // Use POST method
                    headers: {
                        'Content-Type': 'application/json', // Set content type to JSON
                    },
                    body: JSON.stringify({ users: userObject.tl_users }),
                }
            );

            const data = await response.json(); // Parse the response as JSON
            console.log(data)
            if (data.status) {
                setQuoteSummary(data.data); // Update the quotes state

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
        setSelectedUsername(query.fld_first_name + " " + query.fld_last_name)
        setSelectedFromUsername(query.from_user_name);
        console.log(selectedQuery)
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
            title: 'Ref ID',
            data: 'ref_id', // Matches the field name in the JSON response
            orderable: true,
        },
        {
            title: 'User Name',
            data: null,
            orderable: true,
            render: (data, type, row) => {
                // Combine the first name and last name for display
                return `${row.fld_first_name} ${row.fld_last_name}`;
            },
        },
        {
            title: 'Created Date',
            data: 'created_on', // Matches the field name in the JSON response
            orderable: true,
            render: (data) => {
                if (data) {
                    // Format the date
                    const date = new Date(data);
                    const day = date.getDate().toString().padStart(2, '0');
                    const month = (date.getMonth() + 1).toString().padStart(2, '0');
                    const year = date.getFullYear();
                    const hours = date.getHours().toString().padStart(2, '0');
                    const minutes = date.getMinutes().toString().padStart(2, '0');
                    const seconds = date.getSeconds().toString().padStart(2, '0');
                    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
                }
                return 'N/A';
            },
        },
        {
            title: 'Status',
            data: 'status', // Matches the field name in the JSON response
            orderable: true,
            render: (data) => {
                // Display status in a more user-friendly format
                return data == '1' ? 'Active' : 'Inactive';
            },
        },
        {
            title: 'Actions',
            data: null,
            orderable: false,
            render: (data, type, row) => `
                <button class="view-btn vd mx-1 p-1 text-white" style="font-size:10px; border-radius:3px;" data-id="${row.id}">
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
                    <h2 className="text-xl font-semibold">All Transfer Requests </h2>


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
                                order: [[2, 'desc']],
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

                    <TransferDetailsModal
                        onClose={toggleDetailsPage}
                        fromUserName={selectedFromUsername}
                        refId={selectedQuery}
                        userName={selectedUsername}
                        after={fetchQuoteSummary}
                    />

                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default TransferRequestsPageTl;