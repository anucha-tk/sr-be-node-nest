export const API_BASE_URL = 'http://localhost:3000';

// Use the API key from environment, or fallback to the master key for demo purposes
const API_KEY = import.meta.env.VITE_API_KEY || 'sk_live_master'; 

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string | { code: string; message: string; details?: any[] };
  meta?: { 
    executionTimeMs?: number;
    timestamp?: string;
    correlationId?: string;
    pagination?: any;
  };
  status?: number;
}

export async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY, // Service-to-service auth showcase
        ...options?.headers,
      },
    });

    const data = await response.json();
    return { ...data, status: response.status };
  } catch (error) {
    console.error('API Fetch Error:', error);
    return { success: false, error: 'Failed to connect to backend', status: 500 };
  }
}
