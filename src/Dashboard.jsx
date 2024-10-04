import React, { useState, useEffect, useRef } from "react";
import {
  FaBell,
  FaComments,
  FaHome,
  FaNetworkWired,
  FaGlobe,
  FaThumbsUp,
  FaCog,
  FaUsers,
  FaCommentAlt,
  FaUserFriends,
  FaCrown,
  FaSearch,
  FaEdit,
  FaBriefcase,
  FaGraduationCap,
  FaBullseye,
  FaUpload,
  FaEllipsisV,
  FaPaperPlane,
  FaSmile,
  FaPaperclip,
  FaVideo,
  FaTwitter,
  FaLinkedin,
  FaAddressBook,
} from "react-icons/fa";
import Modal from "react-modal"; // For confirmation dialog
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "./Header";
import axios from "axios";
import { ClipLoader } from "react-spinners";
import { FaGithub, FaUserCircle } from "react-icons/fa";
import Confetti from "react-confetti";
import useWindowSize from "react-use/lib/useWindowSize";
import './Dashboard.css'
import { AiFillAccountBook } from "react-icons/ai";


// WebRTC-related
const iceServers = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
};
let localConnection, remoteConnection;

const Dashboard = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [userId, setUserId] = useState(localStorage.getItem("userId"));
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("recommendations");
  const [approvalRequests, setApprovalRequests] = useState([]);
  const [groupRequests, setGroupRequests] = useState([]);
  const { width, height } = useWindowSize();
  const [networks, setNetworks] = useState([]);
  const [otherNetworks, setOtherNetworks] = useState([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isInCall, setIsInCall] = useState(false);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [chats, setChats] = useState([]); // List of available chats
  const [groups, setGroups] = useState([]);
  const [activeChat, setActiveChat] = useState(null); // Currently selected chat
  const [messages, setMessages] = useState([]); // Messages in active chat
  const [newMessage, setNewMessage] = useState(""); // Message input state
  const wsRef = useRef(null); // WebSocket reference
  const [chatId, setChatId] = useState(null);
  const [documentFile, setDocumentFile] = useState(null);
  const [user, setUser] = useState([]);
  const [isPaymentSuccessful, setIsPaymentSuccessful] = useState(false);
  const [contextMenu, setContextMenu] = useState({
    isVisible: false,
    x: 0,
    y: 0,
  });
  const [rightClickedMessage, setRightClickedMessage] = useState(null); // Store the right-clicked message
  const [isLoadingAIResponse, setIsLoadingAIResponse] = useState(false);
  const [isEditable, setIsEditable] = useState({
    bio: false,
    email: false,
    education: false,
    experience: false,
    goal: false,
    twitter_handle: false,
  });

  const chatBodyRef = useRef(null);
  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);


  const initiateVideoCall = async () => {
    closeModal(); // Close modal after confirmation
    setIsInCall(true); // Update call state

    // Get user media for the video call
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localVideoRef.current.srcObject = stream;

    // Initialize WebRTC connections
    localConnection = new RTCPeerConnection(iceServers);
    stream.getTracks().forEach(track => localConnection.addTrack(track, stream));

    // Handle ICE candidate
    localConnection.onicecandidate = event => {
      if (event.candidate) {
        // Send the candidate to the remote peer via your signaling server (WebSocket)
        sendSignal("ice-candidate", event.candidate);
      }
    };

    // When remote stream is received
    localConnection.ontrack = event => {
      remoteVideoRef.current.srcObject = event.streams[0];
    };

    // Create offer and set local description
    const offer = await localConnection.createOffer();
    await localConnection.setLocalDescription(offer);

    // Send offer to the remote peer via your signaling server (WebSocket)
    sendSignal("offer", offer);
  };

  // Function to handle incoming signals (via WebSocket)
  const handleSignal = async (type, data) => {
    if (type === "offer") {
      // Handle offer from the remote peer
      remoteConnection = new RTCPeerConnection(iceServers);
      remoteConnection.ontrack = event => {
        remoteVideoRef.current.srcObject = event.streams[0];
      };

      await remoteConnection.setRemoteDescription(new RTCSessionDescription(data));

      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      stream.getTracks().forEach(track => remoteConnection.addTrack(track, stream));

      const answer = await remoteConnection.createAnswer();
      await remoteConnection.setLocalDescription(answer);

      sendSignal("answer", answer);
    } else if (type === "answer") {
      // Handle answer from remote peer
      await localConnection.setRemoteDescription(new RTCSessionDescription(data));
    } else if (type === "ice-candidate") {
      // Handle ICE candidate
      const candidate = new RTCIceCandidate(data);
      if (localConnection) {
        await localConnection.addIceCandidate(candidate);
      } else if (remoteConnection) {
        await remoteConnection.addIceCandidate(candidate);
      }
    }
  };



  useEffect(() => {
    const fetchNotifications = () => {
      const newNotifications = [
        { id: 1, content: "New connection request from John Doe" },
        { id: 2, content: "Your post has 100 likes!" },
        { id: 3, content: "New message in Tech group" },
      ];
      setNotifications(newNotifications);
    };
    fetchNotifications();
  }, []);

  const sidebarVariants = {
    open: {
      width: "16rem",
      transition: { duration: 0.5, type: "spring", stiffness: 100 },
    },
    closed: {
      width: "4rem",
      transition: { duration: 0.5, type: "spring", stiffness: 100 },
    },
  };

  const linkVariants = {
    open: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    closed: { opacity: 0, x: -20, transition: { duration: 0.3 } },
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const pulseAnimation = {
    scale: [1, 1.05, 1],
    transition: { duration: 1, repeat: Infinity },
  };

  useEffect(() => {
    // Scroll to the bottom when messages change
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages]);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };
  const handleEditToggle = (field) => {
    setIsEditable((prevState) => ({
      ...prevState,
      [field]: !prevState[field],
    }));
  };

  const handleInputChange = (e, field) => {
    setUserData((prevData) => ({ ...prevData, [field]: e.target.value }));
    setUserDetails((userDetails) => ({
      ...userDetails,
      [field]: e.target.value,
    }));
  };

  const [userData, setUserData] = useState({
    name: "",
    email: "",
    password: "",
    education: "",
    experience: "",
    goal: "",
    twitter_handle: "",
    bio:"",
    about:"",
    github: "",
    linkedin:"",
    banner_image:"",
    profile_image:""
  });

  useEffect(() => {
    async function fetchChats() {
      try {
        const response = await axios.get(
          `http://localhost:8000/get_chat_id?user_id=${userId}`
        );

        setChats(response.data);
        setChatId(response.data.chat_id);
        console.log("Chats: " + JSON.stringify(response.data));
      } catch (error) {
        console.error("Error fetching chats:", error);
      }
    }
    fetchChats();
  }, [userId]);

  useEffect(() => {
    // Only initialize WebSocket if `chatId` is set and `activeChat` is available
    if (activeChat) {
      const ws = new WebSocket(
        `ws://localhost:8000/ws/${activeChat.chat_id}?token=${token}`
      );

      ws.onopen = () => {
        console.log("WebSocket connection established");
      };

      ws.onmessage = (event) => {
        console.log("Message from server:", event.data);
        const receivedMessage = JSON.parse(event.data);
        setMessages((prevMessages) => [...prevMessages, receivedMessage]);
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      ws.onclose = (event) => {
        console.log("WebSocket connection closed. Attempting to reconnect...");
        // Implement reconnection logic here if needed
      };

      // Store WebSocket reference
      wsRef.current = ws;

      // Cleanup function to close WebSocket when chatId changes or component unmounts
      return () => {
        if (wsRef.current) {
          wsRef.current.close();
          wsRef.current = null;
        }
      };
    }
  }, [activeChat, chatId, token]);

  // Fetch messages for the active chat
  useEffect(() => {
    if (activeChat) {
      async function fetchMessages() {
        try {
          console.log("Tabbar ChatID:- " + activeChat.chat_id);
          const response = await axios.get(
            `http://localhost:8000/get_messages/${activeChat.chat_id}`
          );
          setMessages(response.data);
          console.log("Fetched messages:", response.data);
        } catch (error) {
          console.error("Error fetching messages:", error);
        }
      }
      fetchMessages();
    }
  }, [activeChat]);

  const [groupId, setGroupId] = useState([]);

  useEffect(() => {
    const getGroupId = async () => {
      const response = await fetch("http://localhost:8000/my_groups/", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const res = await response.json();
      if (response.ok) {
        console.log("Group Details:- ", res);
        const groupName = res.map((groupName) => groupName);
        setGroups(groupName);

        // Extract group ids
        const groupIds = res.map((group) => group.id);

        // Set the groupId state with the extracted ids
        setGroupId(groupIds);
      } else {
        console.log("Error fetching group details");
      }
    };

    getGroupId();
  }, [token]);

  const [msg, setMsg] = useState([]);

  useEffect(() => {
    if (groupId) {
      async function fetchGroupMessages() {
        try {
          console.log("getch group msgID:- " + groupId);

          const response = await axios.get(
            `http://localhost:8000/group_chats/${groupId}/messages`
          );
          setMsg(response.data);
          console.log("Fetched Group messages:", response.data);
        } catch (error) {
          console.error("Error fetching messages:", error);
        }
      }
      fetchGroupMessages();
    }
  }, [groupId, token]);

  const [newMsg, setNewMsg] = useState("");

  const [websocket, setWebSocket] = useState(null); // WebSocket connection

  // Establish WebSocket connection
  const connectWebSocket = (selectedGroupId) => {
    if (websocket) {
      websocket.close(); // Close any existing WebSocket connection
    }

    // Open new WebSocket connection
    const socket = new WebSocket(
      `ws://localhost:8000/ws/${selectedGroupId}?token=${token}`
    );

    // Handle WebSocket connection open
    socket.onopen = () => {
      console.log(`Connected to WebSocket for group ${selectedGroupId}`);
    };

    // Handle message received from WebSocket
    socket.onmessage = (event) => {
      const newMessage = JSON.parse(event.data);
      setMsg((prevMessages) => [...prevMessages, newMessage]);

      // Auto-scroll chat body to the latest message
      if (chatBodyRef.current) {
        chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
      }
    };

    // Handle WebSocket close
    socket.onclose = () => {
      console.log(`WebSocket connection closed for group ${selectedGroupId}`);
    };

    // Handle WebSocket errors
    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    setWebSocket(socket);
  };

  // WebSocket cleanup when component unmounts or chat changes
  useEffect(() => {
    return () => {
      if (websocket) {
        websocket.close();
      }
    };
  }, [websocket]);

  // Send message via WebSocket
  const sendMessageToGroup = () => {
    if (newMsg.trim() && websocket && websocket.readyState === WebSocket.OPEN) {
      websocket.send(
        JSON.stringify({
          content: newMsg,
        })
      );
      setNewMsg(""); // Clear the input only after sending the message
    } else {
      console.error("WebSocket is not open or message is empty");
    }
  };

  // Send message logic
  const sendMessage = async () => {
    if (
      newMessage.trim() &&
      wsRef.current &&
      wsRef.current.readyState === WebSocket.OPEN
    ) {
      try {
        await axios.post("http://localhost:8000/send_message/", {
          chat_id: activeChat.chat_id,
          sender_id: userId,
          content: newMessage,
        });

        // Send message over WebSocket
        wsRef.current.send(JSON.stringify({ content: newMessage }));
        setNewMessage(""); // Clear the input
      } catch (error) {
        console.error("Error sending message:", error);
      }
    } else {
      console.error(
        "WebSocket is not open. Current state:",
        wsRef.current.readyState
      );
    }
  };

  useEffect(() => {
    const fetchData = async () => {
    
      if (token) {
        await fetchUserDetails();
      }
      if (userId) {
        await Promise.all([
          handleGetRecommendations(),
          handleAutoGenerateConnections(),
          handleGetApprovalRequests(),
          handleGroupApprovalRequests(),
          getMyNetworks(),
          getOtherNetworks(),
        ]);
      }
      
    };

    fetchData();

    // Set up an interval to fetch data periodically
    const intervalId = setInterval(fetchData, 600000); // Fetch every 60 seconds

    // Clean up the interval on component unmount
    return () => clearInterval(intervalId);
  }, [token, userId]);

  const handleAutoGenerateConnections = async () => {
    try {
      await axios.post(
        `http://localhost:8000/auto_generate_connections?user_id=${userId}`
      );
      handleGetApprovalRequests();
    } catch (error) {
      alert("Failed to auto-generate connections: " + error.message);
    }
  };

  const fetchUserDetails = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/users/me/", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const userDat = await response.json();
      if (response.ok) {
        console.log("User details:", userDat);
        setUserData(userData);
        setUser([userDat]);
        localStorage.setItem("userId", userDat.id);
        setUserId(userDat.id);
      } else {
        console.error(userData.detail || "Failed to fetch user details");
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  const handleGetRecommendations = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:8000/recommendations/?user_id=${userId}`
      );
      setRecommendations(response.data);
    } catch (error) {
      console.error("Failed to get recommendations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendConnectionRequest = async (recId) => {
    setLoading(true);
    try {
      await axios.post(
        `http://localhost:8000/send_connection_request/?user_id=${userId}&target_user_id=${recId}`
      );
      alert("Connection request sent successfully");
      await handleGetRecommendations();
    } catch (error) {
      alert("Failed to send connection request: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendConnectionRequestToOtherNetwork = async (othId) => {
    setLoading(true);
    try {
      await axios.post(
        `http://localhost:8000/send_connection_request_to_other/?user_id=${userId}&target_user_id=${othId}`
      );
      alert("Connection request sent successfully");
      await handleGetRecommendations();
    } catch (error) {
      alert("Failed to send connection request: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGetApprovalRequests = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:8000/approval_requests/?user_id=${userId}`
      );
      setApprovalRequests(response.data);
    } catch (error) {
      console.error("Failed to get approval requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGroupApprovalRequests = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:8000/approval_requests_for_group/?user_id=${userId}`
      );
      setGroupRequests(response.data);
    } catch (error) {
      console.error("Failed to get approval requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const getMyNetworks = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:8000/network/${userId}`
      );
      setNetworks(response.data);
    } catch (error) {
      console.error("Failed to get networks:", error);
    } finally {
      setLoading(false);
    }
  };

  const getOtherNetworks = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:8000/network_of_networks/${userId}`
      );
      setOtherNetworks(response.data[0].second_degree_users);
    } catch (error) {
      console.error("Failed to get networks:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprovalAction = async (requestId, approved) => {
    setLoading(true);
    try {
      await axios.post(
        `http://localhost:8000/handle_approval/${requestId}?approved=${approved}`,
        {}, // Empty body since you're not sending data in the body
        {
          // Headers should be passed as the third argument
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      await Promise.all([
        handleGetApprovalRequests(),
        handleGroupApprovalRequests(),
        handleGetRecommendations(),
        getMyNetworks(),
        getOtherNetworks(),
      ]);
      alert(`Request ${approved ? "approved" : "denied"} successfully`);
    } catch (error) {
      alert("Failed to handle approval: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGroupApprovalAction = async (requestId, approved) => {
    setLoading(true);
    try {
      await axios.post(
        `http://localhost:8000/handle_approval_other_network/${requestId}?approved=${approved}`,
        {}, // Empty body since you're not sending data in the body
        {
          // Headers should be passed as the third argument
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      await Promise.all([
        handleGetApprovalRequests(),
        handleGroupApprovalRequests(),
        handleGetRecommendations(),
        getMyNetworks(),
        getOtherNetworks(),
      ]);

      alert(`Request ${approved ? "approved" : "denied"} successfully`);
    } catch (error) {
      alert("Failed to handle approval: " + error.message);
    } finally {
      setLoading(false);
    }
  };



  const CheckIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20px"
      height="20px"
      fill="currentColor"
      viewBox="0 0 256 256"
    >
      <path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z" />
    </svg>
  );

  const handlePayment = (plan) => {
    const options = {
      key: "rzp_test_GkajTwSfONYREd", // Your Razorpay key here
      amount: plan === "Starter" ? 75000 : plan === "Pro" ? 290000 : 490000, // Amount in paise
      currency: "INR",
      name: "Ultimate Connector Application",
      description: `Subscription for ${plan} plan`,
      handler: async (response) => {
        try {
          // Call your backend to store the user ID and subscription plan
          console.log("PaymentID:- " + response.razorpay_payment_id);
          const success = await storeSubscription(
            response.razorpay_payment_id,
            userId,
            plan
          );
          setIsPaymentSuccessful(true);
          setTimeout(() => setIsPaymentSuccessful(false), 12000);

          if (success) {
            alert("Subscription successful!");
            // Optionally, you can navigate or refresh the page
          } else {
            alert("Failed to store subscription!");
          }
        } catch (error) {
          console.error("Error handling payment:", error);
          alert(
            "An error occurred while processing your payment. Please try again."
          );
        }
      },
      prefill: {
        name: "User Name", // Replace with actual user name
        email: "user@example.com", // Replace with actual user email
      },
      theme: {
        color: "#F37254",
      },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  };

  const storeSubscription = async (paymentId, userId, plan) => {
    try {
      console.log(paymentId);
      const response = await fetch(
        "http://localhost:8000/api/store_subscription",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: userId, // Matches your backend model
            payment_id: paymentId,
            plan_type: plan, // Matches your backend model
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json(); // Capture error details
        throw new Error(`Network response was not ok: ${errorData.detail}`);
      }

      const result = await response.json();
      return result.message; // Assuming your API returns a message
    } catch (error) {
      console.error("Error storing subscription:", error);
      return false; // Return false if there's an error
    }
  };

  const handleDocumentChange = (e) => {
    setDocumentFile(e.target.files[0]);
  };

  const handleUpdate = async () => {
    if (!documentFile) {
      alert("Please select a document to upload");
      return;
    }

    setLoading(true);
    try {
      await axios.post("http://localhost:8000/update_user/", {
        user_id: userId,
        education: userData.education,
        experience: userData.experience,
        goal: userData.goal,
        twitter_handle: userData.twitter_handle,
        bio: userData.bio,
        about: userData.about,
        github: userData.github,
        linkedin: userData.linkedin,
        banner_image: userData.banner_image,
        profile_image: userData.profile_image


      });

      const formData = new FormData();
      formData.append("file", documentFile);
      formData.append("user_id", userId);

      const response = await axios.post(
        "http://localhost:8000/upload_document/",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      alert(`Document uploaded successfully: ${response.data.file_path}`);

      const trainingFormData = new FormData();
      trainingFormData.append("user_id", userId);
      trainingFormData.append("github", userData.github);
      trainingFormData.append("file", documentFile);

      await axios.post(
        "http://localhost:8000/auto_train_agent/",
        trainingFormData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      alert("AI Agent retrained successfully");
    } catch (error) {
      alert("Update or AI retrain failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRightClick = (event, message) => {
    event.preventDefault(); // Prevent the default browser right-click menu
    setRightClickedMessage(message); // Set the message on which the user right-clicked
    setContextMenu({
      isVisible: true,
      x: event.pageX,
      y: event.pageY,
    });
  };

  const closeContextMenu = () => {
    setContextMenu({ isVisible: false, x: 0, y: 0 });
  };

  // Function to handle "Ask AI"
  const handleAskAI = async () => {
    if (rightClickedMessage) {
      setIsLoadingAIResponse(true); // Set loading state

      // Call OpenAI API (replace 'your-openai-api-key' with your actual key)
      const response = await fetch("http://localhost:8000/api/askAI", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: rightClickedMessage.content,
          chat_partner_name: activeChat.user_2_name,
        }),
      });

      const data = await response.json();
      setNewMessage(data.response); // Set the AI response in the input box
      setIsLoadingAIResponse(false);
      closeContextMenu();
    }
  };

  const pricingPlans = [
    {
      title: "Starter",
      price: "$9/month",
      features: [
        "5 projects",
        "10 GB storage",
        "Basic analytics",
        "24/7 support",
      ],
      color: "from-emerald-400 to-teal-500",
    },
    {
      title: "Pro",
      price: "$29/month",
      features: [
        "Unlimited projects",
        "50 GB storage",
        "Advanced analytics",
        "Priority support",
        "Custom domain",
      ],
      color: "from-violet-500 to-purple-600",
      popular: true,
    },
    {
      title: "Ultimate",
      price: "$49/month",
      features: [
        "Unlimited everything",
        "Advanced security",
        "Dedicated account manager",
        "Custom integrations",
        "24/7 Premium support",
      ],
      color: "from-rose-400 to-red-500",
    },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      <motion.aside
        className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white shadow-xl"
        variants={sidebarVariants}
        initial="open"
        animate={isOpen ? "open" : "closed"}
      >
        <div className="p-4 items-center">
          <motion.button
            className="w-full text-left mb-8 flex items-center"
            onClick={() => setIsOpen(!isOpen)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaHome className="inline-block mr-2" size={24} />
            <motion.span
              variants={linkVariants}
              className="text-lg font-semibold "
            >
              Dashboard
            </motion.span>
          </motion.button>
          <nav className="space-y-4">
            {[
              { icon: FaNetworkWired, text: "Connections", active: true },
              { icon: FaUserFriends, text: "My Networks" },
              { icon: FaGlobe, text: "Other Networks" },
              { icon: FaThumbsUp, text: "Recommendations", highlight: "green" },
              { icon: FaCog, text: "Settings" },
              { icon: FaUsers, text: "Group Requests" },
              { icon: FaCommentAlt, text: "Chat" },
              { icon: FaUsers, text: "Groups" },
              {
                icon: FaCrown,
                text: "Upgrade to Premium",
                highlight: "purple",
              },
            ].map((item, index) => (
              <motion.a
                key={index}
                href="#"
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  item.active
                    ? "bg-blue-500"
                    : item.highlight
                    ? `bg-${item.highlight}-500 bg-opacity-20`
                    : "hover:bg-blue-500"
                }`}
                whileHover={{ scale: 1.05, x: 5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleTabClick(item.text.toLowerCase())}
              >
                <item.icon className="mr-3" size={20} />
                <motion.span variants={linkVariants}>{item.text}</motion.span>
              </motion.a>
            ))}
          </nav>
        </div>
        <div className="p-4">
          <motion.button
            className="w-full px-4 py-2 text-sm font-medium text-blue-600 bg-white rounded-lg hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.span variants={linkVariants}>New AI Agent</motion.span>
          </motion.button>
        </div>
      </motion.aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm ">
          <div
            className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8"
            style={{ marginLeft: "145px" }}
          >
            <div className="flex items-center justify-between">
              {/* Left-aligned "Network.ai" */}
              <div className="flex items-center gap-4">
                <div className="size-4">
                  <svg
                    className="bouncing-svg"
                    viewBox="0 0 48 48"
                    width={26}
                    height={26}
                    style={{ marginTop: "-4px" }}
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <defs>
                      <linearGradient
                        id="gradientColors"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="100%"
                      >
                        <stop offset="0%" style={{ stopColor: "#00b5ff" }} />
                        <stop offset="100%" style={{ stopColor: "#ab4bf2" }} />
                      </linearGradient>
                    </defs>
                    <path
                      d="M24 4C25.7818 14.2173 33.7827 22.2182 44 24C33.7827 25.7818 25.7818 33.7827 24 44C22.2182 33.7827 14.2173 25.7818 4 24C14.2173 22.2182 22.2182 14.2173 24 4Z"
                      fill="url(#gradientColors)"
                    />
                  </svg>
                </div>
                <div className="flex items-center text-indigo-800">
                  <h2 className="animate-colorPulse text-2xl bg-gradient-to-r from-purple-500 to-indigo-600 font-semibold">
                    Network.ai
                  </h2>
                </div>
              </div>

              {/* Right-aligned buttons */}
              <div className="flex items-center space-x-4">
                <motion.button
                  className="text-gray-400 hover:text-gray-500 transition-colors duration-200 relative"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <FaBell className="h-6 w-6" />
                  {notifications.length > 0 && (
                    <motion.span
                      className="absolute top-0 right-0 -mt-1 -mr-1 px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full"
                      animate={pulseAnimation}
                    >
                      {notifications.length}
                    </motion.span>
                  )}
                </motion.button>
                <motion.button
                  className="text-gray-400 hover:text-gray-500 transition-colors duration-200"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <FaComments className="h-6 w-6" />
                </motion.button>
                <motion.img
                  className="h-10 w-10 rounded-full border-2 border-blue-500 cursor-pointer"
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                  alt="User profile"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                />
              </div>
            </div>
          </div>
        </header>

        {activeTab === "recommendations" && (
          <main className="flex-1 overflow-y-auto bg-gray-50 p-8">
          <div className="max-w-7xl mx-auto">
            <motion.h2
              className="text-3xl font-bold mb-6 relative inline-block"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
                Suggested Connections
              </span>
              <motion.span
                className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-400 to-purple-600"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              />
            </motion.h2>
            <motion.nav
              className="flex space-x-4 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {["All", "Tech", "Health", "Climate"].map((category, index) => (
                <motion.button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-4 py-2 text-sm font-medium rounded-full transition-colors duration-200 ${activeCategory === category ? "text-white bg-gradient-to-r from-blue-500 to-purple-500 shadow-md" : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"}`}
                  whileHover={{ scale: 1.05, boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)" }}
                  whileTap={{ scale: 0.95 }}
                >
                  {category}
                </motion.button>
              ))}
            </motion.nav>
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              variants={fadeInUp}
              initial="initial"
              animate="animate"
            >
              <AnimatePresence>
                {recommendations && recommendations.map((recomm) => (
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
                      <img
                        className="w-full h-full object-cover"
                        src={recomm.banner_image}
                        
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>
                    </div>
                    <div className="p-4 relative">
                      <motion.div
                        className="absolute -top-10 left-4 bg-white rounded-full p-1 shadow-md"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.1, type: "spring", stiffness: 500, damping: 30 }}
                      >
                        <img
                          className="w-16 h-16 rounded-full object-cover border-2 border-white"
                          src={recomm.profile_image}
                          
                        />
                      </motion.div>
                      <h3 className="text-lg font-bold mb-2 mt-10">{recomm.name}</h3>
                      <p className="text-blue-600 text-sm font-medium mb-2">{recomm.bio}</p>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{recomm.about}</p>
                      <div className="flex justify-between items-center">
                        <div className="flex space-x-2">
                          <motion.a href={recomm.linkedin} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                            <FaLinkedin className="text-blue-600 hover:text-blue-700" size={18} />
                          </motion.a>
                          <motion.a href={'https://github.com/'+recomm.github} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                            <FaGithub className="text-gray-700 hover:text-gray-800" size={18} />
                          </motion.a>
                          <motion.a href={'https://x.com/'+recomm.twitter_handle} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
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
                        onClick={() =>
                          handleSendConnectionRequest(recomm.id)
                        }
                      >
                        <FaUserFriends className="mr-2" size={14} />
                        Connect
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </div>
        </main>
        )}

        {activeTab === "my networks" && (
          <main className="flex-1 overflow-y-auto bg-gray-50 p-4">
            <div className="max-w-7xl mx-auto">
              <motion.h2
                className="text-3xl font-bold text-gray-900 mb-6"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                My Networks
              </motion.h2>
              <motion.nav
                className="flex space-x-4 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                {["All", "Tech", "Health", "Climate"].map((category) => (
                  <motion.button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                      activeCategory === category
                        ? "text-white bg-blue-600"
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {category}
                  </motion.button>
                ))}
              </motion.nav>
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                variants={fadeInUp}
                initial="initial"
                animate="animate"
              >
                <AnimatePresence>
                  {networks &&
                    networks.map((netw) => (
                      <motion.div
                        key={netw.id}
                        className="bg-white shadow-lg rounded-lg overflow-hidden"
                        whileHover={{
                          y: -5,
                          boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
                        }}
                        transition={{ duration: 0.3 }}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <img
                          className="w-full h-48 object-cover"
                          src={`https://cdn.usegalileo.ai/stability/cde723c1-99a4-4c51-b7ae-fd2f071d6cfa.png`}
                        />
                        <div className="p-6">
                          <h3 className="text-xl font-semibold mb-2">
                            {netw.name}
                          </h3>
                          <p className="text-gray-600 mb-4">{netw.email}</p>
                        </div>
                      </motion.div>
                    ))}
                </AnimatePresence>
              </motion.div>
            </div>
          </main>
        )}

        {activeTab === "other networks" && (
          <main className="flex-1 overflow-y-auto bg-gray-50 p-4">
            <div className="max-w-7xl mx-auto">
              <motion.h2
                className="text-3xl font-bold text-gray-900 mb-6"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                Other Networks
              </motion.h2>
              <motion.nav
                className="flex space-x-4 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                {["All", "Tech", "Health", "Climate"].map((category) => (
                  <motion.button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                      activeCategory === category
                        ? "text-white bg-blue-600"
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {category}
                  </motion.button>
                ))}
              </motion.nav>
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                variants={fadeInUp}
                initial="initial"
                animate="animate"
              >
                <AnimatePresence>
                  {otherNetworks &&
                    otherNetworks.map((othnetw) => (
                      <motion.div
                        key={othnetw.id}
                        className="bg-white shadow-lg rounded-lg overflow-hidden"
                        whileHover={{
                          y: -5,
                          boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
                        }}
                        transition={{ duration: 0.3 }}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <img
                          className="w-full h-48 object-cover"
                          src={`https://cdn.usegalileo.ai/stability/cde723c1-99a4-4c51-b7ae-fd2f071d6cfa.png`}
                        />
                        <div className="p-6">
                          <h3 className="text-xl font-semibold mb-2">
                            {othnetw.name}
                          </h3>
                          <p className="text-gray-600 mb-4">{othnetw.email}</p>
                          <motion.button
                            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors duration-200"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() =>
                              handleSendConnectionRequestToOtherNetwork(
                                othnetw.id
                              )
                            }
                          >
                            Connect
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                </AnimatePresence>
              </motion.div>
            </div>
          </main>
        )}

        {activeTab === "connections" && (
          <main className="flex-1 overflow-y-auto bg-gray-50 p-4">
            <div className="max-w-7xl mx-auto">
              <motion.h2
                className="text-3xl font-bold text-gray-900 mb-6"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                Connection Requests
              </motion.h2>
              <motion.nav
                className="flex space-x-4 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                {["All", "Tech", "Health", "Climate"].map((category) => (
                  <motion.button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                      activeCategory === category
                        ? "text-white bg-blue-600"
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {category}
                  </motion.button>
                ))}
              </motion.nav>
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                variants={fadeInUp}
                initial="initial"
                animate="animate"
              >
                <AnimatePresence>
                  {approvalRequests &&
                    approvalRequests.map((approv) => (
                      <motion.div
                        key={approv.id}
                        className="bg-white shadow-lg rounded-lg overflow-hidden"
                        whileHover={{
                          y: -5,
                          boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
                        }}
                        transition={{ duration: 0.3 }}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <img
                          className="w-full h-48 object-cover"
                          src={`https://cdn.usegalileo.ai/stability/cde723c1-99a4-4c51-b7ae-fd2f071d6cfa.png`}
                        />
                        <div className="p-6">
                          <h3 className="text-xl font-semibold mb-2">
                            {approv.sender_name}
                          </h3>
                          <motion.button
                            className="bg-green-500 text-white px-4 py-2 justify-between rounded-md hover:bg-green-600 transition-colors duration-200"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() =>
                              handleApprovalAction(approv.id, true)
                            }
                          >
                            Approve
                          </motion.button>
                          <motion.button
                            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors duration-200"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() =>
                              handleApprovalAction(approv.id, false)
                            }
                          >
                            Deny
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                </AnimatePresence>
              </motion.div>
            </div>
          </main>
        )}

        {activeTab === "group requests" && (
          <main className="flex-1 overflow-y-auto bg-gray-50 p-4">
            <div className="max-w-7xl mx-auto">
              <motion.h2
                className="text-3xl font-bold text-gray-900 mb-6"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                Group Requests
              </motion.h2>
              <motion.nav
                className="flex space-x-4 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                {["All", "Tech", "Health", "Climate"].map((category) => (
                  <motion.button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                      activeCategory === category
                        ? "text-white bg-blue-600"
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {category}
                  </motion.button>
                ))}
              </motion.nav>
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                variants={fadeInUp}
                initial="initial"
                animate="animate"
              >
                <AnimatePresence>
                  {groupRequests &&
                    groupRequests.map((approv) => (
                      <motion.div
                        key={approv.id}
                        className="bg-white shadow-lg rounded-lg overflow-hidden"
                        whileHover={{
                          y: -5,
                          boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
                        }}
                        transition={{ duration: 0.3 }}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <img
                          className="w-full h-48 object-cover"
                          src={`https://cdn.usegalileo.ai/stability/cde723c1-99a4-4c51-b7ae-fd2f071d6cfa.png`}
                        />
                        <div className="p-6">
                          <h3 className="text-xl font-semibold mb-2">
                            {approv.sender_name}
                          </h3>
                          <motion.button
                            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors duration-200"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() =>
                              handleGroupApprovalAction(approv.id, true)
                            }
                          >
                            Yes
                          </motion.button>
                          <motion.button
                            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors duration-200"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() =>
                              handleGroupApprovalAction(approv.id, false)
                            }
                          >
                            No
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                </AnimatePresence>
              </motion.div>
            </div>
          </main>
        )}

        {activeTab === "upgrade to premium" && (
          <main className="flex-1 overflow-y-auto bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
            {isPaymentSuccessful && <Confetti width={width} height={height} />}
            <div className="max-w-4xl mx-auto">
              {" "}
              {/* Reduced max-width from 5xl to 4xl */}
              <motion.h2
                className="text-4xl font-extrabold text-gray-900 mb-10 text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                Choose Your Perfect Plan
              </motion.h2>
              <motion.div
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
                variants={fadeInUp}
                initial="initial"
                animate="animate"
              >
                {pricingPlans.map((plan, index) => (
                  <motion.div
                    key={index}
                    className={`bg-white rounded-2xl overflow-hidden shadow-xl transform transition-all duration-300 hover:scale-105 ${
                      plan.popular
                        ? "ring-4 ring-purple-500 ring-opacity-50"
                        : ""
                    }`}
                    whileHover={{ y: -10 }}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div
                      className={`bg-gradient-to-br ${plan.color} p-6 text-white`}
                    >
                      <h3 className="text-2xl font-bold mb-2">{plan.title}</h3>
                      <p className="text-3xl font-extrabold mb-3">
                        {plan.price}
                      </p>
                      {plan.popular && (
                        <span className="bg-yellow-400 text-gray-900 py-1 px-2 rounded-full text-xs font-semibold">
                          Most Popular
                        </span>
                      )}
                    </div>
                    <div className="p-6">
                      <ul className="mb-6 space-y-3">
                        {plan.features.map((feature, featureIndex) => (
                          <motion.li
                            key={featureIndex}
                            className="flex items-center text-gray-700 text-sm"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 * featureIndex }}
                          >
                            <svg
                              className="h-4 w-4 text-green-500 mr-2"
                              fill="none"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path d="M5 13l4 4L19 7"></path>
                            </svg>
                            {feature}
                          </motion.li>
                        ))}
                      </ul>
                      <motion.button
                        className={`w-full py-2 px-4 rounded-lg font-semibold text-sm transition-colors duration-200 ${
                          plan.popular
                            ? "bg-purple-600 text-white hover:bg-purple-700"
                            : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handlePayment(plan.title)}
                      >
                        Get Started
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
              <motion.p
                className="text-center text-gray-600 mt-10 text-base max-w-2xl mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                All plans include a 30-day money-back guarantee. Try risk-free
                and upgrade, downgrade, or cancel anytime. No questions asked.
              </motion.p>
              <motion.div
                className="mt-12 bg-white rounded-2xl shadow-xl p-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
                  Frequently Asked Questions
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    {
                      q: "How does the 30-day trial work?",
                      a: "You can use all features for 30 days. After that, you'll be asked to choose a plan. No credit card required.",
                    },
                    {
                      q: "Can I change plans later?",
                      a: "Yes, you can upgrade, downgrade, or cancel your plan at any time from your account settings.",
                    },
                    {
                      q: "What payment methods do you accept?",
                      a: "We accept all major credit cards, PayPal, and bank transfers for annual plans.",
                    },
                    {
                      q: "Is there a setup fee?",
                      a: "No, there are no setup fees or hidden charges. The price you see is what you pay.",
                    },
                  ].map((faq, index) => (
                    <motion.div
                      key={index}
                      className="space-y-2"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <h4 className="text-base font-semibold text-gray-900">
                        {faq.q}
                      </h4>
                      <p className="text-gray-600 text-sm">{faq.a}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </main>
        )}

        {activeTab === "settings" && (
          <main className="flex-1 overflow-y-auto bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
            <div className="max-w-4xl mx-auto">
              <motion.h2
                className="text-3xl font-bold text-gray-900 mb-6 text-center"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                User Settings
              </motion.h2>
              <motion.div
                className="bg-white rounded-2xl shadow-xl p-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
                  <div className="md:w-1/3 flex flex-col items-center">
                    <div className="relative mb-4">
                      <img
                        src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80"
                        alt="Profile"
                        className="w-32 h-32 rounded-full border-4 border-blue-500 shadow-lg"
                      />
                      <button className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors duration-200">
                        <FaEdit size={16} />
                      </button>
                    </div>
                    {user &&
                      user.map((u, id) => (
                        <>
                          <h3 className="text-2xl font-semibold text-center mb-2">
                            {u.name}
                          </h3>
                          <p className="text-sm text-gray-600 text-center mb-4">
                            {u.bio}
                          </p>
                        </>
                      ))}
                    <div className="flex space-x-3">
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors duration-200 text-sm font-medium">
                        Follow
                      </button>
                      <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-colors duration-200 text-sm font-medium">
                        Message
                      </button>
                    </div>
                  </div>
                  <div className="md:w-2/3 space-y-4">
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                        <FaEdit className="mr-2 text-blue-500" size={16} />
                        Bio
                      </label>
                      <input
                        type="text"
                        placeholder="Add a bio"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 text-sm"
                        value={userData.bio}
                        onChange={(e) => handleInputChange(e, "bio")}
                      />
                       <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                        <FaAddressBook className="mr-2 text-blue-500" size={16} />
                        About
                      </label>
                      <input
                        type="text"
                        placeholder="Add a about"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 text-sm"
                        value={userData.about}
                        onChange={(e) => handleInputChange(e, "about")}
                      />
                      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                        <FaBriefcase className="mr-2 text-blue-500" size={16} />
                        Experience
                      </label>
                      <input
                        type="text"
                        placeholder="Add a experience"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 text-sm"
                        value={userData.experience}
                        onChange={(e) => handleInputChange(e, "experience")}
                      />
                      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                        <FaGraduationCap
                          className="mr-2 text-blue-500"
                          size={16}
                        />
                        Education
                      </label>
                      <input
                        type="text"
                        placeholder="Add a education"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 text-sm"
                        value={userData.education}
                        onChange={(e) => handleInputChange(e, "education")}
                      />
                      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                        <FaGlobe className="mr-2 text-blue-500" size={16} />
                        Twitter
                      </label>
                      <input
                        type="text"
                        placeholder="Add a twitter"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 text-sm"
                        value={userData.twitter_handle}
                        onChange={(e) => handleInputChange(e, "twitter_handle")}
                      />
                      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                        <FaBullseye className="mr-2 text-blue-500" size={16} />
                        Goal
                      </label>
                      <input
                        type="text"
                        placeholder="Add a goal"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 text-sm"
                        value={userData.goal}
                        onChange={(e) => handleInputChange(e, "goal")}
                      />

<label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                        <FaLinkedin className="mr-2 text-blue-500" size={16} />
                        Linkedin
                      </label>
                      <input
                        type="text"
                        placeholder="Add a linkedin"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 text-sm"
                        value={userData.linkedin}
                        onChange={(e) => handleInputChange(e, "linkedin")}
                      />



<label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                        <FaGithub className="mr-2 text-blue-500" size={16} />
                        Github
                      </label>
                      <input
                        type="text"
                        placeholder="Add a github"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 text-sm"
                        value={userData.github}
                        onChange={(e) => handleInputChange(e, "github")}
                      />


                    </div>

                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                        <FaUpload className="mr-2 text-blue-500" size={16} />
                        Document
                      </label>
                      <div className="flex items-center">
                        <label className="flex-1 flex items-center px-4 py-2 bg-white text-blue-600 rounded-lg border border-blue-600 cursor-pointer hover:bg-blue-50 transition-colors duration-200 text-sm">
                          <FaUpload className="mr-2" size={16} />
                          <span>Choose file</span>
                          <input
                            type="file"
                            className="hidden"
                            onChange={handleDocumentChange}
                          />
                        </label>
                        <span className="ml-3 text-sm text-gray-500"></span>
                      </div>
                    </div>
                    <motion.button
                      className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium shadow-md"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleUpdate}
                    >
                      Save Changes
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </div>
          </main>
        )}

        {activeTab === "chat" && (
          <main className="flex-1 overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
            <div className="max-w-6xl mx-auto h-full flex space-x-6">
              {/* Middle Panel - Contact List */}
              <motion.div
                className="w-1/3 bg-white rounded-xl overflow-hidden shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="p-4 bg-gradient-to-r from-blue-500 to-indigo-600 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-white">Chats</h2>
                  <div className="mt-3 relative">
                    <input
                      type="text"
                      placeholder="Search contacts..."
                      className="w-full px-3 py-2 bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-60 border border-white border-opacity-30 rounded-lg focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-colors duration-200 text-sm"
                    />
                    <FaSearch
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white opacity-60"
                      size={14}
                    />
                  </div>
                </div>
                <div
                  className="overflow-y-auto"
                  style={{ maxHeight: "calc(100vh - 220px)" }}
                >
                  <AnimatePresence>
                    {chats.map((chat) => (
                      <motion.div
                        key={chat.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className={`p-3 border-b border-gray-100 cursor-pointer transition-colors duration-200 ${
                          activeChat && activeChat.chat_id === chat.chat_id
                            ? "active"
                            : ""
                        }`}
                        onClick={() => setActiveChat(chat)}
                        whileHover={{ scale: 1.02, x: 5 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            {/* <img src={contact.avatar} alt={contact.name} className="w-10 h-10 rounded-full border-2 border-blue-500" /> */}
                            <img
                              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                              className="w-10 h-10 rounded-full border-2 border-blue-500"
                            />
                            {/* <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ${contact.status === 'Online' ? 'bg-green-500' : 'bg-gray-300'} border-2 border-white`}></span> */}
                          </div>
                          <div>
                            <h3 className="text-base font-semibold text-gray-800">
                              {chat.user_2_name}
                            </h3>
                            <p className="chat-message">No recent message</p>
                            {/* <p className={`text-xs ${contact.status === 'Online' ? 'text-green-500' : 'text-gray-500'}`}>{contact.status}</p> */}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>

              {/* Right Panel - Chat Window */}

              <motion.div
                className="flex-1 bg-white rounded-xl overflow-hidden shadow-lg flex flex-col"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                {activeChat && activeChat ? (
                  <>
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4 border-b border-gray-200 flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <img
                          src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                          className="w-10 h-10 rounded-full border-2 border-white"
                        />
                        <div>
                          <h2 className="text-lg font-bold text-white">
                            {activeChat.user_2_name}
                          </h2>
                          <p className="text-xs text-blue-100">
                            Connected since{" "}
                            {new Date(
                              activeChat.created_at
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <button className="text-white hover:text-blue-200 transition-colors duration-200">
                        <FaEllipsisV size={16} />
                      </button>
                    </div>
  {/* Modal for confirmation */}
  <Modal isOpen={isModalOpen} onRequestClose={closeModal} className="modal-content" overlayClassName="modal-overlay">
            <h2>Start a Video Call?</h2>
            <button onClick={initiateVideoCall}>Yes, Start Call</button>
            <button onClick={closeModal}>Cancel</button>
          </Modal>

          {/* Video Call UI */}
          {isInCall && (
            <div className="video-call-container">
              <video ref={localVideoRef} autoPlay muted className="local-video" />
              <video ref={remoteVideoRef} autoPlay className="remote-video" />
            </div>
          )}


                    <div
                      className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50"
                      style={{ maxHeight: "calc(100vh - 250px)" }}
                      ref={chatBodyRef}
                    >
                      <AnimatePresence>
                        {messages.map((message) => (
                          <motion.div
                            key={message.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className={`flex ${
                              message.sender === "You"
                                ? "justify-end"
                                : "justify-start"
                            }`}  
                          >
                            <div
                              className={`max-w-xs lg:max-w-md ${
                                message.sender === "You"
                                  ? "bg-blue-500 text-white"
                                  : "bg-white text-gray-800"
                              } rounded-2xl p-3 shadow-md`} onContextMenu={(e) => handleRightClick(e, message)}
                            >
                              <p className="break-words text-sm">
                                {message.content}
                              </p>
                              {/* <span className="text-xs opacity-75 mt-1 block">{new Date(message.timestamp).toLocaleTimeString()}</span> */}
                            </div>

                            {contextMenu.isVisible && (
                              <div
                                className="context-menu"
                                style={{
                                  top: `${contextMenu.y}px`,
                                  left: `${contextMenu.x}px`,
                                }}
                              >
                                <ul>
                                  <li onClick={handleAskAI}>Ask AI</li>
                                </ul>
                              </div>
                            )}
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>

                    <div className="p-4 bg-white border-t border-gray-200">
                      <div className="flex items-center space-x-3">
                        <input
                          type="text"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Type a message..."
                          className="flex-1 px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 text-sm"
                          onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                          disabled={isLoadingAIResponse}
                        />
                        <motion.button
                          onClick={sendMessage}
                          className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors duration-200 flex items-center justify-center"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <FaPaperPlane className="w-5 h-5" />
                        </motion.button>
                      </div>
                      <div className="flex justify-between mt-3">
                        <div className="flex space-x-3">
                          <button className="text-gray-500 hover:text-blue-500 transition-colors duration-200">
                            <FaSmile className="w-5 h-5" />
                          </button>
                          <button className="text-gray-500 hover:text-blue-500 transition-colors duration-200">
                            <FaPaperclip className="w-5 h-5" />
                          </button>
                          <motion.button
                          className="text-gray-500 hover:text-blue-500 transition-colors duration-200"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <FaVideo className="w-5 h-5" onClick={openModal}/>
                        </motion.button>
                        </div>
                        <button className="text-blue-500 hover:text-blue-600 transition-colors duration-200 text-sm font-medium">
                          Send Voice Message
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500 text-lg font-light">
                      Select a contact to start chatting
                    </p>
                  </div>
                )}
              </motion.div>
            </div>
          </main>
        )}

        {activeTab === "groups" && (
          <main className="flex-1 overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
            <div className="max-w-6xl mx-auto h-full flex space-x-6">
              {/* Middle Panel - Contact List */}
              <motion.div
                className="w-1/3 bg-white rounded-xl overflow-hidden shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="p-4 bg-gradient-to-r from-blue-500 to-indigo-600 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-white">Groups</h2>
                  <div className="mt-3 relative">
                    <input
                      type="text"
                      placeholder="Search contacts..."
                      className="w-full px-3 py-2 bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-60 border border-white border-opacity-30 rounded-lg focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-colors duration-200 text-sm"
                    />
                    <FaSearch
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white opacity-60"
                      size={14}
                    />
                  </div>
                </div>
                <div
                  className="overflow-y-auto"
                  style={{ maxHeight: "calc(100vh - 220px)" }}
                >
                  <AnimatePresence>
                    {groups.map((group) => (
                      <motion.div
                        key={group.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className={`p-3 border-b border-gray-100 cursor-pointer transition-colors duration-200 ${
                            groupId === group.id ? "active" : "" // Fix condition to match selected group by ID
                          }`}
                          onClick={() => {
                            setGroupId(group.id); // Set the selected groupId
                            connectWebSocket(group.id); // Establish WebSocket connection for this group
                          }}
                        whileHover={{ scale: 1.02, x: 5 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            {/* <img src={contact.avatar} alt={contact.name} className="w-10 h-10 rounded-full border-2 border-blue-500" /> */}
                            <img
                              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                              className="w-10 h-10 rounded-full border-2 border-blue-500"
                            />
                            {/* <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ${contact.status === 'Online' ? 'bg-green-500' : 'bg-gray-300'} border-2 border-white`}></span> */}
                          </div>
                          <div>
                            <h3 className="text-base font-semibold text-gray-800">
                              {group.name}
                            </h3>
                            <p className="chat-message">No recent message</p>
                            {/* <p className={`text-xs ${contact.status === 'Online' ? 'text-green-500' : 'text-gray-500'}`}>{contact.status}</p> */}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>

              {/* Right Panel - Chat Window */}

              <motion.div
                className="flex-1 bg-white rounded-xl overflow-hidden shadow-lg flex flex-col"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                {groupId? (
                  
                    <><div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4 border-b border-gray-200 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <img
                        src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                        className="w-10 h-10 rounded-full border-2 border-white" />
                      <div>
                        <h2 className="text-lg font-bold text-white">
                          {groups.find((group) => group.id === groupId)?.name}
                        </h2>
                        <p className="text-xs text-blue-100">
                          Connected since{" "}
                          {new Date(
                            groups.find((group) => group.id === groupId)?.created_at
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <button className="text-white hover:text-blue-200 transition-colors duration-200">
                      <FaEllipsisV size={16} />
                    </button>
                  </div><div
                    className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50"
                    style={{ maxHeight: "calc(100vh - 250px)" }}
                  >
                      <AnimatePresence>
                        {msg.map((message) => (
                          <motion.div
                            key={message.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className={`flex ${message.sender_id === userId
                                ? "justify-end"
                                : "justify-start"}`}
                          >
                            <div
                              className={`max-w-xs lg:max-w-md ${message.sender_id === userId
                                  ? "bg-blue-500 text-white"
                                  : "bg-white text-gray-800"} rounded-2xl p-3 shadow-md`}
                            >
                              <p className="break-words text-sm">
                                {message.content}
                              </p>
                              {/* <span className="text-xs opacity-75 mt-1 block">{new Date(message.timestamp).toLocaleTimeString()}</span> */}
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>

                    </div><div className="p-4 bg-white border-t border-gray-200">
                      <div className="flex items-center space-x-3">
                        <input
                          type="text"
                          value={newMsg}
                          onChange={(e) => setNewMsg(e.target.value)}
                          placeholder="Type a message..."
                          className="flex-1 px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 text-sm"
                          onKeyPress={(e) => e.key === "Enter" && sendMessageToGroup()} />
                        <motion.button
                          onClick={sendMessageToGroup}
                          className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors duration-200 flex items-center justify-center"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}

                        >
                          <FaPaperPlane className="w-5 h-5" />
                        </motion.button>
                      </div>
                      <div className="flex justify-between mt-3">
                        <div className="flex space-x-3">
                          <button className="text-gray-500 hover:text-blue-500 transition-colors duration-200">
                            <FaSmile className="w-5 h-5" />
                          </button>
                          <button className="text-gray-500 hover:text-blue-500 transition-colors duration-200">
                            <FaPaperclip className="w-5 h-5" />
                          </button>
                          <button className="text-gray-500 hover:text-blue-500 transition-colors duration-200">
                            <AiFillAccountBook className="w-5 h-5" />
                          </button>
                        </div>
                        <button className="text-blue-500 hover:text-blue-600 transition-colors duration-200 text-sm font-medium">
                          Send Voice Message
                        </button>
                      </div>
                    </div></>
                  
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500 text-lg font-light">
                      Select a contact to start chatting
                    </p>
                  </div>
                )}
              </motion.div>
            </div>
          </main>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
