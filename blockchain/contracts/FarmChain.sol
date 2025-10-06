// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract FarmChain {
    struct Batch {
        string batchId;
        address farmer;
        string produceType;
        uint256 quantity;
        uint256 timestamp;
        uint8 qualityScore;
        bool verified;
    }
    
    mapping(string => Batch) public batches;
    mapping(string => bool) public batchExists;
    
    event BatchRecorded(
        string indexed batchId,
        address indexed farmer,
        string produceType,
        uint256 timestamp
    );
    
    event BatchVerified(
        string indexed batchId,
        uint8 qualityScore,
        uint256 timestamp
    );
    
    function recordBatch(
        string memory _batchId,
        string memory _produceType,
        uint256 _quantity
    ) public {
        require(!batchExists[_batchId], "Batch already exists");
        require(bytes(_batchId).length > 0, "Invalid batch ID");
        require(bytes(_produceType).length > 0, "Invalid produce type");
        require(_quantity > 0, "Quantity must be greater than 0");
        
        batches[_batchId] = Batch({
            batchId: _batchId,
            farmer: msg.sender,
            produceType: _produceType,
            quantity: _quantity,
            timestamp: block.timestamp,
            qualityScore: 0,
            verified: false
        });
        
        batchExists[_batchId] = true;
        
        emit BatchRecorded(_batchId, msg.sender, _produceType, block.timestamp);
    }
    
    function verifyBatch(string memory _batchId, uint8 _qualityScore) public {
        require(batchExists[_batchId], "Batch does not exist");
        require(_qualityScore > 0 && _qualityScore <= 10, "Invalid quality score");
        
        batches[_batchId].qualityScore = _qualityScore;
        batches[_batchId].verified = true;
        
        emit BatchVerified(_batchId, _qualityScore, block.timestamp);
    }
    
    function getBatch(string memory _batchId) public view returns (
        address farmer,
        string memory produceType,
        uint256 quantity,
        uint256 timestamp,
        uint8 qualityScore,
        bool verified
    ) {
        require(batchExists[_batchId], "Batch does not exist");
        Batch memory batch = batches[_batchId];
        return (
            batch.farmer,
            batch.produceType,
            batch.quantity,
            batch.timestamp,
            batch.qualityScore,
            batch.verified
        );
    }
}