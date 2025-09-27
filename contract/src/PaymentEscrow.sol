// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

contract PaymentEscrow is AccessControl, ReentrancyGuard {
    using SafeERC20 for IERC20;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant PLATFORM_ROLE = keccak256("PLATFORM_ROLE");

    // PYUSD token contract
    IERC20 public pyusdToken;

    struct EscrowDeposit {
        uint256 campaignId;
        address brand;
        uint256 totalAmount; // Total PYUSD deposited
        uint256 reservedAmount; // Amount reserved for pending posts
        uint256 paidAmount; // Amount already paid out
        uint256 platformFeeRate; // Fee rate at time of deposit
        bool isActive;
        uint256 depositedAt;
    }

    struct PayoutRecord {
        uint256 payoutId;
        address creator;
        uint256 campaignId;
        uint256 submissionId;
        uint256 grossAmount; // Amount before fees
        uint256 platformFee; // Platform fee deducted
        uint256 netAmount; // Amount sent to creator
        uint256 timestamp;
        bool executed;
    }

    struct PlatformStats {
        uint256 totalVolume; // Total PYUSD processed
        uint256 totalFees; // Total fees collected
        uint256 totalPayouts; // Total paid to creators
        uint256 activeCampaigns; // Number of active campaigns
    }

    // Storage
    uint256 private payoutCounter;
    mapping(uint256 => EscrowDeposit) public escrowDeposits;
    mapping(uint256 => PayoutRecord) public payoutRecords;
    mapping(address => uint256) public creatorEarnings;
    mapping(address => uint256) public brandSpending;

    PlatformStats public platformStats;
    address public feeReceiver;
    uint256 public platformFeeRate;

    // Events
    event CampaignBudgetDeposited(
        uint256 indexed campaignId,
        address indexed brand,
        uint256 amount,
        uint256 feeRate
    );

    event PaymentReserved(
        uint256 indexed campaignId,
        uint256 indexed submissionId,
        uint256 amount
    );

    event PaymentExecuted(
        uint256 indexed payoutId,
        uint256 indexed campaignId,
        address indexed creator,
        uint256 grossAmount,
        uint256 platformFee,
        uint256 netAmount
    );

    event FundsRefunded(
        uint256 indexed campaignId,
        address indexed brand,
        uint256 amount,
        string reason
    );

    event PlatformFeesWithdrawn(address indexed receiver, uint256 amount);

    event EmergencyWithdrawal(
        uint256 indexed campaignId,
        address indexed brand,
        uint256 amount
    );

    constructor(
        address _admin,
        address _pyusdToken,
        address _feeReceiver,
        uint256 _platformFeeRate
    ) {
        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(ADMIN_ROLE, _admin);

        pyusdToken = IERC20(_pyusdToken);
        feeReceiver = _feeReceiver;
        platformFeeRate = _platformFeeRate;
    }

    function depositCampaignBudget(
        uint256 campaignId,
        uint256 amount,
        address brand
    ) external onlyRole(PLATFORM_ROLE) nonReentrant {
        require(amount > 0, "Amount must be positive");
        require(
            escrowDeposits[campaignId].campaignId == 0,
            "Campaign already has deposit"
        );

        // Transfer PYUSD from brand to escrow
        pyusdToken.safeTransferFrom(brand, address(this), amount);

        // Create escrow deposit
        escrowDeposits[campaignId] = EscrowDeposit({
            campaignId: campaignId,
            brand: brand,
            totalAmount: amount,
            reservedAmount: 0,
            paidAmount: 0,
            platformFeeRate: platformFeeRate,
            isActive: true,
            depositedAt: block.timestamp
        });

        // Update stats
        platformStats.totalVolume += amount;
        platformStats.activeCampaigns++;
        brandSpending[brand] += amount;

        emit CampaignBudgetDeposited(
            campaignId,
            brand,
            amount,
            platformFeeRate
        );
    }
    function initializeCampaignDeposit(
        uint256 campaignId,
        uint256 amount,
        address brand
    ) external onlyRole(PLATFORM_ROLE) {
        require(amount > 0, "Amount must be positive");
        require(
            escrowDeposits[campaignId].campaignId == 0,
            "Campaign already has deposit"
        );

        // PYUSD already transferred by PlatformCore, just initialize record
        escrowDeposits[campaignId] = EscrowDeposit({
            campaignId: campaignId,
            brand: brand,
            totalAmount: amount,
            reservedAmount: 0,
            paidAmount: 0,
            platformFeeRate: platformFeeRate,
            isActive: true,
            depositedAt: block.timestamp
        });

        // Update stats
        platformStats.totalVolume += amount;
        platformStats.activeCampaigns++;
        brandSpending[brand] += amount;

        emit CampaignBudgetDeposited(
            campaignId,
            brand,
            amount,
            platformFeeRate
        );
    }
    function reservePayment(
        uint256 campaignId,
        uint256 submissionId,
        uint256 amount
    ) external onlyRole(PLATFORM_ROLE) {
        EscrowDeposit storage deposit = escrowDeposits[campaignId];
        require(deposit.isActive, "Escrow not active");
        require(
            deposit.totalAmount >=
                deposit.reservedAmount + deposit.paidAmount + amount,
            "Insufficient funds"
        );

        deposit.reservedAmount += amount;

        emit PaymentReserved(campaignId, submissionId, amount);
    }

    function executePayment(
        address creator,
        uint256 amount,
        uint256 campaignId,
        uint256 submissionId
    ) external onlyRole(PLATFORM_ROLE) nonReentrant {
        EscrowDeposit storage deposit = escrowDeposits[campaignId];
        require(deposit.isActive, "Escrow not active");
        require(deposit.reservedAmount >= amount, "Amount not reserved");

        // Calculate fees
        uint256 platformFee = (amount * deposit.platformFeeRate) / 10000;
        uint256 netAmount = amount - platformFee;

        payoutCounter++;
        uint256 payoutId = payoutCounter;

        // Create payout record
        payoutRecords[payoutId] = PayoutRecord({
            payoutId: payoutId,
            creator: creator,
            campaignId: campaignId,
            submissionId: submissionId,
            grossAmount: amount,
            platformFee: platformFee,
            netAmount: netAmount,
            timestamp: block.timestamp,
            executed: true
        });

        // Update escrow state
        deposit.reservedAmount -= amount;
        deposit.paidAmount += amount;

        // Update stats
        platformStats.totalFees += platformFee;
        platformStats.totalPayouts += netAmount;
        creatorEarnings[creator] += netAmount;

        // Transfer PYUSD to creator
        pyusdToken.safeTransfer(creator, netAmount);

        emit PaymentExecuted(
            payoutId,
            campaignId,
            creator,
            amount,
            platformFee,
            netAmount
        );
    }

    function releaseReservation(
        uint256 campaignId,
        uint256 amount
    ) external onlyRole(PLATFORM_ROLE) {
        EscrowDeposit storage deposit = escrowDeposits[campaignId];
        require(deposit.isActive, "Escrow not active");
        require(deposit.reservedAmount >= amount, "Amount not reserved");

        deposit.reservedAmount -= amount;
    }

    function refundUnusedFunds(
        uint256 campaignId,
        string memory reason
    ) external nonReentrant {
        EscrowDeposit storage deposit = escrowDeposits[campaignId];
        require(
            deposit.brand == msg.sender || hasRole(ADMIN_ROLE, msg.sender),
            "Unauthorized"
        );
        require(deposit.isActive, "Escrow not active");

        uint256 availableAmount = deposit.totalAmount -
            deposit.reservedAmount -
            deposit.paidAmount;
        require(availableAmount > 0, "No funds to refund");

        deposit.isActive = false;
        platformStats.activeCampaigns--;

        // Transfer remaining PYUSD back to brand
        pyusdToken.safeTransfer(deposit.brand, availableAmount);

        emit FundsRefunded(campaignId, deposit.brand, availableAmount, reason);
    }

    function withdrawPlatformFees(
        uint256 amount
    ) external onlyRole(ADMIN_ROLE) nonReentrant {
        require(amount > 0, "Amount must be positive");
        require(
            pyusdToken.balanceOf(address(this)) >= amount,
            "Insufficient balance"
        );

        pyusdToken.safeTransfer(feeReceiver, amount);

        emit PlatformFeesWithdrawn(feeReceiver, amount);
    }

    function updatePlatformFeeRate(
        uint256 newFeeRate
    ) external onlyRole(ADMIN_ROLE) {
        require(newFeeRate <= 1000, "Fee rate too high"); // Max 10%
        platformFeeRate = newFeeRate;
    }

    function updateFeeReceiver(
        address newFeeReceiver
    ) external onlyRole(ADMIN_ROLE) {
        require(newFeeReceiver != address(0), "Invalid address");
        feeReceiver = newFeeReceiver;
    }

    function getEscrowDeposit(
        uint256 campaignId
    ) external view returns (EscrowDeposit memory) {
        return escrowDeposits[campaignId];
    }

    function getPayoutRecord(
        uint256 payoutId
    ) external view returns (PayoutRecord memory) {
        return payoutRecords[payoutId];
    }

    function getCampaignBalance(
        uint256 campaignId
    )
        external
        view
        returns (
            uint256 totalAmount,
            uint256 reservedAmount,
            uint256 paidAmount,
            uint256 availableAmount
        )
    {
        EscrowDeposit memory deposit = escrowDeposits[campaignId];
        totalAmount = deposit.totalAmount;
        reservedAmount = deposit.reservedAmount;
        paidAmount = deposit.paidAmount;
        availableAmount = totalAmount - reservedAmount - paidAmount;
    }

    function getCreatorStats(
        address creator
    ) external view returns (uint256 totalEarnings, uint256 payoutCount) {
        totalEarnings = creatorEarnings[creator];

        // Count payouts for this creator
        for (uint256 i = 1; i <= payoutCounter; i++) {
            if (
                payoutRecords[i].creator == creator && payoutRecords[i].executed
            ) {
                payoutCount++;
            }
        }
    }

    function getBrandStats(
        address brand
    )
        external
        view
        returns (uint256 totalSpending, uint256 activeCampaignCount)
    {
        totalSpending = brandSpending[brand];
        activeCampaignCount = 0;
    }

    function getPlatformStats() external view returns (PlatformStats memory) {
        return platformStats;
    }

    function calculateFees(
        uint256 amount
    ) external view returns (uint256 platformFee, uint256 netAmount) {
        platformFee = (amount * platformFeeRate) / 10000;
        netAmount = amount - platformFee;
    }
}
