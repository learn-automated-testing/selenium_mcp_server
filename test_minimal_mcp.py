#!/usr/bin/env python3
"""Minimal MCP server test to debug tool registration."""

import asyncio
import logging
from mcp.server import Server
from mcp.server.stdio import stdio_server
from mcp.server.models import InitializationOptions
from mcp.types import Tool

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize server
app = Server("test-selenium-mcp")

@app.list_tools()
async def handle_list_tools():
    """Return a simple hardcoded tool list."""
    logger.info("📋 list_tools called!")
    
    tools = [
        Tool(
            name="test_tool",
            description="A simple test tool",
            inputSchema={
                "type": "object",
                "properties": {
                    "message": {"type": "string"}
                }
            }
        )
    ]
    
    logger.info(f"📋 Returning {len(tools)} tools")
    return tools

async def main():
    """Main server entry point."""
    logger.info("🚀 Starting minimal test MCP server")
    
    async with stdio_server() as (read_stream, write_stream):
        await app.run(
            read_stream, 
            write_stream, 
            InitializationOptions(
                server_name="test-selenium-mcp",
                server_version="0.1.0",
                capabilities={}
            )
        )

if __name__ == "__main__":
    asyncio.run(main())