# Getting Started with the hardhat Fund Me

### Setup
- npm install --save-dev hardhat
- npx hardhat init
- npm i @chainlink/contracts

#### Solhint
- npm i solhint : solidity is linting plugin 
- run command: ``` npx solhint contracts/*.sol ```

### Follow Steps
- Compile the contract: ``` npx hardhat compile ```
- deploy: 

#### Hardhat Deploy
- It is the plugin for replicable development and easy testing
- This plugin make the devolepment easy
- npm install -D hardhat-deploy
- import to hardhat.config.js

### Deploying contract using hardhat
- create deploy folder
- ``` npx hardhat deploy --network sepolia ```
- All scripts inside the deploy/ folder will execute automatically, in ascending order based on filenames.
- module.exports.tags = ["all", "MyContract"]  
    - it is used to label deployment scripts with tags so that you can selectively execute specific scripts instead of running all of them.
    - deploy only the specific contract using tags:
    - ``` npx hardhat deploy --tags MyContract ```

#### Mocking
- we create the contract in contracts/test folder for contract which we will mock

### Creating Test
- unit Testing: Unit Testing are done locally
- Staging Testing: Testing are done on a testnet
- create test to check weather everything working fine or not