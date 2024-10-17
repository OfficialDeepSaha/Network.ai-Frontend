import React from 'react'
import {BrowserRouter as Router , Routes , Route } from 'react-router-dom'
import Test2  from './Test2.jsx'
import LandingPage from './LandingPage.jsx'
import Test1 from './Test1.jsx'
import Dashboard from './Dashboard.jsx'
import GitHubCallback from './GitHubCallback.jsx'
import TwitterCallback from './TwitterCallback.jsx'
import LoginFinal from './LoginFinal.jsx'
import { ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Active = () => {


  return (
<Router>

    <Routes>

        <Route path='/register' element={<Test2/>} />
        <Route exact path='/' element={<LandingPage/>}  />
        <Route path='/home' element={<Dashboard/>} />
        <Route path="/auth/github/callback" element={<GitHubCallback />} />
        <Route path="/auth/twitter/callback" element={<TwitterCallback/>} />
        <Route path='/test' element={<Test1/>} />
        <Route path='/login' element={<LoginFinal/>} />
    </Routes>
  <ToastContainer />
</Router>
    
   
  )
}

export default Active;
