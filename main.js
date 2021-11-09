let Web3 = require("web3")
const EventEmitter = require("events")

let minABI = [
	{
		"constant":true,
		"inputs":[{"name":"_owner","type":"address"}],
		"name":"balanceOf",
		"outputs":[{"name":"balance","type":"uint256"}],
		"type":"function"
	},
	{
		"constant":true,
		"inputs":[],
		"name":"decimals",
		"outputs":[{"name":"","type":"uint8"}],
		"type":"function"
	},
	{
		"constant":true,
		"inputs":[],
		"name":"name",
		"outputs":[{"name":"","type":"string"}],
		"type":"function"
	},
	{
		"constant":true,
		"inputs":[],
		"name":"symbol",
		"outputs":[{"name":"","type":"string"}],
		"type":"function"
	}
]

class ethereumTokens 
{
	constructor ({walletAddress, providerAddress, web3, toBlock,
		blockCount}) 
	{
		return (async () => 
		{
			this.walletAddress = walletAddress // Wallet Address
			this.providerAddress = providerAddress || "http://127.0.0.1:8545"
			this.web3 = web3
			if (!web3)
			{
				this.web3 = new Web3(providerAddress)
			}
			this.toBlock = toBlock || await this.web3.eth.getBlockNumber()
			this.blockCount = blockCount || 100
			this.eventEmitter = new EventEmitter()
			this.minABI = minABI
			return this
		})()
	}
	
	async find () {
		let self = this
		for (let i = self.toBlock; i > self.toBlock - self.blockCount; i--) {
			let block = await self.web3.eth.getBlock(i)
			self.eventEmitter.emit("newBlock" , block)
			for (let i = 0; i < block.transactions.length; i++) {
				let txInfo = await self.web3.eth.getTransaction(block.transactions[i])
				try
				{
					if(txInfo.to)
					{
						await this.tokenInfo(txInfo)
					}
				}
				catch{}
			}
		}
	}	
	async tokenInfo(txInfo)
	{
		let self = this
		let contract = new self.web3.eth.Contract(minABI,txInfo.to)
		let balance = await contract.methods.balanceOf(self.walletAddress).call()
		if(balance != 0)
		{
			let decimals = await contract.methods.decimals().call()
			let realBalance = (balance / Math.pow(10,decimals)).toFixed(20).replace(/\.?0+$/,"")
			let tokenName = await contract.methods.name().call()
			let tokenSymbol = await contract.methods.symbol().call()
			let tokenInfo = {
				"name": tokenName,
				"symbol": tokenSymbol,
				"balance": realBalance,
				"address": txInfo.to,
				"txHash": txInfo.hash,
				"blockNumber": txInfo.blockNumber
			}
			self.eventEmitter.emit("newToken" , tokenInfo )
		}
	}
	onBlock(callback)
	{
		this.eventEmitter.on("newBlock", function (blockInfo) {
			callback(blockInfo)
		})			
	}

	onToken(callback)
	{
		this.eventEmitter.on("newToken", function (tokenInfo) {
			callback(tokenInfo)
		})			
	}
	toFixed (number) 
	{
		return parseFloat(number).toFixed(20).replace(/\.?0+$/,"")
	}
}
module.exports = ethereumTokens
