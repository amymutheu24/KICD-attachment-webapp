import { TokenManager } from '../auth/token-manager';

export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

export interface RequestConfig {
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

class ApiClient {
  private baseURL: string;

  constructor() {
    this.baseURL = (import.meta.env?.VITE_API_BASE_URL as string) || 'http://localhost:8080';
  }

  private async request<T>(
    method: string,
    url: string,
    data?: any,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    const fullUrl = `${this.baseURL}${url}`;
    const token = TokenManager.getAccessToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...config?.headers,
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const options: RequestInit = {
      method,
      headers,
      signal: config?.signal,
    };

    if (data && method !== 'GET') {
      if (data instanceof FormData) {
        delete headers['Content-Type']; // Let browser set multipart boundary
        options.body = data;
      } else {
        options.body = JSON.stringify(data);
      }
    }

    try {
      const response = await fetch(fullUrl, options);

      if (response.status === 401) {
        // Try to refresh token
        try {
          await TokenManager.refreshToken();
          const newToken = TokenManager.getAccessToken();
          if (newToken) {
            headers.Authorization = `Bearer ${newToken}`;
            options.headers = headers;
            const retryResponse = await fetch(fullUrl, options);
            return this.handleResponse(retryResponse);
          }
        } catch (refreshError) {
          TokenManager.clearTokens();
          window.location.href = '/login';
          throw this.normalizeError({ message: 'Authentication failed' });
        }
      }

      return this.handleResponse(response);
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const contentType = response.headers.get('content-type');
    
    if (!response.ok) {
      let errorData: any;
      try {
        if (contentType?.includes('application/json')) {
          errorData = await response.json();
        } else {
          errorData = { message: await response.text() };
        }
      } catch {
        errorData = { message: 'Unknown error occurred' };
      }
      
      throw this.normalizeError({
        response: {
          status: response.status,
          data: errorData,
        },
      });
    }

    if (contentType?.includes('application/json')) {
      return await response.json();
    }

    return { data: (await response.text()) as T, success: true };
  }

  private normalizeError(error: any): ApiError {
    if (error.response) {
      return {
        message: error.response.data?.message || 'Server error',
        code: error.response.data?.code || `HTTP_${error.response.status}`,
        details: error.response.data?.details,
      };
    }

    if (error.name === 'AbortError') {
      return {
        message: 'Request was cancelled',
        code: 'REQUEST_CANCELLED',
      };
    }

    if (error.message) {
      return {
        message: error.message,
        code: 'NETWORK_ERROR',
      };
    }

    return {
      message: 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR',
    };
  }

  async get<T>(url: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('GET', url, undefined, config);
  }

  async post<T>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('POST', url, data, config);
  }

  async put<T>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', url, data, config);
  }

  async delete<T>(url: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', url, undefined, config);
  }

  async upload<T>(url: string, formData: FormData, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('POST', url, formData, config);
  }
}

export const apiClient = new ApiClient();
