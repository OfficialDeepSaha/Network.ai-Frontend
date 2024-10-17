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
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <AnimatePresence>
                  
                {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"> */}
            {approvalRequests.map((approv , index) => (
              <motion.div
                key={approv.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden border-4 border-transparent hover:border-gradient-to-r from-blue-400 to-indigo-500 transition-all duration-300 hover:-translate-y-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                style={{
                  backgroundImage: "linear-gradient(to right, #f0f9ff, #e0f2fe, #bae6fd, #7dd3fc)",
                  backgroundClip: "padding-box"
                }}
              >
                <div className="relative pb-48 overflow-hidden">
                  <img
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 hover:scale-110"
                    src="https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2.25&w=256&h=256&q=80"
                    
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <h2 className="absolute bottom-4 left-4 text-lg font-semibold text-white">{approv.sender_name}</h2>
                </div>
                <div className="p-4">
                  <p className="text-sm font-medium text-blue-600 mb-1">Tech</p>
                  <p className="text-xs text-gray-500 mb-3">2 mutual connections</p>
                  <div className="flex space-x-2">
                    <motion.button 
                      className="flex-1 px-3 py-2 bg-gradient-to-r from-green-400 to-green-600 text-white text-sm rounded-lg hover:from-green-500 hover:to-green-700 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-md"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleApprovalAction(approv.id, true)}
                    >
                      Approve
                    </motion.button>
                    <motion.button 
                      className="flex-1 px-3 py-2 bg-gradient-to-r from-red-400 to-red-600 text-white text-sm rounded-lg hover:from-red-500 hover:to-red-700 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-md"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleApprovalAction(approv.id, false)}
                    >
                      Deny
                    </motion.button>
                  </div>
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
