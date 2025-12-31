import { apiGet } from "../utils";
import { UserBalanceResponse } from "../types";

/**
 * Get user balance
 */
export const getUserBalance = async (): Promise<number> => {
  const response = await apiGet<UserBalanceResponse>("/get-user-balance");
  return response.data?.balance ?? 0;
};
