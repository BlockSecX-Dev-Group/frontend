import { apiGet, apiPost } from "../utils";
import { UserPointsResponse, SignInResponse } from "../types";

/**
 * Get user points
 */
export const getUserPoints = async (): Promise<number> => {
  const response = await apiGet<UserPointsResponse>("/get-user-points");
  return response.data?.current_points ?? 0;
};

/**
 * Daily sign-in to earn points
 * Returns the current points after sign-in
 */
export const signIn = async (): Promise<{ points: number; message?: string }> => {
  const response = await apiPost<SignInResponse>("/sign-in");
  return {
    points: response.data?.current_points ?? 0,
    message: response.message,
  };
};
