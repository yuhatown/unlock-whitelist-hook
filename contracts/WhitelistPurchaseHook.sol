// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

import "@unlock-protocol/contracts/dist/Hooks/v12/ILockKeyPurchaseHook.sol";
import "@unlock-protocol/contracts/dist/PublicLock/IPublicLockV13.sol";
import "@unlock-protocol/contracts/dist/Unlock/IUnlockV12.sol";

contract WhitelistPurchaseHook is ILockKeyPurchaseHook {
    mapping(address => bool) public whitelist;
    mapping(address => bool) public purchasedByWhitelisted;

    constructor() {}

    // Add an address to the whitelist
    function addToWhitelist(address _address) external {
        whitelist[_address] = true;
        purchasedByWhitelisted[_address] = false;
    }

    // Remove an address from the whitelist
    function removeFromWhitelist(address _address) external {
        whitelist[_address] = false;
        delete purchasedByWhitelisted[_address];
    }

    function keyPurchasePrice(
        address from,
        address recipient,
        address referrer,
        bytes calldata data
    ) external view returns (uint minKeyPrice) {
        require(whitelist[from], "Address is not whitelisted");
    }

    function onKeyPurchase(
        uint tokenId,
        address from,
        address recipient,
        address referrer,
        bytes calldata data,
        uint minKeyPrice,
        uint pricePaid
    ) external {
        // If the key was purchased by a whitelisted address, mark it as such
        if (whitelist[from]) {
            purchasedByWhitelisted[from] = true;
        }

        // If the address has already purchased a key, revert the transaction
        require(
            purchasedByWhitelisted[from] == false,
            "This address has already purchased a key"
        );

        // If the sender of the transaction is not the recipient of the key, revert the transaction
        require(msg.sender == recipient, "Sender must be the recipient");

        // If the referrer is not a zero address, revert the transaction
        require(referrer == address(0), "Referrer must be a zero address");
    }
}
