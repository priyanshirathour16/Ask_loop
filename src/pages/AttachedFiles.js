import React, { useEffect, useState } from "react";
import { CircleCheck, CircleX, FileDown, FileWarning, Paperclip, Home, Folder, FileText, CircleHelp } from "lucide-react"; // Make sure lucide-react is installed
import axios from "axios";
import toast from "react-hot-toast";
import upleft from '../upleft.svg';
import rcfav from '../rc-fav.png';
import drivepng from '../drivepng.png';




const AttachedFiles = ({ ref_id, relevant_file, quote, showUpload, setShowUpload, queryInfo }) => {
    const [chatFiles, setChatFiles] = useState([]);
    const [relevantFiles, setRelevantFiles] = useState([]);
    const [feasFiles, setFeasFiles] = useState([]);
    const [attachedFiles, setAttachedFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [GdriveLink, setGriveLink] = useState(null);

    const loopuserData = localStorage.getItem('loopuser');
    const loopUserObject = JSON.parse(loopuserData);
    let files = [];

    try {
        if (typeof relevant_file === "string") {
            files = JSON.parse(relevant_file);
        } else if (Array.isArray(relevant_file)) {
            files = relevant_file;
        }
    } catch (error) {
        console.error("Invalid JSON in relevant_file:", error);
    }

    const fileBaseURL = "https://apacvault.com/public/QuotationFolder/";

    //const quoteID = quote?.quoteid || quote?.quote_id;
    // Fetch chat attached files from API
    useEffect(() => {
        const fetchChatFiles = async () => {
            if (!ref_id) return;

            try {
                const response = await fetch("https://loopback-skci.onrender.com/api/scope/getchatattachedfiles", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ref_id: ref_id })
                });

                const result = await response.json();
                if (Array.isArray(result)) {
                    setChatFiles(result);
                }
            } catch (error) {
                console.error("Error fetching chat files:", error);
            }
        };

        fetchChatFiles();
    }, [ref_id]);

    useEffect(() => {
        const fetchGDriveLink = async () => {
            if (!queryInfo.email_id || !queryInfo.website_name) return;

            try {
                const response = await fetch(`https://callback-4kg4.onrender.com/api/api/getCallDriveLink?email=${queryInfo.email_id}&website=${queryInfo.website_name}`, {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                });

                const result = await response.json();
                if (result.status) {
                    setGriveLink(result.data);
                }
            } catch (error) {
                console.error("Error fetching chat files:", error);
            }
        };

        fetchGDriveLink();
    }, [queryInfo]);

    useEffect(() => {
        const fetchRelevantFiles = async () => {
            if (!ref_id) return;

            try {
                const response = await fetch("https://loopback-skci.onrender.com/api/scope/getallrelevantfiles", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ref_id: ref_id })
                });

                const result = await response.json();
                if (Array.isArray(result)) {
                    setRelevantFiles(result);
                }
            } catch (error) {
                console.error("Error fetching relevant files:", error);
            }
        };

        fetchRelevantFiles();
    }, [ref_id]);

    useEffect(() => {
        const fetchFeasFiles = async () => {
            if (!ref_id) return;

            try {
                const response = await fetch("https://loopback-skci.onrender.com/api/scope/getAllFeasFiles", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ref_id: ref_id })
                });

                const result = await response.json();
                if (Array.isArray(result)) {
                    setFeasFiles(result);
                }
            } catch (error) {
                console.error("Error fetching relevant files:", error);
            }
        };

        fetchFeasFiles();
    }, [ref_id]);

    const fetchAttachedFiles = async () => {
        if (!quote.quoteid) return;

        try {
            const response = await fetch("https://loopback-skci.onrender.com/api/scope/fetchallattachedfiles", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ quote_id: quote.quoteid })
            });

            const result = await response.json();
            if (Array.isArray(result.files)) {
                setAttachedFiles(result.files);
                // console.log("Attached files:", result.files);
            }
        } catch (error) {
            console.error("Error fetching chat files:", error);
        }
    };
    useEffect(() => {


        fetchAttachedFiles();
    }, [quote.quoteid]);

    const [accounts, setAccounts] = useState([]);
    const [accountData, setAccountData] = useState({});
    const fetchAccounts = async () => {

        try {
            if (queryInfo?.email_id == undefined || queryInfo?.email_id == null) {
                // toast.error('Email is required to fetch files.');
                return;
            }

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

        }
    }

    useEffect(() => {
        fetchAccounts();
    }, [queryInfo]);

    const fetchAllRootFiles = async () => {
        let newAccountData = {};

        for (const account of accounts) {
            try {
                const response = await fetch(`https://rapidcollaborate.com/rapidshare/api/Api/getAllClientFiles`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ user_id: account.id, folder: 0 }),
                });
                const data = await response.json();
                if (data.status) {
                    newAccountData[account.id] = {
                        folders: data.folders || [],
                        files: data.files || [],
                        selectedFolder: 0,
                        selectedFolderName: null
                    };
                }
            } catch (error) {
                console.log(`Error fetching files for account ${account.id}`);
            }
        }

        setAccountData(newAccountData);
    };


    const [rcFilesLoading, setRcFilesLoading] = useState(false);
    const [rcFiles, setRcFiles] = useState([]);
    const [folders, setFolders] = useState([]);
    const [selectedFolder, setSelectedFolder] = useState(0);
    const fetchFiles = async (folderId) => {

        try {
            if (queryInfo?.email_id == undefined || queryInfo?.email_id == null) {
                toast.error('Email is required to fetch files.');
                return;
            }
            if (queryInfo?.website_name == undefined || queryInfo?.website_name == null) {
                toast.error('Website name is required to fetch files.');
                return;
            }
            setRcFilesLoading(true);
            const response = await fetch(`https://rapidcollaborate.com/rapidshare/api/Api/getAllClientFiles`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    //  user_id: userId,
                    user_id: 1,
                    folder: folderId
                }),
            });
            const data = await response.json();
            if (data.status) {
                setRcFiles(data.files || []);
                setFolders(data.folders || []);
            } else {
                toast.error(data.message || 'Failed to fetch files.');
            }

        } catch (error) {
            console.log('Failed to fetch files.');
        } finally {
            setRcFilesLoading(false);

        }
    }

    const [selectedFolderName, setSelectedFolderName] = useState(null);
    const [loadingAccounts, setLoadingAccounts] = useState({});

    const handleFolderClick = async (accountId, folderId, folderName) => {
        try {
            setLoadingAccounts(prev => ({ ...prev, [accountId]: true }));
            const response = await fetch(`https://rapidcollaborate.com/rapidshare/api/Api/getAllClientFiles`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: accountId, folder: folderId }),
            });
            const data = await response.json();
            if (data.status) {
                setAccountData(prev => ({
                    ...prev,
                    [accountId]: {
                        ...prev[accountId],
                        files: data.files || [],
                        folders: folderId === 0 ? data.folders || [] : prev[accountId].folders,
                        selectedFolder: folderId,
                        selectedFolderName: folderName
                    }
                }));
            }
        } catch (error) {
            console.log(`Failed to fetch folder ${folderId} for account ${accountId}`);
        } finally {
            setLoadingAccounts(prev => ({ ...prev, [accountId]: false }));
        }
    };
    useEffect(() => {
        if (accounts.length > 0) {
            fetchAllRootFiles();
        }
    }, [accounts]);



    const [accountCreated, setAccountCreated] = useState(false);


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
                fetchAllRootFiles();
            } else {
                toast.error(data.message || "Error while requesting accesss")
            }

        } catch (err) {
            console.log("Error while requestig access" + err)
        }
    };




    const [selectedFiles, setSelectedFiles] = useState([]);

    const handleFileChange = (e) => {
        setSelectedFiles([...e.target.files]);
    };

    const handleUpload = async () => {
        if (selectedFiles.length === 0) return;

        const formData = new FormData();
        formData.append("user_id", loopUserObject.id); // Replace with dynamic user_id if needed
        formData.append("quote_id", quote.quoteid);
        formData.append("ref_id", quote.assign_id);
        selectedFiles.forEach((file) => {
            formData.append("quote_upload_file[]", file);
        });

        try {
            setUploading(true);
            const res = await axios.post(
                "https://loopback-skci.onrender.com/api/scope/upload_attach_file",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );
            // console.log("Upload success:", res.data);
            setShowUpload(false);
            setSelectedFiles([]);
            fetchAttachedFiles();

        } catch (err) {
            console.error("Upload failed:", err);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="bg-white p-x-2 elevenpx">

            {quote.parent_quote !== 1 && (
                <>
                    {showUpload && (
                        <div className="bg-gray-100 p-2 m-2 flex items-center gap-2">
                            <input
                                type="file"
                                multiple
                                onChange={handleFileChange}
                                className="form-control form-control-sm"
                            />
                            <div className="flex justify-end items-center gap-2 sm:mt-0">
                                <button
                                    onClick={handleUpload}
                                    className="btn btn-success btn-sm px-1"
                                    title="Upload"
                                    disabled={selectedFiles.length === 0 || uploading}
                                >
                                    <CircleCheck size={16} />
                                </button>
                                <button
                                    onClick={() => {
                                        setShowUpload(false);
                                        setSelectedFiles([]);
                                    }}
                                    className="btn btn-danger btn-sm px-1"
                                    title="Cancel"
                                >
                                    <CircleX size={16} />
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
            {GdriveLink && Array.isArray(GdriveLink) && (
                <div className="p-3 bg-gray-50 rounded-lg overflow-x-auto">
                    <p className="font-semibold mb-2 flex items-center"><img src={drivepng} className="h-5 w-5" /> Call Recordings:</p>
                    <ul className="list-disc list-inside space-y-1">
                        {GdriveLink
                            .filter(link => link.fld_call_complete_recording) // only non-null
                            .map((link, index) => (
                                <li key={index}>
                                    <a
                                        href={link.fld_call_complete_recording}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline break-all"
                                    >
                                        {link.fld_call_complete_recording.length > 80
                                            ? `${link.fld_call_complete_recording.slice(0, 40)}...${link.fld_call_complete_recording.slice(-10)}`
                                            : link.fld_call_complete_recording
                                        }
                                    </a>
                                </li>
                            ))
                        }
                    </ul>

                </div>
            )}


            {relevantFiles.length == 0 && chatFiles.length == 0 && feasFiles.length == 0 && attachedFiles.length == 0 && (
                <p className="text-gray-500 text-center py-2 bg-red-100 mx-1 my-2">No Files Found</p>
            )}
            {relevantFiles.length === 0 ? (
                <p className="text-gray-500"></p>
            ) : (
                <ul className="">
                    {relevantFiles.map((file, index) => {
                        const truncateMiddle = (str, maxLength = 30) => {
                            if (str.length <= maxLength) return str;
                            const half = Math.floor((maxLength - 3) / 2);
                            return str.slice(0, half) + '...' + str.slice(str.length - half);
                        };

                        const formattedDate = new Date(file.created_date * 1000).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true,
                        });
                        // Convert Unix timestamp to readable

                        return (
                            <li
                                key={index}
                                className="flex flex-col  justify-between gap-2 p-2 border border-gray-200 "
                            >
                                <div className="flex items-center gap-x-2">
                                    <FileDown className="text-blue-500" size={18} />
                                    <a
                                        href={`${fileBaseURL}${file.file_path}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        download
                                        className="text-blue-600 font-medium hover:underline"
                                    >
                                        {truncateMiddle(file.filename)} ({file.quote_id})
                                    </a>
                                </div>
                                <div className=" text-gray-500 sm:text-right tenpx">
                                    {formattedDate}
                                </div>
                            </li>
                        );
                    })}
                </ul>


            )}

            {chatFiles.length === 0 ? (
                <p className="text-gray-500 text-sm"></p>
            ) : (
                <>

                    <ul className="space-y-3">
                        {chatFiles.map((file, index) => {
                            const formattedDate = new Date(file.date * 1000).toLocaleString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: 'numeric',
                                minute: '2-digit',
                                hour12: true,
                            });


                            return (
                                <li
                                    key={index}
                                    className="flex flex-col  justify-between gap-2 p-2 rounded-md border border-gray-200 shadow-sm"
                                >
                                    <div className="flex items-center gap-x-2">
                                        <FileDown className="text-green-500" size={18} />
                                        <a
                                            href={`${file.file_path}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            download
                                            className="text-green-700 font-medium hover:underline truncate"
                                        >
                                            {file.file_path.split("/").pop()} ({file.quote_id})
                                        </a>
                                    </div>
                                    <div className=" text-gray-500 sm:text-right tenpx">
                                        {formattedDate}
                                    </div>
                                </li>
                            );
                        })}
                    </ul>

                </>
            )}


            {feasFiles.length === 0 ? (
                <p className="text-gray-500 text-sm"></p>
            ) : (
                <>

                    <ul className="space-y-3">
                        {feasFiles.map((file, index) => {
                            const truncateMiddle = (str, maxLength = 30) => {
                                if (str.length <= maxLength) return str;
                                const half = Math.floor((maxLength - 3) / 2);
                                return str.slice(0, half) + '...' + str.slice(str.length - half);
                            };

                            const formattedDate = new Date(file.created_date * 1000).toLocaleString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: 'numeric',
                                minute: '2-digit',
                                hour12: true,
                            });


                            return (
                                <li key={index} className="flex flex-col justify-between gap-2 p-2 rounded-md border border-gray-200 shadow-sm">
                                    <div className="flex items-center gap-x-2">
                                        <FileDown className="text-purple-500" size={18} />
                                        <a
                                            href={`https://apacvault.com/public/feasabilityFiles/${file.file_name}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            download
                                            className="text-purple-700 font-medium hover:underline truncate"
                                            title={file.file_name}
                                        >
                                            {truncateMiddle(file.file_name)} ({file.quote_id})
                                        </a>
                                    </div>
                                    <div className=" text-gray-500 sm:text-right tenpx">
                                        {formattedDate}
                                    </div>
                                </li>
                            );
                        })}
                    </ul>

                </>
            )}

            {attachedFiles.length === 0 ? (
                <p className="text-gray-500 text-sm"></p>
            ) : (
                <>

                    <ul className="space-y-3">
                        {attachedFiles.map((file, index) => {
                            const formattedDate = file.created_at
                                ? new Date(file.created_at).toLocaleString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                    hour: 'numeric',
                                    minute: '2-digit',
                                    hour12: true,
                                })
                                : 'Unknown';

                            return (
                                <li
                                    key={index}
                                    className="flex flex-col  justify-between gap-2 p-2 rounded-md border border-gray-200 shadow-sm"
                                >
                                    <div className="flex items-center gap-x-2">
                                        <FileDown className="text-green-500" size={18} />
                                        <a
                                            href={`${fileBaseURL}${file.file}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            download
                                            className="text-green-700 font-medium hover:underline truncate"
                                        >
                                            {file.file} ({file.quote_id})
                                        </a>
                                    </div>
                                    <div className="tenpx text-gray-500 sm:text-right">
                                        {formattedDate}
                                    </div>
                                </li>
                            );
                        })}
                    </ul>

                </>
            )}



            {rcFilesLoading ? (
                <p>Loading rc files</p>
            ) : (
                <div className="space-y-4 h-full overflow-y-auto pb-2 px-1">

                    {accounts.map((account) => {
                        const data = accountData[account.id] || { folders: [], files: [], selectedFolder: 0, selectedFolderName: null };

                        return (
                            <div key={account.id} className="border rounded shadow-sm">
                                <h3 className="text-blue-800 font-bold flex items-center gap-1 text-[12px] bg-gray-100 p-2">
                                    <img src={rcfav}
                                        className="w-6 h-6" />
                                    {account.st_username ?? account.username}
                                </h3>

                                {/* Breadcrumb UI */}
                                <div className="flex justify-between px-2 mt-2">
                                    <div className="flex gap-2 items-center text-[11px] text-gray-500">
                                        <Home size={13} className="cursor-pointer" onClick={() => handleFolderClick(account.id, 0, null)} />
                                        {data.selectedFolderName && <span>/ {data.selectedFolderName}</span>}
                                    </div>
                                    {data.selectedFolder !== 0 && (
                                        <button
                                            className="btn btn-outline-dark btn-sm f-11 flex items-center"
                                            onClick={() => handleFolderClick(account.id, 0, null)}
                                        >
                                            <img src={upleft} className="w-3 h-3 mr-1 rotate-90" />
                                            Back
                                        </button>
                                    )}
                                </div>
                                <div className="p-2 overflow-y-auto max-h-[375px]">
                                    {/* Folders */}
                                    {data.selectedFolder === 0 && data.folders?.length > 0 && (
                                        <div className="space-y-2">
                                            {data.folders.map(folder => (
                                                <div
                                                    key={folder.id}
                                                    onDoubleClick={() => handleFolderClick(account.id, folder.id, folder.name)}
                                                    className="cursor-pointer flex items-center border p-2 hover:bg-gray-100 rounded"
                                                >
                                                    <Folder size={20} className="text-yellow-500 fill-yellow-500" />
                                                    <span className="ml-2 font-medium">{folder.name} ({folder.file_count ?? 0})</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Files */}
                                    {loadingAccounts[account.id] ? (
                                        <div className="text-center text-gray-500 text-sm py-6">
                                            <span className="animate-pulse">Loading files...</span>
                                        </div>
                                    ) : data.files?.length === 0 ? (
                                        <div className="text-gray-500 text-center py-2 bg-red-100">No files uploaded yet.</div>
                                    ) : (
                                        <div className="space-y-3">
                                            {data.files.map((file, idx) => {
                                                const isExpired = new Date(file.date) < new Date();
                                                return (
                                                    <div key={idx} className={`border p-2 rounded bg-white}`}>
                                                        <div className="flex justify-between items-center">
                                                            <div>
                                                                <p className="font-semibold">{file.file_name}</p>
                                                                <p className="text-xs text-gray-500">{formatUploadedAt(file.uploaded_at)}</p>
                                                            </div>
                                                            <div>
                                                                {isExpired ? (
                                                                    file.access_requested ? (
                                                                        <button className="text-red-500 f-11">Request Pending</button>
                                                                    ) : (
                                                                        <button onClick={() => handleRequestAccess(file)} className="text-orage-500 btn-sm f-11">Request Access</button>
                                                                    )
                                                                ) : (
                                                                    <a
                                                                        href={`https://rapidcollaborate.com/rapidshare/api/uploads/final/${file.final_name}`}
                                                                        target="_blank"
                                                                        download={file.access_type === 'download'}
                                                                        className="text-blue-600  f-11"
                                                                    >
                                                                        View
                                                                    </a>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}

                </div>
            )}

        </div>
    );
};

export default AttachedFiles;
