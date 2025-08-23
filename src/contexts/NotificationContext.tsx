import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

export interface Notification {
  id: string;
  type: 'mention' | 'reaction' | 'comment' | 'like' | 'follow';
  title: string;
  message: string;
  userId: string;
  username: string;
  userAvatar: string;
  postId?: string;
  commentId?: string;
  mediaId?: string;
  timestamp: Date;
  isRead: boolean;
  actionUrl?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (notificationId: string) => void;
  clearAllNotifications: () => void;
  checkForMentions: (content: string, postId: string) => void;
  addReactionNotification: (userId: string, username: string, userAvatar: string, postId: string, reactionType: string) => void;
  addCommentNotification: (userId: string, username: string, userAvatar: string, postId: string, commentId: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Calculate unread count
  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Add a new notification
  const addNotification = (notificationData: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => {
    const newNotification: Notification = {
      ...notificationData,
      id: Date.now().toString(),
      timestamp: new Date(),
      isRead: false,
    };

    setNotifications(prev => [newNotification, ...prev]);
  };

  // Mark notification as read
  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };

  // Delete a notification
  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  // Clear all notifications
  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Check for mentions in content
  const checkForMentions = (content: string, postId: string) => {
    if (!user) return;

    // Simple mention detection - looks for @username pattern
    const mentionRegex = /@(\w+)/g;
    const mentions = content.match(mentionRegex);

    if (mentions) {
      mentions.forEach(mention => {
        const username = mention.substring(1); // Remove @ symbol
        
        // Don't notify if user mentions themselves
        if (username === user.username) return;

                 addNotification({
           type: 'mention',
           title: 'You were mentioned!',
           message: `${username} mentioned you in a post`,
           userId: user.id || '1',
           username,
           userAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
           postId,
           actionUrl: `/profile?post=${postId}`,
         });
      });
    }
  };

  // Add reaction notification
  const addReactionNotification = (userId: string, username: string, userAvatar: string, postId: string, reactionType: string) => {
    if (!user || userId === user.id) return; // Don't notify for own reactions

         addNotification({
       type: 'reaction',
       title: 'New reaction!',
       message: `${username} reacted with ${reactionType} to your post`,
       userId,
       username,
       userAvatar,
       postId,
       actionUrl: `/profile?post=${postId}`,
     });
  };

  // Add comment notification
  const addCommentNotification = (userId: string, username: string, userAvatar: string, postId: string, commentId: string) => {
    if (!user || userId === user.id) return; // Don't notify for own comments

         addNotification({
       type: 'comment',
       title: 'New comment!',
       message: `${username} commented on your post`,
       userId,
       username,
       userAvatar,
       postId,
       commentId,
       actionUrl: `/profile?post=${postId}&comment=${commentId}`,
     });
  };

  // Load mock notifications on mount
  useEffect(() => {
    if (user) {
      const mockNotifications: Notification[] = [
        {
          id: '1',
          type: 'mention',
          title: 'You were mentioned!',
          message: 'sarah_j mentioned you in a post',
          userId: '2',
          username: 'sarah_j',
          userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
          postId: 'mock-1',
          timestamp: new Date(Date.now() - 1000 * 60 * 5),
          isRead: false,
          actionUrl: '/profile?post=mock-1',
        },
        {
          id: '2',
          type: 'reaction',
          title: 'New reaction!',
          message: 'mike_chen reacted with ❤️ to your post',
          userId: '3',
          username: 'mike_chen',
          userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike',
          postId: 'mock-2',
          timestamp: new Date(Date.now() - 1000 * 60 * 15),
          isRead: false,
          actionUrl: '/profile?post=mock-2',
        },
        {
          id: '3',
          type: 'comment',
          title: 'New comment!',
          message: 'emma_w commented on your photo',
          userId: '4',
          username: 'emma_w',
          userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emma',
          postId: 'mock-1',
          commentId: 'comment-1',
          timestamp: new Date(Date.now() - 1000 * 60 * 30),
          isRead: true,
          actionUrl: '/profile?post=mock-1&comment=comment-1',
        },
      ];

      setNotifications(mockNotifications);
    }
  }, [user]);

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    checkForMentions,
    addReactionNotification,
    addCommentNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
