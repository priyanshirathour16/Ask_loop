import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useParams, useNavigate } from 'react-router-dom';
import DecryptPage from "./DecryptPage";
import Layout from './components/Layout';
import ManageContactMadeQueries from "./pages/ManageContactMadeQueries";
import ManageQuery from './pages/ManageQuery';
import './output.css';
import './index.css';
import './input.css';
import './App.css';
import { getToken } from 'firebase/messaging';
import { messaging } from './firebase-config';
import { onMessage } from 'firebase/messaging';
import { ToastContainer, toast, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Toaster } from 'react-hot-toast';
import FollowingPage from './pages/FollowingPage';
import FeasabilityPage from './pages/FeasabilityPage';
import { ScanFace } from 'lucide-react';
import Oops from './Oops';
import Login from './Login';
import ForgotPassword from './ForgotPassword';
import ManageUser from './pages/manageuser/ManageUser';
import ManageCurrency from './pages/currency/ManageCurrency';
import ManageOtherTags from './pages/othertags/ManageOtherTags';
import ManageRequirement from './pages/requirement/ManageRequirement';
import SetPassword from './pages/manageuser/SetPassword';


// basename="/askforscope"



function App() {

  const [permissionGranted, setPermissionGranted] = useState(false);
  const userData = localStorage.getItem('loopuser');

  const userObject = JSON.parse(userData);



  const requestPermission = async () => {
    try {
      // Check if notification permission is already granted
      const permission = Notification.permission;

      if (permission === 'granted') {
        console.log('Notification permission already granted.');

        // Register the service worker with the correct scope
        if ('serviceWorker' in navigator) {
          // Register the service worker manually with the correct path
          const registration = await navigator.serviceWorker.register('./firebase-messaging-sw.js');
          console.log('Service Worker registered with scope:', registration.scope);

          // Now, get the token with the custom service worker registration
          const currentToken = await getToken(messaging, {
            vapidKey: 'BC3B6_X03H_wgXOz14riIIaW2FDlHr2_LsIVFj_wLhlDtIK4MS53uxlEfJIgQeZvreY8-TsgAhZfpL9YPS5jLn4',  // Your VAPID key here
            serviceWorkerRegistration: registration, // Pass the custom service worker registration
          });

          if (currentToken) {
            console.log('FCM Token:', currentToken);
            const requestData = {
              userId: userObject.id,
              token: currentToken,
            };

            const response = await fetch("https://loopback-skci.onrender.com/api/scope/saveFcmToken", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(requestData),
            });

            if (response.ok) {
              const result = await response.json();
              console.log("FCM token successfully saved:", result);
            } else {
              console.error("Failed to save FCM token:", response.status, response.statusText);
            }

          } else {
            console.log('No registration token available.');
          }
        } else {
          console.error('Service Workers are not supported in this browser.');
        }
      } else if (permission === 'default') {
        // Request permission if not already granted
        const permissionRequest = await Notification.requestPermission();
        if (permissionRequest === 'granted') {
          console.log('Notification permission granted.');
          setPermissionGranted(true);
          requestPermission();  // Re-run the permission request logic after granting
        } else {
          console.log('Notification permission denied.');
        }
      } else {
        console.log('Notification permission denied.');
      }

    } catch (error) {
      console.error('Error getting notification permission or token:', error);
    }
  };

  useEffect(() => {

    requestPermission();

    onMessage(messaging, (payload) => {
      console.log('Message received. ', payload.notification);  // Check this log to see the incoming message
      if (payload && payload.notification) {
        // Handle the notification payload data as needed
        toast(payload.notification.body ?? payload.notification.message);
        //alert(payload.data.google.c.a.c_l)
      }
    });
  }, []);

  const ViewDetails = () => {
    const { ref_id, quote_id } = useParams();
    const [quoteDetails, setQuoteDetails] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
      const fetchUserType = async () => {
        try {
          setLoading(true);
          const response = await fetch("https://loopback-skci.onrender.com.onrender.com/api/scope/getusersforscope", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              ref_id: ref_id,
              quote_id: quote_id,
            }),
          });
          const data = await response.json();
          if (data.status) {
            setQuoteDetails(data.data); // Adjust based on API response structure
          } else {
            return <div>You are not authorized to access this Quote</div>;
          }
        } catch (error) {
          console.error("Error fetching user type:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchUserType();
    }, [ref_id, quote_id]);

    if (loading) return <div className="min-h-80 animate-pulse flex items-center justify-center bg-gray-200">

    </div>;

    if (!quoteDetails) {
      return <div className="min-h-80 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Oops!</h2>
          <div className='flex items-center justify-center'>
            <ScanFace size={40} className="text-red-600 mr-2 animate-shake" />
            <p className="text-xl text-gray-600 ">
              Umm... Looks like you don't have access to this quote
            </p>
          </div>
        </div>
      </div>;
    }

    if (userObject && (userObject.id == 1 || userObject.id == 342 || userObject.scopeadmin == 1)) {
      return <ManageQuery sharelinkrefid={ref_id} sharelinkquoteid={quote_id} />;
    } else if (userObject && userObject.id == quoteDetails.user_id) {
      return <ManageContactMadeQueries notification={requestPermission} sharelinkrefid={ref_id} sharelinkquoteid={quote_id} />;
    } else if (userObject && quoteDetails.followers.includes(userObject.id)) {
      return <FollowingPage sharelinkrefid={ref_id} sharelinkquoteid={quote_id} />;
    } else if (userObject && quoteDetails.isfeasability == 1 && quoteDetails.feasability_status == "Pending" && quoteDetails.feasability_user == userObject.id) {
      return <FeasabilityPage sharelinkrefid={ref_id} sharelinkquoteid={quote_id} />;
    } else {
      return <div className="min-h-80 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Oops!</h2>
          <div className='flex items-center justify-center'>
            <ScanFace size={40} className="text-red-600 mr-2 animate-shake" />
            <p className="text-xl text-gray-600 ">
              Umm... Looks like you don't have access to this quote
            </p>
          </div>
        </div>
      </div>;
    }
  };



  return (
    <Router basename='/' >
      <Routes>
        {/* Public route */}
        {/* <Route path="/:email/:token" element={<DecryptPage />} /> */}
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/admin/set_password/:token" element={<SetPassword />} />

        {/* Protected routes */}
        <Route
          path="/"
          element={<Layout request={requestPermission} />}
        >
          <Route path='/oops' element={<Oops />} />
          <Route path="/assignquery" element={<ManageContactMadeQueries notification={requestPermission} />} />
          <Route path="/query" element={<ManageQuery />} />
          <Route path="/viewdetails/:ref_id/:quote_id" element={<ViewDetails />} />

          <Route path="/manage-users" element={<ManageUser />} />
          <Route path="/manage-currency" element={<ManageCurrency />} />
          <Route path="/manage-services" element={<ManageRequirement />} />
          <Route path="/manage-tags" element={<ManageOtherTags />} />

        </Route>

        {/* Fallback route */}
        {/* <Route path="*" element={<Navigate to="/login" />} /> */}
      </Routes>
      <ToastContainer
        position="top-right"
        autoClose={10000}
        hideProgressBar
        newestOnTop
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        transition={Slide}
      />
      <Toaster position="bottom-left" reverseOrder={false} toastOptions={{
        // Define default options
        className: 'border',
        duration: 3000,
        removeDelay: 500,
        style: {
          background: '#161616FF',
          color: '#fff',
        },

        // Default options for specific types
        success: {
          duration: 3000,
          iconTheme: {
            primary: 'green',
            secondary: 'black',
          },
        },
      }} />
    </Router>
  );
}

export default App;
