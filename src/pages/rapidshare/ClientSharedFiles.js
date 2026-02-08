import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CirclePause, X, Lock, CircleHelp, FileText, ArrowLeft, CircleArrowLeft, Folder, Home } from 'lucide-react';
import toast from 'react-hot-toast';
import upleft from '../../upleft.svg';

const ClientSharedFiles = ({ userId, onClose, queryInfo }) => {
    const [files, setFiles] = useState([]);
    const [folders, setFolders] = useState([]);
    const [selectedFolder, setSelectedFolder] = useState(0);
    const [loading, setLoading] = useState(false);

    const fetchFiles = async (folderId) => {

        try {
            if (queryInfo?.email_id == undefined || queryInfo?.email_id == null) {
                // toast.error('Email is required to fetch files.');
                return;
            }
            if (queryInfo?.website_name == undefined || queryInfo?.website_name == null) {
                toast.error('Website name is required to fetch files.');
                return;
            }
            setLoading(true);
            const response = await fetch(`https://rapidcollaborate.com/rapidshare/api/Api/getAllClientFiles`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: userId, folder: folderId }),
            });
            const data = await response.json();
            if (data.status) {
                setFiles(data.files || []);
                setFolders(data.folders || []);
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
        fetchFiles(0);
    }, [queryInfo])

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

    // Helper function to format the uploaded_at date (with time)
    const formatUploadedAt = (date) => {
        return new Date(date).toLocaleString("en-GB", {
            weekday: "short",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
            hour12: true,
        });
    };

    // Helper function to format the date (expiration date without time)
    const formatDate = (date) => {
        return new Date(date).toLocaleString("en-GB", {
            weekday: "short",
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const getDaysLeft = (date) => {
        const today = new Date();
        const expirationDate = new Date(date.replace(" ", "T")); // Convert '2025-06-23 22:24:29' to '2025-06-23T22:24:29'
        const timeDiff = expirationDate - today;
        const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

        // If daysLeft is negative, it means the file is expired
        if (daysLeft < 0) {
            return `Expired ${Math.abs(daysLeft)} days ago`;
        }
        return `Expires in: ${daysLeft} days`;
    };

    const handleRequestAccess = async (file) => {
        try {
            const response = await fetch(`https://rapidcollaborate.com/rapidshare/api/Api/request_access`, {
                method: "POST",
                headers: {
                    "Content-type": "application/json"
                },
                body: JSON.stringify({ file_id: file.id })
            })
            const data = await response.json();
            if (data.status) {
                toast.success(data.message || "Access requested");
                fetchFiles(0);
            } else {
                toast.error(data.message || "Error while requesting accesss")
            }

        } catch (err) {
            console.log("Error while requestig access" + err)
        }
    };

    const [selectedFolderName, setSelectedFolderName] = useState(null);

    const handleFolderClick = (folderName, folderId) => {
        setSelectedFolderName(folderName);
        setSelectedFolder(folderId);
        fetchFiles(folderId);
    };

    return (
        <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed mt-0 top-0 right-0 w-[400px] h-full bg-white shadow-lg z-50"
        >
            <div className="flex justify-between items-center pl-3 pr-2 py-3 border-b bg-blue-500 text-white mb-2">
                <h2 className="text-lg font-semibold">Client Shared Files</h2>
                <button onClick={onClose} className="btn btn-danger btn-sm d-flex items-center f-12">
                    <ArrowLeft size={11} className='mr-1' /> Back
                </button>
            </div>

            {loading ? (
                renderSkeleton()
            ) : (
                <div className="space-y-4 h-full overflow-y-auto mb-24 pb-24 px-1">

                    <div className="flex gap-3 px-2">
                        {!selectedFolderName ? (
                            <span className="cursor-pointer hover:text-blue-600 flex items-center space-x-1">
                                <Home size={20} onClick={() => handleFolderClick(null, 0)} />
                                <span>/</span>
                            </span>
                        ) : (
                            <div className='flex items-center w-full justify-between'> 
                                <div className="flex items-center space-x-2">
                                    <span className="text-gray-400 flex items-center space-x-1 cursor-pointer">
                                        <Home size={20} onClick={() => handleFolderClick(null, 0)} />
                                        <span>/</span>
                                    </span>
                                    <span className="cursor-pointer hover:text-blue-600">
                                        {selectedFolderName}
                                    </span>
                                </div>
                                <button
                                    onClick={() => {
                                        handleFolderClick(null, 0);
                                    }}
                                    className="flex items-center f-11 btn btn-outline-dark btn-sm  py-0.5"
                                >
                                    <img src={upleft} className="w-3 h-3 mr-1 rotate-90" />
                                    Back
                                </button>
                            </div>
                        )}
                    </div>
                    {folders.length > 0 && selectedFolder == 0 ? (
                        <div className="space-y-2">
                            {folders.map((folder) => (
                                <div
                                    key={folder.id}
                                    onDoubleClick={() =>
                                        handleFolderClick(folder.name, folder.id)
                                    }
                                    className=" cursor-pointer flex items-center justify-start rounded border border-gray p-2 px-2 hover:shadow-sm hover:bg-gray-100 transition"
                                >
                                    <div className="text-[#092e46] rounded-full flex items-center justify-center">
                                        <Folder
                                            size={20}
                                            className="fill-orange-200"
                                            stroke="0"
                                        />
                                    </div>
                                    <h3 className="font-semibold text-gray-800 ml-1 f-13 flex items-center">
                                        {folder.name}{" "}
                                        <span className="border-1 border-gray-400 rounded-full h-4 w-4 flex items-center justify-center ml-3 f-11">
                                            {folder.file_count ?? 0}
                                        </span>
                                    </h3>

                                </div>
                            ))}
                        </div>
                    ) : null}

                    {files.length === 0 ? (
                        <div className="text-gray-500 text-center py-6">
                            Client haven’t uploaded any files yet.
                        </div>
                    ) : (
                        <div className="space-y-4 h-full overflow-y-auto mb-24 pb-24 px-1 ">
                            {files.map((file, idx) => {
                                const isExpired = new Date(file.date) < new Date();
                                return (
                                    <div
                                        key={idx}
                                        className={` ${file.is_trashed == 1 ? "bg-red-100" : "bg-gray-50"} border border-gray-200 rounded p-2 hover:shadow-sm transition`}
                                    >
                                        <div className="flex items-start gap-2">
                                            <FileText size={20} className="text-blue-500" />
                                            <div>
                                                <p className="text-sm font-semibold text-gray-800">
                                                    {file.file_name}
                                                </p>
                                                <p className="text-xs text-gray-500 capitalize mt-1">
                                                    <span
                                                        className={
                                                            file.access_type === "download"
                                                                ? "text-green-500"
                                                                : "text-blue-500"
                                                        }
                                                    >
                                                        {file.access_type}
                                                    </span>{" "}
                                                    • {formatUploadedAt(file.uploaded_at)}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1 flex items-center">
                                                    <CircleHelp
                                                        size={12}
                                                        className="mr-1 cursor-pointer"
                                                        data-tooltip-id="my-tooltip"
                                                        data-tooltip-content="Your files will be deleted after 60 days of uploaded date unless you restore it."
                                                    />
                                                    <span
                                                        data-tooltip-id="my-tooltip"
                                                        data-tooltip-content={`Expires on: ${formatDate(file.date)}`}
                                                    >
                                                        {getDaysLeft(file.date)}
                                                    </span>
                                                </p>
                                            </div>
                                        </div>

                                        {/* If file is expired, show the request access button */}
                                        <div className='flex justify-end mt-1'>
                                            {isExpired ? (
                                                file.access_requested == 1 ?
                                                    <button className="btn btn-danger btn-sm f-11">
                                                        Request Pending
                                                    </button> :
                                                    <button
                                                        onClick={() => handleRequestAccess(file)}
                                                        className="btn btn-warning btn-sm f-11"
                                                    >
                                                        Request Access
                                                    </button>
                                            ) : (
                                                <a
                                                    href={`https://${queryInfo.website_name}/rapidshare/api/uploads/final/${file.final_name}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    download={file.access_type === "download"}
                                                    className="btn btn-primary btn-sm f-11"
                                                >
                                                    {file.access_type === "download" ? "Download" : "View"}
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </motion.div>
    );
};

export default ClientSharedFiles;
