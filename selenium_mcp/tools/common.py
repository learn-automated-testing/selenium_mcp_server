"""Common browser tools."""

import logging
from pydantic import BaseModel

from ..tool_base import BaseTool, ToolSchema, ToolResult
from ..context import Context

logger = logging.getLogger(__name__)

class CloseParams(BaseModel):
    """Parameters for closing browser."""
    # No parameters needed

class CloseTool(BaseTool):
    """Close browser session."""
    
    def _create_schema(self) -> ToolSchema:
        return ToolSchema(
            name="close_session",
            description="Close the browser session",
            input_schema=CloseParams,
            tool_type="readOnly"
        )
    
    async def handle(self, context: Context, params: CloseParams) -> ToolResult:
        """Close browser."""
        
        async def close_action():
            await context.close()
            logger.info("🚪 Browser closed")
        
        code = [
            "# Close browser",
            "Close Browser"
        ]
        
        return ToolResult(
            code=code,
            action=close_action,
            capture_snapshot=False,
            wait_for_network=False
        )