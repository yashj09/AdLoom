// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;
import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import { Pausable } from "@openzeppelin/contracts/utils/Pausable.sol";

interface ICampaignManager {
    function createCampaign(
        string memory requirements,
        uint256 paymentPerPost,
        uint256 maxPosts,
        uint256 deadline,
        string[] memory requiredHashtags,
        uint256 minFollowers
    ) external returns (uint256);
    
    function submitPost(uint256 campaignId, string memory postUrl) external returns (uint256);
}

interface IPaymentEscrow {
    function depositCampaignBudget(uint256 campaignId, uint256 amount) external;
    function executePayment(address creator, uint256 amount, uint256 campaignId) external;
}

interface IUserRegistry {
    function isRegisteredBrand(address user) external view returns (bool);
    function isRegisteredCreator(address user) external view returns (bool);
    function getUserReputation(address user) external view returns (uint256);
}

interface IAIVerification {
    function requestVerification(
        uint256 campaignId,
        address creator,
        string memory postUrl,
        string[] memory requirements
    ) external returns (uint256);
}


contract PlatformCore is 
    AccessControl,
    Pausable,
    ReentrancyGuard
{
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant BRAND_ROLE = keccak256("BRAND_ROLE");
    bytes32 public constant CREATOR_ROLE = keccak256("CREATOR_ROLE");
    bytes32 public constant AI_AGENT_ROLE = keccak256("AI_AGENT_ROLE");

    // Contract addresses
    address public campaignManager;
    address public paymentEscrow;
    address public userRegistry;
    address public aiVerification;
    address public reputationSystem;
    address public disputeResolution;

    // Platform configuration
    uint256 public platformFeeRate; 
    address public feeReceiver;
    uint256 public minCampaignDuration; 
    uint256 public maxCampaignDuration; 

    // Events
    event PlatformConfigUpdated(string parameter, uint256 oldValue, uint256 newValue);
    event ContractAddressUpdated(string contractName, address oldAddress, address newAddress);
    event EmergencyAction(string action, address executor, uint256 timestamp);

    constructor(
        address _admin,
        uint256 _platformFeeRate,
        address _feeReceiver
    ) {
        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(ADMIN_ROLE, _admin);

        platformFeeRate = _platformFeeRate;
        feeReceiver = _feeReceiver;
        minCampaignDuration = 1 days;
        maxCampaignDuration = 365 days;
    }

    /**
     * Set contract addresses after deployment
     */
    function setContractAddresses(
        address _campaignManager,
        address _paymentEscrow,
        address _userRegistry,
        address _aiVerification,
        address _reputationSystem,
        address _disputeResolution
    ) external onlyRole(ADMIN_ROLE) {
        campaignManager = _campaignManager;
        paymentEscrow = _paymentEscrow;
        userRegistry = _userRegistry;
        aiVerification = _aiVerification;
        reputationSystem = _reputationSystem;
        disputeResolution = _disputeResolution;
    }

    /**
     * Create a new campaign (Brand flow)
     */
    function createCampaign(
        string memory requirements,
        uint256 paymentPerPost,
        uint256 maxPosts,
        uint256 deadline,
        string[] memory requiredHashtags,
        uint256 minFollowers,
        uint256 budgetAmount
    ) external whenNotPaused nonReentrant returns (uint256) {
        require(IUserRegistry(userRegistry).isRegisteredBrand(msg.sender), "Not registered brand");
        require(deadline > block.timestamp + minCampaignDuration, "Invalid deadline");
        require(deadline < block.timestamp + maxCampaignDuration, "Deadline too far");
        require(paymentPerPost > 0, "Payment must be positive");
        require(maxPosts > 0, "Max posts must be positive");
        require(budgetAmount >= paymentPerPost * maxPosts, "Insufficient budget");

        // Create campaign
        uint256 campaignId = ICampaignManager(campaignManager).createCampaign(
            requirements,
            paymentPerPost,
            maxPosts,
            deadline,
            requiredHashtags,
            minFollowers
        );

        // Lock payment in escrow
        IPaymentEscrow(paymentEscrow).depositCampaignBudget(campaignId, budgetAmount);

        return campaignId;
    }

  
    function submitPost(
        uint256 campaignId,
        string memory postUrl,
        string[] memory requirements
    ) external whenNotPaused nonReentrant returns (uint256) {
        require(IUserRegistry(userRegistry).isRegisteredCreator(msg.sender), "Not registered creator");
        require(bytes(postUrl).length > 0, "Post URL required");

        // Submit post
        uint256 submissionId = ICampaignManager(campaignManager).submitPost(campaignId, postUrl);

        // Request AI verification
        uint256 verificationId = IAIVerification(aiVerification).requestVerification(
            campaignId,
            msg.sender,
            postUrl,
            requirements
        );

        return verificationId;
    }

  
    function updatePlatformFeeRate(uint256 newFeeRate) external onlyRole(ADMIN_ROLE) {
        require(newFeeRate <= 1000, "Fee rate too high"); // Max 10%
        uint256 oldFeeRate = platformFeeRate;
        platformFeeRate = newFeeRate;
        emit PlatformConfigUpdated("platformFeeRate", oldFeeRate, newFeeRate);
    }

    function updateFeeReceiver(address newFeeReceiver) external onlyRole(ADMIN_ROLE) {
        require(newFeeReceiver != address(0), "Invalid address");
        feeReceiver = newFeeReceiver;
    }

 
    
    function getPlatformConfig() external view returns (
        uint256 _platformFeeRate,
        address _feeReceiver,
        uint256 _minCampaignDuration,
        uint256 _maxCampaignDuration
    ) {
        return (platformFeeRate, feeReceiver, minCampaignDuration, maxCampaignDuration);
    }

    function getContractAddresses() external view returns (
        address _campaignManager,
        address _paymentEscrow,
        address _userRegistry,
        address _aiVerification,
        address _reputationSystem,
        address _disputeResolution
    ) {
        return (campaignManager, paymentEscrow, userRegistry, aiVerification, reputationSystem, disputeResolution);
    }

}