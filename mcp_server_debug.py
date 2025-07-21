#!/usr/bin/env python3
"""Selenium MCP Server with file-based logging for debugging."""

import asyncio
import logging
import sys
from pathlib import Path
from typing import Any, Dict, List, Optional

# Add the selenium_mcp directory to the path
sys.path.append(str(Path(__file__).parent))

from mcp.server import Server
from mcp.server.stdio import stdio_server
from mcp.server.models import InitializationOptions
from mcp.types import TextContent, Tool

# Import our tools and context
from selenium_mcp.context import Context
from selenium_mcp.tools import get_all_tools

# Configure logging to file only (not stdout/stderr)
log_file = Path(__file__).parent / "mcp_debug.log"
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(log_file),
    ]
)
logger = logging.getLogger(__name__)

# Initialize server
app = Server("selenium-mcp")

# Get all tools
try:
    tools = get_all_tools()
    logger.info(f"🚀 Successfully loaded {len(tools)} tools")
except Exception as e:
    logger.error(f"❌ Failed to load tools: {e}")
    tools = []

context: Optional[Context] = None

@app.list_tools()
async def handle_list_tools() -> List[Tool]:
    """List available browser automation tools."""
    try:
        logger.info(f"📋 list_tools called - returning {len(tools)} tools")
        
        mcp_tools = []
        for tool in tools:
            try:
                mcp_tool = Tool(
                    name=tool.schema.name,
                    description=tool.schema.description,
                    inputSchema=tool.schema.input_schema_dict
                )
                mcp_tools.append(mcp_tool)
            except Exception as e:
                logger.error(f"❌ Failed to add tool {tool.schema.name}: {e}")
        
        logger.info(f"📋 Successfully created {len(mcp_tools)} MCP tools")
        return mcp_tools
        
    except Exception as e:
        logger.error(f"❌ Fatal error in list_tools: {e}")
        import traceback
        logger.error(traceback.format_exc())
        return []

@app.call_tool()
async def handle_call_tool(name: str, arguments: Optional[Dict[str, Any]] = None) -> List[TextContent]:
    """Execute a browser automation tool."""
    global context
    
    logger.info(f"🛠️ Executing tool: {name}")
    
    try:
        # Find the tool
        tool = next((t for t in tools if t.schema.name == name), None)
        if not tool:
            return [TextContent(type="text", text=f"Error: Unknown tool '{name}'")]
        
        # Ensure context exists (lazy initialization)
        if not context:
            context = Context(tools)
            logger.info("📦 Created browser context")
        
        # Execute the tool
        result = await context.run_tool(tool, arguments or {})
        
        # Return result as text content
        result_text = result.get("text", str(result))
        return [TextContent(type="text", text=result_text)]
        
    except Exception as e:
        logger.error(f"❌ Tool execution failed: {e}")
        return [TextContent(type="text", text=f"Error executing {name}: {str(e)}")]

async def main():
    """Main server entry point."""
    logger.info("🚀 Starting Selenium MCP Server (debug mode)")
    logger.info(f"📋 Available tools: {len(tools)}")
    logger.info(f"📝 Logging to: {log_file}")
    
    async with stdio_server() as (read_stream, write_stream):
        await app.run(
            read_stream, 
            write_stream, 
            InitializationOptions(
                server_name="selenium-mcp",
                server_version="0.1.0",
                capabilities={
                    "tools": {}
                }
            )
        )

if __name__ == "__main__":
    asyncio.run(main())