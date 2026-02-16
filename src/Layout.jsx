import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { getTheme } from "@/components/shared/themeColors";
import { 
  LayoutDashboard, 
  Target, 
  CheckSquare, 
  TrendingUp, 
  Sparkles, 
  Trophy,
  Calendar,
  User,
  Smile,
  Heart,
  Star,
  Zap,
  Rocket,
  Crown,
  ClipboardList
} from 'lucide-react';

const avatarIcons = {
  user: User,
  smile: Smile,
  heart: Heart,
  star: Star,
  zap: Zap,
  trophy: Trophy,
  target: Target,
  rocket: Rocket,
  crown: Crown,
  sparkles: Sparkles
};

const backgrounds = {
  gradient: 'bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50',
  'solid-light': 'bg-gray-50',
  'solid-dark': 'bg-gray-900 text-white',
  pattern: 'bg-gray-50 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-[size:16px_16px]',
  matrix: 'bg-black text-green-400',
  starfield: 'bg-gradient-to-b from-indigo-950 via-purple-900 to-black text-white',
  abstract: 'bg-gradient-to-br from-rose-100 via-purple-100 to-indigo-200',
  minimal: 'bg-white'
};

export default function Layout({ children, currentPageName }) {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    retry: false
  });

  const { data: achievements = [] } = useQuery({
    queryKey: ['achievements'],
    queryFn: () => base44.entities.Achievement.list(),
    retry: false
  });

  const theme = getTheme(user?.theme_primary || 'purple');
  const bgClass = backgrounds[user?.theme_background || 'gradient'];
  const AvatarIcon = avatarIcons[user?.avatar || 'user'];
  
  const currentLevel = Math.floor(Math.sqrt((user?.total_xp || 0) / 100));
  
  const getLevelRank = (level) => {
    if (level === 0) return 'Beginner';
    if (level < 5) return 'Novice';
    if (level < 10) return 'Apprentice';
    if (level < 20) return 'Expert';
    if (level < 50) return 'Master';
    return 'Legend';
  };
  
  const levelRank = getLevelRank(currentLevel);
  
  const getHighestBadge = () => {
    if (!achievements.length) return null;
    const order = ['diamond', 'platinum', 'gold', 'silver', 'bronze'];
    for (const badge of order) {
      if (achievements.some(a => a.badge === badge)) return badge;
    }
    return null;
  };
  
  const highestBadge = getHighestBadge();
  const badgeColors = {
    bronze: '🥉',
    silver: '🥈',
    gold: '🥇',
    platinum: '💎',
    diamond: '👑'
  };

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: 'Dashboard', tooltip: 'Overview & Stats' },
    { name: 'Today', icon: ClipboardList, path: 'Today', tooltip: "Today's Tasks" },
    { name: 'Routines', icon: Calendar, path: 'Routines', tooltip: 'Daily Habits' },
    { name: 'Tasks', icon: CheckSquare, path: 'Tasks', tooltip: 'Quick Checklist' },
    { name: 'Goals', icon: Target, path: 'Goals', tooltip: 'Set & Track Goals' },
    { name: 'Challenges', icon: Trophy, path: 'Challenges', tooltip: 'Active Challenges', highlight: true },
    { name: 'Leaderboard', icon: Crown, path: 'Leaderboard', tooltip: 'Weekly Rankings' },
    { name: 'Progress', icon: TrendingUp, path: 'Progress', tooltip: 'View Analytics' },
    { name: 'AI Coach', icon: Sparkles, path: 'AICoach', tooltip: 'Get AI Guidance' },
    { name: 'Achievements', icon: Trophy, path: 'Achievements', tooltip: 'Earn Trophies' },
    { name: 'Profile', icon: User, path: 'Profile', tooltip: 'Settings' }
  ];

  return (
    <div className={`min-h-screen ${bgClass}`}>
      {/* Top Navigation */}
      <nav className={`${user?.theme_background === 'solid-dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-b'} sticky top-0 z-50 shadow-sm`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 bg-gradient-to-br ${theme.from} ${theme.to} rounded-lg flex items-center justify-center`}>
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <h1 className={`text-2xl font-bold bg-gradient-to-r ${theme.from} ${theme.to} bg-clip-text text-transparent`}>
                Routine Quest
              </h1>
            </div>
            <div className="flex items-center gap-2">
              {user?.full_name && (
                <>
                  <div className="hidden md:flex flex-col items-end">
                    <span className="text-sm font-bold text-gray-900">
                      {user.full_name}
                    </span>
                    <span className="text-xs text-gray-500">
                      Lv {currentLevel} • {levelRank}
                    </span>
                  </div>
                  {highestBadge && (
                    <span className="hidden md:block text-base" title={`${highestBadge} badge`}>
                      {badgeColors[highestBadge]}
                    </span>
                  )}
                </>
              )}
              {user?.avatar_url ? (
                <Link to="/Profile" className="relative">
                  <img 
                    src={user.avatar_url} 
                    alt="Profile" 
                    className={`w-10 h-10 rounded-full object-cover border-2 ${theme.bg.replace('bg-', 'border-')} hover:opacity-80 transition-all`}
                  />
                  {highestBadge && (
                    <span className="absolute -bottom-1 -right-1 text-sm">
                      {badgeColors[highestBadge]}
                    </span>
                  )}
                </Link>
              ) : AvatarIcon && (
                <Link to="/Profile" className={`relative w-10 h-10 ${theme.bg} rounded-full flex items-center justify-center hover:opacity-80 transition-opacity border-2 ${theme.bg.replace('bg-', 'border-')}`}>
                  <AvatarIcon className="w-6 h-6 text-white" />
                  {highestBadge && (
                    <span className="absolute -bottom-1 -right-1 text-sm">
                      {badgeColors[highestBadge]}
                    </span>
                  )}
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`hidden md:block w-64 ${user?.theme_background === 'solid-dark' ? 'bg-gray-800 border-gray-700' : 'bg-white'} border-r min-h-[calc(100vh-64px)] sticky top-16`}>
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPageName === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={`/${item.path}`}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all relative ${
                    isActive
                      ? `bg-gradient-to-r ${theme.from} ${theme.to} text-white shadow-md`
                      : user?.theme_background === 'solid-dark'
                      ? 'text-gray-300 hover:bg-gray-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  title={item.tooltip}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                  {item.highlight && !isActive && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                  )}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className={`md:hidden fixed bottom-0 left-0 right-0 ${user?.theme_background === 'solid-dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-t'} shadow-lg z-50`}>
        <div className="flex justify-around items-center h-16">
          {navItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const isActive = currentPageName === item.path;
            
            return (
              <Link
                key={item.path}
                to={`/${item.path}`}
                className={`flex flex-col items-center justify-center flex-1 h-full ${
                  isActive ? `${theme.bg.replace('bg-', 'text-')}` : user?.theme_background === 'solid-dark' ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                <Icon className="w-5 h-5 mb-1" />
                <span className="text-xs">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Add padding for mobile bottom nav */}
      <div className="md:hidden h-16" />
    </div>
  );
}