import React, { useState } from "react";
import axios from "axios";

function Profile() {
  const [formData, setFormData] = useState({
    name: "",
    about: "",
    interests: "",
    goals: "",
    skills: "",
    experience: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      const response = await axios.post(
        "http://localhost:8000/users/train",
        formData
      );
      console.log(response.data);
      alert(response.data.message);
    } catch (error) {
      console.error("Error training AI", error);
    }
  };

  return (
    <div>
      <h2>Profile Information</h2>
      <form>
        <div>
          <label>Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label>About</label>
          <textarea
            name="about"
            value={formData.about}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label>Interests</label>
          <textarea
            name="interests"
            value={formData.interests}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label>Goals</label>
          <textarea
            name="goals"
            value={formData.goals}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label>Skills</label>
          <textarea
            name="skills"
            value={formData.skills}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label>Experience</label>
          <textarea
            name="experience"
            value={formData.experience}
            onChange={handleInputChange}
          />
        </div>
        <button type="button" onClick={handleSubmit}>
          Train AI Agent
        </button>
      </form>

      
    </div>
  );
}

export default Profile;
