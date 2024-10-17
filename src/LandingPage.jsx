import React, { useEffect, useState } from "react";
import { FaRobot, FaUsers, FaChartLine, FaFacebookF, FaTwitter, FaLinkedinIn, FaInstagram, FaBars, FaTimes, FaQuoteLeft, FaQuoteRight, FaComments, FaUserFriends } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { GiRobotAntennas } from "react-icons/gi";
import { GrRobot } from "react-icons/gr";
import { PiRobotBold } from "react-icons/pi";
import { LiaRobotSolid } from "react-icons/lia";
import { BsRobot } from "react-icons/bs";
import './LandingPage.scss';

const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [stars, setStars] = useState([]);
  const [asteroids, setAsteroids] = useState([]);

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

  useEffect(() => {
    setIsVisible(true);
  }, []);



  useEffect(() => {
    const generateStars = () => {
      const newStars = [];
      for (let i = 0; i < 1000; i++) {
        newStars.push({
          id: i,
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          size: Math.random() * 3 + 1,
          animationDuration: `${Math.random() * 5 + 2}s`,
        });
      }
      setStars(newStars);
    };

    const generateAsteroids = () => {
      const newAsteroids = [];
      for (let i = 0; i < 200; i++) {
        newAsteroids.push({
          id: i,
          top: `${Math.random() * 100}%`,
          left: `${Math.random() * 100}%`,
          size: Math.random() * 5 + 2,
          animationDuration: `${Math.random() * 300 + 200}s`,
          rotationSpeed: Math.random() * 720 + 360,
          direction: Math.random() < 0.5 ? -1 : 1,
        });
      }
      setAsteroids(newAsteroids);
    };

    generateStars();
    generateAsteroids();
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

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-indigo-900 to-black text-white overflow-hidden shadow-xl">



 {/* Background Animation */}
 <div className="absolute inset-0 overflow-hidden">
        {stars.map((star) => (
          <div
            key={star.id}
            className="absolute rounded-full"
            style={{
              left: star.left,
              top: star.top,
              width: `${star.size}px`,
              height: `${star.size}px`,
              background: `radial-gradient(circle at center, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)`,
              animation: `twinkle ${star.animationDuration} infinite`,
            }}
          ></div>
        ))}
        {asteroids.map((asteroid) => (
          <div
            key={asteroid.id}
            className="absolute bg-gradient-to-br from-gray-300 to-gray-500 rounded-full"
            style={{
              top: asteroid.top,
              left: asteroid.left,
              width: `${asteroid.size}px`,
              height: `${asteroid.size}px`,
              animation: `moveAsteroid ${asteroid.animationDuration} linear infinite, rotate ${asteroid.rotationSpeed}s linear infinite`,
              transform: `translateX(${asteroid.direction * 100}vw)`,
            }}
          ></div>
        ))}
      </div>


      <div className="meteor-1"></div>
      <div className="meteor-2"></div>
      <div className="meteor-3"></div>
      <div className="meteor-4"></div>
      <div className="meteor-5"></div>
      <div className="meteor-6"></div>
      <div className="meteor-7"></div>
      <div className="meteor-8"></div>
      <div className="meteor-9"></div>
      <div className="meteor-10"></div>
      <div className="meteor-11"></div>
      <div className="meteor-12"></div>
      <div className="meteor-13"></div>
      <div className="meteor-14"></div>
      <div className="meteor-15"></div>


      


    <header className="container mx-auto px-4 py-8 flex justify-between items-center">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        transition={{ duration: 0.5 }}
        className="flex items-center space-x-3"
      >
        <div className="relative">
            <BsRobot className="text-4xl text-yellow-400" />
            <div className="absolute -top-2 left-3  w-3 h-3 bg-green-500 rounded-full animate-pulse" ></div>
          </div>

         
        <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500">Network.ai</h1>
      </motion.div>
      <nav className="flex-grow">
        <motion.ul
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ duration: 0.5, staggerChildren: 0.1 }}
          className="flex justify-center space-x-6"
        >
          {["Home", "Features", "About", "Contact"].map((item) => (
            <motion.li key={item} variants={fadeIn}>
              <a
                href="#"
                className="hover:text-yellow-300 transition duration-300 border-b-2 border-transparent hover:border-yellow-300"
              >
                {item}
              </a>
            </motion.li>
          ))}
        </motion.ul>
      </nav>
      <motion.button
          whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(255, 255, 255, 0.5)" }}
          whileTap={{ scale: 0.95 }}
          className="font-bold shadow-lg bg-gradient-to-r from-pink-400 to-purple-500 text-white px-6 py-2 rounded-full hover:shadow-lg transition-all duration-300 transform hover:scale-105"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          onClick={()=> navigate('/register')}
        >
          Get Started
        </motion.button>
    </header>
      {/* Body */}
      <main className="container mx-auto px-4 py-16">
      <motion.section
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
          variants={fadeIn}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-6xl md:text-8xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500">
            Connect Smarter with <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-600 font-extrabold">AI</span>
          </h2>
          <p className="text-2xl md:text-3xl mb-8 text-gray-300">
            Automate your networking based on shared interests and goals
          </p>
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(255, 255, 255, 0.5)" }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-yellow-400 to-pink-500 text-indigo-900 font-bold py-4 px-10 rounded-full transition duration-300 shadow-lg text-xl transform transition transform duration-200 hover:-translate-y-1 transform transition hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 animate-pulse "
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            aria-label="Get Started"
            onClick={()=> navigate('/register')}
          >
            Join Network
          </motion.button>
        </motion.section>
        <section className="mb-20">
          <motion.h2 
            className="text-4xl md:text-6xl font-bold mb-16 text-center bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-pink-500"
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
            className="text-4xl md:text-6xl font-bold mb-16 text-center bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-pink-600"
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
      <footer className="bg-indigo-900 py-8 text-white py-12">
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
            <p>&copy; 2024 <span className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500">Network.ai</span>. All rights reserved.</p>
          </motion.div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
