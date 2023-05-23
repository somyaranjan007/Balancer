const { ethers } = require("hardhat");
const { expect } = require('chai');
const { bech32 } = require("bech32");

describe('ERC20 Tokens Exercise 2', function () {
    let deployer;

    before(async function () {
        [deployer] = await ethers.getSigners();

        const balancerFactory = await ethers.getContractFactory(
            "contracts/Balancer.sol:Balancer",
            deployer
        );

        this.balancer = await balancerFactory.deploy();
        await this.balancer.deployed();

        console.log(this.balancer.address)


    });

    it('Send array to function', async function () {
        // await this.balancer.processCoin([{ name: "ETH", amount: 100 }]);
        // expect(await this.balancer.totalAmount()).to.be.equal(100);
    })


});