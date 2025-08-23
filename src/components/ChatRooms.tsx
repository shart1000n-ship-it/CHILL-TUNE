import React, { useState, useMemo } from 'react';
import { useChat } from '../contexts/ChatContext';
import { useAuth } from '../contexts/AuthContext';

const ChatRooms: React.FC = () => {
  const { rooms, activeRoom, joinRoom, leaveRoom, isConnected } = useChat();
  const { user } = useAuth();
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [newRoomData, setNewRoomData] = useState({
    name: '',
    description: '',
    type: 'public' as 'public' | 'private' | 'alumni',
    category: 'General',
  });

  // Get unique categories from rooms
  const categories = useMemo(() => {
    const cats = ['All', ...Array.from(new Set(rooms.map(room => room.category)))];
    return cats.sort();
  }, [rooms]);

  // Filter rooms based on selected category and search query
  const filteredRooms = useMemo(() => {
    let filtered = rooms;
    
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(room => room.category === selectedCategory);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(room => 
        room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        room.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  }, [rooms, selectedCategory, searchQuery]);

  const handleJoinRoom = (roomId: string) => {
    console.log('Joining room:', roomId); // Debug log
    
    if (activeRoom?.id === roomId) {
      console.log('Leaving room:', roomId); // Debug log
      leaveRoom(roomId);
      setSelectedRoom(null);
    } else {
      console.log('Joining new room:', roomId); // Debug log
      joinRoom(roomId);
      setSelectedRoom(roomId);
      
      // Show success message
      console.log(`Successfully joined room: ${roomId}`);
      
      // Add visual feedback
      alert(`Successfully joined ${rooms.find(r => r.id === roomId)?.name}!`);
    }
  };

  const handleCreateRoom = () => {
    // This would integrate with the chat context
    setShowCreateRoom(false);
    setNewRoomData({ name: '', description: '', type: 'public', category: 'General' });
  };

  const getRoomIcon = (type: string) => {
    switch (type) {
      case 'alumni':
        return '🎓';
      case 'private':
        return '🔒';
      default:
        return '💬';
    }
  };

  const getRoomTypeColor = (type: string) => {
    switch (type) {
      case 'alumni':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/50';
      case 'private':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      default:
        return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
    }
  };

  const getCategoryIcon = (category: string) => {
    const categoryIcons: { [key: string]: string } = {
      'General': '🌟',
      'Sports': '🏆',
      'Music': '🎵',
      'Gaming': '🎮',
      'Entertainment': '🎬',
      'Lifestyle': '🍕',
      'Technology': '💻',
      'Business': '💰',
      'Education': '📚',
      'Hobbies': '🏠',
      'Trending': '🔥',
      'Special': '👑',
    };
    return categoryIcons[category] || '💬';
  };

  const getCategoryColor = (category: string) => {
    const categoryColors: { [key: string]: string } = {
      'General': 'bg-blue-500/20 text-blue-400 border-blue-500/50',
      'Sports': 'bg-green-500/20 text-green-400 border-green-500/50',
      'Music': 'bg-purple-500/20 text-purple-400 border-purple-500/50',
      'Gaming': 'bg-orange-500/20 text-orange-400 border-orange-500/50',
      'Entertainment': 'bg-pink-500/20 text-pink-400 border-pink-500/50',
      'Lifestyle': 'bg-teal-500/20 text-teal-400 border-teal-500/50',
      'Technology': 'bg-indigo-500/20 text-indigo-400 border-indigo-500/50',
      'Business': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50',
      'Education': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50',
      'Hobbies': 'bg-amber-500/20 text-amber-400 border-amber-500/50',
      'Trending': 'bg-red-500/20 text-red-400 border-red-500/50',
      'Special': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
    };
    return categoryColors[category] || 'bg-gray-500/20 text-gray-400 border-gray-500/50';
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            Chat Rooms
          </h1>
          <p className="text-xl text-white/60 max-w-3xl mx-auto">
            Join conversations, connect with friends, and be part of amazing communities across {categories.length - 1} different categories
          </p>
          <div className="flex items-center justify-center space-x-4 mt-6">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-white/60 text-sm">
                {isConnected ? 'Connected' : 'Connecting...'}
              </span>
            </div>
            <button
              onClick={() => setShowCreateRoom(true)}
              className="btn-primary"
            >
              Create New Room
            </button>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search chat rooms..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full input-field pl-10"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60">
                  🔍
                </div>
              </div>
            </div>

            {/* Category Filter */}
            <div className="sm:w-48">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full input-field"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category} ({category === 'All' ? rooms.length : rooms.filter(r => r.category === category).length})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedCategory === category
                    ? 'bg-purple-500 text-white shadow-lg'
                    : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                }`}
              >
                <span className="mr-2">{getCategoryIcon(category)}</span>
                {category}
                {category !== 'All' && (
                  <span className="ml-2 bg-white/20 px-2 py-1 rounded-full text-xs">
                    {rooms.filter(r => r.category === category).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Create Room Modal */}
        {showCreateRoom && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="card max-w-md w-full mx-4">
              <h3 className="text-xl font-semibold text-white mb-6">Create New Chat Room</h3>
              <form onSubmit={(e) => { e.preventDefault(); handleCreateRoom(); }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Room Name
                    </label>
                    <input
                      type="text"
                      value={newRoomData.name}
                      onChange={(e) => setNewRoomData({ ...newRoomData, name: e.target.value })}
                      className="input-field"
                      placeholder="Enter room name"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Description
                    </label>
                    <textarea
                      value={newRoomData.description}
                      onChange={(e) => setNewRoomData({ ...newRoomData, description: e.target.value })}
                      className="input-field"
                      rows={3}
                      placeholder="Describe what this room is about"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Category
                    </label>
                    <select
                      value={newRoomData.category}
                      onChange={(e) => setNewRoomData({ ...newRoomData, category: e.target.value })}
                      className="input-field"
                    >
                      {categories.filter(cat => cat !== 'All').map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Room Type
                    </label>
                    <select
                      value={newRoomData.type}
                      onChange={(e) => setNewRoomData({ ...newRoomData, type: e.target.value as any })}
                      className="input-field"
                    >
                      <option value="public">Public</option>
                      <option value="private">Private</option>
                      <option value="alumni">Alumni</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex space-x-3 mt-6">
                  <button
                    type="submit"
                    className="btn-primary flex-1"
                  >
                    Create Room
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateRoom(false)}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Rooms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredRooms.map((room) => (
            <div
              key={room.id}
              className={`card cursor-pointer transition-all duration-200 hover:scale-105 ${
                activeRoom?.id === room.id ? 'ring-2 ring-purple-500' : ''
              }`}
              onClick={() => handleJoinRoom(room.id)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="text-4xl">{room.icon || getRoomIcon(room.type)}</div>
                <div className="flex flex-col items-end space-y-2">
                  <span className={`px-2 py-1 rounded-full text-xs border ${getRoomTypeColor(room.type)}`}>
                    {room.type.charAt(0).toUpperCase() + room.type.slice(1)}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs border ${getCategoryColor(room.category)}`}>
                    {room.category}
                  </span>
                </div>
              </div>
              
              <h3 className="text-xl font-semibold text-white mb-2">{room.name}</h3>
              <p className="text-white/70 mb-4 text-sm leading-relaxed">{room.description}</p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-sm text-white/60">
                  <span>👥</span>
                  <span>{room.memberCount || room.participants.length} members</span>
                </div>
                
                <button
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeRoom?.id === room.id
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : 'bg-purple-500 hover:bg-purple-600 text-white'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleJoinRoom(room.id);
                  }}
                >
                  {activeRoom?.id === room.id ? 'Leave' : 'Join'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* No Results Message */}
        {filteredRooms.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-white mb-2">No rooms found</h3>
            <p className="text-white/60">
              Try adjusting your search or category filter
            </p>
          </div>
        )}

        {/* Active Room Info */}
        {activeRoom && (
          <div className="mt-8">
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">
                  Currently in: {activeRoom.name}
                </h2>
                <button
                  onClick={() => leaveRoom(activeRoom.id)}
                  className="btn-secondary"
                >
                  Leave Room
                </button>
              </div>
              <p className="text-white/70 mb-4">{activeRoom.description}</p>
              <div className="flex items-center space-x-4 text-sm text-white/60">
                <span>Room Type: {activeRoom.type}</span>
                <span>•</span>
                <span>Category: {activeRoom.category}</span>
                <span>•</span>
                <span>Members: {activeRoom.memberCount || activeRoom.participants.length}</span>
                <span>•</span>
                <span>Status: {activeRoom.isActive ? 'Active' : 'Inactive'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Category Statistics */}
        <div className="mt-12">
          <div className="card">
            <h3 className="text-xl font-semibold text-white mb-6">📊 Chat Room Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {categories.filter(cat => cat !== 'All').map(category => {
                const roomCount = rooms.filter(r => r.category === category).length;
                const totalMembers = rooms
                  .filter(r => r.category === category)
                  .reduce((sum, room) => sum + (room.memberCount || 0), 0);
                
                return (
                  <div key={category} className="text-center p-4 bg-white/5 rounded-lg">
                    <div className="text-2xl mb-2">{getCategoryIcon(category)}</div>
                    <h4 className="font-semibold text-white text-sm mb-1">{category}</h4>
                    <p className="text-white/60 text-xs">{roomCount} rooms</p>
                    <p className="text-white/40 text-xs">{totalMembers.toLocaleString()} members</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Special Features */}
        <div className="mt-12">
          <div className="card">
            <h3 className="text-xl font-semibold text-white mb-4">🌟 Special Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl mb-2">🎓</div>
                <h4 className="font-semibold text-white mb-2">Alumni Room</h4>
                <p className="text-white/70 text-sm">
                  Exclusive access for verified alumni to reconnect and network
                </p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">🔒</div>
                <h4 className="font-semibold text-white mb-2">Private Rooms</h4>
                <p className="text-white/70 text-sm">
                  Create private spaces for close friends and family
                </p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">💬</div>
                <h4 className="font-semibold text-white mb-2">Public Rooms</h4>
                <p className="text-white/70 text-sm">
                  Join open discussions and meet new people
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatRooms;
