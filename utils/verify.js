const {run} = require("hardhat");

async function verify(contractAddress, args) {
    console.log("Verifying the Contract...");
  
    // run commands in the code using run
    try {
      await run("verify:verify", {
        address: contractAddress,
        constructorArguments: args,
      });
    } catch (e) {
      if (e.message.toLowerCase().includes("already verified")) {
        console.log("Already Verified!");
      } else {
        console.log(e);
      }
    }
  }

module.exports = {verify};