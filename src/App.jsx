import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Button,
  Form,
  Spinner,
  Container,
  Row,
  Col,
  Card,
  Alert,
  Navbar,
  Nav,
} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import io from "socket.io-client";



const App = () => {
  const [userId, setUserId] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [approvalRequests, setApprovalRequests] = useState([]);
  const [groupChats, setGroupChats] = useState([]);
  const [selectedGroupChat, setSelectedGroupChat] = useState(null);
  const [groupChatMessages, setGroupChatMessages] = useState([]);
  const [chats, setChats] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [socket, setSocket] = useState(null);
  const [userDetails, setUserDetails] = useState({
    name: "",
    email: "",
    password: "",
    education: "",
    experience: "",
    goal: "",
    twitter_handle: "",
  });
  const [documentFile, setDocumentFile] = useState(null);

  useEffect(() => {
    if (userId) {
      handleGetRecommendations();
      handleAutoGenerateConnections();
      handleGetGroupChats();
    }
  }, [userId]);




  useEffect(() => {
    if (userId) {
      fetchChats();
    }
  }, [userId]);

  useEffect(() => {
    if (selectedChatId && socket) {
      socket.emit("join_chat", selectedChatId);
      fetchMessages(selectedChatId);
    }
  }, [selectedChatId, socket]);



  const fetchChatId = async (userId) => {
    try {
      const response = await fetch(`http://localhost:8000/get_chat_id?user_id=${userId}`);
      if (response.ok) {
        const data = await response.json();
        return data.chat_id;
      } else {
        console.error('Error fetching chat ID:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching chat ID:', error);
    }
  };



  useEffect(() => {
    const fetchChatId = async () => {
        const response = await fetch(`http://localhost:8000/get_chat_id?user_id=${userId}`);
        if (response.ok) {
            const data = await response.json();
            const chatId = data.chat_id;
            const newSocket = io(`http://localhost:8000/ws/${chatId}`, {
                transports: ['websocket']
            });
            setSocket(newSocket);

            newSocket.on("message", (message) => {
                setMessages((prevMessages) => [...prevMessages, message]);
            });

            return () => {
                newSocket.disconnect();
            };
        } else {
            console.error('Error fetching chat ID:', response.statusText);
        }
    };

    fetchChatId();
}, []);


  const fetchChats = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:8000/get_chats/?user_id=${userId}`);
      setChats(response.data);
    } catch (error) {
      alert("Error fetching chats: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (chatId) => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:8000/get_messages/${chatId}`);
      setMessages(response.data);
    } catch (error) {
      alert("Error fetching messages: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!messageInput) {
      alert("Please type a message");
      return;
    }

    setLoading(true);
    try {
      await axios.post("http://localhost:8000/send_message/", {
        chat_id: selectedChatId,
        sender_id: userId,
        content: messageInput,
      });

      setMessageInput("");
    } catch (error) {
      alert("Error sending message: " + error.message);
    } finally {
      setLoading(false);
    }
  };








  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserDetails({ ...userDetails, [name]: value });
  };

  const handleDocumentChange = (e) => {
    setDocumentFile(e.target.files[0]);
  };

  const handleRegister = async () => {
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:8000/register/", {
        name: userDetails.name,
        email: userDetails.email,
        password: userDetails.password,
      });
      setUserId(response.data.id);
      alert("Registered successfully");
    } catch (error) {
      alert("Registration failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:8000/login/", {
        email: userDetails.email,
        password: userDetails.password,
      });
      if (response.data.message === "Login successful") {
        setUserId(response.data.id);
        alert("Login successful");
      }
    } catch (error) {
      alert("Login failed: " + error.message);
    } finally {
      setLoading(false);
    }
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
        education: userDetails.education,
        experience: userDetails.experience,
        goal: userDetails.goal,
        twitter_handle: userDetails.twitter_handle,
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
      trainingFormData.append("twitter_handle", userDetails.twitter_handle);
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

  const handleGetRecommendations = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:8000/recommendations/?user_id=${userId}`
      );
      setRecommendations(response.data);
    } catch (error) {
      alert("Failed to get recommendations: " + error.message);
    } finally {
      setLoading(false);
    }
  };

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

  const handleGetApprovalRequests = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:8000/approval_requests/?user_id=${userId}`
      );
      setApprovalRequests(response.data);
    } catch (error) {
      alert("Failed to get approval requests: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprovalAction = async (requestId, approved) => {
    setLoading(true);
    try {
      await axios.post(
        `http://localhost:8000/handle_approval/${requestId}?approved=${approved}&user_id=${userId}`
      );
      setApprovalRequests((prev) =>
        prev.map((req) =>
          req.id === requestId
            ? { ...req, status: approved ? "accepted" : "denied" }
            : req
        )
      );
      alert(`Request ${approved ? "approved" : "denied"} successfully`);
      await handleGetApprovalRequests();
      await handleGetRecommendations();
    } catch (error) {
      alert("Failed to handle approval: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendConnectionRequest = async (recId) => {
    setLoading(true);
    try {
      const response = await axios.post(
        `http://localhost:8000/send_connection_request/?user_id=${userId}&target_user_id=${recId}`
      );
      alert("Connection request sent successfully");
    } catch (error) {
      alert("Failed to send connection request: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGetGroupChats = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:8000/get_group_chats/?user_id=${userId}`
      );
      setGroupChats(response.data);
    } catch (error) {
      alert("Failed to get group chats: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectGroupChat = async (groupId) => {
    setLoading(true);
    try {
      setSelectedGroupChat(groupId);
      const response = await axios.get(
        `http://localhost:8000/get_messages/?group_id=${groupId}`
      );
      setGroupChatMessages(response.data);
    } catch (error) {
      alert("Failed to load group chat messages: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // const handleSendMessage = async () => {
  //   if (!selectedGroupChat) {
  //     alert("Please select a group chat");
  //     return;
  //   }
  //   setLoading(true);
  //   try {
  //     await axios.post("http://localhost:8000/send_message/", {
  //       group_id: selectedGroupChat,
  //       message: messageInput,
  //     });
  //     setMessageInput("");
  //     await handleSelectGroupChat(selectedGroupChat);
  //   } catch (error) {
  //     alert("Failed to send message: " + error.message);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  return (
    <>
      <Navbar bg="dark" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand href="#">AI Social Platform</Navbar.Brand>
          <Nav className="ml-auto">
            {userId && (
              <Nav.Link onClick={() => setUserId(null)}>Logout</Nav.Link>
            )}
          </Nav>
        </Container>
      </Navbar>

      <Container className="mt-5">
        {loading && (
          <div className="text-center my-4">
            <Spinner animation="border" role="status">
              <span className="sr-only">Loading...</span>
            </Spinner>
          </div>
        )}
        {!userId ? (
          <Row>
            <Col md={{ span: 6, offset: 3 }}>
              <Card className="p-4">
                <h2 className="mb-4 text-center">Register</h2>
                <Form>
                  <Form.Group>
                    <Form.Control
                      type="text"
                      name="name"
                      value={userDetails.name}
                      onChange={handleInputChange}
                      placeholder="Name"
                    />
                  </Form.Group>
                  <Form.Group>
                    <Form.Control
                      type="email"
                      name="email"
                      value={userDetails.email}
                      onChange={handleInputChange}
                      placeholder="Email"
                    />
                  </Form.Group>
                  <Form.Group>
                    <Form.Control
                      type="password"
                      name="password"
                      value={userDetails.password}
                      onChange={handleInputChange}
                      placeholder="Password"
                    />
                  </Form.Group>
                  <Button variant="primary" onClick={handleRegister} block>
                    Register
                  </Button>
                </Form>
              </Card>

              <Card className="p-4 mt-4">
                <h2 className="mb-4 text-center">Login</h2>
                <Form>
                  <Form.Group>
                    <Form.Control
                      type="email"
                      name="email"
                      value={userDetails.email}
                      onChange={handleInputChange}
                      placeholder="Email"
                    />
                  </Form.Group>
                  <Form.Group>
                    <Form.Control
                      type="password"
                      name="password"
                      value={userDetails.password}
                      onChange={handleInputChange}
                      placeholder="Password"
                    />
                  </Form.Group>
                  <Button variant="success" onClick={handleLogin} block>
                    Login
                  </Button>
                </Form>
              </Card>
            </Col>
          </Row>
        ) : (
          <Row>
            <Col md={6}>
              <Card className="p-4 mb-4">
                <h4 className="mb-3">User Information</h4>
                <Form>
                  <Form.Group>
                    <Form.Control
                      type="text"
                      name="education"
                      value={userDetails.education}
                      onChange={handleInputChange}
                      placeholder="Education"
                    />
                  </Form.Group>
                  <Form.Group>
                    <Form.Control
                      type="text"
                      name="experience"
                      value={userDetails.experience}
                      onChange={handleInputChange}
                      placeholder="Experience"
                    />
                  </Form.Group>
                  <Form.Group>
                    <Form.Control
                      type="text"
                      name="goal"
                      value={userDetails.goal}
                      onChange={handleInputChange}
                      placeholder="Goal"
                    />
                  </Form.Group>
                  <Form.Group>
                    <Form.Control
                      type="text"
                      name="twitter_handle"
                      value={userDetails.twitter_handle}
                      onChange={handleInputChange}
                      placeholder="Twitter Handle"
                    />
                  </Form.Group>
                  <Form.Group controlId="formFile">
                    <Form.Label>Upload Document</Form.Label>
                    <Form.Control type="file" onChange={handleDocumentChange} />
                  </Form.Group>
                  <Button variant="warning" onClick={handleUpdate} block>
                    Update & Retrain AI Agent
                  </Button>
                </Form>
              </Card>

              <Card className="p-4 mb-4">
                <h4 className="mb-3">Recommendations</h4>
                {recommendations.map((rec) => (
                  <Alert variant="primary" key={rec.id}>
                    {rec.name} - {rec.details}{" "}
                    <Button
                      variant="success"
                      onClick={() => handleSendConnectionRequest(rec.id)}
                      size="sm"
                      className="ml-2"
                    >
                      Connect
                    </Button>
                  </Alert>
                ))}
              </Card>
            </Col>

            <Col md={6}>
              <Card className="p-4 mb-4">
                <h4 className="mb-3">Approval Requests</h4>
                {approvalRequests.map((req) => (
                  <Alert
                    variant={
                      req.status === "accepted"
                        ? "success"
                        : req.status === "denied"
                        ? "danger"
                        : "warning"
                    }
                    key={req.id}
                  >
                    Request from {req.sender_name}{" "}
                    <Button
                      variant="success"
                      onClick={() => handleApprovalAction(req.id, true)}
                      size="sm"
                      className="ml-2"
                    >
                      Approve
                    </Button>{" "}
                    <Button
                      variant="danger"
                      onClick={() => handleApprovalAction(req.id, false)}
                      size="sm"
                      className="ml-2"
                    >
                      Deny
                    </Button>
                  </Alert>
                ))}
              </Card>

              <Card className="p-4 mb-4">
                <h4 className="mb-3">Group Chats</h4>
                <Form.Control
                  as="select"
                  onChange={(e) => handleSelectGroupChat(e.target.value)}
                  value={selectedGroupChat || ""}
                >
                  <option>Select a Group Chat</option>
                  {groupChats.map((chat) => (
                    <option key={chat.id} value={chat.id}>
                      {chat.name}
                    </option>
                  ))}
                </Form.Control>

                {selectedGroupChat && (
                  <div className="mt-4">
                    <h5>Messages</h5>
                    <div
                      className="border p-3 mb-3"
                      style={{ height: "200px", overflowY: "auto" }}
                    >
                      {groupChatMessages.map((msg, idx) => (
                        <p key={idx}>
                          <strong>{msg.sender_name}:</strong> {msg.message}
                        </p>
                      ))}
                    </div>
                    <Form.Control
                      type="text"
                      placeholder="Type a message"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                    />
                    <Button
                      variant="primary"
                      onClick={handleSendMessage}
                      className="mt-3"
                    >
                      Send Message
                    </Button>
                  </div>
                )}
              </Card>

              <Card className="p-4">
            <h4>Chats</h4>
            {chats.map((chat) => (
              <Button
                key={chat.id}
                variant="outline-primary"
                onClick={() => setSelectedChatId(chat.id)}
                className="mb-2"
                block
              >
                {chat.chat_id
                }
              </Button>
            ))}
          </Card>
        </Col>
        <Col md={8}>
          {selectedChatId ? (
            <Card className="p-4">
              <h4>Chat Messages</h4>
              <div style={{ maxHeight: "400px", overflowY: "scroll" }}>
                {messages.map((message) => (
                  <Alert key={message.id} variant="light" className="my-1">
                    {message.content}
                  </Alert>
                ))}
              </div>
              <Form className="mt-3">
                <Form.Group>
                  <Form.Control
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Type a message..."
                  />
                </Form.Group>
                <Button variant="primary" onClick={handleSendMessage} block>
                  Send Message
                </Button>
              </Form>
            </Card>
          ) : (
            <Card className="p-4">
              <h4>Select a chat to start messaging</h4>
            </Card>
          )}
            </Col>
          </Row>
        )}
      </Container>
    </>
  );
};

export default App;
