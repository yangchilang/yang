import { ReadingRecord } from '../types';

const HISTORY_KEY = 'tarot_reading_history';

export function getReadingHistory(): ReadingRecord[] {
  try {
    const data = localStorage.getItem(HISTORY_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Failed to read history:', error);
  }
  return [];
}

export function saveReadingRecord(record: ReadingRecord): void {
  try {
    const history = getReadingHistory();
    history.unshift(record);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('Failed to save history:', error);
  }
}

export function deleteReadingRecord(id: string): void {
  try {
    const history = getReadingHistory();
    const filtered = history.filter(r => r.id !== id);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Failed to delete record:', error);
  }
}

export function clearReadingHistory(): void {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch (error) {
    console.error('Failed to clear history:', error);
  }
}

export function getReadingRecordById(id: string): ReadingRecord | undefined {
  const history = getReadingHistory();
  return history.find(r => r.id === id);
}
