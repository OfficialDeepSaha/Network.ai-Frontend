import React, { useEffect, useRef, useState } from "react";
import "./Test.css";
import { Header } from "./Header";
import axios from "axios";
import { ClipLoader } from "react-spinners";
import { FaGithub, FaUserCircle } from "react-icons/fa";
import Confetti from 'react-confetti';
import "./Animation.css";
import "./Chat.css";
import useWindowSize from 'react-use/lib/useWindowSize';

// WebSocket endpoint
const WEBSOCKET_URL = "ws://localhost:8000/ws/";

const Test1 = () => {
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
  const [contextMenu, setContextMenu] = useState({ isVisible: false, x: 0, y: 0 });
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
    const socket = new WebSocket(`ws://localhost:8000/ws/${selectedGroupId}?token=${token}`);
  
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
      setLoading(true);
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
      setLoading(false);
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
        `http://localhost:8000/handle_approval/${requestId}?approved=${approved}`, {}, // Empty body since you're not sending data in the body
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

  if (loading) {
    return (
      <div className="loader-container">
        <ClipLoader color="purple" size={50} />
      </div>
    );
  }

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
      amount: plan === "Free" ? 0 : plan === "Pro" ? 1200 : 900, // Amount in paise
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
      trainingFormData.append("twitter_handle", userData.twitter_handle);
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
      y: event.pageY
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
        body: JSON.stringify({ message: rightClickedMessage.content , chat_partner_name: activeChat.user_2_name }),
      });

      const data = await response.json();
      setNewMessage(data.response); // Set the AI response in the input box
      setIsLoadingAIResponse(false);
      closeContextMenu();
    }
  };















  return (
    <div
      className="relative flex size-full min-h-screen flex-col bg-gradient-to-b from-blue-50 via-white to-indigo-50 group/design-root overflow-x-hidden"
      style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}
    >
      <div className="layout-container flex h-full grow flex-col">
        <Header />
        <div className="gap-1 px-6 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col w-80">
            <div className="flex h-full min-h-[700px] flex-col justify-between bg-slate-50 p-4">
              <div className="flex flex-col gap-4">
                {/* <h1 className="text-[#0d151c] text-base font-medium leading-normal">
                  
                </h1> */}
                <div className="flex flex-col gap-2">
                  <div
                    className="flex items-center gap-3 px-3 py-2"
                    onClick={() => handleTabClick("connections")}
                  >
                    <p className="text-[#0d151c] text-sm font-medium leading-normal">
                      Connections
                    </p>
                  </div>
                  <div
                    className="flex items-center gap-3 px-3 py-2"
                    onClick={() => handleTabClick("networks")}
                  >
                    <p className="text-[#0d151c] text-sm font-medium leading-normal">
                      My Networks
                    </p>
                  </div>
                  <div
                    className="flex items-center gap-3 px-3 py-2"
                    onClick={() => handleTabClick("othernetworks")}
                  >
                    <p className="text-[#0d151c] text-sm font-medium leading-normal">
                      Other Networks
                    </p>
                  </div>
                  <div
                    className="flex items-center gap-3 px-3 py-2 rounded-xl bg-[#e7eef4]"
                    onClick={() => handleTabClick("recommendations")}
                  >
                    <p className="text-[#0d151c] text-sm font-medium leading-normal">
                      Recommendations
                    </p>
                  </div>
                  <div
                    className="flex items-center gap-3 px-3 py-2"
                    onClick={() => handleTabClick("settings")}
                  >
                    <p className="text-[#0d151c] text-sm font-medium leading-normal">
                      Settings
                    </p>
                  </div>

                  <div
                    className="flex items-center gap-3 px-3 py-2"
                    onClick={() => handleTabClick("grouprequests")}
                  >
                    <p className="text-[#0d151c] text-sm font-medium leading-normal">
                      Group Requests
                    </p>
                  </div>

                  <div
                    className="flex items-center gap-3 px-3 py-2"
                    onClick={() => handleTabClick("chats")}
                  >
                    <p className="text-[#0d151c] text-sm font-medium leading-normal">
                      Chat
                    </p>
                  </div>
                  <div
                    className="flex items-center gap-3 px-3 py-2"
                    onClick={() => handleTabClick("groups")}
                  >
                    <p className="text-[#0d151c] text-sm font-medium leading-normal">
                      Groups
                    </p>
                  </div>
                  <div
                    className="flex items-center gap-3 px-3 py-2"
                    onClick={() => handleTabClick("subscriptions")}
                  >
                    <p className="text-[#0d151c] text-sm font-medium leading-normal">
                      Upgrade to Premium
                    </p>
                  </div>
                </div>
              </div>
              <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#2094f3] text-slate-50 text-sm font-bold leading-normal tracking-[0.015em]">
                <span className="truncate">New AI Agent</span>
              </button>
            </div>
          </div>
          {activeTab === "recommendations" && (
            <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
              <div className="flex flex-wrap justify-between gap-3 p-4">
                <p className="text-[#0d151c] tracking-light text-[32px] font-bold leading-tight min-w-72">
                  Suggested Connections
                </p>
              </div>
              <div className="pb-3">
                <div className="flex border-b border-[#cedde8] px-4 gap-8">
                  <a
                    className="flex flex-col items-center justify-center border-b-[3px] border-b-[#2094f3] text-[#0d151c] pb-[13px] pt-4"
                    href="#"
                  >
                    <p className="text-[#0d151c] text-sm font-bold leading-normal tracking-[0.015em]">
                      All
                    </p>
                  </a>
                  <a
                    className="flex flex-col items-center justify-center border-b-[3px] border-b-transparent text-[#49779c] pb-[13px] pt-4"
                    href="#"
                  >
                    <p className="text-[#49779c] text-sm font-bold leading-normal tracking-[0.015em]">
                      Tech
                    </p>
                  </a>
                  <a
                    className="flex flex-col items-center justify-center border-b-[3px] border-b-transparent text-[#49779c] pb-[13px] pt-4"
                    href="#"
                  >
                    <p className="text-[#49779c] text-sm font-bold leading-normal tracking-[0.015em]">
                      Health
                    </p>
                  </a>
                  <a
                    className="flex flex-col items-center justify-center border-b-[3px] border-b-transparent text-[#49779c] pb-[13px] pt-4"
                    href="#"
                  >
                    <p className="text-[#49779c] text-sm font-bold leading-normal tracking-[0.015em]">
                      Climate
                    </p>
                  </a>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-4 bg-slate-50 px-4 min-h-[72px] py-2 justify-between">
                  {recommendations &&
                    recommendations.map((recomm) => (
                      <div className="flex items-center gap-4" key={recomm.id}>
                        <div
                          className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-14 w-fit"
                          style={{
                            backgroundImage:
                              'url("https://cdn.usegalileo.ai/stability/cde723c1-99a4-4c51-b7ae-fd2f071d6cfa.png")',
                          }}
                        />
                        <div className="flex flex-col justify-center">
                          <p className="text-[#0d151c] text-base font-medium leading-normal line-clamp-1">
                            {recomm.name}
                          </p>
                          <p className="text-[#49779c] text-sm font-normal leading-normal line-clamp-2">
                            {recomm.bio}
                          </p>
                        </div>
                        <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-8 px-4 bg-[#e7eef4] text-[#0d151c] text-sm font-medium leading-normal w-fit">
                          <span
                            className="truncate"
                            onClick={() =>
                              handleSendConnectionRequest(recomm.id)
                            }
                          >
                            Connect
                          </span>
                        </button>
                      </div>
                    ))}

                  {/* <div className="shrink-0"> */}
                </div>
              </div>
            </div>
          )}

          {activeTab === "connections" && (
            <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
              <div className="flex flex-wrap justify-between gap-3 p-4">
                <p className="text-[#0d151c] tracking-light text-[32px] font-bold leading-tight min-w-72">
                  Connection Requests
                </p>
              </div>
              <div className="pb-3">
                <div className="flex border-b border-[#cedde8] px-4 gap-8">
                  <a
                    className="flex flex-col items-center justify-center border-b-[3px] border-b-[#2094f3] text-[#0d151c] pb-[13px] pt-4"
                    href="#"
                  >
                    <p className="text-[#0d151c] text-sm font-bold leading-normal tracking-[0.015em]">
                      All
                    </p>
                  </a>
                  <a
                    className="flex flex-col items-center justify-center border-b-[3px] border-b-transparent text-[#49779c] pb-[13px] pt-4"
                    href="#"
                  >
                    <p className="text-[#49779c] text-sm font-bold leading-normal tracking-[0.015em]">
                      Tech
                    </p>
                  </a>
                  <a
                    className="flex flex-col items-center justify-center border-b-[3px] border-b-transparent text-[#49779c] pb-[13px] pt-4"
                    href="#"
                  >
                    <p className="text-[#49779c] text-sm font-bold leading-normal tracking-[0.015em]">
                      Health
                    </p>
                  </a>
                  <a
                    className="flex flex-col items-center justify-center border-b-[3px] border-b-transparent text-[#49779c] pb-[13px] pt-4"
                    href="#"
                  >
                    <p className="text-[#49779c] text-sm font-bold leading-normal tracking-[0.015em]">
                      Climate
                    </p>
                  </a>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-4 bg-slate-50 px-4 min-h-[72px] py-2 justify-between">
                  {approvalRequests &&
                    approvalRequests.map((approv) => (
                      <div className="flex items-center gap-4" key={approv.id}>
                        <div
                          className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-14 w-fit"
                          style={{
                            backgroundImage:
                              'url("https://cdn.usegalileo.ai/stability/cde723c1-99a4-4c51-b7ae-fd2f071d6cfa.png")',
                          }}
                        />
                        <div className="flex flex-col justify-center">
                          <p className="text-[#0d151c] text-base font-medium leading-normal line-clamp-1">
                            {approv.sender_name}
                          </p>
                        </div>
                        <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-8 px-4 bg-[#e7eef4] text-[#0d151c] text-sm font-medium leading-normal w-fit">
                          <span
                            className="truncate"
                            onClick={() =>
                              handleApprovalAction(approv.id, true)
                            }
                          >
                            Approve
                          </span>
                        </button>
                        <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-8 px-4 bg-[#e7eef4] text-[#0d151c] text-sm font-medium leading-normal w-fit">
                          <span
                            className="truncate"
                            onClick={() =>
                              handleApprovalAction(approv.id, false)
                            }
                          >
                            Deny
                          </span>
                        </button>
                      </div>
                    ))}

                  {/* <div className="shrink-0"> */}
                </div>
              </div>
            </div>
          )}

          {activeTab === "networks" && (
            <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
              <div className="flex flex-wrap justify-between gap-3 p-4">
                <p className="text-[#0d151c] tracking-light text-[32px] font-bold leading-tight min-w-72">
                  My Networks
                </p>
              </div>
              <div className="pb-3">
                <div className="flex border-b border-[#cedde8] px-4 gap-8">
                  <a
                    className="flex flex-col items-center justify-center border-b-[3px] border-b-[#2094f3] text-[#0d151c] pb-[13px] pt-4"
                    href="#"
                  >
                    <p className="text-[#0d151c] text-sm font-bold leading-normal tracking-[0.015em]">
                      All
                    </p>
                  </a>
                  <a
                    className="flex flex-col items-center justify-center border-b-[3px] border-b-transparent text-[#49779c] pb-[13px] pt-4"
                    href="#"
                  >
                    <p className="text-[#49779c] text-sm font-bold leading-normal tracking-[0.015em]">
                      Tech
                    </p>
                  </a>
                  <a
                    className="flex flex-col items-center justify-center border-b-[3px] border-b-transparent text-[#49779c] pb-[13px] pt-4"
                    href="#"
                  >
                    <p className="text-[#49779c] text-sm font-bold leading-normal tracking-[0.015em]">
                      Health
                    </p>
                  </a>
                  <a
                    className="flex flex-col items-center justify-center border-b-[3px] border-b-transparent text-[#49779c] pb-[13px] pt-4"
                    href="#"
                  >
                    <p className="text-[#49779c] text-sm font-bold leading-normal tracking-[0.015em]">
                      Climate
                    </p>
                  </a>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-4 bg-slate-50 px-4 min-h-[72px] py-2 justify-between">
                  {networks &&
                    networks.map((netw) => (
                      <div className="flex items-center gap-4" key={netw.id}>
                        <div
                          className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-14 w-fit"
                          style={{
                            backgroundImage:
                              'url("https://cdn.usegalileo.ai/stability/cde723c1-99a4-4c51-b7ae-fd2f071d6cfa.png")',
                          }}
                        />
                        <div className="flex flex-col justify-center">
                          <p className="text-[#0d151c] text-base font-medium leading-normal line-clamp-1">
                            {netw.name}
                          </p>

                          <p className="text-[#0d151c] text-base font-medium leading-normal line-clamp-1">
                            {netw.email}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "grouprequests" && (
            <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
              <div className="flex flex-wrap justify-between gap-3 p-4">
                <p className="text-[#0d151c] tracking-light text-[32px] font-bold leading-tight min-w-72">
                  Group Requests
                </p>
              </div>
              <div className="pb-3">
                <div className="flex border-b border-[#cedde8] px-4 gap-8">
                  <a
                    className="flex flex-col items-center justify-center border-b-[3px] border-b-[#2094f3] text-[#0d151c] pb-[13px] pt-4"
                    href="#"
                  >
                    <p className="text-[#0d151c] text-sm font-bold leading-normal tracking-[0.015em]">
                      All
                    </p>
                  </a>
                  <a
                    className="flex flex-col items-center justify-center border-b-[3px] border-b-transparent text-[#49779c] pb-[13px] pt-4"
                    href="#"
                  >
                    <p className="text-[#49779c] text-sm font-bold leading-normal tracking-[0.015em]">
                      Tech
                    </p>
                  </a>
                  <a
                    className="flex flex-col items-center justify-center border-b-[3px] border-b-transparent text-[#49779c] pb-[13px] pt-4"
                    href="#"
                  >
                    <p className="text-[#49779c] text-sm font-bold leading-normal tracking-[0.015em]">
                      Health
                    </p>
                  </a>
                  <a
                    className="flex flex-col items-center justify-center border-b-[3px] border-b-transparent text-[#49779c] pb-[13px] pt-4"
                    href="#"
                  >
                    <p className="text-[#49779c] text-sm font-bold leading-normal tracking-[0.015em]">
                      Climate
                    </p>
                  </a>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-4 bg-slate-50 px-4 min-h-[72px] py-2 justify-between">
                  {groupRequests &&
                    groupRequests.map((approv) => (
                      <div className="flex items-center gap-4" key={approv.id}>
                        <div
                          className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-14 w-fit"
                          style={{
                            backgroundImage:
                              'url("https://cdn.usegalileo.ai/stability/cde723c1-99a4-4c51-b7ae-fd2f071d6cfa.png")',
                          }}
                        />
                        <div className="flex flex-col justify-center">
                          <p className="text-[#0d151c] text-base font-medium leading-normal line-clamp-1">
                            {approv.sender_name}
                          </p>
                        </div>
                        <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-8 px-4 bg-[#e7eef4] text-[#0d151c] text-sm font-medium leading-normal w-fit">
                          <span
                            className="truncate"
                            onClick={() =>
                              handleGroupApprovalAction(approv.id, true)
                            }
                          >
                            Approve
                          </span>
                        </button>
                        <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-8 px-4 bg-[#e7eef4] text-[#0d151c] text-sm font-medium leading-normal w-fit">
                          <span
                            className="truncate"
                            onClick={() =>
                              handleGroupApprovalAction(approv.id, false)
                            }
                          >
                            Deny
                          </span>
                        </button>
                      </div>
                    ))}

                  {/* <div className="shrink-0"> */}
                </div>
              </div>
            </div>
          )}

          {activeTab === "othernetworks" && (
            <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
              <div className="flex flex-wrap justify-between gap-3 p-4">
                <p className="text-[#0d151c] tracking-light text-[32px] font-bold leading-tight min-w-72">
                  Other Networks
                </p>
              </div>
              <div className="pb-3">
                <div className="flex border-b border-[#cedde8] px-4 gap-8">
                  <a
                    className="flex flex-col items-center justify-center border-b-[3px] border-b-[#2094f3] text-[#0d151c] pb-[13px] pt-4"
                    href="#"
                  >
                    <p className="text-[#0d151c] text-sm font-bold leading-normal tracking-[0.015em]">
                      All
                    </p>
                  </a>
                  <a
                    className="flex flex-col items-center justify-center border-b-[3px] border-b-transparent text-[#49779c] pb-[13px] pt-4"
                    href="#"
                  >
                    <p className="text-[#49779c] text-sm font-bold leading-normal tracking-[0.015em]">
                      Tech
                    </p>
                  </a>
                  <a
                    className="flex flex-col items-center justify-center border-b-[3px] border-b-transparent text-[#49779c] pb-[13px] pt-4"
                    href="#"
                  >
                    <p className="text-[#49779c] text-sm font-bold leading-normal tracking-[0.015em]">
                      Health
                    </p>
                  </a>
                  <a
                    className="flex flex-col items-center justify-center border-b-[3px] border-b-transparent text-[#49779c] pb-[13px] pt-4"
                    href="#"
                  >
                    <p className="text-[#49779c] text-sm font-bold leading-normal tracking-[0.015em]">
                      Climate
                    </p>
                  </a>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-4 bg-slate-50 px-4 min-h-[72px] py-2 justify-between">
                  {otherNetworks &&
                    otherNetworks.map((othnetw) => (
                      <div className="flex items-center gap-4" key={othnetw.id}>
                        <div
                          className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-14 w-fit"
                          style={{
                            backgroundImage:
                              'url("https://cdn.usegalileo.ai/stability/cde723c1-99a4-4c51-b7ae-fd2f071d6cfa.png")',
                          }}
                        />
                        <div className="flex flex-col justify-center">
                          <p className="text-[#0d151c] text-base font-medium leading-normal line-clamp-1">
                            {othnetw.name}
                          </p>

                          <p className="text-[#0d151c] text-base font-medium leading-normal line-clamp-1">
                            {othnetw.email}
                          </p>
                        </div>
                        <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-8 px-4 bg-[#e7eef4] text-[#0d151c] text-sm font-medium leading-normal w-fit">
                          <span
                            className="truncate"
                            onClick={() =>
                              handleSendConnectionRequestToOtherNetwork(
                                othnetw.id
                              )
                            }
                          >
                            Connect
                          </span>
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
              <div className="flex flex-wrap justify-between gap-3 p-4">
                <p className="text-[#0d151c] tracking-light text-[32px] font-bold leading-tight min-w-72">
                  Settings
                </p>
              </div>
              <div className="pb-3">
                <div className="flex border-b border-[#cedde8] px-4 gap-8">
                  <a
                    className="flex flex-col items-center justify-center border-b-[3px] border-b-[#2094f3] text-[#0d151c] pb-[13px] pt-4"
                    href="#"
                  >
                    <p className="text-[#0d151c] text-sm font-bold leading-normal tracking-[0.015em]">
                      All
                    </p>
                  </a>
                  <a
                    className="flex flex-col items-center justify-center border-b-[3px] border-b-transparent text-[#49779c] pb-[13px] pt-4"
                    href="#"
                  >
                    <p className="text-[#49779c] text-sm font-bold leading-normal tracking-[0.015em]">
                      Tech
                    </p>
                  </a>
                  <a
                    className="flex flex-col items-center justify-center border-b-[3px] border-b-transparent text-[#49779c] pb-[13px] pt-4"
                    href="#"
                  >
                    <p className="text-[#49779c] text-sm font-bold leading-normal tracking-[0.015em]">
                      Health
                    </p>
                  </a>
                  <a
                    className="flex flex-col items-center justify-center border-b-[3px] border-b-transparent text-[#49779c] pb-[13px] pt-4"
                    href="#"
                  >
                    <p className="text-[#49779c] text-sm font-bold leading-normal tracking-[0.015em]">
                      Climate
                    </p>
                  </a>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-4 bg-slate-50 px-4 min-h-[72px] py-2 justify-between">
                  <div
                    className="relative flex size-full min-h-screen flex-col bg-white group/design-root overflow-x-hidden"
                    style={{
                      fontFamily:
                        '"Plus Jakarta Sans", "Noto Sans", sans-serif',
                    }}
                  >
                    <div className="layout-container flex h-full grow flex-col">
                      <div className="px-40 flex flex-1 justify-center py-5">
                        <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
                          <div className="flex p-4 @container">
                            <div className="flex w-full flex-col gap-4 @[520px]:flex-row @[520px]:justify-between @[520px]:items-center">
                              <div className="flex gap-4">
                                <div
                                  className="bg-center bg-no-repeat aspect-square bg-cover rounded-full min-h-32 w-32"
                                  style={{
                                    backgroundImage:
                                      'url("https://cdn.usegalileo.ai/stability/e140196d-1ecf-4a2d-9643-66e9c757caaa.png")',
                                  }}
                                />
                                {user &&
                                  user.map((u, id) => (
                                    <div
                                      className="flex flex-col justify-center"
                                      key={id}
                                    >
                                      <p className="text-[#111418] text-[22px] font-bold leading-tight tracking-[-0.015em]">
                                        {u.name}
                                      </p>
                                      <p className="text-[#637588] text-base font-normal leading-normal">
                                        {u.bio}
                                      </p>
                                      <p className="text-[#637588] text-base font-normal leading-normal">
                                        San Francisco, CA
                                      </p>
                                    </div>
                                  ))}
                              </div>
                              <div className="flex w-full max-w-[480px] gap-3 @[480px]:w-auto">
                                <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-[#f0f2f4] text-[#111418] text-sm font-bold leading-normal tracking-[0.015em] flex-1 @[480px]:flex-auto">
                                  <span className="truncate">Follow</span>
                                </button>
                                <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-[#1980e6] text-white text-sm font-bold leading-normal tracking-[0.015em] flex-1 @[480px]:flex-auto">
                                  <span className="truncate">More</span>
                                </button>
                              </div>
                            </div>
                          </div>
                          <div className="p-4 grid grid-cols-2 gap-4">
                            {/* Twitter Handle */}
                            {/* <div className="flex flex-col gap-1 border-t border-solid border-t-[#dce0e5] py-4 pr-2">
                              <p className="text-[#637588] text-sm font-normal leading-normal">
                                Twitter Handle
                              </p>
                              <div className="relative">
                                {isEditable.twitter ? (
                                  <input
                                    type="text"
                                    value={userData.twitter}
                                    onChange={(e) =>
                                      handleInputChange(e, "twitter")
                                    }
                                    className="text-[#111418] text-sm font-normal leading-normal"
                                  />
                                ) : (
                                  <p
                                    className="text-[#111418] text-sm font-normal leading-normal"
                                    onClick={() => handleEditToggle("twitter")}
                                  >
                                    {userData.twitter || "Add Twitter handle"}
                                  </p>
                                )}
                              </div>
                            </div> */}

                            {/* Bio */}
                            <div className="flex flex-col gap-1 border-t border-solid border-t-[#dce0e5] py-4 pr-2">
                              <p className="text-[#637588] text-sm font-normal leading-normal">
                                Bio
                              </p>
                              <div className="relative">
                                {isEditable.bio ? (
                                  <input
                                    type="text"
                                    value={userData.bio}
                                    onChange={(e) =>
                                      handleInputChange(e, "bio")
                                    }
                                    className="text-[#111418] text-sm font-normal leading-normal"
                                  />
                                ) : (
                                  <p
                                    className="text-[#111418] text-sm font-normal leading-normal"
                                    onClick={() => handleEditToggle("bio")}
                                  >
                                    {userData.bio || "Add a bio"}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Email */}
                            {/* <div className="flex flex-col gap-1 border-t border-solid border-t-[#dce0e5] py-4 pl-2">
                              <p className="text-[#637588] text-sm font-normal leading-normal">
                                Email
                              </p>
                              <div className="relative">
                                {isEditable.email ? (
                                  <input
                                    type="text"
                                    value={userData.email}
                                    onChange={(e) =>
                                      handleInputChange(e, "email")
                                    }
                                    className="text-[#111418] text-sm font-normal leading-normal"
                                  />
                                ) : (
                                  <p
                                    className="text-[#111418] text-sm font-normal leading-normal"
                                    onClick={() => handleEditToggle("email")}
                                  >
                                    {userData.email || "Add email address"}
                                  </p>
                                )}
                              </div>
                            </div> */}

                            {/* Education */}
                            <div className="flex flex-col gap-1 border-t border-solid border-t-[#dce0e5] py-4 pr-2">
                              <p className="text-[#637588] text-sm font-normal leading-normal">
                                Education
                              </p>
                              <div className="relative">
                                {isEditable.education ? (
                                  <input
                                    type="text"
                                    value={userData.education}
                                    onChange={(e) =>
                                      handleInputChange(e, "education")
                                    }
                                    className="text-[#111418] text-sm font-normal leading-normal"
                                  />
                                ) : (
                                  <p
                                    className="text-[#111418] text-sm font-normal leading-normal"
                                    onClick={() =>
                                      handleEditToggle("education")
                                    }
                                  >
                                    {userData.education ||
                                      "Add education details"}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Experience */}
                            <div className="flex flex-col gap-1 border-t border-solid border-t-[#dce0e5] py-4 pl-2">
                              <p className="text-[#637588] text-sm font-normal leading-normal">
                                Experience
                              </p>
                              <div className="relative">
                                {isEditable.experience ? (
                                  <input
                                    type="text"
                                    value={userData.experience}
                                    onChange={(e) =>
                                      handleInputChange(e, "experience")
                                    }
                                    className="text-[#111418] text-sm font-normal leading-normal"
                                  />
                                ) : (
                                  <p
                                    className="text-[#111418] text-sm font-normal leading-normal"
                                    onClick={() =>
                                      handleEditToggle("experience")
                                    }
                                  >
                                    {userData.experience || "Add experience"}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Goal */}
                            <div className="flex flex-col gap-1 border-t border-solid border-t-[#dce0e5] py-4 pr-2">
                              <p className="text-[#637588] text-sm font-normal leading-normal">
                                Goal
                              </p>
                              <div className="relative">
                                {isEditable.goal ? (
                                  <input
                                    type="text"
                                    value={userData.goal}
                                    onChange={(e) =>
                                      handleInputChange(e, "goal")
                                    }
                                    className="text-[#111418] text-sm font-normal leading-normal"
                                  />
                                ) : (
                                  <p
                                    className="text-[#111418] text-sm font-normal leading-normal"
                                    onClick={() => handleEditToggle("goal")}
                                  >
                                    {userData.goal || "Add your goal"}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Github */}
                            <div className="flex flex-col gap-1 border-t border-solid border-t-[#dce0e5] py-4 pl-2">
                              <p className="text-[#637588] text-sm font-normal leading-normal">
                                Github
                              </p>
                              <div className="relative">
                                {isEditable.twitter_handle ? (
                                  <input
                                    type="text"
                                    value={userData.twitter_handle}
                                    onChange={(e) =>
                                      handleInputChange(e, "twitter_handle")
                                    }
                                    className="text-[#111418] text-sm font-normal leading-normal"
                                  />
                                ) : (
                                  <p
                                    className="text-[#111418] text-sm font-normal leading-normal"
                                    onClick={() =>
                                      handleEditToggle("twitter_handle")
                                    }
                                  >
                                    {userData.twitter_handle ||
                                      "Add Github username"}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Document Upload */}
                            <div className="flex flex-col gap-1 border-t border-solid border-t-[#dce0e5] py-4 pr-2">
                              <p className="text-[#637588] text-sm font-normal leading-normal">
                                Document
                              </p>
                              <input
                                type="file"
                                className="text-[#111418] text-sm font-normal leading-normal"
                                onChange={handleDocumentChange}
                              />
                            </div>
                          </div>
                          <div
                            className="sparkle-button"
                            style={{
                              alignItems: "center",
                              justifyContent: "center",
                              justifyItems: "center",
                              display: "flex",
                            }}
                          >
                            <button className="btn">
                              <span className="spark" />
                              {/* <span class="spark"></span> */}
                              <span className="backdrop" />
                              <svg
                                className="sparkle"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M14.187 8.096L15 5.25L15.813 8.096C16.0231 8.83114 16.4171 9.50062 16.9577 10.0413C17.4984 10.5819 18.1679 10.9759 18.903 11.186L21.75 12L18.904 12.813C18.1689 13.0231 17.4994 13.4171 16.9587 13.9577C16.4181 14.4984 16.0241 15.1679 15.814 15.903L15 18.75L14.187 15.904C13.9769 15.1689 13.5829 14.4994 13.0423 13.9587C12.5016 13.4181 11.8321 13.0241 11.097 12.814L8.25 12L11.096 11.187C11.8311 10.9769 12.5006 10.5829 13.0413 10.0423C13.5819 9.50162 13.9759 8.83214 14.186 8.097L14.187 8.096Z"
                                  fill="black"
                                  stroke="black"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <path
                                  d="M6 14.25L5.741 15.285C5.59267 15.8785 5.28579 16.4206 4.85319 16.8532C4.42059 17.2858 3.87853 17.5927 3.285 17.741L2.25 18L3.285 18.259C3.87853 18.4073 4.42059 18.7142 4.85319 19.1468C5.28579 19.5794 5.59267 20.1215 5.741 20.715L6 21.75L6.259 20.715C6.40725 20.1216 6.71398 19.5796 7.14639 19.147C7.5788 18.7144 8.12065 18.4075 8.714 18.259L9.75 18L8.714 17.741C8.12065 17.5925 7.5788 17.2856 7.14639 16.853C6.71398 16.4204 6.40725 15.8784 6.259 15.285L6 14.25Z"
                                  fill="black"
                                  stroke="black"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <path
                                  d="M6.5 4L6.303 4.5915C6.24777 4.75718 6.15472 4.90774 6.03123 5.03123C5.90774 5.15472 5.75718 5.24777 5.5915 5.303L5 5.5L5.5915 5.697C5.75718 5.75223 5.90774 5.84528 6.03123 5.96877C6.15472 6.09226 6.24777 6.24282 6.303 6.4085L6.5 7L6.697 6.4085C6.75223 6.24282 6.84528 6.09226 6.96877 5.96877C7.09226 5.84528 7.24282 5.75223 7.4085 5.697L8 5.5L7.4085 5.303C7.24282 5.24777 7.09226 5.15472 6.96877 5.03123C6.84528 4.90774 6.75223 4.75718 6.697 4.5915L6.5 4Z"
                                  fill="black"
                                  stroke="black"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                              <span className="text" onClick={handleUpdate}>
                                Submit
                              </span>
                            </button>
                            <div className="bodydrop" />
                            <span aria-hidden="true" className="particle-pen">
                              <svg
                                className="particle"
                                viewBox="0 0 15 15"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M6.937 3.846L7.75 1L8.563 3.846C8.77313 4.58114 9.1671 5.25062 9.70774 5.79126C10.2484 6.3319 10.9179 6.72587 11.653 6.936L14.5 7.75L11.654 8.563C10.9189 8.77313 10.2494 9.1671 9.70874 9.70774C9.1681 10.2484 8.77413 10.9179 8.564 11.653L7.75 14.5L6.937 11.654C6.72687 10.9189 6.3329 10.2494 5.79226 9.70874C5.25162 9.1681 4.58214 8.77413 3.847 8.564L1 7.75L3.846 6.937C4.58114 6.72687 5.25062 6.3329 5.79126 5.79226C6.3319 5.25162 6.72587 4.58214 6.936 3.847L6.937 3.846Z"
                                  fill="black"
                                  stroke="black"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                              <svg
                                className="particle"
                                viewBox="0 0 15 15"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M6.937 3.846L7.75 1L8.563 3.846C8.77313 4.58114 9.1671 5.25062 9.70774 5.79126C10.2484 6.3319 10.9179 6.72587 11.653 6.936L14.5 7.75L11.654 8.563C10.9189 8.77313 10.2494 9.1671 9.70874 9.70774C9.1681 10.2484 8.77413 10.9179 8.564 11.653L7.75 14.5L6.937 11.654C6.72687 10.9189 6.3329 10.2494 5.79226 9.70874C5.25162 9.1681 4.58214 8.77413 3.847 8.564L1 7.75L3.846 6.937C4.58114 6.72687 5.25062 6.3329 5.79126 5.79226C6.3319 5.25162 6.72587 4.58214 6.936 3.847L6.937 3.846Z"
                                  fill="black"
                                  stroke="black"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                              <svg
                                className="particle"
                                viewBox="0 0 15 15"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M6.937 3.846L7.75 1L8.563 3.846C8.77313 4.58114 9.1671 5.25062 9.70774 5.79126C10.2484 6.3319 10.9179 6.72587 11.653 6.936L14.5 7.75L11.654 8.563C10.9189 8.77313 10.2494 9.1671 9.70874 9.70774C9.1681 10.2484 8.77413 10.9179 8.564 11.653L7.75 14.5L6.937 11.654C6.72687 10.9189 6.3329 10.2494 5.79226 9.70874C5.25162 9.1681 4.58214 8.77413 3.847 8.564L1 7.75L3.846 6.937C4.58114 6.72687 5.25062 6.3329 5.79126 5.79226C6.3319 5.25162 6.72587 4.58214 6.936 3.847L6.937 3.846Z"
                                  fill="black"
                                  stroke="black"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                              <svg
                                className="particle"
                                viewBox="0 0 15 15"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M6.937 3.846L7.75 1L8.563 3.846C8.77313 4.58114 9.1671 5.25062 9.70774 5.79126C10.2484 6.3319 10.9179 6.72587 11.653 6.936L14.5 7.75L11.654 8.563C10.9189 8.77313 10.2494 9.1671 9.70874 9.70774C9.1681 10.2484 8.77413 10.9179 8.564 11.653L7.75 14.5L6.937 11.654C6.72687 10.9189 6.3329 10.2494 5.79226 9.70874C5.25162 9.1681 4.58214 8.77413 3.847 8.564L1 7.75L3.846 6.937C4.58114 6.72687 5.25062 6.3329 5.79126 5.79226C6.3319 5.25162 6.72587 4.58214 6.936 3.847L6.937 3.846Z"
                                  fill="black"
                                  stroke="black"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                              <svg
                                className="particle"
                                viewBox="0 0 15 15"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M6.937 3.846L7.75 1L8.563 3.846C8.77313 4.58114 9.1671 5.25062 9.70774 5.79126C10.2484 6.3319 10.9179 6.72587 11.653 6.936L14.5 7.75L11.654 8.563C10.9189 8.77313 10.2494 9.1671 9.70874 9.70774C9.1681 10.2484 8.77413 10.9179 8.564 11.653L7.75 14.5L6.937 11.654C6.72687 10.9189 6.3329 10.2494 5.79226 9.70874C5.25162 9.1681 4.58214 8.77413 3.847 8.564L1 7.75L3.846 6.937C4.58114 6.72687 5.25062 6.3329 5.79126 5.79226C6.3319 5.25162 6.72587 4.58214 6.936 3.847L6.937 3.846Z"
                                  fill="black"
                                  stroke="black"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                              <svg
                                className="particle"
                                viewBox="0 0 15 15"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M6.937 3.846L7.75 1L8.563 3.846C8.77313 4.58114 9.1671 5.25062 9.70774 5.79126C10.2484 6.3319 10.9179 6.72587 11.653 6.936L14.5 7.75L11.654 8.563C10.9189 8.77313 10.2494 9.1671 9.70874 9.70774C9.1681 10.2484 8.77413 10.9179 8.564 11.653L7.75 14.5L6.937 11.654C6.72687 10.9189 6.3329 10.2494 5.79226 9.70874C5.25162 9.1681 4.58214 8.77413 3.847 8.564L1 7.75L3.846 6.937C4.58114 6.72687 5.25062 6.3329 5.79126 5.79226C6.3319 5.25162 6.72587 4.58214 6.936 3.847L6.937 3.846Z"
                                  fill="black"
                                  stroke="black"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                              <svg
                                className="particle"
                                viewBox="0 0 15 15"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M6.937 3.846L7.75 1L8.563 3.846C8.77313 4.58114 9.1671 5.25062 9.70774 5.79126C10.2484 6.3319 10.9179 6.72587 11.653 6.936L14.5 7.75L11.654 8.563C10.9189 8.77313 10.2494 9.1671 9.70874 9.70774C9.1681 10.2484 8.77413 10.9179 8.564 11.653L7.75 14.5L6.937 11.654C6.72687 10.9189 6.3329 10.2494 5.79226 9.70874C5.25162 9.1681 4.58214 8.77413 3.847 8.564L1 7.75L3.846 6.937C4.58114 6.72687 5.25062 6.3329 5.79126 5.79226C6.3319 5.25162 6.72587 4.58214 6.936 3.847L6.937 3.846Z"
                                  fill="black"
                                  stroke="black"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                              <svg
                                className="particle"
                                viewBox="0 0 15 15"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M6.937 3.846L7.75 1L8.563 3.846C8.77313 4.58114 9.1671 5.25062 9.70774 5.79126C10.2484 6.3319 10.9179 6.72587 11.653 6.936L14.5 7.75L11.654 8.563C10.9189 8.77313 10.2494 9.1671 9.70874 9.70774C9.1681 10.2484 8.77413 10.9179 8.564 11.653L7.75 14.5L6.937 11.654C6.72687 10.9189 6.3329 10.2494 5.79226 9.70874C5.25162 9.1681 4.58214 8.77413 3.847 8.564L1 7.75L3.846 6.937C4.58114 6.72687 5.25062 6.3329 5.79126 5.79226C6.3319 5.25162 6.72587 4.58214 6.936 3.847L6.937 3.846Z"
                                  fill="black"
                                  stroke="black"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                              <svg
                                className="particle"
                                viewBox="0 0 15 15"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M6.937 3.846L7.75 1L8.563 3.846C8.77313 4.58114 9.1671 5.25062 9.70774 5.79126C10.2484 6.3319 10.9179 6.72587 11.653 6.936L14.5 7.75L11.654 8.563C10.9189 8.77313 10.2494 9.1671 9.70874 9.70774C9.1681 10.2484 8.77413 10.9179 8.564 11.653L7.75 14.5L6.937 11.654C6.72687 10.9189 6.3329 10.2494 5.79226 9.70874C5.25162 9.1681 4.58214 8.77413 3.847 8.564L1 7.75L3.846 6.937C4.58114 6.72687 5.25062 6.3329 5.79126 5.79226C6.3319 5.25162 6.72587 4.58214 6.936 3.847L6.937 3.846Z"
                                  fill="black"
                                  stroke="black"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                              <svg
                                className="particle"
                                viewBox="0 0 15 15"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M6.937 3.846L7.75 1L8.563 3.846C8.77313 4.58114 9.1671 5.25062 9.70774 5.79126C10.2484 6.3319 10.9179 6.72587 11.653 6.936L14.5 7.75L11.654 8.563C10.9189 8.77313 10.2494 9.1671 9.70874 9.70774C9.1681 10.2484 8.77413 10.9179 8.564 11.653L7.75 14.5L6.937 11.654C6.72687 10.9189 6.3329 10.2494 5.79226 9.70874C5.25162 9.1681 4.58214 8.77413 3.847 8.564L1 7.75L3.846 6.937C4.58114 6.72687 5.25062 6.3329 5.79126 5.79226C6.3319 5.25162 6.72587 4.58214 6.936 3.847L6.937 3.846Z"
                                  fill="black"
                                  stroke="black"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                              <svg
                                className="particle"
                                viewBox="0 0 15 15"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M6.937 3.846L7.75 1L8.563 3.846C8.77313 4.58114 9.1671 5.25062 9.70774 5.79126C10.2484 6.3319 10.9179 6.72587 11.653 6.936L14.5 7.75L11.654 8.563C10.9189 8.77313 10.2494 9.1671 9.70874 9.70774C9.1681 10.2484 8.77413 10.9179 8.564 11.653L7.75 14.5L6.937 11.654C6.72687 10.9189 6.3329 10.2494 5.79226 9.70874C5.25162 9.1681 4.58214 8.77413 3.847 8.564L1 7.75L3.846 6.937C4.58114 6.72687 5.25062 6.3329 5.79126 5.79226C6.3319 5.25162 6.72587 4.58214 6.936 3.847L6.937 3.846Z"
                                  fill="black"
                                  stroke="black"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                              <svg
                                className="particle"
                                viewBox="0 0 15 15"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M6.937 3.846L7.75 1L8.563 3.846C8.77313 4.58114 9.1671 5.25062 9.70774 5.79126C10.2484 6.3319 10.9179 6.72587 11.653 6.936L14.5 7.75L11.654 8.563C10.9189 8.77313 10.2494 9.1671 9.70874 9.70774C9.1681 10.2484 8.77413 10.9179 8.564 11.653L7.75 14.5L6.937 11.654C6.72687 10.9189 6.3329 10.2494 5.79226 9.70874C5.25162 9.1681 4.58214 8.77413 3.847 8.564L1 7.75L3.846 6.937C4.58114 6.72687 5.25062 6.3329 5.79126 5.79226C6.3319 5.25162 6.72587 4.58214 6.936 3.847L6.937 3.846Z"
                                  fill="black"
                                  stroke="black"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                              <svg
                                className="particle"
                                viewBox="0 0 15 15"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M6.937 3.846L7.75 1L8.563 3.846C8.77313 4.58114 9.1671 5.25062 9.70774 5.79126C10.2484 6.3319 10.9179 6.72587 11.653 6.936L14.5 7.75L11.654 8.563C10.9189 8.77313 10.2494 9.1671 9.70874 9.70774C9.1681 10.2484 8.77413 10.9179 8.564 11.653L7.75 14.5L6.937 11.654C6.72687 10.9189 6.3329 10.2494 5.79226 9.70874C5.25162 9.1681 4.58214 8.77413 3.847 8.564L1 7.75L3.846 6.937C4.58114 6.72687 5.25062 6.3329 5.79126 5.79226C6.3319 5.25162 6.72587 4.58214 6.936 3.847L6.937 3.846Z"
                                  fill="black"
                                  stroke="black"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                              <svg
                                className="particle"
                                viewBox="0 0 15 15"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M6.937 3.846L7.75 1L8.563 3.846C8.77313 4.58114 9.1671 5.25062 9.70774 5.79126C10.2484 6.3319 10.9179 6.72587 11.653 6.936L14.5 7.75L11.654 8.563C10.9189 8.77313 10.2494 9.1671 9.70874 9.70774C9.1681 10.2484 8.77413 10.9179 8.564 11.653L7.75 14.5L6.937 11.654C6.72687 10.9189 6.3329 10.2494 5.79226 9.70874C5.25162 9.1681 4.58214 8.77413 3.847 8.564L1 7.75L3.846 6.937C4.58114 6.72687 5.25062 6.3329 5.79126 5.79226C6.3319 5.25162 6.72587 4.58214 6.936 3.847L6.937 3.846Z"
                                  fill="black"
                                  stroke="black"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                              <svg
                                className="particle"
                                viewBox="0 0 15 15"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M6.937 3.846L7.75 1L8.563 3.846C8.77313 4.58114 9.1671 5.25062 9.70774 5.79126C10.2484 6.3319 10.9179 6.72587 11.653 6.936L14.5 7.75L11.654 8.563C10.9189 8.77313 10.2494 9.1671 9.70874 9.70774C9.1681 10.2484 8.77413 10.9179 8.564 11.653L7.75 14.5L6.937 11.654C6.72687 10.9189 6.3329 10.2494 5.79226 9.70874C5.25162 9.1681 4.58214 8.77413 3.847 8.564L1 7.75L3.846 6.937C4.58114 6.72687 5.25062 6.3329 5.79126 5.79226C6.3319 5.25162 6.72587 4.58214 6.936 3.847L6.937 3.846Z"
                                  fill="black"
                                  stroke="black"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                              <svg
                                className="particle"
                                viewBox="0 0 15 15"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M6.937 3.846L7.75 1L8.563 3.846C8.77313 4.58114 9.1671 5.25062 9.70774 5.79126C10.2484 6.3319 10.9179 6.72587 11.653 6.936L14.5 7.75L11.654 8.563C10.9189 8.77313 10.2494 9.1671 9.70874 9.70774C9.1681 10.2484 8.77413 10.9179 8.564 11.653L7.75 14.5L6.937 11.654C6.72687 10.9189 6.3329 10.2494 5.79226 9.70874C5.25162 9.1681 4.58214 8.77413 3.847 8.564L1 7.75L3.846 6.937C4.58114 6.72687 5.25062 6.3329 5.79126 5.79226C6.3319 5.25162 6.72587 4.58214 6.936 3.847L6.937 3.846Z"
                                  fill="black"
                                  stroke="black"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                              <svg
                                className="particle"
                                viewBox="0 0 15 15"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M6.937 3.846L7.75 1L8.563 3.846C8.77313 4.58114 9.1671 5.25062 9.70774 5.79126C10.2484 6.3319 10.9179 6.72587 11.653 6.936L14.5 7.75L11.654 8.563C10.9189 8.77313 10.2494 9.1671 9.70874 9.70774C9.1681 10.2484 8.77413 10.9179 8.564 11.653L7.75 14.5L6.937 11.654C6.72687 10.9189 6.3329 10.2494 5.79226 9.70874C5.25162 9.1681 4.58214 8.77413 3.847 8.564L1 7.75L3.846 6.937C4.58114 6.72687 5.25062 6.3329 5.79126 5.79226C6.3319 5.25162 6.72587 4.58214 6.936 3.847L6.937 3.846Z"
                                  fill="black"
                                  stroke="black"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                              <svg
                                className="particle"
                                viewBox="0 0 15 15"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M6.937 3.846L7.75 1L8.563 3.846C8.77313 4.58114 9.1671 5.25062 9.70774 5.79126C10.2484 6.3319 10.9179 6.72587 11.653 6.936L14.5 7.75L11.654 8.563C10.9189 8.77313 10.2494 9.1671 9.70874 9.70774C9.1681 10.2484 8.77413 10.9179 8.564 11.653L7.75 14.5L6.937 11.654C6.72687 10.9189 6.3329 10.2494 5.79226 9.70874C5.25162 9.1681 4.58214 8.77413 3.847 8.564L1 7.75L3.846 6.937C4.58114 6.72687 5.25062 6.3329 5.79126 5.79226C6.3319 5.25162 6.72587 4.58214 6.936 3.847L6.937 3.846Z"
                                  fill="black"
                                  stroke="black"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                              <svg
                                className="particle"
                                viewBox="0 0 15 15"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M6.937 3.846L7.75 1L8.563 3.846C8.77313 4.58114 9.1671 5.25062 9.70774 5.79126C10.2484 6.3319 10.9179 6.72587 11.653 6.936L14.5 7.75L11.654 8.563C10.9189 8.77313 10.2494 9.1671 9.70874 9.70774C9.1681 10.2484 8.77413 10.9179 8.564 11.653L7.75 14.5L6.937 11.654C6.72687 10.9189 6.3329 10.2494 5.79226 9.70874C5.25162 9.1681 4.58214 8.77413 3.847 8.564L1 7.75L3.846 6.937C4.58114 6.72687 5.25062 6.3329 5.79126 5.79226C6.3319 5.25162 6.72587 4.58214 6.936 3.847L6.937 3.846Z"
                                  fill="black"
                                  stroke="black"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                              <svg
                                className="particle"
                                viewBox="0 0 15 15"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M6.937 3.846L7.75 1L8.563 3.846C8.77313 4.58114 9.1671 5.25062 9.70774 5.79126C10.2484 6.3319 10.9179 6.72587 11.653 6.936L14.5 7.75L11.654 8.563C10.9189 8.77313 10.2494 9.1671 9.70874 9.70774C9.1681 10.2484 8.77413 10.9179 8.564 11.653L7.75 14.5L6.937 11.654C6.72687 10.9189 6.3329 10.2494 5.79226 9.70874C5.25162 9.1681 4.58214 8.77413 3.847 8.564L1 7.75L3.846 6.937C4.58114 6.72687 5.25062 6.3329 5.79126 5.79226C6.3319 5.25162 6.72587 4.58214 6.936 3.847L6.937 3.846Z"
                                  fill="black"
                                  stroke="black"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "subscriptions" && (
            // relative flex size-full min-h-screen flex-col bg-[#f8fbfa]

            <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            {isPaymentSuccessful && <Confetti width={width} height={height} />}
              <h2 className="text-black text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
                Choose a plan
              </h2>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(228px,1fr))] gap-2.5 px-4 py-3 @3xl:grid-cols-4">
                {/* Free Plan */}
                <div className="flex flex-1 flex-col gap-4 rounded-xl border border-solid border-[#344c65] bg-[#1a2632] p-6">
                  <div className="flex flex-col gap-1">
                    <h1 className="text-white text-base font-bold leading-tight">
                      Free
                    </h1>
                    <p className="flex items-baseline gap-1 text-white">
                      <span className="text-white text-4xl font-black leading-tight tracking-[-0.033em]">
                        $0
                      </span>
                      <span className="text-white text-base font-bold leading-tight">
                        /month
                      </span>
                    </p>
                  </div>
                  <button
                    className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#243547] text-white text-sm font-bold leading-normal tracking-[0.015em]"
                    onClick={() => handlePayment("Free")}
                  >
                    <span className="truncate">Start free trial</span>
                  </button>
                  {/* Benefits List */}
                  <div className="flex flex-col gap-2">
                    <div className="text-[13px] font-normal leading-normal flex gap-3 text-white">
                      <CheckIcon /> Unlimited designs
                    </div>
                    <div className="text-[13px] font-normal leading-normal flex gap-3 text-white">
                      <CheckIcon /> 100+ templates
                    </div>
                    <div className="text-[13px] font-normal leading-normal flex gap-3 text-white">
                      <CheckIcon /> 1 team member
                    </div>
                  </div>
                </div>

                {/* Pro Plan */}
                <div className="flex flex-1 flex-col gap-4 rounded-xl border border-solid border-[#344c65] bg-[#1a2632] p-6">
                  <div className="flex flex-col gap-1">
                    <h1 className="text-white text-base font-bold leading-tight">
                      Pro
                    </h1>
                    <p className="flex items-baseline gap-1 text-white">
                      <span className="text-white text-4xl font-black leading-tight tracking-[-0.033em]">
                        $12
                      </span>
                      <span className="text-white text-base font-bold leading-tight">
                        /month
                      </span>
                    </p>
                  </div>
                  <button
                    className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#243547] text-white text-sm font-bold leading-normal tracking-[0.015em]"
                    onClick={() => handlePayment("Pro")}
                  >
                    <span className="truncate">Start free trial</span>
                  </button>
                  {/* Benefits List */}
                  <div className="flex flex-col gap-2">
                    <div className="text-[13px] font-normal leading-normal flex gap-3 text-white">
                      <CheckIcon /> Everything in Free, plus:
                    </div>
                    <div className="text-[13px] font-normal leading-normal flex gap-3 text-white">
                      <CheckIcon /> Unlimited designs
                    </div>
                    <div className="text-[13px] font-normal leading-normal flex gap-3 text-white">
                      <CheckIcon /> 200+ templates
                    </div>
                    <div className="text-[13px] font-normal leading-normal flex gap-3 text-white">
                      <CheckIcon /> Custom fonts
                    </div>
                    <div className="text-[13px] font-normal leading-normal flex gap-3 text-white">
                      <CheckIcon /> Create custom palettes
                    </div>
                    <div className="text-[13px] font-normal leading-normal flex gap-3 text-white">
                      <CheckIcon /> Export to PNG, JPEG
                    </div>
                    <div className="text-[13px] font-normal leading-normal flex gap-3 text-white">
                      <CheckIcon /> Import from Figma, Sketch
                    </div>
                  </div>
                </div>

                {/* Team Plan */}
                <div className="flex flex-1 flex-col gap-4 rounded-xl border border-solid border-[#344c65] bg-[#1a2632] p-6">
                  <div className="flex flex-col gap-1">
                    <h1 className="text-white text-base font-bold leading-tight">
                      Team
                    </h1>
                    <p className="flex items-baseline gap-1 text-white">
                      <span className="text-white text-4xl font-black leading-tight tracking-[-0.033em]">
                        $9
                      </span>
                      <span className="text-white text-base font-bold leading-tight">
                        per editor/month
                      </span>
                    </p>
                  </div>
                  <button
                    className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#243547] text-white text-sm font-bold leading-normal tracking-[0.015em]"
                    onClick={() => handlePayment("Team")}
                  >
                    <span className="truncate">Start free trial</span>
                  </button>
                  {/* Benefits List */}
                  <div className="flex flex-col gap-2">
                    <div className="text-[13px] font-normal leading-normal flex gap-3 text-white">
                      <CheckIcon /> Everything in Pro, plus:
                    </div>
                    <div className="text-[13px] font-normal leading-normal flex gap-3 text-white">
                      <CheckIcon /> Unlimited designs
                    </div>
                    <div className="text-[13px] font-normal leading-normal flex gap-3 text-white">
                      <CheckIcon /> 300+ templates
                    </div>
                    <div className="text-[13px] font-normal leading-normal flex gap-3 text-white">
                      <CheckIcon /> Invite unlimited team members
                    </div>
                    <div className="text-[13px] font-normal leading-normal flex gap-3 text-white">
                      <CheckIcon /> Commenting
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "chats" && (
            <div className="app-container  flex flex-row max-w-[960px] flex-1">
              {/* Sidebar */}
              <div className="sidebar">
                <input
                  type="text"
                  placeholder="Search messages..."
                  className="search-input"
                />

                <div className="chat-list">
                  {chats.map((chat, index) => (
                    <div
                      key={index}
                      className={`chat-item ${
                        activeChat && activeChat.chat_id === chat.chat_id
                          ? "active"
                          : ""
                      }`}
                      onClick={() => setActiveChat(chat)}
                    >
                      <div className="chat-avatar">
                        <FaUserCircle size={36} />
                      </div>
                      <div className="chat-details">
                        <p className="chat-name">{chat.user_2_name}</p>

                        <p className="chat-message">No recent message</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {activeChat && (
                <div className="chat-window">
                  <div className="chat-header">
                    <FaGithub size={50} className="profile-icon" />
                    <div className="chat-header-info">
                      <h2>{activeChat.user_2_name}</h2>
                      <p>Connected Since {activeChat.created_at}</p>
                    </div>
                  </div>

                  {/* Chat Body */}
                  <div className="chat-body" ref={chatBodyRef}>
                    {messages.map((message, index) => (
                      <div
                        key={index}
                        className={
                          message.sender_id === 216
                            ? "sent-message-wrapper"
                            : "received-message-wrapper"
                        }
                        onContextMenu={(e) => handleRightClick(e, message)}
                      >
                        <div
                          className={
                            message.sender_id === 216
                              ? "sent-message"
                              : "received-message"
                          }
                        >
                          <p>{message.content}</p>
                          <div className="message-time">
                            {message.timestamp}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

 {/* Right-click context menu */}
 {contextMenu.isVisible && (
        <div
          className="context-menu"
          style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
        >
          <ul>
            <li onClick={handleAskAI}>Ask AI</li>
          </ul>
        </div>
      )}



                  {/* Chat Input */}
                  <div className="chat-input">
                    <input
                      type="text"
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="message-input"
                      disabled={isLoadingAIResponse}
                    />
                    
                    <button onClick={sendMessage} className="send-btn">
                      Send
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

{activeTab === "groups" && (
  <div className="app-container flex flex-row max-w-[960px] flex-1">
    {/* Sidebar */}
    <div className="sidebar">
      <input
        type="text"
        placeholder="Search messages..."
        className="search-input"
      />

      <div className="chat-list">
        {groups.map(
          (
            group, // Correctly map through groups
            index
          ) => (
            <div
              key={index}
              className={`chat-item ${
                groupId === group.id ? "active" : "" // Fix condition to match selected group by ID
              }`}
              onClick={() => {
                setGroupId(group.id); // Set the selected groupId
                connectWebSocket(group.id); // Establish WebSocket connection for this group
              }}
            >
              <div className="chat-avatar">
                <FaUserCircle size={36} />
              </div>
              <div className="chat-details">
                <p className="chat-name">{group.name}</p>
                <p className="chat-message">No recent message</p>
              </div>
            </div>
          )
        )}
      </div>
    </div>

    {groupId && (
      <div className="chat-window">
        <div className="chat-header">
          <FaGithub size={50} className="profile-icon" />
          <div className="chat-header-info">
            <h2>{groups.find((group) => group.id === groupId)?.name}</h2>
            <p>Connected Since {groups.find((group) => group.id === groupId)?.created_at}</p>
          </div>
        </div>

        {/* Chat Body */}
        <div className="chat-body" ref={chatBodyRef}>
          {msg.map((message, index) => (
            <div
              key={index}
              className={
                message.sender_id === 216
                  ? "sent-message-wrapper"
                  : "received-message-wrapper"
              }
            >
              <div
                className={
                  message.sender_id === 216
                    ? "sent-message"
                    : "received-message"
                }
              >
                <p>{message.content}</p>
                <div className="message-time">
                  {message.timestamp}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Chat Input */}
        <div className="chat-input">
          <input
            type="text"
            placeholder="Type a message..."
            value={newMsg}
            onChange={(e) => setNewMsg(e.target.value)}
            className="message-input"
          />
          <button onClick={sendMessageToGroup} className="send-btn">
            Send
          </button>
        </div>
      </div>
    )}
  </div>
)}

        </div>
      </div>
    </div>
  );
};

export default Test1;
