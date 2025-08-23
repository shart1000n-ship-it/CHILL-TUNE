import React, { useState, useContext, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useProfile } from '../contexts/ProfileContext';
import EmojiPicker from './EmojiPicker';
import GifPicker from './GifPicker';

interface Post {
  id: string;
  content: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    avatar: string;
    username: string;
  };
  timestamp: string;
  likes: number;
  comments: Comment[];
  media?: {
    type: 'image' | 'video';
    url: string;
  };
}

interface Comment {
  id: string;
  content: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    avatar: string;
    username: string;
  };
  timestamp: string;
  replies: Reply[];
}

interface Reply {
  id: string;
  content: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    avatar: string;
    username: string;
  };
  timestamp: string;
}

interface TrendingTopic {
  id: string;
  title: string;
  category: string;
  engagement: string;
  trending: boolean;
}

const Feed: React.FC = () => {
  const { user } = useAuth();
  const { profileSettings } = useProfile();
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [showComments, setShowComments] = useState<{ [key: string]: boolean }>({});
  const [commentText, setCommentText] = useState<{ [key: string]: string }>({});
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});
  const [showReplyInput, setShowReplyInput] = useState<{ [key: string]: boolean }>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Trending topics data
  const trendingTopics: TrendingTopic[] = [
    {
      id: '1',
      title: 'AI Technology Breakthroughs',
      category: 'Technology',
      engagement: '2.5M posts',
      trending: true
    },
    {
      id: '2',
      title: 'Climate Change Solutions',
      category: 'Environment',
      engagement: '1.8M posts',
      trending: true
    },
    {
      id: '3',
      title: 'Space Exploration Updates',
      category: 'Science',
      engagement: '1.2M posts',
      trending: false
    },
    {
      id: '4',
      title: 'Global Health Initiatives',
      category: 'Health',
      engagement: '950K posts',
      trending: true
    },
    {
      id: '5',
      title: 'Sustainable Living Tips',
      category: 'Lifestyle',
      engagement: '750K posts',
      trending: false
    },
    {
      id: '6',
      title: 'Digital Art Revolution',
      category: 'Art',
      engagement: '680K posts',
      trending: true
    },
    {
      id: '7',
      title: 'Remote Work Trends',
      category: 'Business',
      engagement: '520K posts',
      trending: false
    },
    {
      id: '8',
      title: 'Mental Health Awareness',
      category: 'Health',
      engagement: '480K posts',
      trending: true
    }
  ];

  // Mock posts data
  const mockPosts: Post[] = [
    {
      id: '1',
      content: 'Just finished an amazing project! 🚀 The team worked incredibly hard and the results are outstanding. #coding #success #teamwork',
      user: {
        id: '1',
        firstName: 'Sarah',
        lastName: 'Johnson',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
        username: 'sarah_dev'
      },
      timestamp: '2024-01-15T10:30:00Z',
      likes: 42,
      comments: [
        {
          id: 'c1',
          content: 'Congratulations! 🎉 This looks amazing!',
          user: {
            id: '2',
            firstName: 'Mike',
            lastName: 'Chen',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
            username: 'mike_chen'
          },
          timestamp: '2024-01-15T11:00:00Z',
          replies: []
        }
      ]
    },
    {
      id: '2',
      content: 'Beautiful sunset at the beach today! 🌅 Perfect way to end the week. Sometimes you just need to pause and appreciate the simple moments in life.',
      user: {
        id: '2',
        firstName: 'Mike',
        lastName: 'Chen',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        username: 'mike_chen'
      },
      timestamp: '2024-01-15T09:15:00Z',
      likes: 28,
      comments: []
    }
  ];

  useEffect(() => {
    setPosts(mockPosts);
  }, []);

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim() && !selectedFile) return;

    const newPostObj: Post = {
      id: Date.now().toString(),
      content: newPost,
      user: {
        id: user?.id || '1',
        firstName: user?.firstName || 'User',
        lastName: user?.lastName || 'Name',
        avatar: user?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        username: user?.username || 'username'
      },
      timestamp: new Date().toISOString(),
      likes: 0,
      comments: [],
      media: selectedFile ? {
        type: selectedFile.type.startsWith('image/') ? 'image' : 'video',
        url: previewUrl || ''
      } : undefined
    };

    setPosts([newPostObj, ...posts]);
    setNewPost('');
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const handleLike = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId ? { ...post, likes: post.likes + 1 } : post
    ));
  };

  const handleComment = (postId: string) => {
    const text = commentText[postId];
    if (!text?.trim()) return;

    const newComment: Comment = {
      id: Date.now().toString(),
      content: text,
      user: {
        id: user?.id || '1',
        firstName: user?.firstName || 'User',
        lastName: user?.lastName || 'Name',
        avatar: user?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        username: user?.username || 'username'
      },
      timestamp: new Date().toISOString(),
      replies: []
    };

    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, comments: [...post.comments, newComment] }
        : post
    ));

    setCommentText({ ...commentText, [postId]: '' });
  };

  const handleReply = (postId: string, commentId: string) => {
    const text = replyText[commentId];
    if (!text?.trim()) return;

    const newReply: Reply = {
      id: Date.now().toString(),
      content: text,
      user: {
        id: user?.id || '1',
        firstName: user?.firstName || 'User',
        lastName: user?.lastName || 'Name',
        avatar: user?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        username: user?.username || 'username'
      },
      timestamp: new Date().toISOString()
    };

    setPosts(posts.map(post => 
      post.id === postId 
        ? {
            ...post,
            comments: post.comments.map(comment =>
              comment.id === commentId
                ? { ...comment, replies: [...comment.replies, newReply] }
                : comment
            )
          }
        : post
    ));

    setReplyText({ ...replyText, [commentId]: '' });
    setShowReplyInput({ ...showReplyInput, [commentId]: false });
  };

  const handleEmojiSelect = (emoji: string) => {
    setNewPost(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleGifSelect = (gifUrl: string) => {
    setNewPost(prev => prev + ` [GIF: ${gifUrl}]`);
    setShowGifPicker(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const toggleComments = (postId: string) => {
    setShowComments(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  return (
    <div className="max-w-7xl mx-auto flex gap-8 p-6">
      {/* Left Sidebar - Trending Topics */}
      <div className="w-80 flex-shrink-0">
        <div className="bg-gray-800 rounded-lg p-6 sticky top-6">
          <h2 className="text-xl font-bold text-white mb-4">🔥 Trending Now</h2>
          <div className="space-y-4">
            {trendingTopics.map((topic) => (
              <div key={topic.id} className="border-b border-gray-700 pb-3 last:border-b-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-white font-medium text-sm leading-tight mb-1">
                      {topic.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span className="bg-gray-700 px-2 py-1 rounded-full">
                        {topic.category}
                      </span>
                      <span>{topic.engagement}</span>
                    </div>
                  </div>
                  {topic.trending && (
                    <div className="text-orange-500 text-lg">🔥</div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors">
            View All Trends
          </button>
        </div>
      </div>

      {/* Main Feed Content */}
      <div className="flex-1 max-w-2xl">
        {/* Create Post */}
        <div className="card mb-6">
          <form onSubmit={handlePostSubmit}>
            <div className="flex items-start space-x-3">
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'}
                alt="Profile"
                className="w-10 h-10 rounded-full"
              />
              <div className="flex-1">
                <textarea
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  placeholder="What's on your mind?"
                  className="w-full bg-transparent text-white placeholder-gray-400 resize-none border-none outline-none"
                  rows={3}
                />
                
                {previewUrl && (
                  <div className="mt-3 relative">
                    {selectedFile?.type.startsWith('image/') ? (
                      <img src={previewUrl} alt="Preview" className="max-w-full h-auto rounded-lg max-h-64" />
                    ) : (
                      <video src={previewUrl} controls className="max-w-full h-auto rounded-lg max-h-64" />
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFile(null);
                        setPreviewUrl(null);
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-700">
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      😊
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowGifPicker(!showGifPicker)}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      🎬
                    </button>
                    <label className="cursor-pointer text-gray-400 hover:text-white transition-colors">
                      📷
                      <input
                        type="file"
                        accept="image/*,video/*"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <button
                    type="submit"
                    disabled={!newPost.trim() && !selectedFile}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    Post
                  </button>
                </div>
              </div>
            </div>
          </form>

          {showEmojiPicker && (
            <div className="mt-3">
              <EmojiPicker isOpen={showEmojiPicker} onClose={() => setShowEmojiPicker(false)} onSelectEmoji={handleEmojiSelect} />
            </div>
          )}
        </div>

        {/* Posts Feed */}
        <div className="space-y-6">
          {posts.map((post) => (
            <div key={post.id} className="card">
              {/* Post Header */}
              <div className="flex items-center space-x-3 mb-4">
                <img
                  src={post.user.avatar}
                  alt={post.user.firstName}
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1">
                  <div className="font-medium text-white">
                    {post.user.firstName} {post.user.lastName}
                  </div>
                  <div className="text-gray-400 text-sm">
                    {formatTimestamp(post.timestamp)}
                  </div>
                </div>
              </div>

              {/* Post Content */}
              <div className="text-white mb-4">
                {post.content}
              </div>

              {/* Post Media */}
              {post.media && (
                <div className="mb-4">
                  {post.media.type === 'image' ? (
                    <img
                      src={post.media.url}
                      alt="Post media"
                      className="max-w-full h-auto rounded-lg"
                    />
                  ) : (
                    <video
                      src={post.media.url}
                      controls
                      className="max-w-full h-auto rounded-lg"
                    />
                  )}
                </div>
              )}

              {/* Post Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                <div className="flex items-center space-x-6">
                  <button
                    onClick={() => handleLike(post.id)}
                    className="flex items-center space-x-2 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <span>❤️</span>
                    <span>{post.likes}</span>
                  </button>
                  <button
                    onClick={() => toggleComments(post.id)}
                    className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
                  >
                    <span>💬</span>
                    <span>{post.comments.length}</span>
                  </button>
                </div>
              </div>

              {/* Comments Section */}
              {showComments[post.id] && (
                <div className="mt-4 pt-4 border-t border-gray-700">
                  {/* Add Comment */}
                  <div className="flex items-center space-x-3 mb-4">
                    <img
                      src={user?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'}
                      alt="Profile"
                      className="w-8 h-8 rounded-full"
                    />
                    <div className="flex-1 flex space-x-2">
                      <input
                        type="text"
                        value={commentText[post.id] || ''}
                        onChange={(e) => setCommentText({ ...commentText, [post.id]: e.target.value })}
                        placeholder="Write a comment..."
                        className="flex-1 bg-gray-700 text-white placeholder-gray-400 px-3 py-2 rounded-lg border-none outline-none"
                      />
                      <button
                        onClick={() => handleComment(post.id)}
                        disabled={!commentText[post.id]?.trim()}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm transition-colors"
                      >
                        Comment
                      </button>
                    </div>
                  </div>

                  {/* Comments List */}
                  <div className="space-y-3">
                    {post.comments.map((comment) => (
                      <div key={comment.id} className="bg-gray-700 rounded-lg p-3">
                        <div className="flex items-start space-x-3">
                          <img
                            src={comment.user.avatar}
                            alt={comment.user.firstName}
                            className="w-8 h-8 rounded-full"
                          />
                          <div className="flex-1">
                            <div className="font-medium text-white text-sm">
                              {comment.user.firstName} {comment.user.lastName}
                            </div>
                            <div className="text-white text-sm mt-1">
                              {comment.content}
                            </div>
                            <div className="flex items-center space-x-4 mt-2">
                              <span className="text-gray-400 text-xs">
                                {formatTimestamp(comment.timestamp)}
                              </span>
                              <button
                                onClick={() => setShowReplyInput({ ...showReplyInput, [comment.id]: !showReplyInput[comment.id] })}
                                className="text-gray-400 hover:text-white text-xs transition-colors"
                              >
                                Reply
                              </button>
                            </div>

                            {/* Reply Input */}
                            {showReplyInput[comment.id] && (
                              <div className="mt-3 flex items-center space-x-2">
                                <input
                                  type="text"
                                  value={replyText[comment.id] || ''}
                                  onChange={(e) => setReplyText({ ...replyText, [comment.id]: e.target.value })}
                                  placeholder="Write a reply..."
                                  className="flex-1 bg-gray-600 text-white placeholder-gray-400 px-3 py-2 rounded-lg border-none outline-none text-sm"
                                />
                                <button
                                  onClick={() => handleReply(post.id, comment.id)}
                                  disabled={!replyText[comment.id]?.trim()}
                                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-3 py-2 rounded-lg text-sm transition-colors"
                                >
                                  Reply
                                </button>
                              </div>
                            )}

                            {/* Replies */}
                            {comment.replies.length > 0 && (
                              <div className="mt-3 space-y-2">
                                {comment.replies.map((reply) => (
                                  <div key={reply.id} className="bg-gray-600 rounded-lg p-2 ml-6">
                                    <div className="flex items-start space-x-2">
                                      <img
                                        src={reply.user.avatar}
                                        alt={reply.user.firstName}
                                        className="w-6 h-6 rounded-full"
                                      />
                                      <div className="flex-1">
                                        <div className="font-medium text-white text-xs">
                                          {reply.user.firstName} {reply.user.lastName}
                                        </div>
                                        <div className="text-white text-xs mt-1">
                                          {reply.content}
                                        </div>
                                        <div className="text-gray-400 text-xs mt-1">
                                          {formatTimestamp(reply.timestamp)}
                                        </div>
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
      </div>

      {/* GIF Picker Modal */}
      <GifPicker
        isOpen={showGifPicker}
        onClose={() => setShowGifPicker(false)}
        onSelectGif={(gif) => handleGifSelect(gif.url)}
      />
    </div>
  );
};

export default Feed;
