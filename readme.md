# My Ethereum Tokens

There are currently a large number of ERC tokens in Ethereum. Keeping track of what you have is a bit hard.  
`MET` is a simple project that scans the last N blocks in order to find active `ERC` tokens. It then checks if the provided wallet address has any balance on these tokens.

```javascript
let EthereumTokens = require("./main")
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
