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
    { id: 'blue', value: '#3B82F6', name: 'Blue' }, // Default first
    { id: 'indigo', value: '#6366F1', name: 'Indigo' },
    { id: 'purple', value: '#A855F7', name: 'Purple' },
    { id: 'pink', value: '#EC4899', name: 'Pink' },
    { id: 'rose', value: '#F43F5E', name: 'Rose' },
    { id: 'red', value: '#EF4444', name: 'Red' },
    { id: 'orange', value: '#F97316', name: 'Orange' },
    { id: 'amber', value: '#F59E0B', name: 'Amber' },
    { id: 'yellow', value: '#EAB308', name: 'Yellow' },
    { id: 'lime', value: '#84CC16', name: 'Lime' },
    { id: 'green', value: '#22C55E', name: 'Green' },
    { id: 'emerald', value: '#10B981', name: 'Emerald' },
    { id: 'teal', value: '#14B8A6', name: 'Teal' },
    { id: 'cyan', value: '#06B6D4', name: 'Cyan' },
    { id: 'sky', value: '#0EA5E9', name: 'Sky' },
    { id: 'slate', value: '#64748B', name: 'Slate' },
    { id: 'gray', value: '#71717A', name: 'Gray' },
    { id: 'zinc', value: '#71717A', name: 'Zinc' },
];
