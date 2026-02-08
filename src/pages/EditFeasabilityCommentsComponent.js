import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import axios from 'axios';
import { X } from 'lucide-react';
import CustomLoader from '../CustomLoader';
import { getSocket } from "./Socket";


const EditFeasibilityCommentsComponent = ({ quote, onClose, after }) => {
    const [feasibilityComments, setFeasibilityComments] = useState("");
    const [loading, setLoading] = useState(false);
    const socket = getSocket();

    // Fetch feasibility comments when component mounts or quote.id changes
    useEffect(() => {
        const fetchFeasibilityComments = async () => {
            if (quote.assign_id && quote.quoteid) {
                setLoading(true);
                try {
                    const response = await axios.post('https://loopback-skci.onrender.com/api/scope/getFeasibilityComments', {
                        ref_id: quote.assign_id,
                        quote_id: quote.quoteid,
                    });

                    if (response.data.status) {
                        // Properly set feasibilityComments from the API response
                        setFeasibilityComments(response.data.feasibilityComments?.feasability_comments || "");
                    } else {
                        toast.error("Failed to fetch feasibility comments.");
                    }
                } catch (error) {
                    toast.error("Error fetching feasibility comments.");
                    console.log(error);
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchFeasibilityComments();
    }, [quote.assign_id, quote.quoteid]);


    const handleCommentsChange = (value) => {
        setFeasibilityComments(value);
    };

    const handleSubmit = async () => {
        setLoading(true);
        const dataToSubmit = {
            ref_id: quote.assign_id,
            quote_id: quote.quoteid,
            feasibility_comments: feasibilityComments,
        };

        try {
            const response = await axios.post('https://loopback-skci.onrender.com/api/scope/updateFeasabilityComments', dataToSubmit);
            if (response.data.status) {
                toast.success("Feasibility comments updated successfully!");
                onClose(); // Close the form after successful submission
                socket.emit('editedFeasibilityComments', {
                    quote_id: quote.quoteid,
                    ref_id: quote.assign_id
                })
                after(); // Call after to update the parent component if needed
            } else {
                toast.error("Failed to update feasibility comments.");
            }
        } catch (error) {
            toast.error("Error updating feasibility comments.");
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed right-0 h-full w-1/2 bg-gray-100 shadow-lg z-50 overflow-y-auto" style={{ top: "-20px" }}>
            <div className="bg-white p-6 shadow rounded-md space-y-4">
                <div className="flex items-center justify-between bg-blue-400 text-white p-2">
                    <h2 className="text-xl font-semibold flex items-center">Edit Feasibility Comments </h2>
                    <button onClick={onClose} className="text-white hover:text-red-500 transition-colors p-1 rounded-full bg-red-600 hover:bg-red-500">
                        <X size={15} />
                    </button>
                </div>

                <div className="form-group">
                    <label htmlFor="feasibility_comments" className="control-label">
                        Feasibility Comments
                    </label>
                    <ReactQuill
                        value={feasibilityComments}
                        onChange={handleCommentsChange}
                        className="mt-1"
                        theme="snow"
                        placeholder="Add your comments here"
                    />
                </div>

                <div className="box-footer p-2">
                    <button
                        type="button"
                        className="btn pull-right btn-success"
                        onClick={handleSubmit}
                        disabled={loading}
                    >
                        Submit
                    </button>
                </div>
            </div>

        </div>
    );
};

export default EditFeasibilityCommentsComponent;
