import React, { useState } from "react";
import { motion } from "framer-motion";
import { Ban, CircleCheck, X } from "lucide-react";
import TransferQueryDetails from "./TransferQueryDetails";
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import transferGif from '../transfer.gif';

const TransferDetailsModal = ({ refId, userName, fromUserName, onClose, after }) => {
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [actionType, setActionType] = useState("");

    const loopuserData = localStorage.getItem('loopuser');

    const loopuserObject = JSON.parse(loopuserData);

    // Handle API request for approve/reject
    const handleAction = async () => {
        try {
            const response = await fetch("https://loopback-skci.onrender.com/api/scope/approvetransferrequest", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ref_id: refId,
                    status: actionType,
                    admin_id: loopuserObject.id
                }),
            });

            const result = await response.json();
            if (response.ok) {
                toast.success(`Request successfully ${actionType === "approve" ? "approved" : "rejected"}.`);
                onClose(); // Close modal after success
            } else {
                toast.error(result.message || "Something went wrong.");
            }
        } catch (error) {
            toast.error("Failed to process the request.");
        } finally {
            setShowConfirmation(false);
            after();
        }
    };

    // Show confirmation modal
    const handleConfirm = (type) => {
        setActionType(type);
        setShowConfirmation(true);
    };

    return (
        <div
            className="fixed inset-0 flex items-center justify-center z-50"
            style={{
                backdropFilter: "blur(10px)", // Transparent blur background
                backgroundColor: "rgba(255, 255, 255, 0.1)", // Slight white overlay
            }}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-lg shadow-lg w-[95%] max-w-5xl mx-auto p-6"
                style={{
                    maxHeight: "90vh", // Restrict modal height to viewport
                    overflowY: "auto", // Enable scrolling if content overflows
                }}
            >
                <div className="flex justify-between items-center mb-4">
                    <div className="flex justify-start space-x-1 items-center">
                        <h2 className="text-xl font-semibold">
                            <strong>{userName}</strong> is requesting access
                        </h2>
                        <div className="flex justify-start space-x-4 ml-3">
                            <button
                                onClick={() => handleConfirm("approve")}
                                className="bg-green-500 flex items-center justify-start text-white py-1 px-2 text-sm rounded hover:bg-green-600 transition"
                            >
                                Approve <CircleCheck className="ml-2" size={20} />
                            </button>
                            <button
                                onClick={() => handleConfirm("reject")}
                                className="bg-red-500 flex items-center justify-start text-white py-1 px-2 text-sm rounded hover:bg-red-600 transition"
                            >
                                Reject <Ban className="ml-2" size={20} />
                            </button>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white hover:text-red-500 transition-colors p-1 rounded-full bg-red-600 hover:bg-red-500"
                    >
                        <X size={15} />
                    </button>
                </div>
                <div
                    className="overflow-y-auto"
                    style={{
                        maxHeight: "calc(90vh - 100px)",
                    }}
                >
                    <TransferQueryDetails queryId={refId} />
                </div>

            </motion.div>

            {/* Confirmation Modal */}
            {showConfirmation && (
                <div
                    className="fixed inset-0 flex items-center justify-center z-50"
                    style={{
                        backdropFilter: "blur(10px)", // Transparent blur background
                        backgroundColor: "rgba(0, 0, 0, 0.3)", // Dark overlay for confirmation
                    }}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.3 }}
                        className="bg-white rounded-lg shadow-lg w-[90%] max-w-md mx-auto p-6"
                    >
                        <div className="mb-4">
                            <h3 className="text-lg font-semibold text-gray-700 text-center">
                                Are you sure you want to {actionType} this request?
                            </h3>
                            {fromUserName && fromUserName != "" && fromUserName != null && (
                                <div className="flex items-center justify-center">
                                    <h3>{fromUserName}</h3>
                                    <img src={transferGif} />
                                    <h3>{userName}</h3>
                                </div>
                            )}

                            {actionType == "approve" && (
                                <span className="text-gray-400 mt-2 text-sm"> All the Scope and Feasibility requests will be transferred to this particular user</span>
                            )}
                        </div>
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={() => setShowConfirmation(false)}
                                className="bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAction}
                                className={`py-2 px-4 rounded text-white transition ${actionType === "approve" ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"
                                    }`}
                            >
                                Confirm
                            </button>
                        </div>
                    </motion.div>

                </div>
            )}
        </div>
    );
};

export default TransferDetailsModal;
