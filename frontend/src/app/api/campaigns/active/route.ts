import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, http } from "viem";
import { sepolia } from "viem/chains";
import { CONTRACT_ADDRESSES, CampaignStatus } from "@/lib/contracts";
import CampaignManagerABI from "@/abis/CampaignManager.json";
import { formatUnits } from "viem";

const client = createPublicClient({
  chain: sepolia,
  transport: http(process.env.NEXT_PUBLIC_RPC_URL || "https://rpc.sepolia.dev"),
});

// Transform contract data to UI-friendly format
function transformCampaignData(contractData: any, campaignId: number) {
  if (!contractData) return null;

  const now = Date.now() / 1000;
  const deadline = Number(contractData[3]); // deadline field
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
    parsedRequirements = JSON.parse(contractData[1] || "{}"); // requirements field
  } catch {
    parsedRequirements = {
      description: contractData[1] || "No description available",
    };
  }

  return {
    id: campaignId.toString(),
    title:
      parsedRequirements.title ||
      parsedRequirements.description?.slice(0, 50) + "..." ||
      `Campaign #${campaignId}`,
    brand:
      contractData[0]?.slice(0, 6) + "..." + contractData[0]?.slice(-4) ||
      "Unknown",
    description: parsedRequirements.description || "No description available",
    payment: parseFloat(formatUnits(BigInt(contractData[2]), 6)), // paymentPerPost
    currency: "PYUSD",
    deadline: deadlineText,
    location: parsedRequirements.location || "Remote",
    category: parsedRequirements.category || "General",
    difficulty:
      Number(contractData[6]) > 100000
        ? "Hard"
        : Number(contractData[6]) > 10000
        ? "Medium"
        : "Easy",
    requirements: {
      minFollowers: Number(contractData[6]),
      platforms: parsedRequirements.platforms || ["Instagram"],
      contentType: parsedRequirements.contentTypes || ["Photo"],
    },
    participants: Number(contractData[5]), // currentPosts
    maxParticipants: Number(contractData[4]), // maxPosts
    status:
      contractData[7] === 0
        ? "Open"
        : contractData[7] === 1
        ? "Paused"
        : contractData[7] === 2
        ? "Completed"
        : "Cancelled",
    postedDate: new Date(Number(contractData[8]) * 1000).toLocaleDateString(),
    engagement: {
      views: Math.floor(Math.random() * 10000), // TODO: Get from actual metrics
      applications: Number(contractData[5]),
    },
    requiredHashtags: contractData[9] || [],
    totalBudget:
      parseFloat(formatUnits(BigInt(contractData[2]), 6)) *
      Number(contractData[4]),
    // Contract fields for reference:
    // [0] brand
    // [1] requirements
    // [2] paymentPerPost
    // [3] deadline
    // [4] maxPosts
    // [5] currentPosts
    // [6] minFollowers
    // [7] status
    // [8] createdAt
    // [9] requiredHashtags
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);

    // Get total campaign count
    const campaignCounter = await client.readContract({
      address: CONTRACT_ADDRESSES.CAMPAIGN_MANAGER as `0x${string}`,
      abi: CampaignManagerABI,
      functionName: "campaignCounter",
    });

    const totalCampaigns = Number(campaignCounter);
    const activeCampaigns = [];

    // Fetch campaigns in reverse order (newest first)
    const startId = Math.max(1, totalCampaigns - limit + 1);
    const endId = totalCampaigns;

    for (let i = endId; i >= startId; i--) {
      try {
        const campaign = await client.readContract({
          address: CONTRACT_ADDRESSES.CAMPAIGN_MANAGER as `0x${string}`,
          abi: CampaignManagerABI,
          functionName: "getCampaign",
          args: [BigInt(i)],
        });

        // Only include active campaigns
        if ((campaign as any)[7] === CampaignStatus.Active) {
          const transformedCampaign = transformCampaignData(campaign, i);
          if (transformedCampaign) {
            activeCampaigns.push(transformedCampaign);
          }
        }
      } catch (error) {
        console.error(`Error fetching campaign ${i}:`, error);
      }
    }

    return NextResponse.json({
      campaigns: activeCampaigns,
      totalActive: activeCampaigns.length,
      totalCampaigns,
      fetchedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching active campaigns:", error);
    return NextResponse.json(
      { error: "Failed to fetch active campaigns" },
      { status: 500 }
    );
  }
}
