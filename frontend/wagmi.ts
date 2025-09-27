import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { sepolia } from "wagmi/chains";

export const config = getDefaultConfig({
  appName: "OnChain Marketing Platform",
  projectId: "f2852f28d4889451cbf6ef6a35a2206c", // Fallback for development
  chains: [sepolia],
  ssr: true,
});
