import React from 'react'
import Login from './Login';
import './Header.css'
import { GoogleOAuthProvider } from "@react-oauth/google";

const LoginFinal = () => {
  
    const clientId = '1034870438738-phohfef9ria0c7j2dsp296irsnaqlmt3.apps.googleusercontent.com';
  return (
    <div className="bg-gradient-to-b from-blue-50 via-white to-indigo-50 group/design-root overflow-x-hidden">
      <><header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#e7eef4] px-10 py-4">
      <div className="flex items-center gap-8 " style={{ marginLeft: '290px' }}>
        <div className="flex items-center gap-4 text-[#0d151c]">
          <div className="size-4">
            <svg
              className="bouncing-svg"
              viewBox="0 0 48 48"
              width={26}
              height={26}
              style={{marginTop:"-4px"}}
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
                fill="url(#gradientColors)" />
            </svg>
          </div>
          <div className="flex items-center text-indigo-800">
            <span className="animate-colorPulse h-6 w-auto text-indigo-600 sm:h-8" />
            <h2 className="animate-colorPulse text-2xl bg-gradient-to-r from-purple-500 to-indigo-600 font-semibold">Network.ai</h2>
          </div>
        </div>
      </div>
   
    </header></>
      <GoogleOAuthProvider clientId={clientId}>
      
      <Login/>
      
      </GoogleOAuthProvider>
    </div>
  )
}

export default LoginFinal;