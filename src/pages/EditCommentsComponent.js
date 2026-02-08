import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import axios from 'axios';
import { X } from 'lucide-react';
import CustomLoader from '../CustomLoader';
import { motion } from 'framer-motion';
import { getSocket } from "./Socket";

const EditCommentsComponent = ({ quote, plan, comment, wordCount, onClose, after }) => {
    const [editedComment, setEditedComment] = useState(comment || "");
    const [editedWordCount, setEditedWordCount] = useState(wordCount);
    const [loading, setLoading] = useState(false);
    const socket = getSocket();

    const loopuserData = localStorage.getItem("loopuser");
    const loopUserObject = JSON.parse(loopuserData);

    const modules = {
        toolbar: [
            [{ 'header': [1, 2, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'color': [] }, { 'background': [] }], // Text color & highlight
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['blockquote', 'code-block'],
            ['clean']
        ]
    };

    const handleCommentChange = (value) => {
        setEditedComment(value);
    };

    const handleWordCountChange = (e) => {
        const value = parseInt(e.target.value, 10);
        setEditedWordCount(isNaN(value) ? 0 : value);
    };

    const handleSubmit = async () => {
        setLoading(true);
        const dataToSubmit = {
            ref_id: quote.assign_id,
            quote_id: quote.quoteid,
            plan: plan,
            comment: editedComment,
            word_count: editedWordCount,
            user_id: loopUserObject.id
        };

        try {
            const response = await axios.post('https://loopback-skci.onrender.com/api/scope/updatePlanComments', dataToSubmit);
            if (response.data.status) {
                toast.success("Comment updated successfully!");
                onClose(); // Close the form after successful submission
                socket.emit("commentsEdited", {
                    quote_id: quote.quoteid,
                    ref_id: quote.assign_id,
                });
                after(); // Call after to update the parent component if needed
            } else {
                toast.error("Failed to update comment.");
            }
        } catch (error) {
            toast.error("Error updating comment.");
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed right-0 h-full w-1/2 bg-gray-100 shadow-lg z-50 overflow-y-auto "
            style={{ top: "-20px" }}
        >
            <div className="bg-white p-6 shadow rounded-md space-y-4">
                <div className="flex items-center justify-between bg-blue-400 text-white p-2">
                    <h2 className="text-xl font-semibold flex items-center">Edit Comment for {plan} Plan {loading && <CustomLoader />}</h2>
                    <button onClick={onClose} className="text-white hover:text-red-500 transition-colors p-1 rounded-full bg-red-600 hover:bg-red-500">
                        <X size={15} />
                    </button>
                </div>

                <div className="form-group">
                    <label className="control-label">Comment</label>
                    <ReactQuill
                        value={editedComment}
                        onChange={handleCommentChange}
                        className="mt-1"
                        theme="snow"
                        placeholder="Add your comments here"
                        modules={modules}
                    />
                </div>
                {wordCount && wordCount != null ? (
                    <div className="form-group">
                        <label className="control-label">Word Count</label>
                        <input
                            type="number"
                            className="form-control mt-1"
                            value={editedWordCount}
                            onChange={handleWordCountChange}
                            min={0}
                        />
                    </div>
                ) : ""}

                <div className="box-footer p-2">
                    <button
                        type="button"
                        className="btn pull-right btn-success btn-sm"
                        onClick={handleSubmit}
                        disabled={loading}
                    >
                        Submit
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default EditCommentsComponent;
