const { assert, expect } = require("chai");
const { network, deployments, ethers } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat.config");

developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", async function () {
          let fundMe;
          let deployer;
          let signer;

          const sendValue = ethers.parseEther("0.03");

          beforeEach(async () => {
              deployer = (await getNamedAccounts()).deployer;

              // this will work :  "@nomiclabs/hardhat-ethers": "npm:hardhat-deploy-ethers@^0.3.0-beta.10" in package.json
                // fundMe = await ethers.getContract("FundMe", deployer);

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
            //   console.log(await fundMe.address) // undefine
              console.log(await fundMe.getAddress())    // 0xcA45AbFbf68867b9eb516a53fC23D176a981E45A
            //   console.log(await fundMe.target)  // 0xcA45AbFbf68867b9eb516a53fC23D176a981E45A
            //   console.log(fundMe)
          });

          it("allow people to fund and withdraw", async () => {
              const fundTxnResponse = await fundMe.fund({ value: sendValue });
              const fundReceipt = await fundTxnResponse.wait(1)
              console.log('fund Receipt ', fundReceipt);
              const withdrawTxResponse = await fundMe.withdraw();
              const WithdrawReceipt = await withdrawTxResponse.wait(1)
              console.log('withdraw receipt', WithdrawReceipt);

              const endingFundMeBalance =
                  await fundMe.runner.provider.getBalance(fundMe.getAddress());
            //   console.log(
            //       endingFundMeBalance.toString() +
            //           " should equal 0, running assert equal..."
            //   );
              assert.equal(endingFundMeBalance.toString(), "0");
            //   assert.equal("0", "0");
          });
      });
