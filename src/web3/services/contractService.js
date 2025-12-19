import { ethers } from 'ethers'
import { getSigner } from './web3Service.js'

/**
 * Smart Contract Service - Handles generic smart contract interactions
 */

/**
 * Get contract instance
 * @param {string} contractAddress - Contract address
 * @param {Array} abi - Contract ABI
 * @returns {Promise<ethers.Contract>} Contract instance
 */
export const getContract = async (contractAddress, abi) => {
  const signer = await getSigner()
  return new ethers.Contract(contractAddress, abi, signer)
}

/**
 * Read contract function (view/pure)
 * @param {string} contractAddress - Contract address
 * @param {Array} abi - Contract ABI
 * @param {string} functionName - Function name to call
 * @param {Array} args - Function arguments
 * @returns {Promise<any>} Function result
 */
export const readContract = async (contractAddress, abi, functionName, args = []) => {
  try {
    const contract = await getContract(contractAddress, abi)
    return await contract[functionName](...args)
  } catch (error) {
    console.error(`Error reading contract function ${functionName}:`, error)
    throw error
  }
}

/**
 * Write contract function (state-changing)
 * @param {string} contractAddress - Contract address
 * @param {Array} abi - Contract ABI
 * @param {string} functionName - Function name to call
 * @param {Array} args - Function arguments
 * @param {object} options - Transaction options (value, gasLimit, etc.)
 * @returns {Promise<object>} Transaction response
 */
export const writeContract = async (contractAddress, abi, functionName, args = [], options = {}) => {
  try {
    const contract = await getContract(contractAddress, abi)
    
    // Prepare transaction options
    const txOptions = {}
    if (options.value) {
      txOptions.value = ethers.parseEther(options.value.toString())
    }
    if (options.gasLimit) {
      txOptions.gasLimit = BigInt(options.gasLimit)
    }
    
    // This will trigger the wallet popup
    const tx = await contract[functionName](...args, txOptions)
    
    return {
      hash: tx.hash,
      wait: (confirmations = 1) => tx.wait(confirmations),
    }
  } catch (error) {
    console.error(`Error writing contract function ${functionName}:`, error)
    
    // Parse common errors
    if (error.code === 4001 || error.message?.includes('user rejected')) {
      throw new Error('Transaction cancelled. You rejected the transaction in your wallet.')
    }
    if (error.message?.includes('insufficient funds') || error.message?.includes('insufficient balance')) {
      throw new Error('Insufficient balance. You don\'t have enough tokens or native currency.')
    }
    if (error.message?.includes('execution reverted') || error.message?.includes('revert')) {
      // Try to extract revert reason
      const revertMatch = error.message.match(/revert\s+(.+)/i)
      if (revertMatch) {
        throw new Error(`Transaction failed: ${revertMatch[1]}`)
      }
      throw new Error('Transaction failed. The contract function call reverted.')
    }
    
    throw error
  }
}

/**
 * Estimate gas for a contract function call
 * @param {string} contractAddress - Contract address
 * @param {Array} abi - Contract ABI
 * @param {string} functionName - Function name
 * @param {Array} args - Function arguments
 * @param {object} options - Transaction options
 * @returns {Promise<bigint>} Estimated gas
 */
export const estimateGas = async (contractAddress, abi, functionName, args = [], options = {}) => {
  try {
    const contract = await getContract(contractAddress, abi)
    
    const txOptions = {}
    if (options.value) {
      txOptions.value = ethers.parseEther(options.value.toString())
    }
    
    return await contract[functionName].estimateGas(...args, txOptions)
  } catch (error) {
    console.error(`Error estimating gas for ${functionName}:`, error)
    throw error
  }
}

/**
 * Get contract events
 * @param {string} contractAddress - Contract address
 * @param {Array} abi - Contract ABI
 * @param {string} eventName - Event name
 * @param {object} filter - Event filter (fromBlock, toBlock, args)
 * @returns {Promise<Array>} Event logs
 */
export const getContractEvents = async (contractAddress, abi, eventName, filter = {}) => {
  try {
    const contract = await getContract(contractAddress, abi)
    const eventFilter = contract.filters[eventName](...Object.values(filter.args || {}))
    
    const fromBlock = filter.fromBlock || 0
    const toBlock = filter.toBlock || 'latest'
    
    return await contract.queryFilter(eventFilter, fromBlock, toBlock)
  } catch (error) {
    console.error(`Error getting contract events for ${eventName}:`, error)
    throw error
  }
}

/**
 * Listen to contract events
 * @param {string} contractAddress - Contract address
 * @param {Array} abi - Contract ABI
 * @param {string} eventName - Event name
 * @param {function} callback - Callback function
 * @returns {function} Unsubscribe function
 */
export const listenToContractEvents = async (contractAddress, abi, eventName, callback) => {
  try {
    const contract = await getContract(contractAddress, abi)
    contract.on(eventName, callback)
    
    // Return unsubscribe function
    return () => {
      contract.off(eventName, callback)
    }
  } catch (error) {
    console.error(`Error listening to contract events for ${eventName}:`, error)
    throw error
  }
}

