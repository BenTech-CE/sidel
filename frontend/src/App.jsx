import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Login from './pages/Login';
import RealTime from './pages/RealTime';
import IndividualAlert from './pages/IndividualAlert';
import Settings from './pages/Settings';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';

import './styles/global.css';
import SocketProvider from './context/SocketContext';

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />

            <Route
              path="/realtime"
              element={
                <ProtectedRoute>
                  <RealTime />
                </ProtectedRoute>
              }
            />

            <Route
              path="/individualalert/:id"
              element={
                <ProtectedRoute>
                  <IndividualAlert />
                </ProtectedRoute>
              }
            />

            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </SocketProvider>      
    </AuthProvider>

  );
}

export default App;
