const { ethers, getNamedAccounts, deployments } = require("hardhat");

async function main() {
    const { deployer } = await getNamedAccounts();
    const signer = await ethers.getSigner(deployer);
    const fundMeContractAddress = (await deployments.get("FundMe")).address;
    const fundMe = await ethers.getContractAt(
        "FundMe",
        fundMeContractAddress,
        signer
    );
    console.log("Widthdrawing...");

    const transactionResponse = await fundMe.withdraw();
    await transactionResponse.wait();
    console.log("Got it back!");

    const contractBalance = await fundMe.runner.provider.getBalance(fundMe.getAddress());
    console.log("Contract Current Balance : ", contractBalance);
}

main()
    .then(() => {
        process.exit(0);
    })
    .catch((error) => {
        console.log("Error: ", error);
        process.exit(1);
    });
