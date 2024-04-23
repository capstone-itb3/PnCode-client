import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast';
import './App.css';
import Room from './components/Room.js';
import Signup from './components/Signup.js';
import Login from './components/Login.js';
import Dashboard from './components/Dashboard.js';

function App() {

  return (
    <>
    <Toaster position='top-center'></Toaster>
    <Routes>
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