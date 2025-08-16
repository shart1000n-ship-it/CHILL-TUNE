'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { createClient } from '@supabase/supabase-js';

// Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Stream URLs - All Hip Hop & R&B
const STREAMS = [
  { name: 'Hip Hop & R&B Radio', url: 'https://stream.radiojar.com/4ywdgup3bnzuv' },
  { name: 'PowerHitz Pure R&B', url: 'https://stream.radiojar.com/4ywdgup3bnzuv' },
  { name: 'Urban Hip Hop Mix', url: 'https://stream.radiojar.com/4ywdgup3bnzuv' },
  { name: 'R&B Classics', url: 'https://stream.radiojar.com/4ywdgup3bnzuv' }
];

export default function RadioClient() {
  const { data: session } = useSession();
  const [currentStreamIndex, setCurrentStreamIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [micVolume, setMicVolume] = useState(0.5);
  const [crossfader, setCrossfader] = useState(0.5);
  const [isLive, setIsLive] = useState(false);
  const [isVideoLive, setIsVideoLive] = useState(false);
  const [onAirTime, setOnAirTime] = useState(0);
  const [messages, setMessages] = useState<Array<{id: string, username: string, message: string, timestamp: string}>>([]);
  const [newMessage, setNewMessage] = useState('');
  const [username, setUsername] = useState('');
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [exclusiveFile, setExclusiveFile] = useState<File | null>(null);
  const [exclusiveDuration, setExclusiveDuration] = useState(0);
  const [exclusiveElapsed, setExclusiveElapsed] = useState(0);
  const [isExclusivePlaying, setIsExclusivePlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [listenerCount, setListenerCount] = useState(0);
  const [eqLow, setEqLow] = useState(0.5);
  const [eqMid, setEqMid] = useState(0.5);
  const [eqHigh, setEqHigh] = useState(0.5);
  const [schedule] = useState([
    { day: 'Monday', time: '6:00 PM - 10:00 PM', show: 'The Evening Mix' },
    { day: 'Tuesday', time: '7:00 PM - 11:00 PM', show: 'R&B Classics' },
    { day: 'Wednesday', time: '8:00 PM - 12:00 AM', show: 'Midnight Vibes' },
    { day: 'Thursday', time: '6:00 PM - 10:00 PM', show: 'Throwback Thursday' },
    { day: 'Friday', time: '7:00 PM - 1:00 AM', show: 'Weekend Kickoff' },
    { day: 'Saturday', time: '2:00 PM - 8:00 PM', show: 'Saturday Sessions' },
    { day: 'Sunday', time: '3:00 PM - 9:00 PM', show: 'Sunday Chill' }
  ]);

  const audioRef = useRef<HTMLAudioElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const exclusiveAudioRef = useRef<HTMLAudioElement>(null);
  const exclusiveContextRef = useRef<AudioContext | null>(null);
  const exclusiveSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const exclusiveDestinationRef = useRef<MediaStreamAudioDestinationNode | null>(null);

  // Check if user is admin
  const isAdmin = session?.user?.email && (
    process.env.NEXT_PUBLIC_ADMIN_EMAILS?.includes(session.user.email) ||
    session.user.email === 'chillandtune.fm'
  );

  // Initialize audio player
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Stream cycling effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStreamIndex(prev => (prev + 1) % STREAMS.length);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // On-air time tracker
  useEffect(() => {
    let interval: any;
    if (isLive) {
      interval = setInterval(() => {
        setOnAirTime(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLive]);

  // Exclusive track duration
  useEffect(() => {
    let interval: any;
    if (isExclusivePlaying && exclusiveDuration > 0) {
      interval = setInterval(() => {
        setExclusiveElapsed(prev => {
          if (prev >= exclusiveDuration) {
            setIsExclusivePlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isExclusivePlaying, exclusiveDuration]);

  // Recording time tracker
  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);

  // Simulate listener count
  useEffect(() => {
    const interval = setInterval(() => {
      setListenerCount(prev => {
        if (isLive) {
          return Math.max(prev, Math.floor(Math.random() * 50) + 20);
        } else {
          return Math.floor(Math.random() * 15) + 5;
        }
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [isLive]);

  // Chat functionality
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_DISABLE_SOCKET_IO === 'true') {
      const channel = supabase.channel('chat');
      
      channel.on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, (payload: any) => {
        if (payload.new) {
          const newMessage = {
            id: payload.new.id || Date.now().toString(),
            username: payload.new.username || 'Anonymous',
            message: payload.new.message || '',
            timestamp: payload.new.timestamp || new Date().toLocaleTimeString()
          };
          setMessages(prev => [...prev, newMessage]);
        }
      });

      channel.subscribe();
    }
  }, []);

  const sendMessage = async () => {
    if (!newMessage.trim() || !username.trim()) return;

    const message = {
      id: Date.now().toString(),
      username,
      message: newMessage,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    try {
      await supabase.from('messages').insert([message]);
    } catch (error) {
      console.log('Message saved locally');
    }
  };

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const handleMicVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMicVolume(parseFloat(e.target.value));
  };

  const handleCrossfaderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCrossfader(parseFloat(e.target.value));
  };

  const enableMIDI = async () => {
    try {
      if (navigator.requestMIDIAccess) {
        const midiAccess = await navigator.requestMIDIAccess();
        midiAccess.onstatechange = (event) => {
          console.log('MIDI state changed:', event);
        };
        
        midiAccess.inputs.forEach((input) => {
          input.onmidimessage = (event) => {
            if (event.data && event.data[0] === 176) {
              if (event.data[1] === 7) {
                setVolume(event.data[2] / 127);
              } else if (event.data[1] === 8) {
                setCrossfader(event.data[2] / 127);
              }
            }
          };
        });
      }
    } catch (error) {
      console.log('MIDI not available');
    }
  };

  const goLiveAudio = async () => {
    try {
      if (!process.env.NEXT_PUBLIC_TWILIO_ACCOUNT_SID) {
        alert('Twilio is not configured. Audio streaming will be simulated.');
        setIsLive(true);
        setOnAirTime(0);
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true,
        video: false 
      });
    
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const destination = audioContext.createMediaStreamDestination();
      source.connect(destination);
    
      setIsLive(true);
      setOnAirTime(0);
      alert('Going Live with Audio! Audio stream captured successfully.');
      
      (window as any).audioStream = stream;
      
    } catch (error) {
      console.error('Failed to go live:', error);
      alert('Live streaming failed, but you can still use the DJ console in simulated mode.');
      setIsLive(true);
      setOnAirTime(0);
    }
  };

  const goLiveVideo = async () => {
    try {
      if (!process.env.NEXT_PUBLIC_TWILIO_ACCOUNT_SID) {
        alert('Twilio is not configured. Video streaming will be simulated.');
        setIsVideoLive(true);
        setIsLive(true);
        setOnAirTime(0);
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true,
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        }
      });

      const videoScreen = document.getElementById('video-live-screen');
      if (videoScreen) {
        videoScreen.innerHTML = `
          <video 
            autoplay 
            muted 
            style='width: 100%; height: 100%; border-radius: 8px; object-fit: cover;'
            id='live-video-feed'
          ></video>
        `;
        
        const videoElement = document.getElementById('live-video-feed') as HTMLVideoElement;
        if (videoElement) {
          videoElement.srcObject = stream;
        }
      }

      setIsVideoLive(true);
      setIsLive(true);
      setOnAirTime(0);
      alert('Going Live with Video! Video stream captured and displayed.');
      
      (window as any).videoStream = stream;
      
    } catch (error) {
      console.error('Failed to go live:', error);
      alert('Live streaming failed, but you can still use the DJ console in simulated mode.');
      setIsVideoLive(true);
      setIsLive(true);
      setOnAirTime(0);
    }
  };

  const stopLive = () => {
    setIsLive(false);
    setIsVideoLive(false);
    setOnAirTime(0);
    alert('Live streaming stopped!');
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      setExclusiveFile(file);
    }
  };

  const startExclusiveFromFile = async () => {
    if (!exclusiveFile) return;

    try {
      if (!exclusiveContextRef.current) {
        exclusiveContextRef.current = new AudioContext();
      }

      if (exclusiveContextRef.current.state === 'suspended') {
        await exclusiveContextRef.current.resume();
      }

      const arrayBuffer = await exclusiveFile.arrayBuffer();
      const audioBuffer = await exclusiveContextRef.current.decodeAudioData(arrayBuffer);
      
      setExclusiveDuration(Math.floor(audioBuffer.duration));
      setExclusiveElapsed(0);
      setIsExclusivePlaying(true);

      const source = exclusiveContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(exclusiveContextRef.current.destination);
      source.start();

      source.onended = () => {
        setIsExclusivePlaying(false);
        setExclusiveElapsed(0);
      };

    } catch (error) {
      console.error('Failed to play exclusive file:', error);
    }
  };

  const startPodcast = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `podcast-${Date.now()}.webm`;
        a.click();
        URL.revokeObjectURL(url);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
    } catch (error) {
      console.error('Failed to start podcast:', error);
    }
  };

  const stopPodcast = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg p-6 shadow-lg">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Now Playing</h2>
        <div className="flex items-center space-x-4">
          <button
            onClick={handlePlayPause}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            {isPlaying ? 'Pause' : 'Play'}
          </button>
          <div className="flex-1">
            <div className="text-lg font-semibold text-gray-900">
              {STREAMS[currentStreamIndex].name}
            </div>
            <div className="text-sm text-gray-600">Live Stream</div>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={handleVolumeChange}
              className="w-24"
            />
            <span className="text-sm text-gray-600">{Math.round(volume * 100)}%</span>
          </div>
        </div>
        <audio
          ref={audioRef}
          src={STREAMS[currentStreamIndex].url}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onError={(e) => console.error('Audio error:', e)}
        />
      </div>

      <div className="bg-white rounded-lg p-6 shadow-lg">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Live Chat</h2>
        
        {!isSignedIn ? (
          <div className="mb-4">
            <input
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 mr-2"
            />
            <button
              onClick={() => setIsSignedIn(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              Join Chat
            </button>
          </div>
        ) : (
          <div className="mb-4">
            <span className="text-sm text-gray-600">Signed in as: {username}</span>
            <button
              onClick={() => setIsSignedIn(false)}
              className="ml-2 text-blue-600 hover:text-blue-800"
            >
              Sign Out
            </button>
          </div>
        )}

        <div className="h-64 overflow-y-auto border border-gray-200 rounded-lg p-3 mb-4 bg-gray-50">
          {messages.map((msg) => (
            <div key={msg.id} className="mb-2">
              <span className="font-semibold text-blue-600">{msg.username}:</span>
              <span className="ml-2 text-gray-800">{msg.message}</span>
              <span className="ml-2 text-xs text-gray-500">{msg.timestamp}</span>
            </div>
          ))}
        </div>

        {isSignedIn && (
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
            />
            <button
              onClick={sendMessage}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
            >
              Send
            </button>
          </div>
        )}
      </div>

      <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-lg p-6 shadow-2xl border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-white">Professional DJ Console</h2>
          <div className="text-right">
            <div className="text-sm text-gray-300">Listeners</div>
            <div className="text-2xl font-bold text-green-400">{listenerCount}</div>
          </div>
        </div>
        
        {!session ? (
          <div className="text-center py-8">
            <button
              onClick={() => signIn()}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all transform hover:scale-105"
            >
              Sign In to Access DJ Console
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-gray-800 rounded-lg p-4">
              <span className="text-gray-300">Signed in as: <span className="text-white font-semibold">{session.user?.email}</span></span>
              <button
                onClick={() => signOut()}
                className="text-red-400 hover:text-red-300 transition-colors"
              >
                Sign Out
              </button>
            </div>

            {isAdmin && (
              <>
                {isLive && (
                  <div className="bg-gradient-to-r from-red-600 to-red-800 border border-red-500 rounded-lg p-4 animate-pulse">
                    <div className="text-red-100 font-bold text-xl text-center">ON AIR</div>
                    <div className="text-center text-red-200">
                      Time: {formatTime(onAirTime)}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="bg-gray-800 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-white mb-3">Live Audio</h3>
                        <button
                          onClick={isLive ? stopLive : goLiveAudio}
                          className={`w-full px-4 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 ${
                            isLive 
                              ? 'bg-red-600 hover:bg-red-700 text-white' 
                              : 'bg-green-600 hover:bg-green-700 text-white'
                          }`}
                        >
                          {isLive ? 'Stop Live' : 'Go Live Audio'}
                        </button>
                      </div>
                      
                      <div className="bg-gray-800 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-white mb-3">Live Video</h3>
                        <button
                          onClick={isVideoLive ? stopLive : goLiveVideo}
                          className={`w-full px-4 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 ${
                            isVideoLive 
                              ? 'bg-red-600 hover:bg-red-700 text-white' 
                              : 'bg-green-600 hover:bg-green-700 text-white'
                          }`}
                        >
                          {isVideoLive ? 'Stop Live' : 'Go Live Video'}
                        </button>
                      </div>
                    </div>

                    <div className="bg-gray-800 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-white mb-3">Play Exclusive</h3>
                      <div className="space-y-3">
                        <input
                          type="file"
                          accept="audio/*"
                          onChange={handleFileSelect}
                          className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700"
                        />
                        {exclusiveFile && (
                          <div className="bg-gray-700 rounded-lg p-3">
                            <div className="text-sm text-gray-300">File: <span className="text-white">{exclusiveFile.name}</span></div>
                            {isExclusivePlaying && (
                              <div className="text-sm text-gray-300 mt-2">
                                Duration: <span className="text-white">{formatTime(exclusiveElapsed)}</span> / <span className="text-white">{formatTime(exclusiveDuration)}</span>
                              </div>
                            )}
                          </div>
                        )}
                        <button
                          onClick={startExclusiveFromFile}
                          disabled={!exclusiveFile}
                          className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 disabled:transform-none"
                        >
                          {isExclusivePlaying ? 'Stop' : 'Play Exclusive'}
                        </button>
                      </div>
                    </div>

                    <div className="bg-gray-800 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-white mb-3">Podcast Recording</h3>
                      <div className="space-y-3">
                        {isRecording && (
                          <div className="bg-gray-700 rounded-lg p-3 text-center">
                            <div className="text-red-400 font-semibold">Recording...</div>
                            <div className="text-2xl font-bold text-white">{formatTime(recordingTime)}</div>
                          </div>
                        )}
                        <div className="flex space-x-2">
                          <button
                            onClick={isRecording ? stopPodcast : startPodcast}
                            className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 ${
                              isRecording 
                                ? 'bg-red-600 hover:bg-red-700 text-white' 
                                : 'bg-green-600 hover:bg-green-700 text-white'
                            }`}
                          >
                            {isRecording ? 'Stop Recording' : 'Start Recording'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-gray-800 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-white mb-3">Live Video Screen</h3>
                      <div id="video-live-screen" className="bg-gray-900 rounded-lg p-4 min-h-[300px] flex items-center justify-center">
                        {isVideoLive ? (
                          <div className="text-center">
                            <div className="text-green-400 text-2xl mb-2">Video</div>
                            <div className="text-white font-semibold">Live Video Streaming</div>
                            <div className="text-gray-400 text-sm">Your camera feed is live</div>
                          </div>
                        ) : (
                          <div className="text-center">
                            <div className="text-gray-500 text-4xl mb-2">Video</div>
                            <div className="text-gray-400 font-semibold">Video Screen</div>
                            <div className="text-gray-500 text-sm">Click Go Live Video to start</div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="bg-gray-800 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-white mb-4">Professional Controls</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Mic Volume
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={micVolume}
                            onChange={handleMicVolumeChange}
                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                          />
                          <div className="text-center text-white font-semibold mt-2">{Math.round(micVolume * 100)}%</div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Crossfader
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={crossfader}
                            onChange={handleCrossfaderChange}
                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                          />
                          <div className="text-center text-white font-semibold mt-2">{Math.round(crossfader * 100)}%</div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            EQ Controls
                          </label>
                          <div className="space-y-2">
                            <div>
                              <div className="text-xs text-gray-400">Low</div>
                              <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.1"
                                value={eqLow}
                                onChange={(e) => setEqLow(parseFloat(e.target.value))}
                                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                              />
                            </div>
                            <div>
                              <div className="text-xs text-gray-400">Mid</div>
                              <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.1"
                                value={eqMid}
                                onChange={(e) => setEqMid(parseFloat(e.target.value))}
                                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                              />
                            </div>
                            <div>
                              <div className="text-xs text-gray-400">High</div>
                              <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.1"
                                value={eqHigh}
                                onChange={(e) => setEqHigh(parseFloat(e.target.value))}
                                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 text-center">
                        <button
                          onClick={enableMIDI}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-105"
                        >
                          Enable MIDI Controller
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {!isAdmin && (
              <div className="text-center py-8">
                <div className="text-gray-400 text-lg">
                  DJ Console controls are only available to admin users.
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg p-6 shadow-lg">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Radio Schedule</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {schedule.map((slot, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="font-semibold text-gray-900">{slot.day}</div>
              <div className="text-sm text-gray-600">{slot.time}</div>
              <div className="text-purple-600 font-medium">{slot.show}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


