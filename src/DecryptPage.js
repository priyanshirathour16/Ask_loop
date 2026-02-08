import { CircleCheckIcon, CircleX } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FadeLoader } from "react-spinners"; // Import the spinner
import CustomLoader from "./CustomLoader";
import Swal from "sweetalert2";
import 'sweetalert2/src/sweetalert2.scss'

function DecryptPage() {
    const { email, token } = useParams();
    const [responseMessage, setResponseMessage] = useState(null);
    const [responseMessage2, setResponseMessage2] = useState(null);
    const [loadingStep1, setLoadingStep1] = useState(true); // Loading state for step 1 (verification)
    const [loadingStep2, setLoadingStep2] = useState(false); // Loading state for step 2 (authentication)
    const [successStep1, setSuccessStep1] = useState(false); // Success state for step 1
    const [successStep2, setSuccessStep2] = useState(false); // Success state for step 2
    const [step, setStep] = useState(1); // To track the current step

    const decryptedEmail = decodeURIComponent(email); // Assuming no additional encryption
    const decryptedToken = token;
    const navigate = useNavigate();


    useEffect(() => {
        // First step: Validate credentials (verify email & token)
        const validateCredentials = async () => {
            try {
                const response = await fetch("https://loopback-skci.onrender.com/api/users/loginwebapi", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${decryptedToken}`, // Sending token as Bearer token
                    },
                    body: JSON.stringify({
                        email: decryptedEmail, // Sending decrypted email
                    }),
                });

                const data = await response.json();
                if (data.status === "success") {
                    setResponseMessage("Verification successful."); // Message for step 1
                    setSuccessStep1(true); // Step 1 success
                    localStorage.setItem("loopuser", JSON.stringify(data.data))
                    localStorage.setItem("loggedInToken", "a2cf8266e95ecc6824832ede306ff775289507a4acb42ffd7caaba087c5d5533");
                    setStep(2); // Move to step 2 (Authentication)
                } else {
                    setResponseMessage(data.message || "Unauthorized access.");
                    setSuccessStep1(false); // Step 1 failure
                    setStep(1); // Stay on verification step
                }
            } catch (error) {
                console.error("Error validating credentials:", error);
                setResponseMessage("An error occurred during verification. Please try again.");
                setSuccessStep1(false); // Step 1 failure
            } finally {
                setLoadingStep1(false); // Hide loading spinner after validation
            }
        };

        // Second step: Authenticate (send email only)
        const authenticateUser = async () => {
            try {
                const response = await fetch("https://loopback-skci.onrender.com/api/users/loginwebapisecondstep", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email_id: decryptedEmail, // Send only email for authentication
                    }),
                });

                const data = await response.json();
                if (data.status === "success") {
                    setResponseMessage2("Authentication successful!"); // Step 2 success
                    setSuccessStep2(true); // Step 2 success
                    localStorage.setItem("user", JSON.stringify(data.data));
                    localStorage.setItem('authenticated', true);
                    localStorage.setItem("loggedintime", Date.now());
                    const userType = data.data.user_type; // Retrieve user type from response
                    setTimeout(() => {
                        if (decryptedEmail == "puneet@redmarkediting.com") {
                            navigate("/query"); // Navigate to '/query' for admin users
                        } else {
                            navigate("/assignquery"); // Navigate to '/assignquery' for other users
                        }
                    }, 1000);
                } else {
                    setResponseMessage2(data.message || "Authentication failed.");
                    setSuccessStep2(false); // Step 2 failure
                }
            } catch (error) {
                console.error("Error during authentication:", error);
                setResponseMessage2("An error occurred during authentication. Please try again.");
                setSuccessStep2(false); // Step 2 failure
            } finally {
                setLoadingStep2(false); // Hide loading spinner after authentication
            }
        };

        if (step === 1) {
            setLoadingStep1(true); // Show loading spinner during verification
            validateCredentials();
        } else if (step === 2) {
            setLoadingStep2(true); // Show loading spinner during authentication
            authenticateUser();
        }
    }, [decryptedEmail, decryptedToken, step]); // Dependencies: email, token, and step

    return (
        <div className="flex justify-center items-center min-h-screen flex-col space-y-2">
            {/* Verification Modal Container */}
            <div
                className={`w-80 p-4 ${successStep1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} rounded-lg shadow-lg`}
            >
                {loadingStep1 ? (
                    <div className="flex flex-col justify-between items-center">
                        <CustomLoader />
                        <div className="ml-4">
                            <h4 className="">1. Verifying...</h4>
                        </div>
                    </div>
                ) : (
                    <div>
                        <h2 className="text-xl font-semibold text-center flex items-center space-x-2 justify-between">{responseMessage} {successStep1 ? (<CircleCheckIcon />) : (<CircleX />)}</h2>
                    </div>
                )}
            </div>

            {/* Authentication Modal Container */}
            <div
                className={`w-80 p-4 ${successStep2 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} rounded-lg shadow-lg`}
            >
                {loadingStep2 ? (
                    <div className="flex flex-col justify-between items-center ">
                        <CustomLoader />
                        <div className="ml-4">
                            <h4 className="">2. Authenticating...</h4>
                        </div>
                    </div>
                ) : (
                    <div>
                        <h2 className="text-xl font-semibold text-center flex items-center space-x-2 justify-between">{responseMessage2} {successStep2 ? (<CircleCheckIcon />) : (<CircleX />)}</h2>
                    </div>
                )}
            </div>
        </div>

    );
}

export default DecryptPage;
