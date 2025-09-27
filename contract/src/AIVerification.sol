// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface ICampaignManager {
    function updatePostVerification(
        uint256 submissionId,
        uint8 newStatus, // VerificationStatus enum
        uint256 verificationId,
        string memory rejectionReason
    ) external;

    function markPaymentCompleted(uint256 submissionId) external;
}

interface IPaymentEscrow {
    function reservePayment(
        uint256 campaignId,
        uint256 submissionId,
        uint256 amount
    ) external;
    function executePayment(
        address creator,
        uint256 amount,
        uint256 campaignId,
        uint256 submissionId
    ) external;
    function releaseReservation(uint256 campaignId, uint256 amount) external;
}

contract AIVerification is AccessControl, ReentrancyGuard {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant PLATFORM_ROLE = keccak256("PLATFORM_ROLE");
    bytes32 public constant AI_AGENT_ROLE = keccak256("AI_AGENT_ROLE");

    enum VerificationStatus {
        Pending,
        Verified,
        Rejected,
        Disputed,
        Processing
    }

    struct VerificationRequest {
        uint256 requestId;
        uint256 campaignId;
        uint256 submissionId;
        address creator;
        string postUrl;
        string[] requirements;
        uint256 timestamp;
        VerificationStatus status;
        uint256 paymentAmount;
        bool paymentReserved;
    }

    struct VerificationResponse {
        uint256 requestId;
        address agent;
        bool approved;
        uint256 confidenceScore; // 0-10000 (basis points)
        string analysis;
        string rejectionReason;
        uint256 responseTime;
        uint256 timestamp;
    }

    // Storage
    uint256 private requestCounter;
    address public campaignManager;
    address public paymentEscrow;

    mapping(uint256 => VerificationRequest) public verificationRequests;
    mapping(uint256 => VerificationResponse) public verificationResponses;

    uint256 public minConfidenceScore; // Minimum confidence for approval
    uint256 public maxVerificationTime; // Max time to wait for verification

    // Events
    event VerificationRequested(
        uint256 indexed requestId,
        uint256 indexed campaignId,
        address indexed creator,
        string postUrl
    );

    event AIResponseReceived(
        uint256 indexed requestId,
        bool approved,
        uint256 confidenceScore
    );

    event VerificationCompleted(
        uint256 indexed requestId,
        bool approved,
        uint256 confidenceScore
    );

    event PaymentProcessed(
        uint256 indexed requestId,
        address indexed creator,
        uint256 amount,
        bool success
    );

    constructor(
        address _admin,
        address _campaignManager,
        address _paymentEscrow
    ) {
        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(ADMIN_ROLE, _admin);

        campaignManager = _campaignManager;
        paymentEscrow = _paymentEscrow;

        minConfidenceScore = 7000; // 70%
        maxVerificationTime = 1 hours;
    }

    function _initiateVerificationProcess(uint256 requestId) internal {
        VerificationRequest storage request = verificationRequests[requestId];
        request.status = VerificationStatus.Processing;
    }

    function receiveAIResponse(
        uint256 requestId,
        bool approved,
        uint256 confidenceScore,
        string memory analysis,
        string memory rejectionReason
    ) external onlyRole(AI_AGENT_ROLE) {
        require(
            verificationRequests[requestId].requestId != 0,
            "Request does not exist"
        );
        require(
            verificationResponses[requestId].requestId == 0,
            "Response already received"
        );
        require(confidenceScore <= 10000, "Invalid confidence score");

        VerificationRequest storage request = verificationRequests[requestId];
        require(
            request.status == VerificationStatus.Processing ||
                request.status == VerificationStatus.Pending,
            "Invalid request status"
        );

        // Record AI response
        verificationResponses[requestId] = VerificationResponse({
            requestId: requestId,
            agent: msg.sender,
            approved: approved,
            confidenceScore: confidenceScore,
            analysis: analysis,
            rejectionReason: rejectionReason,
            responseTime: block.timestamp - request.timestamp,
            timestamp: block.timestamp
        });

        emit AIResponseReceived(requestId, approved, confidenceScore);

        // Immediately finalize verification with single AI response
        _finalizeVerification(requestId, approved, confidenceScore);
    }

    function _finalizeVerification(
        uint256 requestId,
        bool approved,
        uint256 finalConfidence
    ) internal nonReentrant {
        VerificationRequest storage request = verificationRequests[requestId];

        VerificationStatus newStatus = approved
            ? VerificationStatus.Verified
            : VerificationStatus.Rejected;
        request.status = newStatus;

        // Update campaign manager
        ICampaignManager(campaignManager).updatePostVerification(
            request.submissionId,
            uint8(newStatus),
            requestId,
            approved ? "" : "Failed AI verification consensus"
        );

        if (approved && request.paymentAmount > 0) {
            // Execute payment through escrow
            try
                IPaymentEscrow(paymentEscrow).executePayment(
                    request.creator,
                    request.paymentAmount,
                    request.campaignId,
                    request.submissionId
                )
            {
                ICampaignManager(campaignManager).markPaymentCompleted(
                    request.submissionId
                );
                emit PaymentProcessed(
                    requestId,
                    request.creator,
                    request.paymentAmount,
                    true
                );
            } catch {
                emit PaymentProcessed(
                    requestId,
                    request.creator,
                    request.paymentAmount,
                    false
                );
            }
        } else if (!approved && request.paymentReserved) {
            // Release reservation if payment was reserved
            IPaymentEscrow(paymentEscrow).releaseReservation(
                request.campaignId,
                request.paymentAmount
            );
        }

        emit VerificationCompleted(requestId, approved, finalConfidence);
    }

    function grantAIAgentRole(address aiAgent) external onlyRole(ADMIN_ROLE) {
        _grantRole(AI_AGENT_ROLE, aiAgent);
    }

    function revokeAIAgentRole(address aiAgent) external onlyRole(ADMIN_ROLE) {
        _revokeRole(AI_AGENT_ROLE, aiAgent);
    }
    // Updated AIVerification function - combines verification request + payment reservation
    function requestVerificationWithPayment(
        uint256 campaignId,
        address creator,
        string memory postUrl,
        string[] memory requirements,
        uint256 paymentAmount,
        uint256 submissionId
    ) external onlyRole(PLATFORM_ROLE) returns (uint256) {
        requestCounter++;
        uint256 requestId = requestCounter;

        // Create verification request
        VerificationRequest storage request = verificationRequests[requestId];
        request.requestId = requestId;
        request.campaignId = campaignId;
        request.submissionId = submissionId;
        request.creator = creator;
        request.postUrl = postUrl;
        request.requirements = requirements;
        request.timestamp = block.timestamp;
        request.status = VerificationStatus.Pending;
        request.paymentAmount = paymentAmount;

        // Reserve payment atomically (will revert if insufficient funds)
        if (paymentAmount > 0) {
            IPaymentEscrow(paymentEscrow).reservePayment(
                campaignId,
                submissionId,
                paymentAmount
            );
            request.paymentReserved = true;
        }

        // Trigger verification process
        _initiateVerificationProcess(requestId);

        emit VerificationRequested(requestId, campaignId, creator, postUrl);
        return requestId;
    }

    function updateVerificationParams(
        uint256 _minConfidenceScore,
        uint256 _maxVerificationTime
    ) external onlyRole(ADMIN_ROLE) {
        require(_minConfidenceScore <= 10000, "Invalid confidence score");

        minConfidenceScore = _minConfidenceScore;
        maxVerificationTime = _maxVerificationTime;
    }

    function getVerificationRequest(
        uint256 requestId
    ) external view returns (VerificationRequest memory) {
        return verificationRequests[requestId];
    }

    function getVerificationResponse(
        uint256 requestId
    ) external view returns (VerificationResponse memory) {
        return verificationResponses[requestId];
    }

    function getVerificationStats(
        uint256 requestId
    )
        external
        view
        returns (
            bool hasResponse,
            bool approved,
            uint256 confidenceScore,
            address responder
        )
    {
        VerificationResponse memory response = verificationResponses[requestId];
        hasResponse = response.requestId != 0;
        if (hasResponse) {
            approved = response.approved;
            confidenceScore = response.confidenceScore;
            responder = response.agent;
        }
    }

    function _min(uint256 a, uint256 b) internal pure returns (uint256) {
        return a < b ? a : b;
    }
}
