import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useChat } from '../contexts/ChatContext';
import GifPicker from './GifPicker';
import EmojiPicker from './EmojiPicker';

interface AlumniMember {
  id: string;
  name: string;
  avatar: string;
  graduationYear: number;
  school: string;
  major: string;
  isVerified: boolean;
  lastSeen: Date;
}

const AlumniRoom: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { joinRoom, leaveRoom, activeRoom, messages, sendMessage } = useChat();
  const [newMessage, setNewMessage] = useState('');
  const [showVerification, setShowVerification] = useState(false);
  const [verificationForm, setVerificationForm] = useState({
    graduationYear: '',
    school: '',
    major: '',
  });
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [alumniMembers, setAlumniMembers] = useState<AlumniMember[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [selectedGif, setSelectedGif] = useState<string>('');
  const [localMessages, setLocalMessages] = useState<any[]>([]);
  const [isInRoom, setIsInRoom] = useState(false);

  // Common emojis for quick access
  const commonEmojis = ['😀', '😂', '❤️', '🔥', '👍', '🎉', '😍', '🤔', '😭', '😱', '🥳', '😎', '🤗', '😴', '🤩', '😤', '😇', '🤠', '👻', '🤖', '🎓', '💼', '🌟', '💪', '🎯'];

  // Simple verification: user has graduation info and is marked as verified
  const isVerifiedAlumni = user?.isVerified && user?.graduationYear && user?.school;

  useEffect(() => {
    // Always show demo messages and allow messaging for testing
    setLocalMessages([
      {
        id: '1',
        content: 'Welcome to the Alumni Room! 🎓',
        senderName: 'System',
        senderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=system',
        timestamp: new Date(Date.now() - 1000 * 60 * 5),
      },
      {
        id: '2',
        content: 'Great to see everyone here! 👋',
        senderName: 'Sarah Johnson',
        senderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
        timestamp: new Date(Date.now() - 1000 * 60 * 3),
      },
      {
        id: '3',
        content: 'Anyone up for the reunion next month? 🎉',
        senderName: 'Michael Chen',
        senderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=michael',
        timestamp: new Date(Date.now() - 1000 * 60 * 1),
      },
    ]);
    
    // Auto-join alumni room if verified
    if (isVerifiedAlumni) {
      joinRoom('alumni');
      setIsInRoom(true);
    } else {
      // For testing, allow messaging even without verification
      setIsInRoom(true);
    }

    // Mock alumni members data
    const mockMembers: AlumniMember[] = [
      {
        id: '1',
        name: 'Sarah Johnson',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
        graduationYear: 2023,
        school: 'University of Technology',
        major: 'Computer Science',
        isVerified: true,
        lastSeen: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
      },
      {
        id: '2',
        name: 'Michael Chen',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=michael',
        graduationYear: 2022,
        school: 'University of Technology',
        major: 'Engineering',
        isVerified: true,
        lastSeen: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
      },
      {
        id: '3',
        name: 'Emily Rodriguez',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emily',
        graduationYear: 2021,
        school: 'University of Technology',
        major: 'Business Administration',
        isVerified: true,
        lastSeen: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      },
    ];

    setAlumniMembers(mockMembers);
  }, [isVerifiedAlumni, joinRoom]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() && !selectedGif) return;

    console.log('Sending message:', newMessage); // Debug log

    // Create message object for instant display
    const messageObj = {
      id: Date.now().toString(),
      content: selectedGif ? `[GIF] ${newMessage}` : newMessage,
      senderName: `${user?.firstName || 'User'} ${user?.lastName || 'Name'}`,
      senderAvatar: user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || 'user'}`,
      timestamp: new Date(),
      gifUrl: selectedGif || undefined,
    };

    console.log('Message object:', messageObj); // Debug log

    // Add message to local messages immediately
    setLocalMessages(prev => {
      console.log('Previous messages:', prev); // Debug log
      const newMessages = [...prev, messageObj];
      console.log('New messages array:', newMessages); // Debug log
      return newMessages;
    });
    
    // Send message through chat context (for future socket integration)
    if (selectedGif) {
      sendMessage(`[GIF] ${newMessage}`, 'image');
      setSelectedGif('');
    } else {
      sendMessage(newMessage);
    }
    
    // Clear input immediately
    setNewMessage('');
  };

  const handleEmojiSelect = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleGifSelect = (gif: any) => {
    setSelectedGif(gif.url);
    setShowGifPicker(false);
  };

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);

    try {
      // Simple verification: just update the user profile with graduation info
      // and mark them as verified (no complex document verification needed)
      await updateProfile({
        graduationYear: parseInt(verificationForm.graduationYear),
        school: verificationForm.school,
        major: verificationForm.major,
        isVerified: true, // Automatically verify after basic info is provided
      });

      // Show success message
      setVerificationSuccess(true);
      
      // Auto-join alumni room after successful verification
      setTimeout(() => {
        joinRoom('alumni');
        setShowVerification(false);
        setVerificationSuccess(false);
      }, 2000);

    } catch (error) {
      console.error('Verification error:', error);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setVerificationForm({
      ...verificationForm,
      [e.target.name]: e.target.value,
    });
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  // Show verification success message
  if (verificationSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto text-center">
          <div className="card">
            <div className="text-6xl mb-6">🎉</div>
            <h1 className="text-3xl font-bold text-white mb-4">
              Verification Successful!
            </h1>
            <p className="text-lg text-white/70 mb-6">
              Welcome to the Alumni Room! You now have access to all exclusive alumni features.
            </p>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-white/60">Redirecting to Alumni Room...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isVerifiedAlumni) {
    return (
      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Access Denied */}
          <div className="card text-center">
            <div className="text-6xl mb-6">🎓</div>
            <h1 className="text-3xl font-bold text-white mb-4">
              Welcome to the Alumni Room
            </h1>
            <p className="text-xl text-white/70 mb-8 max-w-2xl mx-auto">
              This exclusive space is reserved for verified alumni. Complete the simple verification below to gain access.
            </p>

            {/* Simple Verification Form */}
            <div className="max-w-md mx-auto">
              <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-6 mb-8">
                <h3 className="text-lg font-semibold text-blue-400 mb-4">
                  🚀 Simple Alumni Verification
                </h3>
                <p className="text-white/80 mb-4">
                  Just provide your graduation details to get instant access to the Alumni Room!
                </p>
                <button
                  onClick={() => setShowVerification(true)}
                  className="btn-primary w-full"
                >
                  Start Verification
                </button>
              </div>
            </div>

            {/* Features Preview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <div className="text-center">
                <div className="text-3xl mb-3">👥</div>
                <h4 className="font-semibold text-white mb-2">Network</h4>
                <p className="text-white/70 text-sm">
                  Connect with alumni from your graduating class and beyond
                </p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-3">💼</div>
                <h4 className="font-semibold text-white mb-2">Career</h4>
                <p className="text-white/70 text-sm">
                  Share job opportunities and professional advice
                </p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-3">🎉</div>
                <h4 className="font-semibold text-white mb-2">Events</h4>
                <p className="text-white/70 text-sm">
                  Organize reunions and alumni meetups
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="card mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                🎓 Alumni Room
              </h1>
              <p className="text-white/70">
                Welcome back, {user?.firstName}! Connect with your fellow alumni from {user?.school} Class of {user?.graduationYear}.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-white/60 text-sm">Connected</span>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{alumniMembers.length}</div>
              <div className="text-white/60 text-sm">Online Alumni</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">24</div>
              <div className="text-white/60 text-sm">Total Members</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">156</div>
              <div className="text-white/60 text-sm">Messages Today</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">12</div>
              <div className="text-white/60 text-sm">Active Events</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chat Section */}
          <div className="lg:col-span-2">
            <div className="card h-96 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Live Chat</h3>
                <button
                  onClick={() => leaveRoom('alumni')}
                  className="btn-secondary text-sm"
                >
                  Leave Room
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto mb-4 space-y-3">
                {localMessages.length === 0 ? (
                  <div className="text-center text-white/60 py-8">
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  localMessages.map((message) => (
                    <div key={message.id} className="flex items-start space-x-3">
                      <img
                        src={message.senderAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${message.senderName}`}
                        alt={message.senderName}
                        className="w-8 h-8 rounded-full"
                      />
                      <div className="flex-1">
                        <div className="bg-white/10 rounded-lg px-3 py-2">
                          <span className="font-semibold text-white text-sm">{message.senderName}</span>
                          <p className="text-white/80 text-sm">{message.content}</p>
                          {message.gifUrl && (
                            <div className="mt-2">
                              <img 
                                src={message.gifUrl} 
                                alt="Message GIF" 
                                className="max-h-32 rounded"
                              />
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-white/50 mt-1">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="space-y-3">
                {/* GIF Preview */}
                {selectedGif && (
                  <div className="relative">
                    <img 
                      src={selectedGif} 
                      alt="Selected GIF" 
                      className="max-w-full max-h-32 rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => setSelectedGif('')}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                )}

                {/* Emoji and GIF Buttons */}
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="text-2xl hover:scale-110 transition-transform"
                    title="Add emoji"
                  >
                    😀
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowGifPicker(!showGifPicker)}
                    className="text-2xl hover:scale-110 transition-transform"
                    title="Add GIF"
                  >
                    🎬
                  </button>
                </div>

                {/* Emoji Picker */}
                {showEmojiPicker && (
                  <div>
                    <EmojiPicker
                      isOpen={showEmojiPicker}
                      onClose={() => setShowEmojiPicker(false)}
                      onSelectEmoji={handleEmojiSelect}
                    />
                  </div>
                )}

                {/* GIF Picker */}
                {showGifPicker && (
                  <div>
                    <GifPicker
                      isOpen={showGifPicker}
                      onClose={() => setShowGifPicker(false)}
                      onSelectGif={handleGifSelect}
                    />
                  </div>
                )}

                {/* Message Input and Send Button */}
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 input-field"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim() && !selectedGif}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Send
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Alumni Members */}
          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4">Online Alumni</h3>
            <div className="space-y-3">
              {alumniMembers.map((member) => (
                <div key={member.id} className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                  <div className="relative">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-white text-sm">{member.name}</h4>
                    <p className="text-white/60 text-xs">
                      {member.major} • {member.graduationYear}
                    </p>
                    <p className="text-white/40 text-xs">
                      {formatTimeAgo(member.lastSeen)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Alumni Events */}
        <div className="mt-8">
          <div className="card">
            <h3 className="text-xl font-semibold text-white mb-6">Upcoming Alumni Events</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white/5 rounded-lg p-4">
                <div className="text-2xl mb-2">🎓</div>
                <h4 className="font-semibold text-white mb-2">Class of 2023 Reunion</h4>
                <p className="text-white/70 text-sm mb-3">
                  Join us for our first reunion since graduation!
                </p>
                <div className="text-white/60 text-xs">
                  📅 Dec 15, 2024 • 📍 Downtown Convention Center
                </div>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <div className="text-2xl mb-2">💼</div>
                <h4 className="font-semibold text-white mb-2">Career Networking Mixer</h4>
                <p className="text-white/70 text-sm mb-3">
                  Connect with alumni in your industry
                </p>
                <div className="text-white/60 text-xs">
                  📅 Jan 20, 2025 • 📍 Tech Hub Downtown
                </div>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <div className="text-2xl mb-2">🎉</div>
                <h4 className="font-semibold text-white mb-2">Alumni Homecoming</h4>
                <p className="text-white/70 text-sm mb-3">
                  Annual celebration with all graduating classes
                </p>
                <div className="text-white/60 text-xs">
                  📅 Feb 28, 2025 • 📍 University Campus
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Simple Verification Modal */}
      {showVerification && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="card max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-white mb-6">🎓 Simple Alumni Verification</h3>
            <p className="text-white/70 mb-6 text-center">
              Just fill out these basic details to get instant access to the Alumni Room!
            </p>
            
            <form onSubmit={handleVerification}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Graduation Year *
                  </label>
                  <input
                    type="number"
                    name="graduationYear"
                    value={verificationForm.graduationYear}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="e.g., 2023"
                    min="1980"
                    max={new Date().getFullYear() + 1}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    School/University *
                  </label>
                  <input
                    type="text"
                    name="school"
                    value={verificationForm.school}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Your school name"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Major/Field of Study *
                  </label>
                  <input
                    type="text"
                    name="major"
                    value={verificationForm.major}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Your major"
                    required
                  />
                </div>
              </div>
              
              <div className="mt-6">
                <button
                  type="submit"
                  disabled={isVerifying || !verificationForm.graduationYear || !verificationForm.school || !verificationForm.major}
                  className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isVerifying ? 'Verifying...' : '🎉 Get Instant Access!'}
                </button>
              </div>
              
              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => setShowVerification(false)}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
            
            <div className="mt-6 p-4 bg-green-500/20 border border-green-500/50 rounded-lg">
              <h4 className="font-semibold text-green-400 mb-2">✨ Simple & Fast</h4>
              <p className="text-white/80 text-sm">
                No documents needed! Just provide your graduation details and get instant access to the exclusive Alumni Room.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlumniRoom;
