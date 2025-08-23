import React from 'react';

interface EmojiPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectEmoji: (emoji: string) => void;
  className?: string;
}

const EmojiPicker: React.FC<EmojiPickerProps> = ({ 
  isOpen, 
  onClose, 
  onSelectEmoji, 
  className = '' 
}) => {
  if (!isOpen) return null;

  // Common emojis organized by category
  const emojiCategories = {
    'Smileys': ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚'],
    'Gestures': ['👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👋', '🤚', '🖐️', '✋', '🖖', '👌'],
    'Hearts': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '♥️'],
    'Objects': ['🔥', '💎', '⭐', '🌟', '✨', '💫', '⚡', '💥', '💢', '💦', '💨', '💭', '💬', '💤', '💋', '💯', '💢', '💥', '💫', '💦'],
    'Activities': ['🎉', '🎊', '🎈', '🎂', '🎁', '🎄', '🎃', '🎗️', '🎟️', '🎫', '🎖️', '🏆', '🏅', '🥇', '🥈', '🥉', '⚽', '🏀', '🏈', '⚾'],
    'Food': ['🍕', '🍔', '🍟', '🌭', '🍿', '🧂', '🥨', '🥯', '🥖', '🧀', '🥚', '🍳', '🧈', '🥞', '🧇', '🥓', '🥩', '🍗', '🍖', '🦴'],
    'Animals': ['🐱', '🐶', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🙈', '🙉', '🙊', '🐒', '🐔'],
    'Nature': ['🌸', '💮', '🏵️', '🌹', '🥀', '🌺', '🌻', '🌼', '🌷', '🌱', '🌲', '🌳', '🌴', '🌵', '🌾', '🌿', '☘️', '🍀', '🍁', '🍂'],
    'Symbols': ['💯', '💢', '💥', '💫', '💦', '💨', '💬', '💭', '💤', '💋', '💯', '💢', '💥', '💫', '💦', '💨', '💬', '💭', '💤', '💋'],
    'Flags': ['🏁', '🚩', '🎌', '🏴', '🏳️', '🏳️‍🌈', '🏴‍☠️', '🇦🇫', '🇦🇱', '🇩🇿', '🇦🇩', '🇦🇩', '🇦🇩', '🇦🇩', '🇦🇩', '🇦🇩', '🇦🇩', '🇦🇩', '🇦🇩', '🇦🇩']
  };

  const handleEmojiClick = (emoji: string) => {
    onSelectEmoji(emoji);
    onClose();
  };

  return (
    <div className={`bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-semibold text-sm">Select Emoji</h3>
        <button
          onClick={onClose}
          className="text-white/60 hover:text-white text-lg hover:scale-110 transition-transform"
        >
          ×
        </button>
      </div>
      
      <div className="max-h-64 overflow-y-auto">
        {Object.entries(emojiCategories).map(([category, emojis]) => (
          <div key={category} className="mb-4">
            <h4 className="text-white/60 text-xs font-medium mb-2 uppercase tracking-wide">
              {category}
            </h4>
            <div className="grid grid-cols-10 gap-1">
              {emojis.map((emoji, index) => (
                <button
                  key={`${category}-${index}`}
                  onClick={() => handleEmojiClick(emoji)}
                  className="text-2xl hover:scale-125 transition-transform p-1 rounded hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  title={emoji}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmojiPicker;
