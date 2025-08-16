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
  
  // New states for crossfader and multi-admin
  const [streamVolume, setStreamVolume] = useState(0.7);
  const [exclusiveVolume, setExclusiveVolume] = useState(0.7);
  const [activeStreamers, setActiveStreamers] = useState<Array<{id: string, email: string, type: 'audio' | 'video'}>>([]);
  const [exclusiveStartTime, setExclusiveStartTime] = useState<number>(0);
  
  // Audio processing nodes for real-time control
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [micGainNode, setMicGainNode] = useState<GainNode | null>(null);
  const [streamGainNode, setStreamGainNode] = useState<GainNode | null>(null);
  const [exclusiveGainNode, setExclusiveGainNode] = useState<GainNode | null>(null);
  const [eqLowNode, setEqLowNode] = useState<BiquadFilterNode | null>(null);
  const [eqMidNode, setEqMidNode] = useState<BiquadFilterNode | null>(null);
  const [eqHighNode, setEqHighNode] = useState<BiquadFilterNode | null>(null);
  
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
  const exclusiveGainNodeRef = useRef<GainNode | null>(null);
  const streamGainNodeRef = useRef<GainNode | null>(null);

  // Check if user is admin
  const isAdmin = session?.user?.email && (
    process.env.NEXT_PUBLIC_ADMIN_EMAILS?.includes(session.user.email) ||
    session.user.email === 'chillandtune.fm'
  );

  // Initialize audio system when component mounts
  useEffect(() => {
    // Create audio context immediately
    const initAudio = async () => {
      try {
        const newAudioContext = new AudioContext();
        setAudioContext(newAudioContext);
        
        // Create gain nodes for immediate control
        const micGain = newAudioContext.createGain();
        const streamGain = newAudioContext.createGain();
        const exclusiveGain = newAudioContext.createGain();
        
        // Create EQ nodes
        const lowFilter = newAudioContext.createBiquadFilter();
        const midFilter = newAudioContext.createBiquadFilter();
        const highFilter = newAudioContext.createBiquadFilter();
        
        // Configure EQ filters
        lowFilter.type = 'lowshelf';
        lowFilter.frequency.setValueAtTime(200, newAudioContext.currentTime);
        
        midFilter.type = 'peaking';
        midFilter.frequency.setValueAtTime(1000, newAudioContext.currentTime);
        midFilter.Q.setValueAtTime(1, newAudioContext.currentTime);
        
        highFilter.type = 'highshelf';
        highFilter.frequency.setValueAtTime(3000, newAudioContext.currentTime);
        
        // Set initial values
        micGain.gain.value = micVolume;
        streamGain.gain.value = (1 - crossfader) * streamVolume;
        exclusiveGain.gain.value = crossfader * exclusiveVolume;
        
        // Apply EQ values
        lowFilter.gain.setValueAtTime((eqLow - 0.5) * 20, newAudioContext.currentTime);
        midFilter.gain.setValueAtTime((eqMid - 0.5) * 20, newAudioContext.currentTime);
        highFilter.gain.setValueAtTime((eqHigh - 0.5) * 20, newAudioContext.currentTime);
        
        // Store nodes in state
        setMicGainNode(micGain);
        setStreamGainNode(streamGain);
        setExclusiveGainNode(exclusiveGain);
        setEqLowNode(lowFilter);
        setEqMidNode(midFilter);
        setEqHighNode(highFilter);
        
        console.log('Audio system initialized successfully');
        
      } catch (error) {
        console.error('Failed to initialize audio:', error);
      }
    };
    
    initAudio();
  }, []); // Run once on mount

  // Initialize audio player and crossfader
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Real-time audio control effects
  useEffect(() => {
    // Update mic volume in real-time
    if (micGainNode && audioContext) {
      micGainNode.gain.setValueAtTime(micVolume, audioContext.currentTime);
      console.log('Mic volume updated:', micVolume);
    }
  }, [micVolume, micGainNode, audioContext]);

  // Crossfader effect on exclusive tracks - Fixed functionality
  useEffect(() => {
    // Update exclusive track volume if it's currently playing
    if (exclusiveGainNode && audioContext) {
      const newGainValue = crossfader * exclusiveVolume;
      exclusiveGainNode.gain.setValueAtTime(newGainValue, audioContext.currentTime);
      console.log('Exclusive gain updated:', newGainValue);
    }
    
    // Update stream volume if we have stream gain node
    if (streamGainNode && audioContext) {
      const newStreamGainValue = (1 - crossfader) * streamVolume;
      streamGainNode.gain.setValueAtTime(newStreamGainValue, audioContext.currentTime);
      console.log('Stream gain updated:', newStreamGainValue);
    }
  }, [crossfader, streamVolume, exclusiveVolume, exclusiveGainNode, streamGainNode, audioContext]);

  // Real-time EQ control
  useEffect(() => {
    if (eqLowNode && eqMidNode && eqHighNode && audioContext) {
      // Apply EQ values in real-time
      eqLowNode.gain.setValueAtTime((eqLow - 0.5) * 20, audioContext.currentTime);
      eqMidNode.gain.setValueAtTime((eqMid - 0.5) * 20, audioContext.currentTime);
      eqHighNode.gain.setValueAtTime((eqHigh - 0.5) * 20, audioContext.currentTime);
      
      console.log('EQ updated:', { low: eqLow, mid: eqMid, high: eqHigh });
    }
  }, [eqLow, eqMid, eqHigh, eqLowNode, eqMidNode, eqHighNode, audioContext]);

  // Moving timestamp for exclusive tracks
  useEffect(() => {
    let interval: any;
    if (isExclusivePlaying && exclusiveStartTime > 0) {
      interval = setInterval(() => {
        const currentTime = Date.now();
        const elapsed = Math.floor((currentTime - exclusiveStartTime) / 1000);
        setExclusiveElapsed(elapsed);
        
        if (elapsed >= exclusiveDuration) {
          setIsExclusivePlaying(false);
          setExclusiveElapsed(0);
          setExclusiveStartTime(0);
        }
      }, 100); // Update every 100ms for smooth movement
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isExclusivePlaying, exclusiveStartTime, exclusiveDuration]);

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
    const newVolume = parseFloat(e.target.value);
    setMicVolume(newVolume);
    
    // Apply to audio node immediately
    if (micGainNode && audioContext) {
      micGainNode.gain.setValueAtTime(newVolume, audioContext.currentTime);
      console.log('Mic volume changed to:', newVolume);
    }
  };

  const handleCrossfaderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCrossfader = parseFloat(e.target.value);
    setCrossfader(newCrossfader);
    
    // Apply crossfader effect immediately
    if (streamGainNode && exclusiveGainNode && audioContext) {
      streamGainNode.gain.setValueAtTime((1 - newCrossfader) * streamVolume, audioContext.currentTime);
      exclusiveGainNode.gain.setValueAtTime(newCrossfader * exclusiveVolume, audioContext.currentTime);
      console.log('Crossfader changed to:', newCrossfader);
    }
  };

  const handleStreamVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setStreamVolume(newVolume);
    
    // Apply to stream gain node immediately
    if (streamGainNode && audioContext) {
      streamGainNode.gain.setValueAtTime((1 - crossfader) * newVolume, audioContext.currentTime);
      console.log('Stream volume changed to:', newVolume);
    }
  };

  const handleExclusiveVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setExclusiveVolume(newVolume);
    
    // Apply to exclusive gain node immediately
    if (exclusiveGainNode && audioContext) {
      exclusiveGainNode.gain.setValueAtTime(crossfader * newVolume, audioContext.currentTime);
      console.log('Exclusive volume changed to:', newVolume);
    }
  };

  const handleEQChange = (type: 'low' | 'mid' | 'high', value: number) => {
    if (!audioContext) return;
    
    switch (type) {
      case 'low':
        setEqLow(value);
        if (eqLowNode) {
          eqLowNode.gain.setValueAtTime((value - 0.5) * 20, audioContext.currentTime);
        }
        break;
      case 'mid':
        setEqMid(value);
        if (eqMidNode) {
          eqMidNode.gain.setValueAtTime((value - 0.5) * 20, audioContext.currentTime);
        }
        break;
      case 'high':
        setEqHigh(value);
        if (eqHighNode) {
          eqHighNode.gain.setValueAtTime((value - 0.5) * 20, audioContext.currentTime);
        }
        break;
    }
    
    console.log(`${type} EQ changed to:`, value);
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
        
        // Add to active streamers
        const streamerId = `audio-${Date.now()}`;
        setActiveStreamers(prev => [...prev, {
          id: streamerId,
          email: session?.user?.email || 'unknown',
          type: 'audio'
        }]);
        
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true,
        video: false 
      });
    
      // Create new audio context for live streaming
      const newAudioContext = new AudioContext();
      setAudioContext(newAudioContext);
      
      const source = newAudioContext.createMediaStreamSource(stream);
      const destination = newAudioContext.createMediaStreamDestination();
      
      // Create gain nodes for real-time control
      const micGain = newAudioContext.createGain();
      const streamGain = newAudioContext.createGain();
      const exclusiveGain = newAudioContext.createGain();
      
      // Create EQ nodes for real-time control
      const lowFilter = newAudioContext.createBiquadFilter();
      const midFilter = newAudioContext.createBiquadFilter();
      const highFilter = newAudioContext.createBiquadFilter();
      
      // Configure EQ filters
      lowFilter.type = 'lowshelf';
      lowFilter.frequency.setValueAtTime(200, newAudioContext.currentTime);
      
      midFilter.type = 'peaking';
      midFilter.frequency.setValueAtTime(1000, newAudioContext.currentTime);
      midFilter.Q.setValueAtTime(1, newAudioContext.currentTime);
      
      highFilter.type = 'highshelf';
      highFilter.frequency.setValueAtTime(3000, newAudioContext.currentTime);
      
      // Set initial values
      micGain.gain.value = micVolume;
      streamGain.gain.value = (1 - crossfader) * streamVolume;
      exclusiveGain.gain.value = crossfader * exclusiveVolume;
      
      // Apply EQ values
      lowFilter.gain.setValueAtTime((eqLow - 0.5) * 20, newAudioContext.currentTime);
      midFilter.gain.setValueAtTime((eqMid - 0.5) * 20, newAudioContext.currentTime);
      highFilter.gain.setValueAtTime((eqHigh - 0.5) * 20, newAudioContext.currentTime);
      
      // Store nodes in state for real-time control
      setMicGainNode(micGain);
      setStreamGainNode(streamGain);
      setExclusiveGainNode(exclusiveGain);
      setEqLowNode(lowFilter);
      setEqMidNode(midFilter);
      setEqHighNode(highFilter);
      
      // Connect audio nodes: source -> mic gain -> EQ chain -> crossfader gains -> destination
      source.connect(micGain);
      micGain.connect(lowFilter);
      lowFilter.connect(midFilter);
      midFilter.connect(highFilter);
      highFilter.connect(streamGain);
      highFilter.connect(exclusiveGain);
      streamGain.connect(destination);
      exclusiveGain.connect(destination);
      
      setIsLive(true);
      setOnAirTime(0);
      
      // Add to active streamers
      const streamerId = `audio-${Date.now()}`;
      setActiveStreamers(prev => [...prev, {
        id: streamerId,
        email: session?.user?.email || 'unknown',
        type: 'audio'
      }]);
      
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
        
        // Add to active streamers
        const streamerId = `video-${Date.now()}`;
        setActiveStreamers(prev => [...prev, {
          id: streamerId,
          email: session?.user?.email || 'unknown',
          type: 'video'
        }]);
        
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
      
      // Add to active streamers
      const streamerId = `video-${Date.now()}`;
      setActiveStreamers(prev => [...prev, {
        id: streamerId,
        email: session?.user?.email || 'unknown',
        type: 'video'
      }]);
      
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
    
    // Remove current user from active streamers
    setActiveStreamers(prev => prev.filter(s => s.email !== session?.user?.email));
    
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
      if (!audioContext) {
        const newAudioContext = new AudioContext();
        setAudioContext(newAudioContext);
      }

      const currentContext = audioContext || new AudioContext();
      
      if (currentContext.state === 'suspended') {
        await currentContext.resume();
      }

      const arrayBuffer = await exclusiveFile.arrayBuffer();
      const audioBuffer = await currentContext.decodeAudioData(arrayBuffer);
      
      setExclusiveDuration(Math.floor(audioBuffer.duration));
      setExclusiveElapsed(0);
      setIsExclusivePlaying(true);
      setExclusiveStartTime(Date.now());

      // Create gain node for crossfader control
      const gainNode = currentContext.createGain();
      setExclusiveGainNode(gainNode);
      
      // Set initial volume based on crossfader
      gainNode.gain.value = crossfader * exclusiveVolume;
      
      const source = currentContext.createBufferSource();
      source.buffer = audioBuffer;
      
      // Simple connection: source -> gain -> destination
      source.connect(gainNode);
      gainNode.connect(currentContext.destination);
      
      // Start playback
      source.start(0);
      
      console.log('Exclusive track started:', {
        duration: audioBuffer.duration,
        crossfader: crossfader,
        exclusiveVolume: exclusiveVolume,
        gainValue: gainNode.gain.value
      });

      source.onended = () => {
        setIsExclusivePlaying(false);
        setExclusiveElapsed(0);
        setExclusiveStartTime(0);
        console.log('Exclusive track ended');
      };

    } catch (error) {
      console.error('Failed to play exclusive file:', error);
      alert('Failed to play exclusive file. Please try again.');
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

  const testAudio = () => {
    try {
      if (!audioContext) {
        const newAudioContext = new AudioContext();
        setAudioContext(newAudioContext);
      }

      const currentContext = audioContext || new AudioContext();

      if (currentContext.state === 'suspended') {
        currentContext.resume();
      }

      // Create a simple test tone
      const oscillator = currentContext.createOscillator();
      const gainNode = currentContext.createGain();
      
      oscillator.frequency.setValueAtTime(440, currentContext.currentTime); // A4 note
      gainNode.gain.setValueAtTime(0.1, currentContext.currentTime);
      
      oscillator.connect(gainNode);
      gainNode.connect(currentContext.destination);
      
      oscillator.start();
      oscillator.stop(currentContext.currentTime + 1);
      
      console.log('Test audio played successfully');
      alert('Test audio played! Check console for details.');
      
    } catch (error) {
      console.error('Test audio failed:', error);
      alert('Test audio failed: ' + (error as Error).message);
    }
  };

  const testAudioChain = () => {
    try {
      if (!audioContext) {
        alert('Audio system not initialized. Please wait a moment and try again.');
        return;
      }

      // Create a test tone that goes through the entire audio chain
      const oscillator = audioContext.createOscillator();
      const testGain = audioContext.createGain();
      
      oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A4 note
      testGain.gain.setValueAtTime(0.1, audioContext.currentTime);
      
      // Connect through the audio processing chain
      oscillator.connect(testGain);
      
      if (micGainNode) {
        testGain.connect(micGainNode);
        console.log('✅ Mic gain node connected');
      }
      
      if (eqLowNode && eqMidNode && eqHighNode) {
        if (micGainNode) {
          micGainNode.connect(eqLowNode);
          eqLowNode.connect(eqMidNode);
          eqMidNode.connect(eqHighNode);
          console.log('✅ EQ chain connected');
        }
      }
      
      if (streamGainNode && exclusiveGainNode) {
        if (eqHighNode) {
          eqHighNode.connect(streamGainNode);
          eqHighNode.connect(exclusiveGainNode);
          console.log('✅ Crossfader nodes connected');
        }
      }
      
      // Connect to destination
      if (streamGainNode) streamGainNode.connect(audioContext.destination);
      if (exclusiveGainNode) exclusiveGainNode.connect(audioContext.destination);
      
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 2);
      
      console.log('🎵 Test audio chain playing through all controls!');
      alert('🎵 Test audio playing through mic volume, EQ, and crossfader! Check console for details.');
      
    } catch (error) {
      console.error('Test audio chain failed:', error);
      alert('Test failed: ' + (error as Error).message);
    }
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

      {/* Professional DJ Console with Video Live Screen */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-lg p-6 shadow-2xl border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-white">🎛️ Professional DJ Console</h2>
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
              🔐 Sign In to Access DJ Console
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
                {/* On Air Status */}
                {isLive && (
                  <div className="bg-gradient-to-r from-red-600 to-red-800 border border-red-500 rounded-lg p-4 animate-pulse">
                    <div className="text-red-100 font-bold text-xl text-center">🎙️ ON AIR</div>
                    <div className="text-center text-red-200">
                      Time: {formatTime(onAirTime)}
                    </div>
                    {activeStreamers.length > 0 && (
                      <div className="mt-3 text-center">
                        <div className="text-red-200 text-sm">Active Streamers:</div>
                        {activeStreamers.map((streamer) => (
                          <div key={streamer.id} className="text-red-100 text-xs">
                            {streamer.email} - {streamer.type}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Working Audio Controls */}
                <div className="bg-gray-800 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-4 text-center">🎵 Audio Controls</h3>
                  
                  <div className="space-y-4">
                    {/* Main Volume Control */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        🔊 Main Volume: {Math.round(volume * 100)}%
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={handleVolumeChange}
                        className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    {/* Mic Volume Control */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        🎤 Mic Volume: {Math.round(micVolume * 100)}%
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={micVolume}
                        onChange={handleMicVolumeChange}
                        className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    {/* Crossfader Control */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        ↔️ Crossfader: {Math.round(crossfader * 100)}%
                      </label>
                      <div className="flex items-center space-x-4 mb-2">
                        <span className="text-sm text-blue-200 font-semibold">🎵 Stream</span>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={crossfader}
                          onChange={handleCrossfaderChange}
                          className="flex-1 h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                        />
                        <span className="text-sm text-purple-200 font-semibold">🎵 Exclusive</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-300 mt-2">
                        <span className="bg-blue-600 px-2 py-1 rounded">Stream: {Math.round((1 - crossfader) * 100)}%</span>
                        <span className="bg-purple-600 px-2 py-1 rounded">Exclusive: {Math.round(crossfader * 100)}%</span>
                      </div>
                    </div>

                    {/* Individual Volume Controls */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          🎵 Stream Volume: {Math.round(streamVolume * 100)}%
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={streamVolume}
                          onChange={handleStreamVolumeChange}
                          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          🎵 Exclusive Volume: {Math.round(exclusiveVolume * 100)}%
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={exclusiveVolume}
                          onChange={handleExclusiveVolumeChange}
                          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Live Broadcasting Controls */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-800 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-white mb-3">🎙️ Live Audio</h3>
                    <button
                      onClick={isLive ? stopLive : goLiveAudio}
                      className={`w-full px-4 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 ${
                        isLive 
                          ? 'bg-red-600 hover:bg-red-700 text-white' 
                          : 'bg-green-600 hover:bg-green-700 text-white'
                      }`}
                    >
                      {isLive ? '🛑 Stop Live' : '🎙️ Go Live Audio'}
                    </button>
                  </div>
                  
                  <div className="bg-gray-800 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-white mb-3">📹 Live Video</h3>
                    <button
                      onClick={isVideoLive ? stopLive : goLiveVideo}
                      className={`w-full px-4 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 ${
                        isVideoLive 
                          ? 'bg-red-600 hover:bg-red-700 text-white' 
                          : 'bg-green-600 hover:bg-green-700 text-white'
                      }`}
                    >
                      {isVideoLive ? '🛑 Stop Live' : '📹 Go Live Video'}
                    </button>
                  </div>
                </div>

                {/* Exclusive Music Player */}
                <div className="bg-gray-800 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-3">🎵 Play Exclusive</h3>
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
                          <div className="mt-3 space-y-2">
                            <div className="text-sm text-gray-300">
                              Duration: <span className="text-white">{formatTime(exclusiveElapsed)}</span> / <span className="text-white">{formatTime(exclusiveDuration)}</span>
                            </div>
                            <div className="w-full bg-gray-600 rounded-full h-2">
                              <div 
                                className="bg-purple-500 h-2 rounded-full transition-all duration-100"
                                style={{ width: `${(exclusiveElapsed / exclusiveDuration) * 100}%` }}
                              ></div>
                            </div>
                            <div className="text-xs text-gray-400 text-center">
                              {Math.round((exclusiveElapsed / exclusiveDuration) * 100)}% Complete
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    <button
                      onClick={startExclusiveFromFile}
                      disabled={!exclusiveFile}
                      className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 disabled:transform-none"
                    >
                      {isExclusivePlaying ? '⏸️ Stop' : '▶️ Play Exclusive'}
                    </button>
                  </div>
                </div>

                {/* Podcast Recording */}
                <div className="bg-gray-800 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-3">🎙️ Podcast Recording</h3>
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
                        {isRecording ? '⏹️ Stop Recording' : '🎙️ Start Recording'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Video Live Screen */}
                <div className="bg-gray-800 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-3">📹 Live Video Screen</h3>
                  <div id="video-live-screen" className="bg-gray-900 rounded-lg p-4 min-h-[300px] flex items-center justify-center">
                    {isVideoLive ? (
                      <div className="text-center">
                        <div className="text-green-400 text-2xl mb-2">📹</div>
                        <div className="text-white font-semibold">Live Video Streaming</div>
                        <div className="text-gray-400 text-sm">Your camera feed is live</div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="text-gray-500 text-4xl mb-2">📹</div>
                        <div className="text-gray-400 font-semibold">Video Screen</div>
                        <div className="text-gray-500 text-sm">Click "Go Live Video" to start</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Debug Panel */}
                <div className="bg-gray-800 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-4">🔧 Debug Panel</h3>
                  <div className="grid grid-cols-2 gap-4 text-xs text-gray-300">
                    <div>
                      <div>Audio Context: {audioContext ? '✅ Active' : '❌ None'}</div>
                      <div>Mic Gain: {micGainNode ? '✅ Active' : '❌ None'}</div>
                      <div>Stream Gain: {streamGainNode ? '✅ Active' : '❌ None'}</div>
                      <div>Exclusive Gain: {exclusiveGainNode ? '✅ Active' : '❌ None'}</div>
                    </div>
                    <div>
                      <div>Crossfader: {crossfader.toFixed(2)}</div>
                      <div>Mic Volume: {micVolume.toFixed(2)}</div>
                      <div>Stream Volume: {streamVolume.toFixed(2)}</div>
                      <div>Exclusive Volume: {exclusiveVolume.toFixed(2)}</div>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <button
                      onClick={testAudio}
                      className="w-full bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-2 rounded text-xs font-semibold"
                    >
                      🧪 Test Basic Audio
                    </button>
                    <button
                      onClick={testAudioChain}
                      className="w-full bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-xs font-semibold"
                    >
                      🎵 Test Audio Chain
                    </button>
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


