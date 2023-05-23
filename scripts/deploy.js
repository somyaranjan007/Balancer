const hre = require("hardhat");

async function main() {
  const portfolioFactory = await hre.ethers.getContractFactory(
    "contracts/Portfolio.sol:Portfolio"
  )
  this.portfolio = await portfolioFactory.deploy();
  await this.portfolio.deployed();

  console.log(this.portfolio.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
