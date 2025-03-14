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

### Debugging
- add breakpoint to line, you want to stop the debugger
- start the debugger
- run the commands in debugger terminal
- go to the line (breakpoint) and in debug terminal, debug the code

### Debuggin in solidity of hardhat project
- import hardhat/console.sol in solidity file
- use console.log() in solidity just like javascript

### Gas Optimization using storage 
- Opcode tells which instruction is excecuted
- We can use opcode to optimize the gas used, different instructions take different amount of gas
- github: https://github.com/crytic/evm-opcodes -> tells how much opcode instructions take
- in for loop for variable using storage make them memory to reduce gas used
- use revert instead of require

What is an Opcode in Solidity?
An opcode (operation code) is a low-level machine instruction that the Ethereum Virtual Machine (EVM) executes. When you write a Solidity smart contract, it gets compiled into bytecode, which consists of a series of opcodes. The EVM reads and executes these opcodes to perform various operations like arithmetic, storage access, and function calls.

### Staging test
- Testing done after the deployment
- last step in the development journey, ensure that everything is working properly
- we will do unit testing on local blockchain and staging testing on testnet
- steps to run staging test
    - ``` npx hardhat deploy --network sepolia ```
    - ``` npx hardhat test --network sepolia ```

### Running Script on a Local Node
- Creating Scripts like : fund, withdraw, contractBalance
- ``` npx hardhat run scripts/fund.js --network localhost ```

### Adding Script to package.json
- unit test: ``` npm run test ``` this will run tests for local blockchain, command: ``` npx hardhat test ```
- staging test: ``` npm run test --network sepolia ``` this will run tests for sepolia testnet, command: ``` npx hardhat test:staging ```
- lint: ``` npm run lint ``` this will lint the solidity code: ``` npx solhint contracts/*.sol ```
- lint-fix: ``` npm run lint:fix ``` this will auto fix 
- coverage: ``` npm run coverage ``` this will lint the solidity code: ``` npx hardhat coverage ```