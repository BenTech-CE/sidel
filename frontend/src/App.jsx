import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login'; 
import RealTime from './pages/RealTime'; 

function App() {
  return (
    <BrowserRouter>
      <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/RealTime" element={<RealTime />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;