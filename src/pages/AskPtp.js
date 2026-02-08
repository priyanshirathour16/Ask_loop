import { useState } from 'react';
import toast from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';
import { io } from "socket.io-client";
import { getSocket } from './Socket';

function AskPtp({ scopeDetails, quoteId, after, plans }) {
    const socket = getSocket();
    const [showForm, setShowForm] = useState(false);
    const [ptp, setPtp] = useState(scopeDetails.ptp && scopeDetails.ptp != null ? scopeDetails.ptp : "No"); // Default value is "No"
    const [ptpAmount, setPtpAmount] = useState(scopeDetails.ptp_amount);
    const [ptpComments, setPtpComments] = useState('');
    const [ptploading, setPtpLoading] = useState(false);
    const [selectedPlans, setSelectedPlans] = useState(plans ? plans.split(",") : []);
    const [ptpFile, setPtpFile] = useState(null);
    const loopuserData = localStorage.getItem('loopuser');
    const loopUserObject = JSON.parse(loopuserData);

    // console.log("amounts given final" + scopeDetails.final_price);
    // console.log("amounts given discount" + scopeDetails.discount_price);
    // console.log("amounts given quote" + scopeDetails.quote_price);

    const handleCheckboxChange = (plan) => {
        setSelectedPlans((prevSelectedPlans) => {
            if (prevSelectedPlans.includes(plan)) {
                return prevSelectedPlans.filter((p) => p !== plan); // Uncheck
            } else {
                return [...prevSelectedPlans, plan]; // Check
            }
        });
    };

    const handleFileChange = (e) => {
        setPtpFile(e.target.files[0]); // Store the selected file
    };

    const userData = localStorage.getItem('loopuser');

    const userObject = JSON.parse(userData);

    const handleSubmit = async (e) => {
        setPtpLoading(true);
        e.preventDefault();

        if (ptp != "Yes") {
            toast.error('Please check PTP checkbox');
            setPtpLoading(false)
            return;
        }
        if (ptp == 'Yes' && !ptpAmount) {
            toast.error("Please Enter amount");
            setPtpLoading(false);
            return;
        }
        let selectedPrices = scopeDetails.final_price
            ? scopeDetails.final_price
            : scopeDetails.discount_price
                ? scopeDetails.discount_price
                : scopeDetails.quote_price;

        if (!selectedPrices) {
            toast.error("No valid prices available.");
            setPtpLoading(false);
            return;
        }

        // Convert prices from comma-separated string to an array and calculate 70% minimum required amount
        // selectedPrices = selectedPrices.split(",").map(price => Math.round((parseFloat(price) * 70) / 100));
        selectedPrices = selectedPrices
            .split(",")
            .filter(price => !isNaN(parseFloat(price))) // remove "NA" or non-numeric
            .map(price => Math.round((parseFloat(price) * 70) / 100));


        // Get the minimum required amount
        let minRequiredAmount = Math.min(...selectedPrices);

        if (ptp === "Yes" && parseFloat(ptpAmount) < minRequiredAmount) {
            toast.error(`The PTP amount must be at least ${minRequiredAmount}  (70%)`);
            setPtpLoading(false);
            return;
        }

        if (!ptpComments) {
            toast.error("Please fill all fields");
            setPtpLoading(false);
            return;
        }
        const planOrder = ['Basic', 'Standard', 'Advanced'];

        // Sort the selected plans based on the custom order
        const sortedPlans = selectedPlans.sort((a, b) => {
            return planOrder.indexOf(a) - planOrder.indexOf(b);
        });


        const formData = new FormData();
        formData.append('ptp', ptp);
        formData.append('ptp_comments', ptpComments);
        formData.append('ptp_amount', ptpAmount);
        formData.append('old_plans', plans);
        formData.append('selected_plans', sortedPlans.join(","));
        formData.append('ref_id', scopeDetails.assign_id);
        formData.append('quote_id', quoteId);
        formData.append('user_name', userObject.fld_first_name + " " + userObject.fld_last_name);
        formData.append('user_id', userObject.id);

        // Append the selected file if there is one
        if (ptpFile) {
            formData.append('ptp_file', ptpFile);
        }

        try {
            const response = await fetch('https://loopback-skci.onrender.com/api/scope/askptp', {
                method: 'POST',
                body: formData,
            });
            const result = await response.json();
            if (result.status === "success") {
                toast.success('Request submitted successfully');
                setShowForm(false);
                socket.emit("requestedDiscount", {
                    "quote_id": quoteId,
                    "user_name": loopUserObject.fld_first_name + " " + loopUserObject.fld_last_name
                })
                setTimeout(() => {
                    after();
                }, 1000)
            } else {
                toast.error('Failed to submit the request');
            }
        } catch (error) {
            console.error('Error posting data:', error);
            toast.error('An error occurred while submitting the request');
        } finally {
            setPtpLoading(false);
        }
    };

    return (
        <div className='my-2'>
            <button onClick={() => setShowForm(!showForm)} className="btn py-0 px-1 btn-info btn-sm f-12">
                Ask Discount
            </button>

            {showForm && (
                <AnimatePresence>
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.5 }}
                        className="mt-2 p-3 border border-gray-300 rounded bg-light"
                    >
                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="ptp"
                                        checked={ptp == 'Yes'}
                                        onChange={(e) => setPtp(e.target.checked ? 'Yes' : 'No')}
                                        className="form-checkbox text-blue-600 h-2 w-2"
                                    />
                                    <label htmlFor="ptp" className="font-semibold mb-0">PTP Client</label>
                                </div>
                            </div>
                            <div className=''>
                                <div className="mb-3 relative">
                                    <label htmlFor="ptpamount" className="block font-semibold">PTP Amount</label>
                                    <div className="flex items-center">
                                        <span className="absolute left-2 text-gray-500">{scopeDetails.currency}</span>
                                        <input
                                            id="ptpamount"
                                            type="number"
                                            value={ptpAmount}
                                            onChange={(e) => setPtpAmount(e.target.value)}
                                            className="w-full pl-10  border border-gray-300 rounded no-arrows form-control form-control-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="mb-3">
                                <label className="block font-semibold ">Plans</label>
                                <div className="mt-2 flex flex-wrap">
                                    {['Basic', 'Standard', 'Advanced'].map((plan, index) => (
                                        <div key={index} className="flex items-center mb-2 mr-4">
                                            <input
                                                type="checkbox"
                                                id={`plan-${plan}`}
                                                value={plan}
                                                checked={selectedPlans.includes(plan)}
                                                onChange={() => handleCheckboxChange(plan)}
                                                className="form-checkbox h-2 w-2 border-gray-300 rounded"
                                            />
                                            <label htmlFor={`plan-${plan}`} className="ml-1 font-medium mb-0">{plan}</label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="ptp_comments" className="block font-semibold">Comments</label>
                                <textarea
                                    id="ptp_comments"
                                    name="ptp_comments"
                                    value={ptpComments}
                                    onChange={(e) => setPtpComments(e.target.value)}
                                    style={{ resize: 'none' }}
                                    className="w-full p-2 border border-gray-300 rounded form-control form-control-sm"
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="ptp_file" className="block font-semibold">Upload File</label>
                                <input
                                    type="file"
                                    id="ptp_file"
                                    onChange={handleFileChange}
                                    className="w-full p-2 border border-gray-300 rounded"
                                />
                            </div>
                            <div className='text-right'>
                                <button type="submit" disabled={ptploading} className="btn btn-primary btn-sm f-12">
                                    {ptploading ? "Submitting..." : "Submit"}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </AnimatePresence>
            )}


        </div>
    );
}

export default AskPtp;
