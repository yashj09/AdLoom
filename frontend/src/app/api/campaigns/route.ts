import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, http } from "viem";
import { sepolia } from "viem/chains";
import { CONTRACT_ADDRESSES } from "@/lib/contracts";
import CampaignManagerABI from "@/abis/CampaignManager.json";

const client = createPublicClient({
  chain: sepolia,
  transport: http(process.env.NEXT_PUBLIC_RPC_URL || "https://rpc.sepolia.dev"),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");
    const status = searchParams.get("status"); // 'active', 'completed', etc.

    // Get total campaign count
    const campaignCounter = await client.readContract({
      address: CONTRACT_ADDRESSES.CAMPAIGN_MANAGER as `0x${string}`,
      abi: CampaignManagerABI,
      functionName: "campaignCounter",
    });

    const totalCampaigns = Number(campaignCounter);
    const campaigns = [];

    // Calculate range to fetch
    const startId = Math.max(1, totalCampaigns - offset - limit + 1);
    const endId = Math.max(1, totalCampaigns - offset);

    // Fetch campaigns in batch (in production, use multicall for efficiency)
    for (let i = endId; i >= startId; i--) {
      try {
        const campaign = await client.readContract({
          address: CONTRACT_ADDRESSES.CAMPAIGN_MANAGER as `0x${string}`,
          abi: CampaignManagerABI,
          functionName: "getCampaign",
          args: [BigInt(i)],
        });

        // Filter by status if specified
        if (status) {
          const campaignStatus = (campaign as any)[7]; // status field
          const statusMap = {
            active: 0,
            paused: 1,
            completed: 2,
            cancelled: 3,
          };
          if (campaignStatus !== statusMap[status as keyof typeof statusMap]) {
            continue;
          }
        }

        campaigns.push({
          id: i,
          campaign: campaign,
        });
      } catch (error) {
        console.error(`Error fetching campaign ${i}:`, error);
      }
    }

    return NextResponse.json({
      campaigns,
      pagination: {
        total: totalCampaigns,
        limit,
        offset,
        hasMore: startId > 1,
      },
      fetchedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    return NextResponse.json(
      { error: "Failed to fetch campaigns" },
      { status: 500 }
    );
  }
}
