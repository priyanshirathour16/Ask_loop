import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Header from './Header';
import { getSocket } from '../pages/Socket';

const Layout = ({ requestPermission }) => {
  const socket = getSocket();
  const userData = localStorage.getItem('loopuser');
  const userObject = userData ? JSON.parse(userData) : null;
   const navigate = useNavigate();
  
const [isConnected, setIsConnected] = useState(socket?.connected || false);

 useEffect(() => {
    if (!userObject) {
      navigate('/login', { replace: true });
    }
  }, [userObject, navigate]);

  useEffect(() => {
    if (!socket) return;

    // ✅ Functions to update status
    const setGreen = () => setIsConnected(true);
    const setRed = () => setIsConnected(false);

    // ✅ Listen to all relevant events
    socket.on("connect", setGreen);
    socket.on("disconnect", setRed);
    socket.on("connect_error", setRed);
    socket.on("reconnect_attempt", setRed);
    socket.on("reconnect", setGreen);
    socket.on("reconnect_failed", setRed);
    socket.on("reconnect_error", setRed);

    // ✅ Initial check (covers page refresh)
    setIsConnected(socket.connected);

    // Cleanup
    return () => {
      socket.off("connect", setGreen);
      socket.off("disconnect", setRed);
      socket.off("connect_error", setRed);
      socket.off("reconnect_attempt", setRed);
      socket.off("reconnect", setGreen);
      socket.off("reconnect_failed", setRed);
      socket.off("reconnect_error", setRed);
    };
  }, [socket]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 relative">
      <Header requestPermission={requestPermission} />

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-0 py-4">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-200 text-sm py-2 border-t">
        <div className="container mx-auto text-center text-gray-500">
          &copy; {new Date().getFullYear()} Emarketz. All rights reserved.
        </div>
      </footer>

      {/* Socket Indicator */}
      {userObject?.id == 1 && (

        <div className="fixed bottom-2 left-2 z-[9999999999999999999999]">
          <div
            className={`h-3 w-3 rounded-full shadow-md ${isConnected ? 'bg-green-500' : 'bg-red-500'
              }`}
            title={isConnected ? 'Socket Connected' : 'Socket Disconnected'}
          ></div>
        </div>
      )}
    </div>
  );
};

export default Layout;
