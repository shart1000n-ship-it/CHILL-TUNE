import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Profile from './components/Profile';
import Feed from './components/Feed';
import ChatRooms from './components/ChatRooms';
import AlumniRoom from './components/AlumniRoom';
import VideoCall from './components/VideoCall';
import Marketplace from './components/Marketplace';
import Leaderboard from './components/Leaderboard';
import Login from './components/Login';
import Register from './components/Register';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ChatProvider } from './contexts/ChatContext';
import { ProfileProvider } from './contexts/ProfileContext';
import { NotificationProvider } from './contexts/NotificationContext';
import './App.css';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ChatProvider>
        <ProfileProvider>
          <NotificationProvider>
            <Router>
              <div className="App bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 min-h-screen">
                <Navbar />
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                  <Route path="/feed" element={<ProtectedRoute><Feed /></ProtectedRoute>} />
                  <Route path="/chatrooms" element={<ProtectedRoute><ChatRooms /></ProtectedRoute>} />
                  <Route path="/alumni-room" element={<ProtectedRoute><AlumniRoom /></ProtectedRoute>} />
                  <Route path="/marketplace" element={<ProtectedRoute><Marketplace /></ProtectedRoute>} />
                  <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
                  <Route path="/video-call/:roomId" element={<ProtectedRoute><VideoCallWithParams /></ProtectedRoute>} />
                  <Route path="/video-call" element={<ProtectedRoute><VideoCallDefault /></ProtectedRoute>} />
                </Routes>
              </div>
            </Router>
          </NotificationProvider>
        </ProfileProvider>
      </ChatProvider>
    </AuthProvider>
  );
};

const VideoCallWithParams: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  return (
    <VideoCall 
      roomId={roomId} 
      userName={user?.firstName} 
      onLeaveRoom={() => navigate('/')} 
    />
  );
};

const VideoCallDefault: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  return (
    <VideoCall 
      userName={user?.firstName} 
      onLeaveRoom={() => navigate('/')} 
    />
  );
};

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    );
  }
  
  return user ? <>{children}</> : <Navigate to="/login" />;
};

export default App;
