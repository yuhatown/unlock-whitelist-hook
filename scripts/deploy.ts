import { execSync } from "child_process"
import { ethers } from "hardhat"

async function main() {
  execSync("yarn hardhat clean && yarn compile", { stdio: "inherit" })

  const args = process.argv.slice(2)

  if (args.length != 1) {
    console.log("Deploy: Wrong arguments. The argument must be network.")
    console.log("Deploy: ts-node ./scripts/contracts/deploy.ts ethereum")
    throw new Error("Wrong arguments")
  }

  // Change network.
  const network = args[0]

  const hre = require("hardhat")

  await hre.changeNetwork(network)

  // Deploy WhitelistPurchaseHook.
  console.log(`Deploy: Depolying WhitelistPurchaseHook on ${network}...`)

  const WhitelistPurchaseHook = await ethers.getContractFactory("WhitelistPurchaseHook")
  const whitelistPurchaseHook = await WhitelistPurchaseHook.deploy()
  await whitelistPurchaseHook.deployed()

  console.log("Deploy: WhitelistPurchaseHook is deployed at", whitelistPurchaseHook.address)

  // Verify WhitelistPurchaseHook.
  console.log(`Verify: Verifying WhitelistPurchaseHook...`)

  try {
    await hre.run("verify:verify", {
      address: whitelistPurchaseHook.address,
      constructorArguments: [],
    })
  } catch (e: unknown) {
    console.log(`Verify: An error occured during verificaiton\n\n${e}`)
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
