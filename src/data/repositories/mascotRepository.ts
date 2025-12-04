import { db } from '../database/client';
import { HabiCustomization, DEFAULT_CUSTOMIZATION } from '@/types/mascotCustomization';
import { MascotRow } from './types';

/**
 * Convert SQLite row to HabiCustomization object (denormalize)
 */
const rowToCustomization = (row: MascotRow): HabiCustomization => ({
  id: row.id,
  name: row.name,
  eyes: row.eyes as HabiCustomization['eyes'],
  eyebrows: row.eyebrows as HabiCustomization['eyebrows'],
  mouth: row.mouth as HabiCustomization['mouth'],
  blushEnabled: row.blush_enabled === 1,
  blushColor: row.blush_color,
  hairStyle: row.hair_style as HabiCustomization['hairStyle'],
  hairColor: row.hair_color,
  hat: row.hat as HabiCustomization['hat'],
  glasses: row.glasses as HabiCustomization['glasses'],
  bodyColor: row.body_color,
  pattern: row.pattern as HabiCustomization['pattern'],
  patternColor: row.pattern_color || undefined,
  necklace: row.necklace as HabiCustomization['necklace'],
  specialEffect: row.special_effect as HabiCustomization['specialEffect'],
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

/**
 * Mascot Repository
 * Handles all database operations for mascot customization
 */
export const mascotRepository = {
  /**
   * Get current mascot customization
   * Returns default if no customization exists
   */
  async getCustomization(): Promise<HabiCustomization> {
    try {
      const row = db.getFirstSync<MascotRow>(
        "SELECT * FROM mascot_customization WHERE id = 'default'"
      );

      if (!row) {
        // No customization exists, insert default
        await this.saveCustomization(DEFAULT_CUSTOMIZATION);
        return DEFAULT_CUSTOMIZATION;
      }

      return rowToCustomization(row);
    } catch (error) {
      console.error('[MascotRepository] getCustomization failed:', error);
      throw error;
    }
  },

  /**
   * Save mascot customization to database
   */
  async saveCustomization(customization: HabiCustomization): Promise<void> {
    try {
      const now = new Date().toISOString();

      db.runSync(
        `INSERT OR REPLACE INTO mascot_customization (
          id, name, eyes, eyebrows, mouth, blush_enabled, blush_color,
          hair_style, hair_color, hat, glasses,
          body_color, pattern, pattern_color,
          necklace, special_effect,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          customization.id || 'default',
          customization.name,
          customization.eyes,
          customization.eyebrows,
          customization.mouth,
          customization.blushEnabled ? 1 : 0,
          customization.blushColor,
          customization.hairStyle,
          customization.hairColor,
          customization.hat,
          customization.glasses,
          customization.bodyColor,
          customization.pattern,
          customization.patternColor || null,
          customization.necklace,
          customization.specialEffect,
          customization.createdAt || now,
          now,
        ]
      );

      console.log('[MascotRepository] Customization saved');
    } catch (error) {
      console.error('[MascotRepository] saveCustomization failed:', error);
      throw error;
    }
  },

  /**
   * Reset customization to default values
   */
  async resetToDefault(): Promise<void> {
    try {
      const defaultWithTimestamp = {
        ...DEFAULT_CUSTOMIZATION,
        updatedAt: new Date().toISOString(),
      };
      await this.saveCustomization(defaultWithTimestamp);
      console.log('[MascotRepository] Reset to default');
    } catch (error) {
      console.error('[MascotRepository] resetToDefault failed:', error);
      throw error;
    }
  },
};
