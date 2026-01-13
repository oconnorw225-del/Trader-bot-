# Phase-2 Preparation Guide for GitHub Copilot
============================================================================

## Phase-2 Scope: Tokens, NFTs, and Non-Native Assets

Phase-2 handles all assets **NOT** covered in Phase-1:

### What Phase-2 Processes:
- ✅ ERC20, TRC20, BEP20 tokens
- ✅ ERC721, ERC1155 NFTs
- ✅ Wrapped assets (WBTC, WETH, etc.)
- ✅ Staked tokens (after unstaking)
- ✅ Liquidity pool positions (after withdrawal)
- ✅ Locked/vested tokens (after unlock period)
- ✅ Multi-sig wallet assets (with proper signatures)

### What Phase-2 MUST NOT Touch:
- ❌ Native BTC (already transferred in Phase-1)
- ❌ Native ETH (already transferred in Phase-1)
- ❌ Gas reserves left by Phase-1 (needed for token swaps/transfers)

## Safety Requirements

### 1. Read Phase-1 Report First
```python
# ALWAYS read Phase-1 report to know what was already processed
import json

with open('results/phase1_report.json', 'r') as f:
    phase1_report = json.load(f)

# Get list of wallets already processed
processed_wallets = {
    transfer['from_address'] 
    for transfer in phase1_report['transfers']
}

# Get list of assets to skip (native BTC/ETH)
skip_assets = ['BTC', 'ETH']  # Never touch these in Phase-2
```

### 2. Preserve Gas Funds
```python
# WHY: Phase-2 needs gas to swap tokens and transfer NFTs
# Gas reserves were left by Phase-1 for this purpose

def check_gas_availability(wallet_address: str, chain: str) -> bool:
    """
    Check if wallet has sufficient gas for Phase-2 operations.
    
    Phase-1 left gas reserves specifically for this:
    - ETH: 0.005 ETH per wallet (for ERC20/ERC721 transfers)
    - BTC: N/A (Bitcoin doesn't need gas for token operations)
    """
    if chain == 'ETH':
        balance = get_eth_balance(wallet_address)
        min_gas = 0.005  # Must match Phase-1 gas_reserves.ETH
        
        if balance < min_gas:
            print(f"⚠️  Insufficient gas in {wallet_address}")
            print(f"   Available: {balance} ETH, Required: {min_gas} ETH")
            return False
    
    return True

# NEVER transfer the gas reserve itself
# It's there to pay for token/NFT operations
```

### 3. Liquidity Check Before Conversions
```python
# CRITICAL: Always check available liquidity before swapping tokens
# This prevents consuming Phase-1 gas funds on failed swaps

def safe_token_swap(
    token_address: str,
    amount: float,
    from_wallet: str,
    to_token: str = 'USDC'  # Stable target
) -> dict:
    """
    Swap tokens to stable coins or ETH for easier withdrawal.
    
    SAFETY CHECKS:
    1. Verify liquidity pool has sufficient depth
    2. Calculate slippage (max 5% acceptable)
    3. Ensure gas reserve remains untouched
    4. Check if swap value exceeds gas cost
    """
    # Check liquidity FIRST
    pool_liquidity = get_pool_liquidity(token_address, to_token)
    
    if amount > pool_liquidity * 0.1:  # Don't use >10% of pool
        return {
            'success': False,
            'reason': 'Insufficient liquidity (would cause high slippage)',
            'action': 'skip_or_split'
        }
    
    # Estimate gas cost
    gas_estimate = estimate_swap_gas(token_address)
    gas_reserve = 0.005  # ETH - must not be touched
    
    current_eth = get_eth_balance(from_wallet)
    
    if current_eth - gas_estimate < gas_reserve:
        return {
            'success': False,
            'reason': 'Would consume Phase-1 gas reserve',
            'action': 'skip'
        }
    
    # Check if swap is economically viable
    token_value_usd = get_token_value_usd(token_address, amount)
    gas_cost_usd = estimate_gas_cost_usd(gas_estimate)
    
    if token_value_usd < gas_cost_usd * 2:  # Need 2x gas to be worth it
        return {
            'success': False,
            'reason': f'Token value (${token_value_usd}) < 2x gas cost (${gas_cost_usd})',
            'action': 'skip_dust'
        }
    
    # Execute swap
    return execute_swap_with_slippage_protection(
        token_address=token_address,
        amount=amount,
        from_wallet=from_wallet,
        to_token=to_token,
        max_slippage=0.05  # 5% max
    )
```

## Phase-2 Implementation Strategy

### Contract Structure: `ops/phase2_liquidate.yaml`

```yaml
# Phase-2: Token and NFT Liquidation
phase: 2

# Non-blocking mode (continue on errors, just like Phase-1)
mode: non_blocking

# Read Phase-1 report to avoid conflicts
phase1_report: results/phase1_report.json

# What to process
scope: non_native_assets

included_assets:
  - erc20_tokens
  - trc20_tokens  
  - bep20_tokens
  - nfts
  - wrapped_assets
  - lp_tokens

# What to NEVER touch (handled by Phase-1)
excluded_assets:
  - BTC  # Already transferred in Phase-1
  - ETH  # Already transferred in Phase-1
  - gas_reserves  # Left by Phase-1 for Phase-2 operations

# Liquidation strategy
liquidation:
  # Try to convert tokens to stable coins first
  prefer_stable: true
  stable_targets:
    - USDC
    - USDT
    - DAI
  
  # If no liquidity for stable swap, swap to ETH
  fallback_to_eth: true
  
  # Minimum values to process (avoid dust)
  minimum_value_usd: 10
  
  # NFT handling
  nft_strategy:
    - list_on_opensea  # Try marketplace first
    - transfer_to_vault  # If no sale, move to vault
  
  # Slippage protection
  max_slippage: 0.05  # 5%
  
  # Gas optimization
  gas_price_strategy: slow  # Use slow gas for non-urgent swaps
  max_gas_per_operation_usd: 50  # Don't spend >$50 gas per swap

# Recovery addresses (same as Phase-1 for consistency)
recovery_wallets:
  USDC: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb'
  USDT: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb'
  ETH: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb'

# Report configuration
report:
  required: true
  format: json
  output_path: results/phase2_report.json
```

### Inline Comments for Phase-2 Code

```python
def phase2_liquidation():
    """
    Phase-2: Liquidate tokens, NFTs, and non-native assets.
    
    CRITICAL SAFETY RULES:
    1. NEVER touch BTC or ETH (Phase-1 already handled)
    2. NEVER consume gas reserves left by Phase-1
    3. ALWAYS check liquidity before swaps
    4. ALWAYS verify swap value > gas cost
    """
    
    # Load Phase-1 report to avoid conflicts
    # WHY: We need to know which wallets/assets were already processed
    phase1_report = load_phase1_report()
    processed_wallets = get_processed_wallets(phase1_report)
    
    # Enumerate wallets (same as Phase-1)
    wallets = enumerate_wallets()
    
    for wallet in wallets:
        # Skip if this wallet was fully processed in Phase-1
        if wallet['address'] in processed_wallets:
            print(f"⏭️  Skipping {wallet['address']} (Phase-1 complete)")
            continue
        
        # Get token balances
        # WHY: Phase-2 only handles tokens/NFTs, not native assets
        tokens = get_erc20_tokens(wallet['address'])
        
        for token in tokens:
            # SAFETY CHECK 1: Skip if this is actually native ETH
            # (should never happen, but defense in depth)
            if token['symbol'] in ['BTC', 'ETH']:
                print(f"❌ ERROR: Native asset in Phase-2!")
                print(f"   This should have been handled in Phase-1")
                record_error('phase_confusion', token)
                continue
            
            # SAFETY CHECK 2: Verify sufficient gas available
            # WHY: Phase-1 left gas specifically for Phase-2 operations
            if not check_gas_availability(wallet['address'], 'ETH'):
                record_skipped_asset(
                    token=token,
                    reason='Insufficient gas (Phase-1 reserve consumed?)'
                )
                continue
            
            # SAFETY CHECK 3: Check liquidity before swap
            # WHY: Prevents wasting gas on failed swaps
            liquidity_ok, reason = check_liquidity(token['address'], token['amount'])
            if not liquidity_ok:
                record_skipped_asset(
                    token=token,
                    reason=f'Insufficient liquidity: {reason}'
                )
                continue
            
            # SAFETY CHECK 4: Economic viability
            # WHY: Don't spend $50 gas to swap $10 of tokens
            viable, reason = is_economically_viable(token)
            if not viable:
                record_skipped_asset(
                    token=token,
                    reason=f'Not economically viable: {reason}'
                )
                continue
            
            # Execute liquidation (swap to USDC/USDT)
            # This will use the gas reserve left by Phase-1
            result = liquidate_token(
                token=token,
                from_wallet=wallet['address'],
                to_stable='USDC',
                max_slippage=0.05
            )
            
            record_liquidation(result)
```

## Handling Blocked/Stuck Assets from Phase-1

```python
def recover_phase1_blocked_assets():
    """
    Review Phase-1 skipped assets and attempt recovery.
    
    WHY: Some assets may have been skipped due to:
    - Temporary network issues
    - Insufficient gas at the time
    - Wallet temporarily locked
    
    Phase-2 can retry these with more sophisticated strategies.
    """
    phase1_report = load_phase1_report()
    skipped_assets = phase1_report['skipped_assets']
    
    for asset in skipped_assets:
        reason = asset['reason']
        
        # Different recovery strategies based on skip reason
        if 'gas' in reason.lower():
            # Asset was skipped due to gas issues
            # Check if gas situation improved
            if check_gas_availability(asset['wallet'], asset['chain']):
                retry_transfer(asset)
        
        elif 'locked' in reason.lower():
            # Asset was locked (time-lock, vesting, staking)
            # Check if unlock period has passed
            if check_unlock_status(asset):
                retry_transfer(asset)
        
        elif 'liquidity' in reason.lower():
            # Token had liquidity issues
            # Check if liquidity improved
            if check_liquidity_improved(asset):
                retry_swap(asset)
        
        else:
            # Unknown reason - log for manual review
            record_manual_review_needed(asset)
```

## Phase-2 Workflow File

Create `.github/workflows/phase2-liquidate.yml` with:

```yaml
name: Phase-2 Asset Liquidation

on:
  workflow_dispatch:
    inputs:
      retry_phase1_skipped:
        description: 'Retry assets skipped in Phase-1'
        required: false
        default: 'true'
        type: boolean

jobs:
  liquidate-phase2:
    runs-on: ubuntu-latest
    
    env:
      PHASE_CONTRACT: ops/phase2_liquidate.yaml
      EXECUTION_MODE: phase2
      NON_BLOCKING: true
      PHASE1_REPORT: results/phase1_report.json
    
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4
      
      - name: Download Phase-1 Report
        uses: actions/download-artifact@v4
        with:
          name: phase1-evacuation-report
          path: results/
      
      # ... rest of workflow similar to Phase-1 ...
```

## Testing Phase-2 Safely

```bash
# Test Phase-2 with dry-run mode
DRY_RUN=true EXECUTION_MODE=phase2 python run_bot.py

# Review what would be liquidated
cat results/phase2_report.json | jq '.summary'

# If safe, run for real
EXECUTION_MODE=phase2 python run_bot.py
```

## Key Takeaways for Copilot

When implementing Phase-2:

1. ✅ **Read Phase-1 report first** - Know what was already done
2. ✅ **Never touch BTC/ETH** - Phase-1 handled these
3. ✅ **Preserve gas reserves** - Phase-2 needs them for operations
4. ✅ **Check liquidity first** - Prevent failed swaps
5. ✅ **Economic viability** - Don't spend more gas than token value
6. ✅ **Non-blocking mode** - Continue on errors, log everything
7. ✅ **Comprehensive reporting** - Audit trail for all operations
8. ✅ **Retry Phase-1 failures** - Some may be recoverable now

## Safety Checklist

Before running Phase-2:

- [ ] Phase-1 completed successfully
- [ ] Phase-1 report reviewed and validated
- [ ] Gas reserves confirmed in wallets (0.005 ETH each)
- [ ] Token prices checked (avoid swapping during crashes)
- [ ] Liquidity pools verified (sufficient depth)
- [ ] Slippage limits configured (max 5%)
- [ ] Economic thresholds set (min $10 value)
- [ ] NFT strategy defined (marketplace vs vault)
- [ ] Dry-run completed and reviewed
- [ ] Recovery wallets validated (same as Phase-1)

## Next Steps

After Phase-2 completion:

1. Review `results/phase2_report.json`
2. Verify all liquidations on blockchain explorers
3. Check recovery wallet for received tokens/ETH
4. Handle any manually-flagged assets
5. Archive both Phase-1 and Phase-2 reports for compliance
6. Update documentation with lessons learned

============================================================================
