#!/usr/bin/env python3
"""Test YAML snapshot format implementation."""

import asyncio
import sys
from pathlib import Path

# Add path for imports
sys.path.append(str(Path(__file__).parent))

from selenium_mcp.context import Context
from selenium_mcp.tools import get_all_tools

async def test_yaml_snapshot():
    """Test YAML snapshot format."""
    print("🧪 Testing YAML snapshot format...")
    
    tools = get_all_tools()
    context = Context(tools)
    
    try:
        # Find snapshot tool
        snapshot_tool = next(t for t in tools if t.schema.name == "capture_page")
        
        # Navigate to a test page
        driver = await context.ensure_browser()
        driver.get("https://example.com")
        await asyncio.sleep(2)
        
        # Run the snapshot tool
        result = await context.run_tool(snapshot_tool, {})
        
        print("\n📸 Snapshot Result:")
        print(result.get("text", "No text returned"))
        
        # Test on a more complex page
        print("\n\n🌐 Testing on complex page...")
        driver.get("https://www.bbc.com")
        await asyncio.sleep(3)
        
        result = await context.run_tool(snapshot_tool, {})
        print("\n📸 Complex Page Snapshot (first 50 lines):")
        snapshot_text = result.get("text", "No text returned")
        lines = snapshot_text.split('\n')
        for line in lines[:50]:
            print(line)
        if len(lines) > 50:
            print(f"... and {len(lines) - 50} more lines")
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
    
    finally:
        await context.close()

if __name__ == "__main__":
    asyncio.run(test_yaml_snapshot())