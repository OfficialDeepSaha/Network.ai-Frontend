import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaBook,
  FaGithub,
  FaGoogle,
  FaTwitter,
} from "react-icons/fa";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { toast } from "react-toastify";

const GITHUB_CLIENT_ID = "Ov23liql1prInLFdkg1q";

const Login = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [id]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); // Start loading

    const formBody = new URLSearchParams(); // Use URLSearchParams to encode form data
    formBody.append("username", formData.username);
    formBody.append("password", formData.password);

    try {
      const response = await fetch("https://network-ai-backend.onrender.com/token/", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded", // Set correct header for form data
        },
        body: formBody.toString(), // Convert URLSearchParams to string for the body
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("token", data.access_token);

        console.log("User loggedIn:", data);
        navigate("/home"); // Redirect to homepage
        toast.success("Login Successful 👍")
      } else {
        alert(data.detail || "Login failed");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred during login.");
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  const handleSuccess = async (response) => {
    const tokenId = response.credential;
    try {
      const res = await fetch(
        `https://network-ai-backend.onrender.com/google-login/?google_token=${tokenId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("token", data.access_token);
        navigate("/home");
        // Redirect or handle success
         toast.success("Login Successful 👍")
      } else {
        console.error("Login failed:", data.detail);
      }
    } catch (error) {
      console.error("Error during login:", error);
    }
  };

  const handleFailure = (error) => {
    console.error("Google Login Failed:", error);
  };

  const handleLogin = () => {
    const redirectUri = "http://localhost:5173/auth/github/callback"; // Update this URL if needed
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${redirectUri}&scope=read:user user:email`;

    // Redirect to GitHub OAuth page
    window.location.href = githubAuthUrl;
  };

  const handleTwitter = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        "https://network-ai-backend.onrender.com/api/twitter/register"
      );
      window.location.href = response.data.auth_url;
    } catch (error) {
      console.error("Error initiating Twitter registration:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center ">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        <motion.h2
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 120 }}
          className="text-4xl font-extrabold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
        >
          Welcome Back
        </motion.h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaEnvelope className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                id="username"
                className="block w-full pl-10 pr-3 py-2 border-2 border-gray-200 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-300 ease-in-out"
                placeholder="you@example.com"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>
          </motion.div>
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaLock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="password"
                id="password"
                className="block w-full pl-10 pr-3 py-2 border-2 border-gray-200 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-300 ease-in-out"
                placeholder="********"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-sm text-gray-700"
              >
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <a
                href="#"
                className="font-medium text-blue-600 hover:text-blue-500 transition duration-300 ease-in-out"
              >
                Forgot password?
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-300 ease-in-out transform hover:scale-105"
              disabled={isLoading}
            >
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-t-2 border-white border-solid rounded-full"
                />
              ) : (
                "Login"
              )}
            </button>
          </motion.div>
        </form>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-6"
        >
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                Or continue with
              </span>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-3 gap-3">
            <GoogleLogin
              onSuccess={handleSuccess}
              onError={handleFailure}
              render={({ onClick, disabled }) => (
                <motion.a
                  whileHover={{
                    scale: 1.05,
                    backgroundColor: "rgba(79, 70, 229, 0.1)",
                  }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClick}
                  disabled={disabled}
                  className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition duration-300 ease-in-out"
                >
                  <FaGoogle className="h-5 w-5 text-red-500" />
                </motion.a>
              )}
            />

            <motion.a
              whileHover={{
                scale: 1.05,
                backgroundColor: "rgba(79, 70, 229, 0.1)",
              }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogin}
              className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition duration-300 ease-in-out cursor-pointer"
            >
              <FaGithub className="h-5 w-5 text-gray-900" />
            </motion.a>

            <motion.a
              whileHover={{
                scale: 1.05,
                backgroundColor: "rgba(79, 70, 229, 0.1)",
              }}
              whileTap={{ scale: 0.95 }}
              onClick={handleTwitter}
              className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition duration-300 ease-in-out"
            >
              <FaTwitter className="h-5 w-5 text-blue-400" />
            </motion.a>
          </div>
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="mt-8 text-center text-sm text-gray-600"
        >
          Don't have an account?{" "}
          <a
            onClick={() => navigate("/register")}
            className="font-medium text-indigo-600 hover:text-indigo-500 transition duration-300 ease-in-out"
          >
            Sign up
          </a>
        </motion.p>
      </motion.div>
    </div>
  );
};

export default Login;
