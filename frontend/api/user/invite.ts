import { apiGet, apiDebugLog } from "../utils";
import { UserInviteCodeResponse } from "../types";

/**
 * Get User Invite Code API
 * Display invite code on user profile interface
 *
 * @returns Promise<UserInviteCodeResponse> User's invite code data
 *
 * @example
 * ```typescript
 * try {
 *   const result = await getUserInviteCode()
 *   console.log('Your invite code:', result.invite_code)
 *   console.log('Share this code with friends to earn rewards!')
 * } catch (error) {
 *   console.error('Failed to get invite code:', error.message)
 * }
 * ```
 */
export const getUserInviteCode = async (): Promise<UserInviteCodeResponse> => {
  // Development environment debug log
  apiDebugLog("/get_user_invite_code", "GET");

  try {
    // Send user invite code request
    const response = await apiGet<UserInviteCodeResponse>(
      "/get_user_invite_code"
    );

    console.log("✅ User invite code retrieved successfully");
    console.log(`🎫 Invite code: ${response.data.invite_code}`);

    return response.data;
  } catch (error) {
    console.error("❌ Failed to get user invite code:", error);
    throw error;
  }
};

/**
 * Generate invite link
 * Create shareable invite link with user's invite code
 *
 * @param inviteCode User's invite code
 * @param baseUrl Base URL for the application (optional)
 * @returns Complete invite link
 */
export const generateInviteLink = (
  inviteCode: string,
  baseUrl?: string
): string => {
  const base =
    baseUrl || (typeof window !== "undefined" ? window.location.origin : "");
  return `${base}/?invite=${inviteCode}`;
};

/**
 * Get invite code sharing data
 * Generate data for sharing invite code via different methods
 *
 * @param inviteCode User's invite code
 * @returns Invite sharing data object
 */
export const getInviteCodeSharingData = (inviteCode: string) => {
  const inviteLink = generateInviteLink(inviteCode);

  return {
    inviteCode,
    inviteLink,
    title: "Join DIG Machine with My Invite Code",
    description: "Share to friends to register DIG Machine",
    shareText: `🎉 Join DIG Machine!\n\nUse my invite code: ${inviteCode}\nRegister now to get DIG Machine qualification!`,
    qrData: `DIG_INVITE:${inviteCode}`,
    usage: {
      title: "How to Use Invite Code",
      steps: [
        "New users enter this invite code during registration",
        "You will receive invite rewards after successful registration",
        "Invited users get special benefits",
      ],
    },
    benefits: {
      inviter: [
        "Earn commission from invited user activities",
        "Build your referral network",
        "Get recognition as top referrer",
      ],
      invitee: [
        "Get registration qualification (required after first 100 users)",
        "Potential bonus features",
        "Join community with referral benefits",
      ],
    },
  };
};

/**
 * Share invite code via Web Share API
 * Use native sharing functionality when available
 *
 * @param inviteCode User's invite code
 * @param options Sharing options
 * @returns Promise<boolean> Success status
 */
export const shareInviteCode = async (
  inviteCode: string,
  options: {
    title?: string;
    text?: string;
    url?: string;
  } = {}
): Promise<boolean> => {
  const sharingData = getInviteCodeSharingData(inviteCode);

  const shareData = {
    title: options.title || "DIG Machine Invitation",
    text: options.text || `🎉 Join DIG Machine! Use invite code: ${inviteCode}`,
    url: options.url || generateInviteLink(inviteCode),
  };

  try {
    if (typeof navigator !== "undefined" && navigator.share) {
      // Use native Web Share API
      await navigator.share(shareData);
      console.log("✅ Invite code shared successfully");
      return true;
    } else {
      // Fallback: copy to clipboard
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        const textToShare = `${shareData.text}\n${shareData.url}`;
        await navigator.clipboard.writeText(textToShare);
        console.log("✅ Invite information copied to clipboard");
        return true;
      }
    }
  } catch (error) {
    console.error("❌ Sharing failed:", error);
    return false;
  }

  return false;
};

/**
 * Copy invite code to clipboard
 * Simple copy functionality for invite code
 *
 * @param inviteCode User's invite code
 * @returns Promise<boolean> Success status
 */
export const copyInviteCode = async (inviteCode: string): Promise<boolean> => {
  try {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(inviteCode);
      console.log("✅ Invite code copied to clipboard");
      return true;
    }
  } catch (error) {
    console.error("❌ Copy failed:", error);
  }

  return false;
};

/**
 * Validate invite code format
 * Check if invite code matches expected format
 *
 * @param inviteCode Invite code to validate
 * @returns Boolean indicating if valid
 */
export const validateInviteCodeFormat = (inviteCode: string): boolean => {
  // Invite codes are typically 8 characters, alphanumeric uppercase
  const inviteCodeRegex = /^[A-Z0-9]{8}$/;
  return inviteCodeRegex.test(inviteCode);
};

/**
 * Get invite code display info
 * Format invite code for various display purposes
 *
 * @param inviteCode User's invite code
 * @returns Display information object
 */
export const getInviteCodeDisplayInfo = (inviteCode: string) => {
  const isValid = validateInviteCodeFormat(inviteCode);

  return {
    code: inviteCode,
    isValid,
    display: {
      formatted: inviteCode.toUpperCase(),
      chunks: inviteCode.match(/.{1,4}/g) || [inviteCode], // Split into 4-character chunks
      qrCode: `DIG_INVITE:${inviteCode}`,
      copyText: inviteCode,
      shareText: `Use my DIG Machine invite code: ${inviteCode}`,
    },
    actions: [
      {
        name: "Copy Code",
        action: "copy",
        description: "Copy invite code to clipboard",
      },
      {
        name: "Share Link",
        action: "share",
        description: "Share invite link with friends",
      },
      {
        name: "Generate QR",
        action: "qr",
        description: "Generate QR code for easy sharing",
      },
    ],
  };
};

/**
 * Get invite code statistics
 * Return statistics and information about invite code usage
 *
 * @param inviteCode User's invite code
 * @returns Statistics object (placeholder - actual data would come from backend)
 */
export const getInviteCodeStatistics = (inviteCode: string) => {
  // This would typically fetch real data from backend
  return {
    code: inviteCode,
    stats: {
      totalInvites: 0, // Total invitations sent
      successfulRegistrations: 0, // Successful registrations
      pendingInvites: 0, // Pending invitations
      conversionRate: 0, // Success rate percentage
    },
    rewards: {
      totalEarned: 0, // Total commission earned
      pendingRewards: 0, // Pending rewards
      currency: "USDT",
    },
    leaderboard: {
      rank: null, // User's rank in referral leaderboard
      topReferrer: false, // Whether user is top referrer
    },
    lastActivity: null, // Last invitation activity timestamp
  };
};
