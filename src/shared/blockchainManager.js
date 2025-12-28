/**
 * Blockchain Integration Manager
 * Web3 integration for cryptocurrency and blockchain features
 */

export class BlockchainManager {
  constructor() {
    this.web3 = null;
    this.account = null;
    this.networkId = null;
    this.provider = null;
    this.contracts = new Map();
  }

  /**
   * Check if Web3 is available
   */
  isWeb3Available() {
    return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
  }

  /**
   * Connect to Web3 provider (MetaMask, etc.)
   */
  async connect() {
    if (!this.isWeb3Available()) {
      throw new Error('Web3 provider not found. Please install MetaMask.');
    }

    try {
      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      this.account = accounts[0];

      // Get network ID
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      this.networkId = parseInt(chainId, 16);

      // Initialize Web3 (if library is available)
      if (typeof window.Web3 !== 'undefined') {
        this.web3 = new window.Web3(window.ethereum);
      }

      this.provider = window.ethereum;

      // Listen for account changes
      window.ethereum.on('accountsChanged', (accounts) => {
        this.account = accounts[0] || null;
        this.emit('accountChanged', this.account);
      });

      // Listen for chain changes
      window.ethereum.on('chainChanged', (chainId) => {
        this.networkId = parseInt(chainId, 16);
        this.emit('chainChanged', this.networkId);
        window.location.reload(); // Reload recommended by MetaMask
      });

      return {
        account: this.account,
        networkId: this.networkId
      };
    } catch (error) {
      throw new Error(`Failed to connect to Web3: ${error.message}`);
    }
  }

  /**
   * Disconnect from Web3
   */
  disconnect() {
    this.account = null;
    this.web3 = null;
    this.provider = null;
  }

  /**
   * Get current account
   */
  getAccount() {
    return this.account;
  }

  /**
   * Get network ID
   */
  getNetworkId() {
    return this.networkId;
  }

  /**
   * Get network name
   */
  getNetworkName() {
    const networks = {
      1: 'Ethereum Mainnet',
      3: 'Ropsten Testnet',
      4: 'Rinkeby Testnet',
      5: 'Goerli Testnet',
      42: 'Kovan Testnet',
      56: 'Binance Smart Chain',
      137: 'Polygon Mainnet',
      80001: 'Polygon Mumbai Testnet'
    };
    return networks[this.networkId] || `Unknown Network (${this.networkId})`;
  }

  /**
   * Get account balance
   */
  async getBalance(account) {
    if (!this.provider) {
      throw new Error('Not connected to Web3');
    }

    const targetAccount = account || this.account;
    const balance = await this.provider.request({
      method: 'eth_getBalance',
      params: [targetAccount, 'latest']
    });

    // Convert from Wei to Ether
    return parseInt(balance, 16) / 1e18;
  }

  /**
   * Send transaction
   */
  async sendTransaction(to, value, data = '0x') {
    if (!this.account) {
      throw new Error('No account connected');
    }

    const params = [{
      from: this.account,
      to,
      value: '0x' + (value * 1e18).toString(16), // Convert Ether to Wei
      data
    }];

    const txHash = await this.provider.request({
      method: 'eth_sendTransaction',
      params
    });

    return txHash;
  }

  /**
   * Sign message
   */
  async signMessage(message) {
    if (!this.account) {
      throw new Error('No account connected');
    }

    const signature = await this.provider.request({
      method: 'personal_sign',
      params: [message, this.account]
    });

    return signature;
  }

  /**
   * Verify signature
   */
  async verifySignature(message, signature) {
    if (!this.web3) {
      throw new Error('Web3 not initialized');
    }

    const recoveredAddress = await this.web3.eth.personal.ecRecover(message, signature);
    return recoveredAddress.toLowerCase() === this.account.toLowerCase();
  }

  /**
   * Add custom token to wallet
   */
  async addToken(tokenAddress, tokenSymbol, tokenDecimals, tokenImage) {
    if (!this.provider) {
      throw new Error('Not connected to Web3');
    }

    try {
      await this.provider.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: tokenAddress,
            symbol: tokenSymbol,
            decimals: tokenDecimals,
            image: tokenImage
          }
        }
      });
      return true;
    } catch (error) {
      console.error('Failed to add token:', error);
      return false;
    }
  }

  /**
   * Switch network
   */
  async switchNetwork(chainId) {
    if (!this.provider) {
      throw new Error('Not connected to Web3');
    }

    try {
      await this.provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }]
      });
      return true;
    } catch (error) {
      if (error.code === 4902) {
        // Chain not added, need to add it first
        throw new Error('Network not added to wallet');
      }
      throw error;
    }
  }

  /**
   * Add custom network
   */
  async addNetwork(chainId, chainName, rpcUrl, currencyName, currencySymbol, currencyDecimals, blockExplorerUrl) {
    if (!this.provider) {
      throw new Error('Not connected to Web3');
    }

    try {
      await this.provider.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: `0x${chainId.toString(16)}`,
          chainName,
          rpcUrls: [rpcUrl],
          nativeCurrency: {
            name: currencyName,
            symbol: currencySymbol,
            decimals: currencyDecimals
          },
          blockExplorerUrls: [blockExplorerUrl]
        }]
      });
      return true;
    } catch (error) {
      console.error('Failed to add network:', error);
      return false;
    }
  }

  /**
   * Get transaction receipt
   */
  async getTransactionReceipt(txHash) {
    if (!this.provider) {
      throw new Error('Not connected to Web3');
    }

    const receipt = await this.provider.request({
      method: 'eth_getTransactionReceipt',
      params: [txHash]
    });

    return receipt;
  }

  /**
   * Wait for transaction confirmation
   */
  async waitForTransaction(txHash, confirmations = 1) {
    let receipt = null;
    let currentBlock = 0;
    const maxAttempts = 150; // 5 minutes max (150 * 2 seconds)
    let attempts = 0;

    while (attempts < maxAttempts) {
      receipt = await this.getTransactionReceipt(txHash);
      
      if (receipt && receipt.blockNumber) {
        const latestBlock = await this.provider.request({
          method: 'eth_blockNumber',
          params: []
        });
        currentBlock = parseInt(latestBlock, 16);
        const txBlock = parseInt(receipt.blockNumber, 16);

        if (currentBlock - txBlock >= confirmations) {
          break;
        }
      }

      // Wait 2 seconds before checking again
      await new Promise(resolve => setTimeout(resolve, 2000));
      attempts++;
    }

    if (attempts >= maxAttempts) {
      throw new Error('Transaction confirmation timeout');
    }

    return receipt;
  }

  /**
   * Deploy smart contract
   */
  async deployContract(abi, bytecode, constructorArgs = []) {
    if (!this.web3) {
      throw new Error('Web3 not initialized');
    }

    const contract = new this.web3.eth.Contract(abi);
    const deploy = contract.deploy({
      data: bytecode,
      arguments: constructorArgs
    });

    const gas = await deploy.estimateGas({ from: this.account });

    const deployedContract = await deploy.send({
      from: this.account,
      gas: Math.floor(gas * 1.2) // Add 20% buffer
    });

    return deployedContract;
  }

  /**
   * Load contract
   */
  loadContract(address, abi, name) {
    if (!this.web3) {
      throw new Error('Web3 not initialized');
    }

    const contract = new this.web3.eth.Contract(abi, address);
    this.contracts.set(name, contract);
    return contract;
  }

  /**
   * Get loaded contract
   */
  getContract(name) {
    return this.contracts.get(name);
  }

  /**
   * Call contract method (read-only)
   */
  async callContractMethod(contractName, methodName, ...args) {
    const contract = this.getContract(contractName);
    if (!contract) {
      throw new Error(`Contract ${contractName} not loaded`);
    }

    return await contract.methods[methodName](...args).call({ from: this.account });
  }

  /**
   * Send contract transaction (write)
   */
  async sendContractTransaction(contractName, methodName, value = 0, ...args) {
    const contract = this.getContract(contractName);
    if (!contract) {
      throw new Error(`Contract ${contractName} not loaded`);
    }

    const method = contract.methods[methodName](...args);
    const gas = await method.estimateGas({ from: this.account, value });

    return await method.send({
      from: this.account,
      gas: Math.floor(gas * 1.2),
      value
    });
  }

  /**
   * Event emitter
   */
  emit(event, data) {
    if (this.listeners && this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }

  listeners = {};

  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  off(event, callback) {
    if (this.listeners[event]) {
      const index = this.listeners[event].indexOf(callback);
      if (index !== -1) {
        this.listeners[event].splice(index, 1);
      }
    }
  }
}

// Create singleton instance
export const blockchain = new BlockchainManager();
