import { apiGet, apiDebugLog } from "../utils";

/**
 * User Invite Info Response
 */
export interface UserInviteInfoResponse {
  user_invite_count: number;
}

/**
 * Get User Invite Info API
 * Retrieve the number of successful invitations by the user
 *
 * @returns Promise<UserInviteInfoResponse> User's invitation statistics
 *
 * @example
 * ```typescript
 * try {
 *   const result = await getUserInviteInfo()
 *   console.log('Successful invites:', result.user_invite_count)
 * } catch (error) {
 *   console.error('Failed to get invite info:', error.message)
 * }
 * ```
 */
export const getUserInviteInfo = async (): Promise<UserInviteInfoResponse> => {
  // Development environment debug log
  apiDebugLog("/get_user_invite_info", "GET");

  try {
    // Send user invite info request
    const response = await apiGet<UserInviteInfoResponse>(
      "/get_user_invite_info"
    );

    console.log("✅ User invite info retrieved successfully");
    console.log(`👥 Total invites: ${response.data.user_invite_count}`);

    return response.data;
  } catch (error) {
    console.error("❌ Failed to get user invite info:", error);
    throw error;
  }
};

/**
 * Get formatted invite statistics
 * 
 * @param inviteCount Number of successful invites
 * @returns Formatted statistics object
 */
export const getFormattedInviteStats = (inviteCount: number) => {
  return {
    count: inviteCount,
    displayText: inviteCount === 0 
      ? "No invitations yet" 
      : `${inviteCount} successful ${inviteCount === 1 ? 'invite' : 'invites'}`,
    hasInvites: inviteCount > 0,
    rewardEstimate: inviteCount * 0.005, // Assuming 0.005 USDT per invite
  };
};

/**
 * Get invite achievement level
 * 
 * @param inviteCount Number of successful invites
 * @returns Achievement level information
 */
export const getInviteAchievementLevel = (inviteCount: number) => {
  if (inviteCount === 0) return { level: "Starter", color: "gray" };
  if (inviteCount < 5) return { level: "Bronze", color: "bronze" };
  if (inviteCount < 10) return { level: "Silver", color: "silver" };
  if (inviteCount < 20) return { level: "Gold", color: "gold" };
  return { level: "Platinum", color: "platinum" };
};