"""Keyboard input tools."""

import logging
from pydantic import BaseModel, Field

from ..tool_base import BaseTool, ToolSchema, ToolResult
from ..context import Context

logger = logging.getLogger(__name__)

class TypeParams(BaseModel):
    """Parameters for typing text."""
    element: str = Field(description="Human-readable element description")
    ref: str = Field(description="Element reference from page snapshot")
    text: str = Field(description="Text to type")

class TypeTool(BaseTool):
    """Type text into input element."""
    
    def _create_schema(self) -> ToolSchema:
        return ToolSchema(
            name="input_text",
            description="Type text into an input element using its reference from page snapshot",
            input_schema=TypeParams,
            tool_type="destructive"
        )
    
    async def handle(self, context: Context, params: TypeParams) -> ToolResult:
        """Type text into element."""
        driver = context.current_tab_or_die()
        snapshot = context.snapshot_or_die()
        
        by, locator_value = snapshot.ref_locator(params.ref)
        
        async def type_action():
            element = driver.find_element(by, locator_value)
            element.clear()
            element.send_keys(params.text)
            logger.info(f"⌨️ Typed '{params.text}' into {params.element}")
        
        code = [
            f"# Type text into {params.element}",
            f"Input Text    {locator_value}    {params.text}"
        ]
        
        return ToolResult(
            code=code,
            action=type_action,
            capture_snapshot=True,
            wait_for_network=False
        )