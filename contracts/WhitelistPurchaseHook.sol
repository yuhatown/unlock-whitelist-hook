// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

import "@unlock-protocol/contracts/dist/Hooks/v12/ILockKeyPurchaseHook.sol";
import "@unlock-protocol/contracts/dist/PublicLock/IPublicLockV13.sol";
import "@unlock-protocol/contracts/dist/Unlock/IUnlockV12.sol";

contract WhitelistPurchaseHook is ILockKeyPurchaseHook {
    constructor() {}

    function keyPurchasePrice(
        address from,
        address recipient,
        address referrer,
        bytes calldata data
    ) external view returns (uint minKeyPrice) {
        // TODO: Need to be implemented.
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
        // TODO: Need to be implemented.
    }
}
