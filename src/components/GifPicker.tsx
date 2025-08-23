import React, { useState, useEffect } from 'react';

interface Gif {
  id: string;
  title: string;
  url: string;
  preview: string;
}

interface GifPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectGif: (gif: Gif) => void;
}

const GifPicker: React.FC<GifPickerProps> = ({ isOpen, onClose, onSelectGif }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [gifs, setGifs] = useState<Gif[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('trending');

  const categories = [
    { id: 'trending', name: 'Trending', icon: '🔥' },
    { id: 'funny', name: 'Funny', icon: '😂' },
    { id: 'love', name: 'Love', icon: '❤️' },
    { id: 'sports', name: 'Sports', icon: '⚽' },
    { id: 'animals', name: 'Animals', icon: '🐱' },
    { id: 'food', name: 'Food', icon: '🍕' },
    { id: 'music', name: 'Music', icon: '🎵' },
    { id: 'gaming', name: 'Gaming', icon: '🎮' },
  ];

  // Mock GIF data - in a real app, this would come from GIPHY API
  const mockGifs: { [key: string]: Gif[] } = {
    trending: [
      { id: '1', title: 'Excited celebration', url: 'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif', preview: 'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/100w.gif' },
      { id: '2', title: 'Happy dance', url: 'https://media.giphy.com/media/26ufcVAKyBV8Ho8Y0/giphy.gif', preview: 'https://media.giphy.com/media/26ufcVAKyBV8Ho8Y0/100w.gif' },
      { id: '3', title: 'Thumbs up', url: 'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif', preview: 'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/100w.gif' },
      { id: '4', title: 'Party time', url: 'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif', preview: 'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/100w.gif' },
      { id: '5', title: 'Success', url: 'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif', preview: 'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/100w.gif' },
      { id: '6', title: 'Awesome', url: 'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif', preview: 'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/100w.gif' },
    ],
    funny: [
      { id: '7', title: 'Laughing', url: 'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif', preview: 'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/100w.gif' },
      { id: '8', title: 'Silly face', url: 'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif', preview: 'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/100w.gif' },
      { id: '9', title: 'Funny reaction', url: 'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif', preview: 'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/100w.gif' },
    ],
    love: [
      { id: '10', title: 'Heart eyes', url: 'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif', preview: 'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/100w.gif' },
      { id: '11', title: 'Love you', url: 'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif', preview: 'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/100w.gif' },
      { id: '12', title: 'Sweet', url: 'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif', preview: 'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/100w.gif' },
    ],
    sports: [
      { id: '13', title: 'Goal!', url: 'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif', preview: 'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/100w.gif' },
      { id: '14', title: 'Victory', url: 'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif', preview: 'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/100w.gif' },
      { id: '15', title: 'Champion', url: 'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif', preview: 'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/100w.gif' },
    ],
    animals: [
      { id: '16', title: 'Cute cat', url: 'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif', preview: 'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/100w.gif' },
      { id: '17', title: 'Happy dog', url: 'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif', preview: 'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/100w.gif' },
      { id: '18', title: 'Sleepy pet', url: 'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif', preview: 'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/100w.gif' },
    ],
    food: [
      { id: '19', title: 'Delicious', url: 'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif', preview: 'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/100w.gif' },
      { id: '20', title: 'Yummy', url: 'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif', preview: 'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/100w.gif' },
      { id: '21', title: 'Food coma', url: 'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif', preview: 'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/100w.gif' },
    ],
    music: [
      { id: '22', title: 'Rock on', url: 'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif', preview: 'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/100w.gif' },
      { id: '23', title: 'Dancing', url: 'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif', preview: 'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/100w.gif' },
      { id: '24', title: 'Concert', url: 'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif', preview: 'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/100w.gif' },
    ],
    gaming: [
      { id: '25', title: 'Game over', url: 'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif', preview: 'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/100w.gif' },
      { id: '26', title: 'Level up', url: 'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif', preview: 'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/100w.gif' },
      { id: '27', title: 'Winner', url: 'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif', preview: 'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/100w.gif' },
    ],
  };

  useEffect(() => {
    if (isOpen) {
      loadGifs(selectedCategory);
    }
  }, [isOpen, selectedCategory]);

  const loadGifs = async (category: string) => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const categoryGifs = mockGifs[category] || mockGifs.trending;
    setGifs(categoryGifs);
    setIsLoading(false);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadGifs(selectedCategory);
      return;
    }

    setIsLoading(true);
    
    // Simulate search delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Filter GIFs by search query
    const allGifs = Object.values(mockGifs).flat();
    const filteredGifs = allGifs.filter(gif =>
      gif.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    setGifs(filteredGifs);
    setIsLoading(false);
  };

  const handleGifSelect = (gif: Gif) => {
    onSelectGif(gif);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-xl shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-white/20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">🎬 GIF Picker</h2>
            <button
              onClick={onClose}
              className="text-white/60 hover:text-white text-2xl"
            >
              ✕
            </button>
          </div>
          
          {/* Search Bar */}
          <div className="flex space-x-3">
            <input
              type="text"
              placeholder="Search for GIFs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              onClick={handleSearch}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Search
            </button>
          </div>
        </div>

        {/* Categories */}
        <div className="px-6 py-4 border-b border-white/20">
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/10 text-white/80 hover:bg-white/20'
                }`}
              >
                <span>{category.icon}</span>
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* GIF Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
            </div>
          ) : gifs.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-white mb-2">No GIFs found</h3>
              <p className="text-white/60">Try a different search term or category</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {gifs.map((gif) => (
                <div
                  key={gif.id}
                  onClick={() => handleGifSelect(gif)}
                  className="cursor-pointer group"
                >
                  <div className="relative bg-black rounded-lg overflow-hidden">
                    <img
                      src={gif.preview}
                      alt={gif.title}
                      className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white text-sm font-medium">Click to select</span>
                    </div>
                  </div>
                  <p className="text-white/80 text-xs mt-2 line-clamp-2">{gif.title}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/20">
          <p className="text-white/60 text-sm text-center">
            Powered by GIPHY • Click any GIF to add it to your post
          </p>
        </div>
      </div>
    </div>
  );
};

export default GifPicker;
