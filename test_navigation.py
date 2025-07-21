#!/usr/bin/env python3
"""Test navigation with timeout handling."""

import asyncio
import sys
from pathlib import Path

# Add path for imports
sys.path.append(str(Path(__file__).parent))

from selenium_mcp.context import Context
from selenium_mcp.tools import get_all_tools

async def test_navigation():
    """Test navigation with various sites."""
    print("🧪 Testing improved navigation...")
    
    tools = get_all_tools()
    context = Context(tools)
    
    test_sites = [
        "https://example.com",
        "https://www.google.com",
        "https://www.bbc.com"
    ]
    
    try:
        # Find navigate tool
        navigate_tool = next(t for t in tools if t.schema.name == "navigate_to")
        
        for site in test_sites:
            print(f"\n🌐 Testing navigation to {site}...")
            try:
                result = await context.run_tool(navigate_tool, {"url": site})
                print(f"✅ Result: {result.get('text', 'Unknown')}")
                
                # Get current URL to verify
                driver = context.browser_manager.driver
                if driver:
                    print(f"  Current URL: {driver.current_url}")
                    print(f"  Page title: {driver.title[:50]}...")
                
                await asyncio.sleep(1)
                
            except Exception as e:
                print(f"❌ Failed to navigate to {site}: {e}")
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
    
    finally:
        await context.close()

if __name__ == "__main__":
    asyncio.run(test_navigation())