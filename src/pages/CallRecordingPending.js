import { useState } from 'react';
import toast from 'react-hot-toast';
import { Headset } from 'lucide-react';
import { getSocket } from './Socket';

function CallRecordingPending({ scopeDetails, quoteId, after }) {
    const socket = getSocket();
    const loopuserData = localStorage.getItem('loopuser');
    const loopUserObject = JSON.parse(loopuserData);

    const isPending = scopeDetails.callrecordingpending == 1;

    const handleSubmit = async (e) => {
        e.preventDefault();

        const postData = {
            ref_id: scopeDetails.assign_id,
            quote_id: quoteId,
            user_id: loopUserObject.id,
            callrecordingpending: isPending ? 0 : 1 // Toggle status
        };

        try {
            const response = await fetch('https://loopback-skci.onrender.com/api/scope/markascallrecordingpending', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(postData),
            });

            const result = await response.json();
            if (result.status === "success") {
                toast.success('Success');
                socket.emit("demoCompleted", {
                    "ref_id": scopeDetails.assign_id,
                    "user_name": loopUserObject.fld_first_name + " " + loopUserObject.fld_last_name
                });
                setTimeout(after, 1000);
            } else {
                toast.error('Failed to submit the request');
            }
        } catch (error) {
            console.error('Error posting data:', error);
            toast.error('An error occurred while submitting the request');
        }
    };

    return (
        <div></div>
        // <div className='flex items-start mt-1 mb-3'>
        //     {scopeDetails.callrecordingpending == 0 && (
        //         <button 
        //             onClick={handleSubmit} 
        //             className="btn text-white bg-orange-500 hover:bg-orange-600 flex items-center f-12 py-1 px-1.5 btn-sm">
        //             Call Recording Pending <Headset size={15} className='ml-1' />
        //         </button>
        //     )}
        //     {(scopeDetails.callrecordingpending == 1 && scopeDetails.callrecordingpendinguser == loopUserObject.id) && (
        //         <button 
        //             onClick={handleSubmit} 
        //             className="btn text-white bg-orange-500 hover:bg-orange-600 flex items-center f-12 py-1 px-1.5 btn-sm">
        //             Remove Call Recording Pending <Headset size={15} className='ml-1' />
        //         </button>
        //     )}


        // </div>
    );
}

export default CallRecordingPending;
