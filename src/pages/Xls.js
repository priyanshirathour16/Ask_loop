import { FileSpreadsheet, Pencil, CheckCircle, XCircle, Check } from "lucide-react";
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";

const Xls = () => {
    const [file, setFile] = useState(null);
    const [uploadedFileInfo, setUploadedFileInfo] = useState(null);
    const [error, setError] = useState("");
    const [fileContent, setFileContent] = useState([]);
    const [showUpload, setShowUpload] = useState(false);

    useEffect(() => {
        fetchExistingFile();
    }, []);

    const fetchExistingFile = async () => {
        try {
            const res = await fetch("https://loopback-skci.onrender.com/api/scope/getXlsFileApiAction");
            const data = await res.json();

            if (data.status && data.file) {
                setUploadedFileInfo(data.file);
            }
        } catch (err) {
            console.error("Failed to fetch existing XLS file:", err);
        }
    };

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if (selected && selected.name.endsWith(".xlsx")) {
            setFile(selected);
            setError("");
        } else {
            setError("Please upload a valid .xlsx file");
        }
    };

    const handleUpload = async () => {
        if (!file) {
            toast.error("No file selected");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("https://loopback-skci.onrender.com/api/scope/uploadQuoteXlsFileApiAction", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();

            if (data.status) {
                // console.log("Upload response:", data);
                setUploadedFileInfo(data.file);
                setError("");
            } else {
                toast.error(data.message || "Upload failed");
            }
        } catch (err) {
            toast.error("Error uploading file");
            console.error(err);
        }
    };

    const handleDisplayFile = async () => {
        if (!uploadedFileInfo) return;

        try {
            const fileUrl = `https://apacvault.com/public/QuotationFolder/${uploadedFileInfo}`;
            const res = await fetch(fileUrl);
            const blob = await res.blob();

            const arrayBuffer = await blob.arrayBuffer();
            const workbook = XLSX.read(arrayBuffer, { type: "array" });

            const firstSheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[firstSheetName];
            const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

            // Filter out the first row and any irrelevant rows (e.g., empty or not data rows)
            const filteredData = data
                .filter((row, index) => {
                    // Skip first row or rows that contain unwanted links or irrelevant information
                    return index > 0 && row.length === 2 && row[0] !== "Ref. No."; // Adjust if necessary
                })
                .map((row) => ({
                    refNo: row[0],
                    status: row[1],
                }));

            setFileContent(filteredData);
            // console.log("Filtered Data:", filteredData);
        } catch (err) {
            console.error("Error reading XLSX file:", err);
        }
    };


    return (
        <div className="px-4 py-1 flex items-end justify-between bg-gray-50 mb-2">
            <div className="flex items-center justify-end space-x-2">
                <FileSpreadsheet size={20} className="text-blue-500" />
                {uploadedFileInfo ? (
                    <span className="text-gray-800 font-medium">{uploadedFileInfo}</span>
                ) : (
                    <span className="text-gray-500 italic">No file uploaded</span>
                )}
                <button onClick={() => setShowUpload(true)}>
                    <Pencil size={18} className="text-gray-600 hover:text-black transition" />
                </button>
            </div>

            {showUpload && (
                <div className=" bg-white shadow-md rounded-xl px-2 py-1 border border-gray-200 w-full max-w-md">


                    <div className="flex items-center gap-2">
                        <h2 className="text-md font-semibold text-gray-800">Upload XLSX File</h2>
                        <label className="relative cursor-pointer bg-gray-100 hover:bg-gray-200 rounded-md px-3 py-1 text-sm text-gray-700 shadow-inner transition">
                            Choose File
                            <input
                                type="file"
                                accept=".xlsx"
                                onChange={handleFileChange}
                                className="absolute left-0 top-0 w-full h-full opacity-0 cursor-pointer"
                            />
                        </label>

                        <button
                            onClick={handleUpload}
                            className="flex items-center gap-1 bg-green-500 text-white p-1 rounded-full transition"
                        >
                            <Check size={18} />
                        </button>
                        <button
                            className="flex items-center gap-1 bg-red-500 text-white p-1 rounded-full transition"
                            onClick={() => setShowUpload(false)}>
                            <XCircle size={18} />
                        </button>

                    </div>
                    {file && (
                        <p className="mt-2 text-sm text-gray-600 truncate">
                            Selected: <span className="font-medium">{file.name}</span>
                        </p>
                    )}


                </div>
            )}
        </div>
    );
};

export default Xls;
