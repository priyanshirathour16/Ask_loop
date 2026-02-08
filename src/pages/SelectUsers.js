import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import 'react-toastify/dist/ReactToastify.css';
import CustomLoader from '../CustomLoader';
import ManageContactMadeQueriesForTl from './ManageContactMadeQueriesForTl';

const SelectUsers = ({ onClose }) => {
    const [usersData, setUsersData] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedLoopUser, setSelectedLoopUser] = useState(null);
    const [selectedInstaUser, setSelectedInstaUser] = useState(null);
    const [queryPageOpen, setQueryPageOpen] = useState(false);

    const viewQuery = (loopuserid, instauserid) => {
        setSelectedLoopUser(loopuserid);
        setSelectedInstaUser(instauserid);
        // console.log(loopuserid, instauserid)
        setQueryPageOpen(true);
    };

    // Fetch Users Data
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
                body: JSON.stringify({ user_id: userId }),
            });

            if (response.ok) {
                const data = await response.json();
                if (data.status) {
                    setUsersData(data.data);
                    setFilteredUsers(data.data); // Initialize the filtered users
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

    // Handle search input
    const handleSearch = (event) => {
        const query = event.target.value.toLowerCase();
        const filtered = query
            ? usersData.filter((user) => user.name.toLowerCase().includes(query))
            : usersData; // If the query is empty, show all users
        setFilteredUsers(filtered);
    };


    useEffect(() => {
        fetchUsers();
    }, []);

    return (
        <motion.div
            initial={{ x: '100%' }}
            animate={{ x: '0' }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed right-0 top-0 h-full w-1/3 bg-gray-100 shadow-lg z-50 overflow-y-auto mt-0"
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

            {/* Search Bar */}
            <div className="p-3">
                <input
                    type="text"
                    placeholder="Search users..."
                    onKeyUp={handleSearch}
                    className="w-full p-2 border border-gray-300 rounded shadow-sm"
                />
            </div>

            {/* Users Content */}
            <div className="p-3 space-y-4">
                {loading ? (
                    <CustomLoader />
                ) : filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                        <div
                            key={user.user_id}
                            className="bg-white p-2 rounded shadow-sm d-flex justify-between align-items-center"
                        >
                            <p className="text-sm text-gray-600">
                                <strong>{user.name}</strong>
                            </p>
                            <button
                                className="bg-blue-500 rounded text-white px-2 py-1 text-sm"
                                onClick={() => viewQuery(user.admin_id, user.user_id)}
                            >
                                Add
                            </button>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-gray-600">No users available.</p>
                )}
            </div>
            <AnimatePresence>
                {queryPageOpen && (
                    <ManageContactMadeQueriesForTl onClose={() => { setQueryPageOpen(!queryPageOpen) }} loopUserId={selectedLoopUser} instaUserId={selectedInstaUser} />
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default SelectUsers;
