'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://gpfignxuzlpbqnukkgjo.supabase.co',
  'sb_publishable_zygbl0_Ujr2FZw1CN0X2iA_tYZWu7Ul'
)

export default function RadioPage() {
  const [username, setUsername] = useState('')
  const [isSignedIn, setIsSignedIn] = useState(false)
  const [newMessage, setNewMessage] = useState('')
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminPassword, setAdminPassword] = useState('')
  const [showAdminLogin, setShowAdminLogin] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(0.5)

  const streamAudioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    loadChatHistory()
    subscribeToChat()
  }, [])

  const handleAdminLogin = () => {
    if (adminPassword === 'admin123') {
      setIsAdmin(true)
      setShowAdminLogin(false)
      setAdminPassword('')
    } else {
      alert('Incorrect admin password')
    }
  }

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
      const { error } = await supabase
        .from('chat_messages')
        .insert([
          {
            username: username,
            message: newMessage.trim(),
            created_at: new Date().toISOString()
          }
        ])

      if (error) throw error
      setNewMessage('')
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

  const toggleStream = () => {
    if (streamAudioRef.current) {
      if (isPlaying) {
        streamAudioRef.current.pause()
      } else {
        streamAudioRef.current.play()
      }
    }
  }

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume)
    if (streamAudioRef.current) {
      streamAudioRef.current.volume = newVolume
    }
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
            
            {!isAdmin && (
              <button
                onClick={() => setShowAdminLogin(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm"
              >
                🔐 Admin Access
              </button>
            )}
          </div>

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
                  <button onClick={handleAdminLogin} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">Login</button>
                  <button onClick={() => setShowAdminLogin(false)} className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg">Cancel</button>
                </div>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="bg-slate-800/80 backdrop-blur-sm rounded-lg p-6 shadow-lg border border-slate-600">
                <h2 className="text-2xl font-bold text-white mb-4">🎵 Now Playing</h2>
                <div className="flex items-center space-x-4 mb-4">
                  <button onClick={toggleStream} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
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
                  <input type="range" min="0" max="1" step="0.1" value={volume} onChange={(e) => handleVolumeChange(parseFloat(e.target.value))} className="flex-1" />
                  <span className="text-sm text-slate-300 w-12">{Math.round(volume * 100)}%</span>
                </div>
                
                <audio ref={streamAudioRef} src="https://a12.asurahosting.com/public/chill__tune/playlist.m3u" onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} onError={(e) => console.error('Stream error:', e)} preload="none" />
              </div>

              {isAdmin && (
                <div className="bg-slate-800/80 backdrop-blur-sm rounded-lg p-6 shadow-lg border border-purple-600">
                  <h2 className="text-2xl font-bold text-white mb-4">🎛️ DJ Console</h2>
                  <p className="text-slate-300">Welcome to the DJ Console! More features coming soon.</p>
                </div>
              )}

              <div className="bg-slate-800/80 backdrop-blur-sm rounded-lg p-6 shadow-lg border border-slate-600">
                <h2 className="text-2xl font-bold text-white mb-4">💝 Support the Station</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-white mb-2">Cash App</h3>
                    <p className="text-slate-300 mb-3">Send support via Cash App</p>
                    <a href="https://cash.app/$SDH1000N" target="_blank" rel="noopener noreferrer" className="inline-block bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                      💚 Send $SDH1000N
                    </a>
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-white mb-2">PayPal</h3>
                    <p className="text-slate-300 mb-3">Support via PayPal</p>
                    <a href="https://paypal.me/yourpaypal" target="_blank" rel="noopener noreferrer" className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                      💙 PayPal Donate
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/80 backdrop-blur-sm rounded-lg p-6 shadow-lg border border-slate-600">
              <h2 className="text-2xl font-bold text-white mb-4">💬 Live Chat</h2>
              
              {!isSignedIn ? (
                <div className="mb-4">
                  <input type="text" placeholder="Enter your username" value={username} onChange={(e) => setUsername(e.target.value)} className="border border-slate-600 bg-slate-700 text-white rounded-lg px-3 py-2 mr-2 placeholder-slate-400 w-64" />
                  <button onClick={() => setIsSignedIn(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">Join Chat</button>
                </div>
              ) : (
                <div className="mb-4">
                  <span className="text-sm text-slate-300">Signed in as: <span className="text-blue-400 font-medium">{username}</span></span>
                  <button onClick={() => setIsSignedIn(false)} className="ml-2 text-blue-400 hover:text-blue-300 text-sm">Sign Out</button>
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
                        <span className="font-semibold text-blue-400 text-sm whitespace-nowrap">{msg.username}:</span>
                        <span className="text-slate-200 text-sm flex-1">{msg.message}</span>
                        <span className="text-xs text-slate-400 whitespace-nowrap">{new Date(msg.created_at).toLocaleTimeString()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {isSignedIn && (
                <div className="flex space-x-2">
                  <input type="text" placeholder="Type your message..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyPress={handleKeyPress} className="flex-1 border border-slate-600 bg-slate-700 text-white rounded-lg px-3 py-2 placeholder-slate-400" />
                  <button onClick={sendMessage} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">Send</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
