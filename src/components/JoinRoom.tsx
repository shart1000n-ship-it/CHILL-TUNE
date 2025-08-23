import React, { useState } from 'react';

interface JoinRoomProps {
  onJoinRoom: (roomId: string, userName: string) => void;
}

const JoinRoom: React.FC<JoinRoomProps> = ({ onJoinRoom }) => {
  const [roomId, setRoomId] = useState('');
  const [userName, setUserName] = useState('');
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);

  const generateRoomId = () => {
    const newRoomId = Math.random().toString(36).substr(2, 9).toUpperCase();
    setRoomId(newRoomId);
  };

  const handleJoinRoom = () => {
    if (roomId.trim() && userName.trim()) {
      onJoinRoom(roomId.trim(), userName.trim());
    }
  };

  const handleCreateRoom = () => {
    if (userName.trim()) {
      generateRoomId();
      setIsCreatingRoom(true);
    }
  };

  const copyRoomLink = () => {
    const roomLink = `${window.location.origin}?room=${roomId}`;
    navigator.clipboard.writeText(roomLink);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Star App Logo */}
        <div className="text-center mb-8">
          <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-neon-blue via-neon-pink to-neon-green animate-pulse">
            Star App
          </h1>
          <p className="text-martin-300 text-lg mt-2 font-retro">
            Video Calling with 90s Flair
          </p>
        </div>

        {/* Main Form Card */}
        <div className="bg-martin-800/80 backdrop-blur-sm border-2 border-martin-400 p-8 rounded-none shadow-2xl">
          <div className="space-y-6">
            {/* Username Input */}
            <div>
              <label className="block text-martin-200 text-sm font-bold mb-2">
                Your Name
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Enter your name"
                className="cyber-input w-full"
                maxLength={20}
              />
            </div>

            {/* Room ID Input */}
            <div>
              <label className="block text-martin-200 text-sm font-bold mb-2">
                Room ID
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                  placeholder="Enter room ID"
                  className="cyber-input flex-1"
                  maxLength={9}
                />
                <button
                  onClick={generateRoomId}
                  className="cyber-button px-4 py-3 text-sm"
                >
                  Generate
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {!isCreatingRoom ? (
                <button
                  onClick={handleJoinRoom}
                  disabled={!roomId.trim() || !userName.trim()}
                  className="cyber-button w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  🚀 Join Room
                </button>
              ) : (
                <div className="space-y-3">
                  <button
                    onClick={handleJoinRoom}
                    className="cyber-button w-full"
                  >
                    🎯 Enter Room
                  </button>
                  <button
                    onClick={copyRoomLink}
                    className="cyber-button w-full bg-gradient-to-r from-neon-green to-neon-blue"
                  >
                    📋 Copy Room Link
                  </button>
                </div>
              )}

              <button
                onClick={handleCreateRoom}
                disabled={!userName.trim()}
                className="cyber-button w-full bg-gradient-to-r from-neon-purple to-neon-pink disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ✨ Create New Room
              </button>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="mt-8 text-center">
          <div className="inline-flex space-x-4 text-martin-400">
            <span className="animate-pulse">🔒</span>
            <span className="animate-pulse delay-100">🚀</span>
            <span className="animate-pulse delay-200">⚡</span>
            <span className="animate-pulse delay-300">🎯</span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-martin-500 text-sm">
          <p>Built with WebRTC & 90s Nostalgia</p>
        </div>
      </div>
    </div>
  );
};

export default JoinRoom;
