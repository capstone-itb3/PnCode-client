import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast';
import './App.css';
import Room from './components/Room';
import SoloRoom from './components/room/SoloRoom';
import Signup from './components/Signup';
import Login from './components/Login';
import ProfLogin from './components/ProfLogin';
import Dashboard from './components/Dashboard';
import PageTeam from './components/dashboard/teampage/PageTeam';
import PageActivity from './components/dashboard/activitypage/PageActivity';
import FullView from './components/room/FullView';

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
      <Route path = '/team/:team_id' element={ <PageTeam/> }/>
      <Route path = '/activity/:activity_id' element={ <PageActivity/> }/>
      <Route path = '/room/:room_id/' element={ <Room/> }/>
      <Route path = '/solo/:room_id/' element={ <SoloRoom/> }/>
      <Route path = '/view/:room_id/:file_name' element={ <FullView/> }/>
    </Routes>
    </>
  )
}

export default App