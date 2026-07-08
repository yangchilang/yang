export interface User {
  id: number;
  username: string;
  password: string;
  created_at: string;
  updated_at: string;
}

export interface Reading {
  id: number;
  user_id: number;
  cards: string;
  interpretation: string;
  user_context: string;
  order_id: string;
  customer_name?: string;
  customer_gender?: string;
  customer_age?: number;
  related_order_id?: string;
  created_at: string;
}

export interface SelectedCard {
  card: {
    id: number;
    name: string;
    nameCn: string;
    meaning: string;
    reversedMeaning: string;
  };
  isReversed: boolean;
  position: number;
}

export interface JwtPayload {
  userId: number;
  username: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
