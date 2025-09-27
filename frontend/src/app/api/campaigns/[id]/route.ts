import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, http } from "viem";
import { sepolia } from "viem/chains";
import { CONTRACT_ADDRESSES } from "@/lib/contracts";
import CampaignManagerABI from "@/abis/CampaignManager.json";

const client = createPublicClient({
  chain: sepolia,
  transport: http(process.env.NEXT_PUBLIC_RPC_URL || "https://1rpc.io/sepolia"),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const campaignId = parseInt(resolvedParams.id);

    if (isNaN(campaignId) || campaignId <= 0) {
      return NextResponse.json(
        { error: "Invalid campaign ID" },
        { status: 400 }
      );
    }
    // Fetch campaign data from smart contract
    const campaign = await client.readContract({
      address: CONTRACT_ADDRESSES.CAMPAIGN_MANAGER as `0x${string}`,
      abi: CampaignManagerABI,
      functionName: "getCampaign",
      args: [BigInt(campaignId)],
    });

    // Fetch campaign submissions
    const submissions = await client.readContract({
      address: CONTRACT_ADDRESSES.CAMPAIGN_MANAGER as `0x${string}`,
      abi: CampaignManagerABI,
      functionName: "getCampaignSubmissions",
      args: [BigInt(campaignId)],
    });

    return NextResponse.json({
      id: campaignId,
      campaign,
      submissions,
      fetchedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching campaign:", error);
    return NextResponse.json(
      { error: "Failed to fetch campaign data" },
      { status: 500 }
    );
  }
}
