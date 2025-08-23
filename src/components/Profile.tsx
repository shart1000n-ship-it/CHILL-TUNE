import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useProfile } from '../contexts/ProfileContext';
import { useNotifications } from '../contexts/NotificationContext';
import { useLocation, useNavigate } from 'react-router-dom';
import EmojiPicker from './EmojiPicker';
import MediaUpload from './MediaUpload';
import GifPicker from './GifPicker';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const {
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
  } = useProfile();
  const { checkForMentions, addReactionNotification, addCommentNotification } = useNotifications();

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'media' | 'posts' | 'messages' | 'friends' | 'settings' | 'stats'>('posts');
  const [newPost, setNewPost] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [selectedGif, setSelectedGif] = useState<string>('');
  const [showPhotoEditor, setShowPhotoEditor] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<any>(null);
  const [photoScale, setPhotoScale] = useState(1);
  const [photoRotation, setPhotoRotation] = useState(0);
  const [photoPosition, setPhotoPosition] = useState({ x: 0, y: 0 });
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [mockPosts, setMockPosts] = useState<any[]>([]);
  const [showCommentInput, setShowCommentInput] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [showReplyInput, setShowReplyInput] = useState<string | null>(null);
  const [newReply, setNewReply] = useState('');
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [isChangingUsername, setIsChangingUsername] = useState(false);
  const [directMessages, setDirectMessages] = useState<any[]>([]);
  const [selectedDM, setSelectedDM] = useState<any>(null);
  const [newDM, setNewDM] = useState('');
  const [showDMEmojiPicker, setShowDMEmojiPicker] = useState(false);
  const [showDMGifPicker, setShowDMGifPicker] = useState(false);
  const [showMediaUpload, setShowMediaUpload] = useState(false);
  const [groupMessages, setGroupMessages] = useState<any[]>([]);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedGroupMembers, setSelectedGroupMembers] = useState<string[]>([]);
  const [showCreateMessage, setShowCreateMessage] = useState(false);
  const [newMessageRecipient, setNewMessageRecipient] = useState<string>('');
  const [newMessageContent, setNewMessageContent] = useState('');
  const [showNewMessageEmojiPicker, setShowNewMessageEmojiPicker] = useState(false);
  const [showNewMessageGifPicker, setShowNewMessageGifPicker] = useState(false);
  const [newMessageMedia, setNewMessageMedia] = useState<{type: 'image' | 'video', url: string, name: string} | null>(null);
  
  // Comment reaction states
  const [commentReactions, setCommentReactions] = useState<{[key: string]: {[emoji: string]: number}}>({});
  const [userCommentReactions, setUserCommentReactions] = useState<{[key: string]: string[]}>({});
  
  // Profile video states
  const [profileVideo, setProfileVideo] = useState<{type: 'upload' | 'youtube', url: string, name?: string} | null>(null);
  const [showVideoUploadModal, setShowVideoUploadModal] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);

  const handleShareToFeed = async (mediaId: string) => {
    try {
      await shareToFeed(mediaId);
      alert('Shared to feed successfully!');
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  // Handle URL parameters for notifications
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const postId = searchParams.get('post');
    const commentId = searchParams.get('comment');
    
    if (postId) {
      // Switch to posts tab
      setActiveTab('posts');
      
      // Scroll to the specific post after a short delay to ensure posts are rendered
      setTimeout(() => {
        const postElement = document.getElementById(`post-${postId}`);
        if (postElement) {
          postElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          postElement.style.border = '2px solid #8b5cf6';
          postElement.style.borderRadius = '8px';
          
          // Remove highlight after 3 seconds
          setTimeout(() => {
            postElement.style.border = '';
            postElement.style.borderRadius = '';
          }, 3000);
        }
      }, 500);
      
      // Clear URL parameters
      navigate(location.pathname, { replace: true });
    }
  }, [location.search, navigate]);

  // Initialize mock posts on component mount
  React.useEffect(() => {
    const initialMockPosts = [
      {
        id: 'mock-1',
        user: {
          id: user?.id || '1',
          username: user?.username || 'user',
          firstName: user?.firstName || 'User',
          lastName: user?.lastName || 'Name',
          avatar: profileSettings.profilePicture || user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || 'user'}`,
        },
        content: 'Just finished an amazing workout! 💪 Feeling energized and ready to conquer the day.',
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        likes: 24,
        comments: [
          {
            id: '1',
            user: {
              id: '2',
              username: 'mike_chen',
              firstName: 'Mike',
              lastName: 'Chen',
              avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike',
            },
            content: 'Great job! 💪 What\'s your workout routine?',
            timestamp: new Date(Date.now() - 1000 * 60 * 25),
            gifUrl: undefined,
            replies: [],
          },
        ],
        gifUrl: undefined,
      },
      {
        id: 'mock-2',
        user: {
          id: user?.id || '1',
          username: user?.username || 'user',
          firstName: user?.firstName || 'User',
          lastName: user?.lastName || 'Name',
          avatar: profileSettings.profilePicture || user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || 'user'}`,
        },
        content: 'Check out this incredible sunset from my hike today! Nature never fails to amaze me. 🌅',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
        likes: 42,
        comments: [
          {
            id: '2',
            user: {
              id: '1',
              username: 'sarah_j',
              firstName: 'Sarah',
              lastName: 'Johnson',
              avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
            },
            content: 'Wow, that\'s absolutely stunning! Where was this taken?',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1.5),
            gifUrl: undefined,
            replies: [
              {
                id: '2-reply-1',
                user: {
                  id: user?.id || '1',
                  username: user?.username || 'user',
                  firstName: user?.firstName || 'User',
                  lastName: user?.lastName || 'Name',
                  avatar: profileSettings.profilePicture || user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || 'user'}`,
                },
                content: 'This was taken at Mount Wilson! Thanks for the kind words! 😊',
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1),
              },
            ],
          },
        ],
        gifUrl: undefined,
      },
    ];
    
    setMockPosts(initialMockPosts);
  }, [user, profileSettings.profilePicture]);

  // Function to get user's posts (both dynamic and mock data)
  const getUserPosts = () => {
    // Combine dynamic posts with mock posts
    return [...userPosts, ...mockPosts];
  };

  const deletePost = async (postId: string) => {
    if (confirm('Are you sure you want to delete this post?')) {
      // In a real app, this would delete the post from the database
      console.log('Deleting post:', postId);
      // You could add a posts state here and remove the post from it
      alert('Post deleted successfully!');
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (weeks === 1) return '1 week ago';
    if (weeks < 4) return `${weeks} weeks ago`;
    if (months === 1) return '1 month ago';
    if (months < 12) return `${months} months ago`;
    if (years === 1) return '1 year ago';
    return `${years} years ago`;
  };

  const handleEmojiSelect = (emoji: string) => {
    setNewPost(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleGifSelect = (gif: any) => {
    setSelectedGif(gif.url);
    setShowGifPicker(false);
  };

  const createPost = () => {
    if (!newPost.trim() && !selectedGif) return;

    const newPostObj = {
      id: Date.now().toString(),
      user: {
        id: user?.id || '1',
        username: user?.username || 'user',
        firstName: user?.firstName || 'User',
        lastName: user?.lastName || 'Name',
        avatar: profileSettings.profilePicture || user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || 'user'}`,
      },
      content: newPost,
      timestamp: new Date(),
      likes: 0,
      comments: [],
      gifUrl: selectedGif,
    };

    // Add to posts list instantly
    setUserPosts(prev => [newPostObj, ...prev]);
    
    // Check for mentions in the post content
    checkForMentions(newPost, newPostObj.id);
    
    // Clear form
    setNewPost('');
    setSelectedGif('');
    setShowEmojiPicker(false);
    setShowGifPicker(false);
  };

  // Mock direct messages data
  useEffect(() => {
    const mockDMs = [
      {
        id: '1',
        user: {
          id: '2',
          username: 'sarah_j',
          firstName: 'Sarah',
          lastName: 'Johnson',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
        },
        lastMessage: 'Hey! How are you doing?',
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        unread: true,
        type: 'direct',
      },
      {
        id: '2',
        user: {
          id: '3',
          username: 'mike_chen',
          firstName: 'Mike',
          lastName: 'Chen',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike',
        },
        lastMessage: 'Great to see you at the event!',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
        unread: false,
        type: 'direct',
      },
      {
        id: '3',
        user: {
          id: '4',
          username: 'emma_w',
          firstName: 'Emma',
          lastName: 'Wilson',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emma',
        },
        lastMessage: 'Thanks for the help with the project!',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
        unread: false,
        type: 'direct',
      },
    ];
    setDirectMessages(mockDMs);

    // Mock group messages
    const mockGroups = [
      {
        id: 'g1',
        name: 'Project Team',
        avatar: '👥',
        members: ['sarah_j', 'mike_chen', 'emma_w'],
        lastMessage: 'Meeting tomorrow at 10 AM! 📅',
        timestamp: new Date(Date.now() - 1000 * 60 * 15),
        unread: true,
        type: 'group',
      },
      {
        id: 'g2',
        name: 'College Friends',
        avatar: '🎓',
        members: ['sarah_j', 'mike_chen', 'emma_w', 'john_d'],
        lastMessage: 'Reunion planning is going great! 🎉',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3),
        unread: false,
        type: 'group',
      },
    ];
    setGroupMessages(mockGroups);
  }, []);

  // Mock friends data
  const getUserFriends = () => {
    return [
      {
        id: '1',
        username: 'sarah_j',
        firstName: 'Sarah',
        lastName: 'Johnson',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
        isOnline: true,
        lastSeen: new Date(Date.now() - 1000 * 60 * 5),
      },
      {
        id: '2',
        username: 'mike_chen',
        firstName: 'Mike',
        lastName: 'Chen',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike',
        isOnline: false,
        lastSeen: new Date(Date.now() - 1000 * 60 * 30),
      },
      {
        id: '3',
        username: 'emma_w',
        firstName: 'Emma',
        lastName: 'Wilson',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emma',
        isOnline: true,
        lastSeen: new Date(Date.now() - 1000 * 60 * 2),
      },
      {
        id: '4',
        username: 'david_r',
        firstName: 'David',
        lastName: 'Rodriguez',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=david',
        isOnline: false,
        lastSeen: new Date(Date.now() - 1000 * 60 * 60),
      },
      {
        id: '5',
        username: 'alex_t',
        firstName: 'Alex',
        lastName: 'Thompson',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
        isOnline: true,
        lastSeen: new Date(Date.now() - 1000 * 60 * 10),
      },
    ];
  };

  const totalFriends = 24; // Total friends count

  const handlePhotoEdit = (media: any) => {
    setEditingPhoto(media);
    setShowPhotoEditor(true);
    setPhotoScale(1);
    setPhotoRotation(0);
    setPhotoPosition({ x: 0, y: 0 });
  };

  const applyPhotoEdit = () => {
    if (editingPhoto) {
      // In a real app, this would apply the transformations to the image
      console.log('Applying photo edit:', { photoScale, photoRotation, photoPosition });
      setShowPhotoEditor(false);
      setEditingPhoto(null);
    }
  };

  const handleAddComment = (postId: string) => {
    if (!newComment.trim()) return;

    const comment = {
      id: Date.now().toString(),
      user: {
        id: user?.id || '1',
        username: user?.username || 'user',
        firstName: user?.firstName || 'User',
        lastName: user?.lastName || 'Name',
        avatar: user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || 'user'}`,
      },
      content: newComment,
      timestamp: new Date(),
      gifUrl: undefined,
      replies: [],
    };

    // Update user posts in state
    setUserPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === postId 
          ? { ...post, comments: [...post.comments, comment] }
          : post
      )
    );

    // Update mock posts in state if this is a mock post
    setMockPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === postId 
          ? { ...post, comments: [...post.comments, comment] }
          : post
      )
    );

    // Add comment notification
    const allPosts = getUserPosts();
    const post = allPosts.find(p => p.id === postId);
    if (post && post.user.id !== user?.id) {
      addCommentNotification(
        user?.id || '1',
        user?.username || 'user',
        user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`,
        postId,
        comment.id
      );
    }

    // Clear form
    setNewComment('');
    setShowCommentInput(null);
  };

  const handleAddReply = (postId: string, commentId: string) => {
    if (!newReply.trim()) return;

    const reply = {
      id: Date.now().toString(),
      user: {
        id: user?.id || '1',
        username: user?.username || 'user',
        firstName: user?.firstName || 'User',
        lastName: user?.lastName || 'Name',
        avatar: user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || 'user'}`,
      },
      content: newReply,
      timestamp: new Date(),
    };

    // Update user posts in state
    setUserPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === postId 
          ? {
              ...post,
              comments: post.comments.map((comment: any) =>
                comment.id === commentId
                  ? { ...comment, replies: [...(comment.replies || []), reply] }
                  : comment
              )
            }
          : post
      )
    );

    // Update mock posts in state if this is a mock post
    setMockPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === postId 
          ? {
              ...post,
              comments: post.comments.map((comment: any) =>
                comment.id === commentId
                  ? { ...comment, replies: [...(comment.replies || []), reply] }
                  : comment
              )
            }
          : post
      )
    );

    // Add reply notification
    const allPosts = getUserPosts();
    const post = allPosts.find(p => p.id === postId);
    const comment = post?.comments.find((c: any) => c.id === commentId);
    if (post && comment && comment.user.id !== user?.id) {
      addCommentNotification(
        user?.id || '1',
        user?.username || 'user',
        user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`,
        postId,
        reply.id
      );
    }

    // Clear form
    setNewReply('');
    setShowReplyInput(null);
  };

  const handleChangeUsername = async () => {
    if (!newUsername.trim() || newUsername === user?.username) return;
    
    setIsChangingUsername(true);
    
    try {
      // In a real app, this would update the username in the database
      // For now, we'll simulate the update
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update the user context (this would be done through AuthContext in real app)
      console.log('Username changed to:', newUsername);
      
      // Close modal and reset
      setShowUsernameModal(false);
      setNewUsername('');
      
      // Show success message
      alert(`Username successfully changed to @${newUsername}!`);
      
    } catch (error) {
      console.error('Username change failed:', error);
      alert('Failed to change username. Please try again.');
    } finally {
      setIsChangingUsername(false);
    }
  };

  // Handle comment reactions
  const handleCommentReaction = (commentId: string, emoji: string) => {
    setCommentReactions(prev => {
      const current = prev[commentId] || {};
      const newReactions = { ...current };
      newReactions[emoji] = (newReactions[emoji] || 0) + 1;
      return { ...prev, [commentId]: newReactions };
    });

    setUserCommentReactions(prev => {
      const current = prev[commentId] || [];
      if (current.includes(emoji)) {
        // Remove reaction if already exists
        const newReactions = current.filter(e => e !== emoji);
        setCommentReactions(prevReactions => {
          const currentReactions = prevReactions[commentId] || {};
          const newReactionCounts = { ...currentReactions };
          newReactionCounts[emoji] = Math.max(0, (newReactionCounts[emoji] || 0) - 1);
          return { ...prevReactions, [commentId]: newReactionCounts };
        });
        return { ...prev, [commentId]: newReactions };
      } else {
        // Add reaction
        return { ...prev, [commentId]: [...current, emoji] };
      }
    });
  };

  // Handle profile video upload
  const handleVideoUpload = (file: File) => {
    const videoUrl = URL.createObjectURL(file);
    
    const newVideo = {
      type: 'upload' as const,
      url: videoUrl,
      name: file.name
    };
    
    setProfileVideo(newVideo);
    setVideoFile(file);
    setShowVideoUploadModal(false);
  };

  // Handle YouTube video URL
  const handleYoutubeVideo = () => {
    if (youtubeUrl.trim()) {
      // Extract video ID from YouTube URL
      const videoId = extractYoutubeVideoId(youtubeUrl);
      if (videoId) {
        setProfileVideo({
          type: 'youtube',
          url: `https://www.youtube.com/embed/${videoId}`,
          name: 'YouTube Video'
        });
        setYoutubeUrl('');
        setShowVideoUploadModal(false);
      } else {
        alert('Please enter a valid YouTube URL');
      }
    }
  };

  // Extract YouTube video ID from URL
  const extractYoutubeVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  // Debug effect for video state
  useEffect(() => {
    console.log('Profile video state changed:', profileVideo);
  }, [profileVideo]);

  const getTextStyle = () => ({
    color: profileSettings.textColor,
    fontFamily: profileSettings.customFont || 'inherit',
    textShadow: profileSettings.textShadow 
      ? `0 0 ${10 * profileSettings.textGlowIntensity}px ${profileSettings.textGlowColor}` 
      : 'none',
    filter: `drop-shadow(0 0 ${8 * profileSettings.textGlowIntensity}px ${profileSettings.textGlowColor})`,
  });

  const getNeonBorderStyle = () => ({
    border: profileSettings.neonBorder ? `2px solid ${profileSettings.borderColor}` : 'none',
    boxShadow: profileSettings.neonBorder 
      ? `0 0 ${15 * profileSettings.neonGlowIntensity}px ${profileSettings.borderColor}` 
      : 'none',
  });

  const getBackgroundStyle = () => ({
    backgroundColor: profileSettings.backgroundColor,
    backgroundImage: profileSettings.backgroundImage 
      ? `url(${profileSettings.backgroundImage})` 
      : 'none',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  });

  return (
    <div 
      className="min-h-screen relative"
      style={getBackgroundStyle()}
    >
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="relative mb-8">
          <div className="flex items-end space-x-6">
            {/* Profile Picture */}
            <div className="relative">
              <img
                src={profileSettings.profilePicture || user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`}
                alt={user?.firstName}
                className="w-32 h-32 rounded-full border-4 border-white/20"
                style={getNeonBorderStyle()}
              />
              {isEditing && (
                <button
                  onClick={() => setShowMediaModal(true)}
                  className="absolute bottom-0 right-0 bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-purple-700 transition-colors"
                >
                  ✏️
                </button>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <h1 
                className="text-4xl font-bold mb-2"
                style={getTextStyle()}
              >
                {user?.firstName} {user?.lastName}
              </h1>
              <div className="flex items-center space-x-2 mb-2">
                <p 
                  className="text-xl"
                  style={{ color: profileSettings.neonAccentColor }}
                >
                  @{user?.username}
                </p>
                {isEditing && (
                  <button
                    onClick={() => {
                      setNewUsername(user?.username || '');
                      setShowUsernameModal(true);
                    }}
                    className="text-white/60 hover:text-white transition-colors text-sm"
                    title="Change Username"
                  >
                    ✏️
                  </button>
                )}
              </div>
              {user?.bio && (
                <p 
                  className="text-lg mb-4"
                  style={getTextStyle()}
                >
                  {user.bio}
                </p>
              )}
              
              {/* Action Buttons */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={toggleEditMode}
                  className={`px-6 py-2 rounded-lg transition-colors ${
                    isEditing 
                      ? 'bg-red-600 hover:bg-red-700 text-white' 
                      : 'bg-purple-600 hover:bg-purple-700 text-white'
                  }`}
                >
                  {isEditing ? 'Exit Edit Mode' : 'Edit Profile'}
                </button>
                
                {isEditing && (
                  <>
                    <button
                      onClick={() => setShowUploadModal(true)}
                      className="btn-primary"
                    >
                      📸 Upload Media
                    </button>
                    <button
                      onClick={() => setShowSettingsModal(true)}
                      className="btn-secondary"
                    >
                      🎨 Customize
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Top 5 Friends Section */}
          <div className="mt-8 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white" style={getTextStyle()}>
                👥 Top 5 Friends ({totalFriends})
              </h3>
              <button
                onClick={() => setActiveTab('friends')}
                className="text-purple-400 hover:text-purple-300 transition-colors text-sm"
                style={getTextStyle()}
              >
                Manage Friends →
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {getUserFriends().slice(0, 5).map((friend) => (
                <div 
                  key={friend.id} 
                  className="text-center group cursor-pointer"
                  style={getNeonBorderStyle()}
                >
                  <div className="relative mb-2">
                    <img
                      src={friend.avatar}
                      alt={friend.firstName}
                      className="w-16 h-16 rounded-full mx-auto border-2 border-white/20 group-hover:border-purple-400 transition-colors"
                    />
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                      friend.isOnline ? 'bg-green-500' : 'bg-gray-400'
                    }`}></div>
                  </div>
                  <div className="text-white font-medium text-sm" style={getTextStyle()}>
                    {friend.firstName}
                  </div>
                  <div className="text-white/60 text-xs">
                    {friend.isOnline ? 'Online' : formatTimestamp(friend.lastSeen)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Profile Video Section - Full Screen */}
          <div className="mt-6 mb-6">
            <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-lg p-4 border border-purple-500/30 w-full">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-white" style={getTextStyle()}>
                  🎥 Profile Video
                </h3>
                {isEditing && (
                  <button
                    onClick={() => setShowVideoUploadModal(true)}
                    className="text-purple-400 hover:text-purple-300 transition-colors text-sm"
                  >
                    ✏️ Change Video
                  </button>
                )}
              </div>
              
              <div className="relative w-full">
                {profileVideo ? (
                  profileVideo.type === 'youtube' ? (
                    <iframe
                      src={profileVideo.url}
                      className="w-full h-96 rounded-lg"
                      style={getNeonBorderStyle()}
                      title="Profile Video"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <video
                      key={profileVideo.url}
                      className="w-full h-96 rounded-lg object-cover"
                      autoPlay
                      muted
                      loop
                      playsInline
                      style={getNeonBorderStyle()}
                      controls
                    >
                      <source src={profileVideo.url} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  )
                ) : (
                  <video
                    className="w-full h-96 rounded-lg object-cover"
                    autoPlay
                    muted
                    loop
                    playsInline
                    style={getNeonBorderStyle()}
                  >
                    <source 
                      src="https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4" 
                      type="video/mp4" 
                    />
                    Your browser does not support the video tag.
                  </video>
                )}
                
                {/* Volume Control Overlay - Only for uploaded videos */}
                {profileVideo && profileVideo.type === 'upload' && (
                  <div className="absolute top-2 right-2">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        const video = e.currentTarget.parentElement?.previousElementSibling as HTMLVideoElement;
                        if (video) {
                          video.muted = !video.muted;
                          const button = e.currentTarget;
                          button.innerHTML = video.muted ? '🔇' : '🔊';
                          button.title = video.muted ? 'Unmute' : 'Mute';
                        }
                      }}
                      className="bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors text-sm"
                      title="Mute"
                    >
                      🔇
                    </button>
                  </div>
                )}
                
                {/* Video Controls Info */}
                <div className="mt-3 text-center">
                  <p className="text-white/60 text-sm">
                    {profileVideo ? 
                      `${profileVideo.type === 'youtube' ? 'YouTube video' : 'Uploaded video'} - ${profileVideo.name || 'Profile Video'}`
                      : 'Default video - Click Edit Profile to change'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>


        </div>

        {/* Navigation Tabs */}
                    <div className="flex space-x-1 mb-8 bg-white/10 rounded-lg p-1">
              {[
                { id: 'posts', label: '📝 Posts', count: getUserPosts().length },
                { id: 'media', label: '📸 Media', count: profileMedia.length },
                { id: 'messages', label: '💬 Messages', count: directMessages.length },
                { id: 'friends', label: '👥 Friends', count: totalFriends },
                { id: 'stats', label: '📊 Stats', count: null },
                { id: 'settings', label: '⚙️ Settings', count: null },
              ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 px-4 py-2 rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              {tab.label}
              {tab.count !== null && (
                <span className="ml-2 bg-white/20 px-2 py-1 rounded-full text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content Sections */}
        {activeTab === 'media' && (
          <div className="space-y-6">
            {/* Upload Button */}
            {isEditing && (
              <div className="text-center">
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="btn-primary text-lg px-8 py-4"
                >
                  📸 Upload New Photo or Video
                </button>
              </div>
            )}

            {/* Media Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {profileMedia.map((media) => (
                <div 
                  key={media.id} 
                  className="card overflow-hidden group"
                  style={getNeonBorderStyle()}
                >
                  {/* Media Content */}
                  <div className="relative">
                    {media.type === 'photo' ? (
                      <img
                        src={media.url}
                        alt={media.caption}
                        className="w-full h-48 object-cover"
                      />
                    ) : (
                      <video
                        src={media.url}
                        className="w-full h-48 object-cover"
                        controls
                      />
                    )}
                    
                    {/* Media Actions Overlay */}
                    {isEditing && (
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handlePhotoEdit(media)}
                          className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700"
                          title="Edit Photo"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => setProfilePicture(media.id)}
                          className="bg-green-600 text-white p-2 rounded-full hover:bg-green-700"
                          title="Set as Profile Picture"
                        >
                          👤
                        </button>
                        <button
                          onClick={() => setBackgroundImage(media.id)}
                          className="bg-purple-600 text-white p-2 rounded-full hover:bg-purple-700"
                          title="Set as Background"
                        >
                          🎨
                        </button>
                        <button
                          onClick={() => handleShareToFeed(media.id)}
                          className="bg-orange-600 text-white p-2 rounded-full hover:bg-orange-700"
                          title="Share to Feed"
                        >
                          📤
                        </button>
                        <button
                          onClick={() => deleteMedia(media.id)}
                          className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700"
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Media Info */}
                  <div className="p-4">
                    {media.caption && (
                      <p 
                        className="text-white/80 mb-2"
                        style={getTextStyle()}
                      >
                        {media.caption}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-sm text-white/60">
                      <span>{media.type === 'photo' ? '📸' : '🎥'} {media.type}</span>
                      <span>❤️ {media.likes} 💬 {media.comments}</span>
                    </div>
                    <div className="text-xs text-white/40 mt-2">
                      {new Date(media.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'posts' && (
          <div className="space-y-6">
            {/* Create Post Section */}
            <div className="card">
              <div className="flex items-start space-x-3 mb-4">
                <img
                  src={profileSettings.profilePicture || user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`}
                  alt={user?.firstName}
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1">
                  <textarea
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    placeholder="What's on your mind?"
                    className="w-full bg-transparent border-none text-white placeholder-white/60 resize-none focus:outline-none text-lg"
                    rows={3}
                  />
                  
                  {/* Selected GIF Preview */}
                  {selectedGif && (
                    <div className="mt-3 relative">
                      <img 
                        src={selectedGif} 
                        alt="Selected GIF" 
                        className="max-w-full max-h-48 rounded-lg"
                      />
                      <button
                        onClick={() => setSelectedGif('')}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Emoji and GIF Buttons */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="text-2xl hover:scale-110 transition-transform"
                    title="Add emoji"
                  >
                    😀
                  </button>
                  <button
                    onClick={() => setShowGifPicker(!showGifPicker)}
                    className="text-2xl hover:scale-110 transition-transform"
                    title="Add GIF"
                  >
                    🎬
                  </button>
                </div>
                
                <button
                  onClick={createPost}
                  disabled={!newPost.trim() && !selectedGif}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Post
                </button>
              </div>

              {/* Emoji Picker */}
              {showEmojiPicker && (
                <div className="mb-4">
                  <EmojiPicker
                    isOpen={showEmojiPicker}
                    onClose={() => setShowEmojiPicker(false)}
                    onSelectEmoji={handleEmojiSelect}
                  />
                </div>
              )}

              {/* GIF Picker */}
              {showGifPicker && (
                <div className="mb-4">
                  <GifPicker
                    isOpen={showGifPicker}
                    onClose={() => setShowGifPicker(false)}
                    onSelectGif={handleGifSelect}
                  />
                </div>
              )}
            </div>

            {/* User's Posts from Feed */}
            <div className="space-y-6">
              {getUserPosts().map((post) => (
                <div 
                  key={post.id} 
                  id={`post-${post.id}`}
                  className="card overflow-hidden"
                  style={getNeonBorderStyle()}
                >
                  {/* Post Header */}
                  <div className="flex items-center space-x-3 p-4 border-b border-white/20">
                    <img
                      src={post.user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.user.username}`}
                      alt={post.user.firstName}
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-white" style={getTextStyle()}>
                        {post.user.firstName} {post.user.lastName}
                      </div>
                      <div className="text-white/60 text-sm">
                        @{post.user.username} • {formatTimestamp(post.timestamp)}
                      </div>
                    </div>
                    {isEditing && (
                      <button
                        onClick={() => deletePost(post.id)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                        title="Delete Post"
                      >
                        🗑️
                      </button>
                    )}
                  </div>

                  {/* Post Content */}
                  <div className="p-4">
                    <p className="text-white text-lg mb-4" style={getTextStyle()}>
                      {post.content}
                    </p>
                    
                    {/* Post Media */}
                    {post.gifUrl && (
                      <div className="mb-4">
                        <img 
                          src={post.gifUrl} 
                          alt="Post GIF" 
                          className="max-w-full max-h-96 rounded-lg"
                        />
                      </div>
                    )}
                  </div>

                  {/* Post Stats */}
                  <div className="flex items-center justify-between text-white/60 text-sm px-4 pb-4">
                    <span>❤️ {post.likes} likes</span>
                    <span>💬 {post.comments.length} comments</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between border-t border-white/20 pt-4 px-4 pb-4">
                    <div className="flex items-center space-x-6">
                      <button className="text-lg hover:scale-110 transition-transform">❤️</button>
                      <button className="text-lg hover:scale-110 transition-transform">😂</button>
                      <button className="text-lg hover:scale-110 transition-transform">🔥</button>
                    </div>
                    <button 
                      onClick={() => setShowCommentInput(showCommentInput === post.id ? null : post.id)}
                      className="text-white/60 hover:text-white transition-colors"
                    >
                      💬 Comment
                    </button>
                  </div>

                  {/* Add Comment Section */}
                  {showCommentInput === post.id && (
                    <div className="border-t border-white/20 p-4 bg-white/5">
                      <div className="flex items-start space-x-3">
                        <img
                          src={profileSettings.profilePicture || user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`}
                          alt={user?.firstName}
                          className="w-8 h-8 rounded-full flex-shrink-0"
                        />
                        <div className="flex-1">
                          <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Write a comment..."
                            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                            rows={2}
                          />
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center space-x-2">
                              <button className="text-2xl hover:scale-110 transition-transform">😀</button>
                              <button className="text-2xl hover:scale-110 transition-transform">🎬</button>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => setShowCommentInput(null)}
                                className="px-3 py-1 text-white/60 hover:text-white transition-colors"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleAddComment(post.id)}
                                disabled={!newComment.trim()}
                                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed px-4 py-1"
                              >
                                Post
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Comments Section */}
                  {post.comments.length > 0 && (
                    <div className="border-t border-white/20 p-4 bg-white/5">
                      <h4 className="text-white/80 font-medium mb-3">Comments</h4>
                      <div className="space-y-4">
                        {post.comments.map((comment: any) => (
                          <div key={comment.id} className="space-y-3">
                            {/* Main Comment */}
                            <div className="flex items-start space-x-3">
                              <img
                                src={comment.user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.user.username}`}
                                alt={comment.user.firstName}
                                className="w-8 h-8 rounded-full flex-shrink-0"
                              />
                              <div className="flex-1">
                                <div className="bg-white/10 rounded-lg p-3">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <span className="font-semibold text-white text-sm">
                                      {comment.user.firstName} {comment.user.lastName}
                                    </span>
                                    <span className="text-white/40 text-xs">
                                      {formatTimestamp(comment.timestamp)}
                                    </span>
                                  </div>
                                  <p className="text-white/80 text-sm">{comment.content}</p>
                                  {comment.gifUrl && (
                                    <div className="mt-2">
                                      <img 
                                        src={comment.gifUrl} 
                                        alt="Comment GIF" 
                                        className="max-h-32 rounded"
                                      />
                                    </div>
                                  )}
                                  
                                  {/* Comment Reactions */}
                                  <div className="flex items-center space-x-2 mt-2">
                                    <button
                                      onClick={() => handleCommentReaction(comment.id, '❤️')}
                                      className={`text-sm px-2 py-1 rounded-full transition-colors ${
                                        userCommentReactions[comment.id]?.includes('❤️') 
                                          ? 'bg-red-500 text-white' 
                                          : 'bg-white/10 text-white/80 hover:bg-white/20'
                                      }`}
                                    >
                                      ❤️ {commentReactions[comment.id]?.['❤️'] || 0}
                                    </button>
                                    <button
                                      onClick={() => handleCommentReaction(comment.id, '👍')}
                                      className={`text-sm px-2 py-1 rounded-full transition-colors ${
                                        userCommentReactions[comment.id]?.includes('👍') 
                                          ? 'bg-blue-500 text-white' 
                                          : 'bg-white/10 text-white/80 hover:bg-white/20'
                                      }`}
                                    >
                                      👍 {commentReactions[comment.id]?.['👍'] || 0}
                                    </button>
                                    <button
                                      onClick={() => handleCommentReaction(comment.id, '😂')}
                                      className={`text-sm px-2 py-1 rounded-full transition-colors ${
                                        userCommentReactions[comment.id]?.includes('😂') 
                                          ? 'bg-yellow-500 text-white' 
                                          : 'bg-white/10 text-white/80 hover:bg-white/20'
                                      }`}
                                    >
                                      😂 {commentReactions[comment.id]?.['😂'] || 0}
                                    </button>
                                    <button
                                      onClick={() => handleCommentReaction(comment.id, '🔥')}
                                      className={`text-sm px-2 py-1 rounded-full transition-colors ${
                                        userCommentReactions[comment.id]?.includes('🔥') 
                                          ? 'bg-orange-500 text-white' 
                                          : 'bg-white/10 text-white/80 hover:bg-white/20'
                                      }`}
                                    >
                                      🔥 {commentReactions[comment.id]?.['🔥'] || 0}
                                    </button>
                                  </div>
                                </div>
                                
                                {/* Reply Button */}
                                <button
                                  onClick={() => setShowReplyInput(showReplyInput === comment.id ? null : comment.id)}
                                  className="text-white/60 hover:text-white text-xs mt-1 ml-3"
                                >
                                  💬 Reply
                                </button>

                                {/* Add Reply Section */}
                                {showReplyInput === comment.id && (
                                  <div className="mt-3 ml-3">
                                    <div className="flex items-start space-x-3">
                                      <img
                                        src={profileSettings.profilePicture || user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`}
                                        alt={user?.firstName}
                                        className="w-6 h-6 rounded-full flex-shrink-0"
                                      />
                                      <div className="flex-1">
                                        <textarea
                                          value={newReply}
                                          onChange={(e) => setNewReply(e.target.value)}
                                          placeholder={`Reply to ${comment.user.firstName}...`}
                                          className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none text-sm"
                                          rows={2}
                                        />
                                        
                                        {/* Emoji and GIF Buttons for Reply */}
                                        <div className="flex items-center space-x-2 mt-2">
                                          <button
                                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                            className="text-lg hover:scale-110 transition-transform"
                                            title="Add emoji"
                                          >
                                            😀
                                          </button>
                                          <button
                                            onClick={() => setShowGifPicker(!showGifPicker)}
                                            className="text-lg hover:scale-110 transition-transform"
                                            title="Add GIF"
                                          >
                                            🎬
                                          </button>
                                        </div>

                                        {/* Emoji Picker for Reply */}
                                        {showEmojiPicker && (
                                          <div className="mt-2">
                                            <EmojiPicker
                                              isOpen={showEmojiPicker}
                                              onClose={() => setShowEmojiPicker(false)}
                                              onSelectEmoji={(emoji) => setNewReply(prev => prev + emoji)}
                                            />
                                          </div>
                                        )}

                                        {/* GIF Picker for Reply */}
                                        {showGifPicker && (
                                          <div className="mt-2">
                                            <GifPicker
                                              isOpen={showGifPicker}
                                              onClose={() => setShowGifPicker(false)}
                                              onSelectGif={(gif) => setNewReply(prev => prev + ` [GIF: ${gif.url}]`)}
                                            />
                                          </div>
                                        )}

                                        <div className="flex space-x-2 mt-2">
                                          <button
                                            onClick={() => setShowReplyInput(null)}
                                            className="px-3 py-1 text-white/60 hover:text-white transition-colors text-xs"
                                          >
                                            Cancel
                                          </button>
                                          <button
                                            onClick={() => handleAddReply(post.id, comment.id)}
                                            disabled={!newReply.trim()}
                                            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed px-3 py-1 text-xs"
                                          >
                                            Reply
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* Replies */}
                                {comment.replies && comment.replies.length > 0 && (
                                  <div className="ml-6 mt-3 space-y-2">
                                    {comment.replies.map((reply: any) => (
                                      <div key={reply.id} className="flex items-start space-x-3">
                                        <img
                                          src={reply.user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${reply.user.username}`}
                                          alt={reply.user.firstName}
                                          className="w-6 h-6 rounded-full flex-shrink-0"
                                        />
                                        <div className="flex-1">
                                          <div className="bg-white/5 rounded-lg p-2">
                                            <div className="flex items-center space-x-2 mb-1">
                                              <span className="font-semibold text-white text-xs">
                                                {reply.user.firstName} {reply.user.lastName}
                                              </span>
                                              <span className="text-white/40 text-xs">
                                                {formatTimestamp(reply.timestamp)}
                                              </span>
                                            </div>
                                            <p className="text-white/80 text-xs">{reply.content}</p>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* No Posts Message */}
            {getUserPosts().length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-xl font-semibold text-white mb-2" style={getTextStyle()}>
                  No Posts Yet
                </h3>
                <p className="text-white/60 mb-6">
                  Start sharing your thoughts and experiences with the community!
                </p>
                <button
                  onClick={() => setActiveTab('posts')}
                  className="btn-primary"
                >
                  Create Your First Post
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="space-y-6">
            {/* Header with Create Buttons */}
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white" style={getTextStyle()}>
                💬 Messages
              </h3>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowCreateMessage(true)}
                  className="btn-secondary"
                >
                  ✉️ New Message
                </button>
                <button
                  onClick={() => setShowCreateGroup(true)}
                  className="btn-primary"
                >
                  🆕 Create Group
                </button>
              </div>
            </div>

            {/* Direct Messages */}
            <div className="card">
              <h4 className="text-lg font-semibold text-white mb-4" style={getTextStyle()}>
                👤 Direct Messages
              </h4>
              
              {directMessages.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">💬</div>
                  <p className="text-white/60">No direct messages yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {directMessages.map((dm) => (
                    <div 
                      key={dm.id} 
                      className={`p-4 rounded-lg cursor-pointer transition-colors ${
                        selectedDM?.id === dm.id 
                          ? 'bg-purple-500/20 border border-purple-500/50' 
                          : 'bg-white/5 hover:bg-white/10'
                      }`}
                      onClick={() => setSelectedDM(dm)}
                      style={getNeonBorderStyle()}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <img
                            src={dm.user.avatar}
                            alt={dm.user.firstName}
                            className="w-12 h-12 rounded-full"
                          />
                          {dm.unread && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs">!</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-semibold text-white" style={getTextStyle()}>
                              {dm.user.firstName} {dm.user.lastName}
                            </h4>
                            <span className="text-white/40 text-xs">
                              {formatTimestamp(dm.timestamp)}
                            </span>
                          </div>
                          <p className="text-white/70 text-sm truncate">
                            {dm.lastMessage}
                          </p>
                          <p className="text-white/40 text-xs">
                            @{dm.user.username}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Group Messages */}
            <div className="card">
              <h4 className="text-lg font-semibold text-white mb-4" style={getTextStyle()}>
                👥 Group Messages
              </h4>
              
              {groupMessages.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">👥</div>
                  <p className="text-white/60">No group messages yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {groupMessages.map((group) => (
                    <div 
                      key={group.id} 
                      className={`p-4 rounded-lg cursor-pointer transition-colors ${
                        selectedDM?.id === group.id 
                          ? 'bg-purple-500/20 border border-purple-500/50' 
                          : 'bg-white/5 hover:bg-white/10'
                      }`}
                      onClick={() => setSelectedDM(group)}
                      style={getNeonBorderStyle()}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-2xl">
                            {group.avatar}
                          </div>
                          {group.unread && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs">!</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-semibold text-white" style={getTextStyle()}>
                              {group.name}
                            </h4>
                            <span className="text-white/40 text-xs">
                              {formatTimestamp(group.timestamp)}
                            </span>
                          </div>
                          <p className="text-white/70 text-sm truncate">
                            {group.lastMessage}
                          </p>
                          <p className="text-white/40 text-xs">
                            {group.members.length} members
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Selected DM Chat */}
            {selectedDM && (
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <img
                      src={selectedDM.user.avatar}
                      alt={selectedDM.user.firstName}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <h4 className="font-semibold text-white" style={getTextStyle()}>
                        {selectedDM.user.firstName} {selectedDM.user.lastName}
                      </h4>
                      <p className="text-white/60 text-sm">@{selectedDM.user.username}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedDM(null)}
                    className="text-white/60 hover:text-white transition-colors"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="border-t border-white/20 pt-4">
                  <div className="mb-4">
                    <p className="text-white/80 text-sm bg-white/10 rounded-lg p-3">
                      {selectedDM.lastMessage}
                    </p>
                    <p className="text-white/40 text-xs mt-2 text-right">
                      {formatTimestamp(selectedDM.timestamp)}
                    </p>
                  </div>
                  
                  {/* Media Upload Preview */}
                  {selectedDM.media && (
                    <div className="mb-4">
                      {selectedDM.media.type === 'image' ? (
                        <img 
                          src={selectedDM.media.url} 
                          alt="Shared media" 
                          className="max-h-32 rounded-lg"
                        />
                      ) : selectedDM.media.type === 'video' ? (
                        <video 
                          src={selectedDM.media.url} 
                          controls 
                          className="max-h-32 rounded-lg"
                        />
                      ) : (
                        <div className="bg-white/10 p-3 rounded-lg">
                          <span className="text-white/80">📎 {selectedDM.media.name}</span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Message Input with Media Support */}
                  <div className="space-y-3">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newDM}
                        onChange={(e) => setNewDM(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 input-field"
                      />
                      <button
                        onClick={() => setShowDMEmojiPicker(!showDMEmojiPicker)}
                        className="p-2 text-white/60 hover:text-white transition-colors"
                        title="Add emoji"
                      >
                        😊
                      </button>
                      <button
                        onClick={() => setShowDMGifPicker(!showDMGifPicker)}
                        className="p-2 text-white/60 hover:text-white transition-colors"
                        title="Add GIF"
                      >
                        🎬
                      </button>
                      <button
                        onClick={() => setShowMediaUpload(true)}
                        className="p-2 text-white/60 hover:text-white transition-colors"
                        title="Attach media"
                      >
                        📎
                      </button>
                    </div>
                    
                    {/* Emoji Picker */}
                    {showDMEmojiPicker && (
                      <div className="bg-white/10 rounded-lg p-3">
                        <div className="grid grid-cols-8 gap-2">
                          {['😊', '😂', '❤️', '🔥', '👍', '🎉', '😎', '🤔', '😢', '😡', '🥳', '🤩', '😴', '🤗', '😍', '😘'].map((emoji) => (
                            <button
                              key={emoji}
                              onClick={() => {
                                setNewDM(prev => prev + emoji);
                                setShowDMEmojiPicker(false);
                              }}
                              className="text-2xl hover:scale-110 transition-transform p-1"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* GIF Picker */}
                    {showDMGifPicker && (
                      <div className="bg-white/10 rounded-lg p-3">
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif',
                            'https://media.giphy.com/media/26BRv0ThflsHCqDrG/giphy.gif',
                            'https://media.giphy.com/media/3o7TKoWXm3okO1kgHC/giphy.gif',
                            'https://media.giphy.com/media/3o7TKDEqg6Er4va8hi/giphy.gif',
                            'https://media.giphy.com/media/3o7TKDEqg6Er4va8hi/giphy.gif',
                            'https://media.giphy.com/media/3o7TKDEqg6Er4va8hi/giphy.gif'
                          ].map((gif, index) => (
                            <button
                              key={index}
                              onClick={() => {
                                setNewDM(prev => prev + ` [GIF]`);
                                setShowDMGifPicker(false);
                              }}
                              className="w-full h-20 bg-gray-700 rounded hover:scale-105 transition-transform"
                            >
                              <img src={gif} alt="GIF" className="w-full h-full object-cover rounded" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          if (newDM.trim()) {
                            // In a real app, this would send the message
                            console.log('Sending DM to:', selectedDM.user?.username || selectedDM.name, 'Message:', newDM);
                            setNewDM('');
                            setShowDMEmojiPicker(false);
                            setShowDMGifPicker(false);
                          }
                        }}
                        disabled={!newDM.trim()}
                        className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Send
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'friends' && (
          <div className="space-y-6">
            <div className="card">
              <h3 className="text-xl font-semibold text-white mb-6" style={getTextStyle()}>
                👥 Manage Friends List
              </h3>
              
              {/* Current Top 5 Friends */}
              <div className="mb-6">
                <h4 className="text-lg font-medium mb-4" style={getTextStyle()}>
                  Current Top 5 Friends
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {getUserFriends().slice(0, 5).map((friend, index) => (
                    <div key={friend.id} className="text-center">
                      <div className="relative mb-2">
                        <div className="absolute -top-2 -left-2 bg-purple-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                          {index + 1}
                        </div>
                        <img
                          src={friend.avatar}
                          alt={friend.firstName}
                          className="w-16 h-16 rounded-full mx-auto border-2 border-purple-400"
                        />
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                          friend.isOnline ? 'bg-green-500' : 'bg-gray-400'
                        }`}></div>
                      </div>
                      <div className="text-white font-medium text-sm" style={getTextStyle()}>
                        {friend.firstName}
                      </div>
                      <div className="text-white/60 text-xs">
                        {friend.isOnline ? 'Online' : 'Offline'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* All Friends */}
              <div>
                <h4 className="text-lg font-medium mb-4" style={getTextStyle()}>
                  All Friends ({getUserFriends().length})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getUserFriends().map((friend) => (
                    <div 
                      key={friend.id} 
                      className={`p-3 rounded-lg border-2 transition-colors ${
                        getUserFriends().indexOf(friend) < 5 
                          ? 'border-purple-400 bg-purple-500/10' 
                          : 'border-white/20 bg-white/5'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <img
                          src={friend.avatar}
                          alt={friend.firstName}
                          className="w-12 h-12 rounded-full"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-white" style={getTextStyle()}>
                            {friend.firstName} {friend.lastName}
                          </div>
                          <div className="text-white/60 text-sm">
                            {friend.isOnline ? '🟢 Online' : '⚫ Offline'}
                          </div>
                          {getUserFriends().indexOf(friend) < 5 && (
                            <div className="text-purple-400 text-xs font-medium">
                              Top 5 Friend
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col space-y-1">
                          {getUserFriends().indexOf(friend) >= 5 && (
                            <button
                              onClick={() => {
                                // In a real app, this would promote the friend to top 5
                                console.log('Promoting friend to top 5:', friend.firstName);
                              }}
                              className="text-xs bg-purple-600 hover:bg-purple-700 text-white px-2 py-1 rounded transition-colors"
                            >
                              Promote
                            </button>
                          )}
                          {getUserFriends().indexOf(friend) < 5 && (
                            <button
                              onClick={() => {
                                // In a real app, this would demote the friend from top 5
                                console.log('Demoting friend from top 5:', friend.firstName);
                              }}
                              className="text-xs bg-gray-600 hover:bg-gray-700 text-white px-2 py-1 rounded transition-colors"
                            >
                              Demote
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Photos', value: profileStats.totalPhotos, icon: '📸' },
              { label: 'Videos', value: profileStats.totalVideos, icon: '🎥' },
              { label: 'Posts', value: getUserPosts().length, icon: '📝' },
              { label: 'Followers', value: profileStats.followers, icon: '👥' },
              { label: 'Following', value: profileStats.following, icon: '👤' },
              { label: 'Profile Views', value: profileStats.profileViews, icon: '👁️' },
            ].map((stat) => (
              <div 
                key={stat.label} 
                className="card text-center"
                style={getNeonBorderStyle()}
              >
                <div className="text-4xl mb-2">{stat.icon}</div>
                <div 
                  className="text-2xl font-bold mb-1"
                  style={getTextStyle()}
                >
                  {stat.value}
                </div>
                <div className="text-white/60 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            {/* Username Change Section */}
            <div className="card">
              <h3 className="text-xl font-semibold text-white mb-6" style={getTextStyle()}>
                ✏️ Edit Profile Information
              </h3>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Change Username
                </label>
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      placeholder="Enter new username"
                      className="input-field w-full"
                      maxLength={20}
                    />
                    <p className="text-white/40 text-xs mt-1">
                      Username must be 3-20 characters, letters, numbers, and underscores only
                    </p>
                  </div>
                  <button
                    onClick={handleChangeUsername}
                    disabled={!newUsername.trim() || newUsername === user?.username || isChangingUsername}
                    className="btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    {isChangingUsername ? 'Changing...' : 'Change Username'}
                  </button>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="text-xl font-semibold text-white mb-6" style={getTextStyle()}>
                🎨 Customize Your Profile
              </h3>
              
              {/* Color Schemes */}
              <div className="mb-6">
                <h4 className="text-lg font-medium mb-3" style={getTextStyle()}>
                  Color Schemes
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {getPresetColorSchemes().map((scheme) => (
                    <button
                      key={scheme.name}
                      onClick={() => updateProfileSettings(scheme.colors)}
                      className="p-3 rounded-lg border border-white/20 hover:border-white/40 transition-colors text-left"
                    >
                      <div className="font-medium text-white mb-2">{scheme.name}</div>
                      <div className="flex space-x-2">
                        {Object.entries(scheme.colors).map(([key, color]) => (
                          <div
                            key={key}
                            className="w-4 h-4 rounded border border-white/20"
                            style={{ backgroundColor: color as string }}
                          />
                        ))}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Neon Effects */}
              <div className="mb-6">
                <h4 className="text-lg font-medium mb-3" style={getTextStyle()}>
                  Neon Effects
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {getPresetNeonEffects().map((effect) => (
                    <button
                      key={effect.name}
                      onClick={() => updateProfileSettings(effect.settings)}
                      className="p-3 rounded-lg border border-white/20 hover:border-white/40 transition-colors text-left"
                    >
                      <div className="font-medium text-white">{effect.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Selection */}
              <div className="mb-6">
                <h4 className="text-lg font-medium mb-3" style={getTextStyle()}>
                  Font Selection
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { name: 'Default', value: 'inherit' },
                    { name: 'Modern Sans', value: 'Inter, system-ui, sans-serif' },
                    { name: 'Elegant Serif', value: 'Georgia, serif' },
                    { name: 'Monospace', value: 'JetBrains Mono, monospace' },
                    { name: 'Handwriting', value: 'Caveat, cursive' },
                    { name: 'Display', value: 'Playfair Display, serif' },
                    { name: 'Tech', value: 'Orbitron, sans-serif' },
                    { name: 'Fancy', value: 'Dancing Script, cursive' },
                  ].map((font) => (
                    <button
                      key={font.name}
                      onClick={() => updateProfileSettings({ customFont: font.value })}
                      className={`p-3 rounded-lg border border-white/20 hover:border-white/40 transition-colors text-left ${
                        profileSettings.customFont === font.value ? 'border-purple-500 bg-purple-500/20' : ''
                      }`}
                      style={{ fontFamily: font.value }}
                    >
                      <div className="font-medium text-white mb-1">{font.name}</div>
                      <div className="text-white/60 text-sm">The quick brown fox</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Colors */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Text Color
                  </label>
                  <input
                    type="color"
                    value={profileSettings.textColor}
                    onChange={(e) => updateProfileSettings({ textColor: e.target.value })}
                    className="w-full h-10 rounded-lg border border-white/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Glow Color
                  </label>
                  <input
                    type="color"
                    value={profileSettings.textGlowColor}
                    onChange={(e) => updateProfileSettings({ textGlowColor: e.target.value })}
                    className="w-full h-10 rounded-lg border border-white/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Background Color
                  </label>
                  <input
                    type="color"
                    value={profileSettings.backgroundColor}
                    onChange={(e) => updateProfileSettings({ backgroundColor: e.target.value })}
                    className="w-full h-10 rounded-lg border border-white/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Neon Accent
                  </label>
                  <input
                    type="color"
                    value={profileSettings.neonAccentColor}
                    onChange={(e) => updateProfileSettings({ neonAccentColor: e.target.value })}
                    className="w-full h-10 rounded-lg border border-white/20"
                  />
                </div>
              </div>

              {/* Effect Intensity Sliders */}
              <div className="space-y-4 mt-6">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Text Glow Intensity: {profileSettings.textGlowIntensity.toFixed(1)}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={profileSettings.textGlowIntensity}
                    onChange={(e) => updateProfileSettings({ textGlowIntensity: parseFloat(e.target.value) })}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Neon Glow Intensity: {profileSettings.neonGlowIntensity.toFixed(1)}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={profileSettings.neonGlowIntensity}
                    onChange={(e) => updateProfileSettings({ neonGlowIntensity: parseFloat(e.target.value) })}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Toggle Options */}
              <div className="flex items-center space-x-6 mt-6">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={profileSettings.textShadow}
                    onChange={(e) => updateProfileSettings({ textShadow: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-white/80">Text Shadow</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={profileSettings.neonBorder}
                    onChange={(e) => updateProfileSettings({ neonBorder: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-white/80">Neon Border</span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Media Upload Component */}
      <MediaUpload
        isOpen={showUploadModal}
        onUpload={uploadMedia}
        onCancel={() => setShowUploadModal(false)}
      />

      {/* Media Selection Modal */}
      {showMediaModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="card max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-white mb-6">Select Media</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {profileMedia.filter(m => m.type === 'photo').map((media) => (
                <div 
                  key={media.id} 
                  className="relative cursor-pointer group"
                  onClick={() => setSelectedMedia(media)}
                >
                  <img
                    src={media.url}
                    alt={media.caption}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm">Click to select</span>
                  </div>
                </div>
              ))}
            </div>

            {selectedMedia && (
              <div className="mt-6 p-4 bg-white/10 rounded-lg">
                <h4 className="text-lg font-medium text-white mb-4">Set as:</h4>
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setProfilePicture(selectedMedia.id);
                      setShowMediaModal(false);
                      setSelectedMedia(null);
                    }}
                    className="btn-primary"
                  >
                    Profile Picture
                  </button>

                  <button
                    onClick={() => {
                      setBackgroundImage(selectedMedia.id);
                      setShowMediaModal(false);
                      setSelectedMedia(null);
                    }}
                    className="btn-secondary"
                  >
                    Background
                  </button>
                </div>
              </div>
            )}

            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setShowMediaModal(false);
                  setSelectedMedia(null);
                }}
                className="btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Photo Editor Modal */}
      {showPhotoEditor && editingPhoto && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="card max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-white mb-6">✏️ Edit Photo</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Photo Preview */}
              <div className="relative bg-black/20 rounded-lg p-4">
                <div className="relative overflow-hidden rounded-lg" style={{ height: '300px' }}>
                  <img
                    src={editingPhoto.url}
                    alt="Editing"
                    className="w-full h-full object-cover"
                    style={{
                      transform: `scale(${photoScale}) rotate(${photoRotation}deg) translate(${photoPosition.x}px, ${photoPosition.y}px)`,
                      transition: 'transform 0.3s ease',
                    }}
                  />
                </div>
                <div className="text-center mt-4 text-white/60 text-sm">
                  Photo Preview
                </div>
              </div>

              {/* Controls */}
              <div className="space-y-6">
                {/* Scale Control */}
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Scale: {photoScale.toFixed(2)}x
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="3"
                    step="0.1"
                    value={photoScale}
                    onChange={(e) => setPhotoScale(parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-white/40 mt-1">
                    <span>0.5x</span>
                    <span>1x</span>
                    <span>2x</span>
                    <span>3x</span>
                  </div>
                </div>

                {/* Rotation Control */}
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Rotation: {photoRotation}°
                  </label>
                  <input
                    type="range"
                    min="-180"
                    max="180"
                    step="5"
                    value={photoRotation}
                    onChange={(e) => setPhotoRotation(parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-white/40 mt-1">
                    <span>-180°</span>
                    <span>0°</span>
                    <span>180°</span>
                  </div>
                </div>

                {/* Position Controls */}
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Position
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-white/60 mb-1">X: {photoPosition.x}px</label>
                      <input
                        type="range"
                        min="-100"
                        max="100"
                        step="5"
                        value={photoPosition.x}
                        onChange={(e) => setPhotoPosition(prev => ({ ...prev, x: parseInt(e.target.value) }))}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-white/60 mb-1">Y: {photoPosition.y}px</label>
                      <input
                        type="range"
                        min="-100"
                        max="100"
                        step="5"
                        value={photoPosition.y}
                        onChange={(e) => setPhotoPosition(prev => ({ ...prev, y: parseInt(e.target.value) }))}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>

                {/* Quick Reset Buttons */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setPhotoScale(1);
                      setPhotoRotation(0);
                      setPhotoPosition({ x: 0, y: 0 });
                    }}
                    className="btn-secondary flex-1"
                  >
                    🔄 Reset
                  </button>
                  <button
                    onClick={() => setShowPhotoEditor(false)}
                    className="btn-secondary flex-1"
                  >
                    ❌ Cancel
                  </button>
                </div>

                {/* Apply Button */}
                <button
                  onClick={applyPhotoEdit}
                  className="btn-primary w-full"
                >
                  ✅ Apply Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Username Change Modal */}
      {showUsernameModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="card max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-white mb-6">✏️ Change Username</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Current Username
                </label>
                <div className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white/60">
                  @{user?.username}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  New Username
                </label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full input-field"
                  placeholder="Enter new username"
                  maxLength={20}
                />
                <p className="text-white/40 text-xs mt-1">
                  Username must be 3-20 characters, letters, numbers, and underscores only
                </p>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowUsernameModal(false);
                  setNewUsername('');
                }}
                className="btn-secondary flex-1"
                disabled={isChangingUsername}
              >
                Cancel
              </button>
              <button
                onClick={handleChangeUsername}
                disabled={!newUsername.trim() || newUsername === user?.username || isChangingUsername}
                className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isChangingUsername ? 'Changing...' : 'Change Username'}
              </button>
            </div>
          </div>
        </div>
      )}

              {/* Create Message Modal */}
        {showCreateMessage && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="card max-w-md w-full mx-4">
              <h3 className="text-xl font-semibold text-white mb-6" style={getTextStyle()}>
                ✉️ Send New Message
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Select Recipient</label>
                  <select
                    value={newMessageRecipient}
                    onChange={(e) => setNewMessageRecipient(e.target.value)}
                    className="w-full input-field"
                  >
                    <option value="">Choose a friend...</option>
                    {getUserFriends().map((friend) => (
                      <option key={friend.id} value={friend.id}>
                        {friend.firstName} {friend.lastName} (@{friend.username})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Message</label>
                  
                  {/* Message Input with Emoji/GIF/Media Buttons */}
                  <div className="space-y-3">
                    <div className="flex space-x-2">
                      <textarea
                        value={newMessageContent}
                        onChange={(e) => setNewMessageContent(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 input-field min-h-[100px] resize-none"
                        maxLength={500}
                      />
                      <div className="flex flex-col space-y-2">
                        <button
                          onClick={() => setShowNewMessageEmojiPicker(!showNewMessageEmojiPicker)}
                          className="p-2 text-white/60 hover:text-white transition-colors bg-white/10 rounded"
                          title="Add emoji"
                        >
                          😊
                        </button>
                        <button
                          onClick={() => setShowNewMessageGifPicker(!showNewMessageGifPicker)}
                          className="p-2 text-white/60 hover:text-white transition-colors bg-white/10 rounded"
                          title="Add GIF"
                        >
                          🎬
                        </button>
                        <button
                          onClick={() => setShowMediaUpload(true)}
                          className="p-2 text-white/60 hover:text-white transition-colors bg-white/10 rounded"
                          title="Attach media"
                        >
                          📎
                        </button>
                      </div>
                    </div>
                    
                    {/* Character Counter */}
                    <p className="text-white/40 text-xs text-right">
                      {newMessageContent.length}/500
                    </p>
                    
                    {/* Emoji Picker */}
                    {showNewMessageEmojiPicker && (
                      <div className="bg-white/10 rounded-lg p-3">
                        <div className="grid grid-cols-8 gap-2">
                          {['😊', '😂', '❤️', '🔥', '👍', '🎉', '😎', '🤔', '😢', '😡', '🥳', '🤩', '😴', '🤗', '😍', '😘'].map((emoji) => (
                            <button
                              key={emoji}
                              onClick={() => {
                                setNewMessageContent(prev => prev + emoji);
                                setShowNewMessageEmojiPicker(false);
                              }}
                              className="text-2xl hover:scale-110 transition-transform p-1"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* GIF Picker */}
                    {showNewMessageGifPicker && (
                      <div className="bg-white/10 rounded-lg p-3">
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif',
                            'https://media.giphy.com/media/26BRv0ThflsHCqDrG/giphy.gif',
                            'https://media.giphy.com/media/3o7TKoWXm3okO1kgHC/giphy.gif',
                            'https://media.giphy.com/media/3o7TKDEqg6Er4va8hi/giphy.gif',
                            'https://media.giphy.com/media/3o7TKDEqg6Er4va8hi/giphy.gif',
                            'https://media.giphy.com/media/3o7TKDEqg6Er4va8hi/giphy.gif'
                          ].map((gif, index) => (
                            <button
                              key={index}
                              onClick={() => {
                                setNewMessageContent(prev => prev + ` [GIF]`);
                                setShowNewMessageGifPicker(false);
                              }}
                              className="w-full h-20 bg-gray-700 rounded hover:scale-105 transition-transform"
                            >
                              <img src={gif} alt="GIF" className="w-full h-full object-cover rounded" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Media Preview */}
                {newMessageMedia && (
                  <div className="bg-white/10 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white/80 text-sm">Attached Media:</span>
                      <button
                        onClick={() => setNewMessageMedia(null)}
                        className="text-white/40 hover:text-white transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                    {newMessageMedia.type === 'image' ? (
                      <img 
                        src={newMessageMedia.url} 
                        alt="Attached image" 
                        className="max-h-32 rounded-lg"
                      />
                    ) : (
                      <video 
                        src={newMessageMedia.url} 
                        controls 
                        className="max-h-32 rounded-lg"
                      />
                    )}
                    <p className="text-white/60 text-xs mt-1">{newMessageMedia.name}</p>
                  </div>
                )}
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowCreateMessage(false);
                    setNewMessageRecipient('');
                    setNewMessageContent('');
                    setNewMessageMedia(null);
                    setShowNewMessageEmojiPicker(false);
                    setShowNewMessageGifPicker(false);
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (newMessageRecipient && (newMessageContent.trim() || newMessageMedia)) {
                      // In a real app, this would send the message
                      const recipient = getUserFriends().find(f => f.id === newMessageRecipient);
                      console.log('Sending message to:', recipient?.firstName, 'Content:', newMessageContent, 'Media:', newMessageMedia);
                      
                      // Add to direct messages for demo
                      const newDM = {
                        id: `new-${Date.now()}`,
                        user: {
                          id: recipient?.id || '',
                          username: recipient?.username || '',
                          firstName: recipient?.firstName || '',
                          lastName: recipient?.lastName || '',
                          avatar: recipient?.avatar || '',
                        },
                        lastMessage: newMessageContent || (newMessageMedia ? `[${newMessageMedia.type === 'image' ? 'Photo' : 'Video'}]` : ''),
                        timestamp: new Date(),
                        unread: false,
                        type: 'direct',
                        media: newMessageMedia,
                      };
                      
                      setDirectMessages(prev => [newDM, ...prev]);
                      
                      setShowCreateMessage(false);
                      setNewMessageRecipient('');
                      setNewMessageContent('');
                      setNewMessageMedia(null);
                      setShowNewMessageEmojiPicker(false);
                      setShowNewMessageGifPicker(false);
                    }
                  }}
                  disabled={!newMessageRecipient || (!newMessageContent.trim() && !newMessageMedia)}
                  className="btn-primary flex-1 disabled:opacity-50"
                >
                  Send Message
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create Group Modal */}
        {showCreateGroup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="card max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-white mb-6" style={getTextStyle()}>
              🆕 Create New Group
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Group Name</label>
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="Enter group name"
                  className="w-full input-field"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Select Members</label>
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {getUserFriends().map((friend) => (
                    <label key={friend.id} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedGroupMembers.includes(friend.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedGroupMembers(prev => [...prev, friend.id]);
                          } else {
                            setSelectedGroupMembers(prev => prev.filter(id => id !== friend.id));
                          }
                        }}
                        className="rounded"
                      />
                      <img
                        src={friend.avatar}
                        alt={friend.firstName}
                        className="w-8 h-8 rounded-full"
                      />
                      <span className="text-white text-sm">
                        {friend.firstName} {friend.lastName}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateGroup(false);
                  setNewGroupName('');
                  setSelectedGroupMembers([]);
                }}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (newGroupName.trim() && selectedGroupMembers.length > 0) {
                    // In a real app, this would create the group
                    console.log('Creating group:', newGroupName, 'with members:', selectedGroupMembers);
                    setShowCreateGroup(false);
                    setNewGroupName('');
                    setSelectedGroupMembers([]);
                  }
                }}
                disabled={!newGroupName.trim() || selectedGroupMembers.length === 0}
                className="btn-primary flex-1 disabled:opacity-50"
              >
                Create Group
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Video Upload Modal */}
      {showVideoUploadModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="card max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-white mb-6" style={getTextStyle()}>
              🎥 Change Profile Video
            </h3>
            
            <div className="space-y-6">
              {/* Upload Video Section */}
              <div>
                <h4 className="text-lg font-medium text-white mb-3">Upload Your Video</h4>
                <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleVideoUpload(file);
                      }
                    }}
                    className="hidden"
                    id="video-upload"
                  />
                  <label htmlFor="video-upload" className="cursor-pointer">
                    <div className="text-4xl mb-2">📁</div>
                    <div className="text-white text-sm mb-2">Click to upload video</div>
                    <div className="text-white/60 text-xs">MP4, MOV, AVI up to 50MB</div>
                  </label>
                </div>
              </div>

              {/* YouTube Video Section */}
              <div>
                <h4 className="text-lg font-medium text-white mb-3">Or Add YouTube Video</h4>
                <div className="space-y-3">
                  <input
                    type="url"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    placeholder="Paste YouTube URL here..."
                    className="w-full input-field"
                  />
                  <button
                    onClick={handleYoutubeVideo}
                    disabled={!youtubeUrl.trim()}
                    className="btn-primary w-full disabled:opacity-50"
                  >
                    Add YouTube Video
                  </button>
                </div>
              </div>

              {/* Current Video Display */}
              {profileVideo && (
                <div className="bg-white/10 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-2">Current Video:</h4>
                  <div className="text-white/80 text-sm">
                    {profileVideo.type === 'youtube' ? 'YouTube Video' : profileVideo.name}
                  </div>
                  <button
                    onClick={() => setProfileVideo(null)}
                    className="text-red-400 hover:text-red-300 text-sm mt-2"
                  >
                    Remove Video
                  </button>
                </div>
              )}

              <button
                onClick={() => setShowVideoUploadModal(false)}
                className="btn-secondary w-full"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Media Upload Modal for DMs */}
      {showMediaUpload && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="card max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-white mb-4" style={getTextStyle()}>
              📎 Attach Media
            </h3>
            
            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => {
                      // In a real app, this would open file picker for images
                      console.log('Selecting image for new message');
                      
                      // Mock image selection for demo
                      const mockImage = {
                        type: 'image' as const,
                        url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
                        name: 'profile-photo.jpg'
                      };
                      
                      if (showCreateMessage) {
                        setNewMessageMedia(mockImage);
                      } else if (selectedDM) {
                        // Handle existing DM media
                        console.log('Adding image to existing DM');
                      }
                      
                      setShowMediaUpload(false);
                    }}
                    className="p-4 border-2 border-dashed border-white/20 rounded-lg hover:border-purple-400 transition-colors text-center"
                  >
                    <div className="text-4xl mb-2">📸</div>
                    <div className="text-white text-sm">Photo</div>
                  </button>
                  
                  <button
                    onClick={() => {
                      // In a real app, this would open file picker for videos
                      console.log('Selecting video for new message');
                      
                      // Mock video selection for demo
                      const mockVideo = {
                        type: 'video' as const,
                        url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
                        name: 'sample-video.mp4'
                      };
                      
                      if (showCreateMessage) {
                        setNewMessageMedia(mockVideo);
                      } else if (selectedDM) {
                        // Handle existing DM media
                        console.log('Adding video to existing DM');
                      }
                      
                      setShowMediaUpload(false);
                    }}
                    className="p-4 border-2 border-dashed border-white/20 rounded-lg hover:border-purple-400 transition-colors text-center"
                  >
                    <div className="text-4xl mb-2">🎥</div>
                    <div className="text-white text-sm">Video</div>
                  </button>
                </div>
              
              <button
                onClick={() => setShowMediaUpload(false)}
                className="btn-secondary w-full"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
