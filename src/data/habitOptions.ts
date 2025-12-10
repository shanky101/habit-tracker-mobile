import { Heart, Dumbbell, Briefcase, Brain, BookOpen, Users, Wallet, Palette, Star } from 'lucide-react-native';

export const CATEGORIES = [
    { id: 'health', label: 'Health', icon: Heart, gradient: ['#FF6B6B', '#EE5A6F'] },
    { id: 'fitness', label: 'Fitness', icon: Dumbbell, gradient: ['#4ECDC4', '#44A08D'] },
    { id: 'productivity', label: 'Work', icon: Briefcase, gradient: ['#A8E6CF', '#3DDC97'] },
    { id: 'mindfulness', label: 'Mind', icon: Brain, gradient: ['#B4A7D6', '#8E7CC3'] },
    { id: 'learning', label: 'Learn', icon: BookOpen, gradient: ['#FFD93D', '#F6C23E'] },
    { id: 'social', label: 'Social', icon: Users, gradient: ['#95E1D3', '#38E4AE'] },
    { id: 'finance', label: 'Finance', icon: Wallet, gradient: ['#F38181', '#AA4465'] },
    { id: 'creativity', label: 'Create', icon: Palette, gradient: ['#FDA7DF', '#B565D8'] },
    { id: 'other', label: 'Other', icon: Star, gradient: ['#FEC8D8', '#957DAD'] },
];

export const COLORS = [
    { id: 'neon-yellow', value: '#FFFF00', name: 'Neon Yellow' },
    { id: 'electric-blue', value: '#0066FF', name: 'Electric Blue' },
    { id: 'hot-pink', value: '#FF00FF', name: 'Hot Pink' },
    { id: 'cyan', value: '#00FFFF', name: 'Cyan' },
    { id: 'bright-green', value: '#39FF14', name: 'Neon Green' },
    { id: 'orange', value: '#FF5500', name: 'Bright Orange' },
    { id: 'purple', value: '#AA00FF', name: 'Deep Purple' },
    { id: 'crimson', value: '#FF0055', name: 'Crimson' },
    { id: 'teal', value: '#00E5FF', name: 'Bright Teal' },
    { id: 'white', value: '#FFFFFF', name: 'White' },
    { id: 'gold', value: '#FFD700', name: 'Gold' },
    { id: 'coral', value: '#FF7F50', name: 'Coral' },
];
