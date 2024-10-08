import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const GitHubCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Parse the authorization code from URL parameters
    const queryParams = new URLSearchParams(window.location.search);
    const code = queryParams.get('code');
  
    if (code) {
      // Exchange the authorization code for a JWT token from the backend
      fetch(`http://127.0.0.1:8000/auth/github?code=${code}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        if (data.access_token) {
          localStorage.setItem('token', data.access_token);
          localStorage.setItem('user_id', data.user_id); // Add this
          navigate('/home');
        } else {
          console.error('Login failed:', data);
        }
      })
      .catch((error) => {
        console.error('Error during GitHub login:', error);
      });
    }
  }, [navigate]);

  return <div>Loading...</div>;
};

export default GitHubCallback;
