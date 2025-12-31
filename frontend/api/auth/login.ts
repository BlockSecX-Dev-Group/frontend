import { apiPost, apiGet, setAuthToken, clearAuthData } from "../utils";
import { LoginRequest, LoginResponse, APIError } from "../types";

/**
 * User Login API
 *
 * @param loginData Login request data containing signature and timestamp
 * @returns Promise<LoginResponse> JWT access token
 */
export const loginUser = async (
  loginData: LoginRequest
): Promise<LoginResponse> => {
  try {
    const response = await apiPost<LoginResponse>("/login", loginData);

    setAuthToken(response.data.access_token);
    return response.data;
  } catch (error) {
    if (error instanceof APIError) {
      if (
        error.message.includes("User does not exist") ||
        error.message.includes("sign up first")
      ) {
        throw new APIError("User does not exist. Please sign up first.");
      }
    }
    throw error;
  }
};

/**
 * User Logout API
 */
export const logoutUser = async (): Promise<void> => {
  try {
    await apiGet<void>("/logout");
  } finally {
    clearAuthData();
  }
};

/**
 * Signature generation logic:
 * 1. Generate timestamp: ts = str(int(datetime.now().timestamp()))
 * 2. Message is timestamp: message = ts
 * 3. Frontend uses personal_sign which adds Ethereum prefix
 * 4. Signature sent WITHOUT 0x prefix
 */
