# My Ethereum Tokens

There are currently a large number of ERC tokens in Ethereum. Keeping track of what you own is a bit hard.  
`MET` is a simple project that scans the last **N** blocks in order to find active `ERC` tokens, and then checks if a **wallet address** has any balance of these tokens.
 
## Table Of Content

- [Installation](#installation)
- [Usage](#usage)
  - [Last 100 blocks](#last-100-blocks)
  - [Last N blocks](#last-n-blocks)
  - [Specify Blocks range](#specify-blocks-range)
  - [Live scan](#live-scan)
  - [Using In Web Browser](#using-in-web-browser)
- [License](#license)
- [Donate 💗](#donate-)

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
In this example first we run a local `Geth` node with the following command:

```bash
geth --goerli --ws --http --syncmode=light --http.api="eth,net,web3,personal,txpool" --allow-insecure-unlock  --http.corsdomain "*"
```

And pass the `geth's providerAddress` to the `EthereumTokens` constructor.

```javascript
let EthereumTokens = require("my-ethereum-tokens");
let secrets = require("./secrets.json");

(async () => {
 try
 {
  let ethereumTokens = await new EthereumTokens({
   walletAddress: "0xc9b64496986E7b6D4A68fDF69eF132A35e91838e",
   providerAddress: "http://127.0.0.1:8545",
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

### Live scan

You can configure the `MET` to scan the blockchain live for tokens.  
By default it will scan latest 2~4 blocks each time.

```javascript
let EthereumTokens = require("my-ethereum-tokens");
let secrets = require("./secrets.json");

( async () =>
{
 try
 {
  const ethereumTokens = await new EthereumTokens({
   walletAddress: "0xc9b64496986E7b6D4A68fDF69eF132A35e91838e",
   providerAddress: secrets.mainnetWS
   // providerAddress: "ws://127.0.0.1:8546",
  //  liveBlockScanNo: 3
  })
  ethereumTokens.live()
  .on( "newBlock", function ( block )
  {
   console.log( "Block: ", block.number )
  })
  .on( "newToken", function ( tokenInfo )
  {
   console.log( "New Token: ", tokenInfo )
  })
  .on( "error", function ( error )
  {
   console.log( "error: ", error )
  })
 }
 catch ( e )
 {
  console.error( "Error:", e )
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

### Using In Web Browser

If you are interested in using the `my-ethereum-tokens` in a web browser along with `metamask`, you can use the `web/bundle.js` file, created by `browserify`.

index.html:

```html
<!DOCTYPE html>
<html>

<head>
 <meta charset="utf-8">
 <title>Untitled Document</title>
 <script src="https://code.jquery.com/jquery-3.6.0.min.js"
  integrity="sha256-/xUj+3OJU5yExlq6GSYGSHk7tPXikynS7ogEvDej/m4=" crossorigin="anonymous"></script>
 <script src="https://unpkg.com/@metamask/detect-provider/dist/detect-provider.min.js"></script>
 <script src="https://cdnjs.cloudflare.com/ajax/libs/web3/1.6.0/web3.min.js"
  integrity="sha512-+BhnLgfzIDDjssoEWHPmdgWRvbwIEdj0Xfiys7uSqfQWpMEOJ4ymJ88O6B1cB0j+4zjb5GhO+sb/kEicggvUQQ=="
  crossorigin="anonymous" referrerpolicy="no-referrer"></script>
 <script src="./bundle.js"></script>
 <script src="./index.js"></script>
</head>

<body>
</body>

</html>
```

index.js:

```javascript
/* eslint-disable no-undef */

$(window).on("load", async function() {
 const provider = await detectEthereumProvider()
 if (typeof window.ethereum !== "undefined")
 {
  console.log("MetaMask is installed!")
  if (provider) {
   if (provider !== window.ethereum) {
    console.error("Do you have multiple wallets installed?")
   }
   else
   {
    console.log("MetaMask is connected")
    const accounts = await ethereum.request({ method: "eth_requestAccounts" })
    const account = accounts[0]
    const chainId = await ethereum.request({ method: "eth_chainId" })
    window.web3 = new Web3(window.ethereum)

    let EthereumTokens = require("EthereumTokens")
    let ethereumTokens = await new EthereumTokens({
     walletAddress: account,
     web3: window.web3,
     toBlock: 5820544,
     blockCount: 3
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
  }
  else {
   console.log("Please install MetaMask!")
  }
 }
 else 
 {
  console.log("MetaMask is not installed!")
 }
})

```

## License

CC0

## Donate 💗

ETH:
> 0xc9b64496986E7b6D4A68fDF69eF132A35e91838e
