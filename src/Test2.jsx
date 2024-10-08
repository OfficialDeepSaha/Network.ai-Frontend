import React, { useState } from "react";
import PersonalInfo from "./PersonalInfo";
import { Header } from "./Header";
import { GoogleOAuthProvider } from "@react-oauth/google";

const Test2 = () => {
  const clientId = '1034870438738-phohfef9ria0c7j2dsp296irsnaqlmt3.apps.googleusercontent.com';
  return (
    <div className="bg-gradient-to-b from-blue-50 via-white to-indigo-50 group/design-root overflow-x-hidden">
      <Header />
      <GoogleOAuthProvider clientId={clientId}>

      <PersonalInfo />
      </GoogleOAuthProvider>
    </div>
  );
};

export default Test2;
