import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import 'react-toastify/dist/ReactToastify.css';
import CustomLoader from '../CustomLoader';
import ManageContactMadeQueriesForTl from './ManageContactMadeQueriesForTl';
import axios from 'axios';

const AlreadyGivenList = ({ onClose }) => {
    const [usersData, setUsersData] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedLoopUser, setSelectedLoopUser] = useState(null);
    const [selectedInstaUser, setSelectedInstaUser] = useState(null);
    const [queryPageOpen, setQueryPageOpen] = useState(false);

    const [quotes, setQuotes] = useState([]);

    const userData = localStorage.getItem('user');
    const userObject = JSON.parse(userData);

    const viewQuery = () => {
        if (selectedLoopUser && selectedInstaUser) {
            // setQueryPageOpen(true);
            fetchQuotes();
        }
    };

    const fetchUsers = async () => {
        try {
            const loopUser = JSON.parse(localStorage.getItem('loopuser'));
            const userId = loopUser?.id;

            if (!userId) {
                console.error('User ID not found in localStorage');
                setLoading(false);
                return;
            }

            const response = await fetch('https://loopback-skci.onrender.com/api/scope/getAllassignedUsersfortl', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: userId, forAdmin: true }),
            });

            if (response.ok) {
                const data = await response.json();
                if (data.status) {
                    setUsersData(data.data);
                    setFilteredUsers(data.data);
                } else {
                    console.error('No users data found.');
                }
            } else {
                console.error('Failed to fetch users:', response.message);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const [Qloading, setQLoading] = useState(false)
    const fetchQuotes = async (nopayload = false) => {
        setQLoading(true);

        let hasResponse = false;
        let payload = { loop_user_id: selectedLoopUser, user_id: selectedInstaUser, search_keywords: "", ref_id: "", website: "", user_type: userObject.user_type, team_id: userObject.team_id, totalLimit: 200 }

        if (nopayload) {
            // If nopayload is true, send an empty payload
            payload = { loop_user_id: selectedLoopUser, user_id: selectedInstaUser, user_type: userObject.user_type, team_id: userObject.team_id, totalLimit: 200 };
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
                //setPendingFeasRequestCount(data.pendingFeasRequestCount ? data.pendingFeasRequestCount : 0)
            } else {
                console.error('Failed to fetch quotes:', data.message);
            }
            hasResponse = true;
        } catch (error) {
            console.error('Error fetching quotes:', error);
        } finally {
            if (hasResponse) {
                setQLoading(false); // Hide the loader
            }
        }
    };


    useEffect(() => {
        fetchUsers();
    }, []);

    const [quoteDetails, setQuoteDetails] = useState([]);

    useEffect(() => {
        const fetchAllQuoteDetails = async () => {
            try {
                const allDetailedQuotes = [];

                for (const quote of quotes) {
                    const { email_id, website_id } = quote;

                    if (!email_id || !website_id) continue;

                    const emailRes = await axios.post(
                        "https://loopback-skci.onrender.com/api/scope/checkpresentemail",
                        { email_id, website_id }
                    );

                    const quoteData = emailRes.data?.quote_details || [];

                    for (const q of quoteData) {
                        try {
                            const detailRes = await fetch(
                                "https://loopback-skci.onrender.com/api/scope/view_query_details_api",
                                {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ query_id: q.ref_id }),
                                }
                            );

                            const detailData = await detailRes.json();

                            const detailedQuote = {
                                ...q,
                                website_name: detailData?.queryInfo?.website_name || null,
                                ...(detailData.data || {})
                            };

                            allDetailedQuotes.push(detailedQuote);
                        } catch (err) {
                            console.error(`Failed to fetch detail for ref_id ${q.ref_id}`, err);
                        }
                    }
                }

                setQuoteDetails(allDetailedQuotes);
            } catch (error) {
                console.error("Error during quote detail processing:", error);
            }
        };

        if (quotes?.length) {
            fetchAllQuoteDetails();
        }
    }, [quotes]);

    // console.log(quoteDetails)

    return (
        <motion.div
            initial={{ x: '100%' }}
            animate={{ x: '0' }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed right-0 top-0 h-full w-full bg-gray-100 shadow-lg z-50 overflow-y-auto mt-0"
        >
            <div className="flex items-center justify-between bg-blue-400 text-white p-3">
                <h2 className="text-xl font-semibold">Select User</h2>
                <button
                    onClick={onClose}
                    className="text-white hover:text-red-500 transition-colors p-1 rounded-full bg-red-600 hover:bg-red-500"
                >
                    <X size={15} />
                </button>
            </div>

            <div className="p-3 space-y-4">
                {loading ? (
                    <CustomLoader />
                ) : (
                    <>
                        <div className='flex items-center'>
                            <select
                                className="w-1/3 p-2 border border-gray-300 rounded shadow-sm"
                                onChange={(e) => {
                                    const selectedUserId = parseInt(e.target.value);
                                    const selectedUser = usersData.find(u => u.user_id == selectedUserId);
                                    if (selectedUser) {
                                        setSelectedLoopUser(selectedUser.admin_id);
                                        setSelectedInstaUser(selectedUser.user_id);
                                    } else {
                                        setSelectedLoopUser(null);
                                        setSelectedInstaUser(null);
                                    }
                                }}
                            >
                                <option value="">Select a user</option>
                                {filteredUsers.map((user) => (
                                    <option key={user.user_id} value={user.user_id}>
                                        {user.name}
                                    </option>
                                ))}
                            </select>

                            {/* View/Add Button */}
                            <button
                                disabled={!selectedLoopUser || !selectedInstaUser}
                                onClick={viewQuery}
                                className={` bg-blue-500 text-white py-1 px-2 f-11 ml-2 rounded w-24 ${!selectedLoopUser || !selectedInstaUser
                                    ? 'opacity-50 cursor-not-allowed'
                                    : 'hover:bg-blue-600'
                                    }`}
                            >
                                View Queries
                            </button>
                        </div>
                        <div>
                            {quoteDetails.length > 0 && (
                                <div className="p-3">
                                    <h3 className="text-lg font-semibold mb-2 text-gray-800">Matched Quote Details</h3>
                                    <div className="overflow-x-auto border rounded-lg shadow">
                                        <table className="min-w-full divide-y divide-gray-200 text-sm text-left">
                                            <thead className="bg-gray-100 text-gray-700">
                                                <tr>
                                                    <th className="px-4 py-2">Ref ID</th>
                                                    <th className="px-4 py-2">Name</th>
                                                    <th className="px-4 py-2">Website</th>
                                                    <th className="px-4 py-2">Requirement</th>
                                                    <th className="px-4 py-2">Academic Level</th>
                                                    <th className="px-4 py-2">Date</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {quoteDetails.map((item, index) => (
                                                    <tr key={index} className="hover:bg-gray-50">
                                                        <td className="px-4 py-2">{item.ref_id}</td>
                                                        <td className="px-4 py-2">{item.client_name || '-'}</td>
                                                        <td className="px-4 py-2">{item.website_name || '-'}</td>
                                                        <td className="px-4 py-2">{item.service_name || '-'}</td>
                                                        <td className="px-4 py-2">{item.client_academic_level || '-'}</td>
                                                        <td className="px-4 py-2">{item.created_date || '-'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                        </div>
                    </>
                )}
            </div>

            {/* Subcomponent */}
            <AnimatePresence>

            </AnimatePresence>
        </motion.div>
    );
};

export default AlreadyGivenList;
