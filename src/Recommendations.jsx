import { useEffect, useState } from "react"; 
import axios from "axios"; 
import { motion, AnimatePresence } from "framer-motion"; 
import { ClipLoader } from "react-spinners"; 
import { FaLinkedin, FaGithub, FaTwitter, FaCommentAlt, FaUserFriends } from "react-icons/fa";

const Recommendations = ({ userId, handleSendConnectionRequest }) => { 
  const [recommendations, setRecommendations] = useState([]); // Store recommendations here
  const [loading, setLoading] = useState(true); // Local loading state
  const [activeCategory, setActiveCategory] = useState("All"); // State for active category

  const handleGetRecommendations = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const response = await axios.get(`https://network-ai-backend.onrender.com/recommendations/?user_id=${userId}`);
      setRecommendations(response.data);
    } catch (error) {
      console.error("Failed to get recommendations:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch recommendations when component mounts or userId changes
  useEffect(() => {
    handleGetRecommendations();
  }, [userId]);

  return ( 
    <div className="max-w-7xl mx-auto"> 
      {loading ? ( 
        <div className="flex justify-center items-center h-64"> 
          <ClipLoader size={50} color={"#4A90E2"} loading={loading} /> 
        </div> 
      ) : ( 
        <> 
         

          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
            variants={{ initial: { opacity: 0 }, animate: { opacity: 1 } }} 
            initial="initial" 
            animate="animate" 
          > 
            <AnimatePresence> 
              {recommendations.map((recomm) => ( 
                <motion.div 
                  key={recomm.id} 
                  className="bg-white shadow-lg rounded-2xl overflow-hidden transform transition-all duration-300" 
                  whileHover={{ y: -5, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }} 
                  layout 
                  initial={{ opacity: 0, scale: 0.9 }} 
                  animate={{ opacity: 1, scale: 1 }} 
                  exit={{ opacity: 0, scale: 0.9 }} 
                  transition={{ duration: 0.3 }} 
                > 
                  <div className="relative h-40"> 
                    <img className="w-full h-full object-cover" src={recomm.banner_image} alt="Banner" /> 
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div> 
                  </div> 
                  <div className="p-4 relative"> 
                    <motion.div 
                      className="absolute -top-10 left-4 bg-white rounded-full p-1 shadow-md" 
                      initial={{ scale: 0 }} 
                      animate={{ scale: 1 }} 
                      transition={{ delay: 0.1, type: "spring", stiffness: 500, damping: 30 }} 
                    > 
                      <img className="w-16 h-16 rounded-full object-cover border-2 border-white" src={recomm.profile_image} alt="Profile" /> 
                    </motion.div> 
                    <h3 className="text-lg font-bold mb-2 mt-10">{recomm.name}</h3> 
                    <p className="text-blue-600 text-sm font-medium mb-2">{recomm.bio}</p> 
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{recomm.about}</p> 
                    <div className="flex justify-between items-center"> 
                      <div className="flex space-x-2"> 
                        <motion.a href={recomm.linkedin} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}> 
                          <FaLinkedin className="text-blue-600 hover:text-blue-700" size={18} /> 
                        </motion.a> 
                        <motion.a href={'https://github.com/' + recomm.github} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}> 
                          <FaGithub className="text-gray-700 hover:text-gray-800" size={18} /> 
                        </motion.a> 
                        <motion.a href={'https://x.com/' + recomm.twitter_handle} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}> 
                          <FaTwitter className="text-blue-400 hover:text-blue-500" size={18} /> 
                        </motion.a> 
                      </div> 
                      <motion.button 
                        className="text-blue-500 hover:text-blue-600 transition-colors duration-200" 
                        whileHover={{ scale: 1.1 }} 
                        whileTap={{ scale: 0.9 }} 
                      > 
                        <FaCommentAlt size={18} /> 
                      </motion.button> 
                    </div> 
                    <motion.button 
                      className="w-full mt-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-full text-sm font-medium hover:from-blue-600 hover:to-purple-600 transition-colors duration-200 flex items-center justify-center" 
                      whileHover={{ scale: 1.03 }} 
                      whileTap={{ scale: 0.98 }} 
                      onClick={() => handleSendConnectionRequest(recomm.id)} 
                    > 
                      <FaUserFriends className="mr-2" size={14} /> 
                      Connect 
                    </motion.button> 
                  </div> 
                </motion.div> 
              ))} 
            </AnimatePresence> 
          </motion.div> 
        </> 
      )} 
    </div> 
  ); 
}; 

export default Recommendations;
