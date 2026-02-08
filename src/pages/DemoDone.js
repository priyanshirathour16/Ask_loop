import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, CheckIcon, X } from 'lucide-react';
import { io } from "socket.io-client";
import { getSocket } from './Socket';
function DemoDone({ scopeDetails, quoteId, after, emailId }) {
    const [showForm, setShowForm] = useState(false);
    const [demoId, setdemoId] = useState('');
    const socket = getSocket();

    const loopuserData = localStorage.getItem('loopuser');
    const loopUserObject = JSON.parse(loopuserData);

    const [btnDisabled, setBtnDisabled] = useState(true); /// true
    const [clientEmail, setClientEmail] = useState(null);
    const [demoDuration, setDemoDuration] = useState(null);
    const [demoDate, setDemoDate] = useState(null);
    const [isWrong, setIsWrong] = useState(false);


    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!demoId) {
            toast.error("Please fill all fields");
            return;
        }
        // Prepare the data for posting
        const postData = {
            demoId,
            ref_id: scopeDetails.assign_id,
            quote_id: quoteId,
            user_id: scopeDetails.user_id,
            demo_duration: demoDuration,
            demo_date: demoDate
        };

        try {
            const response = await fetch('https://loopback-skci.onrender.com/api/scope/markasdemodone', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(postData),
            });
            const result = await response.json();
            if (result.status == "success") {
                toast.success('Success');
                setShowForm(false); // Close form upon successful submission
                socket.emit("demoCompleted", {
                    "ref_id": scopeDetails.assign_id,
                    "demo_id": demoId,
                    "demo_duration": demoDuration,
                    "user_name": loopUserObject.fld_first_name + " " + loopUserObject.fld_last_name
                })



                updateDemoUsed();
                after();
            } else {
                toast.error('Failed to submit the request');
            }
        } catch (error) {
            console.error('Error posting data:', error);
            toast.error('An error occurred while submitting the request');
        }
    };

    const updateDemoUsed = async () => {
        try {
            const response = await fetch("https://rapidcollaborate.com/rc-main/default/Index/updatedemocode", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "demo_id": demoId
                })
            })

            const data = await response.json()
            if (data.status) {
                // setTimeout(() => {
                //     after();
                // }, 1000);
            }
        } catch (e) {
            console.log(e);
        }
    }


    const handleDemoSubmit = async () => {
        try {
            setClientEmail(null);
            setIsWrong(false);
            setDemoDuration(null);
            setDemoDate(null);
            const response = await fetch("https://rapidcollaborate.com/rc-main/default/Index/checkdemocode", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "demo_id": demoId,
                    "email": emailId
                })
            })

            const data = await response.json()
            if (data.status && data.exists) {
                setBtnDisabled(false);
                setClientEmail(data.email);
                setIsWrong(false);
                setDemoDuration(data.time);
                setDemoDate(data.date);
            } else {
                toast.error("Wrong Demo Id")
                setBtnDisabled(true);
                setClientEmail(null);
                setIsWrong(true);
                setDemoDuration(null);
                setDemoDate(null);
            }
        } catch (e) {
            console.log(e);
        }
    }
    useEffect(() => {
        if (demoId && demoId.length > 0) {
            handleDemoSubmit(); ///remove
        }
    }, [demoId]);

    const [opening, setOpening] = useState(false);
    const handleButtonClick = async () => {
        if (!scopeDetails.assign_id || !scopeDetails.quoteid) {
            return;
        }
        try {
            setOpening(true)
            const res = await fetch("https://loopback-skci.onrender.com/api/scope/checkAndAutoCompleteDemo", {
                method: "POST",
                headers: {
                    "Content-type": "application/json"
                },
                body: JSON.stringify({
                    ref_id: scopeDetails.assign_id,
                    quote_id: scopeDetails.quoteid
                })
            });
            const data = await res.json();
            if (data.status) {
                after();
            } else {
                setShowForm(true);
            }

        } catch (err) {
            console.log("Failed ", err)
        } finally {
            setOpening(false);
        }
    }

    return (
        <div className=' my-2'>
            <button
                disabled={opening}
                onClick={handleButtonClick} className="btn btn-success flex items-center f-12 py-0 px-1 btn-sm btn">
                {opening ? "Loading..." : <div className='flex items-center'> Mark As RC Demo Done <CheckCircle size={15} className='ml-1' /></div>}
            </button>


            {showForm && (
                <AnimatePresence>
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.5 }}
                        className=" px-4 py-2 border border-gray-300 rounded mt-2"
                    >

                        {clientEmail && (
                            <p className='text-gray-500 flex items-center'>Email : {clientEmail}</p>
                        )}
                        {demoDuration && (
                            <p className='text-gray-500 flex items-center'>duration : {demoDuration}</p>
                        )}
                        {demoDate && (
                            <p className='text-gray-500 flex items-center'>date : {demoDate}</p>
                        )}
                        <form onSubmit={handleSubmit} className='flex items-center justify-between mt-2'>
                            <div className="mb-4">
                                <label htmlFor="demoId" className="block text-sm font-semibold">Demo ID</label>
                                <input
                                    type="text"
                                    id="demoId"
                                    name="demo_id"
                                    value={demoId}
                                    onChange={(e) => setdemoId(e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded form-control"
                                />
                            </div>

                            <button disabled={btnDisabled} type="submit" className="bg-blue-500 text-white px-2 py-3 rounded-full ml-3 h-5 flex items-center justify-center">
                                {btnDisabled ? (
                                    isWrong ? <X size={20} data-tooltip-id="my-tooltip" data-tooltip-content="Wrong Demo Id" /> : <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <CheckIcon size={20} />
                                )}
                            </button>
                        </form>
                    </motion.div>
                </AnimatePresence>
            )}


        </div>
    );
}

export default DemoDone;
