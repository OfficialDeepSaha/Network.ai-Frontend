import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const GitHubCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const code = queryParams.get('code');
  
    if (code) {
      // Exchange the authorization code for a JWT token from the backend
      fetch(`https://network-ai-backend.onrender.com/auth/github/register?code=${code}`, {
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
          localStorage.setItem('user_id', data.user_id);
          navigate('/home');
        } else {
          console.error('Registration failed:', data);
        }
      })
      .catch((error) => {
        console.error('Error during GitHub registration:', error);
      });
    } else {
      console.error('Authorization code not found');
    }
  }, [navigate]);

  return <div>Registering...</div>;
};

export default GitHubCallback;
