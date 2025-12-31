// BlockSec API Types
// Base URL for all API interfaces
const isDev = typeof window !== 'undefined' && window.location.hostname === 'localhost';
export const API_BASE_URL = isDev
  ? '/api/proxy'
  : process.env.NEXT_PUBLIC_API_BASE_URL;

// Token storage key
export const AUTH_TOKEN_KEY = "auth_token";

// Unified API response format
export interface APIResponse<T = any> {
  data: T;
  message: string;
  status: "success" | "error";
}

// Custom API error class
export class APIError extends Error {
  constructor(message: string, public statusCode?: number, public data?: any) {
    super(message);
    this.name = "APIError";
  }
}

// ============ Authentication Types ============

export interface LoginRequest {
  signature: string;
  ts: string;
}

export interface LoginResponse {
  access_token: string;
}

// ============ User Types ============

export interface UserBalanceResponse {
  balance: number;
}

export interface UserPointsResponse {
  current_points: number;
}

export interface SignInResponse {
  current_points: number;
  message?: string;
}

export interface UserInviteCodeResponse {
  invite_code: string;
}

export interface UserInviteInfoResponse {
  user_invite_count: number;
}

// ============ Challenge Type Enum ============

export enum ChallengeType {
  CTF = "ctf",           // CTF Arena - Flag submission
  QUIZ = "quiz",         // Multiple choice quiz
  VIDEO = "video",       // Video watching
}

// ============ Field/Challenge Types ============

export interface FieldInfo {
  field_name: string;
  description: string;
  cost: number;
  difficulty?: string;
  code?: string;
  hints?: string[];
  challenge_type?: ChallengeType;  // Challenge type
  video_url?: string;              // Video URL (for VIDEO type)
  field_url?: string;              // Arena URL (for CTF type)
}

export interface AllFieldsResponse {
  all_fields_info: FieldInfo[];
}

export interface AvailableFieldsResponse {
  available_fields_list: string[];
}

export interface CreateFieldRequest {
  field_name: string;
}

export interface CreateFieldResponse {
  field_id: string;
  field_url?: string;
}

export interface ShutdownFieldRequest {
  field_id: string;
}

export interface CheckFlagRequest {
  field_id: string;
  flag: string;
}

export interface CheckFlagResponse {
  status: string;
  message: string;
}

export interface RunningFieldResponse {
  field_id: string;
  field_name: string;
  field_url?: string;
  expiration_time?: number;
}

export interface FieldFunctionIntroResponse {
  intro: string;
}

// ============ Quiz/Challenge Question Types ============

export interface ChallengeQuestion {
  question_id: number;
  question_bank_id: string;
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
}

export interface GetChallengeQuestionsRequest {
  category?: string;
}

export interface GetChallengeQuestionsResponse {
  questions: ChallengeQuestion[];
  session_id: string;
  expire_at: string;
}

export interface SubmitChallengeAnswersRequest {
  session_id: string;
  user_answers: Record<string, string>; // { "153": "A", "485": "B", ... }
}

export interface SubmitChallengeAnswersResponse {
  correct_count: number;
}

// ============ Ranking Types ============

// Normalized ranking item for frontend display
export interface RankingItem {
  rank: number;
  user_address: string;
  points: number;
}

// Raw response from /get-sign-in-ranking
export interface SignInRankingRawItem {
  user_address: string;
  sign_in_days: number;
  total_sign_in_points: string | number;
}

export interface SignInRankingResponse {
  sign_in_ranking: SignInRankingRawItem[];
}

// Raw response from /get-answer-ranking
export interface AnswerRankingRawItem {
  user_address: string;
  total_answer_points: string | number;
  total_answer_questions: number;
  total_challenge_times: number;
  total_correct_count: string | number;
}

export interface AnswerRankingResponse {
  answer_ranking: AnswerRankingRawItem[];
}

// ============ Recharge Types ============

export interface RechargeTokenRequest {
  amount: number;
}

export interface RechargeTokenResponse {
  order_id: string;
  receive_address: string;
}

export interface ExtractTokenRequest {
  amount: number;
  to_address: string;
}

export interface ExtractTokenResponse {
  tx_hash: string;
}

export interface RechargeHistoryRequest {
  page?: number;
  page_size?: number;
}

export interface RechargeRecord {
  order_id: string;
  amount: number;
  status: string;
  created_at: string;
}

export interface RechargeHistoryResponse {
  records: RechargeRecord[];
  total: number;
}

export interface RechargeOrderInfoRequest {
  order_id: string;
}

export interface RechargeOrderInfoResponse {
  order_id: string;
  amount: number;
  status: string;
  receive_address: string;
  created_at: string;
}

// ============ NFT Types ============

// Response from /nft/params - EIP-712 signing parameters
export interface NFTMintParamsResponse {
  to: string;                    // User wallet address
  uri: string;                   // NFT metadata URI (IPFS)
  nonce: number;                 // Current on-chain nonce
  deadline: number;              // Signature expiration timestamp
  chain_id: number;              // Chain ID (e.g., 97 for BSC Testnet)
  verifying_contract: string;    // NFT contract address
  eip712_name: string;           // Domain name for EIP-712
  eip712_version: string;        // Version for EIP-712
}

// Request body for /nft/submit
export interface NFTMintSubmitRequest {
  signature: string;             // User's EIP-712 signature
  nonce: number;                 // Must match params nonce
  deadline: number;              // Must match params deadline
}

// Response from /nft/submit
export interface NFTMintSubmitResponse {
  tx_hash: string;               // On-chain transaction hash
}

// ============ Legacy Types (for compatibility) ============

// Keep for invite system
export interface PrizePoolInfoResponse {
  prize_pool_info: {
    [key: string]: number;
  };
}
