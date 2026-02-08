import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import 'react-toastify/dist/ReactToastify.css';
import CustomLoader from '../CustomLoader';

const FeasHistorySideBar = ({ refId, quoteId, onClose }) => {
    const [quoteHistoryData, setQuoteHistoryData] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch Quote History Data
    const fetchFeasibilityHistory = async () => {
        const payload = {
            ref_id: refId,
            quote_id: quoteId,
        };

        try {
            setLoading(true);
            const response = await fetch('https://loopback-skci.onrender.com/api/scope/getFeasabilityHistory', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();
            if (data.status) {
                setQuoteHistoryData(data.historyData)
            }
        } catch (error) {
            console.error("Error fetching feasibility history:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFeasibilityHistory();
    }, [refId, quoteId]);

    return (
        <motion.div
            initial={{ x: '100%' }}
            animate={{ x: '0' }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed right-0 top-0 h-full w-1/3 bg-gray-100 shadow-lg z-50 overflow-y-auto"
        >
            <div className='flex items-center justify-between bg-blue-400 text-white p-3'>
                <h2 className="text-xl font-semibold">Feasibility History </h2>

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
                {loading && <CustomLoader />}
                {quoteHistoryData.length > 0 && (
                    <div className="space-y-4">
                        <strong className="">Feasibility Check History:</strong>
                        <div className="">
                            {quoteHistoryData.map((historyItem, index) => (
                                <div key={historyItem.id} className="mb-4">
                                    <div className="flex items-start space-x-3">
                                        {/* Timeline Icon */}
                                        <div className="w-h-2 bg-blue-500 rounded-full mt-1"></div>
                                        <div className="flex flex-col">
                                            {/* User Details */}
                                            <p className=" font-semibold text-gray-700">
                                                {historyItem.from_first_name} {" " + historyItem.from_last_name}
                                                {historyItem.to_first_name && historyItem.to_first_name && (<span className="text-gray-500 text-xs"> to </span>)}

                                                {historyItem.to_first_name} {" " + historyItem.to_last_name}
                                            </p>
                                            <p className=" text-gray-500">{historyItem.created_at}</p>
                                            {/* Message */}
                                            <p className="text-gray-600">{historyItem.message}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default FeasHistorySideBar;
