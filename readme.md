# My Ethereum Tokens

There are currently a large number of ERC tokens in Ethereum. Keeping track of what you own is a bit hard.  
`MET` is a simple project that scans the last **N** blocks in order to find active `ERC` tokens, and then checks if a **wallet address** has any balance of these tokens.

## Installation

```bash
npm i my-ethereum-tokens
```

## Usage

### Last 100 blocks

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
   .on("newBlock", function (block) {
    console.log("Block: " , block.number)
   })
   .on("newToken", function (tokenInfo) {
    console.log("New Token: ", tokenInfo)
   })
   .on("done", function (tokens) {
    console.log(tokens)
   })
 }
 catch (e)
 {
  console.error("Error:" , e)
 }
})()
```

The output is something like this:

```java
Block:  5820544
New Token:  {
  name: 'Mlibre',
  symbol: 'MLB',
  balance: '172',
  contractAddress: '0x2107130860b83dF501C518A2A6D4652dC3af0388',
  txHash: '0xb9fb32ac45af0cd3081016c680382bbae5e58ffbf50b058a319cc2d028f590b3',
  blockNumber: 5820544
}
```

### Last N blocks

You can specify the number of blocks to search for contracts for.

```javascript
(async () => {
 try
 {
  let ethereumTokens = await new EthereumTokens({
   walletAddress: "0xc9b64496986E7b6D4A68fDF69eF132A35e91838e",
   providerAddress: secrets.goerli,
   blockCount: 10
  })
  ethereumTokens.find()
   .on("newBlock", function (block) {
    console.log("Block: " , block.number)
   })
   .on("newToken", function (tokenInfo) {
    console.log("New Token: ", tokenInfo)
   })
   .on("done", function (tokens) {
    console.log(tokens)
   })
 }
 catch (e)
 {
  console.error("Error:" , e)
 }
})()
```

### Specify Blocks range

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
  let tokens = await ethereumTokens.findSync()
  console.log(tokens)
 }
 catch (e)
 {
  console.error("Error:" , e)
 }
})()

```

## License

CC0

## Donate 💗

ETH:
> 0xc9b64496986E7b6D4A68fDF69eF132A35e91838e
