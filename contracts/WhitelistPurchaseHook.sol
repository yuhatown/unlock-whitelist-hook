// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

import "@unlock-protocol/contracts/dist/Hooks/v12/ILockKeyPurchaseHook.sol";
import "@unlock-protocol/contracts/dist/PublicLock/IPublicLockV13.sol";
import "@unlock-protocol/contracts/dist/Unlock/IUnlockV12.sol";

import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract WhitelistPurchaseHook is ILockKeyPurchaseHook {
    bytes32 public merkleRoot = "input here";
    error NOT_WHITELISTED();
    error ZERO_ADDRESS();
    error NOT_LOCKMANAGER();

    IPublicLockV13 public lock;

    mapping(address => bool) public lockManagers;

    constructor(IPublicLockV13 _lockAddress) {
        lock = _lockAddress;
    }

    function isLockManager(address account) external view returns (bool) {
        return lockManagers[account];
    }

    function addLockManager(address account) external {
        if (!lockManagers[msg.sender]) {
            revert NOT_LOCKMANAGER();
        }
        lockManagers[account] = true;
    }

    function renounceLockManager() external {
        if (!lockManagers[msg.sender]) {
            revert NOT_LOCKMANAGER();
        }
        lockManagers[msg.sender] = false;
    }

    function setMerkleRoot(bytes32 merkleRootHash) external {
        if (!lockManagers[msg.sender]) {
            revert NOT_LOCKMANAGER();
        }
        merkleRoot = merkleRootHash;
    }

    function verifyAddress(
        bytes32[] calldata _merkleProof
    ) private view returns (bool) {
        bytes32 leaf = keccak256(abi.encodePacked(msg.sender));
        return MerkleProof.verify(_merkleProof, merkleRoot, leaf);
    }

    function keyPurchasePrice(
        address from,
        address recipient,
        address referrer,
        bytes calldata data
    ) external view returns (uint minKeyPrice) {}

    function onKeyPurchase(
        uint tokenId,
        address from,
        address recipient,
        address referrer,
        bytes calldata data,
        uint minKeyPrice,
        uint pricePaid
    ) external {
        require(from != recipient, "Sender must be the recipient");
        if (recipient == address(0)) {
            revert ZERO_ADDRESS();
        }
    }
}
