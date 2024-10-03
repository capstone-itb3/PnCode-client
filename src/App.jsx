import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast';
import './App.css';
import AssignedRoom from './components/room/AssignedRoom';
import SoloRoom from './components/room/SoloRoom';
import Signup from './components/Signup';
import Login from './components/Login';
import ProfLogin from './components/ProfLogin';
import Dashboard from './components/Dashboard';
import PageTeam from './components/dashboard/teampage/PageTeam';
import PageActivity from './components/dashboard/activitypage/PageActivity';
import FullView from './components/room/FullView';
import NotFound from './components/NotFound';
import AdminLogin from './admin/AdminLogin';
import AdminDashboard from './admin/AdminDashboard';

function App() {

  return (
    <>
    <Toaster position='top-center'></Toaster>
    <Routes>
      <Route path = '/signup' element={ <Signup/> }/>
      <Route path = '/' element={ <Login/> }/>
      <Route path = '/login' element={ <Login/> }/>
      <Route path = '/login/professor' element={ <ProfLogin/> }/>
      <Route path = '/dashboard/' element={ <Dashboard/> }/>
      <Route path = '/dashboard/:class_id' element={ <Dashboard/> }/>
      <Route path = '/dashboard/:class_id/:select' element={ <Dashboard/> }/>
      <Route path = '/team/:team_id' element={ <PageTeam/> }/>
      <Route path = '/activity/:activity_id' element={ <PageActivity/> }/>
      <Route path = '/room/:room_id/' element={ <AssignedRoom/> }/>
      <Route path = '/solo/:room_id/' element={ <SoloRoom/> }/>
      <Route path = '/view/:room_id/:file_name' element={ <FullView/> }/>
      <Route path = '/error/404' element={ <NotFound/> }/>
      <Route path =  '/admin/login' element={ <AdminLogin/> }/>
      <Route path = '/admin/dashboard' element={ <AdminDashboard/> }/>
      <Route path = '/admin/dashboard/:collection' element={ <AdminDashboard/> }/>
      <Route path = '/admin/dashboard/:collection/:query' element={ <AdminDashboard/> }/>
      <Route path = '*' element={ <NotFound/> }/>
    </Routes>
    </>
  )
}

export default App