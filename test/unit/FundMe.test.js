const { assert, expect } = require("chai");
const { network, deployments, ethers } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat.config");

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", async function () {
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

                  // deploy all the contracts in deploy folder
                  await deployments.fixture(["all"]);

                  signer = await ethers.getSigner(deployer);

                  // console.log("signer is: ", signer);
                  // console.log("deployer is: ", deployer);

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
                      // const valFunded = await fundMe.getAddressToAmountFunded(
                      //     deployer
                      // );
                      // const depArrayAdd = await fundMe.getAddress(0);
                      // console.log("value funded: ", valFunded);
                      // console.log("Funder is: ", depArrayAdd);
                  });

                  it("withdraws ETH from a single funder", async () => {
                      try {
                          // Arrange
                          // const provider = await ethers.getDefaultProvider();
                          const startingFundMeBalance =
                              await fundMe.runner.provider.getBalance(
                                  fundMe.getAddress()
                              );
                          const startingDeployerBalance =
                              await fundMe.runner.provider.getBalance(deployer);

                          // console.log("initial");
                          // console.log(
                          //     startingFundMeBalance,
                          //     " ",
                          //     startingDeployerBalance
                          // );

                          //                     console.log("Type of startingFundMeBalance:", typeof startingFundMeBalance);
                          // console.log("Instance check:", startingFundMeBalance instanceof ethers.BigNumber);

                          // Act
                          const transactionResponse = await fundMe.withdraw();
                          const transactionReceipt =
                              await transactionResponse.wait();

                          const endingFundMeBalance =
                              await fundMe.runner.provider.getBalance(
                                  fundMe.getAddress()
                              );
                          const endingDeployerBalance =
                              await fundMe.runner.provider.getBalance(deployer);

                          // console.log(transactionReceipt)

                          const { gasUsed, gasPrice } = transactionReceipt;
                          const gasCost = gasUsed * gasPrice; // ✅ Both are bigint, works fine!

                          // etherjs version ^6 return bigint thats why directly using (+/*-)
                          // if returning bignumber : .add() , .mul() will be requrired to add or mul

                          // console.log("Type of gasUsed:", typeof gasUsed);
                          // console.log("Type of effectiveGasPrice:", typeof effectiveGasPrice);
                          // console.log("Gas Cost:", gasCost);

                          // console.log("After Withdraw");
                          // console.log(
                          //     endingFundMeBalance,
                          //     " ",
                          //     endingDeployerBalance
                          // );

                          // Assert
                          // Maybe clean up to understand the testing
                          assert.equal(endingFundMeBalance, 0);
                          assert.equal(
                              (
                                  startingFundMeBalance +
                                  startingDeployerBalance
                              ).toString(),
                              (endingDeployerBalance + gasCost).toString()
                          );
                      } catch (error) {
                          console.log("Error in withdraw test: \n", error);
                      }
                  });

                  it("It allow us to withdraw with multiple funder", async () => {
                      // Arrange
                      const accounts = await ethers.getSigners();
                      for (i = 1; i < 6; i++) {
                          const fundMeConnectedContract = await fundMe.connect(
                              accounts[i]
                          );
                          // console.log(
                          //     "Contract Balance : ",
                          //     await fundMe.runner.provider.getBalance(
                          //         fundMe.getAddress()
                          //     )
                          // );
                          await fundMe.fund({ value: sendValue });
                      }

                      const startingFundMeBalance =
                          await fundMe.runner.provider.getBalance(
                              fundMe.getAddress()
                          );
                      const startingDeployerBalance =
                          await fundMe.runner.provider.getBalance(deployer);

                      // Act
                      const transactionResponse = await fundMe.withdraw();
                      const transactionReceipt =
                          await transactionResponse.wait();
                      const { gasUsed, gasPrice } = transactionReceipt;
                      const gasCost = gasUsed * gasPrice;

                      const endingFundMeBalance =
                          await fundMe.runner.provider.getBalance(
                              fundMe.getAddress()
                          );
                      const endingDeployerBalance =
                          await fundMe.runner.provider.getBalance(deployer);

                      // Assert
                      assert.equal(endingFundMeBalance, 0);
                      assert.equal(
                          (
                              startingFundMeBalance + startingDeployerBalance
                          ).toString(),
                          (endingDeployerBalance + gasCost).toString()
                      );

                      // Make Sure Funders are reset properly
                      await expect(fundMe.getFunder(0)).to.be.reverted;

                      for (i = 1; i < 6; i++) {
                          assert.equal(
                              await fundMe.getAddressToAmountFunded(
                                  accounts[i].address
                              ),
                              0
                          );
                      }
                  });

                  it("It allow us to cheaperWithdraw with multiple funder", async () => {
                      // Arrange
                      const accounts = await ethers.getSigners();
                      for (i = 1; i < 6; i++) {
                          const fundMeConnectedContract = await fundMe.connect(
                              accounts[i]
                          );
                          // console.log(
                          //     "Contract Balance : ",
                          //     await fundMe.runner.provider.getBalance(
                          //         fundMe.getAddress()
                          //     )
                          // );
                          await fundMe.fund({ value: sendValue });
                      }

                      const startingFundMeBalance =
                          await fundMe.runner.provider.getBalance(
                              fundMe.getAddress()
                          );
                      const startingDeployerBalance =
                          await fundMe.runner.provider.getBalance(deployer);

                      // Act
                      const transactionResponse =
                          await fundMe.cheaperWithdraw();
                      const transactionReceipt =
                          await transactionResponse.wait();
                      const { gasUsed, gasPrice } = transactionReceipt;
                      const gasCost = gasUsed * gasPrice;

                      const endingFundMeBalance =
                          await fundMe.runner.provider.getBalance(
                              fundMe.getAddress()
                          );
                      const endingDeployerBalance =
                          await fundMe.runner.provider.getBalance(deployer);

                      // Assert
                      assert.equal(endingFundMeBalance, 0);
                      assert.equal(
                          (
                              startingFundMeBalance + startingDeployerBalance
                          ).toString(),
                          (endingDeployerBalance + gasCost).toString()
                      );

                      // Make Sure Funders are reset properly
                      await expect(fundMe.getFunder(0)).to.be.reverted;

                      for (i = 1; i < 6; i++) {
                          assert.equal(
                              await fundMe.getAddressToAmountFunded(
                                  accounts[i].address
                              ),
                              0
                          );
                      }
                  });

                  it("Only allows the owner to withdraw", async function () {
                      const accounts = await ethers.getSigners();
                      const fundMeConnectedContract = await fundMe.connect(
                          accounts[1]
                      );

                      // it only work with standar error in solidity
                      // await expect(
                      //     fundMeConnectedContract.withdraw()
                      // ).to.be.revertedWith("FundMe__NotOwner")

                      // to work with custom error in solidity
                      await expect(
                          fundMeConnectedContract.withdraw()
                      ).to.be.revertedWithCustomError(
                          fundMe,
                          "FundMe__NotOwner"
                      );
                  });
              });
          } catch (error) {
              console.log("Error is there \n", error);
          }
      });
