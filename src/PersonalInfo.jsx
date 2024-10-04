import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const PersonalInfo = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    bio: ""
  });
  const [loading, setLoading] = useState(false); // Loader state
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Start loading

    try {
      const response = await fetch("http://127.0.0.1:8000/register/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("token", data.access_token);
      
        console.log("User registered:", data);
        navigate("/"); // Redirect to homepage
      } else {
        alert(data.detail || "Registration failed");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred during registration.");
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <form className="animate-fadeIn" onSubmit={handleSubmit}>
      <h3 className="text-xl font-semibold mb-6 text-gray-700">Personal Information</h3>

      <div className="mb-6">
        <label className="block text-gray-600 font-medium">Full Name</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="mt-2 p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-indigo-400 transition duration-300"
          placeholder="Enter your full name"
          required
        />
      </div>

      <div className="mb-6">
        <label className="block text-gray-600 font-medium">Email Address</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="mt-2 p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-indigo-400 transition duration-300"
          placeholder="Enter your Email"
          required
        />
      </div>

      <div className="mb-6">
        <label className="block text-gray-600 font-medium">Password</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          className="mt-2 p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-indigo-400 transition duration-300"
          placeholder="Enter your Password"
          required
        />
      </div>

      <div className="mb-6">
        <label className="block text-gray-600 font-medium">Bio</label>
        <input
          type="text"
          name="bio"
          value={formData.bio}
          onChange={handleChange}
          className="mt-2 p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-indigo-400 transition duration-300"
          placeholder="Enter your Bio"
        />
      </div>

      <button
        type="submit"
        className={`w-full py-3 rounded-lg mt-4 font-semibold transition duration-300 ease-in-out shadow-md ${
          loading ? "bg-gray-400" : "bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:scale-105"
        }`}
        disabled={loading} // Disable button while loading
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <div className="loader"></div> {/* Loader element */}
            <span className="ml-2">Loading...</span>
          </div>
        ) : (
          "Submit"
        )}
      </button>

      <style jsx>{`
        .loader {
          border: 4px solid transparent;
          border-top: 4px solid white; /* Loader color */
          border-radius: 50%;
          width: 24px;
          height: 24px;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </form>
  );
};

export default PersonalInfo;
