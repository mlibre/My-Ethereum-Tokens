# My Ethereum Tokens

There are currently a large number of ERC tokens in Ethereum. Keeping track of what you own is a bit hard.  
`MET` is a simple project that scans the last **N** blocks in order to find active `ERC` tokens, and then checks if a **wallet address** has any balance of these tokens.

By default, it will scan the last **100** blocks.

```javascript
let EthereumTokens = require("my-ethereum-tokens");
let secrets = require("./secrets.json");

(async () => {
 try
 {
  let ethereumTokens = await new EthereumTokens({
   walletAddress: "0xc9b64496986E7b6D4A68fDF69eF132A35e91838e",
   providerAddress: secrets.goerli,
  })
  ethereumTokens.find()
  ethereumTokens.onBlock(async (block) => {
   console.log("Block: " , block.number)
  })
  ethereumTokens.onToken(async (tokenInfo) => {
   console.log("New Token: ", tokenInfo)
  })
 }
 catch (e)
 {
  console.error("Error:" , e)
 }
})()
```

You can also specify the block range to scan. In this example it will scan from the block **5820544** to **5820541**.

```javascript
let EthereumTokens = require("my-ethereum-tokens");
let secrets = require("./secrets.json");

(async () => {
 try
 {
  let ethereumTokens = await new EthereumTokens({
   walletAddress: "0xc9b64496986E7b6D4A68fDF69eF132A35e91838e",
   providerAddress: secrets.goerli,
   toBlock: 5820544,
   blockCount: 3
  })
  ethereumTokens.find()
  ethereumTokens.onBlock(async (block) => {
   console.log("Block: " , block.number)
  })
  ethereumTokens.onToken(async (tokenInfo) => {
   console.log("New Token: ", tokenInfo)
  })
 }
 catch (e)
 {
  console.error("Error:" , e)
 }
})()
```
