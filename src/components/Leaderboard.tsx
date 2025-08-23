import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface LeaderboardUser {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  avatar: string;
  posts: number;
  likes: number;
  comments: number;
  totalScore: number;
  rank: number;
  isCurrentUser: boolean;
  badge?: '🥇' | '🥈' | '🥉' | '⭐';
  role: 'user' | 'admin' | 'owner' | 'celebrity';
}

interface WeeklyWinner {
  position: 1 | 2 | 3;
  user: LeaderboardUser;
  prize: string;
  description: string;
}

const Leaderboard: React.FC = () => {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [weeklyWinners, setWeeklyWinners] = useState<WeeklyWinner[]>([]);
  const [timeFrame, setTimeFrame] = useState<'week' | 'month' | 'allTime'>('week');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
    loadWeeklyWinners();
  }, [timeFrame]);

  const loadLeaderboard = async () => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock leaderboard data
    const mockLeaderboard: LeaderboardUser[] = [
      {
        id: '1',
        username: 'sarah_j',
        firstName: 'Sarah',
        lastName: 'Johnson',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
        posts: 47,
        likes: 892,
        comments: 156,
        totalScore: 1095,
        rank: 1,
        badge: '🥇',
        isCurrentUser: user?.id === '1',
        role: 'celebrity',
      },
      {
        id: '2',
        username: 'mike_chen',
        firstName: 'Mike',
        lastName: 'Chen',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike',
        posts: 38,
        likes: 745,
        comments: 123,
        totalScore: 906,
        rank: 2,
        badge: '🥈',
        isCurrentUser: user?.id === '2',
        role: 'admin',
      },
      {
        id: '3',
        username: 'emma_w',
        firstName: 'Emma',
        lastName: 'Wilson',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emma',
        posts: 32,
        likes: 678,
        comments: 98,
        totalScore: 808,
        rank: 3,
        badge: '🥉',
        isCurrentUser: user?.id === '3',
        role: 'user',
      },
      {
        id: '4',
        username: 'david_r',
        firstName: 'David',
        lastName: 'Rodriguez',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=david',
        posts: 28,
        likes: 567,
        comments: 87,
        totalScore: 682,
        rank: 4,
        badge: '⭐',
        isCurrentUser: user?.id === '4',
        role: 'user',
      },
      {
        id: '5',
        username: 'alex_t',
        firstName: 'Alex',
        lastName: 'Thompson',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
        posts: 25,
        likes: 489,
        comments: 76,
        totalScore: 590,
        rank: 5,
        badge: undefined,
        isCurrentUser: user?.id === '5',
        role: 'user',
      },
      {
        id: '6',
        username: 'lisa_k',
        firstName: 'Lisa',
        lastName: 'Kim',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lisa',
        posts: 22,
        likes: 432,
        comments: 65,
        totalScore: 519,
        rank: 6,
        badge: undefined,
        isCurrentUser: user?.id === '6',
        role: 'user',
      },
      {
        id: '7',
        username: 'james_b',
        firstName: 'James',
        lastName: 'Brown',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=james',
        posts: 19,
        likes: 398,
        comments: 54,
        totalScore: 471,
        rank: 7,
        badge: undefined,
        isCurrentUser: user?.id === '7',
        role: 'user',
      },
      {
        id: '8',
        username: 'sophia_l',
        firstName: 'Sophia',
        lastName: 'Lee',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sophia',
        posts: 16,
        likes: 345,
        comments: 43,
        totalScore: 404,
        rank: 8,
        badge: undefined,
        isCurrentUser: user?.id === '8',
        role: 'user',
      },
      {
        id: '9',
        username: 'ryan_m',
        firstName: 'Ryan',
        lastName: 'Miller',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ryan',
        posts: 14,
        likes: 298,
        comments: 38,
        totalScore: 350,
        rank: 9,
        badge: undefined,
        isCurrentUser: user?.id === '9',
        role: 'user',
      },
      {
        id: '10',
        username: 'olivia_d',
        firstName: 'Olivia',
        lastName: 'Davis',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=olivia',
        posts: 12,
        likes: 267,
        comments: 32,
        totalScore: 311,
        rank: 10,
        badge: undefined,
        isCurrentUser: user?.id === '10',
        role: 'user',
      },
    ];

    setLeaderboard(mockLeaderboard);
    setIsLoading(false);
  };

  const loadWeeklyWinners = async () => {
    // Mock weekly winners data
    const mockWinners: WeeklyWinner[] = [
      {
        position: 1,
        user: {
          id: '1',
          username: 'sarah_j',
          firstName: 'Sarah',
          lastName: 'Johnson',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
          posts: 47,
          likes: 892,
          comments: 156,
          totalScore: 1095,
          rank: 1,
          badge: '🥇',
          isCurrentUser: false,
          role: 'celebrity',
        },
        prize: '🏆 Champion Badge + 1000 Star Points',
        description: 'Most active user this week with amazing content!',
      },
      {
        position: 2,
        user: {
          id: '2',
          username: 'mike_chen',
          firstName: 'Mike',
          lastName: 'Chen',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike',
          posts: 38,
          likes: 745,
          comments: 123,
          totalScore: 906,
          rank: 2,
          badge: '🥈',
          isCurrentUser: false,
          role: 'admin',
        },
        prize: '🥈 Silver Badge + 500 Star Points',
        description: 'Second place with consistent high-quality posts!',
      },
      {
        position: 3,
        user: {
          id: '3',
          username: 'emma_w',
          firstName: 'Emma',
          lastName: 'Wilson',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emma',
          posts: 32,
          likes: 678,
          comments: 98,
          totalScore: 808,
          rank: 3,
          badge: '🥉',
          isCurrentUser: false,
          role: 'user',
        },
        prize: '🥉 Bronze Badge + 250 Star Points',
        description: 'Third place with engaging community interaction!',
      },
    ];

    setWeeklyWinners(mockWinners);
  };

  const getTimeFrameLabel = () => {
    switch (timeFrame) {
      case 'week':
        return 'This Week';
      case 'month':
        return 'This Month';
      case 'allTime':
        return 'All Time';
      default:
        return 'This Week';
    }
  };

  const getScoreColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-400';
    if (rank === 2) return 'text-gray-300';
    if (rank === 3) return 'text-amber-600';
    return 'text-white/60';
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'owner':
        return <span className="text-yellow-400 text-lg" title="App Owner">👑</span>;
      case 'admin':
        return <span className="text-blue-400 text-lg" title="Administrator">⭐</span>;
      case 'celebrity':
        return <span className="text-purple-400 text-lg" title="Celebrity">⭐</span>;
      default:
        return null;
    }
  };

  const getRankDisplay = (rank: number) => {
    if (rank === 1) return <span className="text-yellow-400 font-bold">#1</span>;
    if (rank === 2) return <span className="text-gray-300 font-bold">#2</span>;
    if (rank === 3) return <span className="text-amber-600 font-bold">#3</span>;
    return <span className="text-white/60">#{rank}</span>;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            🏆 Leaderboard
          </h1>
          <p className="text-xl text-white/60 max-w-2xl mx-auto">
            Compete with friends and see who's the most active on Star App
          </p>
        </div>

        {/* Weekly Winners Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">
            🎉 This Week's Winners
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {weeklyWinners.map((winner) => (
              <div
                key={winner.position}
                className={`card text-center transform hover:scale-105 transition-transform duration-300 ${
                  winner.position === 1 ? 'ring-2 ring-yellow-400' : ''
                }`}
              >
                <div className="text-6xl mb-4">{winner.user.badge}</div>
                <div className="w-24 h-24 mx-auto mb-4">
                  <img
                    src={winner.user.avatar}
                    alt={winner.user.firstName}
                    className="w-full h-full rounded-full border-4 border-white/20"
                  />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {winner.user.firstName} {winner.user.lastName}
                </h3>
                <p className="text-white/60 mb-3">@{winner.user.username}</p>
                <div className="bg-white/10 rounded-lg p-3 mb-4">
                  <p className="text-purple-400 font-semibold mb-1">{winner.prize}</p>
                  <p className="text-white/80 text-sm">{winner.description}</p>
                </div>
                <div className="flex justify-center space-x-4 text-sm">
                  <div>
                    <div className="text-white font-semibold">{winner.user.posts}</div>
                    <div className="text-white/60">Posts</div>
                  </div>
                  <div>
                    <div className="text-white font-semibold">{winner.user.likes}</div>
                    <div className="text-white/60">Likes</div>
                  </div>
                  <div>
                    <div className="text-white font-semibold">{winner.user.comments}</div>
                    <div className="text-white/60">Comments</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Leaderboard Section */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">
              Top 10 Users - {getTimeFrameLabel()}
            </h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setTimeFrame('week')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  timeFrame === 'week'
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/10 text-white/60 hover:bg-white/20'
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setTimeFrame('month')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  timeFrame === 'month'
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/10 text-white/60 hover:bg-white/20'
                }`}
              >
                Month
              </button>
              <button
                onClick={() => setTimeFrame('allTime')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  timeFrame === 'allTime'
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/10 text-white/60 hover:bg-white/20'
                }`}
              >
                All Time
              </button>
            </div>
          </div>

          {/* Leaderboard Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left py-3 px-4 text-white/60 font-medium">Rank</th>
                  <th className="text-left py-3 px-4 text-white/60 font-medium">User</th>
                  <th className="text-center py-3 px-4 text-white/60 font-medium">Posts</th>
                  <th className="text-center py-3 px-4 text-white/60 font-medium">Likes</th>
                  <th className="text-center py-3 px-4 text-white/60 font-medium">Comments</th>
                  <th className="text-center py-3 px-4 text-white/60 font-medium">Total Score</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((user) => (
                  <tr
                    key={user.id}
                    className={`border-b border-white/10 hover:bg-white/5 transition-colors ${
                      user.isCurrentUser ? 'bg-purple-500/20' : ''
                    }`}
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <span className={`text-2xl ${getScoreColor(user.rank)}`}>
                          {user.badge || '⭐'}
                        </span>
                        {getRankDisplay(user.rank)}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={user.avatar}
                          alt={user.firstName}
                          className="w-10 h-10 rounded-full"
                        />
                        <div>
                          <div className="text-white font-medium flex items-center space-x-2">
                            <span>{user.firstName} {user.lastName}</span>
                            {getRoleBadge(user.role)}
                            {user.isCurrentUser && (
                              <span className="text-purple-400 text-sm">(You)</span>
                            )}
                          </div>
                          <div className="text-white/60 text-sm">@{user.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="text-white font-semibold">{user.posts}</span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="text-white font-semibold">{user.likes}</span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="text-white font-semibold">{user.comments}</span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="text-white font-bold text-lg">{user.totalScore}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* How It Works */}
        <div className="mt-12">
          <div className="card">
            <h3 className="text-xl font-semibold text-white mb-6">📊 How the Ranking System Works</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl mb-3">📝</div>
                <h4 className="font-semibold text-white mb-2">Posts</h4>
                <p className="text-white/70 text-sm">
                  Each post you create adds points to your score
                </p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-3">❤️</div>
                <h4 className="font-semibold text-white mb-2">Likes</h4>
                <p className="text-white/70 text-sm">
                  Getting likes on your posts increases your ranking
                </p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-3">💬</div>
                <h4 className="font-semibold text-white mb-2">Comments</h4>
                <p className="text-white/70 text-sm">
                  Engaging with others through comments boosts your score
                </p>
              </div>
            </div>
            <div className="mt-6 p-4 bg-purple-500/20 border border-purple-500/50 rounded-lg">
              <p className="text-white/80 text-center">
                <strong>🏆 Weekly Reset:</strong> Leaderboards reset every Sunday at midnight. 
                Top 3 users get special badges and Star Points!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
