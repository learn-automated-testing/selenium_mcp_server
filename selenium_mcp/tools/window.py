"""Window management tools."""

import logging
from pydantic import BaseModel, Field

from ..tool_base import BaseTool, ToolSchema, ToolResult
from ..context import Context

logger = logging.getLogger(__name__)

class ResizeParams(BaseModel):
    """Parameters for window resizing."""
    width: int = Field(description="Window width in pixels")
    height: int = Field(description="Window height in pixels")

class ResizeTool(BaseTool):
    """Resize the browser window."""
    
    def _create_schema(self) -> ToolSchema:
        return ToolSchema(
            name="window_resize",
            description="Resize the browser window to specified dimensions",
            input_schema=ResizeParams,
            tool_type="destructive"
        )
    
    async def handle(self, context: Context, params: ResizeParams) -> ToolResult:
        """Resize browser window."""
        driver = context.current_tab_or_die()
        
        async def resize_action():
            try:
                driver.set_window_size(params.width, params.height)
                logger.info(f"🪟 Resized window to {params.width}x{params.height}")
                return f"Window resized to {params.width}x{params.height}"
            except Exception as e:
                logger.error(f"Window resize failed: {e}")
                raise
        
        # Robot Framework code
        code = [
            f"# Resize window to {params.width}x{params.height}",
            f"Set Window Size    {params.width}    {params.height}"
        ]
        
        return ToolResult(
            code=code,
            action=resize_action,
            capture_snapshot=True,
            wait_for_network=False
        )