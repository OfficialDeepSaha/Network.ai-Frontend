import React, { useEffect, useState } from "react";
import { FaRobot, FaUsers, FaChartLine, FaFacebookF, FaTwitter, FaLinkedinIn, FaInstagram, FaBars, FaTimes, FaQuoteLeft, FaQuoteRight, FaComments, FaUserFriends } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.pageYOffset);
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };


  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const pulseAnimation = {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      repeatType: "reverse"
    }
  };

  return (
    <div className="font-sans bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Header */}
      <header className="bg-white shadow-md fixed top-0 left-0 right-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center"
          >
            
            <div className="size-4 mr-3">
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
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">Network.ai</span>
            </motion.div>
          </div>
          <nav className="hidden md:flex space-x-6">
            <a href="#" className="text-gray-700 hover:text-blue-600 transition duration-300" onClick={()=> navigate('/register')}>Register</a>
            <a href="#" className="text-gray-700 hover:text-blue-600 transition duration-300">Features</a>
            <a href="#" className="text-gray-700 hover:text-blue-600 transition duration-300">Testimonials</a>
            <a href="#" className="text-gray-700 hover:text-blue-600 transition duration-300">Contact</a>
          </nav>
          <button className="md:hidden text-gray-700" onClick={toggleMenu}>
            {isMenuOpen ? <FaTimes className="text-2xl" /> : <FaBars className="text-2xl" />}
          </button>
        </div>
        {isMenuOpen && (
          <div className="md:hidden bg-white py-4">
            <nav className="flex flex-col space-y-4 items-center">
              <a href="#" className="text-gray-700 hover:text-blue-600 transition duration-300">Home</a>
              <a href="#" className="text-gray-700 hover:text-blue-600 transition duration-300">Features</a>
              <a href="#" className="text-gray-700 hover:text-blue-600 transition duration-300">Testimonials</a>
              <a href="#" className="text-gray-700 hover:text-blue-600 transition duration-300">Contact</a>
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <div className="pt-16"> 
        <div className="relative h-screen bg-cover bg-center overflow-hidden" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80')" }}>
          <div className="absolute inset-0 bg-black opacity-70"></div>
          <motion.div 
            className="relative z-10 flex flex-col items-center justify-center h-full text-white"
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
          >
            <motion.h1 
              className="text-5xl md:text-7xl font-bold mb-4 text-center leading-tight"
              animate={pulseAnimation}
            >
              Unleash the power of <br/><span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">AI networking!</span>
            </motion.h1>
            <p className="text-xl md:text-2xl mb-8 text-center">Connect with like-minded individuals effortlessly</p>
            <motion.button 
              className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold py-3 px-8 rounded-full transition duration-300 transform hover:scale-105 hover:shadow-lg"
              whileHover={{ scale: 1.05, boxShadow: "0px 0px 8px rgb(59, 130, 246)" }}
              whileTap={{ scale: 0.95 }}
            >
              Get Started
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* Body */}
      <main className="container mx-auto px-4 py-16">
        <section className="mb-20">
          <motion.h2 
            className="text-4xl md:text-6xl font-bold mb-16 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            How It Works
          </motion.h2>
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-12"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {[
              { icon: FaRobot, title: "AI-Powered Matching", description: "Our advanced AI algorithms connect you with the perfect networking partners based on your interests and goals.", image: "https://images.unsplash.com/photo-1565688534245-05d6b5be184a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" },
              { icon: FaUsers, title: "Shared Interests", description: "Discover and connect with people who share your passions and professional aspirations.", image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" },
              { icon: FaChartLine, title: "Goal-Oriented Networking", description: "Achieve your personal and professional goals faster by connecting with the right people.", image: "https://images.unsplash.com/photo-1552581234-26160f608093?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" }
            ].map((item, index) => (
              <motion.div 
                key={item.title}
                className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-2xl shadow-2xl transition duration-300 transform hover:scale-105 hover:shadow-3xl relative overflow-hidden group"
                variants={fadeInUp}
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-purple-400"></div>
                <motion.img 
                  src={item.image} 
                  alt={item.title} 
                  className="w-full h-48 object-cover rounded-xl mb-6 shadow-lg transition duration-300 transform group-hover:scale-105" 
                  whileHover={{ scale: 1.05 }}
                />
                <motion.div
                  className="text-6xl text-blue-400 mb-6 mx-auto transition-all duration-300 transform group-hover:scale-110 group-hover:rotate-12"
                  whileHover={{ rotate: 360, transition: { duration: 0.5 } }}
                >
                  <item.icon className="text-5xl text-blue-600 mb-4 mx-auto"/>
                </motion.div>
                <h3 className="text-2xl font-semibold mb-4 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">{item.title}</h3>
                <p className="text-gray-300 text-center">{item.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        <section className="mb-20 bg-gradient-to-br from-gray-800 to-gray-900 p-12 rounded-3xl shadow-2xl">
          <motion.h2 
            className="text-4xl md:text-6xl font-bold mb-16 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            What Our Users Say
          </motion.h2>
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 gap-12"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {[
              { name: "Sarah Johnson", role: "Marketing Executive", image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60", quote: "This platform has revolutionized my networking experience. I've made valuable connections that have propelled my career forward!" },
              { name: "Michael Chen", role: "Tech Entrepreneur", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60", quote: "The AI-driven matching is incredibly accurate. I've found mentors and collaborators who perfectly align with my goals." }
            ].map((testimonial, index) => (
              <motion.div 
                key={testimonial.name}
                className="bg-gradient-to-br from-gray-700 to-gray-800 p-8 rounded-2xl shadow-xl relative group hover:shadow-2xl transition duration-300"
                variants={fadeInUp}
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-purple-400"></div>
                <div className="flex items-center mb-6">
                  <motion.img 
                    src={testimonial.image} 
                    alt={testimonial.name} 
                    className="w-20 h-20 rounded-full mr-4 object-cover border-4 border-blue-400 transition duration-300 group-hover:border-purple-400" 
                    whileHover={{ scale: 1.1 }}
                  />
                  <div>
                    <h3 className="text-xl font-semibold text-blue-400 group-hover:text-purple-400 transition duration-300">{testimonial.name}</h3>
                    <p className="text-gray-400">{testimonial.role}</p>
                  </div>
                </div>
                <div className="relative">
                  <FaQuoteLeft className="absolute top-0 left-0 text-3xl text-blue-400 opacity-50 group-hover:text-purple-400 transition duration-300" />
                  <p className="text-gray-300 italic mb-4 pl-10 pr-10">"{testimonial.quote}"</p>
                  <FaQuoteRight className="absolute bottom-0 right-0 text-3xl text-blue-400 opacity-50 group-hover:text-purple-400 transition duration-300" />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        <section className="mb-20">
          <motion.h2 
            className="text-4xl md:text-6xl font-bold mb-16 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Features
          </motion.h2>
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 gap-12"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {[
              { title: "Advanced Chat System", description: "Engage in meaningful conversations with our state-of-the-art chat interface.", image: "https://images.unsplash.com/photo-1611746872915-64382b5c76da?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60", icon: FaComments },
              { title: "Auto-Initiated Group Networking", description: "Our AI automatically creates and suggests relevant networking groups based on your profile and interests.", image: "https://images.unsplash.com/photo-1556761175-b413da4baf72?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60", icon: FaUserFriends }
            ].map((feature, index) => (
              <motion.div 
                key={feature.title}
                className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-2xl shadow-2xl overflow-hidden relative group hover:shadow-3xl transition duration-300"
                variants={fadeInUp}
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-purple-400"></div>
                <motion.img 
                  src={feature.image} 
                  alt={feature.title} 
                  className="w-full h-64 object-cover rounded-xl mb-6 shadow-lg transition duration-300 transform group-hover:scale-105" 
                  whileHover={{ scale: 1.05 }}
                />
                <motion.div
                  className="text-6xl text-blue-400 mb-6 mx-auto transition-all duration-300 transform group-hover:scale-110 group-hover:rotate-12"
                  whileHover={{ rotate: 360, transition: { duration: 0.5 } }}
                >
                  <feature.icon  className="text-5xl mb-4 mx-2"/>
                </motion.div>
                <h3 className="text-2xl font-semibold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 group-hover:from-purple-400 group-hover:to-blue-400 transition duration-300">{feature.title}</h3>
                <p className="text-gray-300 group-hover:text-gray-200 transition duration-300">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        <motion.section 
          className="text-center bg-gradient-to-br from-gray-800 to-gray-900 p-12 rounded-3xl shadow-2xl"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-4xl md:text-6xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">Ready to Transform Your Network?</h2>
          <p className="text-xl text-gray-300 mb-8">Join our AI-powered networking platform and unlock endless possibilities!</p>
          <motion.button 
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold py-4 px-10 rounded-full text-xl transition duration-300 transform hover:scale-105 hover:shadow-lg"
            whileHover={{ scale: 1.05, boxShadow: "0px 0px 15px rgb(59, 130, 246)" }}
            whileTap={{ scale: 0.95 }}
          >
            Join Now
          </motion.button>
        </motion.section>
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-900 to-black text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <motion.div 
              className="mb-8 md:mb-0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="text-2xl font-bold mb-4">Stay Connected</h3>
              <div className="flex space-x-4">
                {[FaFacebookF, FaTwitter, FaLinkedinIn, FaInstagram].map((Icon, index) => (
                  <motion.a 
                    key={index}
                    href="#" 
                    className="text-2xl hover:text-blue-400 transition duration-300"
                    whileHover={{ scale: 1.2, rotate: 5 }}
                  >
                    <Icon />
                  </motion.a>
                ))}
              </div>
            </motion.div>
            <motion.div 
              className="w-full md:w-1/3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h3 className="text-2xl font-bold mb-4">Subscribe for Updates</h3>
              <form className="flex">
                <input type="email" placeholder="Enter your email" className="flex-grow p-2 rounded-l-full focus:outline-none focus:ring-2 focus:ring-blue-600 text-black" />
                <motion.button 
                  type="submit" 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold py-2 px-4 rounded-r-full transition duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Subscribe
                </motion.button>
              </form>
            </motion.div>
          </div>
          <motion.div 
            className="mt-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <p>&copy; 2024 Network.ai. All rights reserved.</p>
          </motion.div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
