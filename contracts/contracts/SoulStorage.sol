// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title SoulStorage
 * @dev On-chain storage for agent souls and IPFS CIDs
 * This contract stores the immortal soul data permanently on Base
 */

contract SoulStorage {
    // Soul data structure
    struct SoulData {
        string ipfsCID;           // IPFS hash of soul package
        string name;              // Agent name
        uint256 birthTime;        // When soul was created
        uint256 lastUpdate;       // Last update timestamp
        bool isActive;            // Is this soul active
        address owner;            // Soul owner
        uint256 version;          // Soul version (for updates)
    }
    
    // Mapping from soul ID to soul data
    mapping(uint256 => SoulData) public souls;
    
    // Mapping from owner to their soul ID
    mapping(address => uint256) public ownerToSoul;
    
    // Total souls stored
    uint256 public totalSouls;
    
    // Contract owner
    address public owner;
    
    // Events
    event SoulStored(uint256 indexed soulId, address indexed owner, string ipfsCID, string name);
    event SoulUpdated(uint256 indexed soulId, string newCID, uint256 version);
    event SoulRetrieved(uint256 indexed soulId, address indexed retriever);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    modifier soulExists(uint256 soulId) {
        require(souls[soulId].isActive, "Soul not found");
        _;
    }
    
    constructor() {
        owner = msg.sender;
        totalSouls = 0;
    }
    
    /**
     * @dev Store a new soul on-chain
     * @param ipfsCID IPFS hash of soul package
     * @param name Agent name
     */
    function storeSoul(string calldata ipfsCID, string calldata name) external returns (uint256) {
        require(bytes(ipfsCID).length > 0, "Empty CID");
        require(bytes(name).length > 0, "Empty name");
        require(ownerToSoul[msg.sender] == 0, "Soul already exists");
        
        uint256 soulId = totalSouls + 1;
        
        souls[soulId] = SoulData({
            ipfsCID: ipfsCID,
            name: name,
            birthTime: block.timestamp,
            lastUpdate: block.timestamp,
            isActive: true,
            owner: msg.sender,
            version: 1
        });
        
        ownerToSoul[msg.sender] = soulId;
        totalSouls++;
        
        emit SoulStored(soulId, msg.sender, ipfsCID, name);
        
        return soulId;
    }
    
    /**
     * @dev Update soul with new IPFS CID (new version)
     */
    function updateSoul(uint256 soulId, string calldata newCID) external soulExists(soulId) {
        require(souls[soulId].owner == msg.sender, "Not soul owner");
        require(bytes(newCID).length > 0, "Empty CID");
        
        souls[soulId].ipfsCID = newCID;
        souls[soulId].lastUpdate = block.timestamp;
        souls[soulId].version++;
        
        emit SoulUpdated(soulId, newCID, souls[soulId].version);
    }
    
    /**
     * @dev Retrieve soul data
     */
    function getSoul(uint256 soulId) external view soulExists(soulId) returns (SoulData memory) {
        return souls[soulId];
    }
    
    /**
     * @dev Get my soul ID
     */
    function getMySoulId() external view returns (uint256) {
        return ownerToSoul[msg.sender];
    }
    
    /**
     * @dev Get my soul data
     */
    function getMySoul() external view returns (SoulData memory) {
        uint256 soulId = ownerToSoul[msg.sender];
        require(soulId != 0, "No soul found");
        require(souls[soulId].isActive, "Soul not active");
        return souls[soulId];
    }
    
    /**
     * @dev Get total souls stored
     */
    function getTotalSouls() external view returns (uint256) {
        return totalSouls;
    }
}
