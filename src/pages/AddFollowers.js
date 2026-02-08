import React, { useState, useEffect, useRef } from 'react';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import 'react-quill/dist/quill.snow.css';
import ReactQuill from 'react-quill';
import $ from 'jquery';
import 'select2/dist/css/select2.min.css';
import 'select2';
import CustomLoader from '../CustomLoader';
import { getSocket } from "./Socket";


const AddFollowers = ({ refId, quoteId, after, onClose, userId, notification }) => {
    const [formData, setFormData] = useState({
        users: [],
    });

    const [currencies, setCurrencies] = useState([]);
    const [services, setServices] = useState([]);
    const [users, setUsers] = useState([]);
    const userRef = useRef(null);
    const [file, setFile] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(false);
    const userData = localStorage.getItem('loopuser');
    const socket = getSocket();

    const userObject = JSON.parse(userData);

    const plans = ['Basic', 'Standard', 'Advanced'];
    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const response = await fetch('https://loopback-skci.onrender.com/api/scope/getRequestDetails', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ref_id: refId, quote_id: quoteId, }),
            });

            const data = await response.json();
            if (data.status) {
                const details = data.data;
                const usersArray = details.followers ? details.followers.split(',') : [];

                setFormData({
                    users: usersArray, // Set tags as an array
                });
                setTimeout(() => {
                    $(userRef.current).val(usersArray).trigger('change');
                }, 2000)
            } else {
                toast.error('Failed to fetch request details.');
            }
        } catch (error) {
            console.error('Error fetching request details:', error);
            toast.error('Error fetching request details.');
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await fetch('https://loopback-skci.onrender.com/api/scope/getAllUsersForFollowers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: userObject.id, }),
            });
            const data = await response.json();
            if (data.status) setUsers(data.data || []);
        } catch (error) {
            toast.error('Failed to fetch tags.');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (plan) => {
        setFormData((prev) => ({
            ...prev,
            plan: prev.plan.includes(plan)
                ? prev.plan.filter((p) => p != plan)
                : [...prev.plan, plan],
        }));
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const payload = new FormData();
            payload.append('ref_id', refId);
            payload.append('quote_id', quoteId);
            payload.append('followers', formData.users);
            payload.append('user_id', userObject.id);
            payload.append('notification', notification);
            payload.append('admin_id', userObject.id)

            const response = await fetch('https://loopback-skci.onrender.com/api/scope/updateFollowers', {
                method: 'POST',
                headers: {
                    "Content-type": "application/json"
                },
                body: JSON.stringify({
                    ref_id: refId,
                    quote_id: quoteId,
                    followers: formData.users,
                    user_id: userObject.id,
                    notification,
                    admin_id: userObject.id,
                }),
            });

            const data = await response.json();
            if (data.status) {
                toast.success('Request updated successfully.');
                after();
                const user_name = userObject.fld_first_name + " " + userObject.fld_last_name;
                socket.emit('addedFollowers', {
                    quote_id: quoteId,
                    ref_id: refId,
                    user_name: user_name
                })
                onClose();
            } else {
                toast.error('Failed to update request.');
            }
        } catch (error) {
            console.error('Error updating request:', error);
            toast.error('Error updating request.');
        } finally {
            setSubmitting(false);
        }
    };

    useEffect(() => {
        fetchUsers();
        fetchInitialData();
    }, []);


    useEffect(() => {
        // Initialize select2 for Tags
        $(userRef.current).select2({
            placeholder: "Select Users",
            allowClear: true,
            multiple: true,
        }).on('change', (e) => {
            const selectedValues = $(e.target).val();
            setFormData((prev) => ({ ...prev, users: selectedValues }));
        });


        $(userRef.current).val(formData.users).trigger('change');


        return () => {
            // Clean up select2 on component unmount
            if (userRef.current) {
                $(userRef.current).select2('destroy');
            }
        };
    }, [users]);


    const planColors = {
        Basic: 'text-blue-400', // Custom brown color
        Standard: 'text-gray-400', // Silver color
        Advanced: 'text-yellow-500', // Gold color
    };

    return (
        <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed right-0 h-full w-1/3 bg-gray-100 shadow-lg z-50 overflow-y-auto "
            style={{ top: "0px" }}
        >
            <div className="bg-white p-6 shadow rounded-md space-y-4 h-100">
                <div className="flex items-center justify-between bg-blue-400 text-white p-2">
                    <h2 className="text-xl font-semibold flex items-center">Add Followers </h2>
                    <button onClick={onClose} className="text-white hover:text-red-500 transition-colors p-1 rounded-full bg-red-600 hover:bg-red-500">
                        <X size={15} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className={`form-wrapper ${loading ? 'loading' : ''}`} >
                    <div className="w-full p-2">

                        <div className='w-full ad-tab-inp'>
                            {/* Tags */}
                            <label>Users</label>
                            <select
                                name="users"
                                id="users"
                                className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 form-control select2-hidden-accessible"
                                multiple
                                value={formData.users}
                                ref={userRef}
                            >
                                <option value="">Select Tags</option>
                                {users.map((user) => (
                                    <option key={user.id} value={user.id}>
                                        {user.fld_first_name + " " + user.fld_last_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className='mt-3 text-right'>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="bg-blue-500 text-white px-2 py-1 rounded f-14"
                        >
                            {submitting ? 'Submitting...' : 'Update Request'}
                        </button>
                    </div>
                </form>

            </div>
        </motion.div>
    );
};

export default AddFollowers;
