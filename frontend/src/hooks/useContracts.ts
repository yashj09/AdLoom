// frontend/src/hooks/useContracts.ts
import React from "react";
import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { parseEther, formatEther, parseUnits, formatUnits } from "viem";
import {
  CONTRACT_ADDRESSES,
  UserType,
  CampaignStatus,
  VerificationStatus,
} from "@/lib/contracts";

// Import ABIs
import PlatformCoreABI from "@/abis/PlatformCore.json";
import UserRegistryABI from "@/abis/UserRegistry.json";
import CampaignManagerABI from "@/abis/CampaignManager.json";
import PaymentEscrowABI from "@/abis/PaymentEscrow.json";
import AIVerificationABI from "@/abis/AIVerification.json";

// ===============================
// USER REGISTRY HOOKS
// ===============================

export function useUserRegistry() {
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const registerBrand = async (
    companyName: string,
    description: string,
    websiteUrl: string,
    logoUrl: string,
    industries: string[],
    contactEmail: string
  ) => {
    return writeContract({
      address: CONTRACT_ADDRESSES.USER_REGISTRY,
      abi: UserRegistryABI,
      functionName: "registerBrand",
      args: [
        companyName,
        description,
        websiteUrl,
        logoUrl,
        industries,
        contactEmail,
      ],
    });
  };

  const registerCreator = async (
    username: string,
    displayName: string,
    bio: string,
    profileImageUrl: string,
    socialMedia: {
      twitter: string;
      instagram: string;
      tiktok: string;
      youtube: string;
      linkedin: string;
      website: string;
    },
    totalFollowers: number,
    categories: string[],
    languages: string[]
  ) => {
    return writeContract({
      address: CONTRACT_ADDRESSES.USER_REGISTRY,
      abi: UserRegistryABI,
      functionName: "registerCreator",
      args: [
        username,
        displayName,
        bio,
        profileImageUrl,
        socialMedia,
        BigInt(totalFollowers),
        categories,
        languages,
      ],
    });
  };

  return {
    registerBrand,
    registerCreator,
    isPending: isPending || isConfirming,
    isSuccess,
    hash,
  };
}

export function useUserProfile(address?: `0x${string}`) {
  const { data: userType } = useReadContract({
    address: CONTRACT_ADDRESSES.USER_REGISTRY,
    abi: UserRegistryABI,
    functionName: "userTypes",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const { data: brandData } = useReadContract({
    address: CONTRACT_ADDRESSES.USER_REGISTRY,
    abi: UserRegistryABI,
    functionName: "getBrand",
    args: address ? [address] : undefined,
    query: { enabled: !!address && userType === UserType.Brand },
  });

  const { data: creatorData } = useReadContract({
    address: CONTRACT_ADDRESSES.USER_REGISTRY,
    abi: UserRegistryABI,
    functionName: "getCreator",
    args: address ? [address] : undefined,
    query: { enabled: !!address && userType === UserType.Creator },
  });

  const { data: isRegisteredBrand } = useReadContract({
    address: CONTRACT_ADDRESSES.USER_REGISTRY,
    abi: UserRegistryABI,
    functionName: "isRegisteredBrand",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const { data: isRegisteredCreator } = useReadContract({
    address: CONTRACT_ADDRESSES.USER_REGISTRY,
    abi: UserRegistryABI,
    functionName: "isRegisteredCreator",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  // Removed debug logging

  return {
    userType,
    brandData,
    creatorData,
    isRegisteredBrand,
    isRegisteredCreator,
    isRegistered: isRegisteredBrand || isRegisteredCreator,
  };
}

// ===============================
// PLATFORM CORE HOOKS
// ===============================

export function usePlatformCore() {
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // PYUSD token address on Sepolia
  const PYUSD_ADDRESS = "0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9";

  const createCampaign = async (
    requirements: string,
    paymentPerPost: string, // in PYUSD (6 decimals)
    maxPosts: number,
    deadline: number, // timestamp
    requiredHashtags: string[],
    minFollowers: number,
    budgetAmount: string // in PYUSD (6 decimals)
  ) => {
    const paymentPerPostWei = parseUnits(paymentPerPost, 6);
    const budgetAmountWei = parseUnits(budgetAmount, 6);

    return writeContract({
      address: CONTRACT_ADDRESSES.PLATFORM_CORE,
      abi: PlatformCoreABI,
      functionName: "createCampaign",
      args: [
        requirements,
        paymentPerPostWei,
        maxPosts,
        deadline,
        requiredHashtags,
        minFollowers,
        budgetAmountWei,
      ],
    });
  };

  const approvePYUSD = async (amount: string) => {
    const amountWei = parseUnits(amount, 6);

    return writeContract({
      address: PYUSD_ADDRESS,
      abi: [
        {
          inputs: [
            { name: "spender", type: "address" },
            { name: "amount", type: "uint256" },
          ],
          name: "approve",
          outputs: [{ name: "", type: "bool" }],
          stateMutability: "nonpayable",
          type: "function",
        },
      ],
      functionName: "approve",
      args: [CONTRACT_ADDRESSES.PLATFORM_CORE, amountWei],
    });
  };

  const submitPost = async (
    campaignId: number,
    postUrl: string,
    requirements: string[]
  ) => {
    return writeContract({
      address: CONTRACT_ADDRESSES.PLATFORM_CORE,
      abi: PlatformCoreABI,
      functionName: "submitPost",
      args: [campaignId, postUrl, requirements],
    });
  };

  return {
    createCampaign,
    approvePYUSD,
    submitPost,
    isPending: isPending || isConfirming,
    isSuccess,
    hash,
  };
}

export function usePlatformConfig() {
  const { data: config } = useReadContract({
    address: CONTRACT_ADDRESSES.PLATFORM_CORE,
    abi: PlatformCoreABI,
    functionName: "getPlatformConfig",
  });

  const { data: contractAddresses } = useReadContract({
    address: CONTRACT_ADDRESSES.PLATFORM_CORE,
    abi: PlatformCoreABI,
    functionName: "getContractAddresses",
  });

  return {
    platformFeeRate: config ? (config as any)[0] : undefined,
    feeReceiver: config ? (config as any)[1] : undefined,
    minCampaignDuration: config ? (config as any)[2] : undefined,
    maxCampaignDuration: config ? (config as any)[3] : undefined,
    contractAddresses,
  };
}

// ===============================
// CAMPAIGN MANAGER HOOKS
// ===============================

export function useCampaignManager() {
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const acceptCampaign = async (campaignId: number) => {
    return writeContract({
      address: CONTRACT_ADDRESSES.CAMPAIGN_MANAGER,
      abi: CampaignManagerABI,
      functionName: "acceptCampaign",
      args: [campaignId],
    });
  };

  return {
    acceptCampaign,
    isPending: isPending || isConfirming,
    isSuccess,
    hash,
  };
}

export function useCampaign(campaignId?: number) {
  const { data: campaign } = useReadContract({
    address: CONTRACT_ADDRESSES.CAMPAIGN_MANAGER,
    abi: CampaignManagerABI,
    functionName: "getCampaign",
    args: campaignId !== undefined ? [campaignId] : undefined,
    query: { enabled: campaignId !== undefined },
  });

  const { data: submissions } = useReadContract({
    address: CONTRACT_ADDRESSES.CAMPAIGN_MANAGER,
    abi: CampaignManagerABI,
    functionName: "getCampaignSubmissions",
    args: campaignId !== undefined ? [campaignId] : undefined,
    query: { enabled: campaignId !== undefined },
  });

  return {
    campaign,
    submissions,
  };
}

export function useUserCampaigns(userAddress?: `0x${string}`) {
  const { data: brandCampaigns } = useReadContract({
    address: CONTRACT_ADDRESSES.CAMPAIGN_MANAGER,
    abi: CampaignManagerABI,
    functionName: "getBrandCampaigns",
    args: userAddress ? [userAddress] : undefined,
    query: { enabled: !!userAddress },
  });

  const { data: creatorSubmissions } = useReadContract({
    address: CONTRACT_ADDRESSES.CAMPAIGN_MANAGER,
    abi: CampaignManagerABI,
    functionName: "getCreatorSubmissions",
    args: userAddress ? [userAddress] : undefined,
    query: { enabled: !!userAddress },
  });

  return {
    brandCampaigns,
    creatorSubmissions,
  };
}

// ===============================
// PAYMENT ESCROW HOOKS
// ===============================

export function usePaymentEscrow() {
  const { data: pyusdToken } = useReadContract({
    address: CONTRACT_ADDRESSES.PAYMENT_ESCROW,
    abi: PaymentEscrowABI,
    functionName: "pyusdToken",
  });

  return {
    pyusdToken,
  };
}

export function useCampaignDeposit(campaignId?: number) {
  const { data: deposit } = useReadContract({
    address: CONTRACT_ADDRESSES.PAYMENT_ESCROW,
    abi: PaymentEscrowABI,
    functionName: "campaignDeposits",
    args: campaignId !== undefined ? [campaignId] : undefined,
    query: { enabled: campaignId !== undefined },
  });

  return {
    deposit: deposit
      ? {
          brand: (deposit as any)[0],
          totalAmount: formatUnits((deposit as any)[1], 6),
          remainingAmount: formatUnits((deposit as any)[2], 6),
          isActive: (deposit as any)[3],
        }
      : null,
  };
}

// ===============================
// UTILITY HOOKS
// ===============================

export function useContractStats() {
  const { data: totalUsers } = useReadContract({
    address: CONTRACT_ADDRESSES.USER_REGISTRY,
    abi: UserRegistryABI,
    functionName: "getTotalUsers",
  });

  const { data: campaignCounter } = useReadContract({
    address: CONTRACT_ADDRESSES.CAMPAIGN_MANAGER,
    abi: CampaignManagerABI,
    functionName: "campaignCounter",
  });

  return {
    totalUsers: totalUsers
      ? {
          totalBrands: Number((totalUsers as any)[0]),
          totalCreators: Number((totalUsers as any)[1]),
          verifiedBrands: Number((totalUsers as any)[2]),
          verifiedCreators: Number((totalUsers as any)[3]),
        }
      : null,
    totalCampaigns: campaignCounter ? Number(campaignCounter) : 0,
  };
}

// New hook for getting multiple campaigns efficiently
export function useActiveCampaigns(limit: number = 20) {
  const { data: campaignCounter } = useReadContract({
    address: CONTRACT_ADDRESSES.CAMPAIGN_MANAGER,
    abi: CampaignManagerABI,
    functionName: "campaignCounter",
  });

  const [campaigns, setCampaigns] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!campaignCounter) return;

    const fetchCampaigns = async () => {
      setLoading(true);
      setError(null);
      try {
        // Use the new dedicated API route for active campaigns
        const response = await fetch(`/api/campaigns/active?limit=${limit}`);
        if (response.ok) {
          const data = await response.json();
          setCampaigns(data.campaigns || []);
        } else {
          throw new Error("Failed to fetch campaigns");
        }
      } catch (error) {
        console.error("Failed to fetch campaigns:", error);
        setError(error instanceof Error ? error.message : "Unknown error");
        setCampaigns([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, [campaignCounter, limit]);

  return {
    campaigns,
    loading,
    error,
    totalCampaigns: campaignCounter ? Number(campaignCounter) : 0,
  };
}

// Transform contract campaign data to UI-friendly format
export function transformCampaignData(contractData: any, campaignId: number) {
  if (!contractData) return null;

  const now = Date.now() / 1000;
  const deadline = Number(contractData.deadline);
  const timeLeft = deadline - now;

  let deadlineText = "Expired";
  if (timeLeft > 0) {
    const days = Math.floor(timeLeft / (24 * 60 * 60));
    if (days > 0) {
      deadlineText = `${days} day${days > 1 ? "s" : ""} left`;
    } else {
      const hours = Math.floor(timeLeft / (60 * 60));
      deadlineText = `${hours} hour${hours > 1 ? "s" : ""} left`;
    }
  }

  // Parse requirements JSON if it's a valid JSON string
  let parsedRequirements;
  try {
    parsedRequirements = JSON.parse(contractData.requirements || "{}");
  } catch {
    parsedRequirements = {
      description: contractData.requirements || "No description available",
    };
  }

  return {
    id: campaignId.toString(),
    title:
      parsedRequirements.title ||
      parsedRequirements.description?.slice(0, 50) + "..." ||
      `Campaign #${campaignId}`,
    brand:
      contractData.brand?.slice(0, 6) + "..." + contractData.brand?.slice(-4) ||
      "Unknown",
    description: parsedRequirements.description || "No description available",
    payment: parseFloat(formatPYUSD(contractData.paymentPerPost)),
    currency: "PYUSD",
    deadline: deadlineText,
    location: parsedRequirements.location || "Remote",
    category: parsedRequirements.category || "General",
    difficulty:
      contractData.minFollowers > 100000
        ? "Hard"
        : contractData.minFollowers > 10000
        ? "Medium"
        : "Easy",
    requirements: {
      minFollowers: Number(contractData.minFollowers),
      platforms: parsedRequirements.platforms || ["Instagram"],
      contentType: parsedRequirements.contentTypes || ["Photo"],
    },
    matchScore: 85, // TODO: Calculate based on user profile
    participants: Number(contractData.currentPosts),
    maxParticipants: Number(contractData.maxPosts),
    status:
      contractData.status === 0
        ? "Open"
        : contractData.status === 1
        ? "Paused"
        : contractData.status === 2
        ? "Completed"
        : "Cancelled",
    postedDate: new Date(
      Number(contractData.createdAt) * 1000
    ).toLocaleDateString(),
    engagement: {
      views: Math.floor(Math.random() * 10000), // TODO: Get from actual metrics
      applications: Number(contractData.currentPosts),
    },
    requiredHashtags: contractData.requiredHashtags || [],
    totalBudget:
      parseFloat(formatPYUSD(contractData.paymentPerPost)) *
      Number(contractData.maxPosts),
  };
}

// Format helper functions
export const formatPYUSD = (value: bigint | string) => {
  return formatUnits(BigInt(value), 6);
};

export const parsePYUSD = (value: string) => {
  return parseUnits(value, 6);
};
