import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, http } from "viem";
import { sepolia } from "viem/chains";
import { CONTRACT_ADDRESSES } from "@/lib/contracts";
import UserRegistryABI from "@/abis/UserRegistry.json";
import CampaignManagerABI from "@/abis/CampaignManager.json";

const client = createPublicClient({
  chain: sepolia,
  transport: http(process.env.NEXT_PUBLIC_RPC_URL || "https://1rpc.io/sepolia"),
});

export async function GET(request: NextRequest) {
  try {
    // Get platform statistics
    const [totalUsers, campaignCounter] = await Promise.all([
      client.readContract({
        address: CONTRACT_ADDRESSES.USER_REGISTRY as `0x${string}`,
        abi: UserRegistryABI,
        functionName: "getTotalUsers",
      }),
      client.readContract({
        address: CONTRACT_ADDRESSES.CAMPAIGN_MANAGER as `0x${string}`,
        abi: CampaignManagerABI,
        functionName: "campaignCounter",
      }),
    ]);

    return NextResponse.json({
      totalUsers: {
        totalBrands: Number((totalUsers as any)[0]),
        totalCreators: Number((totalUsers as any)[1]),
        verifiedBrands: Number((totalUsers as any)[2]),
        verifiedCreators: Number((totalUsers as any)[3]),
      },
      totalCampaigns: Number(campaignCounter),
      fetchedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching platform stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch platform statistics" },
      { status: 500 }
    );
  }
}
