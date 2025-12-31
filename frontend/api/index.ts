// BlockSec API Module - Unified Export
// Provides unified entry point for all API interfaces

// ============ Type Definitions Export ============
export * from "./types";

// ============ Utility Functions Export ============
export * from "./utils";

// ============ Authentication APIs ============
export * from "./auth/login";

// ============ Field/Challenge APIs ============
export * from "./field";

// ============ User APIs ============
export * from "./user/balance";
export * from "./user/points";
export * from "./user/invite";
export * from "./user/inviteInfo";
export * from "./user/ranking";

// ============ Quiz APIs ============
export * from "./quiz";

// ============ Recharge APIs ============
export * from "./recharge";

// ============ Audit APIs ============
export * from "./audit";

// ============ NFT APIs ============
export * from "./nft";

// ============ Convenient API Groupings ============

// Authentication API collection
export const AuthAPI = {
  login: async (signature: string, timestamp: string) => {
    const { loginUser } = await import("./auth/login");
    return loginUser({ signature, ts: timestamp });
  },

  logout: async () => {
    const { logoutUser } = await import("./auth/login");
    return logoutUser();
  },
};

// Field/Challenge API collection
export const FieldAPI = {
  getAllFields: async () => {
    const { getAllFields } = await import("./field");
    return getAllFields();
  },

  getAvailableFields: async () => {
    const { getAvailableFieldsForUser } = await import("./field");
    return getAvailableFieldsForUser();
  },

  createField: async (fieldName: string) => {
    const { createField } = await import("./field");
    return createField(fieldName);
  },

  shutdownField: async (fieldId: string) => {
    const { shutdownField } = await import("./field");
    return shutdownField(fieldId);
  },

  checkFlag: async (fieldId: string, flag: string) => {
    const { checkFlag } = await import("./field");
    return checkFlag(fieldId, flag);
  },

  getRunningField: async () => {
    const { getRunningFieldForUser } = await import("./field");
    return getRunningFieldForUser();
  },
};

// User API collection
export const UserAPI = {
  getBalance: async () => {
    const { getUserBalance } = await import("./user/balance");
    return getUserBalance();
  },

  getPoints: async () => {
    const { getUserPoints } = await import("./user/points");
    return getUserPoints();
  },

  signIn: async () => {
    const { signIn } = await import("./user/points");
    return signIn();
  },

  getInviteCode: async () => {
    const { getUserInviteCode } = await import("./user/invite");
    return getUserInviteCode();
  },

  getInviteInfo: async () => {
    const { getUserInviteInfo } = await import("./user/inviteInfo");
    return getUserInviteInfo();
  },
};

// Quiz API collection
export const QuizAPI = {
  getQuestions: async () => {
    const { getChallengeQuestions } = await import("./quiz");
    return getChallengeQuestions();
  },

  submitAnswers: async (sessionId: string, answers: Record<string, string>) => {
    const { submitChallengeAnswers } = await import("./quiz");
    return submitChallengeAnswers(sessionId, answers);
  },
};

// Ranking API collection
export const RankingAPI = {
  getSignInRanking: async () => {
    const { getSignInRanking } = await import("./user/ranking");
    return getSignInRanking();
  },

  getAnswerRanking: async () => {
    const { getAnswerRanking } = await import("./user/ranking");
    return getAnswerRanking();
  },
};

// Recharge API collection
export const RechargeAPI = {
  recharge: async (amount: number) => {
    const { rechargeToken } = await import("./recharge");
    return rechargeToken(amount);
  },

  extract: async (amount: number, toAddress: string) => {
    const { extractToken } = await import("./recharge");
    return extractToken(amount, toAddress);
  },

  getHistory: async (page?: number, pageSize?: number) => {
    const { getUserRechargeHistory } = await import("./recharge");
    return getUserRechargeHistory(page, pageSize);
  },

  getOrderInfo: async (orderId: string) => {
    const { getRechargeOrderInfo } = await import("./recharge");
    return getRechargeOrderInfo(orderId);
  },
};

// NFT API collection
export const NFTAPI = {
  getMintParams: async () => {
    const { getNFTMintParams } = await import("./nft");
    return getNFTMintParams();
  },

  submitMint: async (signature: string, nonce: number, deadline: number) => {
    const { submitNFTMint } = await import("./nft");
    return submitNFTMint(signature, nonce, deadline);
  },
};

// ============ Default Export for Convenience ============
export default {
  AuthAPI,
  FieldAPI,
  UserAPI,
  QuizAPI,
  RankingAPI,
  RechargeAPI,
  NFTAPI,
};
