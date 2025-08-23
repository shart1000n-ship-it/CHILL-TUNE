import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Background {
  id: string;
  name: string;
  type: 'gradient' | 'pattern' | 'image';
  value: string;
  preview: string;
  category: string;
}

interface FontTheme {
  id: string;
  name: string;
  description: string;
  fontFamily: string;
  preview: string;
  category: 'classic' | 'modern' | 'decorative' | 'handwriting';
}

interface Track {
  id: string;
  title: string;
  artist: string;
  url: string;
  duration?: number;
}

export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  bio?: string;
  graduationYear?: number;
  school?: string;
  major?: string;
  isVerified?: boolean;
  createdAt: Date;
  profileBackground?: Background;
  profileMusic?: Track;
  musicAutoPlay?: boolean;
  fontTheme?: FontTheme;
  role: 'user' | 'admin' | 'owner' | 'celebrity';
  rank?: number;
  topFriends?: string[];
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => Promise<void>;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  graduationYear?: number;
  school?: string;
  major?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('starAppUser');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
      } catch (error) {
        console.error('Error parsing saved user data:', error);
        localStorage.removeItem('starAppUser');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock user data - in real app, this would come from your backend
      const mockUser: User = {
        id: '1',
        username: email.split('@')[0],
        email,
        firstName: 'John',
        lastName: 'Doe',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
        bio: 'Welcome to Star App! 🌟',
        graduationYear: 2023,
        school: 'University of Technology',
        major: 'Computer Science',
        isVerified: true,
        createdAt: new Date(),
        profileBackground: {
          id: 'gradient1',
          name: 'Purple Dream',
          type: 'gradient',
          value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          preview: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          category: 'gradients',
        },
        profileMusic: {
          id: 'track1',
          title: 'Chill Vibes',
          artist: 'Electronic Dreams',
          url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav', // Demo audio
        },
        musicAutoPlay: true,
        fontTheme: {
          id: 'modern1',
          name: 'Helvetica',
          description: 'Clean, modern sans-serif font',
          fontFamily: 'Helvetica, Arial, sans-serif',
          preview: 'The quick brown fox jumps over the lazy dog',
          category: 'modern',
        },
        role: 'user',
        rank: 5,
        topFriends: ['2', '3', '4', '5', '6'],
      };
      
      setUser(mockUser);
      localStorage.setItem('starAppUser', JSON.stringify(mockUser));
    } catch (error) {
      console.error('Login error:', error);
      throw new Error('Login failed');
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newUser: User = {
        id: Date.now().toString(),
        username: userData.username,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.username}`,
        bio: 'New Star App user!',
        graduationYear: userData.graduationYear,
        school: userData.school,
        major: userData.major,
        role: 'user',
        isVerified: false,
        createdAt: new Date(),
      };
      
      setUser(newUser);
      localStorage.setItem('starAppUser', JSON.stringify(newUser));
    } catch (error) {
      console.error('Registration error:', error);
      throw new Error('Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('starAppUser');
  };

  const updateProfile = async (userData: Partial<User>) => {
    if (!user) return;
    
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('starAppUser', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Profile update error:', error);
      throw new Error('Profile update failed');
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
