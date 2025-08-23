import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

export interface ProfileMedia {
  id: string;
  type: 'photo' | 'video';
  url: string;
  thumbnail?: string;
  caption?: string;
  timestamp: Date;
  isPublic: boolean;
  likes: number;
  comments: number;
  tags: string[];
}

export interface ProfileSettings {
  textColor: string;
  textGlowColor: string;
  textGlowIntensity: number;
  backgroundColor: string;
  backgroundImage?: string;
  profilePicture?: string;
  neonAccentColor: string;
  neonGlowIntensity: number;
  customFont?: string;
  textShadow: boolean;
  neonBorder: boolean;
  borderColor: string;
}

export interface ProfileStats {
  totalPhotos: number;
  totalVideos: number;
  totalPosts: number;
  followers: number;
  following: number;
  profileViews: number;
  lastActive: Date;
}

interface ProfileContextType {
  profileMedia: ProfileMedia[];
  profileSettings: ProfileSettings;
  profileStats: ProfileStats;
  isEditing: boolean;
  uploadMedia: (file: File, type: 'photo' | 'video', caption?: string) => Promise<void>;
  deleteMedia: (mediaId: string) => Promise<void>;
  updateProfileSettings: (settings: Partial<ProfileSettings>) => Promise<void>;
  setProfilePicture: (mediaId: string) => Promise<void>;
  setBackgroundImage: (mediaId: string) => Promise<void>;
  toggleEditMode: () => void;
  shareToFeed: (mediaId: string, caption?: string) => Promise<void>;
  getPresetColorSchemes: () => Array<{ name: string; colors: Partial<ProfileSettings> }>;
  getPresetNeonEffects: () => Array<{ name: string; settings: Partial<ProfileSettings> }>;
  getGlobalTextStyle: () => React.CSSProperties;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};

interface ProfileProviderProps {
  children: ReactNode;
}

export const ProfileProvider: React.FC<ProfileProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [profileMedia, setProfileMedia] = useState<ProfileMedia[]>([]);
  const [profileSettings, setProfileSettings] = useState<ProfileSettings>({
    textColor: '#ffffff',
    textGlowColor: '#00ffff',
    textGlowIntensity: 0.5,
    backgroundColor: '#1a1a2e',
    neonAccentColor: '#ff00ff',
    neonGlowIntensity: 0.7,
    textShadow: true,
    neonBorder: false,
    borderColor: '#00ffff',
  });
  const [profileStats, setProfileStats] = useState<ProfileStats>({
    totalPhotos: 0,
    totalVideos: 0,
    totalPosts: 0,
    followers: 0,
    following: 0,
    profileViews: 0,
    lastActive: new Date(),
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (user) {
      loadProfileData();
    }
  }, [user]);

  const loadProfileData = async () => {
    // Mock data - in real app this would come from API
    const mockMedia: ProfileMedia[] = [
      {
        id: '1',
        type: 'photo',
        url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
        thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200',
        caption: 'Beautiful sunset at the beach! 🌅',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
        isPublic: true,
        likes: 24,
        comments: 8,
        tags: ['sunset', 'beach', 'nature'],
      },
      {
        id: '2',
        type: 'video',
        url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200',
        caption: 'Amazing drone footage! 🚁',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
        isPublic: true,
        likes: 15,
        comments: 3,
        tags: ['drone', 'aerial', 'video'],
      },
    ];

    setProfileMedia(mockMedia);
    setProfileStats(prev => ({
      ...prev,
      totalPhotos: mockMedia.filter(m => m.type === 'photo').length,
      totalVideos: mockMedia.filter(m => m.type === 'video').length,
    }));
  };

  const uploadMedia = async (file: File, type: 'photo' | 'video', caption?: string): Promise<void> => {
    return new Promise((resolve) => {
      // Simulate file upload
      setTimeout(() => {
        const newMedia: ProfileMedia = {
          id: Date.now().toString(),
          type,
          url: URL.createObjectURL(file),
          thumbnail: type === 'photo' ? URL.createObjectURL(file) : undefined,
          caption: caption || '',
          timestamp: new Date(),
          isPublic: true,
          likes: 0,
          comments: 0,
          tags: [],
        };

        setProfileMedia(prev => [newMedia, ...prev]);
        setProfileStats(prev => ({
          ...prev,
          totalPhotos: type === 'photo' ? prev.totalPhotos + 1 : prev.totalPhotos,
          totalVideos: type === 'video' ? prev.totalVideos + 1 : prev.totalVideos,
        }));

        resolve();
      }, 1000);
    });
  };

  const deleteMedia = async (mediaId: string): Promise<void> => {
    return new Promise((resolve) => {
      setProfileMedia(prev => {
        const media = prev.find(m => m.id === mediaId);
        if (media) {
          setProfileStats(prevStats => ({
            ...prevStats,
            totalPhotos: media.type === 'photo' ? prevStats.totalPhotos - 1 : prevStats.totalPhotos,
            totalVideos: media.type === 'video' ? prevStats.totalVideos - 1 : prevStats.totalVideos,
          }));
        }
        return prev.filter(m => m.id !== mediaId);
      });
      resolve();
    });
  };

  const updateProfileSettings = async (settings: Partial<ProfileSettings>): Promise<void> => {
    return new Promise((resolve) => {
      setProfileSettings(prev => ({ ...prev, ...settings }));
      resolve();
    });
  };

  const setProfilePicture = async (mediaId: string): Promise<void> => {
    return new Promise((resolve) => {
      const media = profileMedia.find(m => m.id === mediaId);
      if (media && media.type === 'photo') {
        setProfileSettings(prev => ({ ...prev, profilePicture: media.url }));
      }
      resolve();
    });
  };



  const setBackgroundImage = async (mediaId: string): Promise<void> => {
    return new Promise((resolve) => {
      const media = profileMedia.find(m => m.id === mediaId);
      if (media && media.type === 'photo') {
        setProfileSettings(prev => ({ ...prev, backgroundImage: media.url }));
      }
      resolve();
    });
  };

  const toggleEditMode = () => {
    setIsEditing(!isEditing);
  };

  const shareToFeed = async (mediaId: string, caption?: string): Promise<void> => {
    return new Promise((resolve) => {
      // This would integrate with the Feed component
      console.log('Sharing to feed:', mediaId, caption);
      resolve();
    });
  };

  const getPresetColorSchemes = () => [
    {
      name: 'Neon Cyberpunk',
      colors: {
        textColor: '#00ffff',
        textGlowColor: '#ff00ff',
        neonAccentColor: '#ff00ff',
        backgroundColor: '#0a0a0a',
        borderColor: '#00ffff',
      }
    },
    {
      name: 'Sunset Vibes',
      colors: {
        textColor: '#ff6b35',
        textGlowColor: '#f7931e',
        neonAccentColor: '#ff6b35',
        backgroundColor: '#2c1810',
        borderColor: '#f7931e',
      }
    },
    {
      name: 'Ocean Blue',
      colors: {
        textColor: '#4ecdc4',
        textGlowColor: '#45b7aa',
        neonAccentColor: '#4ecdc4',
        backgroundColor: '#1a1a2e',
        borderColor: '#45b7aa',
      }
    },
    {
      name: 'Forest Green',
      colors: {
        textColor: '#52c41a',
        textGlowColor: '#389e0d',
        neonAccentColor: '#52c41a',
        backgroundColor: '#0f1419',
        borderColor: '#389e0d',
      }
    },
  ];

  const getPresetNeonEffects = () => [
    {
      name: 'Subtle Glow',
      settings: {
        textGlowIntensity: 0.3,
        neonGlowIntensity: 0.4,
        textShadow: true,
        neonBorder: false,
      }
    },
    {
      name: 'Intense Neon',
      settings: {
        textGlowIntensity: 0.8,
        neonGlowIntensity: 1.0,
        textShadow: true,
        neonBorder: true,
      }
    },
    {
      name: 'Cyberpunk Edge',
      settings: {
        textGlowIntensity: 0.6,
        neonGlowIntensity: 0.8,
        textShadow: true,
        neonBorder: true,
        borderColor: '#00ffff',
      }
    },
    {
      name: 'Soft Elegance',
      settings: {
        textGlowIntensity: 0.2,
        neonGlowIntensity: 0.3,
        textShadow: false,
        neonBorder: false,
      }
    },
  ];

  const getGlobalTextStyle = () => ({
    color: profileSettings.textColor,
    fontFamily: profileSettings.customFont || 'inherit',
    textShadow: profileSettings.textShadow 
      ? `0 0 ${10 * profileSettings.textGlowIntensity}px ${profileSettings.textGlowColor}` 
      : 'none',
    filter: `drop-shadow(0 0 ${8 * profileSettings.textGlowIntensity}px ${profileSettings.textGlowColor})`,
  });

  const value: ProfileContextType = {
    profileMedia,
    profileSettings,
    profileStats,
    isEditing,
    uploadMedia,
    deleteMedia,
    updateProfileSettings,
    setProfilePicture,
    setBackgroundImage,
    toggleEditMode,
    shareToFeed,
    getPresetColorSchemes,
    getPresetNeonEffects,
    getGlobalTextStyle,
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
};
