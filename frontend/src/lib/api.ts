// frontend/src/lib/api.ts - Client-side API utilities
export const apiClient = {
  // Get campaign by ID
  getCampaign: async (campaignId: number) => {
    const response = await fetch(`/api/campaigns/${campaignId}`);
    if (!response.ok) {
      throw new Error("Failed to fetch campaign");
    }
    return response.json();
  },

  // Get campaigns with pagination
  getCampaigns: async (params?: {
    limit?: number;
    offset?: number;
    status?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.offset) searchParams.set("offset", params.offset.toString());
    if (params?.status) searchParams.set("status", params.status);

    const response = await fetch(`/api/campaigns?${searchParams}`);
    if (!response.ok) {
      throw new Error("Failed to fetch campaigns");
    }
    return response.json();
  },

  // Get user data
  getUser: async (address: string) => {
    const response = await fetch(`/api/user/${address}`);
    if (!response.ok) {
      throw new Error("Failed to fetch user data");
    }
    return response.json();
  },

  // Get platform statistics
  getStats: async () => {
    const response = await fetch("/api/stats");
    if (!response.ok) {
      throw new Error("Failed to fetch platform stats");
    }
    return response.json();
  },
};

// React hooks for API data
import { useQuery } from "@tanstack/react-query";

export const useApiCampaign = (campaignId: number) => {
  return useQuery({
    queryKey: ["campaign", campaignId],
    queryFn: () => apiClient.getCampaign(campaignId),
    enabled: campaignId > 0,
    staleTime: 30000, // 30 seconds
  });
};

export const useApiCampaigns = (params?: {
  limit?: number;
  offset?: number;
  status?: string;
}) => {
  return useQuery({
    queryKey: ["campaigns", params],
    queryFn: () => apiClient.getCampaigns(params),
    staleTime: 60000, // 1 minute
  });
};

export const useApiUser = (address?: string) => {
  return useQuery({
    queryKey: ["user", address],
    queryFn: () => apiClient.getUser(address!),
    enabled: !!address,
    staleTime: 300000, // 5 minutes
  });
};

export const useApiStats = () => {
  return useQuery({
    queryKey: ["platform-stats"],
    queryFn: apiClient.getStats,
    staleTime: 300000, // 5 minutes
  });
};
