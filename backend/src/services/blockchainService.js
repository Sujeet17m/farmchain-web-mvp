const { ethers } = require('ethers');
require('dotenv').config();

// Smart Contract ABI
const CONTRACT_ABI = [
  "function recordBatch(string memory _batchId, string memory _produceType, uint256 _quantity) public",
  "function verifyBatch(string memory _batchId, uint8 _qualityScore) public",
  "function getBatch(string memory _batchId) public view returns (address, string, uint256, uint256, uint8, bool)",
  "event BatchRecorded(string indexed batchId, address indexed farmer, string produceType, uint256 timestamp)",
  "event BatchVerified(string indexed batchId, uint8 qualityScore, uint256 timestamp)"
];

class BlockchainService {
  constructor() {
    if (!process.env.INFURA_PROJECT_ID || !process.env.PRIVATE_KEY) {
      console.warn('⚠️  Blockchain configuration missing. Blockchain features disabled.');
      this.enabled = false;
      return;
    }

    try {
      // Connect to Sepolia testnet
      this.provider = new ethers.providers.JsonRpcProvider(
        `https://sepolia.infura.io/v3/${process.env.INFURA_PROJECT_ID}`
      );
      
      this.wallet = new ethers.Wallet(process.env.PRIVATE_KEY, this.provider);
      
      if (process.env.CONTRACT_ADDRESS) {
        this.contract = new ethers.Contract(
          process.env.CONTRACT_ADDRESS,
          CONTRACT_ABI,
          this.wallet
        );
      }

      this.enabled = true;
      console.log('✅ Blockchain service initialized');
    } catch (error) {
      console.error('❌ Blockchain initialization error:', error);
      this.enabled = false;
    }
  }

  async recordBatch(batchId, produceType, quantity) {
    if (!this.enabled || !this.contract) {
      return { success: false, error: 'Blockchain not configured' };
    }

    try {
      console.log(`📝 Recording batch ${batchId} to blockchain...`);
      
      const tx = await this.contract.recordBatch(
        batchId,
        produceType,
        ethers.BigNumber.from(Math.floor(quantity))
      );
      
      console.log(`⏳ Transaction sent: ${tx.hash}`);
      const receipt = await tx.wait();
      console.log(`✅ Transaction confirmed in block ${receipt.blockNumber}`);
      
      return {
        success: true,
        txHash: tx.hash,
        blockNumber: receipt.blockNumber
      };
    } catch (error) {
      console.error('Blockchain recording error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async verifyBatch(batchId, qualityScore) {
    if (!this.enabled || !this.contract) {
      return { success: false, error: 'Blockchain not configured' };
    }

    try {
      console.log(`✓ Verifying batch ${batchId} with score ${qualityScore}...`);
      
      const tx = await this.contract.verifyBatch(batchId, qualityScore);
      const receipt = await tx.wait();
      
      return {
        success: true,
        txHash: tx.hash,
        blockNumber: receipt.blockNumber
      };
    } catch (error) {
      console.error('Blockchain verification error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getBatch(batchId) {
    if (!this.enabled || !this.contract) {
      return null;
    }

    try {
      const batch = await this.contract.getBatch(batchId);
      return {
        farmer: batch[0],
        produceType: batch[1],
        quantity: batch[2].toString(),
        timestamp: new Date(batch[3].toNumber() * 1000).toISOString(),
        qualityScore: batch[4],
        verified: batch[5]
      };
    } catch (error) {
      console.error('Blockchain read error:', error);
      return null;
    }
  }

  async getTransactionDetails(txHash) {
    if (!this.enabled) {
      return null;
    }

    try {
      const tx = await this.provider.getTransaction(txHash);
      const receipt = await this.provider.getTransactionReceipt(txHash);
      
      return {
        from: tx.from,
        to: tx.to,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        status: receipt.status === 1 ? 'success' : 'failed',
        explorerUrl: `https://sepolia.etherscan.io/tx/${txHash}`
      };
    } catch (error) {
      console.error('Transaction details error:', error);
      return null;
    }
  }
}

module.exports = new BlockchainService();