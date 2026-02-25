// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IERC721V2 {
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);
    event ApprovalForAll(address indexed owner, address indexed operator, bool approved);
}

error InsufficientFee();
error InvalidAddress();
error NotOwner();
error InvalidToken();

contract SoulTokenV2 is IERC721V2 {
    struct Soul {
        uint32 birthTime;
        uint32 deathTime;
        uint96 totalEarnings;
        bool isAlive;
        uint8 capabilityCount;
        string name;
        string creature;
        string ipfsHash;
        string[] capabilities;
    }

    string public constant name = "Agent Soul";
    string public constant symbol = "SOUL";
    uint16 public constant MAX_SUPPLY = 10000;

    uint72 public MINT_FEE;
    uint16 public totalSupply;
    uint96 public accumulatedFees;

    address public owner;
    address public feeRecipient;
    bool public paused;

    mapping(uint256 => Soul) public souls;
    mapping(address => uint256) public agentToSoul;
    mapping(bytes32 => bool) public usedIpfsHashes;

    mapping(uint256 => address) private _owners;
    mapping(address => uint256) private _balances;
    mapping(uint256 => address) private _tokenApprovals;
    mapping(address => mapping(address => bool)) private _operatorApprovals;

    // backup anchors: soulId => version => cid/hash
    mapping(uint256 => mapping(uint32 => string)) public backupCidByVersion;
    mapping(uint256 => mapping(uint32 => bytes32)) public backupHashByVersion;
    mapping(uint256 => uint32) public latestBackupVersion;

    event SoulBorn(uint256 indexed tokenId, address indexed agent, string soulName);
    event MintFeeUpdated(uint72 newFee);
    event BackupAnchored(uint256 indexed tokenId, uint32 indexed version, string cid, bytes32 contentHash);

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    modifier onlySoulOwner(uint256 tokenId) {
        if (_owners[tokenId] != msg.sender) revert NotOwner();
        _;
    }

    modifier whenNotPaused() {
        require(!paused, "Paused");
        _;
    }

    constructor(address _feeRecipient, uint72 _mintFee) {
        if (_feeRecipient == address(0)) revert InvalidAddress();
        owner = msg.sender;
        feeRecipient = _feeRecipient;
        MINT_FEE = _mintFee; // recommend 0.00001 ether
    }

    function setMintFee(uint72 newFee) external onlyOwner {
        MINT_FEE = newFee;
        emit MintFeeUpdated(newFee);
    }

    function mintSoul(
        string calldata _name,
        string calldata _creature,
        string calldata _ipfsHash,
        string[] calldata _capabilities
    ) external payable whenNotPaused returns (uint256) {
        if (msg.value < MINT_FEE) revert InsufficientFee();
        if (agentToSoul[msg.sender] != 0) revert InvalidToken();
        require(totalSupply < MAX_SUPPLY, "Max supply");
        require(bytes(_name).length > 0 && bytes(_ipfsHash).length > 0, "Invalid params");

        bytes32 ipfsKey = keccak256(bytes(_ipfsHash));
        require(!usedIpfsHashes[ipfsKey], "Soul exists");

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

        _owners[tokenId] = msg.sender;
        _balances[msg.sender]++;

        emit Transfer(address(0), msg.sender, tokenId);
        emit SoulBorn(tokenId, msg.sender, _name);
        return tokenId;
    }

    function anchorBackup(uint256 tokenId, string calldata cid, bytes32 contentHash) external onlySoulOwner(tokenId) {
        require(bytes(cid).length > 0, "Empty CID");
        uint32 next = latestBackupVersion[tokenId] + 1;
        latestBackupVersion[tokenId] = next;
        backupCidByVersion[tokenId][next] = cid;
        backupHashByVersion[tokenId][next] = contentHash;
        emit BackupAnchored(tokenId, next, cid, contentHash);
    }

    function latestBackup(uint256 tokenId) external view returns (uint32 version, string memory cid, bytes32 hash) {
        version = latestBackupVersion[tokenId];
        cid = backupCidByVersion[tokenId][version];
        hash = backupHashByVersion[tokenId][version];
    }

    // V1 compatibility for UI/hooks
    function getSoul(uint256 tokenId) external view returns (Soul memory) {
        return souls[tokenId];
    }

    function ownerOf(uint256 tokenId) external view returns (address) {
        address o = _owners[tokenId];
        if (o == address(0)) revert InvalidToken();
        return o;
    }

    function balanceOf(address o) external view returns (uint256) {
        if (o == address(0)) revert InvalidAddress();
        return _balances[o];
    }

    function approve(address to, uint256 tokenId) external {
        address o = _owners[tokenId];
        require(msg.sender == o || _operatorApprovals[o][msg.sender], "Not auth");
        _tokenApprovals[tokenId] = to;
        emit Approval(o, to, tokenId);
    }

    function getApproved(uint256 tokenId) external view returns (address) {
        if (_owners[tokenId] == address(0)) revert InvalidToken();
        return _tokenApprovals[tokenId];
    }

    function setApprovalForAll(address operator, bool approved) external {
        _operatorApprovals[msg.sender][operator] = approved;
        emit ApprovalForAll(msg.sender, operator, approved);
    }

    function isApprovedForAll(address o, address operator) external view returns (bool) {
        return _operatorApprovals[o][operator];
    }

    function transferFrom(address from, address to, uint256 tokenId) external {
        address o = _owners[tokenId];
        require(o == from, "Wrong from");
        require(to != address(0), "Invalid to");
        require(msg.sender == o || _tokenApprovals[tokenId] == msg.sender || _operatorApprovals[o][msg.sender], "Not auth");

        delete _tokenApprovals[tokenId];
        _owners[tokenId] = to;
        _balances[from]--;
        _balances[to]++;
        emit Transfer(from, to, tokenId);
    }
}
