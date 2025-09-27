// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract CampaignManager is AccessControl, ReentrancyGuard {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant PLATFORM_ROLE = keccak256("PLATFORM_ROLE");

    enum CampaignStatus {
        Active,
        Paused,
        Completed,
        Cancelled
    }

    enum VerificationStatus {
        Pending,
        Verified,
        Rejected,
        Disputed
    }

    struct Campaign {
        uint256 campaignId;
        address brand;
        string requirements; // JSON metadata
        uint256 totalBudget; // In PYUSD
        uint256 paymentPerPost;
        uint256 maxPosts;
        uint256 currentPosts;
        CampaignStatus status;
        uint256 deadline;
        string[] requiredHashtags;
        uint256 minFollowers;
        uint256 createdAt;
        bool requiresVideoContent;
    }

    struct PostSubmission {
        uint256 submissionId;
        uint256 campaignId;
        address creator;
        string postUrl;
        uint256 timestamp;
        VerificationStatus status;
        uint256 verificationId;
        bool paid;
        string rejectionReason;
    }

    // Storage
    uint256 private campaignCounter;
    uint256 private submissionCounter;

    mapping(uint256 => Campaign) public campaigns;
    mapping(uint256 => PostSubmission) public submissions;
    mapping(uint256 => mapping(address => bool)) public acceptedCreators;
    mapping(uint256 => uint256[]) public campaignSubmissions;
    mapping(address => uint256[]) public brandCampaigns;
    mapping(address => uint256[]) public creatorSubmissions;

    // Events
    event CampaignCreated(
        uint256 indexed campaignId,
        address indexed brand,
        uint256 paymentPerPost,
        uint256 maxPosts,
        uint256 deadline
    );

    event CampaignStatusUpdated(
        uint256 indexed campaignId,
        CampaignStatus oldStatus,
        CampaignStatus newStatus
    );

    event CreatorAcceptedCampaign(
        uint256 indexed campaignId,
        address indexed creator
    );

    event PostSubmitted(
        uint256 indexed submissionId,
        uint256 indexed campaignId,
        address indexed creator,
        string postUrl
    );

    event PostVerificationUpdated(
        uint256 indexed submissionId,
        VerificationStatus oldStatus,
        VerificationStatus newStatus
    );

    constructor(address _admin) {
        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(ADMIN_ROLE, _admin);
    }

    function createCampaign(
        address brand,
        string memory requirements,
        uint256 paymentPerPost,
        uint256 maxPosts,
        uint256 deadline,
        string[] memory requiredHashtags,
        uint256 minFollowers,
        uint256 totalBudget
    ) external onlyRole(PLATFORM_ROLE) returns (uint256) {
        campaignCounter++;
        uint256 campaignId = campaignCounter;

        Campaign storage campaign = campaigns[campaignId];
        campaign.campaignId = campaignId;
        campaign.brand = brand;
        campaign.requirements = requirements;
        campaign.totalBudget = totalBudget;
        campaign.paymentPerPost = paymentPerPost;
        campaign.maxPosts = maxPosts;
        campaign.currentPosts = 0;
        campaign.status = CampaignStatus.Active;
        campaign.deadline = deadline;
        campaign.requiredHashtags = requiredHashtags;
        campaign.minFollowers = minFollowers;
        campaign.createdAt = block.timestamp;

        brandCampaigns[campaign.brand].push(campaignId);

        emit CampaignCreated(
            campaignId,
            campaign.brand,
            paymentPerPost,
            maxPosts,
            deadline
        );

        return campaignId;
    }

    function acceptCampaign(uint256 campaignId) external {
        Campaign storage campaign = campaigns[campaignId];
        require(campaign.campaignId != 0, "Campaign does not exist");
        require(
            campaign.status == CampaignStatus.Active,
            "Campaign not active"
        );
        require(block.timestamp < campaign.deadline, "Campaign expired");
        require(!acceptedCreators[campaignId][msg.sender], "Already accepted");

        acceptedCreators[campaignId][msg.sender] = true;

        emit CreatorAcceptedCampaign(campaignId, msg.sender);
    }

    function submitPost(
        uint256 campaignId,
        string memory postUrl,
        address creator
    ) external onlyRole(PLATFORM_ROLE) returns (uint256) {
        Campaign storage campaign = campaigns[campaignId];

        require(campaign.campaignId != 0, "Campaign does not exist");
        require(
            campaign.status == CampaignStatus.Active,
            "Campaign not active"
        );
        require(block.timestamp < campaign.deadline, "Campaign expired");
        require(acceptedCreators[campaignId][creator], "Creator not accepted");
        require(campaign.currentPosts < campaign.maxPosts, "Campaign full");

        submissionCounter++;
        uint256 submissionId = submissionCounter;

        PostSubmission storage submission = submissions[submissionId];
        submission.submissionId = submissionId;
        submission.campaignId = campaignId;
        submission.creator = creator;
        submission.postUrl = postUrl;
        submission.timestamp = block.timestamp;
        submission.status = VerificationStatus.Pending;

        campaignSubmissions[campaignId].push(submissionId);
        creatorSubmissions[creator].push(submissionId);

        campaign.currentPosts++;

        emit PostSubmitted(submissionId, campaignId, creator, postUrl);

        return submissionId;
    }

    function updatePostVerification(
        uint256 submissionId,
        uint8 newStatus,
        uint256 verificationId,
        string memory rejectionReason
    ) external onlyRole(PLATFORM_ROLE) {
        PostSubmission storage submission = submissions[submissionId];
        require(submission.submissionId != 0, "Submission does not exist");

        VerificationStatus oldStatus = submission.status;
        submission.status = VerificationStatus(newStatus);
        submission.verificationId = verificationId;

        if (VerificationStatus(newStatus) == VerificationStatus.Rejected) {
            submission.rejectionReason = rejectionReason;
        }

        emit PostVerificationUpdated(
            submissionId,
            oldStatus,
            VerificationStatus(newStatus)
        );
    }

    function markPaymentCompleted(
        uint256 submissionId
    ) external onlyRole(PLATFORM_ROLE) {
        PostSubmission storage submission = submissions[submissionId];
        require(submission.submissionId != 0, "Submission does not exist");
        require(
            submission.status == VerificationStatus.Verified,
            "Not verified"
        );

        submission.paid = true;
    }

    function pauseCampaign(uint256 campaignId) external {
        Campaign storage campaign = campaigns[campaignId];
        require(campaign.brand == msg.sender, "Only brand can pause");
        require(
            campaign.status == CampaignStatus.Active,
            "Campaign not active"
        );

        campaign.status = CampaignStatus.Paused;
        emit CampaignStatusUpdated(
            campaignId,
            CampaignStatus.Active,
            CampaignStatus.Paused
        );
    }

    function resumeCampaign(uint256 campaignId) external {
        Campaign storage campaign = campaigns[campaignId];
        require(campaign.brand == msg.sender, "Only brand can resume");
        require(
            campaign.status == CampaignStatus.Paused,
            "Campaign not paused"
        );
        require(block.timestamp < campaign.deadline, "Campaign expired");

        campaign.status = CampaignStatus.Active;
        emit CampaignStatusUpdated(
            campaignId,
            CampaignStatus.Paused,
            CampaignStatus.Active
        );
    }

    function cancelCampaign(uint256 campaignId) external {
        Campaign storage campaign = campaigns[campaignId];
        require(campaign.brand == msg.sender, "Only brand can cancel");
        require(
            campaign.status != CampaignStatus.Completed,
            "Campaign completed"
        );

        CampaignStatus oldStatus = campaign.status;
        campaign.status = CampaignStatus.Cancelled;
        emit CampaignStatusUpdated(
            campaignId,
            oldStatus,
            CampaignStatus.Cancelled
        );
    }

    function completeCampaign(uint256 campaignId) external {
        Campaign storage campaign = campaigns[campaignId];
        require(
            campaign.brand == msg.sender ||
                block.timestamp > campaign.deadline ||
                campaign.currentPosts >= campaign.maxPosts,
            "Cannot complete campaign"
        );
        require(
            campaign.status == CampaignStatus.Active,
            "Campaign not active"
        );

        campaign.status = CampaignStatus.Completed;
        emit CampaignStatusUpdated(
            campaignId,
            CampaignStatus.Active,
            CampaignStatus.Completed
        );
    }

    function getCampaign(
        uint256 campaignId
    ) external view returns (Campaign memory) {
        return campaigns[campaignId];
    }

    function getSubmission(
        uint256 submissionId
    ) external view returns (PostSubmission memory) {
        return submissions[submissionId];
    }

    function getCampaignSubmissions(
        uint256 campaignId
    ) external view returns (uint256[] memory) {
        return campaignSubmissions[campaignId];
    }

    function getBrandCampaigns(
        address brand
    ) external view returns (uint256[] memory) {
        return brandCampaigns[brand];
    }

    function getCreatorSubmissions(
        address creator
    ) external view returns (uint256[] memory) {
        return creatorSubmissions[creator];
    }

    function isCreatorAccepted(
        uint256 campaignId,
        address creator
    ) external view returns (bool) {
        return acceptedCreators[campaignId][creator];
    }

    function getCampaignStats(
        uint256 campaignId
    )
        external
        view
        returns (
            uint256 totalSubmissions,
            uint256 verifiedSubmissions,
            uint256 rejectedSubmissions,
            uint256 pendingSubmissions
        )
    {
        uint256[] memory submissionIds = campaignSubmissions[campaignId];

        for (uint256 i = 0; i < submissionIds.length; i++) {
            PostSubmission memory submission = submissions[submissionIds[i]];
            totalSubmissions++;

            if (submission.status == VerificationStatus.Verified) {
                verifiedSubmissions++;
            } else if (submission.status == VerificationStatus.Rejected) {
                rejectedSubmissions++;
            } else if (submission.status == VerificationStatus.Pending) {
                pendingSubmissions++;
            }
        }
    }

    function getActiveCampaigns()
        external
        view
        returns (uint256[] memory activeCampaignIds)
    {
        uint256 activeCount = 0;

        // count active campaigns
        for (uint256 i = 1; i <= campaignCounter; i++) {
            if (
                campaigns[i].status == CampaignStatus.Active &&
                block.timestamp < campaigns[i].deadline
            ) {
                activeCount++;
            }
        }

        // count populate array
        activeCampaignIds = new uint256[](activeCount);
        uint256 index = 0;

        for (uint256 i = 1; i <= campaignCounter; i++) {
            if (
                campaigns[i].status == CampaignStatus.Active &&
                block.timestamp < campaigns[i].deadline
            ) {
                activeCampaignIds[index] = i;
                index++;
            }
        }
    }
}
