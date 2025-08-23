import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-black/20 backdrop-blur-md border-b border-white/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center star-glow">
              <span className="text-white text-xl font-bold">⭐</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-2xl font-bold gradient-text">Star App</h1>
              <p className="text-xs text-white/60 -mt-1">The Ultimate APP In The World</p>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`text-white hover:text-purple-300 transition-colors ${
                isActive('/') ? 'text-purple-300 font-semibold' : ''
              }`}
            >
              Home
            </Link>
            {user && (
              <>
                <Link
                  to="/feed"
                  className={`text-white hover:text-purple-300 transition-colors ${
                    isActive('/feed') ? 'text-purple-300 font-semibold' : ''
                  }`}
                >
                  Feed
                </Link>
                <Link
                  to="/marketplace"
                  className={`text-white hover:text-purple-300 transition-colors ${
                    isActive('/marketplace') ? 'text-purple-300 font-semibold' : ''
                  }`}
                >
                  🛍️ Shop
                </Link>
                <Link
                  to="/chatrooms"
                  className={`text-white hover:text-purple-300 transition-colors ${
                    isActive('/chatrooms') ? 'text-purple-300 font-semibold' : ''
                  }`}
                >
                  Chat Rooms
                </Link>
                <Link
                  to="/alumni-room"
                  className={`text-white hover:text-purple-300 transition-colors ${
                    isActive('/alumni-room') ? 'text-purple-300 font-semibold' : ''
                  }`}
                >
                  Alumni Room
                </Link>
                <Link
                  to="/leaderboard"
                  className={`text-white hover:text-purple-300 transition-colors ${
                    isActive('/leaderboard') ? 'text-purple-300 font-semibold' : ''
                  }`}
                >
                  🏆 Leaderboard
                </Link>
                <Link
                  to="/video-call"
                  className={`text-white hover:text-purple-300 transition-colors ${
                    isActive('/video-call') ? 'text-purple-300 font-semibold' : ''
                  }`}
                >
                  📹 Video Call
                </Link>
                <Link
                  to="/profile"
                  className={`text-white hover:text-purple-300 transition-colors ${
                    isActive('/profile') ? 'text-purple-300 font-semibold' : ''
                  }`}
                >
                  👤 Profile
                </Link>
              </>
            )}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-6">
                <Link
                  to="/profile"
                  className="flex items-center space-x-2 text-white hover:text-purple-300 transition-colors"
                >
                  <img
                    src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                    alt={user.username}
                    className="w-8 h-8 rounded-full border-2 border-white/20"
                  />
                  <span className="hidden sm:block">{user.firstName}</span>
                </Link>
                
                {/* Notification Star */}
                <div className="relative ml-4">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 text-white hover:text-purple-300 transition-colors"
                    title="Notifications"
                  >
                    <span className="text-xl">⭐</span>
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </button>
                  
                  {/* Notifications Dropdown */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
                      <div className="p-4 border-b border-white/20">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-white">Notifications</h3>
                          <button
                            onClick={() => setShowNotifications(false)}
                            className="text-white/60 hover:text-white"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                      
                      <div className="p-2">
                        {notifications.length === 0 ? (
                          <p className="text-white/60 text-center py-4">No notifications yet</p>
                        ) : (
                          <div className="space-y-2">
                            {notifications.map((notification) => (
                              <div
                                key={notification.id}
                                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                                  notification.isRead 
                                    ? 'bg-white/5 hover:bg-white/10' 
                                    : 'bg-purple-500/20 hover:bg-purple-500/30'
                                }`}
                                onClick={() => {
                                  markAsRead(notification.id);
                                  if (notification.actionUrl) {
                                    navigate(notification.actionUrl);
                                    setShowNotifications(false);
                                  }
                                }}
                              >
                                <div className="flex items-start space-x-3">
                                  <img
                                    src={notification.userAvatar}
                                    alt={notification.username}
                                    className="w-8 h-8 rounded-full flex-shrink-0"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-white font-medium text-sm">
                                      {notification.title}
                                    </p>
                                    <p className="text-white/80 text-xs mt-1">
                                      {notification.message}
                                    </p>
                                    <p className="text-white/40 text-xs mt-1">
                                      {notification.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                <button
                  onClick={handleLogout}
                  className="btn-secondary text-sm"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login" className="btn-secondary text-sm">
                  Login
                </Link>
                <Link to="/register" className="btn-primary text-sm">
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-white hover:text-purple-300 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-black/30 backdrop-blur-md border-t border-white/20">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                to="/"
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActive('/') ? 'text-purple-300 bg-white/10' : 'text-white hover:text-purple-300 hover:bg-white/10'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              {user && (
                <>
                  <Link
                    to="/feed"
                    className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      isActive('/feed') ? 'text-purple-300 bg-white/10' : 'text-white hover:text-purple-300 hover:bg-white/10'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Feed
                  </Link>
                  <Link
                    to="/marketplace"
                    className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      isActive('/marketplace') ? 'text-purple-300 bg-white/10' : 'text-white hover:text-purple-300 hover:bg-white/10'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    🛍️ Shop
                  </Link>
                  <Link
                    to="/chatrooms"
                    className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      isActive('/chatrooms') ? 'text-purple-300 bg-white/10' : 'text-white hover:text-purple-300 hover:bg-white/10'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Chat Rooms
                  </Link>
                  <Link
                    to="/alumni-room"
                    className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      isActive('/alumni-room') ? 'text-purple-300 bg-white/10' : 'text-white hover:text-purple-300 hover:bg-white/10'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Alumni Room
                  </Link>
                  <Link
                    to="/leaderboard"
                    className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      isActive('/leaderboard') ? 'text-purple-300 bg-white/10' : 'text-white hover:text-purple-300 hover:bg-white/10'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    🏆 Leaderboard
                  </Link>
                  <Link
                    to="/video-call"
                    className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      isActive('/video-call') ? 'text-purple-300 bg-white/10' : 'text-white hover:text-purple-300 hover:bg-white/10'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    📹 Video Call
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
