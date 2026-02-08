import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CirclePause, X, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

const UsersRequestCount = ({ onClose }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [fetching, setFetching] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [needAccess, setNeedAccess] = useState(0);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://loopback-skci.onrender.com/api/scope/getAllInstaCrmusers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: 1 }),
      });
      const data = await response.json();
      if (data.status) setUsers(data.data || []);
    } catch (error) {
      toast.error('Failed to fetch tags.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleFetchCount = async () => {
    try {
      if (!selectedUser) {
        return;
      }
      setFetching(true);
      const response = await fetch('https://loopback-skci.onrender.com/api/scope/getUserRequestsCount', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: selectedUser }),
      });
      const data = await response.json();
      if (data.status) {
        setPendingCount(data.request_pending_count || 0);
        setNeedAccess(data.request_access_count || 0);
      } else {
        toast.error('Failed to fetch request count.');
      }
    } catch (error) {
      console.error('Error fetching request details:', error);
    } finally {
      setFetching(false);
    }
  };

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'tween', duration: 0.3 }}
      className="fixed top-0 right-0 w-[400px] h-full bg-white shadow-lg z-50"
    >
      <div className="flex justify-between items-center px-4 py-3 border-b bg-blue-500 text-white">
        <h2 className="text-lg font-semibold">Users Request Count</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-red-500">
          <X />
        </button>
      </div>

      <div className="p-4">
        <div className="flex items-center">
          <select
            name="users"
            id="users"
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Users</option>
            {loading ? (
              <option value="" disabled>Loading...</option>
            ) : (
              users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))
            )}
          </select>
          <button
            className="ml-2 bg-blue-500 text-white px-2 py-1 rounded-md shadow-sm hover:bg-blue-600 transition-colors"
            onClick={handleFetchCount}
          >
            Fetch
          </button>
        </div>

        {fetching && <p>Loading counts...</p>}

        {selectedUser && !fetching && (
          <div className="mt-6">
            <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-4">
              <h3 className="text-lg font-semibold text-gray-700 mb-3">Request Summary</h3>
              <div className="flex items-center justify-between mb-2 bg-yellow-100 text-yellow-800 rounded-lg px-3 py-2">
                <span className="flex items-center gap-2">
                  <CirclePause size={18} />
                  Pending Requests
                </span>
                <span className="font-bold">{pendingCount}</span>
              </div>

              <div className="flex items-center justify-between bg-blue-100 text-blue-800 rounded-lg px-3 py-2">
                <span className="flex items-center gap-2">
                  <Lock size={18} />
                  Need Access Requests
                </span>
                <span className="font-bold">{needAccess}</span>
              </div>
            </div>
          </div>
        )}

      </div>
    </motion.div>
  );
};

export default UsersRequestCount;
