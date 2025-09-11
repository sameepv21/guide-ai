import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import ForgotPassword from './components/Auth/ForgotPassword';
import ChatInterface from './components/Chat/ChatInterface';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <Router>
      <div className="min-h-screen bg-gray-950 text-gray-100">
        <Routes>
          <Route 
            path="/login" 
            element={
              isAuthenticated ? 
              <Navigate to="/chat" /> : 
              <Login setIsAuthenticated={setIsAuthenticated} />
            } 
          />
          <Route 
            path="/signup" 
            element={
              isAuthenticated ? 
              <Navigate to="/chat" /> : 
              <Signup setIsAuthenticated={setIsAuthenticated} />
            } 
          />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route 
            path="/chat" 
            element={
              isAuthenticated ? 
              <ChatInterface setIsAuthenticated={setIsAuthenticated} /> : 
              <Navigate to="/login" />
            } 
          />
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}