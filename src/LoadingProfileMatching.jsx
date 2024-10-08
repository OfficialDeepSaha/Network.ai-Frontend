import React from 'react';
import { motion } from 'framer-motion';
import { FaRobot, FaUserFriends } from 'react-icons/fa';

const LoadingProfileMatching = ({ matchingProgress }) => (
  <section className="p-6 bg-white rounded-2xl shadow-xl m-4 overflow-hidden relative flex flex-col items-center">
    <motion.div
      className="flex items-center justify-center mb-8"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      
      <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mr-4">
        AI Profile Matching
      </h2>
      
    </motion.div>

    <motion.div
      className="w-full max-w-2xl bg-gradient-to-r from-blue-100 to-purple-100 p-6 rounded-3xl shadow-lg"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex justify-center items-center mb-6">
        <motion.div
          className="w-40 h-40 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-xl"
          animate={{ scale: [1, 1.1, 1], rotate: [0, 360] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <FaUserFriends className="text-white text-5xl" />
        </motion.div>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-lg font-semibold text-gray-700 mb-2">Profile Matching Progress</p>
          <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
              style={{ width: `${matchingProgress}%` }}
              animate={{ width: `${matchingProgress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        <div className="flex justify-between text-sm font-medium text-gray-600">
          <motion.span
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            Analyzing Profile
          </motion.span>
          <motion.span
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
          >
            Finding Matches
          </motion.span>
          <motion.span
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 1 }}
          >
            Generating Recommendations
          </motion.span>
        </div>

        <motion.div
          className="flex justify-center space-x-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className="w-3 h-3 bg-blue-500 rounded-full"
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </motion.div>

        <p className="text-center text-lg text-gray-700">
          AI is working its magic to find your perfect professional matches!
        </p>
      </div>
    </motion.div>

    <motion.div
      className="mt-6 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.5, duration: 0.5 }}
    />

    <motion.div
      className="absolute -bottom-16 -right-16 w-64 h-64 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full opacity-50 blur-3xl"
      animate={{ rotate: 360 }}
      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
    />
    <motion.div
      className="absolute -top-16 -left-16 w-64 h-64 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full opacity-50 blur-3xl"
      animate={{ rotate: -360 }}
      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
    />
  </section>
);

export default LoadingProfileMatching;