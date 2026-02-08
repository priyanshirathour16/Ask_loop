import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import 'react-toastify/dist/ReactToastify.css';
import CustomLoader from '../CustomLoader';

const HistorySideBar = ({ refId, quoteId, onClose }) => {
    const [quoteHistoryData, setQuoteHistoryData] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch Quote History Data
    const fetchQuoteHistory = async () => {
        try {
            const response = await fetch('https://loopback-skci.onrender.com/api/scope/getquotehistory', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ref_id: refId, quote_id: quoteId }),
            });

            if (response.ok) {
                const data = await response.json();
                if (data.status) {
                    setQuoteHistoryData(data.historyData);
                } else {
                    console.error('No history data found.');
                }
            } else {
                console.error('Failed to fetch history:', response.statusText);
            }
        } catch (error) {
            console.error('Error fetching quote history:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQuoteHistory();
    }, [refId, quoteId]);

    return (
        <motion.div
            initial={{ x: '100%' }}
            animate={{ x: '0' }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed right-0 top-0 h-full w-1/3 bg-gray-100 shadow-lg z-50 overflow-y-auto mt-0"
        >
            <div className='flex items-center justify-between bg-blue-400 text-white p-3'>
                <h2 className="text-xl font-semibold">Quote History </h2>

                <button
                    onClick={onClose}
                    className="text-white  hover:text-red-500 transition-colors p-1 rounded-full bg-red-600 hover:bg-red-500"
                >
                    {/* <CircleX size={32} /> */}
                    <X size={15} />
                </button>
            </div>

            {/* History Content */}
            <div className="p-3 space-y-4">
                {loading ? (
                    <CustomLoader />
                ) : quoteHistoryData.length > 0 ? (
                    quoteHistoryData.map((item) => (
                        <div
                            key={item.id}
                            className="bg-white p-2 rounded shadow-sm d-flex justify-between align-items-center "
                        >
                            <p className="text-sm text-gray-600">
                                <strong> {item.fld_first_name} {item.fld_last_name}</strong> {item.message}
                            </p>


                            <p className="text-xs text-gray-500 text-right">{new Date(item.created_at).toLocaleString('en-US', {
                                weekday: 'short',
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: true
                            })}</p>

                        </div>
                    ))
                ) : (
                    <p className="text-center text-gray-600">No history available.</p>
                )}
            </div>
        </motion.div>
    );
};

export default HistorySideBar;
