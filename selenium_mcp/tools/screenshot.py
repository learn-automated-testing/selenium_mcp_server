"""Screenshot tools."""

import logging
from pydantic import BaseModel, Field

from ..tool_base import BaseTool, ToolSchema, ToolResult
from ..context import Context

logger = logging.getLogger(__name__)

class ScreenshotParams(BaseModel):
    """Parameters for taking screenshot."""
    filename: str = Field(default="screenshot.png", description="Filename for the screenshot")

class ScreenshotTool(BaseTool):
    """Take screenshot."""
    
    def _create_schema(self) -> ToolSchema:
        return ToolSchema(
            name="take_screenshot",
            description="Take a screenshot of the current page",
            input_schema=ScreenshotParams,
            tool_type="readOnly"
        )
    
    async def handle(self, context: Context, params: ScreenshotParams) -> ToolResult:
        """Take screenshot."""
        
        async def screenshot_action():
            driver = await context.ensure_browser()
            driver.save_screenshot(params.filename)
            logger.info(f"📸 Screenshot saved: {params.filename}")
        
        code = [
            f"# Take screenshot",
            f"Capture Page Screenshot    {params.filename}"
        ]
        
        return ToolResult(
            code=code,
            action=screenshot_action,
            capture_snapshot=False,
            wait_for_network=False
        )