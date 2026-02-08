import { CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import React, { useEffect, useState } from "react";

const DemoDoneAlready = ({ info }) => {
  const [demos, setDemos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchDemos = async () => {
      if (!info?.email_id || !info?.website_id) {
        setDemos([]);
        return;
      }

      setLoading(true);

      try {
        const response = await fetch(
          "https://loopback-skci.onrender.com/api/scope/selectrefidsfordemodone",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: info.email_id,
              website_id: info.website_id,
            }),
          }
        );

        const data = await response.json();

        if (data.status === "success" && data.demos?.length > 0) {
          // Remove duplicates by demo_id
          const uniqueDemosMap = new Map();
          data.demos.forEach(demo => {
            if (!uniqueDemosMap.has(demo.demo_id)) {
              uniqueDemosMap.set(demo.demo_id, demo);
            }
          });
          setDemos(Array.from(uniqueDemosMap.values()));
        } else {
          setDemos([]);
        }
      } catch (error) {
        console.error("Error fetching demos:", error);
        setDemos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDemos();
  }, [info]);

  if (!info?.email_id || !info?.website_id) return null;
  if (loading) return null;
  if (!demos.length) return null;

  return (
    <div>
      <p className="bg-green-600 px-1 py-0.5 rounded text-white w-fit flex items-center">
        <CheckCircle2 size={13} className="mr-1" />
        Demo(s) Already Done in Other Website <span className="bg-white p-0.5 cursor-pointer text-black mx-0.5 flex items-center"
          onClick={() => { setIsOpen(!isOpen) }}
        >
          {isOpen ? "Hide" : "View"} {!isOpen ? <ChevronDown size={12} /> : <ChevronUp size={12} />}</span>
      </p>
      {demos.length > 0 && isOpen && (
        <ul className="flex flex-col gap-4 my-4">
          {demos.map((demo, index) => (
            <li
              key={index}
              className="border rounded-lg shadow-sm px-2 py-1 flex flex-col justify-start gap-1 bg-white"
            >
              <div className="flex justify-start">
                <span className="font-semibold text-gray-700">Demo ID:</span>
                <span>{demo.demo_id}</span>
              </div>

              <div className="flex justify-start">
                <span className="font-semibold text-gray-700">Duration:</span>
                <span>{demo.demo_duration || "N/A"}</span>
              </div>

              <div className="flex justify-start">
                <span className="font-semibold text-gray-700">Date:</span>
                <span>
                  {demo.demo_date
                    ? new Date(demo.demo_date).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                    : "N/A"}
                </span>
              </div>

              <div className="flex justify-start">
                <span className="font-semibold text-gray-700">Website:</span>
                <span>{demo.website || "N/A"}</span>
              </div>

              <div className="flex justify-start">
                <span className="font-semibold text-gray-700">User:</span>
                <span>{demo.user_name || "N/A"}</span>
              </div>
            </li>
          ))}
        </ul>
      )}


    </div>
  );
};

export default DemoDoneAlready;
