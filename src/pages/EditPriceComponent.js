import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import CustomLoader from '../CustomLoader';
import axios from 'axios';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { getSocket } from "./Socket";


const EditPriceComponent = ({ quote, priceLoading, PriceSubmitValidate, onClose, after }) => {
    const [amounts, setAmounts] = useState({});
    const [comment, setComment] = useState("");
    const [loading, setLoading] = useState(false);
    const [fieldToUpdate, setFieldToUpdate] = useState('price');
    const socket = getSocket();

    // Fetch price details when component mounts or quote.id changes
    useEffect(() => {
        const fetchPriceDetails = async () => {
            if (quote.assign_id && quote.quoteid) {
                setLoading(true);
                try {
                    const response = await axios.post('https://loopback-skci.onrender.com/api/scope/getPriceDetails', {
                        ref_id: quote.assign_id,
                        quote_id: quote.quoteid,
                    });

                    console.log(response);
                    if (response.data.status) {
                        const priceDetails = response.data.priceDetails;

                        // Split the prices into arrays (if available)
                        const quotePrices = priceDetails.quote_price ? priceDetails.quote_price.split(',') : [];
                        const finalPrices = priceDetails.final_price ? priceDetails.final_price.split(',') : [];
                        const discountPrices = priceDetails.discount_price ? priceDetails.discount_price.split(',') : [];

                        // Convert quote.plan into an array (comma-separated string to array)
                        const plans = quote.plan ? quote.plan.split(',') : [];

                        // Check for final_price first, if present
                        if (finalPrices.length > 0) {
                            setFieldToUpdate('final');
                            plans.forEach((plan, index) => {
                                if (finalPrices[index]) {
                                    setAmounts((prev) => ({ ...prev, [plan]: finalPrices[index].replace(',', '') }));
                                }
                            });
                            setComment(priceDetails.user_comments);
                            return;  // Early return after setting final prices
                        }

                        // Check for discount_price if final_price is not present
                        if (discountPrices.length > 0) {
                            setFieldToUpdate('discount');
                            plans.forEach((plan, index) => {
                                if (discountPrices[index]) {
                                    setAmounts((prev) => ({ ...prev, [plan]: discountPrices[index].replace(',', '') }));
                                }
                            });
                            setComment(priceDetails.user_comments);
                            return;  // Early return after setting discount prices
                        }

                        // Check for quote_price if neither final_price nor discount_price are present
                        if (quotePrices.length > 0) {
                            setFieldToUpdate('quote');
                            plans.forEach((plan, index) => {
                                if (quotePrices[index]) {
                                    setAmounts((prev) => ({ ...prev, [plan]: quotePrices[index].replace(',', '') }));
                                }
                            });
                            setComment(priceDetails.user_comments);
                            return;  // Early return after setting quote prices
                        } else {
                            setAmounts({});
                        }
                    } else {
                        toast.error("Failed to fetch price details.");
                    }


                } catch (error) {
                    toast.error("Error fetching price details.");
                    console.log(error);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchPriceDetails();
    }, [quote.assign_id, quote.quoteid]);



    const handleAmountChange = (e, plan) => {
        const updatedAmounts = { ...amounts, [plan]: e.target.value };
        setAmounts(updatedAmounts);
    };

    const handleSubmit = async () => {
        setLoading(true);

        for (const plan of ["Basic", "Standard", "Advanced"]) {
            // Check if the current plan is enabled and the amount is empty
            if (quote.plan && quote.plan.split(",").includes(plan) && !amounts[plan]) {
                toast.error(`Amount for ${plan} is required.`);
                setLoading(false); // Stop the loading spinner
                return; // Exit the function early if validation fails
            }
        }

        const dataToSubmit = {
            ref_id: quote.assign_id,
            quote_id: quote.quoteid,
            fieldToUpdate: fieldToUpdate,
            amount: amounts || '', // Get the amount for the specific plan (e.g., Basic, Standard, Advanced)
            comment: comment,
        };

        try {
            const response = await axios.post('https://loopback-skci.onrender.com/api/scope/updatePriceQuote', dataToSubmit);
            if (response.data.status) {
                toast.success("Price updated successfully!");
                socket.emit("quotePriceEdited", {
                    quote_id: quote.quoteid,
                    ref_id: quote.assign_id,
                });
                onClose(); // Close the form after successful submission
                after();
            } else {
                toast.error("Failed to update price.");
            }
        } catch (error) {
            toast.error("Error updating price.");
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
                    <h2 className="text-xl font-semibold flex items-center">Edit Request Form</h2>
                    <button onClick={onClose} className="text-white hover:text-red-500 transition-colors p-1 rounded-full bg-red-600 hover:bg-red-500">
                        <X size={15} />
                    </button>
                </div>
                <div className="nav-tabs-custom tabb">
                    <div className="tab-content">
                        <div className="tab-pane active" id="tab_2">
                            <form
                                method="post"
                                name="submitQuoteForm"
                                id="submitQuoteForm"
                                className="form-horizontal"
                            >
                                <input type="hidden" name="ref_id" value={quote.assign_id} />
                                <input type="hidden" name="quote_id" value={quote.quoteid} />
                                <div className="box-body p-2 f-12">
                                    <table className="w-full border-collapse">
                                        <thead>
                                            <tr>
                                                <th className="border px-4 py-2">Plan</th>
                                                <th className="border px-4 py-2">Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {["Basic", "Standard", "Advanced"].map((plan, index) => (
                                                <tr key={index}>
                                                    <td className="border px-4 py-2">
                                                        <label htmlFor={`amount_${plan}`} className="mb-0">
                                                            {plan} ({quote.currency === "Other" ? quote.other_currency : quote.currency})
                                                        </label>
                                                    </td>
                                                    <td className="border px-4 py-2">
                                                        <input
                                                            type="text"
                                                            name={`amount_${plan}`}
                                                            id={`amount_${plan}`}
                                                            className="form-control form-control-sm"
                                                            value={amounts[plan] || ""}
                                                            required={quote.plan && quote.plan.split(",").includes(plan)}
                                                            disabled={!quote.plan || !quote.plan.split(",").includes(plan)}
                                                            onChange={(e) => handleAmountChange(e, plan)}
                                                        />
                                                        <div className="error" id={`amountError_${plan}`}></div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>

                                    <div className="mt-4">
                                        <textarea
                                            name="comment"
                                            id="comment"
                                            placeholder="Comments"
                                            className="form-control form-control-sm w-full"
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                        ></textarea>
                                        <div className="error" id="commentError"></div>
                                    </div>
                                </div>
                                <div className="box-footer p-2 mt-4 text-right">
                                    <input
                                        type="button"
                                        name="priceSubmitted"
                                        className="btn btn-success btn-sm"
                                        value="Submit"
                                        onClick={handleSubmit}
                                        disabled={priceLoading}
                                    />
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

            </div>
        </motion.div>
    );
};

export default EditPriceComponent;
