import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { ClipLoader } from "react-spinners";

export const GroupRequests = ({token , userId}) => {
  const [groupRequests, setGroupRequests] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [loading, setLoading] = useState(false);


  // Function to use speech synthesis to give feedback
 const speak = (text) => {
  const utterance = new SpeechSynthesisUtterance(text);
  window.speechSynthesis.speak(utterance);
};
    

  // Handle fetching group approval requests
  const handleGroupApprovalRequests = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const response = await axios.get(
        `https://network-ai-backend.onrender.com/approval_requests_for_group/?user_id=${userId}`
      );
      setGroupRequests(response.data);
      if (response.data.length === 0) {
      // No requests, give voice feedback
      speak("There are no requests present at this moment.");
    } else {
      // Requests available, activate voice recognition
      speak("You have group requests. Click 'yes' to approve them.");
      // await listenForCommands();
     }  
    } catch (error) {
      console.error("Failed to get group approval requests:", error);
      speak("I am unable to fetching the group requests.");
    } finally {
      setLoading(false);
    }
  };

  // useEffect to fetch data on component mount
  useEffect(() => {
    handleGroupApprovalRequests();
  }, [userId]);

  const handleGroupApprovalAction = async (requestId, approved) => {
    setLoading(true);
    try {
      await axios.post(
        `https://network-ai-backend.onrender.com/handle_approval_other_network/${requestId}?approved=${approved}`,
        {}, // Empty body since you're not sending data in the body
        {
          // Headers should be passed as the third argument
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      await Promise.all([
        
        handleGroupApprovalRequests(),
        
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
      ) : groupRequests.length === 0 ? (
          <div className="text-center text-xl mt-8">
            There are no group requests present at this moment.
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
              {groupRequests.map((approv) => (
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
                      onClick={() => handleGroupApprovalAction(approv.id, true)}
                    >
                      Yes
                    </motion.button>
                    <motion.button
                      className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors duration-200"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleGroupApprovalAction(approv.id, false)}
                    >
                      No
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
