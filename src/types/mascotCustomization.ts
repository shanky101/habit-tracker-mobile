// Mascot customization types

export interface HabiCustomization {
  id: string; // For SQLite primary key
  name: string;

  // Face & Expression
  eyes: 'normal' | 'happy' | 'sleepy' | 'determined' | 'cute' | 'mischievous';
  eyebrows: 'none' | 'normal' | 'raised' | 'furrowed' | 'wavy';
  mouth: 'smile' | 'grin' | 'neutral' | 'determined' | 'sleepy' | 'silly';
  blushEnabled: boolean;
  blushColor: string;

  // Head Accessories
  hairStyle: 'none' | 'spiky' | 'curly' | 'long' | 'bob' | 'ponytail' | 'mohawk' | 'wizard';
  hairColor: string;
  hat: 'none' | 'cap' | 'beanie' | 'crown' | 'wizard' | 'bow' | 'headband' | 'tophat' | 'santa' | 'party';
  glasses: 'none' | 'round' | 'square' | 'sunglasses' | 'reading' | 'monocle' | 'scifi' | 'heart';

  // Body & Color
  bodyColor: string;
  pattern: 'solid' | 'spots' | 'stripes' | 'gradient' | 'sparkles' | 'none';
  patternColor?: string;

  // Accessories
  necklace: 'none' | 'bowtie' | 'bandana' | 'necklace' | 'scarf' | 'medal';
  specialEffect: 'none' | 'sparkles' | 'stars' | 'hearts' | 'glow';

  // Metadata
  createdAt: string;
  updatedAt: string;
}

// Default customization
export const DEFAULT_CUSTOMIZATION: HabiCustomization = {
  id: 'default',
  name: 'Habi',
  eyes: 'happy',
  eyebrows: 'normal',
  mouth: 'smile',
  blushEnabled: true,
  blushColor: '#FFB6C1',
  hairStyle: 'none',
  hairColor: '#8B4513',
  hat: 'none',
  glasses: 'none',
  bodyColor: '#7FD1AE', // Original Habi green
  pattern: 'solid',
  patternColor: undefined,
  necklace: 'none',
  specialEffect: 'none',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};
