import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast';
import './App.css';
import Room from './components/Room';
import Signup from './components/Signup';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
// import Yjstest from './yjstest';

function App() {

  return (
    <>
    <Toaster position='top-center'></Toaster>
    <Routes>
      {/* <Route path = '/test' element={ <Yjstest /> }/> */}
      <Route path = '/' element={ <Signup/> }/>
      <Route path = '/signup' element={ <Signup/> }/>
      <Route path = '/login' element={ <Login/> }/>
      <Route path = '/dashboard' element={ <Dashboard/> }/>
      <Route path = '/dashboard/:select' element={ <Dashboard/> }/>
      <Route path = '/room/:room_id' element={ <Room/> }/>
    </Routes>
    </>
  )
}

export default App