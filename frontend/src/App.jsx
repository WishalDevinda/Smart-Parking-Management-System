import React from 'react'
import { Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom'
import LoginPage from './pages/Login.jsx'
import DashboardPage from './pages/Dashboard.jsx'
import AnalysisPage from './pages/Analysis.jsx'
import LiveSlotPage from './pages/LiveSlot.jsx'

const Header = () => {
  const navigate = useNavigate()
  const token = localStorage.getItem('token')
  const logout = () => { localStorage.removeItem('token'); navigate('/login') }
  return (
    <div className="header">
       <img src="/logo.jpg" alt="AutoSlot logo" style={{ height: 32 }} />
      <div style={{fontWeight:'700'}}> AutoSlot</div>
      <div className="tabs" style={{flex:1}}>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/analysis">Analysis</Link>
        <Link to="/live">Live slot</Link>
      </div>
      <div>System Administrator</div>
      {token && <button className="btn accent" onClick={logout}>Logout</button>}
    </div>
  )
}

const Protected = ({ children }) => {
  const token = localStorage.getItem('token')
  return token ? children : <Navigate to="/login" replace />
}

export default function App(){
  return (
    <>
      <Header/>
      <div className="page">
        <Routes>
          <Route path="/login" element={<LoginPage/>} />
          <Route path="/dashboard" element={<Protected><DashboardPage/></Protected>} />
          <Route path="/analysis" element={<Protected><AnalysisPage/></Protected>} />
          <Route path="/live" element={<Protected><LiveSlotPage/></Protected>} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </>
  )
}
