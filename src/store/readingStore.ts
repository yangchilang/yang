import { create } from 'zustand';
import {
  getReadings,
  getReadingById,
  createReading,
  deleteReading,
  Reading,
  CreateReadingRequest,
} from '../services/readingService';

interface ReadingState {
  readings: Reading[];
  currentReading: Reading | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null;
  fetchReadings: (page?: number, limit?: number) => Promise<void>;
  fetchReading: (id: number) => Promise<void>;
  saveReading: (data: CreateReadingRequest) => Promise<void>;
  removeReading: (id: number) => Promise<void>;
  clearCurrentReading: () => void;
  clearError: () => void;
}

export const useReadingStore = create<ReadingState>((set, get) => ({
  readings: [],
  currentReading: null,
  isLoading: false,
  error: null,
  pagination: null,

  fetchReadings: async (page: number = 1, limit: number = 10) => {
    set({ isLoading: true, error: null });
    try {
      const response = await getReadings(page, limit);
      set({
        readings: response.readings,
        pagination: response.pagination,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '获取历史记录失败',
        isLoading: false,
      });
    }
  },

  fetchReading: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      const reading = await getReadingById(id);
      set({
        currentReading: reading,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '获取解读详情失败',
        isLoading: false,
      });
      throw error;
    }
  },

  saveReading: async (data: CreateReadingRequest) => {
    set({ isLoading: true, error: null });
    try {
      const reading = await createReading(data);
      const { readings, pagination } = get();
      set({
        readings: [reading, ...readings],
        pagination: pagination
          ? { ...pagination, total: pagination.total + 1 }
          : null,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '保存解读失败',
        isLoading: false,
      });
      throw error;
    }
  },

  removeReading: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      await deleteReading(id);
      const { readings, pagination } = get();
      set({
        readings: readings.filter((r) => r.id !== id),
        pagination: pagination
          ? { ...pagination, total: pagination.total - 1 }
          : null,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '删除解读失败',
        isLoading: false,
      });
      throw error;
    }
  },

  clearCurrentReading: () => {
    set({ currentReading: null });
  },

  clearError: () => {
    set({ error: null });
  },
}));
