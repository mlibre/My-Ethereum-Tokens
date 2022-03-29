const Web3 = require( "web3" )
const EventEmitter = require( "events" )

const minABI = [
	{
		"constant": true,
		"inputs": [ { "name": "_owner", "type": "address" } ],
		"name": "balanceOf",
		"outputs": [ { "name": "balance", "type": "uint256" } ],
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "decimals",
		"outputs": [ { "name": "", "type": "uint8" } ],
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "name",
		"outputs": [ { "name": "", "type": "string" } ],
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "symbol",
		"outputs": [ { "name": "", "type": "string" } ],
		"type": "function"
	}
]

class ethereumTokens
{
	constructor ({ walletAddress, providerAddress, web3, toBlock,	blockCount })
	{
		return ( async () =>
		{
			this.walletAddress = walletAddress // Wallet Address
			this.providerAddress = providerAddress || "http://127.0.0.1:8545"
			this.web3 = web3
			if ( !web3 )
			{
				this.web3 = new Web3( providerAddress )
			}
			this.toBlock = toBlock || await this.web3.eth.getBlockNumber()
			this.blockCount = blockCount || 100
			this.eventEmitter = new EventEmitter()
			this.minABI = minABI
			this.tokens = {}
			return this
		})()
	}

	async findSync ()
	{
		await this.blocks()
		return this.tokens
	}
	find ()
	{
		this.blocks()
		return this
	}
	async blocks ()
	{
		const self = this
		for ( let i = self.toBlock; i >= self.toBlock - self.blockCount; i-- )
		{
			const block = await self.web3.eth.getBlock( i )
			self.eventEmitter.emit( "newBlock", block )
			for ( let i = 0; i < block.transactions.length; i++ )
			{
				const txInfo = await self.web3.eth.getTransaction( block.transactions[i] )
				try
				{
					if ( txInfo.to )
					{
						await this.tokenInfo( txInfo )
					}
				}
				catch ( error )
				{
					// console.log( error );
				}
			}
		}
		self.eventEmitter.emit( "done", self.tokens )
	}
	async tokenInfo ( txInfo )
	{
		const self = this
		const contract = new self.web3.eth.Contract( minABI, txInfo.to )
		const balance = await contract.methods.balanceOf( self.walletAddress ).call()
		if ( balance != 0 )
		{
			const decimals = await contract.methods.decimals().call()
			const realBalance = self.toFixed( balance / Math.pow( 10, decimals ) )
			const tokenName = await contract.methods.name().call()
			const tokenSymbol = await contract.methods.symbol().call()
			const tokenInfo = {
				"name": tokenName,
				"symbol": tokenSymbol,
				"balance": realBalance,
				"contractAddress": txInfo.to,
				"txHash": txInfo.hash,
				"blockNumber": txInfo.blockNumber
			}
			self.tokens[txInfo.to] = tokenInfo
			self.eventEmitter.emit( "newToken", tokenInfo )
		}
	}
	on ( string, callback )
	{
		this.eventEmitter.on( string, function ( info )
		{
			callback( info )
		})
		return this
	}
	toFixed ( number )
	{
		return parseFloat( number ).toFixed( 20 ).replace( /\.?0+$/, "" )
	}
}
module.exports = ethereumTokens
