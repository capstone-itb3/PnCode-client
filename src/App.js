import React from 'react'
import { Routes, Route} from 'react-router-dom'
import { Toaster } from 'react-hot-toast';
import './App.css';
import JoinRoom from './components/JoinRoom.js';
import Room from './components/Room.js';
import Signup from './components/Signup.js';
import Login from './components/Login.js';

function App() {
  return (
    <>
    <Toaster position='top-right'></Toaster>
    <Routes>
      <Route path = '/' element={ <Signup/> }/>
      <Route path = '/signup' element={ <Signup/> }/>
      <Route path = '/login' element={ <Login/> }/>
      <Route path = '/join-room' element={ <JoinRoom/> }/>
      <Route path = '/room/:room_id' element={ <Room/> }/>
    </Routes>
    </>
  )
}

export default App