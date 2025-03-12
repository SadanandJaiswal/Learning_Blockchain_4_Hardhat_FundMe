// Traditionally we do
// immport
// main function
// calling the main function

const { network } = require("hardhat");
const {
  networkConfig,
  developmentChains,
} = require("../helper-hardhat.config");
const { verify } = require("../utils/verify");

// Now
// function deployFunc(){
//     console.log("Hello Hi")
// }

// module.exports.default = deployFunc;

// hre: hardhat runtime environment
module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  const chainId = network.config.chainId;

  //   console.log("chain id: ", chainId);

  // if chainid is X use address Y
  // if chainid is Z use address A

  let ethUsdPriceFeedAddress;
  if (chainId == 31337) {
    // If on Hardhat local network
    const ethUsdAggregator = await deployments.get("MockV3Aggregator");
    ethUsdPriceFeedAddress = ethUsdAggregator.address; // Use the mock address
  } else {
    // If on a real network
    ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]; // Use real oracle address
  }

  // deploy
  const args = [ethUsdPriceFeedAddress];
  log("----------------------------------------------------");
  log("Deploying FundMe and waiting for confirmations...");
  const fundMe = await deploy("FundMe", {
    // contract: contractName, // name of the contract that need to be deployed
    from: deployer,
    args,
    log: true,
    // force: true, // this allow the contract to redeploy
    waitConfirmations: network.config.blockConfirmations || 1,
  });

  log(`FundMe deployed at ${fundMe.address}`);
  // verify the deployment
  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    await verify(fundMe.address, [ethUsdPriceFeedAddress]);
  }
};

module.exports.tags = ["all", "fundme"];
