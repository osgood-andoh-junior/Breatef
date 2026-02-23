// Centralized API Client with Authentication
import { API_BASE_URL } from "@/config/api";

interface RequestOptions extends RequestInit {
  requireAuth?: boolean;
}

class ApiClient {
  private getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("access_token");
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    // Handle 401 Unauthorized - redirect to login
    if (response.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
      throw new Error("Unauthorized. Please log in again.");
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({} as any));
      throw new Error(
        errorData?.detail || `HTTP error! status: ${response.status}`
      );
    }

    // Handle empty responses safely
    const text = await response.text();
    if (!text) return {} as T;

    try {
      return JSON.parse(text) as T;
    } catch {
      return {} as T;
    }
  }

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { requireAuth = true, ...fetchOptions } = options;

    // ✅ Use a plain object so TS allows indexing with ["Authorization"]
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // Merge any incoming headers safely (supports both object and Headers)
    if (fetchOptions.headers) {
      if (fetchOptions.headers instanceof Headers) {
        fetchOptions.headers.forEach((value, key) => {
          headers[key] = value;
        });
      } else if (Array.isArray(fetchOptions.headers)) {
        fetchOptions.headers.forEach(([key, value]) => {
          headers[key] = String(value);
        });
      } else {
        Object.entries(fetchOptions.headers).forEach(([key, value]) => {
          if (typeof value !== "undefined") headers[key] = String(value);
        });
      }
    }

    // Add authentication
    if (requireAuth) {
      const token = this.getToken();
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    const config: RequestInit = {
      ...fetchOptions,
      headers,
      credentials: "include", // Include cookies for refresh token
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    return this.handleResponse<T>(response);
  }

  async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  }

  async post<T>(
    endpoint: string,
    data?: any,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(
    endpoint: string,
    data?: any,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(
    endpoint: string,
    data?: any,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "DELETE" });
  }
}

export const apiClient = new ApiClient();
