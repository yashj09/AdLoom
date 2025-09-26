// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import  "forge-std/Script.sol";
import "forge-std/console.sol";
import "../src/PlatformCore.sol";
import  "../src/CampaignManager.sol";
import  "../src/PaymentEscrow.sol";
import  "../src/UserRegistry.sol";
import  "../src/AIVerification.sol";

contract DeployScript is Script {
    // Network configurations
    struct NetworkConfig {
        address pyusdToken;
        uint256 platformFeeRate; // In basis points (100 = 1%)
        address feeReceiver;
        address admin;
    }

    // Deployed contract addresses
    struct DeployedContracts {
        address platformCore;
        address campaignManager;
        address paymentEscrow;
        address userRegistry;
        address aiVerification;
    }

    // Network configurations
    mapping(uint256 => NetworkConfig) public networkConfigs;

    function setUp() public {
        // Ethereum Sepolia
        networkConfigs[11155111] = NetworkConfig({
            pyusdToken: 0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9, // PYUSD testnet (if available)
            platformFeeRate: 250, // 2.5%
            feeReceiver: msg.sender,
            admin: msg.sender
        });
    }

    function run() public returns (DeployedContracts memory) {
        uint256 chainId = block.chainid;
        NetworkConfig memory config = getNetworkConfig(chainId);
        
        console.log("Deploying to chain ID:", chainId);
        console.log("Admin:", config.admin);
        console.log("Fee Rate:", config.platformFeeRate);

        vm.startBroadcast();

        DeployedContracts memory contracts = deployAllContracts(config);
        
        // Setup contracts with proper addresses and roles
        setupContracts(contracts, config);

        vm.stopBroadcast();

        // Log all deployed addresses
        logDeployedAddresses(contracts);
        
        return contracts;
    }

    function getNetworkConfig(uint256 chainId) internal view returns (NetworkConfig memory) {
        NetworkConfig memory config = networkConfigs[chainId];
        
        // If no specific config exists, use default values
        if (config.admin == address(0)) {
            config = NetworkConfig({
                pyusdToken: address(0), // Will deploy mock
                platformFeeRate: 250, // 2.5%
                feeReceiver: msg.sender,
                admin: msg.sender
            });
        }
        
        return config;
    }

    function deployAllContracts(NetworkConfig memory config) 
        internal 
        returns (DeployedContracts memory contracts) 
    {
        console.log("Starting contract deployment...");

        // 1. Deploy UserRegistry
        console.log("Deploying UserRegistry...");
        contracts.userRegistry = address(new UserRegistry(config.admin));
        console.log("UserRegistry deployed at:", contracts.userRegistry);

        // 2. Deploy CampaignManager
        console.log("Deploying CampaignManager...");
        contracts.campaignManager = address(new CampaignManager(config.admin));
        console.log("CampaignManager deployed at:", contracts.campaignManager);

        // 3. Deploy PaymentEscrow
        console.log("Deploying PaymentEscrow...");
        contracts.paymentEscrow = address(new PaymentEscrow(
            config.admin,
            config.pyusdToken,
            config.feeReceiver,
            config.platformFeeRate
        ));
        console.log("PaymentEscrow deployed at:", contracts.paymentEscrow);

        // 4. Deploy AIVerification
        console.log("Deploying AIVerification...");
        contracts.aiVerification = address(new AIVerification(
            config.admin,
            contracts.campaignManager,
            contracts.paymentEscrow
        ));
        console.log("AIVerification deployed at:", contracts.aiVerification);

        // 5. Deploy PlatformCore (main orchestrator)
        console.log("Deploying PlatformCore...");
        contracts.platformCore = address(new PlatformCore(
            config.admin,
            config.platformFeeRate,
            config.feeReceiver
        ));
        console.log("PlatformCore deployed at:", contracts.platformCore);
    }

    function setupContracts(DeployedContracts memory contracts, NetworkConfig memory config) internal {
        console.log("Setting up contract integrations...");

        // Set contract addresses in PlatformCore
        PlatformCore(contracts.platformCore).setContractAddresses(
            contracts.campaignManager,
            contracts.paymentEscrow,
            contracts.userRegistry,
            contracts.aiVerification
        );
        console.log("PlatformCore addresses configured");

        // Grant PLATFORM_ROLE to PlatformCore on all other contracts
        bytes32 PLATFORM_ROLE = keccak256("PLATFORM_ROLE");
        
        CampaignManager(contracts.campaignManager).grantRole(PLATFORM_ROLE, contracts.platformCore);
        console.log("CampaignManager: PLATFORM_ROLE granted to PlatformCore");
        
        PaymentEscrow(contracts.paymentEscrow).grantRole(PLATFORM_ROLE, contracts.platformCore);
        console.log("PaymentEscrow: PLATFORM_ROLE granted to PlatformCore");
        
        UserRegistry(contracts.userRegistry).grantRole(PLATFORM_ROLE, contracts.platformCore);
        console.log("UserRegistry: PLATFORM_ROLE granted to PlatformCore");
        
        AIVerification(contracts.aiVerification).grantRole(PLATFORM_ROLE, contracts.platformCore);
        console.log("AIVerification: PLATFORM_ROLE granted to PlatformCore");
        
        // Grant AI_AGENT_ROLE to deployer for testing purposes
        AIVerification(contracts.aiVerification).grantAIAgentRole(msg.sender);
        console.log("AIVerification: AI_AGENT_ROLE granted to deployer for testing");

        console.log("All contract roles configured successfully!");
        console.log("All contracts setup completed!");
    }



    function logDeployedAddresses(DeployedContracts memory contracts) internal view {
        console.log("\n=== DEPLOYED CONTRACTS ===");
        console.log("PlatformCore:", contracts.platformCore);
        console.log("CampaignManager:", contracts.campaignManager);
        console.log("PaymentEscrow:", contracts.paymentEscrow);
        console.log("UserRegistry:", contracts.userRegistry);
        console.log("AIVerification:", contracts.aiVerification);
        console.log("============================\n");
    }

    // Function to verify deployment
    function verifyDeployment(DeployedContracts memory contracts) internal view {
        console.log("Running deployment verification...");
        
        // Verify PlatformCore has correct addresses
        (
            address _campaignManager,
            address _paymentEscrow,
            address _userRegistry,
            address _aiVerification
        ) = PlatformCore(contracts.platformCore).getContractAddresses();

        require(_campaignManager == contracts.campaignManager, "CampaignManager address mismatch");
        require(_paymentEscrow == contracts.paymentEscrow, "PaymentEscrow address mismatch");
        require(_userRegistry == contracts.userRegistry, "UserRegistry address mismatch");
        require(_aiVerification == contracts.aiVerification, "AIVerification address mismatch");

        // Verify roles are properly set
        bytes32 PLATFORM_ROLE = keccak256("PLATFORM_ROLE");
        bytes32 ADMIN_ROLE = keccak256("ADMIN_ROLE");
        
        require(CampaignManager(contracts.campaignManager).hasRole(PLATFORM_ROLE, contracts.platformCore), "CampaignManager: PLATFORM_ROLE not set");
        require(PaymentEscrow(contracts.paymentEscrow).hasRole(PLATFORM_ROLE, contracts.platformCore), "PaymentEscrow: PLATFORM_ROLE not set");
        require(UserRegistry(contracts.userRegistry).hasRole(PLATFORM_ROLE, contracts.platformCore), "UserRegistry: PLATFORM_ROLE not set");
        require(AIVerification(contracts.aiVerification).hasRole(PLATFORM_ROLE, contracts.platformCore), "AIVerification: PLATFORM_ROLE not set");

        // Verify admin roles
        require(PlatformCore(contracts.platformCore).hasRole(ADMIN_ROLE, msg.sender), "PlatformCore: ADMIN_ROLE not set");
        require(CampaignManager(contracts.campaignManager).hasRole(ADMIN_ROLE, msg.sender), "CampaignManager: ADMIN_ROLE not set");
        require(PaymentEscrow(contracts.paymentEscrow).hasRole(ADMIN_ROLE, msg.sender), "PaymentEscrow: ADMIN_ROLE not set");
        require(UserRegistry(contracts.userRegistry).hasRole(ADMIN_ROLE, msg.sender), "UserRegistry: ADMIN_ROLE not set");
        require(AIVerification(contracts.aiVerification).hasRole(ADMIN_ROLE, msg.sender), "AIVerification: ADMIN_ROLE not set");
        
        // Verify AI_AGENT_ROLE was granted for testing
        bytes32 AI_AGENT_ROLE = keccak256("AI_AGENT_ROLE");
        require(AIVerification(contracts.aiVerification).hasRole(AI_AGENT_ROLE, msg.sender), "AIVerification: AI_AGENT_ROLE not set for deployer");

        console.log("Address verification: PASSED");
        console.log("Role verification: PASSED");
        console.log("Integration verification: PASSED");
        console.log("ALL VERIFICATIONS PASSED - DEPLOYMENT SUCCESSFUL!");
    }
}
