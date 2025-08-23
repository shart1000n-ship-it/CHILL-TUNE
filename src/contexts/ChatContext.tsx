import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';

export interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  timestamp: Date;
  roomId: string;
  type: 'text' | 'image' | 'file';
}

export interface ChatRoom {
  id: string;
  name: string;
  description: string;
  type: 'public' | 'private' | 'alumni';
  participants: string[];
  lastMessage?: Message;
  isActive: boolean;
  category: string;
  icon: string;
  memberCount: number;
}

interface ChatContextType {
  socket: Socket | null;
  messages: Message[];
  rooms: ChatRoom[];
  activeRoom: ChatRoom | null;
  isConnected: boolean;
  joinRoom: (roomId: string) => void;
  leaveRoom: (roomId: string) => void;
  sendMessage: (content: string, type?: 'text' | 'image' | 'file') => void;
  createRoom: (roomData: Omit<ChatRoom, 'id'>) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [activeRoom, setActiveRoom] = useState<ChatRoom | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Initialize default chat rooms with expanded categories
    const defaultRooms: ChatRoom[] = [
      // 🌟 General & Social
      {
        id: 'general',
        name: 'General Chat',
        description: 'General discussion room for all users',
        type: 'public',
        participants: [],
        isActive: true,
        category: 'General',
        icon: '💬',
        memberCount: 156,
      },
      {
        id: 'random',
        name: 'Random & Fun',
        description: 'Random conversations, jokes, and fun topics',
        type: 'public',
        participants: [],
        isActive: true,
        category: 'General',
        icon: '🎲',
        memberCount: 89,
      },
      {
        id: 'newcomers',
        name: 'Newcomers Welcome',
        description: 'Welcome new users and help them get started',
        type: 'public',
        participants: [],
        isActive: true,
        category: 'General',
        icon: '👋',
        memberCount: 234,
      },

      // 🏆 Sports & Fitness
      {
        id: 'sports',
        name: 'Sports Central',
        description: 'All sports discussions - football, basketball, soccer, and more',
        type: 'public',
        participants: [],
        isActive: true,
        category: 'Sports',
        icon: '⚽',
        memberCount: 312,
      },
      {
        id: 'fitness',
        name: 'Fitness & Health',
        description: 'Workout tips, nutrition advice, and health discussions',
        type: 'public',
        participants: [],
        isActive: true,
        category: 'Sports',
        icon: '💪',
        memberCount: 178,
      },
      {
        id: 'basketball',
        name: 'Basketball Fans',
        description: 'NBA, college basketball, and streetball discussions',
        type: 'public',
        participants: [],
        isActive: true,
        category: 'Sports',
        icon: '🏀',
        memberCount: 245,
      },
      {
        id: 'football',
        name: 'Football Nation',
        description: 'NFL, college football, and fantasy football talk',
        type: 'public',
        participants: [],
        isActive: true,
        category: 'Sports',
        icon: '🏈',
        memberCount: 298,
      },
      {
        id: 'soccer',
        name: 'Soccer World',
        description: 'International soccer, leagues, and World Cup discussions',
        type: 'public',
        participants: [],
        isActive: true,
        category: 'Sports',
        icon: '⚽',
        memberCount: 267,
      },

      // 🎵 Music & Arts
      {
        id: 'music',
        name: 'Music & Arts',
        description: 'Share your favorite music and art',
        type: 'public',
        participants: [],
        isActive: true,
        category: 'Music',
        icon: '🎵',
        memberCount: 189,
      },
      {
        id: 'rock',
        name: 'Rock & Metal',
        description: 'Rock, metal, punk, and alternative music discussions',
        type: 'public',
        participants: [],
        isActive: true,
        category: 'Music',
        icon: '🤘',
        memberCount: 134,
      },
      {
        id: 'hiphop',
        name: 'Hip Hop & Rap',
        description: 'Hip hop culture, rap music, and urban art',
        type: 'public',
        participants: [],
        isActive: true,
        category: 'Music',
        icon: '🎤',
        memberCount: 167,
      },
      {
        id: 'electronic',
        name: 'Electronic Music',
        description: 'EDM, techno, house, and electronic music lovers',
        type: 'public',
        participants: [],
        isActive: true,
        category: 'Music',
        icon: '🎧',
        memberCount: 145,
      },
      {
        id: 'classical',
        name: 'Classical & Jazz',
        description: 'Classical music, jazz, and orchestral discussions',
        type: 'public',
        participants: [],
        isActive: true,
        category: 'Music',
        icon: '🎻',
        memberCount: 98,
      },

      // 🎮 Gaming & Entertainment
      {
        id: 'gaming',
        name: 'Gaming Zone',
        description: 'Video games, board games, and gaming culture',
        type: 'public',
        participants: [],
        isActive: true,
        category: 'Gaming',
        icon: '🎮',
        memberCount: 423,
      },
      {
        id: 'pc-gaming',
        name: 'PC Gaming',
        description: 'PC games, hardware, and gaming setups',
        type: 'public',
        participants: [],
        isActive: true,
        category: 'Gaming',
        icon: '🖥️',
        memberCount: 256,
      },
      {
        id: 'console-gaming',
        name: 'Console Gaming',
        description: 'PlayStation, Xbox, Nintendo, and console games',
        type: 'public',
        participants: [],
        isActive: true,
        category: 'Gaming',
        icon: '🎯',
        memberCount: 198,
      },
      {
        id: 'esports',
        name: 'Esports & Competitive',
        description: 'Professional gaming, tournaments, and esports news',
        type: 'public',
        participants: [],
        isActive: true,
        category: 'Gaming',
        icon: '🏆',
        memberCount: 167,
      },

      // 🎬 Movies & TV
      {
        id: 'movies',
        name: 'Movies & Cinema',
        description: 'Movie reviews, discussions, and cinema news',
        type: 'public',
        participants: [],
        isActive: true,
        category: 'Entertainment',
        icon: '🎬',
        memberCount: 234,
      },
      {
        id: 'tv-shows',
        name: 'TV Shows & Series',
        description: 'Television shows, streaming content, and series discussions',
        type: 'public',
        participants: [],
        isActive: true,
        category: 'Entertainment',
        icon: '📺',
        memberCount: 198,
      },
      {
        id: 'anime',
        name: 'Anime & Manga',
        description: 'Japanese animation, manga, and otaku culture',
        type: 'public',
        participants: [],
        isActive: true,
        category: 'Entertainment',
        icon: '🌸',
        memberCount: 187,
      },

      // 🍕 Food & Lifestyle
      {
        id: 'food',
        name: 'Food & Cooking',
        description: 'Recipes, cooking tips, and food culture discussions',
        type: 'public',
        participants: [],
        isActive: true,
        category: 'Lifestyle',
        icon: '🍕',
        memberCount: 156,
      },
      {
        id: 'travel',
        name: 'Travel & Adventure',
        description: 'Travel tips, destination recommendations, and adventure stories',
        type: 'public',
        participants: [],
        isActive: true,
        category: 'Lifestyle',
        icon: '✈️',
        memberCount: 134,
      },
      {
        id: 'fashion',
        name: 'Fashion & Style',
        description: 'Fashion trends, style advice, and clothing discussions',
        type: 'public',
        participants: [],
        isActive: true,
        category: 'Lifestyle',
        icon: '👗',
        memberCount: 145,
      },
      {
        id: 'beauty',
        name: 'Beauty & Makeup',
        description: 'Beauty tips, makeup tutorials, and skincare advice',
        type: 'public',
        participants: [],
        isActive: true,
        category: 'Lifestyle',
        icon: '💄',
        memberCount: 123,
      },

      // 💻 Technology & Business
      {
        id: 'tech',
        name: 'Tech Talk',
        description: 'Technology and programming discussions',
        type: 'public',
        participants: [],
        isActive: true,
        category: 'Technology',
        icon: '💻',
        memberCount: 267,
      },
      {
        id: 'programming',
        name: 'Programming & Development',
        description: 'Coding, software development, and programming languages',
        type: 'public',
        participants: [],
        isActive: true,
        category: 'Technology',
        icon: '👨‍💻',
        memberCount: 189,
      },
      {
        id: 'ai-ml',
        name: 'AI & Machine Learning',
        description: 'Artificial intelligence, machine learning, and data science',
        type: 'public',
        participants: [],
        isActive: true,
        category: 'Technology',
        icon: '🤖',
        memberCount: 145,
      },
      {
        id: 'startups',
        name: 'Startups & Entrepreneurship',
        description: 'Business ideas, startup advice, and entrepreneurship discussions',
        type: 'public',
        participants: [],
        isActive: true,
        category: 'Business',
        icon: '🚀',
        memberCount: 134,
      },
      {
        id: 'investing',
        name: 'Investing & Finance',
        description: 'Stock market, cryptocurrency, and financial advice',
        type: 'public',
        participants: [],
        isActive: true,
        category: 'Business',
        icon: '💰',
        memberCount: 167,
      },

      // 📚 Education & Learning
      {
        id: 'education',
        name: 'Education & Learning',
        description: 'Academic discussions, study tips, and learning resources',
        type: 'public',
        participants: [],
        isActive: true,
        category: 'Education',
        icon: '📚',
        memberCount: 178,
      },
      {
        id: 'languages',
        name: 'Languages & Culture',
        description: 'Language learning, cultural exchange, and international topics',
        type: 'public',
        participants: [],
        isActive: true,
        category: 'Education',
        icon: '🌍',
        memberCount: 145,
      },
      {
        id: 'science',
        name: 'Science & Discovery',
        description: 'Scientific discoveries, research, and scientific discussions',
        type: 'public',
        participants: [],
        isActive: true,
        category: 'Education',
        icon: '🔬',
        memberCount: 123,
      },

      // 🏠 Hobbies & Interests
      {
        id: 'photography',
        name: 'Photography & Art',
        description: 'Photography tips, art sharing, and creative discussions',
        type: 'public',
        participants: [],
        isActive: true,
        category: 'Hobbies',
        icon: '📸',
        memberCount: 134,
      },
      {
        id: 'books',
        name: 'Books & Literature',
        description: 'Book recommendations, reading discussions, and literary analysis',
        type: 'public',
        participants: [],
        isActive: true,
        category: 'Hobbies',
        icon: '📖',
        memberCount: 156,
      },
      {
        id: 'pets',
        name: 'Pets & Animals',
        description: 'Pet care, animal discussions, and cute pet photos',
        type: 'public',
        participants: [],
        isActive: true,
        category: 'Hobbies',
        icon: '🐾',
        memberCount: 198,
      },
      {
        id: 'gardening',
        name: 'Gardening & Plants',
        description: 'Plant care, gardening tips, and green thumb discussions',
        type: 'public',
        participants: [],
        isActive: true,
        category: 'Hobbies',
        icon: '🌱',
        memberCount: 89,
      },

      // 🔥 Trending & Current Events
      {
        id: 'trending',
        name: 'Trending Topics',
        description: 'Current events, viral content, and trending discussions',
        type: 'public',
        participants: [],
        isActive: true,
        category: 'Trending',
        icon: '🔥',
        memberCount: 456,
      },
      {
        id: 'news',
        name: 'News & Politics',
        description: 'Current events, political discussions, and world news',
        type: 'public',
        participants: [],
        isActive: true,
        category: 'Trending',
        icon: '📰',
        memberCount: 234,
      },
      {
        id: 'memes',
        name: 'Memes & Humor',
        description: 'Share and discuss the latest memes and funny content',
        type: 'public',
        participants: [],
        isActive: true,
        category: 'Trending',
        icon: '😂',
        memberCount: 345,
      },

      // 🎓 Special Access Rooms
      {
        id: 'alumni',
        name: 'Alumni Room',
        description: 'Exclusive room for verified alumni',
        type: 'alumni',
        participants: [],
        isActive: true,
        category: 'Special',
        icon: '🎓',
        memberCount: 67,
      },
      {
        id: 'vip',
        name: 'VIP Lounge',
        description: 'Premium members and verified users only',
        type: 'private',
        participants: [],
        isActive: true,
        category: 'Special',
        icon: '👑',
        memberCount: 23,
      },
    ];

    setRooms(defaultRooms);

    // Initialize mock socket connection (no real server needed)
    const mockSocket = {
      emit: (event: string, data: any) => {
        console.log(`Mock socket emit: ${event}`, data);
        
        // Handle local message sending
        if (event === 'sendMessage') {
          const newMessage: Message = {
            id: Date.now().toString(),
            content: data.content,
            senderId: data.senderId,
            senderName: data.senderName,
            senderAvatar: data.senderAvatar,
            timestamp: new Date(),
            roomId: data.roomId,
            type: data.type,
          };
          setMessages(prev => [...prev, newMessage]);
        }
      },
      on: () => {},
      close: () => {},
    };

    setSocket(mockSocket as any);
    setIsConnected(true);
    console.log('Mock chat server connected');

    return () => {
      // Cleanup mock socket
    };
  }, []);

  const joinRoom = (roomId: string) => {
    console.log('ChatContext: joinRoom called with:', roomId); // Debug log
    
    const room = rooms.find(r => r.id === roomId);
    console.log('Found room:', room); // Debug log
    
    if (room) {
      if (socket) {
        socket.emit('joinRoom', roomId);
      }
      setActiveRoom(room);
      console.log('Active room set to:', room); // Debug log
      
      // Clear messages when joining a new room
      setMessages([]);
    } else {
      console.log('Room not found:', roomId); // Debug log
    }
  };

  const leaveRoom = (roomId: string) => {
    if (!socket) return;

    socket.emit('leaveRoom', roomId);
    setActiveRoom(null);
    setMessages([]);
  };

  const sendMessage = (content: string, type: 'text' | 'image' | 'file' = 'text') => {
    if (!activeRoom) return;

    const message: Omit<Message, 'id' | 'timestamp'> = {
      content,
      senderId: 'current-user', // This would come from auth context
      senderName: 'You', // This would come from auth context
      roomId: activeRoom.id,
      type,
    };

    if (socket) {
      socket.emit('sendMessage', message);
    }
  };

  const createRoom = (roomData: Omit<ChatRoom, 'id'>) => {
    const newRoom: ChatRoom = {
      ...roomData,
      id: Date.now().toString(),
    };

    setRooms(prev => [...prev, newRoom]);
  };

  const value: ChatContextType = {
    socket,
    messages,
    rooms,
    activeRoom,
    isConnected,
    joinRoom,
    leaveRoom,
    sendMessage,
    createRoom,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};
