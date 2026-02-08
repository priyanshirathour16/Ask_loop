import { useState } from 'react';
import toast from 'react-hot-toast';
import { Headset, TriangleAlert, X } from 'lucide-react';
import { getSocket } from './Socket';

function QuoteIssue({ scopeDetails, quoteId, after }) {
    const socket = getSocket();
    const loopuserData = localStorage.getItem('loopuser');
    const loopUserObject = JSON.parse(loopuserData);

    const [showCommentBox, setShowCommentBox] = useState(false);
    const [comment, setComment] = useState('');

    const isIssue = scopeDetails.quote_issue == 1;
    let parsedHistory = [];
    if (scopeDetails?.issue_history) {
        try {
            parsedHistory = JSON.parse(scopeDetails.issue_history);
        } catch (e) {
            console.warn("Invalid JSON in issue_history", e);
        }
    }

    const hasActiveIssue = parsedHistory.some(item => item.active == true);

    const [marking, setMarking] = useState(false);

    const handleSubmit = async () => {
        if (comment.trim() == '') {
            toast.error('Please enter a comment');
            return;
        }
        setMarking(true);

        const postData = {
            ref_id: scopeDetails.assign_id,
            quote_id: quoteId,
            user_id: loopUserObject.id,
            user_name: loopUserObject.fld_first_name + " " + loopUserObject.fld_last_name,
            quote_issue: 1, // Toggle status
            comments: comment || '', // Add comment if present
        };

        try {
            const response = await fetch('https://loopback-skci.onrender.com/api/scope/markasquoteissue', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(postData),
            });

            const result = await response.json();
            if (result.status === "success") {
                toast.success('Success');
                setShowCommentBox(false)
                setTimeout(after, 500);
            } else {
                toast.error('Failed to submit the request');
            }
        } catch (error) {
            console.error('Error posting data:', error);
            toast.error('An error occurred while submitting the request');
        } finally {
            setMarking(false);
        }
    };

    const handleButtonClick = () => {
        if (!isIssue && !showCommentBox) {
            // Open comment box if setting an issue
            setShowCommentBox(true);
        } else {
            // Directly submit if removing the issue
            handleSubmit(new Event('submit'));
        }
    };

    const handleRemoveAllButtonClick = async () => {
        try {
            const response = await fetch('https://loopback-skci.onrender.com/api/scope/removeallquoteissue', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    quote_id: scopeDetails.quoteid,

                }),
            });

            const result = await response.json();
            if (result.status === "success") {
                toast.success('Success');
                setShowCommentBox(false)
                setTimeout(after, 500);
            } else {
                toast.error('Failed to submit the request');
            }
        } catch (e) {
            console.log(e);
        }
    }

    const handleReoveParticularIssue = async (id) => {
        if (!id) {
            return;
        }
        try {
            const response = await fetch('https://loopback-skci.onrender.com/api/scope/removeparticularquoteissue', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    quote_id: scopeDetails.quoteid,
                    issue_id: id,

                }),
            });

            const result = await response.json();
            if (result.status === "success") {
                toast.success('Success');
                setShowCommentBox(false)
                setTimeout(after, 500);
            } else {
                toast.error('Failed to submit the request');
            }

        } catch (e) {
            console.log(e);
        }
    }

    return (
        <>
            <div className='flex flex-col items-start mt-2 mb-2'>

                <div className='flex items-center space-x-2'>

                    <button
                        onClick={() => setShowCommentBox(true)}
                        className="px-2 py-1  leading-none text-[10px] bg-red-600 hover:bg-red-700 text-white flex gap-1 items-center rounded"
                    >
                        + Add Issue <TriangleAlert size={11} />
                    </button>


                    {isIssue && hasActiveIssue && (
                        <button
                            onClick={handleRemoveAllButtonClick}
                            className="px-2 py-1 leading-none text-[10px] bg-gray-700 hover:bg-gray-800 text-white flex gap-1 items-center rounded"
                        >
                            Remove All Issues <TriangleAlert size={11} />
                        </button>
                    )}
                </div>

                {/* Smooth expanding textarea */}
                <div
                    className={`transition-all duration-500 ease-in-out overflow-hidden ${showCommentBox ? 'max-h-40 opacity-100 mt-2' : 'max-h-0 opacity-0'}`}
                    style={{ width: '100%' }}
                >
                    <form className="flex flex-col">
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="border rounded p-2 text-sm"
                            placeholder="Add issue comments..."
                            rows={3}

                        />
                        <div className='flex justify-end '>
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={marking}
                                className="bg-red-100 hover:bg-red-200 text-red-600 mt-2 py-1 px-2 text-[11px] leading-none rounded "
                            >
                                {marking ? "Submitting..." : "Submit Issue"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            {(() => {
                let parsedHistory = [];

                try {
                    if (typeof scopeDetails.issue_history === "string") {
                        parsedHistory = JSON.parse(scopeDetails.issue_history).reverse();
                    } else if (Array.isArray(scopeDetails.issue_history)) {
                        parsedHistory = [...scopeDetails.issue_history].reverse();
                    }
                } catch (e) {
                    console.warn("Invalid JSON in quote.issue_history");
                }
                const formatDate = (raw) => {
                    try {
                        const date = new Date(raw);
                        return new Intl.DateTimeFormat("en-US", {
                            weekday: "short",
                            year: "numeric",
                            month: "short",
                            day: "2-digit",
                            hour: "numeric",
                            minute: "2-digit",
                            hour12: true,
                        }).format(date);
                    } catch (err) {
                        return raw;
                    }
                };

                return parsedHistory.length > 0 ? (
                    <div className="mt-4">
                        <h4 className="text-gray-700 text-[11px] font-semibold mb-1">Issue History</h4>
                        <div className="relative border-l-[1px] border-blue-200 pl-3 space-y-2">
                            {parsedHistory.map((entry, index) => (
                                <div key={index} className="relative">
                                    <div className="absolute -left-[7px] top-[6px] w-[8px] h-[8px] bg-blue-500 rounded-full border border-white"></div>
                                    <div className="bg-blue-50 p-2 rounded-md shadow-sm">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-blue-900 text-[11px] font-medium">{entry.user_name}</span>
                                            <span className="text-gray-500 text-[11px]">{formatDate(entry.time)}</span>
                                        </div>
                                        <div className="text-gray-800 text-[11px]">
                                            <span className="font-semibold mr-1 f-10">
                                                {entry.type === "Marked" ? "🟥 Marked" : "✅ Removed"}
                                            </span>
                                            {entry.comments && (
                                                <p className="mt-1 text-[11px] text-gray-700">{entry.comments}</p>
                                            )}
                                            {entry.active && entry.active == true && (
                                                <button
                                                    onClick={() => { handleReoveParticularIssue(entry.id) }}
                                                    className='bg-red-500 f-11 flex items-center px-1 py-0.5 text-white rounded'>
                                                    <X size={13} /> Remove isue
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : null;
            })()}

        </>
    );
}

export default QuoteIssue;
