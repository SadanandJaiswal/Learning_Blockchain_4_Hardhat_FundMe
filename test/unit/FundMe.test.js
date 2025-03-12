const { assert, expect } = require("chai");
const { network, deployments, ethers } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat.config");

describe("FundMe", async function () {
    try {
        let fundMe;
        let mockV3Aggregator;
        let deployer;
        let signer;
        let mockV3AggregatorContractAddress;
        // const sendValue = ethers.utils.parseEther("1"); // convert the 1 to 1eth = 1e18 wei
        const sendValue = ethers.parseEther("1"); // convert the 1 to 1eth = 1e18 wei

        beforeEach(async () => {
            // const accounts = await ethers.getSigners()
            // deployer = accounts[0]
            deployer = (await getNamedAccounts()).deployer;

            // deploy all the contracts in deploy folder script
            await deployments.fixture(["all"]);

            signer = await ethers.getSigner(deployer);

            let fundMeContractAddress = (await deployments.get("FundMe"))
                .address;
            fundMe = await ethers.getContractAt(
                "FundMe",
                fundMeContractAddress,
                signer
            );

            mockV3AggregatorContractAddress = (
                await deployments.get("MockV3Aggregator")
            ).address;
            // mockV3Aggregator = await ethers.getContractAt("MockV3Aggregator", mockV3AggregatorContractAddress, signer);
        });

        describe("constructor", function () {
            it("sets the aggregator addresses correctly", async () => {
                const response = await fundMe.getPriceFeed();
                assert.equal(response, mockV3AggregatorContractAddress);
            });
        });

        describe("fund", function () {
            it("Fails if you don't send enough ETH", async () => {
                await expect(fundMe.fund()).to.be.revertedWith(
                    "You need to spend more ETH!"
                );
            });

            it("Updates the amount funded data structure", async () => {
                await fundMe.fund({ value: sendValue });
                const response = await fundMe.getAddressToAmountFunded(
                    deployer
                );
                assert.equal(response.toString(), sendValue.toString());
            });
            it("Adds funder to array of funders", async () => {
                await fundMe.fund({ value: sendValue });
                const response = await fundMe.getFunder(0);
                assert.equal(response, deployer);
            });
        });

        describe("withdraw", async () => {
            // to test the withdraw we need our contract to have some value, we add beforeeach that ensure contract have some eth to withdraw
            beforeEach(async () => {
                await fundMe.fund({ value: sendValue });
            });

            it("withdraws ETH from a single funder", async () => {
              try{

              
                // Arrange
                const provider = await ethers.getDefaultProvider();
                const startingFundMeBalance = await provider.getBalance(
                    fundMe.getAddress()
                );
                const startingDeployerBalance = await provider.getBalance(
                    deployer
                );

                console.log("initial");
                console.log(startingFundMeBalance, " ", startingDeployerBalance);

                // Act
                const transactionResponse = await fundMe.withdraw();
                const transactionReceipt = await transactionResponse.wait();

                const endingFundMeBalance = await provider.getBalance(
                    fundMe.getAddress()
                );
                const endingDeployerBalance = await provider.getBalance(
                    deployer
                );

                console.log("After Txn");
                console.log(endingFundMeBalance, " ", endingDeployerBalance);
              }
              catch(error){
                console.log("Error in withdraw test: \n", error);
              }
            });
        });
    } catch (error) {
        console.log("Error is there \n", error);
    }
});
