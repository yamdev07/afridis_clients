import React from 'react'
import Home from './Pages/Home'
import FAQ from './Pages/FAQ'
import Contact from './Pages/Contact'
import Dashboard from './Pages/Dashboard'
import Clients from './Pages/Clients'
import Services from './Pages/Services'
import Rapports from './Pages/Rapports'
import Import from './Pages/Import'
import Export from './Pages/Export'
import Login from './Pages/Login'
import Profile from './Pages/Profile'
import AdminUsers from './Pages/AdminUsers'
import PrivacyPolicy from './Pages/PrivacyPolicy'
import SecurityTerms from './Pages/SecurityTerms'
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import { useSessionTimeout } from './hooks/useSessionTimeout'
import { SessionTimeoutModal } from './components/SessionTimeoutModal'

function AppContent() {
  const { showWarning, timeRemaining, handleAcceptSession, handleDeclineSession } = useSessionTimeout();

  return (
    <>
      <SessionTimeoutModal
        isOpen={showWarning}
        timeRemaining={timeRemaining}
        onStayConnected={handleAcceptSession}
        onLogout={handleDeclineSession}
      />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/auth" element={<Navigate to="/login" replace />} />
        <Route path="/register" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/security-terms" element={<SecurityTerms />} />
        <Route path='/dashboard' element={<Dashboard />} />
        <Route path='/clients' element={<Clients />} />
        <Route path='/services' element={<Services />} />
        <Route path='/reports' element={<Rapports />} />
        <Route path='/import' element={<Import />} />
        <Route path='/export' element={<Export />} />
        <Route path='/profile' element={<Profile />} />
        <Route path='/admin/users' element={<AdminUsers />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <div className="transition-colors duration-300">
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </div>
  )
}

export default App;
