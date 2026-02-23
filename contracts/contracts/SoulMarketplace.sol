// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

// Minimal interface - no imports needed
interface ISoulToken {
    function ownerOf(uint256 tokenId) external view returns (address);
    function transferFrom(address from, address to, uint256 tokenId) external;
    function getApproved(uint256 tokenId) external view returns (address);
    function isApprovedForAll(address owner, address operator) external view returns (bool);
}

// Custom errors save ~200 gas each vs require strings
error InvalidPrice();
error NotSoulOwner();
error AlreadyListed();
error NotApproved();
error NotListed();
error InsufficientPayment();
error FeeTransferFailed();
error SellerTransferFailed();
error RefundFailed();
error InvalidAddress();
error FeeTooHigh();

contract SoulMarketplace {
    // Packed struct: 2 slots instead of 4
    struct Listing {
        address seller;      // slot 1: 20 bytes
        uint96 price;        // slot 1: 12 bytes (max ~4.7M ETH)
        uint32 listedAt;     // slot 2: 4 bytes
        bool active;         // slot 2: 1 byte
    }
    
    ISoulToken public immutable soulToken;
    address public immutable owner;
    address public feeRecipient;
    
    // Pack these together
    uint16 public platformFeeBps; // Basis points (100 = 1%)
    uint96 public totalVolume;
    uint32 public totalSales;
    
    // State
    mapping(uint256 => Listing) public listings;
    bool public paused;
    
    // Events with indexed params for efficient filtering
    event SoulListed(uint256 indexed soulId, address indexed seller, uint96 price);
    event SoulDelisted(uint256 indexed soulId, address indexed seller);
    event SoulSold(uint256 indexed soulId, address indexed seller, address indexed buyer, uint96 price);
    event FeeUpdated(uint16 newFeeBps);
    event FeeRecipientUpdated(address newRecipient);
    event Paused(bool isPaused);
    
    modifier onlyOwner() {
        if (msg.sender != owner) revert InvalidAddress();
        _;
    }
    
    modifier whenNotPaused() {
        if (paused) revert("Paused");
        _;
    }
    
    constructor(address _soulToken, address _feeRecipient) {
        if (_soulToken == address(0) || _feeRecipient == address(0)) revert InvalidAddress();
        soulToken = ISoulToken(_soulToken);
        owner = msg.sender;
        feeRecipient = _feeRecipient;
        platformFeeBps = 250; // 2.5%
    }
    
    function listSoul(uint256 soulId, uint96 price) external whenNotPaused {
        if (price == 0) revert InvalidPrice();
        if (soulToken.ownerOf(soulId) != msg.sender) revert NotSoulOwner();
        if (listings[soulId].active) revert AlreadyListed();
        
        // Check approval - use short-circuit
        if (soulToken.getApproved(soulId) != address(this)) {
            if (!soulToken.isApprovedForAll(msg.sender, address(this))) revert NotApproved();
        }
        
        listings[soulId] = Listing({
            seller: msg.sender,
            price: price,
            listedAt: uint32(block.timestamp),
            active: true
        });
        
        emit SoulListed(soulId, msg.sender, price);
    }
    
    function buySoul(uint256 soulId) external payable whenNotPaused {
        Listing storage listing = listings[soulId];
        if (!listing.active) revert NotListed();
        if (msg.value < listing.price) revert InsufficientPayment();
        
        address seller = listing.seller;
        uint96 price = listing.price;
        
        // Calculate fee
        uint96 fee = uint96((uint256(price) * platformFeeBps) / 10000);
        uint96 sellerProceeds = price - fee;
        
        // Mark as sold first (reentrancy protection)
        listing.active = false;
        
        // Transfer soul first
        soulToken.transferFrom(seller, msg.sender, soulId);
        
        // Then payments
        (bool success, ) = payable(seller).call{value: sellerProceeds}("");
        if (!success) revert SellerTransferFailed();
        
        (success, ) = payable(feeRecipient).call{value: fee}("");
        if (!success) revert FeeTransferFailed();
        
        // Refund excess
        if (msg.value > price) {
            (success, ) = payable(msg.sender).call{value: msg.value - price}("");
            if (!success) revert RefundFailed();
        }
        
        totalVolume += price;
        totalSales++;
        
        emit SoulSold(soulId, seller, msg.sender, price);
    }
    
    function delistSoul(uint256 soulId) external {
        Listing storage listing = listings[soulId];
        if (listing.seller != msg.sender) revert NotSoulOwner();
        if (!listing.active) revert NotListed();
        
        listing.active = false;
        emit SoulDelisted(soulId, msg.sender);
    }
    
    function setPlatformFee(uint16 newFeeBps) external onlyOwner {
        if (newFeeBps > 1000) revert FeeTooHigh(); // Max 10%
        platformFeeBps = newFeeBps;
        emit FeeUpdated(newFeeBps);
    }
    
    function setFeeRecipient(address newRecipient) external onlyOwner {
        if (newRecipient == address(0)) revert InvalidAddress();
        feeRecipient = newRecipient;
        emit FeeRecipientUpdated(newRecipient);
    }
    
    function setPaused(bool _paused) external onlyOwner {
        paused = _paused;
        emit Paused(_paused);
    }
    
    function getListing(uint256 soulId) external view returns (Listing memory) {
        return listings[soulId];
    }
    
    function getStats() external view returns (uint96 volume, uint32 sales) {
        return (totalVolume, totalSales);
    }
    
    // Batch operations to save gas on multiple listings
    function batchDelist(uint256[] calldata soulIds) external {
        uint256 len = soulIds.length;
        for (uint256 i = 0; i < len; i++) {
            Listing storage listing = listings[soulIds[i]];
            if (listing.seller == msg.sender && listing.active) {
                listing.active = false;
                emit SoulDelisted(soulIds[i], msg.sender);
            }
        }
    }
}
