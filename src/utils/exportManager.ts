import { Paths, File } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import { Habit, DailyCompletion } from '@/hooks/useHabits';

export type ExportFormat = 'csv' | 'json' | 'pdf';

export interface ExportOptions {
  format: ExportFormat;
  habits: Habit[];
  includeArchived?: boolean;
}

export interface ExportResult {
  success: boolean;
  message: string;
  error?: string;
}

/**
 * Export Manager - Handles data export in multiple formats
 *
 * Features:
 * 1. Transforms habit data into exportable format
 * 2. Generates files in CSV, JSON, or PDF format
 * 3. Uses native share sheet for file sharing
 * 4. Handles large datasets efficiently
 */
export class ExportManager {
  /**
   * Main export function - orchestrates the entire export process
   */
  static async exportData(options: ExportOptions): Promise<ExportResult> {
    try {
      // Check if sharing is available on this device
      const isSharingAvailable = await Sharing.isAvailableAsync();
      if (!isSharingAvailable) {
        return {
          success: false,
          message: 'Sharing is not available on this device',
          error: 'SHARING_NOT_AVAILABLE',
        };
      }

      // Step 1: Collect and transform data
      const transformedData = this.transformHabitData(options.habits, options.includeArchived);

      // Step 2: Generate file based on format
      let fileUri: string;
      let fileName: string;
      let mimeType: string;

      switch (options.format) {
        case 'csv':
          fileName = `habit-tracker-export-${this.getDateStamp()}.csv`;
          fileUri = await this.generateCSV(transformedData, fileName);
          mimeType = 'text/csv';
          break;

        case 'json':
          fileName = `habit-tracker-export-${this.getDateStamp()}.json`;
          fileUri = await this.generateJSON(transformedData, fileName);
          mimeType = 'application/json';
          break;

        case 'pdf':
          fileName = `habit-tracker-export-${this.getDateStamp()}.pdf`;
          fileUri = await this.generatePDF(transformedData, fileName);
          mimeType = 'application/pdf';
          break;

        default:
          return {
            success: false,
            message: 'Invalid export format',
            error: 'INVALID_FORMAT',
          };
      }

      // Step 3: Open native share sheet
      await Sharing.shareAsync(fileUri, {
        mimeType,
        dialogTitle: 'Export Habit Data',
        UTI: mimeType,
      });

      // Step 4: Clean up temporary file after a delay
      // Give the system time to copy the file before deleting
      setTimeout(async () => {
        try {
          const file = new File(fileUri);
          await file.delete();
        } catch (error) {
          console.warn('Failed to clean up temp file:', error);
        }
      }, 5000);

      return {
        success: true,
        message: `Successfully exported ${options.habits.length} habits as ${options.format.toUpperCase()}`,
      };
    } catch (error) {
      console.error('Export error:', error);
      return {
        success: false,
        message: 'Failed to export data',
        error: error instanceof Error ? error.message : 'UNKNOWN_ERROR',
      };
    }
  }

  /**
   * Transform habit data into a flat structure suitable for export
   */
  private static transformHabitData(habits: Habit[], includeArchived = false) {
    const filteredHabits = includeArchived ? habits : habits.filter(h => !h.archived);

    return filteredHabits.map(habit => {
      // Calculate statistics
      const completionDates = Object.keys(habit.completions || {});
      const totalCompletions = completionDates.reduce((sum, date) => {
        return sum + (habit.completions[date]?.completionCount || 0);
      }, 0);

      // Get all entries with notes/moods
      const allEntries: Array<{
        date: string;
        mood?: string;
        note?: string;
        timestamp: number;
      }> = [];

      Object.values(habit.completions || {}).forEach(completion => {
        allEntries.push(...completion.entries);
      });

      return {
        id: habit.id,
        name: habit.name,
        emoji: habit.emoji,
        category: habit.category,
        frequency: habit.frequency,
        frequencyType: habit.frequencyType || 'single',
        targetCompletionsPerDay: habit.targetCompletionsPerDay,
        currentStreak: habit.streak,
        totalCompletions,
        daysTracked: completionDates.length,
        reminderEnabled: habit.reminderEnabled,
        reminderTime: habit.reminderTime,
        notes: habit.notes,
        archived: habit.archived || false,
        completions: habit.completions || {},
        entries: allEntries,
      };
    });
  }

  /**
   * Generate CSV file
   */
  private static async generateCSV(data: ReturnType<typeof ExportManager.transformHabitData>, fileName: string): Promise<string> {
    const exportDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // Add branding header
    const brandingHeader = [
      '================================================================================',
      '                      HABIT TRACKER - DATA EXPORT                              ',
      '           Your Personal Growth Companion - Habit Tracking Report              ',
      '================================================================================',
      '',
      `Export Date: ${exportDate}`,
      `Total Habits: ${data.length}`,
      `Active Habits: ${data.filter(h => !h.archived).length}`,
      `Total Completions: ${data.reduce((sum, h) => sum + h.totalCompletions, 0)}`,
      '',
      '================================================================================',
      '',
    ].join('\n');

    // CSV headers
    const headers = [
      'Habit Name',
      'Emoji',
      'Category',
      'Frequency',
      'Type',
      'Target Per Day',
      'Current Streak',
      'Total Completions',
      'Days Tracked',
      'Reminder Enabled',
      'Reminder Time',
      'Notes',
      'Archived',
    ];

    // Build CSV rows
    const rows = data.map(habit => [
      this.escapeCsvValue(habit.name),
      habit.emoji,
      habit.category,
      habit.frequency,
      habit.frequencyType,
      habit.targetCompletionsPerDay,
      habit.currentStreak,
      habit.totalCompletions,
      habit.daysTracked,
      habit.reminderEnabled ? 'Yes' : 'No',
      habit.reminderTime || 'N/A',
      this.escapeCsvValue(habit.notes || ''),
      habit.archived ? 'Yes' : 'No',
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(',')),
    ].join('\n');

    // Add completion details section
    const completionDetails = data.flatMap(habit => {
      return Object.entries(habit.completions).map(([date, completion]) => {
        return [
          this.escapeCsvValue(habit.name),
          date,
          completion.completionCount,
          completion.targetCount,
          completion.entries.map(e => e.mood).filter(Boolean).join(' '),
          this.escapeCsvValue(completion.entries.map(e => e.note).filter(Boolean).join(' | ')),
        ].join(',');
      });
    });

    let fullCsv = brandingHeader + csvContent;
    if (completionDetails.length > 0) {
      fullCsv += '\n\n';
      fullCsv += '================================================================================\n';
      fullCsv += '                           COMPLETION HISTORY\n';
      fullCsv += '================================================================================\n';
      fullCsv += '\n';
      fullCsv += 'Habit Name,Date,Completions,Target,Moods,Notes\n';
      fullCsv += completionDetails.join('\n');
    }

    // Add footer
    fullCsv += '\n\n';
    fullCsv += '================================================================================\n';
    fullCsv += '     Generated by Habit Tracker - Your Personal Growth Companion\n';
    fullCsv += '                    Keep building those habits! 🚀\n';
    fullCsv += '================================================================================\n';

    // Write to file
    const file = new File(Paths.cache, fileName);
    await file.write(fullCsv);

    return file.uri;
  }

  /**
   * Generate JSON file
   */
  private static async generateJSON(data: ReturnType<typeof ExportManager.transformHabitData>, fileName: string): Promise<string> {
    const exportData = {
      _metadata: {
        appName: 'Habit Tracker',
        appTagline: 'Your Personal Growth Companion',
        exportDate: new Date().toISOString(),
        exportDateFormatted: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        version: '1.0',
        dataFormat: 'habit-tracker-export-v1',
      },
      summary: {
        totalHabits: data.length,
        activeHabits: data.filter(h => !h.archived).length,
        archivedHabits: data.filter(h => h.archived).length,
        totalCompletions: data.reduce((sum, h) => sum + h.totalCompletions, 0),
        totalDaysTracked: data.reduce((sum, h) => sum + h.daysTracked, 0),
        averageStreak: data.length > 0 ? Math.round(data.reduce((sum, h) => sum + h.currentStreak, 0) / data.length) : 0,
      },
      habits: data,
      _footer: {
        message: 'Keep building those habits! 🚀',
        generatedBy: 'Habit Tracker',
        note: 'This file contains your complete habit tracking data including all completions, notes, and mood entries.',
      },
    };

    const jsonContent = JSON.stringify(exportData, null, 2);

    const file = new File(Paths.cache, fileName);
    await file.write(jsonContent);

    return file.uri;
  }

  /**
   * Generate PDF file using expo-print
   */
  private static async generatePDF(data: ReturnType<typeof ExportManager.transformHabitData>, fileName: string): Promise<string> {
    // Generate HTML content
    const htmlContent = this.generateHTMLReport(data);

    // Use expo-print to convert HTML to PDF
    const { uri } = await Print.printToFileAsync({
      html: htmlContent,
      base64: false,
    });

    // expo-print already creates the PDF in a temporary location
    // We can use it directly for sharing, or copy it to cache if needed
    // For now, return the uri directly as it's already a valid PDF file
    return uri;
  }

  /**
   * Generate HTML report for PDF/HTML export
   */
  private static generateHTMLReport(data: ReturnType<typeof ExportManager.transformHabitData>): string {
    const exportDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const exportTime = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const totalCompletions = data.reduce((sum, h) => sum + h.totalCompletions, 0);
    const activeHabits = data.filter(h => !h.archived).length;
    const averageStreak = data.length > 0 ? Math.round(data.reduce((sum, h) => sum + h.currentStreak, 0) / data.length) : 0;
    const longestStreak = Math.max(...data.map(h => h.currentStreak), 0);

    const habitRows = data.map((habit, index) => {
      const categoryColors: { [key: string]: string } = {
        health: '#EF4444',
        fitness: '#22C55E',
        productivity: '#3B82F6',
        mindfulness: '#A855F7',
        learning: '#F59E0B',
        social: '#EC4899',
        finance: '#10B981',
        creativity: '#F97316',
      };
      const categoryColor = categoryColors[habit.category.toLowerCase()] || '#3B82F6';

      return `
      <div style="margin-bottom: 20px; padding: 20px; background: linear-gradient(135deg, #ffffff 0%, #f9fafb 100%); border-radius: 12px; border-left: 5px solid ${categoryColor}; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08); page-break-inside: avoid;">
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
          <h3 style="margin: 0; color: #111827; font-size: 20px; font-weight: 600;">
            <span style="font-size: 28px; margin-right: 10px;">${habit.emoji}</span>
            ${habit.name}
          </h3>
          ${habit.archived ? '<span style="background: #FEF3C7; color: #92400E; padding: 4px 12px; border-radius: 12px; font-size: 11px; font-weight: 600; text-transform: uppercase;">Archived</span>' : ''}
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; margin-bottom: 12px;">
          <div style="background: #EFF6FF; padding: 10px; border-radius: 8px; border-left: 3px solid #3B82F6;">
            <div style="color: #6B7280; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Category</div>
            <div style="color: #1F2937; font-size: 14px; font-weight: 600; text-transform: capitalize;">${habit.category}</div>
          </div>

          <div style="background: #ECFDF5; padding: 10px; border-radius: 8px; border-left: 3px solid #10B981;">
            <div style="color: #6B7280; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Current Streak</div>
            <div style="color: #1F2937; font-size: 14px; font-weight: 600;">🔥 ${habit.currentStreak} days</div>
          </div>

          <div style="background: #FEF3C7; padding: 10px; border-radius: 8px; border-left: 3px solid #F59E0B;">
            <div style="color: #6B7280; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Total Check-ins</div>
            <div style="color: #1F2937; font-size: 14px; font-weight: 600;">✓ ${habit.totalCompletions}</div>
          </div>

          <div style="background: #F3E8FF; padding: 10px; border-radius: 8px; border-left: 3px solid #A855F7;">
            <div style="color: #6B7280; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Days Tracked</div>
            <div style="color: #1F2937; font-size: 14px; font-weight: 600;">📅 ${habit.daysTracked}</div>
          </div>
        </div>

        <div style="background: #F9FAFB; padding: 10px; border-radius: 8px; font-size: 13px; color: #4B5563;">
          <strong style="color: #374151;">Schedule:</strong> ${habit.frequency === 'daily' ? 'Every day' : 'Weekly'} •
          <strong style="color: #374151;">Target:</strong> ${habit.targetCompletionsPerDay}x per day •
          <strong style="color: #374151;">Type:</strong> ${habit.frequencyType === 'single' ? 'Single' : 'Multiple'} completion${habit.targetCompletionsPerDay > 1 ? 's' : ''}
        </div>

        ${habit.notes ? `<div style="margin-top: 12px; padding: 12px; background: #FFFBEB; border-left: 3px solid #F59E0B; border-radius: 6px;">
          <div style="color: #92400E; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; font-weight: 600;">📝 Notes</div>
          <div style="color: #78350F; font-size: 13px; line-height: 1.6; font-style: italic;">${habit.notes}</div>
        </div>` : ''}
      </div>
    `;
    }).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Habit Tracker - Export Report</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px 20px;
            color: #1f2937;
            line-height: 1.6;
          }
          .container {
            max-width: 900px;
            margin: 0 auto;
            background: white;
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            overflow: hidden;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px;
            text-align: center;
          }
          .header h1 {
            font-size: 36px;
            font-weight: 700;
            margin-bottom: 8px;
            letter-spacing: -0.5px;
          }
          .header .tagline {
            font-size: 16px;
            opacity: 0.95;
            font-weight: 500;
            letter-spacing: 0.5px;
          }
          .header .export-info {
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid rgba(255, 255, 255, 0.2);
            font-size: 14px;
            opacity: 0.9;
          }
          .content {
            padding: 40px;
          }
          .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 40px;
          }
          .summary-card {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 24px;
            border-radius: 12px;
            text-align: center;
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.25);
            transition: transform 0.2s;
          }
          .summary-card:hover {
            transform: translateY(-2px);
          }
          .summary-card .icon {
            font-size: 32px;
            margin-bottom: 8px;
          }
          .summary-card .value {
            font-size: 36px;
            font-weight: 700;
            margin-bottom: 4px;
          }
          .summary-card .label {
            font-size: 13px;
            opacity: 0.95;
            text-transform: uppercase;
            letter-spacing: 1px;
            font-weight: 600;
          }
          .section-title {
            color: #111827;
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 24px;
            padding-bottom: 12px;
            border-bottom: 3px solid #667eea;
          }
          .footer {
            background: #F9FAFB;
            padding: 30px 40px;
            text-align: center;
            border-top: 1px solid #E5E7EB;
          }
          .footer .brand {
            font-size: 18px;
            font-weight: 600;
            color: #667eea;
            margin-bottom: 8px;
          }
          .footer .tagline {
            color: #6B7280;
            font-size: 14px;
            margin-bottom: 16px;
          }
          .footer .message {
            color: #9CA3AF;
            font-size: 12px;
            font-style: italic;
          }
          @media print {
            body { background: white; padding: 0; }
            .container { box-shadow: none; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <!-- Header -->
          <div class="header">
            <h1>🎯 Habit Tracker</h1>
            <div class="tagline">Your Personal Growth Companion</div>
            <div class="export-info">
              Export Report • ${exportDate} at ${exportTime}
            </div>
          </div>

          <!-- Content -->
          <div class="content">
            <!-- Summary Cards -->
            <div class="summary-grid">
              <div class="summary-card">
                <div class="icon">📊</div>
                <div class="value">${data.length}</div>
                <div class="label">Total Habits</div>
              </div>
              <div class="summary-card">
                <div class="icon">✅</div>
                <div class="value">${activeHabits}</div>
                <div class="label">Active Habits</div>
              </div>
              <div class="summary-card">
                <div class="icon">🎉</div>
                <div class="value">${totalCompletions}</div>
                <div class="label">Total Check-ins</div>
              </div>
              <div class="summary-card">
                <div class="icon">🔥</div>
                <div class="value">${longestStreak}</div>
                <div class="label">Longest Streak</div>
              </div>
            </div>

            <!-- Habits List -->
            <h2 class="section-title">Your Habit Journey</h2>
            ${habitRows}
          </div>

          <!-- Footer -->
          <div class="footer">
            <div class="brand">Habit Tracker</div>
            <div class="tagline">Your Personal Growth Companion</div>
            <div class="message">
              Keep building those habits! Every small step counts. 🚀<br>
              This report was generated with ❤️ by Habit Tracker
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Helper: Escape CSV values
   */
  private static escapeCsvValue(value: string): string {
    if (!value) return '';

    // If value contains comma, quote, or newline, wrap in quotes and escape quotes
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }

    return value;
  }

  /**
   * Helper: Generate timestamp for filename
   */
  private static getDateStamp(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');

    return `${year}${month}${day}-${hours}${minutes}`;
  }

  /**
   * Estimate file size for large datasets
   */
  static estimateExportSize(habits: Habit[], format: ExportFormat): number {
    const data = this.transformHabitData(habits);
    const jsonSize = JSON.stringify(data).length;

    switch (format) {
      case 'json':
        return jsonSize;
      case 'csv':
        return jsonSize * 0.7; // CSV is typically smaller
      case 'pdf':
        return jsonSize * 1.5; // HTML/PDF is typically larger
      default:
        return jsonSize;
    }
  }
}
