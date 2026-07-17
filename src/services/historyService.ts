import { ReadingRecord, SelectedCard, Spread } from '../types';
import { apiRequest } from './api';

const HISTORY_KEY = 'tarot_reading_history';

export interface BackendReading {
  id: number;
  user_id: number;
  cards: string;
  interpretation: string;
  user_context: string;
  order_id: string;
  title?: string;
  customer_gender?: string;
  related_order_id?: string;
  customer_info?: string;
  customer_statement?: string;
  customer_question?: string;
  created_at: string;
}

export interface PaginatedReadings {
  readings: BackendReading[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

function backendToRecord(r: BackendReading): ReadingRecord {
  return {
    id: String(r.id),
    selectedCards: JSON.parse(r.cards) as SelectedCard[],
    interpretation: r.interpretation,
    userContext: r.user_context || '',
    createdAt: r.created_at,
    orderId: r.order_id,
    title: r.title || '',
    customerGender: r.customer_gender,
    relatedOrderId: r.related_order_id,
    customerInfo: r.customer_info,
    customerStatement: r.customer_statement,
    customerQuestion: r.customer_question,
  };
}

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

// Backend API wrappers

export async function fetchReadingHistory(page = 1, limit = 10): Promise<PaginatedReadings | null> {
  try {
    const response = await apiRequest<PaginatedReadings>(`/readings?page=${page}&limit=${limit}`);
    if (response.success && response.data) {
      return response.data;
    }
  } catch (error) {
    console.error('Failed to fetch reading history from backend:', error);
  }
  return null;
}

export async function createReadingRecord(
  cards: SelectedCard[],
  interpretation: string,
  userContext: string,
  spread?: Spread,
  orderId?: string,
  title?: string,
  customerGender?: string,
  relatedOrderId?: string,
  customerInfo?: string,
  customerStatement?: string,
  customerQuestion?: string
): Promise<ReadingRecord | null> {
  try {
    const response = await apiRequest<BackendReading>('/readings', {
      method: 'POST',
      body: JSON.stringify({
        cards,
        interpretation,
        user_context: userContext,
        spread,
        order_id: orderId,
        title,
        customer_gender: customerGender,
        related_order_id: relatedOrderId,
        customer_info: customerInfo,
        customer_statement: customerStatement,
        customer_question: customerQuestion,
      }),
    });
    if (response.success && response.data) {
      return backendToRecord(response.data);
    }
  } catch (error) {
    console.error('Failed to create reading on backend:', error);
  }
  return null;
}

export async function deleteBackendReading(id: number): Promise<boolean> {
  try {
    const response = await apiRequest<void>(`/readings/${id}`, {
      method: 'DELETE',
    });
    return response.success;
  } catch (error) {
    console.error('Failed to delete reading from backend:', error);
  }
  return false;
}

export async function searchReadings(keyword: string): Promise<ReadingRecord[]> {
  try {
    const response = await apiRequest<{ readings: BackendReading[] }>(`/readings/search?keyword=${encodeURIComponent(keyword)}`);
    if (response.success && response.data?.readings) {
      return response.data.readings.map(r => backendToRecord(r));
    }
  } catch (error) {
    console.error('Failed to search readings:', error);
  }
  return [];
}
