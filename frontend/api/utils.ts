import { APIResponse, APIError, API_BASE_URL, AUTH_TOKEN_KEY } from "./types";

// Utility function: get authentication token from local storage
export const getAuthToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  }
  return null;
};

// Utility function: store authentication token to local storage
export const setAuthToken = (token: string): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  }
};

// Utility function: clear authentication data
export const clearAuthData = (): void => {
  if (typeof window !== "undefined") {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem("wallet_address");
  }
};

// Utility function: check if user is authenticated
export const isAuthenticated = (): boolean => {
  const token = getAuthToken();
  return !!token;
};

// Utility function: get auth headers for API requests
export const getAuthHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {};
  const token = getAuthToken();
  if (token) {
    headers["Authorization"] = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
  }
  return headers;
};

// Debug logging function for development
export const apiDebugLog = (
  endpoint: string,
  method: string,
  data?: any
): void => {
  if (process.env.NODE_ENV === "development") {
    console.log(`🌐 API Call: ${method} ${endpoint}`, data ? { data } : "");
  }
};

// Generic API request function
export const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<APIResponse<T>> => {
  const url = `${API_BASE_URL}${endpoint}`;

  // Set default headers
  const defaultHeaders: HeadersInit = {
    "Content-Type": "application/json",
  };

  // Add authentication header if available
  const token = getAuthToken();
  if (token) {
    const authHeader = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
    defaultHeaders["Authorization"] = authHeader;
  }

  // Merge headers
  const headers = {
    ...defaultHeaders,
    ...options.headers,
  };

  const config: RequestInit = {
    ...options,
    headers,
  };

  apiDebugLog(endpoint, options.method || "GET", options.body);

  try {
    const response = await fetch(url, config);

    // Handle non-JSON responses
    const contentType = response.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      if (response.ok) {
        const text = await response.text();
        return {
          data: text as T,
          message: "Success",
          status: "success",
        };
      } else {
        throw new APIError(
          `HTTP Error: ${response.status}`,
          response.status
        );
      }
    }

    const data: APIResponse<T> = await response.json();

    if (data.status === "error") {
      throw new APIError(data.message, response.status, data.data);
    }

    return data;
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }

    // Handle network errors
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new APIError("Network error. Please check your connection.");
    }

    throw new APIError(`Request failed: ${(error as Error).message}`);
  }
};

// Shorthand functions for different HTTP methods
export const apiGet = <T>(endpoint: string): Promise<APIResponse<T>> => {
  return apiRequest<T>(endpoint, { method: "GET" });
};

export const apiPost = <T>(
  endpoint: string,
  data?: any
): Promise<APIResponse<T>> => {
  return apiRequest<T>(endpoint, {
    method: "POST",
    body: data ? JSON.stringify(data) : undefined,
  });
};

export const apiPut = <T>(
  endpoint: string,
  data?: any
): Promise<APIResponse<T>> => {
  return apiRequest<T>(endpoint, {
    method: "PUT",
    body: data ? JSON.stringify(data) : undefined,
  });
};

export const apiDelete = <T>(endpoint: string): Promise<APIResponse<T>> => {
  return apiRequest<T>(endpoint, { method: "DELETE" });
};

// Public API request function (without authentication token)
// Used for endpoints that don't require authentication, such as rankings
export const apiRequestPublic = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<APIResponse<T>> => {
  const url = `${API_BASE_URL}${endpoint}`;

  // Set default headers without authentication
  const defaultHeaders: HeadersInit = {
    "Content-Type": "application/json",
  };

  // Merge headers
  const headers = {
    ...defaultHeaders,
    ...options.headers,
  };

  const config: RequestInit = {
    ...options,
    headers,
  };

  apiDebugLog(endpoint, options.method || "GET", options.body);

  try {
    const response = await fetch(url, config);

    // Handle non-JSON responses
    const contentType = response.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      if (response.ok) {
        const text = await response.text();
        return {
          data: text as T,
          message: "Success",
          status: "success",
        };
      } else {
        throw new APIError(
          `HTTP Error: ${response.status}`,
          response.status
        );
      }
    }

    const data: APIResponse<T> = await response.json();

    if (data.status === "error") {
      throw new APIError(data.message, response.status, data.data);
    }

    return data;
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }

    // Handle network errors
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new APIError("Network error. Please check your connection.");
    }

    throw new APIError(`Request failed: ${(error as Error).message}`);
  }
};

// Public GET request (without authentication)
export const apiGetPublic = <T>(endpoint: string): Promise<APIResponse<T>> => {
  return apiRequestPublic<T>(endpoint, { method: "GET" });
};

// ====== Local Storage Keys ======
export const STORAGE_KEYS = {
  AUTH_TOKEN: AUTH_TOKEN_KEY,
  WALLET_ADDRESS: "wallet_address",
  USER_POINTS: "user_points",
  USER_BALANCE: "user_balance",
};
