#!/usr/bin/env python3
"""Test the Selenium MCP server directly via MCP protocol without mocks."""

import asyncio
import json
import sys
from pathlib import Path
from typing import Any, Dict

# Add path for imports
sys.path.append(str(Path(__file__).parent))

from mcp.client.session import ClientSession
from mcp.client.stdio import StdioServerParameters, stdio_client

async def test_mcp_server():
    """Test the MCP server directly using the MCP protocol."""
    print("🧪 Testing Selenium MCP Server via MCP protocol...")
    
    try:
        # Start the server process
        server_script = Path(__file__).parent / "mcp_server.py"
        
        server_params = StdioServerParameters(
            command="python3",
            args=[str(server_script)]
        )
        
        async with stdio_client(server_params) as (read, write):
            async with ClientSession(read, write) as session:
                # Initialize the session
                await session.initialize()
                print("✅ MCP session initialized")
                
                # List available tools
                tools_result = await session.list_tools()
                tools = tools_result.tools
                print(f"✅ Found {len(tools)} tools via MCP:")
                
                for i, tool in enumerate(tools[:5]):
                    print(f"  {i+1}. {tool.name}: {tool.description}")
                
                if len(tools) > 5:
                    print(f"  ... and {len(tools) - 5} more tools")
                
                # Test a simple tool call (navigate to a page)
                if tools:
                    print("\n🔧 Testing tool execution...")
                    
                    # Find a safe tool to test
                    navigate_tool = next((t for t in tools if t.name == "navigate_to"), None)
                    if navigate_tool:
                        print("Testing navigate_to tool with example.com...")
                        result = await session.call_tool(
                            "navigate_to", 
                            {"url": "https://example.com"}
                        )
                        print(f"✅ Tool execution result: {result.content[0].text[:100]}...")
                    
                    # Test browser status
                    status_tool = next((t for t in tools if "status" in t.name.lower()), None)
                    if status_tool:
                        print(f"Testing {status_tool.name}...")
                        result = await session.call_tool(status_tool.name, {})
                        print(f"✅ Status result: {result.content[0].text[:100]}...")
                
                print("\n✅ MCP server is working correctly!")
                return True
                
    except Exception as e:
        print(f"❌ MCP test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

async def test_tool_schemas():
    """Test that all tool schemas are valid."""
    print("\n📋 Validating tool schemas...")
    
    try:
        from selenium_mcp.tools import get_all_tools
        tools = get_all_tools()
        
        for tool in tools:
            # Validate schema can be converted to dict
            schema_dict = tool.schema.input_schema_dict
            
            # Ensure required fields exist
            assert "type" in schema_dict
            assert "properties" in schema_dict
            
            print(f"✅ {tool.schema.name} schema is valid")
        
        print(f"✅ All {len(tools)} tool schemas are valid")
        return True
        
    except Exception as e:
        print(f"❌ Schema validation failed: {e}")
        return False

if __name__ == "__main__":
    async def main():
        print("🚀 Starting comprehensive MCP server test...\n")
        
        # Test schemas first
        schema_ok = await test_tool_schemas()
        if not schema_ok:
            sys.exit(1)
        
        # Test MCP protocol
        mcp_ok = await test_mcp_server()
        
        if mcp_ok:
            print("\n🎉 All tests passed! MCP server is ready for use.")
            sys.exit(0)
        else:
            print("\n❌ Tests failed!")
            sys.exit(1)
    
    asyncio.run(main())