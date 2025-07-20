#!/usr/bin/env python3
"""Test if the Selenium MCP server can list tools."""

import asyncio
import sys
from pathlib import Path

# Add path for imports
sys.path.append(str(Path(__file__).parent))

async def test_tools():
    """Test if we can import and list tools."""
    try:
        print("🧪 Testing Selenium MCP Server...")
        
        # Test basic import
        from selenium_mcp.tools import get_all_tools
        print("✅ Import successful")
        
        # Test tool loading
        tools = get_all_tools()
        print(f"✅ Loaded {len(tools)} tools:")
        
        for i, tool in enumerate(tools[:5]):  # Show first 5
            print(f"  {i+1}. {tool.schema.name}: {tool.schema.description}")
        
        if len(tools) > 5:
            print(f"  ... and {len(tools) - 5} more tools")
        
        print("✅ Server should work correctly!")
        return True
        
    except ImportError as e:
        print(f"❌ Import error: {e}")
        print("💡 Try: pip install mcp pydantic selenium webdriver-manager")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    success = asyncio.run(test_tools())
    sys.exit(0 if success else 1)