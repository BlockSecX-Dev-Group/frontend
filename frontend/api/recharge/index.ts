import { apiPost } from "../utils";
import {
  RechargeTokenRequest,
  RechargeTokenResponse,
  ExtractTokenRequest,
  ExtractTokenResponse,
  RechargeHistoryRequest,
  RechargeHistoryResponse,
  RechargeOrderInfoRequest,
  RechargeOrderInfoResponse,
  RechargeRecord,
} from "../types";

/**
 * Create recharge order
 */
export const rechargeToken = async (
  amount: number
): Promise<RechargeTokenResponse> => {
  const request: RechargeTokenRequest = { amount };
  const response = await apiPost<RechargeTokenResponse>("/recharge_token", request);
  return response.data;
};

/**
 * Extract/withdraw tokens
 */
export const extractToken = async (
  amount: number,
  toAddress: string
): Promise<string> => {
  const request: ExtractTokenRequest = { amount, to_address: toAddress };
  const response = await apiPost<ExtractTokenResponse>("/extract_token", request);
  return response.data.tx_hash;
};

/**
 * Get user recharge history
 */
export const getUserRechargeHistory = async (
  page: number = 1,
  pageSize: number = 10
): Promise<{ records: RechargeRecord[]; total: number }> => {
  const request: RechargeHistoryRequest = { page, page_size: pageSize };
  const response = await apiPost<RechargeHistoryResponse>(
    "/get_user_recharge_history",
    request
  );
  return response.data;
};

/**
 * Get recharge order info
 */
export const getRechargeOrderInfo = async (
  orderId: string
): Promise<RechargeOrderInfoResponse> => {
  const request: RechargeOrderInfoRequest = { order_id: orderId };
  const response = await apiPost<RechargeOrderInfoResponse>(
    "/get_recharge_order_info",
    request
  );
  return response.data;
};
