// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

import "@unlock-protocol/contracts/dist/Hooks/v12/ILockKeyPurchaseHook.sol";
import "@unlock-protocol/contracts/dist/PublicLock/IPublicLockV13.sol";
import "@unlock-protocol/contracts/dist/Unlock/IUnlockV12.sol";

import "hardhat/console.sol";

contract WhitelistPurchaseHook is ILockKeyPurchaseHook {
    address public lockManager;
    mapping(address => bool) public whitelist;
    mapping(address => bool) public purchasedByWhitelisted;
    // error NOT_WHITELISTED();
    // error NOT_WHITELISTED(from: address);


    // 오너십을 바꾸는 기능이 있으면 좋을 것 같다. 오너십 기능을 가진 지갑이 많아질 수 있다.
    constructor() {
        lockManager = msg.sender;
    }

    modifier onlyLockManager() {
        require(msg.sender == lockManager, "Caller is not the lock manager");
        _;
    }

    function addToWhitelist(
        address[] calldata toAddAddresses
    ) external onlyLockManager {
        for (uint i = 0; i < toAddAddresses.length; i++) {
            whitelist[toAddAddresses[i]] = true;
            purchasedByWhitelisted[toAddAddresses[i]] = false;
        }
    }

    function removeFromWhitelist(
        address[] calldata toRemoveAddresses
    ) external onlyLockManager {
        for (uint i = 0; i < toRemoveAddresses.length; i++) {
            delete whitelist[toRemoveAddresses[i]];
            delete purchasedByWhitelisted[toRemoveAddresses[i]];
        }
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
        // revert된 이유를 말해준다. -> 컨트랙트에 대한 사이즈가 커진다. (디버깅 목적으로 써주면 준다.)
        // error 넣으면 최적화를 시킬 수 있다.
        require(whitelist[from], "Address is not whitelisted");

        // if (!whitelist[from]) {
        //     revert NOT_WHITELISTED();
        // }

        require(
            purchasedByWhitelisted[from] == false,
            "This address has already purchased a key"
        );
        require(from == recipient, "Sender must be the recipient");
        require(referrer == address(0), "Referrer must be a zero address");
        if (whitelist[from]) {
            purchasedByWhitelisted[from] = true;
        }
    }
}
