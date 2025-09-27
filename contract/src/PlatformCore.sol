// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {CampaignManager} from "./CampaignManager.sol";
import {PaymentEscrow} from "./PaymentEscrow.sol";
import {UserRegistry} from "./UserRegistry.sol";
import {AIVerification} from "./AIVerification.sol";

contract PlatformCore is AccessControl, Pausable, ReentrancyGuard {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant BRAND_ROLE = keccak256("BRAND_ROLE");
    bytes32 public constant CREATOR_ROLE = keccak256("CREATOR_ROLE");
    bytes32 public constant AI_AGENT_ROLE = keccak256("AI_AGENT_ROLE");

    // Contract addresses
    address public campaignManager;
    address public paymentEscrow;
    address public userRegistry;
    address public aiVerification;

    // Platform configuration
    uint256 public platformFeeRate;
    address public feeReceiver;
    uint256 public minCampaignDuration;
    uint256 public maxCampaignDuration;

    // Events
    event PlatformConfigUpdated(
        string parameter,
        uint256 oldValue,
        uint256 newValue
    );
    event ContractAddressUpdated(
        string contractName,
        address oldAddress,
        address newAddress
    );
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

    function setContractAddresses(
        address _campaignManager,
        address _paymentEscrow,
        address _userRegistry,
        address _aiVerification
    ) external onlyRole(ADMIN_ROLE) {
        campaignManager = _campaignManager;
        paymentEscrow = _paymentEscrow;
        userRegistry = _userRegistry;
        aiVerification = _aiVerification;
    }

    function createCampaign(
        string memory requirements,
        uint256 paymentPerPost,
        uint256 maxPosts,
        uint256 deadline,
        string[] memory requiredHashtags,
        uint256 minFollowers,
        uint256 budgetAmount
    ) external whenNotPaused nonReentrant returns (uint256) {
        require(
            UserRegistry(userRegistry).isRegisteredBrand(msg.sender),
            "Not registered brand"
        );
        require(
            deadline > block.timestamp + minCampaignDuration,
            "Invalid deadline"
        );
        require(
            deadline < block.timestamp + maxCampaignDuration,
            "Deadline too far"
        );
        require(paymentPerPost > 0, "Payment must be positive");
        require(maxPosts > 0, "Max posts must be positive");
        require(
            budgetAmount >= paymentPerPost * maxPosts,
            "Insufficient budget"
        );

        // Create campaign
        uint256 campaignId = CampaignManager(campaignManager).createCampaign(
            msg.sender,
            requirements,
            paymentPerPost,
            maxPosts,
            deadline,
            requiredHashtags,
            minFollowers,
            budgetAmount
        );

        // Get PYUSD token from PaymentEscrow
        IERC20 pyusdToken = IERC20(PaymentEscrow(paymentEscrow).pyusdToken());

        // Transfer PYUSD from brand to escrow (brand must approve PlatformCore)
        require(
            pyusdToken.transferFrom(msg.sender, paymentEscrow, budgetAmount),
            "PYUSD transfer failed"
        );

        // Initialize escrow deposit
        PaymentEscrow(paymentEscrow).initializeCampaignDeposit(
            campaignId,
            budgetAmount,
            msg.sender
        );

        return campaignId;
    }

    function submitPost(
        uint256 campaignId,
        string memory postUrl,
        string[] memory requirements
    ) external whenNotPaused nonReentrant returns (uint256) {
        require(
            UserRegistry(userRegistry).isRegisteredCreator(msg.sender),
            "Not registered creator"
        );
        require(bytes(postUrl).length > 0, "Post URL required");

        // Get payment amount first
        uint256 paymentAmount = _getCampaignPaymentPerPost(campaignId);

        // Submit post to campaign manager
        uint256 submissionId = CampaignManager(campaignManager).submitPost(
            campaignId,
            postUrl,
            msg.sender
        );

        // Request verification WITH payment details (atomic operation)
        uint256 verificationId = AIVerification(aiVerification)
            .requestVerificationWithPayment(
                campaignId,
                msg.sender,
                postUrl,
                requirements,
                paymentAmount,
                submissionId
            );

        return verificationId;
    }

    function _getCampaignPaymentPerPost(
        uint256 campaignId
    ) internal view returns (uint256) {
        CampaignManager.Campaign memory campaign = CampaignManager(
            campaignManager
        ).getCampaign(campaignId);
        return campaign.paymentPerPost;
    }

    function updatePlatformFeeRate(
        uint256 newFeeRate
    ) external onlyRole(ADMIN_ROLE) {
        require(newFeeRate <= 1000, "Fee rate too high"); // Max 10%
        uint256 oldFeeRate = platformFeeRate;
        platformFeeRate = newFeeRate;
        emit PlatformConfigUpdated("platformFeeRate", oldFeeRate, newFeeRate);
    }

    function updateFeeReceiver(
        address newFeeReceiver
    ) external onlyRole(ADMIN_ROLE) {
        require(newFeeReceiver != address(0), "Invalid address");
        feeReceiver = newFeeReceiver;
    }

    function getPlatformConfig()
        external
        view
        returns (
            uint256 _platformFeeRate,
            address _feeReceiver,
            uint256 _minCampaignDuration,
            uint256 _maxCampaignDuration
        )
    {
        return (
            platformFeeRate,
            feeReceiver,
            minCampaignDuration,
            maxCampaignDuration
        );
    }

    function getContractAddresses()
        external
        view
        returns (
            address _campaignManager,
            address _paymentEscrow,
            address _userRegistry,
            address _aiVerification
        )
    {
        return (campaignManager, paymentEscrow, userRegistry, aiVerification);
    }
}
