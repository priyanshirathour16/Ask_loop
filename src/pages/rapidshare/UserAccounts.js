import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CirclePause,UserCircle , X, Lock, CircleHelp, FileText, Plus, ArrowRight, CircleArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import ClientSharedFiles from './ClientSharedFiles';

const UserAccounts = ({ onClose, queryInfo }) => {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [filesOpen, setFilesOpen] = useState(false);

    const fetchAccounts = async () => {

        try {
            if (queryInfo?.email_id == undefined || queryInfo?.email_id == null) {
                // toast.error('Email is required to fetch files.');
                return;
            }

            setLoading(true);
            const response = await fetch(`https://rapidcollaborate.com/rapidshare/api/Api/getAllAccounts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: queryInfo.email_id, website: queryInfo.website_name }),
            });
            const data = await response.json();
            if (data.status) {
                setAccounts(data.accounts || []);
            } else {
                toast.error(data.message || 'Failed to fetch files.');
            }

        } catch (error) {
            console.log('Failed to fetch files.');
        } finally {
            setLoading(false);

        }
    }

    useEffect(() => {
        fetchAccounts();
    }, [queryInfo])

    const createRapidShareAccount = async () => {
        try {
            if(!window.confirm("Are you sure want to create another account?")){
                return;
            }
            if (!queryInfo.website_name) {
                toast.error("Website not found for this query.");
                return;
            }
            if (!queryInfo.email_id) {
                toast.error("Client Email not found for this query.");
                return;
            }

            const response = await fetch(`https://www.rapidcollaborate.com/rapidshare/api/Api/registerUser`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: queryInfo.email_id,

                }),
            })
            const data = await response.json();
            if (data.status) {
                toast.success(data.message || "RapidShare account created successfully.");
                fetchAccounts()
            } else {
                toast.error(data.message || "Failed to create RapidShare account.");
            }

        } catch (err) {
            console.error("Error creating RapidShare account:", err);
        }
    }
    const renderSkeleton = () => (
        <div className="space-y-4">
            {[1, 2, 3].map((i) => (
                <div
                    key={i}
                    className="flex justify-between items-center bg-gray-100 border border-gray-200 rounded-xl p-4 animate-pulse"
                >
                    <div className="flex items-center gap-3">
                        <div className="h-6 w-6 bg-gray-300 rounded" />
                        <div>
                            <div className="h-3 w-40 bg-gray-300 rounded mb-2"></div>
                            <div className="h-2 w-24 bg-gray-300 rounded"></div>
                        </div>
                    </div>
                    <div className="h-8 w-20 bg-gray-300 rounded-lg"></div>
                </div>
            ))}
        </div>
    );

    const handleViewBtnClick = (userId) => {
        setSelectedAccount(userId);
        setFilesOpen(true);
    }
    return (
        <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed mt-0 top-0 right-0 w-[400px] h-full bg-white shadow-lg z-50"
        >
            <div className="flex justify-between items-center pl-3 pr-2 py-3 border-b bg-blue-500 text-white">
                <h2 className="text-lg font-semibold">User Accounts</h2>
                <button onClick={onClose} className="text-white hover:text-red-500 transition-colors p-1 rounded-full bg-red-600 hover:bg-red-500">
                    <X  size={15} />
                </button>
            </div>
            <div class="p-2 flex justify-content-end mb-1">
                {/* <button 
                    data-tooltip-id="my-tooltip"
                    data-tooltip-content="Create Another Account"
                    title='Create Another RapidShare Account'
                    onClick={createRapidShareAccount}
                    
                    className="btn btn-info btn-sm d-flex items-center f-12" >
                        <Plus size={10} className="mr-1" /> Create New
                </button> */}
            </div>

            {loading ? (
                renderSkeleton()
            ) : accounts.length === 0 ? (
                <div className="text-gray-500 text-center py-6">
                    No Accounts found with this email.
                </div>
            ) : (
                <div className="space-y-4 h-full overflow-y-auto mb-24 pb-24 px-2 ">
                    {accounts.map((account, index) => (
                        <div
                        key={account.id || index}
                        className="bg-white border border-gray-200 rounded space-y-1 shadow-sm hover:shadow-md transition p-2"
                      >
                        <div className="flex items-start">
                            <UserCircle size={20} className="bg-blue-50 text-blue-600 rounded-full mr-2" />
                            <div>
                                <div className="flex items-center justify-start">
                                    <div className="text-sm font-medium text-gray-800">Username: {account.username || 'N/A'}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500">Email: {account.email}</div>
                                </div>
                            </div>
                        </div>
                      
                        <div className='flex justify-end'>
                            <button
                            className="btn btn-primary btn-sm f-11 n-btn py-1 flex items-center justify-center"
                            onClick={() => handleViewBtnClick(account.id)}
                            >
                            View <ArrowRight className='ml-1' size={10} />
                            </button>
                        </div>
                      </div>
                    ))}

                </div>
            )}
            <AnimatePresence>
                {filesOpen && (
                    <ClientSharedFiles userId={selectedAccount} queryInfo={queryInfo} onClose={() => { setFilesOpen(false) }} />
                )}
            </AnimatePresence>

        </motion.div>
    );
};

export default UserAccounts;
