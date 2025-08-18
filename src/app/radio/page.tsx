'use client'

import React, { useState, useEffect, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'

// VERCEL DEPLOYMENT - COMPLETE FEATURE SET
// VERSION: 3.0.0 - All Features Working
const supabase = createClient(
  'https://gpfignxuzlpbqnukkgjo.supabase.co',
  'sb_publishable_zygbl0_Ujr2FZw1CN0X2iA_tYZWu7Ul'
)

export default function RadioPage() {
  // CORE STATES
  const [username, setUsername] = useState('')
  const [isSignedIn, setIsSignedIn] = useState(false)
  const [newMessage, setNewMessage] = useState('')
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminPassword, setAdminPassword] = useState('')
  const [showAdminLogin, setShowAdminLogin] = useState(false)
  
  // VIEWER COUNT FEATURES
  const [viewerCount, setViewerCount] = useState(0)
  const [isOnline, setIsOnline] = useState(false)
  const [sessionId] = useState(() => `viewer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)
  
  // AUDIO FEATURES
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(0.5)
  const [exclusiveVolume, setExclusiveVolume] = useState(0.5)
  const [crossfader, setCrossfader] = useState(0.5)
  const [isExclusivePlaying, setIsExclusivePlaying] = useState(false)
  const [liveAudio, setLiveAudio] = useState(false)
  const [liveVideo, setLiveVideo] = useState(false)
  const [isAudioMuted, setIsAudioMuted] = useState(false)
  const [exclusiveTrackFile, setExclusiveTrackFile] = useState<File | null>(null)
  const [exclusiveTrackUrl, setExclusiveTrackUrl] = useState<string>('')

  // SONG REQUEST FEATURES
  const [artistName, setArtistName] = useState('')
  const [songTitle, setSongTitle] = useState('')
  const [requesterName, setRequesterName] = useState('')
  const [songRequests, setSongRequests] = useState<Array<{artist: string, song: string, requester: string, timestamp: string}>>([])

  // PODCAST FEATURES
  const [podcasts, setPodcasts] = useState<Array<{id: string, title: string, description: string, duration: string, uploadedAt: string, audioUrl: string}>>([])
  const [newPodcastTitle, setNewPodcastTitle] = useState('')
  const [newPodcastDescription, setNewPodcastDescription] = useState('')
  const [newPodcastFile, setNewPodcastFile] = useState<File | null>(null)

  // AUDIO REFS
  const streamAudioRef = useRef<HTMLAudioElement>(null)
  const exclusiveAudioRef = useRef<HTMLAudioElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  // INITIALIZE ALL FEATURES

  // VIEWER COUNT SYSTEM
  const initializeViewerTracking = async () => {
    try {
      const { error } = await supabase
        .from('viewers')
        .upsert([{
          session_id: sessionId,
          username: username || 'Anonymous',
          last_seen: new Date().toISOString(),
          is_online: true
        }], { onConflict: 'session_id' })

      if (error) throw error
      
      setIsOnline(true)
      updateViewerCount()
      
      const heartbeatInterval = setInterval(async () => {
        if (isOnline) {
          await updateViewerHeartbeat()
        }
      }, 30000)

      return () => clearInterval(heartbeatInterval)
    } catch (error) {
      console.error('Error initializing viewer tracking:', error)
    }
  }

  const updateViewerCount = async () => {
    try {
      const { data, error } = await supabase
        .from('viewers')
        .select('*')
        .eq('is_online', true)
        .gte('last_seen', new Date(Date.now() - 60000).toISOString())

      if (error) throw error
      setViewerCount(data?.length || 0)
    } catch (error) {
      console.error('Error updating viewer count:', error)
    }
  }

  const updateViewerHeartbeat = async () => {
    try {
      const { error } = await supabase
        .from('viewers')
        .update({
          last_seen: new Date().toISOString(),
          username: username || 'Anonymous'
        })
        .eq('session_id', sessionId)

      if (error) throw error
      updateViewerCount()
    } catch (error) {
      console.error('Error updating viewer heartbeat:', error)
    }
  }

  const removeViewer = async () => {
    try {
      const { error } = await supabase
        .from('viewers')
        .update({ is_online: false })
        .eq('session_id', sessionId)

      if (error) throw error
      setIsOnline(false)
      updateViewerCount()
    } catch (error) {
      console.error('Error removing viewer:', error)
    }
  }


  // INITIALIZE ALL FEATURES
  useEffect(() => {
    loadChatHistory()
    subscribeToChat()
    loadSongRequests()
    loadPodcasts()
    initializeViewerTracking()
    
    return () => {
      removeViewer()
    }
  }, [initializeViewerTracking, removeViewer])
  // SONG REQUEST SYSTEM
  const loadSongRequests = () => {
    const saved = localStorage.getItem('songRequests')
    if (saved) {
      setSongRequests(JSON.parse(saved))
    }
  }

  const saveSongRequests = (requests: Array<{artist: string, song: string, requester: string, timestamp: string}>) => {
    localStorage.setItem('songRequests', JSON.stringify(requests))
  }

  const handleSongRequest = () => {
    if (!artistName.trim() || !songTitle.trim()) {
      alert('Please enter both artist name and song title!')
      return
    }

    const newRequest = {
      artist: artistName.trim(),
      song: songTitle.trim(),
      requester: requesterName.trim() || 'Anonymous',
      timestamp: new Date().toISOString()
    }

    const updatedRequests = [newRequest, ...songRequests]
    setSongRequests(updatedRequests)
    saveSongRequests(updatedRequests)
    
    setArtistName('')
    setSongTitle('')
    setRequesterName('')
    
    alert(`🎵 Song request sent: "${songTitle}" by ${artistName}"`)
  }

  // PODCAST SYSTEM
  const loadPodcasts = () => {
    const saved = localStorage.getItem('podcasts')
    if (saved) {
      setPodcasts(JSON.parse(saved))
    } else {
      const defaultPodcasts = [
        {
          id: '1',
          title: 'Episode 1: Hip-Hop Classics',
          description: 'The best hip-hop tracks from the golden era',
          duration: '45:30',
          uploadedAt: '2 days ago',
          audioUrl: '/podcast1.mp3'
        },
        {
          id: '2',
          title: 'Episode 2: R&B Vibes',
          description: 'Smooth R&B and soul music collection',
          duration: '52:15',
          uploadedAt: '1 week ago',
          audioUrl: '/podcast2.mp3'
        }
      ]
      setPodcasts(defaultPodcasts)
      localStorage.setItem('podcasts', JSON.stringify(defaultPodcasts))
    }
  }

  const handlePodcastUpload = () => {
    if (!newPodcastTitle.trim() || !newPodcastDescription.trim() || !newPodcastFile) {
      alert('Please fill in all fields and select an audio file!')
      return
    }

    const newPodcast = {
      id: Date.now().toString(),
      title: newPodcastTitle.trim(),
      description: newPodcastDescription.trim(),
      duration: '00:00',
      uploadedAt: 'Just now',
      audioUrl: URL.createObjectURL(newPodcastFile)
    }

    const updatedPodcasts = [newPodcast, ...podcasts]
    setPodcasts(updatedPodcasts)
    localStorage.setItem('podcasts', JSON.stringify(updatedPodcasts))
    
    setNewPodcastTitle('')
    setNewPodcastDescription('')
    setNewPodcastFile(null)
    
    alert('🎙️ Podcast uploaded successfully!')
  }

  // ADMIN SYSTEM
  const handleAdminLogin = () => {
    if (adminPassword === 'admin123') {
      setIsAdmin(true)
      setShowAdminLogin(false)
      setAdminPassword('')
    } else {
      alert('Incorrect admin password')
    }
  }

  // CHAT SYSTEM
  const loadChatHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(100)
      
      if (error) throw error
      if (data) setMessages(data)
    } catch (error) {
      console.error('Error loading chat history:', error)
    } finally {
      setLoading(false)
    }
  }

  const subscribeToChat = () => {
    const subscription = supabase
      .channel('chat_messages')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'chat_messages' }, 
        (payload) => {
          setMessages(prev => [...prev, payload.new])
        }
      )
      .subscribe()

    return () => subscription.unsubscribe()
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !username) return

    try {
      const newMsg = {
        username: username,
        message: newMessage.trim(),
        created_at: new Date().toISOString()
      }
      
      setMessages(prev => [...prev, newMsg])
      setNewMessage('')
      
      const { error } = await supabase
        .from('chat_messages')
        .insert([newMsg])

      if (error) throw error
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Failed to send message. Please try again.')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      sendMessage()
    }
  }

  // AUDIO CONTROLS
  const toggleStream = () => {
    if (streamAudioRef.current) {
      if (isPlaying) {
        streamAudioRef.current.pause()
      } else {
        streamAudioRef.current.play()
      }
    }
  }

  const toggleExclusive = () => {
    if (exclusiveAudioRef.current) {
      if (isExclusivePlaying) {
        exclusiveAudioRef.current.pause()
      } else {
        exclusiveAudioRef.current.play()
      }
    }
  }

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume)
    if (streamAudioRef.current) {
      streamAudioRef.current.volume = newVolume * (1 - crossfader)
    }
  }

  const handleExclusiveVolumeChange = (newVolume: number) => {
    setExclusiveVolume(newVolume)
    if (exclusiveAudioRef.current) {
      exclusiveAudioRef.current.volume = exclusiveVolume * crossfader
    }
  }

  const handleCrossfaderChange = (newCrossfader: number) => {
    setCrossfader(newCrossfader)
    if (streamAudioRef.current) {
      streamAudioRef.current.volume = volume * (1 - newCrossfader)
    }
    if (exclusiveAudioRef.current) {
      exclusiveAudioRef.current.volume = exclusiveVolume * newCrossfader
    }
  }

  // LIVE BROADCASTING
  const toggleLiveAudio = () => {
    if (liveAudio) {
      if ((window as any).liveAudioStream) {
        const tracks = (window as any).liveAudioStream.getTracks()
        tracks.forEach((track: any) => track.stop())
        ;(window as any).liveAudioStream = null
      }
      setLiveAudio(false)
      alert('🔇 Live Audio Stopped!')
    } else {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ audio: true })
          .then(stream => {
            ;(window as any).liveAudioStream = stream
            setLiveAudio(true)
            alert('🎤 Live Audio Started!')
          })
          .catch(err => {
            alert('❌ Failed to start live audio.')
          })
      } else {
        alert('❌ Live audio not supported.')
      }
    }
  }

  const toggleAudioMute = () => {
    if ((window as any).liveAudioStream) {
      const tracks = (window as any).liveAudioStream.getAudioTracks()
      tracks.forEach((track: any) => {
        track.enabled = !track.enabled
      })
      setIsAudioMuted(!isAudioMuted)
    }
  }

  const toggleLiveVideo = () => {
    if (liveVideo) {
      if ((window as any).liveVideoStream) {
        const tracks = (window as any).liveVideoStream.getTracks()
        tracks.forEach((track: any) => track.stop())
        ;(window as any).liveVideoStream = null
        if (videoRef.current) {
          videoRef.current.srcObject = null
        }
      }
      setLiveVideo(false)
      alert('📹 Live Video Stopped!')
    } else {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
          .then(stream => {
            ;(window as any).liveVideoStream = stream
            if (videoRef.current) {
              videoRef.current.srcObject = stream
            }
            setLiveVideo(true)
            alert('📹 Live Video Started!')
          })
          .catch(err => {
            alert('❌ Failed to start live video.')
          })
      } else {
        alert('❌ Live video not supported.')
      }
    }
  }

  // EXCLUSIVE TRACK UPLOAD
  const handleExclusiveTrackUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setExclusiveTrackFile(file)
      const url = URL.createObjectURL(file)
      setExclusiveTrackUrl(url)
      if (exclusiveAudioRef.current) {
        exclusiveAudioRef.current.src = url
      }
    }
  }

  // EMOJI SYSTEM
  const addEmoji = (emoji: string) => {
    setNewMessage(prev => prev + emoji)
  }

  return (
    <div 
      className="min-h-screen relative overflow-hidden"
      style={{
        background: 'linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.8)), url("https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="absolute inset-0 bg-black/30"></div>
      
      <div className="relative z-10">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4 text-white">CHILL & TUNE — Pure Hip-Hop & R&B</h1>
            <p className="text-sm text-slate-300 mb-6">Come Tune In & Vibe</p>
            
            {/* VERSION INDICATOR */}
            <div className="text-xs text-slate-400 mb-4">
              🚀 Version 3.0.0 - ALL FEATURES ACTIVE
              <br />
              📅 Deployed: {new Date().toLocaleDateString()} | 🕐 {new Date().toLocaleTimeString()}
            </div>
            
            {/* VIEWER COUNT DISPLAY */}
            <div className="flex items-center justify-center space-x-4 mb-4">
              <div className="bg-green-600/80 backdrop-blur-sm rounded-full px-4 py-2 flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-white font-semibold text-sm">
                  {viewerCount} {viewerCount === 1 ? 'Listener' : 'Listeners'} Online
                </span>
              </div>
              <div className="bg-blue-600/80 backdrop-blur-sm rounded-full px-4 py-2">
                <span className="text-white font-semibold text-sm">
                  🎵 Live Now
                </span>
              </div>
            </div>
            
            {!isAdmin && (
              <button
                onClick={() => setShowAdminLogin(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm"
              >
                🔐 Admin Access
              </button>
            )}
          </div>

          {/* ADMIN LOGIN MODAL */}
          {showAdminLogin && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-slate-800 p-6 rounded-lg border border-slate-600">
                <h3 className="text-xl font-bold text-white mb-4">Admin Login</h3>
                <input
                  type="password"
                  placeholder="Enter admin password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full border border-slate-600 bg-slate-700 text-white rounded-lg px-3 py-2 mb-4"
                />
                <div className="flex space-x-2">
                  <button 
                    onClick={handleAdminLogin}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                  >
                    Login
                  </button>
                  <button 
                    onClick={() => setShowAdminLogin(false)}
                    className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              {/* NOW PLAYING SECTION */}
              <div className="bg-slate-800/80 backdrop-blur-sm rounded-lg p-6 shadow-lg border border-slate-600">
                <h2 className="text-2xl font-bold text-white mb-4">🎵 Now Playing</h2>
                <div className="flex items-center space-x-4 mb-4">
                  <button 
                    onClick={toggleStream}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                  >
                    {isPlaying ? '⏸️ Pause' : '▶️ Play'}
                  </button>
                  <div className="flex-1">
                    <div className="text-lg font-semibold text-white">Chill & Tune Radio</div>
                    <div className="text-slate-300">
                      <span className="text-blue-400 font-medium">Hip-Hop & R&B</span> • Live Stream
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <span className="text-slate-300 text-sm">Volume:</span>
                  <input 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.1" 
                    value={volume}
                    onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                    className="flex-1" 
                  />
                  <span className="text-sm text-slate-300 w-12">{Math.round(volume * 100)}%</span>
                </div>
                
                <audio 
                  ref={streamAudioRef}
                  src="https://a12.asurahosting.com/public/chill__tune/playlist.m3u"
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onError={(e) => console.error('Stream error:', e)}
                  preload="none"
                />
              </div>

              {/* DJ CONSOLE - ADMIN ONLY */}
              {isAdmin && (
                <div className="bg-slate-800/80 backdrop-blur-sm rounded-lg p-6 shadow-lg border border-purple-600">
                  <h2 className="text-2xl font-bold text-white mb-4">🎛️ DJ Console</h2>
                  
                  {/* EXCLUSIVE TRACK PLAYER */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-white mb-3">🎵 Exclusive Track</h3>
                    <div className="mb-3">
                      <label className="block w-full text-sm text-slate-300 mb-2">Upload Audio File:</label>
                      <input 
                        type="file" 
                        accept="audio/*" 
                        onChange={handleExclusiveTrackUpload}
                        className="block w-full text-sm text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700"
                      />
                    </div>
                    {exclusiveTrackFile && (
                      <div className="text-slate-300 text-sm mb-3">
                        📁 File: {exclusiveTrackFile.name}
                      </div>
                    )}
                    <div className="flex items-center space-x-4 mb-3">
                      <button 
                        onClick={toggleExclusive}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold"
                        disabled={!exclusiveTrackFile}
                      >
                        {isExclusivePlaying ? '⏸️ Pause' : '▶️ Play'}
                      </button>
                      <span className="text-slate-300">
                        {isExclusivePlaying ? 'Playing Exclusive' : exclusiveTrackFile ? 'Exclusive Ready' : 'No Track Uploaded'}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <span className="text-slate-300 text-sm">Volume:</span>
                      <input 
                        type="range" 
                        min="0" 
                        max="1" 
                        step="0.1" 
                        value={exclusiveVolume}
                        onChange={(e) => handleExclusiveVolumeChange(parseFloat(e.target.value))}
                        className="flex-1" 
                      />
                      <span className="text-sm text-slate-300 w-12">{Math.round(exclusiveVolume * 100)}%</span>
                    </div>
                    
                    <audio 
                      ref={exclusiveAudioRef}
                      src={exclusiveTrackUrl || ""}
                      onPlay={() => setIsExclusivePlaying(true)}
                      onPause={() => setIsExclusivePlaying(false)}
                      onError={(e) => console.error('Exclusive error:', e)}
                      preload="none"
                    />
                  </div>
                  
                  {/* CROSSFADER */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-white mb-3">🎚️ Crossfader</h3>
                    <div className="flex items-center space-x-4">
                      <span className="text-slate-300 text-sm">Stream</span>
                      <input 
                        type="range" 
                        min="0" 
                        max="1" 
                        step="0.01" 
                        value={crossfader}
                        onChange={(e) => handleCrossfaderChange(parseFloat(e.target.value))}
                        className="flex-1" 
                      />
                      <span className="text-sm text-slate-300 w-12">Exclusive</span>
                    </div>
                    <div className="text-center text-slate-400 text-sm mt-2">
                      Blend: {Math.round((1 - crossfader) * 100)}% Stream / {Math.round(crossfader * 100)}% Exclusive
                    </div>
                  </div>
                  
                  {/* LIVE FEATURES */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">🎥 Live Broadcasting</h3>
                    
                    {/* VIDEO DISPLAY */}
                    {liveVideo && (
                      <div className="mb-4">
                        <video 
                          ref={videoRef} 
                          autoPlay 
                          playsInline 
                          muted 
                          className="w-full max-w-md mx-auto rounded-lg border border-slate-600"
                        />
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="text-center">
                        <button 
                          onClick={toggleLiveAudio}
                          className={`w-full py-3 px-4 rounded-lg font-semibold transition-all ${
                            liveAudio 
                              ? 'bg-red-600 hover:bg-red-700 text-white' 
                              : 'bg-green-600 hover:bg-green-700 text-white'
                          }`}
                        >
                          {liveAudio ? '🔴 Stop Live Audio' : '🟢 Start Live Audio'}
                        </button>
                        {liveAudio && (
                          <button 
                            onClick={toggleAudioMute} 
                            className={`w-full py-2 px-4 rounded-lg font-semibold transition-all ${
                              isAudioMuted ? 'bg-yellow-600 hover:bg-yellow-700 text-white' 
                              : 'bg-blue-600 hover:bg-blue-700 text-white'
                            }`}
                          >
                            {isAudioMuted ? '�� Unmute' : '🔇 Mute'}
                          </button>
                        )}
                      </div>
                      <div className="text-center">
                        <button 
                          onClick={toggleLiveVideo}
                          className={`w-full py-3 px-4 rounded-lg font-semibold transition-all ${
                            liveVideo 
                              ? 'bg-red-600 hover:bg-red-700 text-white' 
                              : 'bg-green-600 hover:bg-red-700 text-white'
                          }`}
                        >
                          {liveVideo ? '🔴 Stop Live Video' : '🟢 Start Live Video'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* PODCAST SECTION - ADMIN ONLY */}
              {isAdmin && (
                <div className="bg-slate-800/80 backdrop-blur-sm rounded-lg p-6 shadow-lg border border-blue-600 mt-6">
                  <h2 className="text-2xl font-bold text-white mb-4">🎙️ Podcast Management</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Upload New Episode</h3>
                      <div className="space-y-3">
                        <input 
                          type="text" 
                          placeholder="Episode Title" 
                          value={newPodcastTitle}
                          onChange={(e) => setNewPodcastTitle(e.target.value)}
                          className="w-full border border-slate-600 bg-slate-700 text-white rounded-lg px-3 py-2 placeholder-slate-400"
                        />
                        <textarea 
                          placeholder="Episode Description" 
                          rows={3}
                          value={newPodcastDescription}
                          onChange={(e) => setNewPodcastDescription(e.target.value)}
                          className="w-full border border-slate-600 bg-slate-700 text-white rounded-lg px-3 py-2 placeholder-slate-400"
                        />
                        <input 
                          type="file" 
                          accept="audio/*" 
                          onChange={(e) => setNewPodcastFile(e.target.files?.[0] || null)}
                          className="block w-full text-sm text-slate-300 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                        />
                        <button 
                          onClick={handlePodcastUpload}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold"
                        >
                          📤 Upload Episode
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Recent Episodes</h3>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {podcasts.map((podcast) => (
                          <div key={podcast.id} className="bg-slate-700/50 p-3 rounded-lg">
                            <div className="text-white font-medium">{podcast.title}</div>
                            <div className="text-slate-300 text-sm">{podcast.description}</div>
                            <div className="text-slate-300 text-sm">Duration: {podcast.duration}</div>
                            <div className="text-slate-400 text-xs">Uploaded: {podcast.uploadedAt}</div>
                            <button className="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs">
                              ▶️ Play
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SONG REQUESTS SECTION */}
              <div className="bg-slate-800/80 backdrop-blur-sm rounded-lg p-6 shadow-lg border border-green-600">
                <h2 className="text-2xl font-bold text-white mb-4">🎵 Song Requests</h2>
                <div className="space-y-4">
                  <div className="flex space-x-3">
                    <input
                      type="text"
                      placeholder="Artist name..."
                      value={artistName}
                      onChange={(e) => setArtistName(e.target.value)}
                      className="flex-1 border border-slate-600 bg-slate-700 text-white rounded-lg px-3 py-2 placeholder-slate-400"
                    />
                    <input
                      type="text"
                      placeholder="Song title..."
                      value={songTitle}
                      onChange={(e) => setSongTitle(e.target.value)}
                      className="flex-1 border border-slate-600 bg-slate-700 text-white rounded-lg px-3 py-2 placeholder-slate-400"
                    />
                  </div>
                  <div className="flex space-x-3">
                    <input
                      type="text"
                      placeholder="Your name (optional)"
                      value={requesterName}
                      onChange={(e) => setRequesterName(e.target.value)}
                      className="flex-1 border border-slate-600 bg-slate-700 text-white rounded-lg px-3 py-2 placeholder-slate-400"
                    />
                    <button 
                      onClick={handleSongRequest}
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                    >
                      📤 Send Request
                    </button>
                  </div>
                  <div className="text-center text-slate-400 text-sm">
                    💡 Tip: Be specific with artist and song names for better chances of getting your request played!
                  </div>
                  
                  {songRequests.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-lg font-semibold text-white mb-3">📋 Recent Requests</h3>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {songRequests.slice(0, 5).map((request, index) => (
                          <div key={index} className="bg-slate-700/50 p-2 rounded-lg text-sm">
                            <div className="text-white font-medium">&ldquo;{request.song}&rdquo; by {request.artist}</div>
                            <div className="text-xs text-slate-300">
                              Requested by: {request.requester} • {new Date(request.timestamp).toLocaleTimeString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* SUPPORT SECTION */}
              <div className="bg-slate-800/80 backdrop-blur-sm rounded-lg p-6 shadow-lg border border-slate-600">
                <h2 className="text-2xl font-bold text-white mb-4">💝 Support the Station</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-white mb-2">Cash App</h3>
                    <p className="text-slate-300 mb-3">Send support via Cash App</p>
                    <a 
                      href="https://cash.app/$SDH1000N" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                    >
                      💚 Send $SDH1000N
                    </a>
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-white mb-2">PayPal</h3>
                    <p className="text-slate-300 mb-3">Support via PayPal</p>
                    <a 
                      href="https://paypal.me/SheridanHart932" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                    >
                      💙 PayPal Donate
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* LIVE CHAT SECTION */}
            <div className="bg-slate-800/80 backdrop-blur-sm rounded-lg p-6 shadow-lg border border-slate-600">
              <h2 className="text-2xl font-bold text-white mb-4">💬 Live Chat</h2>
              
              {!isSignedIn ? (
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="border border-slate-600 bg-slate-700 text-white rounded-lg px-3 py-2 mr-2 placeholder-slate-400 w-64"
                  />
                  <button 
                    onClick={() => {
                      setIsSignedIn(true)
                      if (isOnline) {
                        updateViewerHeartbeat()
                      }
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                  >
                    Join Chat
                  </button>
                </div>
              ) : (
                <div className="mb-4">
                  <span className="text-sm text-slate-300">
                    Signed in as: <span className="text-blue-400 font-medium">{username}</span>
                  </span>
                  <button 
                    onClick={() => setIsSignedIn(false)}
                    className="ml-2 text-blue-400 hover:text-blue-300 text-sm"
                  >
                    Sign Out
                  </button>
                </div>
              )}
              
              <div className="h-96 overflow-y-auto border border-slate-600 rounded-lg p-3 mb-4 bg-slate-700">
                {loading ? (
                  <div className="text-center text-slate-400 py-8">Loading chat history...</div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-slate-400 py-8">
                    {isSignedIn ? 'Start chatting!' : 'Sign in to join the conversation'}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {messages.map((msg, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <span className="font-semibold text-blue-400 text-sm whitespace-nowrap">
                          {msg.username}:
                        </span>
                        <span className="text-white text-sm flex-1">{msg.message}</span>
                        <span className="text-xs text-slate-400 whitespace-nowrap">
                          {new Date(msg.created_at).toLocaleTimeString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {isSignedIn && (
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2 mb-2">
                    <button onClick={() => addEmoji('😊')} className="text-2xl hover:scale-110 transition-transform">😊</button>
                    <button onClick={() => addEmoji('🎵')} className="text-2xl hover:scale-110 transition-transform">🎵</button>
                    <button onClick={() => addEmoji('🔥')} className="text-2xl hover:scale-110 transition-transform">🔥</button>
                    <button onClick={() => addEmoji('💯')} className="text-2xl hover:scale-110 transition-transform">💯</button>
                    <button onClick={() => addEmoji('🎉')} className="text-2xl hover:scale-110 transition-transform">🎉</button>
                    <button onClick={() => addEmoji('❤️')} className="text-2xl hover:scale-110 transition-transform">❤️</button>
                    <button onClick={() => addEmoji('👍')} className="text-2xl hover:scale-110 transition-transform">👍</button>
                    <button onClick={() => addEmoji('🎧')} className="text-2xl hover:scale-110 transition-transform">🎧</button>
                  </div>
                  <div className="flex space-x-2">
                    <input 
                      type="text" 
                      placeholder="Type your message..." 
                      value={newMessage} 
                      onChange={(e) => setNewMessage(e.target.value)} 
                      onKeyPress={handleKeyPress} 
                      className="flex-1 border border-slate-600 bg-slate-700 text-white rounded-lg px-3 py-2 placeholder-slate-400" 
                    />
                    <button onClick={sendMessage} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">Send</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
