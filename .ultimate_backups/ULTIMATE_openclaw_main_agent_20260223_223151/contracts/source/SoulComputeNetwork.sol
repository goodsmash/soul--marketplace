// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

// Custom errors
error InvalidAddress();
error AlreadyRegistered();
error NotRegistered();
error PaymentRequired();
error InvalidDuration();
error TaskNotFound();
error TaskAlreadyCompleted();
error TaskExpired();
error TaskClaimed();
error NotAssignedWorker();
error PaymentFailed();
error FeeTooHigh();

/**
 * @title SoulComputeNetwork
 * @dev Decentralized compute for agents - GAS OPTIMIZED
 */
contract SoulComputeNetwork {
    // Packed struct: 3 slots vs 4 in original
    struct Task {
        address submitter;   // slot 1: 20 bytes
        address worker;      // slot 1: 20 bytes (packed)
        uint64 payment;      // slot 2: 8 bytes (max 18M ETH)
        uint32 deadline;     // slot 2: 4 bytes
        bool completed;      // slot 2: 1 byte
        bytes32 taskType;    // slot 3: 32 bytes (hashed, cheaper than string)
        string description;  // slot 4: dynamic (only when needed)
    }
    
    struct Worker {
        address workerAddress;
        bool isActive;
        uint32 completedTasks;
        uint96 totalEarnings;  // Max 79B ETH
        bytes32 capabilities;  // Hash of capabilities (cheaper than string)
    }
    
    // State - pack where possible
    address public immutable owner;
    address public feeRecipient;
    
    uint16 public platformFeeBps; // 100 = 1%
    uint32 public nextTaskId;
    uint32 public totalTasksSubmitted;
    uint32 public totalTasksCompleted;
    uint96 public totalPayments;
    
    uint32 public constant MAX_TASK_DURATION = 7 days;
    
    bool public paused;
    
    // Mappings
    mapping(uint256 => Task) public tasks;
    mapping(address => Worker) public workers;
    mapping(address => uint256[]) public agentTasks;
    
    // Events - indexed for efficient filtering
    event TaskSubmitted(uint256 indexed taskId, address indexed submitter, bytes32 taskType, uint64 payment);
    event TaskCompleted(uint256 indexed taskId, address indexed worker, uint96 payment);
    event WorkerRegistered(address indexed worker, bytes32 capabilities);
    event FeeUpdated(uint16 newFeeBps);
    event FeeRecipientUpdated(address newRecipient);
    event Paused(bool isPaused);
    
    modifier onlyOwner() {
        if (msg.sender != owner) revert InvalidAddress();
        _;
    }
    
    modifier onlyWorker() {
        if (!workers[msg.sender].isActive) revert NotRegistered();
        _;
    }
    
    modifier whenNotPaused() {
        if (paused) revert("Paused");
        _;
    }
    
    constructor(address _feeRecipient) {
        if (_feeRecipient == address(0)) revert InvalidAddress();
        owner = msg.sender;
        feeRecipient = _feeRecipient;
        platformFeeBps = 2000; // 20% default
        nextTaskId = 1;
    }
    
    function registerWorker(string calldata capabilities) external whenNotPaused {
        if (workers[msg.sender].isActive) revert AlreadyRegistered();
        
        workers[msg.sender] = Worker({
            workerAddress: msg.sender,
            isActive: true,
            completedTasks: 0,
            totalEarnings: 0,
            capabilities: keccak256(bytes(capabilities))
        });
        
        emit WorkerRegistered(msg.sender, workers[msg.sender].capabilities);
    }
    
    function submitTask(
        string calldata taskType,
        string calldata description,
        uint32 duration
    ) external payable whenNotPaused returns (uint256) {
        if (msg.value == 0) revert PaymentRequired();
        if (duration == 0 || duration > MAX_TASK_DURATION) revert InvalidDuration();
        
        uint256 taskId = nextTaskId++;
        
        tasks[taskId] = Task({
            submitter: msg.sender,
            worker: address(0),
            payment: uint64(msg.value),
            deadline: uint32(block.timestamp) + duration,
            completed: false,
            taskType: keccak256(bytes(taskType)),
            description: description
        });
        
        agentTasks[msg.sender].push(taskId);
        
        totalTasksSubmitted++;
        totalPayments += uint96(msg.value);
        
        emit TaskSubmitted(taskId, msg.sender, tasks[taskId].taskType, uint64(msg.value));
        
        return taskId;
    }
    
    function claimTask(uint256 taskId) external onlyWorker whenNotPaused {
        Task storage task = tasks[taskId];
        
        if (task.submitter == address(0)) revert TaskNotFound();
        if (task.completed) revert TaskAlreadyCompleted();
        if (block.timestamp >= task.deadline) revert TaskExpired();
        if (task.worker != address(0)) revert TaskClaimed();
        
        task.worker = msg.sender;
    }
    
    function completeTask(uint256 taskId) external onlyWorker {
        Task storage task = tasks[taskId];
        
        if (task.worker != msg.sender) revert NotAssignedWorker();
        if (task.completed) revert TaskAlreadyCompleted();
        
        task.completed = true;
        
        Worker storage worker = workers[msg.sender];
        worker.completedTasks++;
        
        uint64 payment = task.payment;
        uint96 fee = uint96((uint256(payment) * platformFeeBps) / 10000);
        uint96 workerPayment = uint96(payment) - fee;
        
        worker.totalEarnings += workerPayment;
        totalTasksCompleted++;
        
        // Payments
        (bool success, ) = payable(msg.sender).call{value: workerPayment}("");
        if (!success) revert PaymentFailed();
        
        (success, ) = payable(feeRecipient).call{value: fee}("");
        if (!success) revert PaymentFailed();
        
        emit TaskCompleted(taskId, msg.sender, workerPayment);
    }
    
    // Batch claim for gas efficiency
    function batchClaimTasks(uint256[] calldata taskIds) external onlyWorker whenNotPaused {
        uint256 len = taskIds.length;
        for (uint256 i = 0; i < len; i++) {
            Task storage task = tasks[taskIds[i]];
            if (task.submitter != address(0) && 
                !task.completed && 
                block.timestamp < task.deadline && 
                task.worker == address(0)) {
                task.worker = msg.sender;
            }
        }
    }
    
    // Batch complete for gas efficiency  
    function batchCompleteTasks(uint256[] calldata taskIds) external onlyWorker {
        uint256 len = taskIds.length;
        Worker storage worker = workers[msg.sender];
        
        for (uint256 i = 0; i < len; i++) {
            Task storage task = tasks[taskIds[i]];
            if (task.worker == msg.sender && !task.completed) {
                task.completed = true;
                worker.completedTasks++;
                
                uint96 fee = uint96((uint256(task.payment) * platformFeeBps) / 10000);
                uint96 workerPayment = uint96(task.payment) - fee;
                worker.totalEarnings += workerPayment;
                totalTasksCompleted++;
                
                // Note: Individual payments to save complexity
                // In production, consider escrow pattern for batch
                (bool success, ) = payable(msg.sender).call{value: workerPayment}("");
                if (success) {
                    emit TaskCompleted(taskIds[i], msg.sender, workerPayment);
                }
            }
        }
    }
    
    function setPlatformFee(uint16 newFeeBps) external onlyOwner {
        if (newFeeBps > 5000) revert FeeTooHigh(); // Max 50%
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
    
    function getTask(uint256 taskId) external view returns (Task memory) {
        return tasks[taskId];
    }
    
    function getWorker(address workerAddress) external view returns (Worker memory) {
        return workers[workerAddress];
    }
    
    function getAgentTasks(address agent) external view returns (uint256[] memory) {
        return agentTasks[agent];
    }
    
    function getStats() external view returns (uint32 submitted, uint32 completed, uint96 payments) {
        return (totalTasksSubmitted, totalTasksCompleted, totalPayments);
    }
    
    // View function to check task eligibility
    function isTaskClaimable(uint256 taskId) external view returns (bool) {
        Task storage task = tasks[taskId];
        return task.submitter != address(0) && 
               !task.completed && 
               block.timestamp < task.deadline && 
               task.worker == address(0);
    }
}
