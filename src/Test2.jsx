import React, { useState } from "react";
import PersonalInfo from "./PersonalInfo";
import { Header } from "./Header";


const Test2 = () => {

  return (
    <div className="bg-gradient-to-b from-blue-50 via-white to-indigo-50 group/design-root overflow-x-hidden">
    <Header/>
    
    <div className="relative flex size-full min-h-screen bg-gradient-to-b from-blue-50 via-white to-indigo-50 group/design-root overflow-x-hidden justify-center items-center p-6">
      <div className="w-full max-w-lg">
        <div className="bg-white p-10 rounded-xl shadow-lg transform transition-all duration-500 hover:shadow-2xl">
         
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
            Registration Form
          </h2>
          <PersonalInfo/>
          
          
          </div>
      </div>
    </div>
    </div>
  );
};

export default Test2;
