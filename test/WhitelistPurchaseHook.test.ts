import { loadFixture, setBalance } from "@nomicfoundation/hardhat-network-helpers"
import { expect } from "chai"
import { constants, utils } from "ethers"
import { ethers, unlock } from "hardhat"

describe("WhitelistPurchaseHook", function () {
  async function fixture() {
    await unlock.deployProtocol(11, 12)

    const { lock: publiclock } = await unlock.createLock({
      name: "ETHCon Korea 2023 ticket",
      keyPrice: utils.parseEther("0.006"),
      expirationDuration: 0,
      currencyContractAddress: constants.AddressZero,
      maxNumberOfKeys: 500,
    })

    const WhitelistPurchaseHook = await ethers.getContractFactory("WhitelistPurchaseHook")
    const whitelistPurchaseHook = await WhitelistPurchaseHook.deploy(publiclock.address)
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

    const [user] = await ethers.getSigner

    await setBalance(user.address, ethers.utils.parseEther("10"))

    return { unlock, publiclock, user, whitelistPurchaseHook }
  }

  it("should succeed to purchase without hook", async function () {
    const { user, unlock } = await loadFixture(fixture)

    const { lock: publiclock } = await unlock.createLock({
      name: "ETHCon Korea 2023 ticket",
      keyPrice: utils.parseEther("0.006"),
      expirationDuration: 0,
      currencyContractAddress: constants.AddressZero,
      maxNumberOfKeys: 500,
    })

    const value = [publiclock.keyPrice]
    const recipient = [user.address]
    const referrer = [constants.AddressZero]
    const data = ["0x"]

    await expect(
      publiclock
        .connect(user)
        .purchase(value, recipient, referrer, data, { value: utils.parseEther("0.006") })
    ).not.to.be.revertedWith("INVALID_PURCHASE")
  })

  it("should succeed to purchase with hook if msg.sender is whitelisted", async function () {
    const { publiclock, user, whitelistPurchaseHook } = await loadFixture(fixture)

    // TODO: Need to be implemented.
  })

  it("should fail to purchase with hook if msg.sender != recipient", async function () {
    const { publiclock, user } = await loadFixture(fixture)

    // TODO: Need to be implemented.
  })

  it("should fail to purchase with hook if referrer is not zero address", async function () {
    const { publiclock, user } = await loadFixture(fixture)

    // TODO: Need to be implemented.
  })

  it("should fail to purchase with hook if key manager is not zero address", async function () {
    const { publiclock, user } = await loadFixture(fixture)

    // TODO: Need to be implemented.
  })
})
