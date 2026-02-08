import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import CustomLoader from '../CustomLoader';
import { ArrowDown, ArrowUp, History, CheckCircle, CheckCircle2, Paperclip, Hash, RefreshCcw, PlusCircle, Hourglass, CirclePause, CircleCheck, Bell } from 'lucide-react';

const ClientEmailSideBar = ({ refIds, onClose }) => {
    const [quoteHistoryData, setQuoteHistoryData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [expandedRowIndex, setExpandedRowIndex] = useState(0);

    const toggleRow = (index) => {
        setExpandedRowIndex(expandedRowIndex === index ? null : index);
    };

    // Fetch Details for Specific RefId and QuoteId
    const fetchScopeDetails = async () => {
        setLoading(true); // Show loading spinner
        try {
            const dataToFetch = refIds.map(async (ref) => {
                const response = await fetch('https://loopback-skci.onrender.com/api/scope/adminScopeDetails', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        ref_id: ref.ref_id, // Pass ref_id dynamically
                    }),
                });

                const data = await response.json();
                if (data.status) {
                    const parsedQuoteInfo = data.quoteInfo.map((quote) => ({
                        ...quote,
                        relevant_file: quote.relevant_file ? JSON.parse(quote.relevant_file) : [],
                        ref_id: ref.ref_id,  // Include the ref_id and quote_id for each quote
                        quote_id: ref.id,
                    }));
                    return parsedQuoteInfo;
                } else {
                    console.error('Failed to fetch details:', data.message);
                }
            });

            // Wait for all fetch operations to complete
            const result = await Promise.all(dataToFetch);
            // Flatten the result array and set it in the state
            setQuoteHistoryData(result.flat());
        } catch (error) {
            console.error('Error fetching details:', error);
        } finally {
            setLoading(false); // Hide the loader
        }
    };

    // Effect to automatically fetch data when refIds change
    useEffect(() => {
        if (refIds && refIds.length > 0) {
            fetchScopeDetails();
        }
    }, [refIds]);

    return (
        <motion.div
            initial={{ x: '100%' }}
            animate={{ x: '0' }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed right-0 top-0 h-full w-1/2 bg-gray-100 shadow-lg z-50 overflow-y-auto"
        >
            <div className="flex items-center justify-between bg-blue-400 text-white p-3">
                <h2 className="text-xl font-semibold">Requests with Same Email</h2>
                <button
                    onClick={onClose}
                    className="text-white hover:text-red-500 transition-colors p-1 rounded-full bg-red-600 hover:bg-red-500"
                >
                    <X size={15} />
                </button>
            </div>

            {/* Table Display */}
            {quoteHistoryData && quoteHistoryData.length > 0 && (
                <div>
                    {/* Table Header */}
                    <table className="w-full border-collapse border border-gray-200 f-14">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border px-4 py-2 text-left">Ref No.</th>
                                <th className="border px-4 py-2 text-left">Quote Id.</th>
                                <th className="border px-4 py-2 text-left">Currency</th>
                                <th className="border px-4 py-2 text-left">Plan</th>
                                <th className="border px-4 py-2 text-left">Service Name</th>
                                <th className="border px-4 py-2 text-left">Quote Status</th>
                                <th className="border px-4 py-2 text-left">Action</th>
                            </tr>
                        </thead>
                        {/* Table Body */}
                        <tbody>
                            {quoteHistoryData.map((quote, index) => (
                                <React.Fragment key={index}>
                                    {/* Row */}
                                    <tr
                                        className="cursor-pointer hover:bg-gray-50"
                                    >
                                        <td className="border px-4 py-2">
                                            <p className='flex items-center'>
                                                {quote.assign_id}
                                                {quote.ptp == "Yes" && (
                                                    <span
                                                        className="inline-block pl-3 pr-2 py-1 f-10 ml-1" // Increased padding for more space
                                                        style={{
                                                            backgroundColor: '#2B9758FF', // Green color for PTP
                                                            clipPath: 'polygon(25% 0%, 100% 0, 100% 99%, 25% 100%, 0% 50%)',
                                                            color: '#ffffff',
                                                            fontSize: '14px', // Increased font size for better visibility
                                                            fontWeight: 'bold',
                                                            lineHeight: '1.3', // Increased line height to make it visually balanced
                                                        }}
                                                    >
                                                        PTP
                                                    </span>
                                                )}
                                                {quote.edited == 1 && (
                                                    <span className="text-gray-600 bg-gray-200 rounded-full text-sm ml-2" style={{ fontSize: "11px", padding: "1px 6px" }}>Edited</span>
                                                )}

                                            </p>
                                        </td>
                                        <td className="border px-4 py-2" style={{ fontSize: "11px" }}>{quote.quoteid}</td>
                                        <td className="border px-4 py-2" style={{ fontSize: "11px" }}>{quote.currency}</td>
                                        <td className="border px-4 py-2" style={{ fontSize: "11px" }}>{quote.plan}</td>
                                        <td className="border px-4 py-2" style={{ fontSize: "11px" }}>{quote.service_name || 'N/A'}</td>
                                        <td className="border px-4 py-2" style={{ fontSize: "11px" }}>
                                            <span
                                                className={
                                                    quote.quote_status == 0
                                                        ? 'text-red-600' // Pending - Red
                                                        : quote.quote_status == 1
                                                            ? 'text-green-600' // Submitted - Green
                                                            : quote.quote_status == 2
                                                                ? 'text-yellow-600' // Discount Requested - Yellow
                                                                : 'text-gray-600' // Default - Gray for Unknown
                                                }
                                            >
                                                {
                                                    quote.quote_status == 0 && quote.submittedtoadmin == 'false'
                                                        ? 'Pending at User'
                                                        : quote.quote_status == 0 && quote.submittedtoadmin == 'true'
                                                            ? 'Pending at Admin'
                                                            : quote.quote_status == 1
                                                                ? 'Submitted'
                                                                : quote.quote_status == 2
                                                                    ? 'Discount Requested'
                                                                    : 'Unknown'
                                                }
                                            </span>
                                            {quote.isfeasability == 1 && quote.feasability_status == "Completed" && (
                                                <><br /><span className='text-green-700 text-sm' style={{ fontSize: "11px" }}>Feasibility Completed</span></>
                                            )}
                                            {quote.isfeasability == 1 && quote.feasability_status == "Pending" && (
                                                <><br /><span className='text-red-700 text-sm font-bold' style={{ fontSize: "11px" }}>Feasibility Pending</span></>
                                            )}
                                        </td>
                                        <td className=" px-4 py-2 flex items-center">
                                            {/* Up/Down Arrow Button */}
                                            <button
                                                onClick={() => toggleRow(index)}
                                                className="flex items-center justify-center p-2"
                                            >
                                                {expandedRowIndex === index ? <ArrowUp size={20} className='bg-blue-500 p-1 rounded-full text-white' /> : <ArrowDown size={20} className='bg-blue-500 p-1 rounded-full text-white' />}
                                            </button>



                                        </td>
                                    </tr>
                                    {/* Accordion */}
                                    {expandedRowIndex == index && (
                                        <tr>
                                            <td colSpan={7} className="border px-4 py-4 bg-gray-50">
                                                <div className="space-y-4 text-sm">
                                                    <p className='d-flex align-items-center'><strong>Ref No.:</strong>
                                                        {quote.assign_id}
                                                        {quote.ptp == "Yes" && (
                                                            <span
                                                                className="inline-block pl-3 pr-2 py-1 f-10 ml-1" // Increased padding for more space
                                                                style={{
                                                                    backgroundColor: '#2B9758FF', // Green color for PTP
                                                                    clipPath: 'polygon(25% 0%, 100% 0, 100% 99%, 25% 100%, 0% 50%)',
                                                                    color: '#ffffff',
                                                                    fontSize: '14px', // Increased font size for better visibility
                                                                    fontWeight: 'bold',
                                                                    lineHeight: '1.5', // Increased line height to make it visually balanced
                                                                }}
                                                            >
                                                                PTP
                                                            </span>
                                                        )}

                                                        {quote.edited == 1 && (
                                                            <span className="text-gray-600 bg-gray-200 rounded-full text-sm ml-2" style={{ fontSize: "11px", padding: "1px 6px" }}>Edited</span>
                                                        )}
                                                    </p>
                                                    {quote.tag_names && (
                                                        <p>
                                                            <strong>Tags:</strong>
                                                            {quote.tag_names.split(',').map((tag, index) => (
                                                                <span
                                                                    key={index}
                                                                    className="text-blue-500 p-1 rounded-full text-sm font-medium inline-block ml-1"
                                                                >
                                                                    #{tag.trim()}
                                                                </span>
                                                            ))}
                                                        </p>
                                                    )}

                                                    {quote.service_name && quote.plan && (
                                                        <>
                                                            <p><strong>Service Required:</strong> {quote.service_name}</p>
                                                            {quote.old_plan && (
                                                                <p className='text-gray-500'><strong>Old Plan:</strong> {quote.old_plan}</p>
                                                            )}
                                                            <p><strong>Plan:</strong> {quote.plan}</p>
                                                        </>
                                                    )}
                                                    {quote.plan_comments && quote.plan_comments !== "" && quote.plan_comments !== null && (
                                                        <div>
                                                            <p className='mb-2'><strong style={{ textDecoration: "underline" }}>Plan Description:</strong></p>
                                                            {Object.entries(JSON.parse(quote.plan_comments)).map(([plan, comment], index) => (
                                                                <p key={index}><strong>{plan}:</strong> <span dangerouslySetInnerHTML={{ __html: comment }} /></p>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {quote.comments && quote.comments != "" && quote.comments != null && (
                                                        <p><strong style={{ textDecoration: "underline" }}>Description:</strong>  <span dangerouslySetInnerHTML={{ __html: quote.comments }} /></p>
                                                    )}
                                                    {quote.final_comments != null && (
                                                        <div >
                                                            <p><strong>Final Comments:</strong> {quote.final_comments}</p>
                                                        </div>
                                                    )}
                                                    <p><strong>Created Date:</strong> {new Date(quote.created_date * 1000).toLocaleDateString('en-GB')}</p>
                                                    {quote.relevant_file && quote.relevant_file.length > 0 && (
                                                        <div>
                                                            <strong>Relevant Files:</strong>
                                                            <div className="space-y-2 mt-2">
                                                                {quote.relevant_file.map((file, fileIndex) => (
                                                                    <div key={fileIndex}>
                                                                        <a
                                                                            href={`https://apacvault.com/public/QuotationFolder/${file.file_path}`}
                                                                            download
                                                                            target='_blank'
                                                                            className="text-blue-500"
                                                                        >
                                                                            {file.filename}
                                                                        </a>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                    <p className='flex items-center'>
                                                        <strong className='mr-2'>Quote Status:</strong>
                                                        <strong
                                                            className={quote.quote_status == 0
                                                                ? "badge-danger py-0 px-1 f-12 font-semibold text-white" // Red for Pending
                                                                : quote.quote_status == 1
                                                                    ? "badge-success  py-0 px-1 f-12 font-semibold text-white" // Green for Submitted
                                                                    : "badge-warning  py-0 px-1 f-12 font-semibold text-white"} // Yellow for Discount Requested
                                                        >
                                                            {quote.quote_status == 0
                                                                ? "Pending"
                                                                : quote.quote_status == 1
                                                                    ? "Submitted"
                                                                    : "Discount Requested"}
                                                        </strong>
                                                    </p>

                                                    {quote.ptp != null && (
                                                        <>
                                                            <p><strong>PTP:</strong> {quote.ptp}</p>
                                                            {quote.ptp_amount && quote.ptp_amount != 0 && (
                                                                <p><strong>PTP Amount:</strong> {quote.ptp_amount}</p>
                                                            )}
                                                            {quote.ptp == "Yes" && (
                                                                <p><strong >PTP Comments:</strong> {quote.ptp_comments}</p>
                                                            )}
                                                            {quote.ptp_file != null && (
                                                                <p><strong>Attached File : </strong><a className='text-blue-500 font-semibold' href={`https://apacvault.com/public/${quote.ptp_file}`} download={quote.ptpfile} target='_blank'>{quote.ptp_file}</a></p>
                                                            )}
                                                        </>
                                                    )}
                                                    {quote.demodone != 0 && (
                                                        <>
                                                            <p className='flex items-center '>  <p className=''> <strong>Demo Id : </strong> {quote.demo_id}</p> <span className='badge-success px-2 py-0 ml-3 rounded-sm text-white-900 font-semibold flex items-center f-12'>Demo Completed <CheckCircle2 size={12} className='ml-1' /> </span></p>
                                                        </>
                                                    )}
                                                    {quote.demo_duration && (
                                                        <>
                                                            <p className="mb-3">

                                                                {" "}
                                                                <div>
                                                                    <strong>
                                                                        Demo Duration {" "}
                                                                    </strong>{" "}
                                                                </div>
                                                                <div className='flex items-center'>
                                                                    <div className='line-h-in'>{quote.demo_duration}</div>

                                                                </div>
                                                            </p>
                                                        </>
                                                    )}
                                                    {quote.quote_status != 0 && quote.quote_price && quote.plan && (
                                                        <>
                                                            {quote.old_plan && (quote.old_plan != quote.plan && (
                                                                <p className='text-gray-600'>
                                                                    <strong>Quote Price For Old Plan:</strong>{' '}
                                                                    {(() => {
                                                                        const prices = quote.quote_price.split(','); // Split quote_price into an array
                                                                        const plans = quote.old_plan.split(','); // Split plan into an array
                                                                        return plans.map((plan, index) => (
                                                                            <span key={index} className="line-through bg-gray-200 p-1 mx-1 rounded border border-gray-500 f-12 mb-2 d-inline-block">
                                                                                <strong>{plan} </strong>: {quote.currency == "Other" ? quote.other_currency : quote.currency} {prices[index] ? prices[index] : 0}
                                                                                {index < plans.length - 1 && ', '}
                                                                            </span>
                                                                        ));
                                                                    })()}
                                                                </p>

                                                            ))}
                                                            {quote.quote_status != 2 && (
                                                                <p>
                                                                    <strong>Quote Price:</strong>{' '}
                                                                    {(() => {
                                                                        const prices = quote.quote_price.split(','); // Split quote_price into an array
                                                                        const plans = quote.plan.split(','); // Split plan into an array
                                                                        return plans.map((plan, index) => (
                                                                            <span key={index} className={`${quote.discount_price != null ? "line-through bg-red-200 p-1 rounded mr-1 f-12" : ""}`}>
                                                                                <strong>{plan} </strong>: {quote.currency == "Other" ? quote.other_currency : quote.currency} {prices[index] ? prices[index] : 0}
                                                                                {index < plans.length - 1 && ', '}
                                                                            </span>
                                                                        ));
                                                                    })()}
                                                                </p>
                                                            )}

                                                            {quote.discount_price && (
                                                                <p>
                                                                    <strong>Discounted Price:</strong>{' '}
                                                                    {(() => {
                                                                        const prices = quote.discount_price.split(','); // Split quote_price into an array
                                                                        const plans = quote.plan.split(','); // Split plan into an array
                                                                        return plans.map((plan, index) => (
                                                                            <span key={index} className='silver px-1 py-1 f-12 rounded mr-1'>
                                                                                <strong>{plan} </strong>: {quote.currency == "Other" ? quote.other_currency : quote.currency} {prices[index] ?? 0}
                                                                                {index < plans.length - 1 && ', '}
                                                                            </span>
                                                                        ));
                                                                    })()}
                                                                </p>
                                                            )}
                                                            {quote.final_price && (
                                                                <p >
                                                                    <strong>Final Price:</strong>{' '}
                                                                    {(() => {
                                                                        const prices = quote.final_price.split(','); // Split quote_price into an array
                                                                        const plans = quote.plan.split(','); // Split plan into an array
                                                                        return plans.map((plan, index) => (
                                                                            <span key={index} className=' px-1 py-2 rounded mr-1 gold'>
                                                                                <strong>{plan} </strong>: {quote.currency == "Other" ? quote.other_currency : quote.currency} {prices[index]}
                                                                                {index < plans.length - 1 && ', '}
                                                                            </span>
                                                                        ));
                                                                    })()}
                                                                </p>
                                                            )}
                                                            {quote.user_comments && (
                                                                <p><strong style={{ textDecoration: "underline" }}>Admin Comments:</strong> {quote.user_comments}</p>
                                                            )}
                                                        </>
                                                    )}

                                                    {quote.isfeasability == 1 && (
                                                        <>
                                                            <div className='flex items-center'>
                                                                <>
                                                                    <p><strong>Feasibility Status:</strong> <span className={`${quote.feasability_status == "Pending" ? "badge-danger p-1 f-10 rounded" : "badge-success p-1 f-10 rounded"}`}>{quote.feasability_status}</span></p>



                                                                </>

                                                            </div>

                                                            {quote.feasability_status == "Completed" && (
                                                                <>
                                                                    <p style={{ textDecoration: "italic" }} className='italic'>
                                                                        Feasibility Comments:
                                                                        <span
                                                                            className='mt-2'
                                                                            dangerouslySetInnerHTML={{ __html: quote.feasability_comments }}
                                                                        />
                                                                    </p>
                                                                    {quote.feas_file_name && (
                                                                        <p className='flex items-center'>Feasibility Attachment : <a href={"https://apacvault.com/public/feasabilityFiles/" + quote.feas_file_name} target='_blank' className='text-blue-600 flex items-center'><Paperclip size={20} /> View File</a></p>
                                                                    )}
                                                                </>
                                                            )}

                                                        </>
                                                    )}

                                                </div>

                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>

                </div>
            )}

            {/* Loader */}
            {loading && <CustomLoader />}
        </motion.div>
    );
};

export default ClientEmailSideBar;
