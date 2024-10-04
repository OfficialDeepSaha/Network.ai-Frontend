import React from 'react'
import {BrowserRouter as Router , Routes , Route } from 'react-router-dom'
import Test2  from './Test2.jsx'
import LandingPage from './LandingPage.jsx'
import Test1 from './Test1.jsx'
import Dashboard from './Dashboard.jsx'


const Active = () => {


  return (
<Router>

    <Routes>

        <Route path='/register' element={<Test2/>} />
        <Route exact path='/' element={<LandingPage/>}  />
        <Route path='/home' element={<Dashboard/>} />
        <Route path='/test' element={<Test1/>} />
    </Routes>
</Router>
    
   
  )
}

export default Active;
