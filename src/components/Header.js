import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Bell, Quote, MessageSquareMore, Megaphone, MessageSquareText, CircleCheck, BellIcon, CirclePercent, ArrowLeftRight, Hash, UserX, Users, ChevronDown, FileText, Tag, Coins, Settings, ChevronUp } from 'lucide-react';
import CustomLoader from '../CustomLoader';
import LogoNew from '../new-logo.png';
import { AnimatePresence } from 'framer-motion';
import QueryDetails from '../pages/QueryDetails';
import QueryDetailsAdmin from '../pages/QueryDetailsAdmin';
import FeasabilityQueryDetails from '../pages/FeasabilityQueryDetails';

import toast from 'react-hot-toast';
import NotificationLoader from '../pages/NotificationLoader';
import TransferRequestsPage from '../pages/TransferRequestsPage';
import ConfirmationModal from './ConfirmationModal';
import { getSocket } from '../pages/Socket';
import { Tooltip } from 'react-tooltip';

const Header = ({ requestPermission }) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0); // State for notification count
  const [notifications, setNotifications] = useState([]); // State for notifications
  const [notificationsVisible, setNotificationsVisible] = useState(false); // To control visibility of notifications dropdown
  const socket = getSocket();
  const [loading, setLoading] = useState(false); // State for loading spinner
  const [selectedQuery, setSelectedQuery] = useState('');
  const [selectedQuote, setSelectedQuote] = useState('');
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isFeasDetailsOpen, setIsFeasDetailsOpen] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState(null);

  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);


  const navigate = useNavigate();


  const userData = localStorage.getItem('loopuser');
  const userObject = JSON.parse(userData);
  const userName = userObject.fld_first_name;

  const userData2 = localStorage.getItem('user');
  const userObject2 = JSON.parse(userData2);


  const menuItems = [
    { label: "Users", route: "manage-users", icon: Users },
    { label: "Currency", route: "manage-currency", icon: Coins },
    { label: "Tags", route: "manage-tags", icon: Tag },
    { label: "Services", route: "manage-services", icon: FileText },
  ];


  const showUsersMenu =
    userObject?.fld_admin_type === "SUPERADMIN" ||
    (userObject?.fld_admin_type === "SUBADMIN" &&
      userObject?.user_access !== null &&
      userObject?.user_access !== "" &&
      parseInt(userObject?.user_access, 10) !== 0);

  // Close menu if clicked outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  useEffect(() => {
    const checkNotificationPermission = () => {
      if (Notification.permission === 'granted') {
        setNotificationPermission('granted');
      } else if (Notification.permission === 'denied') {
        setNotificationPermission('denied');
      } else {
        setNotificationPermission('default');
      }
    };

    checkNotificationPermission(); // Check the notification permission status when component mounts
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
    window.close();
  };

  const toggleDetailsPage = () => {
    setIsDetailsOpen(!isDetailsOpen);
  };

  const toggleFeasDetailsPage = () => {
    setIsFeasDetailsOpen(!isFeasDetailsOpen);
  };

  useEffect(() => {
    socket.on('terminateallsessions', (data) => {
      localStorage.clear();
      window.location.href = "https://apacvault.com/login/";
    });

    return () => {
      socket.off('terminateallsessions');  // Clean up on component unmount
    };
  }, []);

  const timeAgo = (timestamp) => {
    const currentTime = Math.floor(Date.now() / 1000); // Get current time in seconds
    const diff = currentTime - timestamp; // Time difference in seconds

    const seconds = diff;
    const minutes = Math.floor(diff / 60);
    const hours = Math.floor(diff / 3600);
    const days = Math.floor(diff / 86400);
    const weeks = Math.floor(diff / 604800);
    const months = Math.floor(diff / 2628000);
    const years = Math.floor(diff / 31536000);

    if (seconds < 60) return `${seconds} sec ago`;
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hr ago`;
    if (days === 1) return 'Yesterday';
    if (days < 30) return `${days} d ago`;
    if (months < 12) return `${months} month ago`;
    return `${years} year ago`;
  };

  useEffect(() => {
    const checkSessionTimeout = () => {
      const loginTime = localStorage.getItem("loggedintime");
      if (loginTime) {
        const currentTime = Date.now();
        const FOUR_HOURS = 4 * 60 * 60 * 1000; // 4 hours in milliseconds
        if (currentTime - loginTime > FOUR_HOURS) {
          localStorage.clear(); // Clear all localStorage
          window.location.href = "https://apacvault.com/login"; // Redirect
        }
      } else {
        localStorage.clear(); // Clear all localStorage
        window.location.href = "https://apacvault.com/login"; // Redirect
      }
    };

    checkSessionTimeout(); // Run once on load

    const interval = setInterval(checkSessionTimeout, 5 * 60 * 1000);

    return () => clearInterval(interval); // Cleanup
  }, []);


  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen);
  };



  const handleNavigation = (path) => {
    setUserMenuOpen(false);
    navigate(path);
  };

  const fetchNotificationsCount = async () => {

    try {
      const response = await fetch('https://loopback-skci.onrender.com/api/scope/getNotifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userObject.id }),
      });

      const data = await response.json(); // Parse the response as JSON

      if (data.status) {
        setNotificationCount(data.unread_count);
      } else {
        console.error('Failed to fetch notification count:', data.message);
      }
    } catch (error) {
      console.error('Error fetching notification count:', error);
    }
  };

  const handleNotificationClick = async (notificationId, refId, quoteId, isfeasability, viewer) => {

    setSelectedQuery(refId);
    setSelectedQuote(quoteId)
    if (isfeasability == 0) {
      setIsDetailsOpen(true);
    } else {
      if (viewer != null && viewer == 'owner') {
        setIsDetailsOpen(true);
      } else if (viewer != null && viewer == 'viewer') {
        setIsFeasDetailsOpen(true);
      }
    }

    try {
      const response = await fetch('https://loopback-skci.onrender.com/api/scope/readmessage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: notificationId,
        }),
      });

      const data = await response.json();
      if (data.status) {
        console.log('Notification marked as read');
        fetchNotificationsCount();
      } else {
        console.error('Failed to mark notification as read');
      }
    } catch (error) {
      console.error('Error while marking notification as read', error);
    }
  };
  const fetchNotifications = async () => {
    setLoading(true); // Show loading spinner
    try {
      const response = await fetch('https://loopback-skci.onrender.com/api/scope/getNotifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userObject.id }),
      });

      const data = await response.json(); // Parse the response as JSON


      if (data.status) {
        setNotifications(data.notifications); // Update notifications state
      } else {
        console.error('Failed to fetch notifications:', data.message);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false); // Hide loading spinner
    }
  };

  const MarkAllAsRead = async () => {
    setLoading(true); // Show loading spinner
    try {
      const response = await fetch('https://loopback-skci.onrender.com/api/scope/readAllNotifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userObject.id }),
      });

      const data = await response.json(); // Parse the response as JSON


      if (data.status) {
        setNotifications(data.notifications); // Update notifications state
        fetchNotificationsCount();
      } else {
        console.error('Failed to fetch notifications:', data.message);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false); // Hide loading spinner
    }
  };

  useEffect(() => {
    fetchNotificationsCount();
    const interval = setInterval(() => {
      //fetchNotificationsCount(); 
    }, 5000);

    return () => clearInterval(interval); // Cleanup on component unmount
  }, []);

  const toggleNotifications = () => {
    setNotificationsVisible(!notificationsVisible);
    if (!notificationsVisible) {
      fetchNotifications(); // Fetch notifications when the dropdown is shown
    }
  };

  const logoutAllUsers = async () => {
    console.log("Logout all users clicked");
    socket.emit("closeallusersessions", "yesclearall")

  }
  const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
  const openAllUsersSessionClear = () => {
    setConfirmationModalOpen(true);
  }

  const handleGoHome = () => {
    if (userObject.fld_email === "puneet@redmarkediting.com") {
      navigate("/query")
    } else {
      navigate("/assignquery");
    }
  }


  return (
    <header className="bg-white text-dark">
      <div className="mx-auto w-full flex justify-between items-center container">
        {/* Logo and Navigation Links */}
        <div className="flex items-center">
          <h1 className="text-xl font-bold mr-6  py-3 px-2">
            <img
              src={LogoNew}
              alt="Company Logo"
              onClick={handleGoHome}
              className="nav-logo cursor-pointer"
            />
          </h1>

        </div>

        {/* User Session Info */}
        <div className="relative n-dp-dn z-50 items-center flex">

          <div className="relative inline-block text-left" ref={dropdownRef}>
            {/* Dropdown Toggle */}
            {(userObject?.fld_admin_type == "SUBADMIN" || userObject?.fld_admin_type == "SUPERADMIN") && (

              <button
                onClick={() => setOpen(!open)}
                className="ml-6 f-11 relative text-orange-800 px-2  py-1 border border-orange-700 bg-orange-50 rounded-md flex items-center hover:bg-orange-100 transition"
              >
                <Settings size={16} className="mr-1" /> Manage {open ? (<ChevronUp size={16} className="ml-1" />) : (<ChevronDown size={16} className="ml-1" />)}
              </button>
            )}

            {/* Dropdown Menu */}
            {open && (
              <div
                className="absolute left-0 mt-2 w-48 rounded-xl shadow-lg bg-white border border-gray-200 z-50 animate-fadeIn"
              >
                {menuItems
                  .filter((item) => {
                    if (item.label === "Users") return showUsersMenu;
                    return true; // show all others normally
                  })
                  .map((item, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        navigate(item.route);
                        setOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-800 flex items-center transition"
                    >
                      <item.icon size={18} className="mr-1 text-orange-500" />
                      {item.label}
                    </button>
                  ))}
              </div>
            )}
          </div>

          {userObject.id == 1 && (
            <button
              data-tooltip-id="my-tooltip"
              data-tooltip-content="Expire All Active Sessions"
              onClick={openAllUsersSessionClear} className=" ml-6 relative text-red-500 rounded-md">
              <UserX size={24} />

            </button>
          )}


          <button onClick={toggleNotifications} className="text-dark ml-6 relative">
            <Bell size={24} />
            {notificationCount > 0 && (
              <span className="absolute text-xs bg-red-600 text-white rounded-full px-1 py-0.5" style={{ position: "absolute", top: "-10px", right: "-10px" }}>
                {notificationCount}
              </span>
            )}
          </button>


          {/* Notifications Dropdown */}
          {notificationsVisible && (
            <div className="absolute top-12 right-0 bg-white text-black shadow-lg w-72 border-t-2 border-blue-400 py-3 px-1 rounded">
              <div className='flex items-center justify-between'>
                <h3 className="font-bold mb-2 ml-2">Notifications</h3>
                <button onClick={MarkAllAsRead} className='mr-2 rounded px-1 border-2 hover:border-blue-400 duration-200'>Read All</button>
              </div>
              {loading ? (
                <NotificationLoader />
              ) : notifications.length === 0 ? (
                <p>No notifications</p>
              ) : (
                <div className=' overflow-y-scroll' style={{ height: "200px" }}>
                  <ul className='p-1 text-sm'>
                    {notifications.map((notification, index) => (
                      <li key={index} className={`border-b py-1 px-1 my-1 rounded-sm cursor-pointer ${notification.isread == 0 ? 'bg-blue-100' : ''}`} onClick={() => handleNotificationClick(notification.id, notification.ref_id, notification.quote_id, notification.isfeasability, notification.viewer)}>
                        <p className='flex items-start'>
                          {/* Display icon based on notification type */}
                          {notification.icon == 'quote' && (
                            <span className="mr-2">
                              <Quote size={22} className='bg-green-100 text-green-800 rounded-full border-1 p-1 border-green-800' />
                            </span>
                          )}
                          {notification.icon == 'feasability' && (
                            <span className="mr-2">
                              <i class="fa fa-question bg-orange-100 text-orange-800 rounded-full border-1 p-1 border-orange-800" aria-hidden="true"></i>
                            </span>
                          )}
                          {notification.icon == 'chat' && (
                            <span className="mr-2">
                              <MessageSquareText size={22} className='bg-blue-100 text-blue-800 rounded-full border-1 p-1 border-blue-800' />
                            </span>
                          )}
                          {notification.icon == 'tag' && (
                            <span className="mr-2">
                              <Hash size={22} className='bg-blue-100 text-blue-800 rounded-full border-1 p-1 border-blue-800' />
                            </span>
                          )}
                          {notification.icon == 'completed' && (
                            <span className="mr-2">
                              <CircleCheck size={24} className='bg-green-100 text-green-800 rounded-full' /> {/* Completed icon */}
                            </span>
                          )}
                          {notification.icon == 'transferred' && (
                            <span className="mr-2">
                              <ArrowLeftRight size={26} className='bg-orange-100 text-orange-800 rounded-full border border-orange-600 p-1' /> {/* Completed icon */}
                            </span>
                          )}
                          {notification.icon == 'discount' && (
                            <span className="mr-2">
                              <CirclePercent size={24} className='bg-red-100 text-red-800 rounded-full ' /> {/* Completed icon */}
                            </span>
                          )}
                          {(!notification.icon || notification.icon == null) && (
                            <span className="mr-2">
                              <BellIcon size={22} className='bg-blue-100 text-blue-800 rounded-full border-1 p-1 border-blue-800' />
                            </span>
                          )}
                          <span>
                            {notification.isdeleted == 1 ? <span style={{ textDecoration: "line-through", color: "red" }}>{notification.deleted_user_name} </span> : notification.fld_first_name} {notification.message} on quotation for ref_id{' '}
                            <strong>{notification.ref_id}</strong>
                            <span className="text-gray-500 text-xs ml-2">
                              {timeAgo(notification.date)} {/* Display time ago */}
                            </span>
                          </span>
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* User Menu */}
          <button
            onClick={toggleUserMenu}
            className="text-dark ml-6"
          >
            {userName}
          </button>
          {userMenuOpen && (
            <div className="absolute right-0 top-30 mt-2 bg-gray-100 text-black shadow-md border px-2 py-1 rounded sobut">
              <button
                onClick={handleLogout}
                className="block text-left hover:bg-red-400 rounded hover:text-white"
              >
                <LogOut size={12} />&nbsp; Sign Out
              </button>
            </div>
          )}
        </div>



      </div>
      <AnimatePresence>
        {isDetailsOpen && (
          userObject2.email_id == "accounts@redmarkediting.com" ? (
            <QueryDetailsAdmin
              onClose={toggleDetailsPage}
              queryId={selectedQuery}
              quotationId={selectedQuote}
            />
          ) : (
            <QueryDetails
              onClose={toggleDetailsPage}
              queryId={selectedQuery}
              quotationId={selectedQuote}
            />
          )
        )}
        {
          isFeasDetailsOpen && (
            <FeasabilityQueryDetails queryId={selectedQuery} quotationId={selectedQuote} onClose={toggleFeasDetailsPage} />
          )
        }

        {confirmationModalOpen && (
          <ConfirmationModal title="Are You Sure Want To Clear All Sessions?"
            message="It will destroy all active sessions and all users will be logged out including you."
            onYes={logoutAllUsers}
            onClose={() => setConfirmationModalOpen(false)}
          />
        )}

      </AnimatePresence>
      <Tooltip id="my-tooltip" />
    </header>
  );
};

export default Header;
