// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Firesides {
    struct Memory {
        string memoryType;
        string data;
        address creator;
        uint256 timestamp;
    }

    Memory[] public memories;

    event MemoryCreated(uint256 indexed id, address indexed creator, string memoryType, string data);

    function createMemory(string memory memoryType, string memory data) public {
        memories.push(Memory(memoryType, data, msg.sender, block.timestamp));
        emit MemoryCreated(memories.length - 1, msg.sender, memoryType, data);
    }

    function getMemory(uint256 id) public view returns (Memory memory) {
        require(id < memories.length, "Memory does not exist");
        return memories[id];
    }

    function getMemoryCount() public view returns (uint256) {
        return memories.length;
    }
} 