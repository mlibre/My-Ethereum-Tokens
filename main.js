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
	constructor ({ walletAddress, providerAddress, web3, toBlock,	blockCount, liveBlockPerSecond })
	{
		return ( async () =>
		{
			this.walletAddress = walletAddress // Wallet Address
			this.providerAddress = providerAddress || "http://127.0.0.1:8545"
			this.web3 = web3
			if ( !web3 )
			{
				this.web3 = new Web3( this.providerAddress )
			}
			this.toBlock = toBlock || await this.web3.eth.getBlockNumber()
			this.blockCount = blockCount || 100
			this.liveBlockPerSecond = liveBlockPerSecond || 3;
			this.eventEmitter = new EventEmitter()
			this.minABI = minABI
			this.tokens = {}
			return this
		})()
	}

	live ()
	{
		const self = this;
		if ( !self.live.processingBlocks )
		{
			self.live.processingBlocks = 0;
		}
		self.web3.eth.subscribe( "newBlockHeaders", async ( error, _block ) =>
		{
			if ( error )
			{
				self.eventEmitter.emit( "error", error )
				return;
			}
			if ( self.live.processingBlocks >= self.liveBlockPerSecond )
			{
				return
			}
			self.live.processingBlocks++;
			try
			{
				const block = await self.web3.eth.getBlock( _block.number )
				self.eventEmitter.emit( "newBlock", block )
				const trxQueue = [];
				for ( let i = 0; i < block.transactions.length; i++ )
				{
					trxQueue.push( self.transactionProcess( block.transactions[i] ) )
				}
				await Promise.allSettled( trxQueue );
			}
			catch ( error )
			{
				console.log( error );
			}
			finally
			{
				self.live.processingBlocks--;
			}
		});
		return this;
	}
	async findSync ()
	{
		await this.blocksSync()
		return this.tokens
	}
	async blocksSync ()
	{
		const self = this
		for ( let i = self.toBlock; i >= self.toBlock - self.blockCount; i-- )
		{
			const block = await self.web3.eth.getBlock( i )
			self.eventEmitter.emit( "newBlock", block )
			for ( let i = 0; i < block.transactions.length; i++ )
			{
				await this.transactionProcess( block.transactions[i] )
			}
		}
		self.eventEmitter.emit( "done", self.tokens )
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
			const trxQueue = [];
			for ( let i = 0; i < block.transactions.length; i++ )
			{
				trxQueue.push( self.transactionProcess( block.transactions[i] ) )
			}
			const result = await Promise.allSettled( trxQueue );
			for ( let i = 0; i < result.length; i++ )
			{
				if ( result[i].status == "fulfilled" )
				{
					continue
				}
				else
				{
					// console.log( result[i].reason );
				}
			}
		}
		self.eventEmitter.emit( "done", self.tokens )
	}
	async transactionProcess ( trxId )
	{
		const self = this
		const txInfo = await self.web3.eth.getTransaction( trxId )
		try
		{
			if ( txInfo.to )
			{
				await this.tokenProcess( txInfo )
			}
		}
		catch ( error )
		{
			// console.log( error );
		}
	}
	async tokenProcess ( txInfo )
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
			if ( !self.tokens[txInfo.to] )
			{
				self.tokens[txInfo.to] = tokenInfo
				self.eventEmitter.emit( "newToken", tokenInfo )
			}
			return tokenInfo
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
