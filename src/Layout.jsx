import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
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
  Crown
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

const themeColors = {
  purple: { from: 'from-purple-500', to: 'to-pink-500', bg: 'bg-purple-500' },
  blue: { from: 'from-blue-500', to: 'to-cyan-500', bg: 'bg-blue-500' },
  green: { from: 'from-green-500', to: 'to-emerald-500', bg: 'bg-green-500' },
  orange: { from: 'from-orange-500', to: 'to-red-500', bg: 'bg-orange-500' },
  pink: { from: 'from-pink-500', to: 'to-rose-500', bg: 'bg-pink-500' },
  red: { from: 'from-red-500', to: 'to-pink-500', bg: 'bg-red-500' },
  teal: { from: 'from-teal-500', to: 'to-blue-500', bg: 'bg-teal-500' },
  indigo: { from: 'from-indigo-500', to: 'to-purple-500', bg: 'bg-indigo-500' },
  cyberpunk: { from: 'from-cyan-400', to: 'to-pink-600', bg: 'bg-cyan-500' },
  forest: { from: 'from-green-600', to: 'to-emerald-800', bg: 'bg-green-700' },
  ocean: { from: 'from-blue-900', to: 'to-cyan-600', bg: 'bg-blue-700' },
  sunset: { from: 'from-orange-600', to: 'to-purple-900', bg: 'bg-orange-600' },
  midnight: { from: 'from-indigo-900', to: 'to-purple-950', bg: 'bg-indigo-900' }
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

  const theme = themeColors[user?.theme_primary || 'purple'];
  const bgClass = backgrounds[user?.theme_background || 'gradient'];
  const AvatarIcon = avatarIcons[user?.avatar || 'user'];

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: 'Dashboard' },
    { name: 'Today', icon: CheckSquare, path: 'Today' },
    { name: 'Routines', icon: Calendar, path: 'Routines' },
    { name: 'Goals', icon: Target, path: 'Goals' },
    { name: 'Progress', icon: TrendingUp, path: 'Progress' },
    { name: 'AI Coach', icon: Sparkles, path: 'AICoach' },
    { name: 'Achievements', icon: Trophy, path: 'Achievements' },
    { name: 'Profile', icon: User, path: 'Profile' }
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
            {user?.avatar_url ? (
              <Link to="/Profile" className="relative">
                <img 
                  src={user.avatar_url} 
                  alt="Profile" 
                  className="w-10 h-10 rounded-full object-cover border-2 border-purple-500 hover:border-purple-600 transition-all"
                />
              </Link>
            ) : AvatarIcon && (
              <Link to="/Profile" className={`w-10 h-10 ${theme.bg} rounded-full flex items-center justify-center hover:opacity-80 transition-opacity`}>
                <AvatarIcon className="w-6 h-6 text-white" />
              </Link>
            )}
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
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? `bg-gradient-to-r ${theme.from} ${theme.to} text-white shadow-md`
                      : user?.theme_background === 'solid-dark'
                      ? 'text-gray-300 hover:bg-gray-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
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