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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const resolvedParams = await params;
    const userAddress = resolvedParams.address as `0x${string}`;

    // Validate address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(userAddress)) {
      return NextResponse.json(
        { error: "Invalid address format" },
        { status: 400 }
      );
    }

    // Get user type
    const userType = await client.readContract({
      address: CONTRACT_ADDRESSES.USER_REGISTRY as `0x${string}`,
      abi: UserRegistryABI,
      functionName: "userTypes",
      args: [userAddress],
    });

    let userData = null;
    let campaigns = null;

    if (userType === 1) {
      // Brand
      // Get brand data
      userData = await client.readContract({
        address: CONTRACT_ADDRESSES.USER_REGISTRY as `0x${string}`,
        abi: UserRegistryABI,
        functionName: "getBrand",
        args: [userAddress],
      });

      // Get brand campaigns
      campaigns = await client.readContract({
        address: CONTRACT_ADDRESSES.CAMPAIGN_MANAGER as `0x${string}`,
        abi: CampaignManagerABI,
        functionName: "getBrandCampaigns",
        args: [userAddress],
      });
    } else if (userType === 2) {
      // Creator
      // Get creator data
      userData = await client.readContract({
        address: CONTRACT_ADDRESSES.USER_REGISTRY as `0x${string}`,
        abi: UserRegistryABI,
        functionName: "getCreator",
        args: [userAddress],
      });

      // Get creator submissions
      campaigns = await client.readContract({
        address: CONTRACT_ADDRESSES.CAMPAIGN_MANAGER as `0x${string}`,
        abi: CampaignManagerABI,
        functionName: "getCreatorSubmissions",
        args: [userAddress],
      });
    }

    return NextResponse.json({
      address: userAddress,
      userType: Number(userType),
      userData,
      campaigns,
      fetchedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching user data:", error);
    return NextResponse.json(
      { error: "Failed to fetch user data" },
      { status: 500 }
    );
  }
}
