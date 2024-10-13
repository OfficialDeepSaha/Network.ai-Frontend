import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ClipLoader } from 'react-spinners';

const TwitterCallback = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState('Processing...');
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleCallback = async () => {
      const queryParams = new URLSearchParams(window.location.search);
      const oauth_token = queryParams.get('oauth_token');
      const oauth_verifier = queryParams.get('oauth_verifier');

      if (!oauth_token || !oauth_verifier) {
        setStatus('Error: Missing OAuth parameters');
        setError('OAuth token or verifier is missing from the URL');
        return;
      }

      try {
        setStatus('Sending request to backend...');
        const response = await axios.get(`https://network-ai-backend.onrender.com/api/twitter/callback`, {
          params: { oauth_token, oauth_verifier }
        });

        const { access_token, user } = response.data;
        if (access_token && user) {
          setStatus('Registration successful! Redirecting...');
          localStorage.setItem('token', access_token);
          localStorage.setItem('user_id', user.id);
          setTimeout(() => navigate('/home'), 2000);
        } else {
          setStatus('Error: Unexpected response from server');
          setError('Server response did not include expected data');
        }
      } catch (error) {
        setStatus('Error during Twitter registration');
        setError(error.response ? error.response.data : error.message);
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      {/* <h1 className="text-2xl font-bold mb-4">Twitter Registration Callback</h1>
      <p className="text-lg mb-2">{status}</p>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{JSON.stringify(error)}</span>
        </div>
      )} */}
      <ClipLoader size={50}  color={"#4A90E2"}/>
    </div>
  );
};

export default TwitterCallback;



