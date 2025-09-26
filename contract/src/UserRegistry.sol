// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";


contract UserRegistry is AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant PLATFORM_ROLE = keccak256("PLATFORM_ROLE");

    enum UserType { None, Brand, Creator }
    enum VerificationLevel { Unverified, BasicVerified, PremiumVerified }

    struct Brand {
        address brandAddress;
        string companyName;
        string description;
        string websiteUrl;
        string logoUrl;
        string[] industries;
        uint256 totalCampaigns;
        uint256 totalSpent;
        uint256 activeCampaigns;
        VerificationLevel verificationLevel;
        uint256 registrationDate;
        bool isActive;
        string contactEmail;
        string taxId; // Encrypted or hashed
    }

    struct Creator {
        address creatorAddress;
        string username;
        string displayName;
        string bio;
        string profileImageUrl;
        SocialMediaHandles socialMedia;
        uint256 totalFollowers;
        string[] categories; // Fashion, Tech, Lifestyle, etc.
        string[] languages;
        uint256 completedCampaigns;
        uint256 totalEarned;
        uint256 averageRating; // Out of 10000 (basis points)
        VerificationLevel verificationLevel;
        uint256 registrationDate;
        bool isActive;
    }

    struct SocialMediaHandles {
        string twitter;
        string instagram;
        string tiktok;
        string youtube;
        string linkedin;
        string website;
    }

    // CreatorMetrics removed for MVP - no longer needed

    struct VerificationRequest {
        address user;
        UserType userType;
        VerificationLevel requestedLevel;
        string[] documents; // IPFS hashes or URLs
        string reason;
        uint256 timestamp;
        bool processed;
        bool approved;
        string adminNotes;
    }

    // Storage
    mapping(address => Brand) public brands;
    mapping(address => Creator) public creators;
    mapping(address => UserType) public userTypes;
    mapping(string => address) public usernameToAddress;
    mapping(uint256 => VerificationRequest) public verificationRequests;
    
    uint256 private verificationRequestCounter;
    address[] public registeredBrands;
    address[] public registeredCreators;
    
    // Platform stats
    uint256 public totalBrands;
    uint256 public totalCreators;
    uint256 public verifiedBrands;
    uint256 public verifiedCreators;

    // Events
    event BrandRegistered(
        address indexed brand,
        string companyName,
        string websiteUrl
    );

    event CreatorRegistered(
        address indexed creator,
        string username,
        string[] categories
    );

    event UserVerificationRequested(
        uint256 indexed requestId,
        address indexed user,
        UserType userType,
        VerificationLevel level
    );

    event UserVerified(
        address indexed user,
        UserType userType,
        VerificationLevel level
    );

    event ProfileUpdated(
        address indexed user,
        UserType userType,
        string updateType
    );


    constructor(address _admin) {
        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(ADMIN_ROLE, _admin);
    }

   
    function registerBrand(
        string memory companyName,
        string memory description,
        string memory websiteUrl,
        string memory logoUrl,
        string[] memory industries,
        string memory contactEmail
    ) external {
        require(userTypes[msg.sender] == UserType.None, "User already registered");
        require(bytes(companyName).length > 0, "Company name required");
        require(bytes(websiteUrl).length > 0, "Website URL required");

        brands[msg.sender] = Brand({
            brandAddress: msg.sender,
            companyName: companyName,
            description: description,
            websiteUrl: websiteUrl,
            logoUrl: logoUrl,
            industries: industries,
            totalCampaigns: 0,
            totalSpent: 0,
            activeCampaigns: 0,
            verificationLevel: VerificationLevel.Unverified,
            registrationDate: block.timestamp,
            isActive: true,
            contactEmail: contactEmail,
            taxId: ""
        });

        userTypes[msg.sender] = UserType.Brand;
        registeredBrands.push(msg.sender);
        totalBrands++;

        emit BrandRegistered(msg.sender, companyName, websiteUrl);
    }

    function registerCreator(
        string memory username,
        string memory displayName,
        string memory bio,
        string memory profileImageUrl,
        SocialMediaHandles memory socialMedia,
        uint256 totalFollowers,
        string[] memory categories,
        string[] memory languages
    ) external {
        require(userTypes[msg.sender] == UserType.None, "User already registered");
        require(bytes(username).length > 2, "Username too short");
        require(usernameToAddress[username] == address(0), "Username taken");
        require(categories.length > 0, "At least one category required");

        creators[msg.sender] = Creator({
            creatorAddress: msg.sender,
            username: username,
            displayName: displayName,
            bio: bio,
            profileImageUrl: profileImageUrl,
            socialMedia: socialMedia,
            totalFollowers: totalFollowers,
            categories: categories,
            languages: languages,
            completedCampaigns: 0,
            totalEarned: 0,
            averageRating: 0,
            verificationLevel: VerificationLevel.Unverified,
            registrationDate: block.timestamp,
            isActive: true
        });

        userTypes[msg.sender] = UserType.Creator;
        usernameToAddress[username] = msg.sender;
        registeredCreators.push(msg.sender);
        totalCreators++;

        emit CreatorRegistered(msg.sender, username, categories);
    }

    
    function updateBrandProfile(
        string memory description,
        string memory websiteUrl,
        string memory logoUrl,
        string[] memory industries,
        string memory contactEmail
    ) external {
        require(userTypes[msg.sender] == UserType.Brand, "Not a registered brand");
        
        Brand storage brand = brands[msg.sender];
        brand.description = description;
        brand.websiteUrl = websiteUrl;
        brand.logoUrl = logoUrl;
        brand.industries = industries;
        brand.contactEmail = contactEmail;

        emit ProfileUpdated(msg.sender, UserType.Brand, "profile");
    }

    /**
     * @dev Update creator profile
     */
    function updateCreatorProfile(
        string memory displayName,
        string memory bio,
        string memory profileImageUrl,
        SocialMediaHandles memory socialMedia,
        uint256 totalFollowers,
        string[] memory categories,
        string[] memory languages
    ) external {
        require(userTypes[msg.sender] == UserType.Creator, "Not a registered creator");
        
        Creator storage creator = creators[msg.sender];
        creator.displayName = displayName;
        creator.bio = bio;
        creator.profileImageUrl = profileImageUrl;
        creator.socialMedia = socialMedia;
        creator.totalFollowers = totalFollowers;
        creator.categories = categories;
        creator.languages = languages;

        emit ProfileUpdated(msg.sender, UserType.Creator, "profile");
    }


  
    function updateBrandStats(
        address brand,
        uint256 totalCampaigns,
        uint256 totalSpent,
        uint256 activeCampaigns
    ) external onlyRole(PLATFORM_ROLE) {
        require(userTypes[brand] == UserType.Brand, "Not a brand");
        
        Brand storage brandData = brands[brand];
        brandData.totalCampaigns = totalCampaigns;
        brandData.totalSpent = totalSpent;
        brandData.activeCampaigns = activeCampaigns;
    }

    function updateCreatorStats(
        address creator,
        uint256 completedCampaigns,
        uint256 totalEarned,
        uint256 averageRating
    ) external onlyRole(PLATFORM_ROLE) {
        require(userTypes[creator] == UserType.Creator, "Not a creator");
        
        Creator storage creatorData = creators[creator];
        creatorData.completedCampaigns = completedCampaigns;
        creatorData.totalEarned = totalEarned;
        creatorData.averageRating = averageRating;
    }


    
    function requestVerification(
        VerificationLevel requestedLevel,
        string[] memory documents,
        string memory reason
    ) external {
        require(userTypes[msg.sender] != UserType.None, "User not registered");
        
        verificationRequestCounter++;
        uint256 requestId = verificationRequestCounter;

        verificationRequests[requestId] = VerificationRequest({
            user: msg.sender,
            userType: userTypes[msg.sender],
            requestedLevel: requestedLevel,
            documents: documents,
            reason: reason,
            timestamp: block.timestamp,
            processed: false,
            approved: false,
            adminNotes: ""
        });

        emit UserVerificationRequested(
            requestId,
            msg.sender,
            userTypes[msg.sender],
            requestedLevel
        );
    }

   
    function processVerificationRequest(
        uint256 requestId,
        bool approved,
        string memory adminNotes
    ) external onlyRole(ADMIN_ROLE) {
        VerificationRequest storage request = verificationRequests[requestId];
        require(!request.processed, "Request already processed");

        request.processed = true;
        request.approved = approved;
        request.adminNotes = adminNotes;

        if (approved) {
            if (request.userType == UserType.Brand) {
                brands[request.user].verificationLevel = request.requestedLevel;
                if (request.requestedLevel >= VerificationLevel.BasicVerified) {
                    verifiedBrands++;
                }
            } else {
                creators[request.user].verificationLevel = request.requestedLevel;
                if (request.requestedLevel >= VerificationLevel.BasicVerified) {
                    verifiedCreators++;
                }
            }

            emit UserVerified(request.user, request.userType, request.requestedLevel);
        }
    }

    
    function deactivateUser(address user) external {
        require(
            msg.sender == user || hasRole(ADMIN_ROLE, msg.sender),
            "Unauthorized"
        );
        require(userTypes[user] != UserType.None, "User not registered");

        if (userTypes[user] == UserType.Brand) {
            brands[user].isActive = false;
        } else {
            creators[user].isActive = false;
        }
    }

    function reactivateUser(address user) external {
        require(
            msg.sender == user || hasRole(ADMIN_ROLE, msg.sender),
            "Unauthorized"
        );
        require(userTypes[user] != UserType.None, "User not registered");

        if (userTypes[user] == UserType.Brand) {
            brands[user].isActive = true;
        } else {
            creators[user].isActive = true;
        }
    }

    function getBrand(address brandAddress) external view returns (Brand memory) {
        return brands[brandAddress];
    }

    function getCreator(address creatorAddress) external view returns (Creator memory) {
        return creators[creatorAddress];
    }

    function getCreatorByUsername(string memory username) external view returns (Creator memory) {
        address creatorAddress = usernameToAddress[username];
        return creators[creatorAddress];
    }

    function isRegisteredBrand(address user) external view returns (bool) {
        return userTypes[user] == UserType.Brand && brands[user].isActive;
    }

    function isRegisteredCreator(address user) external view returns (bool) {
        return userTypes[user] == UserType.Creator && creators[user].isActive;
    }

    function getUserType(address user) external view returns (UserType) {
        return userTypes[user];
    }


    function getVerificationRequest(uint256 requestId) external view returns (VerificationRequest memory) {
        return verificationRequests[requestId];
    }

    function getPlatformStats() external view returns (
        uint256 _totalBrands,
        uint256 _totalCreators,
        uint256 _verifiedBrands,
        uint256 _verifiedCreators
    ) {
        return (totalBrands, totalCreators, verifiedBrands, verifiedCreators);
    }

    function getCreatorsByCategory(string memory category) external view returns (address[] memory) {
        uint256 count = 0;
        
        for (uint256 i = 0; i < registeredCreators.length; i++) {
            Creator memory creator = creators[registeredCreators[i]];
            if (creator.isActive) {
                for (uint256 j = 0; j < creator.categories.length; j++) {
                    if (keccak256(bytes(creator.categories[j])) == keccak256(bytes(category))) {
                        count++;
                        break;
                    }
                }
            }
        }
        
        address[] memory matchingCreators = new address[](count);
        uint256 index = 0;
        
        for (uint256 i = 0; i < registeredCreators.length; i++) {
            Creator memory creator = creators[registeredCreators[i]];
            if (creator.isActive) {
                for (uint256 j = 0; j < creator.categories.length; j++) {
                    if (keccak256(bytes(creator.categories[j])) == keccak256(bytes(category))) {
                        matchingCreators[index] = registeredCreators[i];
                        index++;
                        break;
                    }
                }
            }
        }
        
        return matchingCreators;
    }

    function getTopCreators(uint256 limit) external view returns (address[] memory) {
        uint256 actualLimit = limit > registeredCreators.length ? registeredCreators.length : limit;
        address[] memory topCreators = new address[](actualLimit);
        
        for (uint256 i = 0; i < actualLimit; i++) {
            topCreators[i] = registeredCreators[i];
        }
        
        return topCreators;
    }

}