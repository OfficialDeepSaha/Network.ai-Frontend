import React, { useEffect, useState } from 'react'
import { ClipLoader } from 'react-spinners';
import { motion, AnimatePresence } from "framer-motion"; 
import axios from 'axios';

const ConnectionRequests = ({ userId , token}) => {
    const [approvalRequests, setApprovalRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState("All");
  
    const handleGetApprovalRequests = async () => {
      if (!userId) return;
      setLoading(true); // Set loading to true before fetching
      try {
        const response = await axios.get(
          `https://network-ai-backend.onrender.com/approval_requests/?user_id=${userId}`
        );
        setApprovalRequests(response.data); // Set fetched approval requests
      } catch (error) {
        console.error("Failed to get approval requests:", error);
      } finally {
        setLoading(false); // Set loading to false after fetching
      }
    };
  
    useEffect(() => {
      handleGetApprovalRequests();
    }, [userId]); // Fetch approval requests when component mounts or userId changes
  
    const handleApprovalAction = async (requestId, approved) => {
        setLoading(true);
        try {
          await axios.post(
            `https://network-ai-backend.onrender.com/handle_approval/${requestId}?approved=${approved}`,
            {}, 
            {
              
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          await Promise.all([
            handleGetApprovalRequests(),
            
          ]);
          alert(`Request ${approved ? "approved" : "denied"} successfully`);
        } catch (error) {
          alert("Failed to handle approval: " + error.message);
        } finally {
          setLoading(false);
        }
      };
  
    return (
      <main className="flex-1 overflow-y-auto bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <ClipLoader size={50} color={"#4A90E2"} loading={loading} />
            </div>
          ) : (
            <>
              
  
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <AnimatePresence>
                  {approvalRequests.map((approv) => (
                    <motion.div
                      key={approv.id}
                      className="bg-white shadow-lg rounded-lg overflow-hidden"
                      whileHover={{
                        y: -5,
                        boxShadow: "0 10px 20px rgba(0,0,0,0.1)"
                      }}
                      transition={{ duration: 0.3 }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <img
                        className="w-full h-48 object-cover"
                        src={`https://cdn.usegalileo.ai/stability/cde723c1-99a4-4c51-b7ae-fd2f071d6cfa.png`}
                        alt="Request Image"
                      />
                      <div className="p-6">
                        <h3 className="text-xl font-semibold mb-2">
                          {approv.sender_name}
                        </h3>
                        <motion.button
                          className="bg-green-500 text-white px-4 py-2 justify-between rounded-md hover:bg-green-600 transition-colors duration-200"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleApprovalAction(approv.id, true)}
                        >
                          Approve
                        </motion.button>
                        <motion.button
                          className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors duration-200"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleApprovalAction(approv.id, false)}
                        >
                          Deny
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            </>
          )}
        </div>
      </main>

    )
}

export default ConnectionRequests;
