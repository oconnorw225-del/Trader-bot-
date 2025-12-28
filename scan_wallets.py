import requests

# -------------------------
# Helper functions
# -------------------------

def get_btc_info(address):
    """
    Fetch Bitcoin balance and transaction info from mempool.space
    """
    url = f"https://mempool.space/api/address/{address}"
    res = requests.get(url)
    if res.status_code != 200:
        return {"error": "BTC API error or not found"}
    data = res.json()

    return {
        "address": address,
        "chain_stats": data.get("chain_stats", {}),
        "mempool_stats": data.get("mempool_stats", {}),
        "balance_sats": data.get("chain_stats", {}).get("funded_txo_sum", 0)
                         - data.get("chain_stats", {}).get("spent_txo_sum", 0),
        "transactions": data.get("txs", [])  # limited recent txs
    }

def get_tron_info(address):
    """
    Fetch TRON TRX balance and token info from TRONSCAN API
    """
    headers = {"Accept":"application/json"}

    # TRX Balance
    res_balance = requests.get(
        f"https://apilist.tronscan.org/api/account?address={address}",
        headers=headers
    )
    if res_balance.status_code != 200:
        return {"error": "TRON API error or not found"}

    balance_data = res_balance.json()

    # Token balances (TRC20)
    res_tokens = requests.get(
        f"https://apilist.tronscan.org/api/account?address={address}&show=tokens",
        headers=headers
    )
    token_data = res_tokens.json() if res_tokens.status_code == 200 else {}

    return {
        "address": address,
        "trx_balance": balance_data.get("balance", 0) / 1_000_000,
        "tokens": token_data.get("tokens", []),
        "transactions": balance_data.get("transactions", [])
    }


# -------------------------
# MAIN
# -------------------------
if __name__ == "__main__":
    wallets = [
        # Bitcoin addresses
        "bc1q39s6vwj8h3mfe89eappsac60qjhmys3c6mclcp",
        "bc1q4878zfy5p5awsanesnjga3lne9jqhpq3702yt3",
        "bc1qcza6s6ew2kaxe9hdyrqqeuadc3za7fva5yjcnf",

        # TRON address
        "THPvaUhoh2Qn2y9THCZML3H815hhFhn5YC"
    ]

    results = {}

    for w in wallets:
        if w.startswith("bc1"):
            results[w] = get_btc_info(w)
        elif w.startswith("T"):
            results[w] = get_tron_info(w)
        else:
            results[w] = {"error": "Unknown address format"}

    # Output results
    import json
    print(json.dumps(results, indent=2))
