const { ethers } = require("hardhat");
const { expect } = require("chai");
const { bech32 } = require("bech32");
const distributionABI = require("../abis/Distribution.json");
const StakingABI = require("../abis/Staking.json");

const PERIPHERY_TESTNET = {
  factory: "0x81BC50a2df9cE424843e3c17110E1ab1FedCD4b8",
  weth9: "0xcc491f589B45d4a3C679016195B3FB87D7848210",
  router: "0x72bd489d3cF0e9cC36af6e306Ff53E56d0f9EFb4",
  mockUSDC: "0xc48Efe267a31b5Af4cFDb50C8457914aadB0b875",
  mockEVMOS: "0xf1361Dc7DFB724bd29FE7ade0CdF9785F2Bc20E6",
  mockATOM: "0x9832169B33DC5777D3d28572f35E0a537Ff7A04C",
  mockOSMOSIS: "0x1dccd8025688e39C72f2539C6f00d77bd6678425",
  multicall2: "0x1B7c09Ac8aA1e6e1d299d9301B539A368eD4c176",
  LHS: "0x7c21d6A51d6f591A95470f1F262C9c804c4CEAc3",
  RHS: "0xD3607915d934576EcdC389E7DBc641097fd5A0dE",
  testerAddress: "0x1662BfeA0Af3515baf9DAb3f0961Dc26DD35202B",
  rewardToken: "0x7e806D59528F6Fa7CCcAdb4821Dd42551113DEFc",
  secondaryRewardToken: "0x9AC19677BD6B1a3ba046C33f4D2f1952cA0e9a13",
  miniChef: "0x0fCee557E3eB94913e202eF91314f14298591a61",
  complexRewarderTime: "0x2916d2e0B675e6993250f2DB9764Cd7fD5379C04",
};

describe("ERC20 Tokens Exercise 2", function () {
  let deployer;
  const validator = "evmos10t6kyy4jncvnevmgq6q2ntcy90gse3yxssf6qg";

  before(async function () {
    [deployer] = await ethers.getSigners();

    const stakerFactory = await ethers.getContractFactory(
      "contracts/Staker.sol:Staker",
      deployer
    );

    this.staker = await stakerFactory.deploy();
    await this.staker.deployed();

    this.distribution = await ethers.getContractAt(
      distributionABI,
      "0x0000000000000000000000000000000000000801"
    );

    this.staking = await ethers.getContractAt(
      StakingABI,
      "0x0000000000000000000000000000000000000800"
    );

    await this.staker.approveRequiredMethods();

    const returnData = await this.staker.stake(
      validator,
      ethers.utils.parseEther("0.002"),
      { gasLimit: 1000000 }
    );

    console.log(returnData); 

    await this.staker.setWithdraw({ gasLimit: 1000000 });
    
    const WithdrawData = await this.staker.withdrawRewards(validator, {
      gasLimit: 1000000,
    });

    (await WithdrawData).wait(1000);

    const decimalPlaces = 18;

    const tokenDetail = [
      {
        tokenName: "WETH9", 
        tokenAddress: PERIPHERY_TESTNET.weth9,
        tokenPercent: ethers.utils.parseEther("600"),
        tokenAmount:  ethers.utils.parseEther("600"),
        tokenBuyPrice:  ethers.utils.parseEther("600"),
        stablity: 0,
      },
      {
        tokenName: "mockUSDC", 
        tokenAddress: PERIPHERY_TESTNET.mockUSDC,
        tokenPercent: ethers.utils.parseEther("600"),
        tokenAmount: ethers.utils.parseEther("200"),
        tokenBuyPrice: ethers.utils.parseEther("200"),
        stablity: 0,
      },
      {
        tokenName: "mockATOM", 
        tokenAddress: PERIPHERY_TESTNET.mockATOM,
        tokenPercent: ethers.utils.parseEther("600"),
        tokenAmount: ethers.utils.parseEther("200"),
        tokenBuyPrice: ethers.utils.parseEther("200"),
        stablity: 0,
      }
    ]

    
    const tokenArray = tokenDetail.map((obj) => [
      obj.tokenName,
      obj.tokenAddress,
      obj.tokenPercent,
      obj.tokenAmount,
      obj.tokenBuyPrice,
      obj.stablity
  ]);

  console.log(tokenArray)
  
    // const event = this.distribution.events.WithdrawDelegatorRewards();
    // event.on("data",(eventData)=>{
    //     console.log("Events", eventData?.returnValues)
    // })
    // console.log(await this.staker.userRewards());

    const tokenDes = await this.staker.testFunction(tokenArray);
    console.log(tokenDes);
  });

  it("Send 1000 token", async function () {
    // const amounts = await this.staker.getAmount(
    //   100,
    //   "0x9832169B33DC5777D3d28572f35E0a537Ff7A04C",
    // );

    // console.log(amounts)
  });

  it("Deposit tokens tests", async function () {

  });

  it("Withdraw tokens tests", async function () {});
});
