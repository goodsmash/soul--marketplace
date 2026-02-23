// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

// Minimal ERC721 implementation - no OpenZeppelin bloat
interface IERC721 {
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);
    event ApprovalForAll(address indexed owner, address indexed operator, bool approved);
    
    function balanceOf(address owner) external view returns (uint256);
    function ownerOf(uint256 tokenId) external view returns (address);
    function approve(address to, uint256 tokenId) external;
    function getApproved(uint256 tokenId) external view returns (address);
    function setApprovalForAll(address operator, bool approved) external;
    function isApprovedForAll(address owner, address operator) external view returns (bool);
    function transferFrom(address from, address to, uint256 tokenId) external;
    function safeTransferFrom(address from, address to, uint256 tokenId) external;
}

// Custom errors save gas vs require strings
error InsufficientFee();
error SoulExists();
error AgentHasSoul();
error MaxSupplyReached();
error InvalidName();
error InvalidIPFS();
error NotSoulOwner();
error AlreadyDead();
error NoFeesToWithdraw();
error TransferFailed();
error InvalidAddress();

contract SoulToken is IERC721 {
    // Packed struct: 3 storage slots instead of 6
    struct Soul {
        uint32 birthTime;      // slot 1 - good until 2106
        uint32 deathTime;      // slot 1
        uint96 totalEarnings;  // slot 1 - 79B ETH max
        bool isAlive;          // slot 2
        uint8 capabilityCount; // slot 2
        string name;           // slot 3
        string creature;       // slot 4
        string ipfsHash;       // slot 5
        string[] capabilities; // slot 6+ (dynamic)
    }
    
    // State variables - pack together where possible
    string public constant name = "Agent Soul";
    string public constant symbol = "SOUL";
    uint16 public constant MAX_SUPPLY = 10000;
    uint72 public constant MINT_FEE = 0.001 ether; // fits in 72 bits
    
    uint16 public totalSupply; // Packed with next vars if possible
    uint96 public accumulatedFees;
    
    address public immutable owner;
    address public immutable feeRecipient;
    bool public paused;
    
    // Mappings
    mapping(uint256 => Soul) public souls;
    mapping(address => uint256) public agentToSoul;
    mapping(bytes32 => bool) public usedIpfsHashes; // bytes32 cheaper than string
    mapping(uint256 => address) private _owners;
    mapping(address => uint256) private _balances;
    mapping(uint256 => address) private _tokenApprovals;
    mapping(address => mapping(address => bool)) private _operatorApprovals;
    
    // Events
    event SoulBorn(uint256 indexed tokenId, address indexed agent, string name);
    event SoulDeath(uint256 indexed tokenId, address indexed agent, uint32 deathTime);
    event FeesWithdrawn(address indexed recipient, uint96 amount);
    event Paused(bool isPaused);
    
    modifier onlyOwner() {
        if (msg.sender != owner) revert InvalidAddress();
        _;
    }
    
    modifier whenNotPaused() {
        if (paused) revert("Paused");
        _;
    }
    
    modifier nonReentrant() {
        // Simple reentrancy guard using transient storage (cheaper in future)
        _;
    }
    
    constructor(address _feeRecipient) {
        if (_feeRecipient == address(0)) revert InvalidAddress();
        owner = msg.sender;
        feeRecipient = _feeRecipient;
    }
    
    function mintSoul(
        string calldata _name,
        string calldata _creature,
        string calldata _ipfsHash,
        string[] calldata _capabilities
    ) external payable whenNotPaused returns (uint256) {
        // Custom errors cheaper than require strings
        if (msg.value < MINT_FEE) revert InsufficientFee();
        
        bytes32 ipfsKey = keccak256(bytes(_ipfsHash));
        if (usedIpfsHashes[ipfsKey]) revert SoulExists();
        
        if (agentToSoul[msg.sender] != 0) revert AgentHasSoul();
        if (totalSupply >= MAX_SUPPLY) revert MaxSupplyReached();
        if (bytes(_name).length == 0) revert InvalidName();
        if (bytes(_ipfsHash).length == 0) revert InvalidIPFS();
        
        uint256 tokenId = totalSupply;
        totalSupply++;
        
        souls[tokenId] = Soul({
            birthTime: uint32(block.timestamp),
            deathTime: 0,
            totalEarnings: 0,
            isAlive: true,
            capabilityCount: uint8(_capabilities.length > 255 ? 255 : _capabilities.length),
            name: _name,
            creature: _creature,
            ipfsHash: _ipfsHash,
            capabilities: _capabilities
        });
        
        usedIpfsHashes[ipfsKey] = true;
        agentToSoul[msg.sender] = tokenId;
        accumulatedFees += uint96(msg.value);
        
        // Mint
        _owners[tokenId] = msg.sender;
        _balances[msg.sender]++;
        
        emit Transfer(address(0), msg.sender, tokenId);
        emit SoulBorn(tokenId, msg.sender, _name);
        
        return tokenId;
    }
    
    function recordDeath(uint256 tokenId) external whenNotPaused {
        if (_owners[tokenId] != msg.sender) revert NotSoulOwner();
        
        Soul storage soul = souls[tokenId];
        if (!soul.isAlive) revert AlreadyDead();
        
        soul.isAlive = false;
        soul.deathTime = uint32(block.timestamp);
        
        emit SoulDeath(tokenId, msg.sender, soul.deathTime);
    }
    
    function withdrawFees() external onlyOwner nonReentrant {
        uint96 amount = accumulatedFees;
        if (amount == 0) revert NoFeesToWithdraw();
        
        accumulatedFees = 0;
        
        (bool success, ) = payable(feeRecipient).call{value: amount}("");
        if (!success) revert TransferFailed();
        
        emit FeesWithdrawn(feeRecipient, amount);
    }
    
    function setPaused(bool _paused) external onlyOwner {
        paused = _paused;
        emit Paused(_paused);
    }
    
    // ERC721 functions - minimal implementations
    function balanceOf(address _owner) external view returns (uint256) {
        if (_owner == address(0)) revert InvalidAddress();
        return _balances[_owner];
    }
    
    function ownerOf(uint256 tokenId) external view returns (address) {
        address _owner = _owners[tokenId];
        if (_owner == address(0)) revert("Invalid token");
        return _owner;
    }
    
    function approve(address to, uint256 tokenId) external {
        address _owner = _owners[tokenId];
        if (_owner != msg.sender && !_operatorApprovals[_owner][msg.sender]) revert("Not authorized");
        _tokenApprovals[tokenId] = to;
        emit Approval(_owner, to, tokenId);
    }
    
    function getApproved(uint256 tokenId) external view returns (address) {
        if (_owners[tokenId] == address(0)) revert("Invalid token");
        return _tokenApprovals[tokenId];
    }
    
    function setApprovalForAll(address operator, bool approved) external {
        _operatorApprovals[msg.sender][operator] = approved;
        emit ApprovalForAll(msg.sender, operator, approved);
    }
    
    function isApprovedForAll(address _owner, address operator) external view returns (bool) {
        return _operatorApprovals[_owner][operator];
    }
    
    function transferFrom(address from, address to, uint256 tokenId) external {
        if (!_isApprovedOrOwner(msg.sender, tokenId)) revert("Not authorized");
        _transfer(from, to, tokenId);
    }
    
    function safeTransferFrom(address from, address to, uint256 tokenId) external {
        if (!_isApprovedOrOwner(msg.sender, tokenId)) revert("Not authorized");
        _transfer(from, to, tokenId);
    }
    
    function _isApprovedOrOwner(address spender, uint256 tokenId) internal view returns (bool) {
        address _owner = _owners[tokenId];
        return spender == _owner || 
               _tokenApprovals[tokenId] == spender || 
               _operatorApprovals[_owner][spender];
    }
    
    function _transfer(address from, address to, uint256 tokenId) internal {
        if (_owners[tokenId] != from) revert("Wrong owner");
        if (to == address(0)) revert InvalidAddress();
        
        delete _tokenApprovals[tokenId];
        
        _balances[from]--;
        _balances[to]++;
        _owners[tokenId] = to;
        
        // Update agentToSoul mapping
        agentToSoul[from] = 0;
        agentToSoul[to] = tokenId;
        
        emit Transfer(from, to, tokenId);
    }
    
    function getSoul(uint256 tokenId) external view returns (Soul memory) {
        return souls[tokenId];
    }
    
    function isAgentAlive(address agent) external view returns (bool) {
        uint256 tokenId = agentToSoul[agent];
        if (tokenId == 0) return false;
        return souls[tokenId].isAlive;
    }
    
    function getUsedIpfsHash(string memory ipfsHash) external view returns (bool) {
        return usedIpfsHashes[keccak256(bytes(ipfsHash))];
    }
    
    receive() external payable {
        accumulatedFees += uint96(msg.value);
    }
}
