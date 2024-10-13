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
  FaWaveSquare,
  FaRobot,
  FaMicrophone,
  FaStop,
  FaBrain,
  FaUser,
  FaInfoCircle,
} from "react-icons/fa";
import Modal from "react-modal"; // For confirmation dialog
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "./Header";
import axios from "axios";
import { ClipLoader } from "react-spinners";
import { FaGithub, FaUserCircle } from "react-icons/fa";
import Confetti from "react-confetti";
import useWindowSize from "react-use/lib/useWindowSize";
import "./Dashboard.css";
import { AiFillAccountBook } from "react-icons/ai";
import Recommendations from "./Recommendations";
import ConnectionRequests from "./ConnectionRequests";
import { GroupRequests } from "./GroupRequests";
import {
  ReactMediaRecorder,
  useReactMediaRecorder,
} from "react-media-recorder";
import {
  Box,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import LoadingProfileMatching from "./LoadingProfileMatching";

// WebRTC-related
const iceServers = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
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
  const [loading, setLoading] = useState(false);
  const [matchingProgress, setMatchingProgress] = useState(0);
  const [activeTab, setActiveTab] = useState("home");
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
  const [isRecording, setIsRecording] = useState(false);
  const [mediaStream, setMediaStream] = useState(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [load , setLoad] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [groups, setGroups] = useState([]);
  const [activeChat, setActiveChat] = useState(null); // Currently selected chat
  const [messages, setMessages] = useState([]); // Messages in active chat
  const [newMessage, setNewMessage] = useState(""); // Message input state
  const wsRef = useRef(null); // WebSocket reference
  const [audioPlayed, setAudioPlayed] = useState(() => {
    // Check if audio has already been played in this session
    return sessionStorage.getItem('audioPlayed') === 'true';
  });
  const [chatId, setChatId] = useState(null);
  const [documentFile, setDocumentFile] = useState(null);
  const [user, setUser] = useState([]);
  const [recommend, setRecommend] = useState([]);
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
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    localVideoRef.current.srcObject = stream;

    // Initialize WebRTC connections
    localConnection = new RTCPeerConnection(iceServers);
    stream
      .getTracks()
      .forEach((track) => localConnection.addTrack(track, stream));

    // Handle ICE candidate
    localConnection.onicecandidate = (event) => {
      if (event.candidate) {
        // Send the candidate to the remote peer via your signaling server (WebSocket)
        sendSignal("ice-candidate", event.candidate);
      }
    };

    // When remote stream is received
    localConnection.ontrack = (event) => {
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
      remoteConnection.ontrack = (event) => {
        remoteVideoRef.current.srcObject = event.streams[0];
      };

      await remoteConnection.setRemoteDescription(
        new RTCSessionDescription(data)
      );

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      stream
        .getTracks()
        .forEach((track) => remoteConnection.addTrack(track, stream));

      const answer = await remoteConnection.createAnswer();
      await remoteConnection.setLocalDescription(answer);

      sendSignal("answer", answer);
    } else if (type === "answer") {
      // Handle answer from remote peer
      await localConnection.setRemoteDescription(
        new RTCSessionDescription(data)
      );
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
    const value = e.target.value;
    setUserData(prevData => ({ ...prevData, [field]: value }));
    setUserDetails(prevDetails => ({ ...prevDetails, [field]: value }));
  };

  const [userData, setUserData] = useState({
    name: "",
    email: "",
    password: "",
    education: "",
    experience: "",
    goal: "",
    twitter_handle: "",
    bio: "",
    about: "",
    github: "",
    linkedin: "",
    banner_image: "",
    profile_image: "",
  });

  useEffect(() => {
    async function fetchChats() {
      try {
        const response = await axios.get(
          `https://network-ai-backend.onrender.com/get_chat_id?user_id=${userId}`
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
        `ws://network-ai-backend.onrender.com/ws/${activeChat.chat_id}?token=${token}`
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
            `https://network-ai-backend.onrender.com/get_messages/${activeChat.chat_id}`
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
      const response = await fetch("https://network-ai-backend.onrender.com/my_groups/", {
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
            `https://network-ai-backend.onrender.com/group_chats/${groupId}/messages`
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
      `ws://network-ai-backend.onrender.com/ws/${selectedGroupId}?token=${token}`
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
        await axios.post("https://network-ai-backend.onrender.com/send_message/", {
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
          // handleAutoGenerateConnections(),
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
        `https://network-ai-backend.onrender.com/auto_generate_connections?user_id=${userId}`
      );
      handleGetApprovalRequests();
    } catch (error) {
      alert("Failed to auto-generate connections: " + error.message);
    }
  };

  const fetchUserDetails = async () => {
    try {
      const response = await fetch("https://network-ai-backend.onrender.com/users/me/", {
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
        `https://network-ai-backend.onrender.com/recommendations/?user_id=${userId}`
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
        `https://network-ai-backend.onrender.com/send_connection_request/?user_id=${userId}&target_user_id=${recId}`
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
        `https://network-ai-backend.onrender.com/send_connection_request_to_other/?user_id=${userId}&target_user_id=${othId}`
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
        `https://network-ai-backend.onrender.com/approval_requests/?user_id=${userId}`
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
        `https://network-ai-backend.onrender.com/approval_requests_for_group/?user_id=${userId}`
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
        `https://network-ai-backend.onrender.com/network/${userId}`
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
        `https://network-ai-backend.onrender.com/network_of_networks/${userId}`
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
        `https://network-ai-backend.onrender.com/handle_approval/${requestId}?approved=${approved}`,
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
        "https://network-ai-backend.onrender.com/api/store_subscription",
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

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!documentFile) {
      alert("Please select a document to upload");
      return;
    }

    setLoading(true);
    try {
      await axios.post("https://network-ai-backend.onrender.com/update_user/", {
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
        profile_image: userData.profile_image,
      });

      const formData = new FormData();
      formData.append("file", documentFile);
      formData.append("user_id", userId);

      const response = await axios.post(
        "https://network-ai-backend.onrender.com/upload_document/",
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
        "https://network-ai-backend.onrender.com/auto_train_agent/",
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
      const response = await fetch("https://network-ai-backend.onrender.com/api/askAI", {
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

  useEffect(() => {
    const interval = setInterval(() => {
      setMatchingProgress((prev) => (prev < 100 ? prev + 1 : 0));
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const handleStop = async (blobUrl, blob) => {
    console.log("Blob URL received:", blobUrl);
    console.log("Blob object:", blob);

    if (!blob || !(blob instanceof Blob)) {
      console.error("Invalid blob object received");
      return;
    }

    setLoad(true);
    playAIComplete();
    console.log("audio button clicked")
    const formData = new FormData();
    formData.append("audio", blob, "recording.mp3");

    try {
      const response = await axios.post(
        `https://network-ai-backend.onrender.com/upload_audio/?user_id=${userId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setRecommend(response.data.recommendations);
      console.log(response.data.recommendations);
    } catch (error) {
      console.error("Error uploading audio:", error);
    } finally {
      setLoad(false);
    }
  };

  const { startRecording, stopRecording, mediaBlobUrl } = useReactMediaRecorder(
    {
      audio: true,
      onStop: handleStop,
    }
  );

  // Start recording logic
  const handleStartRecording = () => {
    console.log("audio button clicked")
    if (!mediaStream) return;

    setIsRecording(true);
    startRecording();
  };

  // Stop recording logic
  const handleStopRecording = () => {
    setIsRecording(false);
    stopRecording();
  };

  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        setAudioLevel(Math.random());
        setRecordingDuration((prev) => prev + 1);
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isRecording]);






  useEffect(() => {
    if (activeTab === 'home' && !audioPlayed) {
      // Request microphone permission when the home tab is active
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then((stream) => {
          setMediaStream(stream);
          // Play AI instructions after permission is granted
          playAIInstructions();
          setAudioPlayed(false)
          
        })
        .catch((error) => {
          console.error('Microphone access denied', error);
        });
    }
  }, [activeTab , audioPlayed]);

  // Function to play pre-recorded AI voice instructions
  // const playAIInstructions = () => {
  //   const audio = new Audio('/welcome.wav'); // Path to your AI voice instructions
  //   audio.play();
  //   audio.onended = () => {
  //     setAudioPlayed(true);
  //     // Save the played state in sessionStorage to avoid replay on refresh
  //     sessionStorage.setItem('audioPlayed', 'true');
  //   };
    
  // };



const playAIInstructions = () => {
  const audio = new Audio('/welcome.wav');
  
  // Preload the audio
  audio.load();

  audio.play().then(() => {
    audio.onended = () => {
      setAudioPlayed(true);
      sessionStorage.setItem('audioPlayed', 'true');
    };
  }).catch((error) => {
    console.error('Error playing audio:', error);
  });
};



  

  const playAIComplete = () => {
    const audio = new Audio('/complete.wav'); // Path to your AI voice instructions
    audio.play();
    
  };


    // Optional cleanup for media stream on component unmount
    useEffect(() => {
      return () => {
        if (mediaStream) {
          mediaStream.getTracks().forEach(track => track.stop());
        }
      };
    }, [mediaStream]);




  return (
    <div className="flex h-screen">
      <motion.aside
        className="bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 overflow-hidden text-white shadow-xl"
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
              { icon: FaHome, text: "Home", active: true },
              { icon: FaNetworkWired, text: "Connections" },
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

        {activeTab === "home" && (

          
        
          <>
          
          {load && recommend==0 ? <LoadingProfileMatching matchingProgress={matchingProgress} /> : ""}





         



          

          { !load &&
            <main className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-900 to-black p-8">
              {/* AI Integration */}
              <section className="p-6 max-w-7xl mx-auto bg-black bg-opacity-60 backdrop-filter backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden  m-4 overflow-hidden relative flex flex-col items-center">
                <motion.div
                  className="flex items-center justify-center mb-4 space-x-4"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <motion.div className="text-4xl  text-purple-600 justify-between">
                    <FaRobot />
                  </motion.div>
                  <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 mr-4 animate-pulse">
                    AI-Powered Profile Matching
                  </h2>
                  
                </motion.div>
                <div className="flex items-center space-x-4">
                  <motion.button
                    onClick={handleStartRecording}
                    className={`px-6 py-3 rounded-xl ${
                      isRecording
                        ? "bg-gray-300 cursor-not-allowed"
                        : "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                    } text-white text-base font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center`}
                    disabled={isRecording}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FaMicrophone className="mr-2 text-lg" />
                    <span>Start Recording</span>
                  </motion.button>

                  <motion.button
                    onClick={handleStopRecording}
                    className={`px-6 py-3 rounded-xl ${
                      !isRecording
                        ? "bg-gray-300 cursor-not-allowed"
                        : "bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700"
                    } text-white text-base font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center`}
                    disabled={!isRecording}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FaStop className="mr-2 text-lg" />
                    <span>Stop Recording</span>
                  </motion.button>
                </div>


                {recommend &&  recommend.length> 0  ? (
   
   
   
   
   
   <main className="flex-1 overflow-y-auto bg-white p-8">
            <div className="max-w-7xl mx-auto">
              <motion.h2
                className="text-3xl font-bold mb-6 relative inline-block"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
                  Recommendations
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
                
              </motion.nav>
              <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
            variants={{ initial: { opacity: 0 }, animate: { opacity: 1 } }} 
            initial="initial" 
            animate="animate" 
          > 
            <AnimatePresence> 
              {recommend.map((recomm) => ( 
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
            
            </div>
          </main>

               
            ) : ""
   
   
   
   
   
   
   
   }



   


                <AnimatePresence>
                  {isRecording && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.5 }}
                      className="mt-6 p-4 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl overflow-hidden shadow-inner w-full max-w-2xl"
                    >
                      <div className="flex items-center space-x-4">
                        <motion.div
                          className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <FaMicrophone className="text-white text-xl" />
                        </motion.div>
                        <div className="flex-1">
                          <div className="h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                            <motion.div
                              className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
                              style={{ width: `${audioLevel * 100}%` }}
                              animate={{
                                width: `${audioLevel * 100}%`,
                                transition: { duration: 0.1, ease: "linear" },
                              }}
                            />
                          </div>
                        </div>
                      </div>
                      <motion.p
                        className="mt-4 text-base text-gray-700 font-medium"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                      >
                        AI is analyzing your profile information...
                      </motion.p>
                      <motion.div
                        className="mt-3 flex justify-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1, duration: 0.5 }}
                      >
                        <div className="flex space-x-2">
                          {[...Array(3)].map((_, i) => (
                            <motion.div
                              key={i}
                              className="w-2 h-2 bg-blue-600 rounded-full"
                              animate={{ y: [0, -6, 0] }}
                              transition={{
                                duration: 0.5,
                                repeat: Infinity,
                                delay: i * 0.1,
                              }}
                            />
                          ))}
                        </div>
                      </motion.div>
                      <motion.div
                        className="mt-4 flex justify-between items-center"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.5, duration: 0.5 }}
                      >
                        <div className="flex items-center space-x-3">
                          <FaBrain className="text-2xl text-purple-600" />
                          <div>
                            <p className="text-xs text-gray-500">
                              AI Processing
                            </p>
                            <p className="text-sm font-semibold text-purple-600">
                              {Math.floor(recordingDuration / 60)}:
                              {recordingDuration % 60 < 10 ? "0" : ""}
                              {recordingDuration % 60}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <FaWaveSquare className="text-2xl text-blue-600" />
                          <div>
                            <p className="text-xs text-gray-500">
                              Audio Quality
                            </p>
                            <p className="text-sm font-semibold text-blue-600">
                              {Math.floor(audioLevel * 100)}%
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full opacity-50 blur-3xl"></div>
              </section>
            </main>
}
          </>

        )}

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
                {["All", "Tech", "Health", "Climate"].map((category) => (
                  <motion.button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`px-4 py-2 text-sm font-medium rounded-full transition-colors duration-200 ${
                      activeCategory === category
                        ? "text-white bg-gradient-to-r from-blue-500 to-purple-500 shadow-md"
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                    }`}
                    whileHover={{
                      scale: 1.05,
                      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {category}
                  </motion.button>
                ))}
              </motion.nav>
              {/* Recommendations component */}
              <Recommendations
                userId={userId}
                handleSendConnectionRequest={handleSendConnectionRequest}
              />
            </div>
          </main>
        )}

        {activeTab === "my networks" && (
          <main className="flex-1 overflow-y-auto bg-gray-50 p-4">
            <div className="max-w-7xl mx-auto">
              <motion.h2
                className="text-3xl font-bold mb-6 relative inline-block"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
                  My Networks
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
                {["All", "Tech", "Health", "Climate"].map((category) => (
                  <motion.button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`px-4 py-2 text-sm font-medium rounded-full transition-colors duration-200 ${
                      activeCategory === category
                        ? "text-white bg-gradient-to-r from-blue-500 to-purple-500 shadow-md"
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                    }`}
                    whileHover={{
                      scale: 1.05,
                      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                    }}
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
                className="text-3xl font-bold mb-6 relative inline-block"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
                  Other Networks
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
                {["All", "Tech", "Health", "Climate"].map((category) => (
                  <motion.button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`px-4 py-2 text-sm font-medium rounded-full transition-colors duration-200 ${
                      activeCategory === category
                        ? "text-white bg-gradient-to-r from-blue-500 to-purple-500 shadow-md"
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                    }`}
                    whileHover={{
                      scale: 1.05,
                      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                    }}
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
                className="text-3xl font-bold mb-6 relative inline-block"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
                  Connection Requests
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
                {["All", "Tech", "Health", "Climate"].map((category) => (
                  <motion.button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`px-4 py-2 text-sm font-medium rounded-full transition-colors duration-200 ${
                      activeCategory === category
                        ? "text-white bg-gradient-to-r from-blue-500 to-purple-500 shadow-md"
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                    }`}
                    whileHover={{
                      scale: 1.05,
                      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {category}
                  </motion.button>
                ))}
              </motion.nav>
              <ConnectionRequests userId={userId} token={token} />
            </div>
          </main>
        )}

        {activeTab === "group requests" && (
          <main className="flex-1 overflow-y-auto bg-gray-50 p-4">
            <div className="max-w-7xl mx-auto">
              <motion.h2
                className="text-3xl font-bold mb-6 relative inline-block"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
                  Group Requests
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
                {["All", "Tech", "Health", "Climate"].map((category) => (
                  <motion.button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`px-4 py-2 text-sm font-medium rounded-full transition-colors duration-200 ${
                      activeCategory === category
                        ? "text-white bg-gradient-to-r from-blue-500 to-purple-500 shadow-md"
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                    }`}
                    whileHover={{
                      scale: 1.05,
                      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {category}
                  </motion.button>
                ))}
              </motion.nav>
              <GroupRequests token={token} userId={userId} />
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
         
      <main className="flex-1 p-6 overflow-y-auto">
      <motion.h1
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-4xl font-bold mb-8 text-center"
      >
        <motion.span
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="inline-block bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600"
        >
          User Settings
        </motion.span>
      </motion.h1>
      <div className="flex flex-col md:flex-row gap-6">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full md:w-1/3 bg-white rounded-2xl shadow-2xl overflow-hidden border border-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
        >
          <div className="h-40 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 relative overflow-hidden">
            <motion.img
              src="https://images.unsplash.com/photo-1579546929518-9e396f3cc809?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80"
              alt="Banner"
              className="w-full h-full object-cover opacity-80"
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
          </div>
          <div className="-mt-20 px-6 pb-6">
            <div className="relative w-36 h-36 mx-auto">
              <img
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80"
                alt="Profile"
                className="w-full h-full rounded-full object-cover border-4 border-white shadow-lg"
              />
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="absolute bottom-0 right-0 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full p-2 hover:from-blue-600 hover:to-purple-700 transition duration-200 shadow-md"
                aria-label="Edit profile picture"
              >
                <FaEdit />
              </motion.button>
            </div>
            { user && user.map((us)=> (
            <div key={us.id}><h2 className="text-2xl font-bold text-center mt-4 text-gray-800">{us.name}</h2><p className="text-center text-gray-600 mt-2">{us.bio}</p></div>
))}
            <div className="flex justify-center space-x-4 mt-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-full hover:from-blue-600 hover:to-purple-700 transition duration-200 shadow-md"
              >
                Follow
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gray-200 text-gray-800 px-6 py-2 rounded-full hover:bg-gray-300 transition duration-200 shadow-md"
              >
                Message
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          onSubmit={handleUpdate}
          className="w-full md:w-2/3 bg-white rounded-2xl shadow-2xl p-8 border border-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {
              [
                { name: "bio", label: "Bio", placeholder: "Enter your bio", icon: FaUser },
                { name: "about", label: "About", placeholder: "Tell us about yourself", icon: FaInfoCircle },
                { name: "experience", label: "Experience", placeholder: "Your work experience", icon: FaBriefcase },
                { name: "education", label: "Education", placeholder: "Your educational background", icon: FaGraduationCap },
                { name: "twitter", label: "Twitter", placeholder: "Your Twitter handle", icon: FaTwitter },
                { name: "goal", label: "Goal", placeholder: "Your current goal", icon: FaBullseye },
                { name: "linkedin", label: "LinkedIn", placeholder: "Your LinkedIn profile", icon: FaLinkedin },
                { name: "github", label: "GitHub", placeholder: "Your GitHub profile", icon: FaGithub }
              ].map((field) => (
                <div key={field.name} className="space-y-2">
                  <label htmlFor={field.name} className="block text-sm font-medium text-gray-700">{field.label}</label>
                  <div className="relative">
                    <AnimatePresence>
                      <motion.input
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        type="text"
                        id={field.name}
                        name={field.name}
                        value={userData[field.name]}
                        onChange={(e) => handleInputChange(e, field.name)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 pl-10"
                        placeholder={field.placeholder}
                        whileFocus={{ scale: 1.05, boxShadow: "0 0 0 3px rgba(99, 102, 241, 0.5)" }}
                      />
                    </AnimatePresence>
                    <field.icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  </div>
                  
                </div>
              ))
            }
          </div>
          <div className="mt-6">
            <label htmlFor="document" className="block text-sm font-medium text-gray-700">Document</label>
            <div className="mt-1 relative">
              <input
                type="file"
                id="document"
                name="document"
                className="mt-1 block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-gradient-to-r file:from-blue-500 file:to-purple-600 file:text-white
                hover:file:bg-gradient-to-r hover:file:from-blue-600 hover:file:to-purple-700 transition duration-200"
                onChange={handleDocumentChange}
              />
              
            </div>
          </div>
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="mt-8"
          >
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-lg"
              
            >
              Save Changes
            </button>
          </motion.div>
        </motion.form>
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
                    <Modal
                      isOpen={isModalOpen}
                      onRequestClose={closeModal}
                      className="modal-content"
                      overlayClassName="modal-overlay"
                    >
                      <h2>Start a Video Call?</h2>
                      <button onClick={initiateVideoCall}>
                        Yes, Start Call
                      </button>
                      <button onClick={closeModal}>Cancel</button>
                    </Modal>

                    {/* Video Call UI */}
                    {isInCall && (
                      <div className="video-call-container">
                        <video
                          ref={localVideoRef}
                          autoPlay
                          muted
                          className="local-video"
                        />
                        <video
                          ref={remoteVideoRef}
                          autoPlay
                          className="remote-video"
                        />
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
                              } rounded-2xl p-3 shadow-md`}
                              onContextMenu={(e) =>
                                handleRightClick(e, message)
                              }
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
                            <FaVideo className="w-5 h-5" onClick={openModal} />
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
                {groupId ? (
                  <>
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4 border-b border-gray-200 flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <img
                          src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                          className="w-10 h-10 rounded-full border-2 border-white"
                        />
                        <div>
                          <h2 className="text-lg font-bold text-white">
                            {groups.find((group) => group.id === groupId)?.name}
                          </h2>
                          <p className="text-xs text-blue-100">
                            Connected since{" "}
                            {new Date(
                              groups.find(
                                (group) => group.id === groupId
                              )?.created_at
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <button className="text-white hover:text-blue-200 transition-colors duration-200">
                        <FaEllipsisV size={16} />
                      </button>
                    </div>
                    <div
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
                            className={`flex ${
                              message.sender_id === userId
                                ? "justify-end"
                                : "justify-start"
                            }`}
                          >
                            <div
                              className={`max-w-xs lg:max-w-md ${
                                message.sender_id === userId
                                  ? "bg-blue-500 text-white"
                                  : "bg-white text-gray-800"
                              } rounded-2xl p-3 shadow-md`}
                            >
                              <p className="break-words text-sm">
                                {message.content}
                              </p>
                              {/* <span className="text-xs opacity-75 mt-1 block">{new Date(message.timestamp).toLocaleTimeString()}</span> */}
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                    <div className="p-4 bg-white border-t border-gray-200">
                      <div className="flex items-center space-x-3">
                        <input
                          type="text"
                          value={newMsg}
                          onChange={(e) => setNewMsg(e.target.value)}
                          placeholder="Type a message..."
                          className="flex-1 px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 text-sm"
                          onKeyPress={(e) =>
                            e.key === "Enter" && sendMessageToGroup()
                          }
                        />
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
      </div>
    </div>
  );
};

export default Dashboard;
