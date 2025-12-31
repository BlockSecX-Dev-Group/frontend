import { apiGetPublic } from "../utils";
import {
  RankingItem,
  SignInRankingResponse,
  SignInRankingRawItem,
  AnswerRankingResponse,
  AnswerRankingRawItem,
} from "../types";

/**
 * Convert sign-in ranking raw items to normalized RankingItem format
 * Backend returns: { sign_in_ranking: [{ user_address, sign_in_days, total_sign_in_points }] }
 */
const parseSignInRanking = (data: SignInRankingResponse): RankingItem[] => {
  if (!data?.sign_in_ranking || !Array.isArray(data.sign_in_ranking)) {
    console.log("[Ranking API] No sign_in_ranking array found in response");
    return [];
  }

  return data.sign_in_ranking.map((item: SignInRankingRawItem, index: number) => ({
    rank: index + 1,
    user_address: item.user_address || "",
    points: typeof item.total_sign_in_points === "string"
      ? parseInt(item.total_sign_in_points, 10) || 0
      : item.total_sign_in_points || 0,
  }));
};

/**
 * Convert answer ranking raw items to normalized RankingItem format
 * Backend returns: { answer_ranking: [{ user_address, total_answer_points, ... }] }
 */
const parseAnswerRanking = (data: AnswerRankingResponse): RankingItem[] => {
  if (!data?.answer_ranking || !Array.isArray(data.answer_ranking)) {
    console.log("[Ranking API] No answer_ranking array found in response");
    return [];
  }

  return data.answer_ranking.map((item: AnswerRankingRawItem, index: number) => ({
    rank: index + 1,
    user_address: item.user_address || "",
    points: typeof item.total_answer_points === "string"
      ? parseInt(item.total_answer_points, 10) || 0
      : item.total_answer_points || 0,
  }));
};

/**
 * Get sign-in points ranking (public API, no authentication required)
 */
export const getSignInRanking = async (): Promise<RankingItem[]> => {
  try {
    const response = await apiGetPublic<SignInRankingResponse>("/get-sign-in-ranking");
    return parseSignInRanking(response.data);
  } catch (error) {
    console.error("[Ranking API] Error fetching sign-in ranking:", error);
    throw error;
  }
};

/**
 * Get answer/quiz points ranking (public API, no authentication required)
 */
export const getAnswerRanking = async (): Promise<RankingItem[]> => {
  try {
    const response = await apiGetPublic<AnswerRankingResponse>("/get-answer-ranking");
    return parseAnswerRanking(response.data);
  } catch (error) {
    console.error("[Ranking API] Error fetching answer ranking:", error);
    throw error;
  }
};
