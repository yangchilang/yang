import { apiRequest } from './api';
import { SelectedCard } from '../types';

export interface Reading {
  id: number;
  user_id: number;
  cards: string;
  interpretation: string;
  user_context: string;
  created_at: string;
}

export interface CreateReadingRequest {
  cards: SelectedCard[];
  interpretation: string;
  user_context?: string;
}

export interface GetReadingsResponse {
  readings: Reading[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export async function getReadings(
  page: number = 1,
  limit: number = 10
): Promise<GetReadingsResponse> {
  const response = await apiRequest<GetReadingsResponse>(
    `/api/readings?page=${page}&limit=${limit}`
  );

  if (response.success && response.data) {
    return response.data;
  }

  throw new Error(response.error || '获取历史记录失败');
}

export async function getReadingById(id: number): Promise<Reading> {
  const response = await apiRequest<Reading>(`/api/readings/${id}`);

  if (response.success && response.data) {
    return response.data;
  }

  throw new Error(response.error || '获取解读详情失败');
}

export async function createReading(data: CreateReadingRequest): Promise<Reading> {
  const response = await apiRequest<Reading>('/api/readings', {
    method: 'POST',
    body: JSON.stringify(data),
  });

  if (response.success && response.data) {
    return response.data;
  }

  throw new Error(response.error || '保存解读失败');
}

export async function deleteReading(id: number): Promise<void> {
  const response = await apiRequest<{ message: string }>(`/api/readings/${id}`, {
    method: 'DELETE',
  });

  if (!response.success) {
    throw new Error(response.error || '删除解读失败');
  }
}
