// Theme color mappings for consistent theming across the app
export const themeColors = {
  purple: { from: 'from-purple-500', to: 'to-pink-500', bg: 'bg-purple-500', from600: 'from-purple-600', to600: 'to-pink-600', border: 'border-purple-500' },
  blue: { from: 'from-blue-500', to: 'to-cyan-500', bg: 'bg-blue-500', from600: 'from-blue-600', to600: 'to-cyan-600', border: 'border-blue-500' },
  green: { from: 'from-green-500', to: 'to-emerald-500', bg: 'bg-green-500', from600: 'from-green-600', to600: 'to-emerald-600', border: 'border-green-500' },
  orange: { from: 'from-orange-500', to: 'to-red-500', bg: 'bg-orange-500', from600: 'from-orange-600', to600: 'to-red-600', border: 'border-orange-500' },
  pink: { from: 'from-pink-500', to: 'to-rose-500', bg: 'bg-pink-500', from600: 'from-pink-600', to600: 'to-rose-600', border: 'border-pink-500' },
  red: { from: 'from-red-500', to: 'to-pink-500', bg: 'bg-red-500', from600: 'from-red-600', to600: 'to-pink-600', border: 'border-red-500' },
  teal: { from: 'from-teal-500', to: 'to-blue-500', bg: 'bg-teal-500', from600: 'from-teal-600', to600: 'to-blue-600', border: 'border-teal-500' },
  indigo: { from: 'from-indigo-500', to: 'to-purple-500', bg: 'bg-indigo-500', from600: 'from-indigo-600', to600: 'to-purple-600', border: 'border-indigo-500' },
  cyberpunk: { from: 'from-cyan-400', to: 'to-pink-600', bg: 'bg-cyan-500', from600: 'from-cyan-600', to600: 'to-pink-700', border: 'border-cyan-500' },
  forest: { from: 'from-green-600', to: 'to-emerald-800', bg: 'bg-green-700', from600: 'from-green-700', to600: 'to-emerald-900', border: 'border-green-700' },
  ocean: { from: 'from-blue-900', to: 'to-cyan-600', bg: 'bg-blue-700', from600: 'from-blue-900', to600: 'to-cyan-700', border: 'border-blue-700' },
  sunset: { from: 'from-orange-600', to: 'to-purple-900', bg: 'bg-orange-600', from600: 'from-orange-700', to600: 'to-purple-900', border: 'border-orange-600' },
  midnight: { from: 'from-indigo-900', to: 'to-purple-950', bg: 'bg-indigo-900', from600: 'from-indigo-900', to600: 'to-purple-950', border: 'border-indigo-900' }
};

export const getTheme = (themePrimary = 'purple') => {
  return themeColors[themePrimary] || themeColors.purple;
};