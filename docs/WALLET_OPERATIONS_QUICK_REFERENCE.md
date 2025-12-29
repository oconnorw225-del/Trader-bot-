# Wallet Operations Quick Reference

## Quick Access Guide for Developers

This is a quick reference for common wallet operations in the NDAX Quantum Engine. For comprehensive details, see `.github/instructions/coding-standards.instructions.md`.

## Common Operations

### 1. Validate Wallet Address

```javascript
import { validateEthereumAddress } from '../shared/ethereumValidator.js';

const validation = validateEthereumAddress(address);
if (!validation.isValid) {
  throw new Error(validation.error);
}
```

### 2. Get Wallet Balance

```javascript
import { blockchain } from '../shared/blockchainManager.js';

const getBalance = async (address, retries = 3) => {
  for (let i = 1; i <= retries; i++) {
    try {
      return await blockchain.getBalance(address);
    } catch (error) {
      if (i === retries) throw error;
      await new Promise(r => setTimeout(r, Math.pow(2, i) * 1000));
    }
  }
};
```

### 3. Get NDAX Exchange Balance

```python
from platform.ndax_live import NDAXLiveClient

client = NDAXLiveClient()
balances = client.get_balance()  # Returns dict of currency: amount
```

### 4. Detect Blocked Funds

```javascript
const detectBlockedFunds = async (address) => {
  const pendingTxs = await getPendingTransactions(address);
  const stuckTxs = pendingTxs.filter(tx => 
    Date.now() - tx.timestamp > 3600000  // > 1 hour
  );
  return { hasBlockedFunds: stuckTxs.length > 0, stuckTxs };
};
```

### 5. Recover Stuck Transaction

```javascript
// Speed up transaction by increasing gas price
const speedUpTx = async (txHash) => {
  const tx = await getTransactionDetails(txHash);
  const newGasPrice = Math.floor(tx.gasPrice * 1.2);  // +20%
  return await blockchain.sendTransaction(tx.to, tx.value, tx.data);
};
```

### 6. Monitor NDAX Withdrawal

```python
def monitor_withdrawal(withdrawal_id, timeout_minutes=30):
    client = NDAXLiveClient()
    start = time.time()
    
    while time.time() - start < timeout_minutes * 60:
        status = client.get_withdrawal_status(withdrawal_id)
        if status['State'] in ['Completed', 'Failed']:
            return status
        time.sleep(30)
    
    return {'State': 'Timeout'}
```

### 7. Scan Multi-Chain Wallets

```python
from scan_wallets import get_btc_info, get_tron_info

# Bitcoin
btc_info = get_btc_info('bc1q...')
print(f"Balance: {btc_info['balance_sats']} satoshis")

# TRON
tron_info = get_tron_info('T...')
print(f"Balance: {tron_info['trx_balance']} TRX")
```

## Error Handling Template

```javascript
export const handleWalletOperation = async (operation) => {
  try {
    return await operation();
  } catch (error) {
    logger.error('Wallet operation failed:', error);
    
    return {
      success: false,
      error: error.message,
      userMessage: getUserFriendlyMessage(error),
      action: getRecommendedAction(error)
    };
  }
};
```

## Security Checklist

Before deploying wallet operations, verify:

- [ ] No hardcoded addresses or private keys
- [ ] Address validation implemented
- [ ] Retry logic with exponential backoff
- [ ] Proper error handling and logging
- [ ] HTTPS for all API calls
- [ ] Sensitive data encrypted (AES-256)
- [ ] Input validation for all user data
- [ ] Rate limiting implemented
- [ ] Tested on testnet first
- [ ] Timeout mechanisms for long operations

## Common Issues & Solutions

### Issue: Transaction Stuck (Pending)
**Solution:** Use `speedUpTransaction()` or `replaceTransaction()` with higher gas price

### Issue: Insufficient Gas
**Solution:** Check current gas prices and adjust before submitting

### Issue: NDAX Withdrawal Delayed
**Solution:** Use `monitor_withdrawal()` with timeout; contact support if timeout reached

### Issue: Invalid Address Error
**Solution:** Validate with `validateEthereumAddress()` before use

### Issue: Network Timeout
**Solution:** Implement retry logic with exponential backoff (2^attempt seconds)

## Testing Template

```javascript
describe('Wallet Operations', () => {
  it('should retrieve balance with retry', async () => {
    const balance = await getWalletBalance(testAddress, 3);
    expect(balance.success).toBe(true);
    expect(balance.balance).toBeGreaterThanOrEqual(0);
  });
  
  it('should handle invalid address', async () => {
    await expect(
      getWalletBalance('invalid')
    ).rejects.toThrow('Invalid wallet address');
  });
  
  it('should detect blocked funds', async () => {
    const result = await detectBlockedFunds(testAddress);
    expect(result).toHaveProperty('hasBlockedFunds');
    expect(result).toHaveProperty('stuckTxs');
  });
});
```

## Key Files Reference

| File | Purpose |
|------|---------|
| `src/shared/blockchainManager.js` | Ethereum wallet operations |
| `src/shared/ethereumValidator.js` | Address validation |
| `platform/ndax_live.py` | NDAX exchange integration |
| `platform/ndax_test.py` | Test mode simulation |
| `scan_wallets.py` | Multi-chain scanner |
| `.github/instructions/coding-standards.instructions.md` | Full documentation |

## Recovery Strategy Decision Tree

```
Transaction Stuck?
├─ Network Congested? (gas > 100 Gwei)
│  └─ Wait for gas prices to drop
├─ Pending < 10 minutes
│  └─ Wait and monitor
├─ Pending 10-60 minutes
│  └─ Speed up (increase gas 20%)
└─ Pending > 60 minutes
   ├─ Speed up (increase gas 50%) OR
   └─ Replace transaction
```

## Support

- **Full Documentation:** `.github/instructions/coding-standards.instructions.md`
- **Setup Guide:** `NDAX_TRADING_SETUP.md`
- **Summary:** `WALLET_RETRIEVAL_INSTRUCTIONS.md`
- **Validation:** Run `bash scripts/validate-wallet-instructions.sh`

## Best Practices Reminder

1. **Always validate** addresses before operations
2. **Implement retry** logic with exponential backoff
3. **Log everything** for audit trails
4. **Never hardcode** sensitive data
5. **Test on testnet** before production
6. **Monitor gas prices** before submitting transactions
7. **Use timeouts** for long-running operations
8. **Provide clear errors** with recovery recommendations
9. **Encrypt sensitive data** using AES-256
10. **Keep dependencies updated** for security patches

---

**Last Updated:** 2025-12-29
**Version:** 1.0.0
**Status:** Production Ready
