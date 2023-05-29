import { loadFixture, setBalance } from "@nomicfoundation/hardhat-network-helpers"
import { expect } from "chai"
import { constants, utils } from "ethers"
import { ethers, unlock } from "hardhat"

describe("WhitelistPurchaseHook", function () {
  async function fixture() {
    // Note: The latest versions of Unlock and Publiclock of Unlock hardhat plugin 0.0.18 are 11 and 12 respectively.
    // In contrast, the actual versions of Unlock and Publiclock are 12 and 13 respectively. However, it is okay to use
    // it because there is no the difference among features we will use.

    // Deploy Unlock protocol.
    await unlock.deployProtocol(11, 12)

    // Deploy PublicLock.
    const { lock: publiclock } = await unlock.createLock({
      name: "ETHCon Korea 2023 ticket",
      keyPrice: utils.parseEther("0.006"), // Arbitrary price.
      expirationDuration: 0, // Never expires.
      currencyContractAddress: constants.AddressZero, // Zero address is ETH.
      maxNumberOfKeys: 500, // Arbitrary number.
    })

    // Attach whitelist purchase hook.
    const WhitelistPurchaseHook = await ethers.getContractFactory("WhitelistPurchaseHook")
    const whitelistPurchaseHook = await WhitelistPurchaseHook.deploy()
    await whitelistPurchaseHook.deployed()

    await (
      await publiclock.setEventHooks(
        whitelistPurchaseHook.address,
        ethers.constants.AddressZero,
        ethers.constants.AddressZero,
        ethers.constants.AddressZero,
        ethers.constants.AddressZero,
        ethers.constants.AddressZero,
        ethers.constants.AddressZero
      )
    ).wait()

    // Airdrop ETH to user.
    const [user1, user2] = await ethers.getSigners()

    await setBalance(user1.address, ethers.utils.parseEther("10"))

    return { unlock, publiclock, user1, user2, whitelistPurchaseHook }
  }

  it("should succeed to purchase without hook", async function () {
    const { user1 } = await loadFixture(fixture)

    // Deploy PublicLock.
    const { lock: publiclock } = await unlock.createLock({
      name: "ETHCon Korea 2023 ticket",
      keyPrice: utils.parseEther("0.006"), // Arbitrary price.
      expirationDuration: 0, // Never expires.
      currencyContractAddress: constants.AddressZero, // Zero address is ETH.
      maxNumberOfKeys: 500, // Arbitrary number.
    })

    // Purchase.
    const value = [0]
    const recipient = [user1.address]
    const referrer = [constants.AddressZero]
    const keyManager = [constants.AddressZero]
    const data = ["0x"]

    await expect(
      publiclock
        .connect(user1)
        .purchase(value, recipient, referrer, keyManager, data, { value: utils.parseEther("0.006") })
    ).not.to.reverted
  })

  it("should succeed to purchase with hook if msg.sender is whitelisted", async function () {
    const { publiclock, user1, whitelistPurchaseHook } = await loadFixture(fixture)

    // Add the user1 to the whitelist
    await whitelistPurchaseHook.addToWhitelist(user1.address)

    // Purchase
    const value = [0]
    const recipient = [user1.address]
    const referrer = [constants.AddressZero]
    const keyManager = [constants.AddressZero]
    const data = ["0x"]

    await expect(
      publiclock
        .connect(user1)
        .purchase(value, recipient, referrer, keyManager, data, { value: utils.parseEther("0.006") })
    )
  })

  it("should fail to purchase with hook if msg.sender already has a ticket", async function () {
    const { publiclock, user1, whitelistPurchaseHook } = await loadFixture(fixture)

    // Add the user1 to the whitelist and mark that they have purchased a key
    await whitelistPurchaseHook.addToWhitelist(user1.address)
    whitelistPurchaseHook.onKeyPurchase(
      1,
      user1.address,
      constants.AddressZero,
      constants.AddressZero,
      "0x",
      0,
      utils.parseEther("0.006")
    )

    // Attempt to purchase again
    const value = [0]
    const recipient = [user1.address]
    const referrer = [constants.AddressZero]
    const keyManager = [constants.AddressZero]
    const data = ["0x"]

    await expect(
      publiclock
        .connect(user1)
        .purchase(value, recipient, referrer, keyManager, data, { value: utils.parseEther("0.006") })
    ).to.be.reverted
  })

  it("should fail to purchase with hook if msg.sender != recipient", async function () {
    const { publiclock, user1, user2, whitelistPurchaseHook } = await loadFixture(fixture)

    // Add the user to the whitelist
    await whitelistPurchaseHook.addToWhitelist(user1.address)

    // Attempt to purchase with a different recipient
    const value = [0]
    const recipient = [user2.address]
    const referrer = [constants.AddressZero]
    const keyManager = [constants.AddressZero]
    const data = ["0x"]

    await expect(
      publiclock
        .connect(user2)
        .purchase(value, recipient, referrer, keyManager, data, { value: utils.parseEther("0.006") })
    ).to.be.reverted
  })

  it("should fail to purchase with hook if referrer is not zero address", async function () {
    const { publiclock, user1, user2, whitelistPurchaseHook } = await loadFixture(fixture)

    // Add the user to the whitelist
    await whitelistPurchaseHook.addToWhitelist(user1.address)

    // Attempt to purchase with a non-zero referrer
    const value = [0]
    const recipient = [user1.address]
    const referrer = [user2.address]
    const keyManager = [constants.AddressZero]
    const data = ["0x"]

    await expect(
      publiclock
        .connect(user1)
        .purchase(value, recipient, referrer, keyManager, data, { value: utils.parseEther("0.006") })
    ).to.be.reverted
  })

  it("should fail to purchase with hook if key manager is not zero address", async function () {
    const { publiclock, user1, user2, whitelistPurchaseHook } = await loadFixture(fixture)

    // Add the user to the whitelist
    await whitelistPurchaseHook.addToWhitelist(user1.address)

    // Attempt to purchase with a non-zero key manager
    const value = [0]
    const recipient = [user1.address]
    const referrer = [constants.AddressZero]
    const keyManager = [user2.address]
    const data = ["0x"]

    await expect(
      publiclock
        .connect(user1)
        .purchase(value, recipient, referrer, keyManager, data, { value: utils.parseEther("0.006") })
    ).to.be.reverted
  })
})
