import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

const StatsModal = ({ onClose, dayData, activeTab = "submitted" }) => {
  const [tab, setTab] = useState(activeTab);

  const tabs = [
    {
      key: "submitted",
      label: "Submitted",
      data: dayData?.submitted_quote_ids || [],
    },
  ];

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-[#000000b4] bg-opacity-40 flex items-center justify-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Modal content */}
        <motion.div
          className="bg-white rounded shadow-xl w-2xl max-h-[70vh] flex flex-col"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Header */}
          <div className="flex justify-between items-center px-2 py-2 border-b">
            <h2 className="text-lg font-semibold">
              Quote IDs ({dayData?.day === "today" ? "Today" : "Yesterday"})
            </h2>
            <button onClick={onClose}>
              <X className="w-5 h-5 hover:text-red-600 text-red-500" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b">
            {tabs.map((t) => (
              <button
                key={t.key}
                className={`flex-1 py-1 f-12 font-medium ${
                  tab === t.key
                    ? "border-b-2 border-blue-500 text-blue-600"
                    : "text-gray-500"
                }`}
                onClick={() => setTab(t.key)}
              >
                {t.label} ({t.data.length})
              </button>
            ))}
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4">
            {tabs
              .find((t) => t.key === tab)
              ?.data.map((id, idx) => (
                <div
                  key={idx}
                  className="p-2 mb-2 rounded-md bg-gray-100 text-gray-800 text-sm"
                >
                  {id}
                </div>
              ))}

            {tabs.find((t) => t.key === tab)?.data.length === 0 && (
              <p className="text-gray-400 text-center py-4">No records found</p>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default StatsModal;
