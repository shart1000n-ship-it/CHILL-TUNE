import React, { useState } from 'react';

interface FontTheme {
  id: string;
  name: string;
  description: string;
  fontFamily: string;
  preview: string;
  category: 'classic' | 'modern' | 'decorative' | 'handwriting';
}

interface FontThemePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFontTheme: (theme: FontTheme) => void;
  currentTheme?: FontTheme;
}

const FontThemePicker: React.FC<FontThemePickerProps> = ({ 
  isOpen, 
  onClose, 
  onSelectFontTheme,
  currentTheme 
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'classic' | 'modern' | 'decorative' | 'handwriting'>('classic');

  const categories = [
    { id: 'classic', name: 'Classic', icon: '📚' },
    { id: 'modern', name: 'Modern', icon: '✨' },
    { id: 'decorative', name: 'Decorative', icon: '🎨' },
    { id: 'handwriting', name: 'Handwriting', icon: '✍️' },
  ];

  const fontThemes: FontTheme[] = [
    // Classic Fonts
    {
      id: 'classic1',
      name: 'Times New Roman',
      description: 'Traditional serif font for elegant profiles',
      fontFamily: 'Times New Roman, serif',
      preview: 'The quick brown fox jumps over the lazy dog',
      category: 'classic',
    },
    {
      id: 'classic2',
      name: 'Georgia',
      description: 'Beautiful serif font with excellent readability',
      fontFamily: 'Georgia, serif',
      preview: 'The quick brown fox jumps over the lazy dog',
      category: 'classic',
    },
    {
      id: 'classic3',
      name: 'Palatino',
      description: 'Classic serif font with artistic flair',
      fontFamily: 'Palatino, serif',
      preview: 'The quick brown fox jumps over the lazy dog',
      category: 'classic',
    },

    // Modern Fonts
    {
      id: 'modern1',
      name: 'Helvetica',
      description: 'Clean, modern sans-serif font',
      fontFamily: 'Helvetica, Arial, sans-serif',
      preview: 'The quick brown fox jumps over the lazy dog',
      category: 'modern',
    },
    {
      id: 'modern2',
      name: 'Futura',
      description: 'Geometric modern font with clean lines',
      fontFamily: 'Futura, Arial, sans-serif',
      preview: 'The quick brown fox jumps over the lazy dog',
      category: 'modern',
    },
    {
      id: 'modern3',
      name: 'Roboto',
      description: 'Google\'s modern, friendly font',
      fontFamily: 'Roboto, Arial, sans-serif',
      preview: 'The quick brown fox jumps over the lazy dog',
      category: 'modern',
    },

    // Decorative Fonts
    {
      id: 'decorative1',
      name: 'Comic Sans',
      description: 'Fun, casual font for playful profiles',
      fontFamily: 'Comic Sans MS, cursive',
      preview: 'The quick brown fox jumps over the lazy dog',
      category: 'decorative',
    },
    {
      id: 'decorative2',
      name: 'Impact',
      description: 'Bold, attention-grabbing font',
      fontFamily: 'Impact, Arial, sans-serif',
      preview: 'The quick brown fox jumps over the lazy dog',
      category: 'decorative',
    },
    {
      id: 'decorative3',
      name: 'Papyrus',
      description: 'Ancient, mystical font style',
      fontFamily: 'Papyrus, fantasy',
      preview: 'The quick brown fox jumps over the lazy dog',
      category: 'decorative',
    },

    // Handwriting Fonts
    {
      id: 'handwriting1',
      name: 'Brush Script',
      description: 'Elegant handwritten style',
      fontFamily: 'Brush Script MT, cursive',
      preview: 'The quick brown fox jumps over the lazy dog',
      category: 'handwriting',
    },
    {
      id: 'handwriting2',
      name: 'Lucida Handwriting',
      description: 'Neat, readable handwriting font',
      fontFamily: 'Lucida Handwriting, cursive',
      preview: 'The quick brown fox jumps over the lazy dog',
      category: 'handwriting',
    },
    {
      id: 'handwriting3',
      name: 'Segoe Script',
      description: 'Modern handwritten style',
      fontFamily: 'Segoe Script, cursive',
      preview: 'The quick brown fox jumps over the lazy dog',
      category: 'handwriting',
    },
  ];

  const filteredThemes = fontThemes.filter(theme => theme.category === selectedCategory);

  const handleSelectTheme = (theme: FontTheme) => {
    onSelectFontTheme(theme);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-white/20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">🔤 Choose Your Font Theme</h2>
            <button
              onClick={onClose}
              className="text-white/60 hover:text-white text-2xl"
            >
              ✕
            </button>
          </div>
          <p className="text-white/60">Select a font theme to make your profile text unique</p>
        </div>

        {/* Categories */}
        <div className="px-6 py-4 border-b border-white/20">
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id as any)}
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

        {/* Font Themes Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredThemes.map((theme) => (
              <div
                key={theme.id}
                onClick={() => handleSelectTheme(theme)}
                className={`cursor-pointer group rounded-lg overflow-hidden border-2 transition-all ${
                  currentTheme?.id === theme.id
                    ? 'border-purple-500 ring-2 ring-purple-500/50'
                    : 'border-white/20 hover:border-purple-400'
                }`}
              >
                <div className="p-4 bg-white/5">
                  <h3 className="font-semibold text-white mb-2">{theme.name}</h3>
                  <p className="text-white/60 text-sm mb-3">{theme.description}</p>
                  
                  {/* Font Preview */}
                  <div 
                    className="p-3 bg-white/10 rounded-lg border border-white/20"
                    style={{ fontFamily: theme.fontFamily }}
                  >
                    <p className="text-white text-lg leading-relaxed">{theme.preview}</p>
                  </div>
                </div>
                
                {/* Selection Indicator */}
                {currentTheme?.id === theme.id && (
                  <div className="bg-purple-500 text-white text-center py-2 text-sm font-medium">
                    ✓ Currently Active
                  </div>
                )}
                
                {/* Hover Effect */}
                <div className="absolute inset-0 bg-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white font-semibold">Click to Select</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/20">
          <div className="flex items-center justify-between">
            <p className="text-white/60 text-sm">
              Choose from {filteredThemes.length} {categories.find(c => c.id === selectedCategory)?.name.toLowerCase()} font themes
            </p>
            <button
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FontThemePicker;
