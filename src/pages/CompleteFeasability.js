import React, { useState, useEffect, useRef } from 'react';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import 'react-toastify/dist/ReactToastify.css';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import 'react-quill/dist/quill.snow.css';
import ReactQuill from 'react-quill';
import $ from 'jquery';
import 'select2/dist/css/select2.min.css';
import 'select2';
import CustomLoader from '../CustomLoader';
import { io } from "socket.io-client";
import { getSocket } from './Socket';
const CompleteFeasability = ({ refId, quoteId, after, onClose, userId, notification, quoteFollowers }) => {
    const socket = getSocket();
    const [feasabilityComments, setFeasabilityComments] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [loading, setLoading] = useState(false);

    const loopUserData = localStorage.getItem('loopuser');

    const loopUserObject = JSON.parse(loopUserData);

    useEffect(() => {
        const savedComments = localStorage.getItem(`feasabilityComments_${quoteId}`);
        if (savedComments) {
            setFeasabilityComments(savedComments);  // Set the comment state for this specific quotationId
        }
    }, [quoteId]);  // Re-run when the `quotationId` changes



    const handleCommentsChange = (value) => {
        setFeasabilityComments(value);
        localStorage.setItem(`feasabilityComments_${quoteId}`, value);
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
                    <h2 className="text-xl font-semibold flex items-center">Give Feasibility Comments {loading && (<CustomLoader />)}</h2>
                    <button onClick={onClose} className="text-white hover:text-red-500 transition-colors p-1 rounded-full bg-red-600 hover:bg-red-500">
                        <X size={15} />
                    </button>
                </div>

                <form
                    onSubmit={async (e) => {
                        e.preventDefault();

                        const formData = new FormData();
                        formData.append("ref_id", refId);
                        formData.append("quote_id", quoteId);
                        formData.append("feasability_comments", feasabilityComments);
                        formData.append("user_id", loopUserObject.id);
                        formData.append("ref_user_id", userId);
                        formData.append("followers", quoteFollowers);

                        if (selectedFile) {
                            formData.append("file", selectedFile); // Append the file if selected
                        }
                        try {
                            const response = await fetch("https://loopback-skci.onrender.com/api/scope/completeFeasabilityNew", {
                                method: "POST",
                                body: formData, // Use FormData for file upload
                            });

                            const result = await response.json();
                            if (result.status) {
                                toast.success("Feasibility completed successfully!");
                                onClose();
                                after();
                                socket.emit("feasabilityCompleted", {
                                    ref_id: refId,
                                    quote_id: quoteId,
                                    user_id: userId,
                                    user_name: loopUserObject.fld_first_name + " " + loopUserObject.fld_last_name
                                })
                            } else {
                                toast.error(result.message || "Failed to complete feasibility.");
                            }
                        } catch (error) {

                            console.error(error);
                        }
                    }}
                >
                    <label htmlFor="feasabilityComments" className="block text-sm font-medium text-gray-700">
                        Feasibility Comments
                    </label>
                    <ReactQuill
                        value={feasabilityComments}
                        onChange={handleCommentsChange}
                        className="mt-1"
                        theme="snow"
                        placeholder="Add your comments here"

                    />
                    <div className="mt-4">
                        <label htmlFor="fileUpload" className="block text-sm font-medium text-gray-700">
                            Attach File (Optional)
                        </label>
                        <div className="relative mt-1">
                            <input
                                type="file"
                                id="fileUpload"
                                onChange={(e) => setSelectedFile(e.target.files[0])}
                                className="block w-full text-sm text-gray-500 border border-gray-300 rounded-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 p-2"
                            />
                        </div>
                        {selectedFile && (
                            <div className="mt-2 flex items-center justify-between bg-gray-100 p-2 rounded-md border border-gray-300">
                                <span className="text-sm text-gray-600 truncate">{selectedFile.name}</span>
                                <button
                                    type="button"
                                    onClick={() => setSelectedFile(null)}
                                    className="text-sm text-red-600 hover:underline focus:outline-none"
                                >
                                    Remove
                                </button>
                            </div>
                        )}
                    </div>

                    <div className='flex items-center justify-end'>
                        <button
                            type="submit"
                            className="bg-green-500 mt-2 text-white px-2 py-1 rounded-md hover:bg-green-600 focus:outline-none f-14"
                        >
                            Mark as Complete
                        </button>
                    </div>
                </form>

            </div>
        </motion.div>
    );
};

export default CompleteFeasability;
