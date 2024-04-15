import React from 'react'
import { Routes, Route} from 'react-router-dom'
import './App.css'
import JoinRoom from './components/JoinRoom.js'
import Room from './components/Room.js'
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <>
    <Toaster position='top-right'></Toaster>
    <Routes>
      <Route path = '/' element={ <JoinRoom/> }/>
      <Route path = '/editor/:room_id' element={ <Room/> }/>
    </Routes>
    </>
  )
}

export default App