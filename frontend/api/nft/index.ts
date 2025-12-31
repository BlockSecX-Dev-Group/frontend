import { apiGet, apiPost } from "../utils";
import {
  NFTMintParamsResponse,
  NFTMintSubmitRequest,
  NFTMintSubmitResponse,
} from "../types";

/**
 * Get NFT mint parameters for EIP-712 signing
 * User must have signed in for 10+ days to be eligible
 */
export const getNFTMintParams = async (): Promise<NFTMintParamsResponse> => {
  const response = await apiGet<NFTMintParamsResponse>("/nft/params");
  return response.data;
};

/**
 * Submit NFT mint request with user signature
 * @param signature - EIP-712 signature from user's wallet
 * @param nonce - Must match the nonce from getNFTMintParams
 * @param deadline - Must match the deadline from getNFTMintParams
 */
export const submitNFTMint = async (
  signature: string,
  nonce: number,
  deadline: number
): Promise<NFTMintSubmitResponse> => {
  const request: NFTMintSubmitRequest = {
    signature,
    nonce,
    deadline,
  };
  const response = await apiPost<NFTMintSubmitResponse>("/nft/submit", request);
  return response.data;
};
