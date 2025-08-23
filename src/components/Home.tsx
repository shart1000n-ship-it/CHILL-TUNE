import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Home: React.FC = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: '💬',
      title: 'Chat Rooms',
      description: 'Join public and private chat rooms, connect with friends and make new ones.',
    },
    {
      icon: '🎓',
      title: 'Alumni Room',
      description: 'Exclusive space for verified alumni to reconnect and network.',
    },
    {
      icon: '📱',
      title: 'Social Feed',
      description: 'Share moments, photos, and updates with your network.',
    },
    {
      icon: '📹',
      title: 'Video Calls',
      description: 'High-quality video calls with friends and family.',
    },
    {
      icon: '🛍️',
      title: 'Marketplace',
      description: 'Shop and sell products in our integrated marketplace.',
    },
    {
      icon: '🎬',
      title: 'GIF Support',
      description: 'Add fun GIFs to your posts with our integrated GIPHY-powered picker.',
    },
    {
      icon: '😄',
      title: 'Emoji Reactions',
      description: 'React to posts with 8 different emojis - more than just likes!',
    },
    {
      icon: '🏆',
      title: 'Leaderboard',
      description: 'Compete with friends and see who\'s the most active on Star App.',
    },
    {
      icon: '🎨',
      title: 'Custom Backgrounds',
      description: 'Personalize your profile with custom backgrounds and themes.',
    },
    {
      icon: '🎵',
      title: 'Profile Music',
      description: 'Add your favorite songs to your profile with auto-play functionality.',
    },
    {
      icon: '👥',
      title: 'Profiles',
      description: 'Create and customize your profile to showcase your personality.',
    },
    {
      icon: '🔒',
      title: 'Privacy',
      description: 'Advanced privacy controls to protect your information.',
    },
    {
      icon: '⭐',
      title: 'All-in-One',
      description: 'Everything you need in one ultimate social media platform.',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 star-glow floating">
              <span className="text-4xl">⭐</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              Welcome to{' '}
              <span className="gradient-text">Star App</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/80 mb-8 max-w-3xl mx-auto">
              The Ultimate APP In The World
            <p className="text-lg text-white/60 mb-12 max-w-2xl mx-auto">
              THE ULTIMATE SOCIAL MEDIA PLATFORM
            </p>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <>
                <Link to="/feed" className="btn-primary text-lg px-8 py-4">
                  Go to Feed
                </Link>
                <Link to="/marketplace" className="btn-primary text-lg px-8 py-4">
                  🛍️ Shop Now
                </Link>
                <Link to="/leaderboard" className="btn-secondary text-lg px-8 py-4">
                  🏆 View Leaderboard
                </Link>
                <Link to="/video-call" className="btn-secondary text-lg px-8 py-4">
                  📹 Start Video Call
                </Link>
              </>
            ) : (
              <>
                <Link to="/register" className="btn-primary text-lg px-8 py-4">
                  Get Started Free
                </Link>
                <Link to="/login" className="btn-secondary text-lg px-8 py-4">
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-purple-500/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-blue-500/20 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-pink-500/20 rounded-full blur-xl animate-pulse delay-2000"></div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Everything You Need
            </h2>
            <p className="text-xl text-white/60 max-w-2xl mx-auto">
              Star App combines the best features from all your favorite social media platforms
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="card hover:scale-105 transition-transform duration-300 group"
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-white/70">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* New Features Highlight */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              🆕 Latest Features
            </h2>
            <p className="text-xl text-white/60 max-w-2xl mx-auto">
              Discover our newest additions that make Star App even more powerful
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* GIF Support & Emoji Reactions */}
            <div className="card">
              <div className="flex items-center space-x-4 mb-6">
                <div className="text-5xl">🎬</div>
                <div>
                  <h3 className="text-2xl font-bold text-white">GIFs & Reactions</h3>
                  <p className="text-white/60">Express yourself like never before!</p>
                </div>
              </div>
              <div className="space-y-4 mb-6">
                <div className="flex items-center space-x-3">
                  <span className="text-green-400">✓</span>
                  <span className="text-white">GIPHY-powered GIF picker</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-green-400">✓</span>
                  <span className="text-white">8 different emoji reactions</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-green-400">✓</span>
                  <span className="text-white">Category-based GIF browsing</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-green-400">✓</span>
                  <span className="text-white">Real-time reaction updates</span>
                </div>
              </div>
              {user && (
                <Link to="/feed" className="btn-primary w-full">
                  Try GIFs & Reactions
                </Link>
              )}
            </div>

            {/* Leaderboard System */}
            <div className="card">
              <div className="flex items-center space-x-4 mb-6">
                <div className="text-5xl">🏆</div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Leaderboard System</h3>
                  <p className="text-white/60">Compete and win rewards!</p>
                </div>
              </div>
              <div className="space-y-4 mb-6">
                <div className="flex items-center space-x-3">
                  <span className="text-green-400">✓</span>
                  <span className="text-white">Weekly rankings & rewards</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-green-400">✓</span>
                  <span className="text-white">Top 10 leaderboard</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-green-400">✓</span>
                  <span className="text-white">Badges for winners</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-green-400">✓</span>
                  <span className="text-white">Score based on activity</span>
                </div>
              </div>
              {user && (
                <Link to="/leaderboard" className="btn-primary w-full">
                  View Leaderboard
                </Link>
              )}
            </div>
          </div>

          {/* Profile Customization Features */}
          <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Custom Backgrounds */}
            <div className="card">
              <div className="flex items-center space-x-4 mb-6">
                <div className="text-5xl">🎨</div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Custom Backgrounds</h3>
                  <p className="text-white/60">Advanced profile customization!</p>
                </div>
              </div>
              <div className="space-y-4 mb-6">
                <div className="flex items-center space-x-3">
                  <span className="text-green-400">✓</span>
                  <span className="text-white">25+ preset backgrounds</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-green-400">✓</span>
                  <span className="text-white">6 categories to choose from</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-green-400">✓</span>
                  <span className="text-white">Gradients, patterns & images</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-green-400">✓</span>
                  <span className="text-white">Live preview before applying</span>
                </div>
              </div>
              {user && (
                <Link to={`/profile/${user.id}`} className="btn-primary w-full">
                  Customize Profile
                </Link>
              )}
            </div>

            {/* Profile Music */}
            <div className="card">
              <div className="flex items-center space-x-4 mb-6">
                <div className="text-5xl">🎵</div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Profile Music</h3>
                  <p className="text-white/60">Create your perfect profile!</p>
                </div>
              </div>
              <div className="space-y-4 mb-6">
                <div className="flex items-center space-x-3">
                  <span className="text-green-400">✓</span>
                  <span className="text-white">Auto-play when visitors arrive</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-green-400">✓</span>
                  <span className="text-white">Full music player controls</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-green-400">✓</span>
                  <span className="text-white">Volume control & seeking</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-green-400">✓</span>
                  <span className="text-white">Add any audio URL</span>
                </div>
              </div>
              {user && (
                <Link to={`/profile/${user.id}`} className="btn-primary w-full">
                  Add Your Music
                </Link>
              )}
            </div>
          </div>

          {/* Additional Features Row */}
          <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Video Calls */}
            <div className="card">
              <div className="flex items-center space-x-4 mb-6">
                <div className="text-5xl">📹</div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Video Calls</h3>
                  <p className="text-white/60">High-quality video calling experience!</p>
                </div>
              </div>
              <div className="space-y-4 mb-6">
                <div className="flex items-center space-x-3">
                  <span className="text-green-400">✓</span>
                  <span className="text-white">HD video quality</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-green-400">✓</span>
                  <span className="text-white">Screen sharing</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-green-400">✓</span>
                  <span className="text-white">Built-in chat</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-green-400">✓</span>
                  <span className="text-white">Multiple participants</span>
                </div>
              </div>
              {user && (
                <Link to="/video-call" className="btn-primary w-full">
                  Start Video Call
                </Link>
              )}
            </div>

            {/* Marketplace */}
            <div className="card">
              <div className="flex items-center space-x-4 mb-6">
                <div className="text-5xl">🛍️</div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Marketplace</h3>
                  <p className="text-white/60">Integrated social shopping experience!</p>
                </div>
              </div>
              <div className="space-y-4 mb-6">
                <div className="flex items-center space-x-3">
                  <span className="text-green-400">✓</span>
                  <span className="text-white">Browse products by category</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-green-400">✓</span>
                  <span className="text-white">Smart search & filters</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-green-400">✓</span>
                  <span className="text-white">Shopping cart & checkout</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-green-400">✓</span>
                  <span className="text-white">Seller ratings & reviews</span>
                </div>
              </div>
              {user && (
                <Link to="/marketplace" className="btn-primary w-full">
                  Explore Shop
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="card">
            <h2 className="text-3xl font-bold text-white mb-6">
              Ready to Experience the Ultimate Social Media Platform?
            </h2>
            <p className="text-lg text-white/70 mb-8">
              Connect with friends, shop for amazing products, make video calls, share GIFs, react with emojis, 
              compete on leaderboards, customize your profile with backgrounds and music, and be part of the ultimate social media experience.
            </p>
            {!user && (
              <Link to="/register" className="btn-primary text-lg px-8 py-4">
                Create Your Account
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-white/20">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">⭐</span>
            </div>
            <span className="text-xl font-bold gradient-text">Star App</span>
          </div>
          <p className="text-white/60 mb-4">
            The Ultimate APP In The World
          </p>
          <p className="text-white/40 text-sm">
            © 2024 Star App. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
