import React from 'react'
import Home from './Pages/Home'
import FAQ from './Pages/FAQ'
import Contact from './Pages/Contact'
import Auth from './Pages/Authentification'
import './index.css'
import Dashboard from './Pages/Dashboard'
import Clients from './Pages/Clients'
import Services from './Pages/Services'
import Rapports from './Pages/Rapports'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

function App() {

  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/auth" element={<Auth />} />
          <Route path='/dashboard' element={<Dashboard />} />
          <Route path='/clients' element={<Clients/>}/>
          <Route path='/services' element={<Services/>}/>
          <Route path='/reports' element={<Rapports/>}/>
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App;
