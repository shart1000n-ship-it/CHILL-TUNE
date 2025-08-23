import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface VideoCallProps {
  roomId?: string;
  userName?: string;
  onLeaveRoom?: () => void;
}

const VideoCall: React.FC<VideoCallProps> = ({ roomId: propRoomId, userName: propUserName, onLeaveRoom }) => {
  const { roomId: urlRoomId } = useParams<{ roomId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const roomId = propRoomId || urlRoomId || 'default-room';
  const userName = propUserName || user?.firstName || 'Anonymous';
  
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{id: string, user: string, message: string, timestamp: Date}>>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showBackgroundPicker, setShowBackgroundPicker] = useState(false);
  const [selectedBackground, setSelectedBackground] = useState<string>('none');
  const [customBackgroundUrl, setCustomBackgroundUrl] = useState<string>('');
  const [uploadedImage, setUploadedImage] = useState<string>('');
  
  const [participants, setParticipants] = useState([
    { id: '1', name: 'You', avatar: user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}` },
    { id: '2', name: 'Sarah Johnson', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah' },
    { id: '3', name: 'Mike Chen', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike' },
  ]);

  // Predefined background options
  const backgroundOptions = [
    { id: 'none', name: 'No Background', url: '' },
    { id: 'blur', name: 'Blur Background', url: 'blur' },
    { id: 'office', name: 'Office', url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&h=1080&fit=crop' },
    { id: 'nature', name: 'Nature', url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop' },
    { id: 'city', name: 'City', url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d7250?w=1920&h=1080&fit=crop' },
    { id: 'abstract', name: 'Abstract', url: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=1920&h=1080&fit=crop' },
    { id: 'beach', name: 'Beach', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&h=1080&fit=crop' },
    { id: 'mountains', name: 'Mountains', url: 'https://images.unsplash.com/photo-1464822759844-d150baec0134?w=1920&h=1080&fit=crop' },
    { id: 'custom', name: 'Custom URL', url: 'custom' },
    { id: 'upload', name: 'Upload Image', url: 'upload' }
  ];

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Initialize video stream
    initializeVideo();
    
    // Add some sample chat messages
    setChatMessages([
      { id: '1', user: 'Sarah Johnson', message: 'Hey everyone! 👋', timestamp: new Date(Date.now() - 1000 * 60 * 2) },
      { id: '2', user: 'Mike Chen', message: 'Great to see you all!', timestamp: new Date(Date.now() - 1000 * 60 * 1) },
    ]);

    return () => {
      // Cleanup video streams
      cleanupStreams();
    };
  }, []);

  const cleanupStreams = () => {
    console.log('Cleaning up all streams...');
    
    // Stop local stream
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        track.stop();
        console.log('Stopped local track:', track.kind, track.id);
      });
      localStreamRef.current = null;
    }
    
    // Stop screen sharing stream
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => {
        track.stop();
        console.log('Stopped screen track:', track.kind, track.id);
      });
      screenStreamRef.current = null;
    }
    
    // Clear video elements
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
    
    // Force garbage collection hint
    if (window.gc) {
      window.gc();
    }
    
    console.log('Stream cleanup completed');
  };

  const initializeVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          facingMode: 'user'
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      localStreamRef.current = stream;
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.play().catch(console.error);
      }
      
      console.log('Video stream initialized successfully');
    } catch (error) {
      console.error('Error accessing camera/microphone:', error);
      // Fallback to audio only
      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        });
        
        localStreamRef.current = audioStream;
        console.log('Audio-only stream initialized as fallback');
      } catch (audioError) {
        console.error('Error accessing audio:', audioError);
      }
    }
  };

  const toggleVideo = () => {
    setIsVideoEnabled(!isVideoEnabled);
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isVideoEnabled;
        console.log('Video track enabled:', videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    setIsAudioEnabled(!isAudioEnabled);
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isAudioEnabled;
        console.log('Audio track enabled:', audioTrack.enabled);
      }
    }
  };

  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            displaySurface: 'monitor'
          },
          audio: false
        });
        
        screenStreamRef.current = screenStream;
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
          localVideoRef.current.play().catch(console.error);
        }
        setIsScreenSharing(true);
        
        // Handle screen share stop
        screenStream.getVideoTracks()[0].addEventListener('ended', () => {
          toggleScreenShare();
        });
        
        console.log('Screen sharing started');
      } catch (error) {
        console.error('Error sharing screen:', error);
      }
    } else {
      // Stop screen sharing and return to camera
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(track => track.stop());
        screenStreamRef.current = null;
      }
      
      if (localStreamRef.current && localVideoRef.current) {
        localVideoRef.current.srcObject = localStreamRef.current;
        localVideoRef.current.play().catch(console.error);
      }
      setIsScreenSharing(false);
      console.log('Screen sharing stopped');
    }
  };

  const handleBackgroundChange = (backgroundId: string) => {
    setSelectedBackground(backgroundId);
    if (backgroundId === 'custom') {
      setShowBackgroundPicker(true);
      setUploadedImage('');
    } else if (backgroundId === 'upload') {
      setShowBackgroundPicker(false);
      setCustomBackgroundUrl('');
      // Trigger file input
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    } else {
      setShowBackgroundPicker(false);
      setCustomBackgroundUrl('');
      setUploadedImage('');
    }
    console.log('Background changed to:', backgroundId);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setUploadedImage(result);
        setSelectedBackground('upload');
        console.log('Image uploaded successfully');
      };
      reader.readAsDataURL(file);
    }
  };

  const applyCustomBackground = () => {
    if (customBackgroundUrl.trim()) {
      setSelectedBackground('custom');
      setShowBackgroundPicker(false);
      console.log('Custom background applied:', customBackgroundUrl);
    }
  };

  const getBackgroundStyle = () => {
    if (selectedBackground === 'none') {
      return {};
    } else if (selectedBackground === 'blur') {
      return { 
        filter: 'blur(15px)',
        transform: 'scale(1.1)' // Prevent blur edges
      };
    } else if (selectedBackground === 'custom' && customBackgroundUrl) {
      return {
        backgroundImage: `url(${customBackgroundUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      };
    } else if (selectedBackground === 'upload' && uploadedImage) {
      return {
        backgroundImage: `url(${uploadedImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      };
    } else {
      const background = backgroundOptions.find(bg => bg.id === selectedBackground);
      if (background && background.url && background.url !== 'custom' && background.url !== 'upload') {
        return {
          backgroundImage: `url(${background.url})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        };
      }
    }
    return {};
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const message = {
      id: Date.now().toString(),
      user: userName,
      message: newMessage,
      timestamp: new Date()
    };

    setChatMessages([...chatMessages, message]);
    setNewMessage('');
    
    // Auto-scroll to bottom
    setTimeout(() => {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      }
    }, 100);
  };

  const leaveCall = () => {
    console.log('Leaving call, cleaning up...');
    
    // Clean up all streams properly
    cleanupStreams();
    
    // Reset states
    setIsVideoEnabled(false);
    setIsAudioEnabled(false);
    setIsScreenSharing(false);
    
    // Navigate or call callback
    if (onLeaveRoom) {
      onLeaveRoom();
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-black/50 backdrop-blur-md border-b border-white/20 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-xl">📹</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Video Call</h1>
              <p className="text-white/60 text-sm">Room: {roomId}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-white/60 text-sm">{participants.length} participants</span>
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Video Area */}
        <div className="flex-1 flex flex-col p-4">
          {/* Background Picker */}
          <div className="mb-4 bg-black/30 rounded-lg p-4">
            <div className="flex items-center space-x-4">
              <label className="text-white text-sm font-medium">🎨 Background:</label>
              <select
                value={selectedBackground}
                onChange={(e) => handleBackgroundChange(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {backgroundOptions.map((bg) => (
                  <option key={bg.id} value={bg.id} className="bg-gray-800 text-white">
                    {bg.name}
                  </option>
                ))}
              </select>
              
              {selectedBackground === 'custom' && (
                <div className="flex items-center space-x-2">
                  <input
                    type="url"
                    value={customBackgroundUrl}
                    onChange={(e) => setCustomBackgroundUrl(e.target.value)}
                    placeholder="Enter image URL..."
                    className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 w-64"
                  />
                  <button
                    onClick={applyCustomBackground}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                  >
                    Apply
                  </button>
                </div>
              )}

              {selectedBackground === 'upload' && uploadedImage && (
                <div className="flex items-center space-x-2">
                  <span className="text-green-400 text-sm">✅ Image uploaded!</span>
                  <button
                    onClick={() => setUploadedImage('')}
                    className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs transition-colors"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Hidden file input for image upload */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />

          {/* Main Video Grid */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            {/* Local Video */}
            <div className="relative bg-black rounded-lg overflow-hidden">
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
                style={getBackgroundStyle()}
              />
              {!isVideoEnabled && (
                <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-2">📷</div>
                    <p className="text-white/60">Camera Off</p>
                  </div>
                </div>
              )}
              <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
                {userName} (You)
              </div>
              {selectedBackground !== 'none' && (
                <div className="absolute top-2 right-2 bg-purple-600 text-white px-2 py-1 rounded text-xs">
                  🎨 {backgroundOptions.find(bg => bg.id === selectedBackground)?.name}
                </div>
              )}
            </div>

            {/* Remote Video */}
            <div className="relative bg-black rounded-lg overflow-hidden">
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
                Sarah Johnson
              </div>
            </div>
          </div>

          {/* Participants Row */}
          <div className="flex space-x-4 overflow-x-auto pb-2">
            {participants.slice(1).map((participant) => (
              <div key={participant.id} className="flex-shrink-0 text-center">
                <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center mb-1">
                  <img
                    src={participant.avatar}
                    alt={participant.name}
                    className="w-12 h-12 rounded-full"
                  />
                </div>
                <p className="text-white/80 text-xs">{participant.name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Sidebar */}
        {isChatOpen && (
          <div className="w-80 bg-black/50 backdrop-blur-md border-l border-white/20 flex flex-col">
            <div className="p-4 border-b border-white/20">
              <h3 className="text-white font-semibold">Chat</h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4" ref={chatContainerRef}>
              <div className="space-y-3">
                {chatMessages.map((msg) => (
                  <div key={msg.id} className="flex flex-col">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-purple-400 font-medium text-sm">{msg.user}</span>
                      <span className="text-white/40 text-xs">
                        {msg.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-white/80 text-sm bg-white/10 rounded-lg px-3 py-2">
                      {msg.message}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            
            <form onSubmit={sendMessage} className="p-4 border-t border-white/20">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                >
                  Send
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Control Bar */}
      <div className="bg-black/50 backdrop-blur-md border-t border-white/20 p-4">
        <div className="flex items-center justify-center space-x-4">
          {/* Video Toggle */}
          <button
            onClick={toggleVideo}
            className={`p-3 rounded-full transition-colors ${
              isVideoEnabled 
                ? 'bg-white/20 text-white hover:bg-white/30' 
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
            title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
          >
            {isVideoEnabled ? '📹' : '🚫'}
          </button>

          {/* Audio Toggle */}
          <button
            onClick={toggleAudio}
            className={`p-3 rounded-full transition-colors ${
              isAudioEnabled 
                ? 'bg-white/20 text-white hover:bg-white/30' 
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
            title={isAudioEnabled ? 'Mute microphone' : 'Unmute microphone'}
          >
            {isAudioEnabled ? '🎤' : '🔇'}
          </button>

          {/* Screen Share */}
          <button
            onClick={toggleScreenShare}
            className={`p-3 rounded-full transition-colors ${
              isScreenSharing 
                ? 'bg-purple-600 text-white hover:bg-purple-700' 
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
            title={isScreenSharing ? 'Stop sharing' : 'Share screen'}
          >
            {isScreenSharing ? '🖥️' : '💻'}
          </button>

          {/* Chat Toggle */}
          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className={`p-3 rounded-full transition-colors ${
              isChatOpen 
                ? 'bg-purple-600 text-white hover:bg-purple-700' 
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
            title={isChatOpen ? 'Close chat' : 'Open chat'}
          >
            💬
          </button>

          {/* Leave Call */}
          <button
            onClick={leaveCall}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full font-medium transition-colors"
          >
            Leave Call
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoCall;
