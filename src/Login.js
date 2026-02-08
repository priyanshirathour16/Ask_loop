import React, { useEffect, useState } from "react";
import {
  Eye,
  EyeOff,
  LogInIcon,
  MailIcon,
  CircleCheck,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import logo from "./logo-new.png";
import { toast } from "react-toastify";
import CustomLoader from "./CustomLoader";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const [responseMessage, setResponseMessage] = useState(null);
  const [responseMessage2, setResponseMessage2] = useState(null);
  const [loadingStep1, setLoadingStep1] = useState(false);
  const [loadingStep2, setLoadingStep2] = useState(false);
  const [successStep1, setSuccessStep1] = useState(false);
  const [successStep2, setSuccessStep2] = useState(false);
  const [step, setStep] = useState(1);

  const handleSubmit = async () => {
    if (!email) {
      toast.error("Please enter email");
      return;
    }
    if (!password) {
      toast.error("Please enter password");
      return;
    }

    try {
      setLoadingStep1(true);
      const payload = { email, password, isGoogle: false };
      const response = await fetch(
        "https://loopback-skci.onrender.com/api/users/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await response.json();
      if (data.status) {
        setResponseMessage("Verification successful.");
        setLoadingStep1(false)
        setSuccessStep1(true);
        localStorage.setItem("loopuser", JSON.stringify(data.user));
        localStorage.setItem(
          "loggedInToken",
          "a2cf8266e95ecc6824832ede306ff775289507a4acb42ffd7caaba087c5d5533"
        );
        setStep(2);
        authenticateUser();
      } else {
        setLoadingStep1(false)
        setResponseMessage(data.message || "Unauthorized access.");
        setSuccessStep1(false);
      }
    } catch (e) { }
  };

  const authenticateUser = async () => {
    try {
      setLoadingStep2(true);
      const response = await fetch(
        "https://loopback-skci.onrender.com/api/users/loginwebapisecondstep",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email_id: email }),
        }
      );
      const data = await response.json();
      if (data.status === "success") {
        setResponseMessage2("Authentication successful!");
        setSuccessStep2(true);
        localStorage.setItem("user", JSON.stringify(data.data));
        localStorage.setItem("authenticated", true);
        localStorage.setItem("loggedintime", Date.now());
        setTimeout(() => {
          if (email === "puneet@redmarkediting.com") navigate("/query");
          else navigate("/assignquery");
        }, 1000);
      } else {
        setResponseMessage2(data.message || "Authentication failed.");
        setSuccessStep2(false);
      }
    } catch (error) {
      console.error(error);
      setResponseMessage2(
        "An error occurred during authentication. Please try again."
      );
      setSuccessStep2(false);
    } finally {
      setLoadingStep2(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-white p-4 space-y-6">
      <form className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-sm space-y-4">
        <div className="flex justify-center pb-3 border-b border-gray-200">
          <img src={logo} className="h-10 w-auto" />
        </div>
        <h2 className="text-sm text-gray-400 text-center">
          Sign in to your account
        </h2>

        {/* Email Field */}
        <div className="relative">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
          />
          <MailIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        </div>

        {/* Password Field */}
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center mt-4">
          <button
            type="button"
            onClick={() => navigate("/forgot-password")}
            className="text-sm text-orange-500 hover:text-orange-700 transition"
          >
            Forgot Password?
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="flex items-center gap-1 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition"
          >
            Login <LogInIcon size={14} />
          </button>
        </div>
      </form>

      {/* Step Indicators */}
      <div className="w-full max-w-sm space-y-2">
        {/* Step 1 */}
        <div
          className={`flex items-center px-4 py-2 rounded-xl shadow-md transition ${successStep1
            ? "bg-green-50 text-green-800"
            : responseMessage
              ? "bg-red-50 text-red-800"
              : "bg-white"
            }`}
        >
          {loadingStep1 ? (
            <CustomLoader />
          ) : successStep1 ? (
            <CircleCheck size={24} className="text-green-500" />
          ) : responseMessage ? (
            <XCircle size={24} className="text-red-500" />
          ) : (
            <div className="w-6 h-6 border-2 border-gray-300 rounded-full animate-pulse"></div>
          )}
          <div className="ml-3 text-sm font-medium">
            {loadingStep1
              ? "Verifying..."
              : responseMessage || "Step 1: Verification"}
          </div>
        </div>

        {/* Step 2 */}
        <div
          className={`flex items-center px-4 py-2 rounded-xl shadow-md transition ${successStep2
            ? "bg-green-50 text-green-800"
            : responseMessage2
              ? "bg-red-50 text-red-800"
              : "bg-white"
            }`}
        >
          {loadingStep2 ? (
            <CustomLoader />
          ) : successStep2 ? (
            <CircleCheck size={24} className="text-green-500" />
          ) : responseMessage2 ? (
            <XCircle size={24} className="text-red-500" />
          ) : (
            <div className="w-6 h-6 border-2 border-gray-300 rounded-full animate-pulse"></div>
          )}
          <div className="ml-3 text-sm font-medium">
            {loadingStep2
              ? "Authenticating..."
              : responseMessage2 || "Step 2: Authentication"}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
