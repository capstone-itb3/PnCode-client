import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast';
import './App.css';
import Room from './components/Room';
import Signup from './components/Signup';
import Login from './components/Login';
import ProfLogin from './components/ProfLogin';
import Dashboard from './components/Dashboard';

function App() {

  return (
    <>
    <Toaster position='top-center'></Toaster>
    <Routes>
      <Route path = '/' element={ <Signup/> }/>
      <Route path = '/signup' element={ <Signup/> }/>
      <Route path = '/login' element={ <Login/> }/>
      <Route path = '/login/professor' element={ <ProfLogin/> }/>
      <Route path = '/dashboard/' element={ <Dashboard/> }/>
      <Route path = '/dashboard/:course' element={ <Dashboard/> }/>
      <Route path = '/dashboard/:course/:select' element={ <Dashboard/> }/>
      <Route path = '/dashboard/:course/:section' element={ <Dashboard/> }/>
      <Route path = '/dashboard/:course/:section/:select' element={ <Dashboard/> }/>
      <Route path = '/:room_type/:room_id' element={ <Room/> }/>
      <Route path = '/:room_type/:room_id' element={ <Room/> }/>
    </Routes>
    </>
  )
}

export default App