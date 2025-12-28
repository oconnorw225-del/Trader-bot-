"""
Platform module for exchange integrations

Available Clients:
- NDAXTestClient: Mock client for paper trading (safe, no API required)
- NDAXLiveClient: Live client for real trading (requires NDAX API credentials)

Usage:
    # For paper trading (default, safe)
    from platform.ndax_test import NDAXTestClient
    client = NDAXTestClient()
    
    # For live trading (requires credentials in .env)
    from platform.ndax_live import NDAXLiveClient
    client = NDAXLiveClient()
"""

